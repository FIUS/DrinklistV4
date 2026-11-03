import json
import tempfile
import threading
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker

import authenticator
import util
from database import Migrations
from database.Models import Drink, KeyValue, Member, Transaction
from database.Queries import Queries
from web import sql_database


class UndoDrinkTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with patch("database.Queries.Queries"), patch("TaskScheduler.TaskScheduler"):
            import main
        cls.main = main

    def setUp(self):
        self.engine = create_engine("sqlite://")
        self.addCleanup(self.engine.dispose)

        @event.listens_for(self.engine, "connect")
        def enable_foreign_keys(connection, _):
            connection.execute("PRAGMA foreign_keys=ON")

        sql_database.metadata.create_all(self.engine)
        # Exercise the real query methods against an isolated database.
        self.db = Queries.__new__(Queries)
        self.db.db = SimpleNamespace(engine=self.engine, session=sessionmaker(bind=self.engine))
        self.db.write_lock = threading.Lock()
        with self.db.get_session() as session:
            session.add(Member(id=3, name="alice", balance=2000, password=b"", salt=""))
            session.add(Drink(id=1, name="Water", price=150, stock=10))
            session.add(KeyValue(key="version", value=str(util.CURRENT_VERSION)))

    def buy(self):
        self.db.buy_drink(3, 1)
        return self.db.get_user_history(3)[0]["id"]

    def assert_state(self, stock, balance):
        self.assertEqual(self.db.get_drinks()[0]["stock"], stock)
        self.assertEqual(self.db.get_user_by_id(3)["balance"], balance)

    def test_user_purchase_and_undo_restore_stock_and_balance_through_api(self):
        token_manager = authenticator.TokenManager(self.db)
        token = token_manager.create_token(3)
        client = self.main.app.test_client()
        client.set_cookie(f"{util.auth_cookie_memberID}memberID", "3")
        client.set_cookie(f"{util.auth_cookie_memberID}token", token)

        with patch.multiple(self.main, db=self.db, token_manager=token_manager):
            response = client.post("/api/drinks/buy", json={"memberID": 3, "drinkID": 1})
            self.assertEqual(response.status_code, 200)
            self.assert_state(stock=9, balance=1850)
            transaction_id = self.db.get_user_history(3)[0]["id"]

            response = client.post(f"/api/transactions/{transaction_id}/undo")

        self.assertEqual(response.status_code, 200)
        self.assert_state(stock=10, balance=2000)
        self.assertEqual(self.db.get_user_history(3), [])
        self.assertFalse(self.db.delete_transaction(transaction_id))
        self.assert_state(stock=10, balance=2000)

    def test_undo_uses_original_drink_and_price_after_edits(self):
        transaction_id = self.buy()
        self.db.change_drink_name(1, "Renamed water")
        self.db.change_drink_price(1, 250)
        self.db.add_drink("Water", 150, 20)

        self.assertTrue(self.db.delete_transaction(transaction_id))

        drinks = {drink["id"]: drink for drink in self.db.get_drinks()}
        self.assertEqual(drinks[1]["stock"], 10)
        self.assertEqual(drinks[2]["stock"], 20)
        self.assertEqual(self.db.get_user_by_id(3)["balance"], 2000)

    def test_free_drink_is_restocked(self):
        self.db.change_drink_price(1, 0)
        transaction_id = self.buy()

        self.assertTrue(self.db.delete_transaction(transaction_id))

        self.assert_state(stock=10, balance=2000)

    def test_non_purchase_with_drink_name_does_not_change_stock(self):
        with self.db.get_session() as session:
            session.add(Transaction(description="Water", member_id=3, amount=-150))
            session.query(Member).filter_by(id=3).first().balance -= 150
        transaction_id = self.db.get_user_history(3)[0]["id"]

        self.assertTrue(self.db.delete_transaction(transaction_id))

        self.assert_state(stock=10, balance=2000)

    def test_deleted_drink_can_still_be_refunded_without_restocking_replacement(self):
        transaction_id = self.buy()
        # The application's default SQLite connection does not enforce foreign keys.
        with self.engine.connect() as connection:
            connection.exec_driver_sql("PRAGMA foreign_keys=OFF")
        self.db.delete_drink(1)
        self.db.add_drink("Water", 150, 20)

        self.assertTrue(self.db.delete_transaction(transaction_id))

        self.assert_state(stock=20, balance=2000)

    def test_purchase_in_checkout_cannot_be_undone(self):
        transaction_id = self.buy()
        self.db.do_checkout({"newCash": 0, "members": [], "invoices": []})
        checkout_id = self.db.get_checkouts()[0]["id"]
        with self.db.get_session() as session:
            session.query(Transaction).filter_by(id=transaction_id).first().checkout_id = checkout_id

        self.assertFalse(self.db.delete_transaction(transaction_id))

        self.assert_state(stock=9, balance=1850)
        self.assertEqual(len(self.db.get_user_history(3)), 1)

    def test_event_purchase_restocks_one_unit_per_undo(self):
        result = self.db.event_purchase(3, [{"drinkID": 1, "quantity": 3}])
        self.assertEqual(result["total"], 450)
        self.assert_state(stock=7, balance=1550)

        for index, transaction in enumerate(self.db.get_user_history(3), start=1):
            self.assertTrue(self.db.delete_transaction(transaction["id"]))
            self.assert_state(stock=7 + index, balance=1550 + index * 150)

    def test_anonymous_event_purchase_records_drink_for_each_unit(self):
        self.db.event_purchase_cash([{"drinkID": 1, "quantity": 2}])
        with self.db.get_session() as session:
            purchases = session.query(Transaction).filter_by(drink_id=1).all()
            self.assertEqual(len(purchases), 2)
            transaction_ids = [transaction.id for transaction in purchases]

        for transaction_id in transaction_ids:
            self.assertTrue(self.db.delete_transaction(transaction_id))

        self.assert_state(stock=10, balance=2000)

    def test_backup_restore_preserves_purchase_drink(self):
        transaction_id = self.buy()
        with tempfile.TemporaryDirectory() as directory, patch.object(util, "tempfile_path", directory):
            self.assertTrue(self.db.backup_database())
            backup = json.loads(Path(directory, util.backup_file_name).read_text())
        self.assertEqual(backup["transactions"][0]["drink_id"], 1)

        self.db.restore_database(backup)
        self.assertTrue(self.db.delete_transaction(transaction_id))

        self.assert_state(stock=10, balance=2000)

    def test_old_backup_without_drink_id_can_still_be_restored(self):
        transaction_id = self.buy()
        with tempfile.TemporaryDirectory() as directory, patch.object(util, "tempfile_path", directory):
            self.assertTrue(self.db.backup_database())
            backup = json.loads(Path(directory, util.backup_file_name).read_text())
        del backup["transactions"][0]["drink_id"]

        self.db.restore_database(backup)
        self.assertTrue(self.db.delete_transaction(transaction_id))

        self.assert_state(stock=9, balance=2000)

    def test_migration_preserves_old_transactions_and_enables_purchase_undo(self):
        with self.db.get_session() as session:
            session.execute(text('DROP TABLE "transaction"'))
            session.execute(text('''CREATE TABLE "transaction" (
                id INTEGER PRIMARY KEY,
                description VARCHAR(150) NOT NULL,
                member_id INTEGER,
                amount INTEGER,
                date DATETIME NOT NULL,
                checkout_id INTEGER,
                connected_transaction_id INTEGER
            )'''))
            session.execute(text('''INSERT INTO "transaction" (description, member_id, amount, date)
                VALUES ('Legacy purchase', 3, -150, '2020-01-01 00:00:00')'''))
            session.query(KeyValue).filter_by(key="version").first().value = "4"

        with self.db.get_session() as session:
            self.assertTrue(Migrations.migrate(session))
            self.assertEqual(int(session.query(KeyValue).filter_by(key="version").first().value),
                             util.CURRENT_VERSION)
            self.assertIsNone(session.query(Transaction).first().drink_id)
            self.assertEqual(session.query(Transaction).first().description, "Legacy purchase")

        transaction_id = self.buy()
        self.assertTrue(self.db.delete_transaction(transaction_id))
        self.assert_state(stock=10, balance=2000)


if __name__ == "__main__":
    unittest.main()
