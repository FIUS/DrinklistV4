import requests
from authenticator import TokenManager
import util
from datetime import datetime, timedelta
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import session
from sqlalchemy.sql import func
from database.Models import *
from sqlalchemy import desc
from typing import List
import constants


class Queries:
    def __init__(self, db):

        self.db: SQLAlchemy = db
        self.session: session.Session = self.db.session
        self.db.create_all()
        if self.session.query(Member).first() is None:
            self.create_dummy_data()

    def get_users(self):
        members = self.session.query(Member).all()

        output = []
        for m in members:
            member: Member = m
            output.append(member.to_dict())

        return output[2:]

    def get_user_favorites(self, member_id):
        favorites = self.session.query(
            Favorite).filter_by(member_id=member_id).all()
        output = []
        for f in favorites:
            favorite: Favorite = f
            output.append(favorite.drink_id)

        return output

    def get_user_history(self, member_id):
        history = self.session.query(
            Transaction).filter_by(member_id=member_id)
        output = []
        for e in history:
            entry: Transaction = e
            output.append(entry.to_dict())

        output.reverse()
        return output

    def add_user_favorite(self, member_id, drink_id):
        self.session.add(Favorite(member_id=member_id, drink_id=drink_id))
        self.session.commit()

    def remove_user_favorite(self, member_id, drink_id):
        favorite: Favorite = self.session.query(Favorite).filter_by(
            member_id=member_id, drink_id=drink_id).first()
        if favorite is not None:
            self.session.delete(favorite)
            self.session.commit()

    def change_user_password(self, member_id, new_password):
        pw_hash, salt = TokenManager.hashPassword(new_password)
        user: Member = self.session.query(
            Member).filter_by(id=member_id).first()
        user.password = pw_hash
        user.salt = salt
        self.session.commit()

    def change_user_visibility(self, member_id):
        user: Member = self.session.query(
            Member).filter_by(id=member_id).first()
        user.hidden = not user.hidden
        self.session.commit()

    def add_user(self, name, money, password, hidden=False):
        pw_hash, salt = TokenManager.hashPassword(password)
        self.session.add(
            Member(name=name, balance=money, password=pw_hash, salt=salt, hidden=hidden))
        self.session.commit()

    def get_drinks(self):
        drinks = self.session.query(Drink).all()
        output = []
        for d in drinks:
            drink: Drink = d
            output.append(drink.to_dict())

        return output

    def change_drink_price(self, drink_id, price):
        drink: Drink = self.session.query(Drink).filter_by(id=drink_id).first()
        drink.price = price
        self.session.commit()

    def change_drink_stock(self, drink_id, stock, is_increase=False):
        drink: Drink = self.session.query(Drink).filter_by(id=drink_id).first()
        if not is_increase:
            drink.stock = stock
        else:
            drink.stock += stock
        self.session.commit()

    def delete_drink(self, drink_id):
        drink: Drink = self.session.query(Drink).filter_by(id=drink_id).first()
        self.session.delete(drink)
        self.session.commit()

    def add_drink(self, name, price, stock, category=None):
        if category is None:
            self.session.add(Drink(name=name, stock=stock, price=price))
        else:
            self.session.add(Drink(name=name, stock=stock,
                                   price=price, category=category))

        self.session.commit()

    def buy_drink(self, member_id, drink_id):
        drink: Drink = self.session.query(Drink).filter_by(id=drink_id).first()
        if drink is None:
            return "Drink does not exist"
        member: Member = self.session.query(
            Member).filter_by(id=member_id).first()

        member.balance -= drink.price
        drink.stock -= 1
        self.session.add(Transaction(
            description=f"{drink.name}", member_id=member.id, amount=(-drink.price)))

        self.session.commit()

        return None

    def get_drink_categories(self):
        drinks = self.session.query(Drink).all()
        output = []

        for d in drinks:
            drink: Drink = d
            if drink.category not in output:
                output.append(drink.category)

        return output

    def get_transactions(self, limit=None):
        transactions = []
        if limit is not None:
            transactions = self.session.query(Transaction).order_by(
                desc(Transaction.date)).limit(limit).all()
        else:
            transactions = self.session.query(
                Transaction).order_by(desc(Transaction.date)).all()
        output = []
        for t in transactions:
            transaction: Transaction = t
            output.append(transaction.to_dict())

        return output

    def delete_transaction(self, transaction_id):
        transaction: Transaction = self.session.query(
            Transaction).filter_by(id=transaction_id).first()
        member: Member = self.session.query(Member).filter_by(
            id=transaction.member_id).first()
        member.balance -= transaction.amount

        self.session.delete(transaction)

        self.session.commit()

    def delete_user(self, member_id):
        self.session.delete(self.session.query(
            Member).filter_by(id=member_id).first())
        self.session.commit()

    def deposit_user(self, member_id, amount):
        member: Member = self.session.query(
            Member).filter_by(id=member_id).first()
        member.balance += amount
        self.session.add(Transaction(description=f"Deposit",
                                     member_id=member_id, amount=amount))
        self.session.commit()

    def get_checkouts(self):
        checkouts = self.session.query(Checkout).all()
        output = []
        for c in checkouts:
            checkout: Checkout = c
            output.append(checkout.dict())
        return output

    def get_checkout_expanded(self, id):
        checkout: Checkout = self.session.query(
            Checkout).filter_by(id=id).first()

        return checkout.dict_expanded()

    def do_checkout(self, checkouts):
        checkout = None
        if checkouts['newCash'] is not None:
            checkout: Checkout = Checkout(current_cash=checkouts['newCash'])
        else:
            db_checkouts: Checkout = self.session.query(Checkout).all()
            last_db_checkout_cash = None
            if len(db_checkouts) > 0:
                last_db_checkout_cash = db_checkouts[-1].current_cash
            else:
                last_db_checkout_cash = 0

            sum_members = 0
            for c in checkouts['members']:
                sum_members += c['amount']

            sum_invoice = 0
            for c in checkouts['invoices']:
                sum_invoice += c['amount']

            last_db_checkout_cash += sum_members
            last_db_checkout_cash -= sum_invoice

            checkout: Checkout = Checkout(current_cash=last_db_checkout_cash)
        self.session.add(checkout)
        self.session.commit()

        for c in checkouts['members']:
            member_id = c["memberID"]
            amount = c["amount"]

            member: Member = self.session.query(
                Member).filter_by(id=member_id).first()
            member.balance += amount

            self.session.add(Transaction(
                description="Checkout", member_id=member_id, amount=amount, checkout_id=checkout.id))

        for c in checkouts['invoices']:
            amount = c["amount"]
            name = c["name"]
            self.session.add(Transaction(
                description=name, member_id=1, amount=amount, checkout_id=checkout.id))

        self.session.commit()

    def checkPassword(self, name, password):
        member: Member = self.session.query(
            Member).filter_by(name=name).first()
        if member is None:
            return None

        hashed_pw = TokenManager.hashPassword(password, member.salt)

        if hashed_pw == member.password:
            return member.id
        else:
            return None

    def create_dummy_data(self) -> None:
        hashedPassword, salt = TokenManager.hashPassword("unsafe")
        self.session.add(
            Member(name="admin", password=hashedPassword, salt=salt))
        self.session.add(
            Member(name="moderator", password=hashedPassword, salt=salt))

        self.session.commit()

        if util.token is not None and util.old_domain is not None:

            # Import Users
            resp = requests.get(f"https://{util.old_domain}/api/users",
                                headers={"x-auth-token": util.token}, timeout=3)

            for user in resp.json():
                self.add_user(user["name"], user["balance"]/100,
                              "unsafe", hidden=True if user["hidden"] == 1 else False)
                print("User", user["name"], "imported")

            print("-->", len(resp.json()), "users imported")
            print()

            # Import Drinks
            resp = requests.get(f"https://{util.old_domain}/api/beverages",
                                headers={"x-auth-token": util.token}, timeout=3)

            for drink in resp.json():
                self.add_drink(
                    drink["name"], drink["price"]/100, drink["stock"])
                print("Drink", drink["name"], "imported")

            print("-->", len(resp.json()), "drinks imported")
            print()

            # Import Transactions
            users = self.get_users()
            transactions = []
            for user in users:
                resp = requests.get(f"https://{util.old_domain}/api/orders/{user['name']}",
                                    headers={"x-auth-token": util.token}, timeout=3)

                for transaction in resp.json():
                    date = datetime.strptime(
                        transaction["timestamp"], "%Y-%m-%d %H:%M:%S")
                    transactions.append(
                        {
                            "description": transaction["reason"],
                            "member_id": user["id"],
                            "amount": transaction["amount"]/100,
                            "date": date
                        })

                    print("Transaction", transaction["reason"],
                          "for user", user["name"], "loaded")
                print()
            print("Sorting transactions...")
            transactions.sort(key=lambda x: x.get('date'))
            print("Done sorting transactions")
            for t in transactions:
                self.session.add(Transaction(description=t["description"],
                                             member_id=t["member_id"],
                                             amount=t["amount"],
                                             date=t["date"]))

            print("Starting to commit Transactions to database")
            self.session.commit()
            print("Done")
