import unittest
from unittest.mock import Mock, patch

import authenticator
import util


class BuyDrinkTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Import the API without opening the application database or starting jobs.
        with patch("database.Queries.Queries"), patch("TaskScheduler.TaskScheduler"):
            import main
        cls.main = main

    def setUp(self):
        self.db = Mock()
        self.db.load_tokens.return_value = []
        self.db.get_user_by_id.side_effect = lambda member_id: (
            {"id": int(member_id)} if str(member_id) in {"1", "2", "3", "4", "5"} else None
        )
        self.db.is_admin.side_effect = lambda member_id: str(member_id) == "5"
        self.db.buy_drink.return_value = {"name": "Water"}
        self.token_manager = authenticator.TokenManager(self.db)
        self.patch = patch.multiple(
            self.main, db=self.db, token_manager=self.token_manager
        )
        self.patch.start()
        self.addCleanup(self.patch.stop)
        self.client = self.main.app.test_client()

    def login(self, member_id):
        token = self.token_manager.create_token(member_id)
        self.client.set_cookie(f"{util.auth_cookie_memberID}memberID", str(member_id))
        self.client.set_cookie(f"{util.auth_cookie_memberID}token", token)

    def buy(self, member_id):
        return self.client.post(
            "/api/drinks/buy", json={"memberID": member_id, "drinkID": 1}
        )

    def test_regular_user_can_buy_for_self_with_integer_or_string_id(self):
        self.login(3)
        for member_id in (3, "3"):
            with self.subTest(member_id=member_id):
                response = self.buy(member_id)

                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.get_json(), "Drink Water bought")
                self.db.buy_drink.assert_called_with(member_id, 1)

    def test_regular_user_cannot_buy_for_someone_else(self):
        self.login(3)

        response = self.buy(4)

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json(), "Unauthorized")
        self.db.buy_drink.assert_not_called()

    def test_admin_and_kiosk_can_buy_for_someone_else(self):
        for member_id in (1, 2, 5):
            with self.subTest(member_id=member_id):
                self.login(member_id)

                response = self.buy(4)

                self.assertEqual(response.status_code, 200)
                self.db.buy_drink.assert_called_with(4, 1)

    def test_missing_recipient_returns_404_for_authenticated_users(self):
        for member_id in (1, 2, 3, 5):
            with self.subTest(member_id=member_id):
                self.login(member_id)

                response = self.buy(999)

                self.assertEqual(response.status_code, 404)
                self.assertEqual(response.get_json(), "User not found")
                self.db.buy_drink.assert_not_called()

    def test_purchase_requires_authentication(self):
        for member_id in (4, 999):
            with self.subTest(member_id=member_id):
                response = self.buy(member_id)

                self.assertEqual(response.status_code, 403)
                self.db.get_user_by_id.assert_not_called()
                self.db.buy_drink.assert_not_called()

    def test_admin_cookie_cannot_grant_permission(self):
        self.login(3)
        self.client.set_cookie(f"{util.auth_cookie_memberID}isAdmin", "True")

        response = self.buy(4)

        self.assertEqual(response.status_code, 403)
        self.db.buy_drink.assert_not_called()

    def test_kiosk_cookie_requires_matching_token(self):
        self.login(3)
        self.client.set_cookie(f"{util.auth_cookie_memberID}memberID", "2")

        response = self.buy(4)

        self.assertEqual(response.status_code, 403)
        self.db.buy_drink.assert_not_called()

    def test_missing_drink_keeps_existing_response(self):
        self.login(3)
        self.db.buy_drink.return_value = {}

        response = self.buy(3)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), "Drink does not exist")


if __name__ == "__main__":
    unittest.main()
