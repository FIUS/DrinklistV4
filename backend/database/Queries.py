from authenticator import TokenManager
import util
from datetime import datetime, timedelta
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import session
from sqlalchemy.sql import func
from database.Models import *

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

    def add_user(self, name, money, password):
        pw_hash, salt = TokenManager.hashPassword(password)
        self.session.add(
            Member(name=name, balance=money, password=pw_hash, salt=salt))
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

    def change_drink_stock(self, drink_id, stock):
        drink: Drink = self.session.query(Drink).filter_by(id=drink_id).first()
        drink.stock = stock
        self.session.commit()

    def delete_drink(self, drink_id):
        drink: Drink = self.session.query(Drink).filter_by(id=drink_id).first()
        self.session.delete(drink)
        self.session.commit()

    def add_drink(self, name, price, stock):
        self.session.add(Drink(name=name, stock=stock, price=price))
        self.session.commit()

    def buy_drink(self, member_id, drink_id):
        drink: Drink = self.session.query(Drink).filter_by(id=drink_id).first()
        if drink is None:
            return "Drink does not exist"
        member: Member = self.session.query(
            Member).filter_by(id=member_id).first()

        member.balance -= drink.price
        self.session.add(Transaction(
            description=f"{drink.name} has been bought", member_id=member.id, amount=(-drink.price)))

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

    def get_transactions(self):
        transactions = self.session.query(Transaction).all()
        output = []
        for t in transactions:
            transaction: Transaction = t
            output.append(transaction.to_dict())

        output.reverse()
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

    def create_dummy_data(self) -> None:
        hashedPassword, salt = TokenManager.hashPassword("unsafe")
        self.session.add(
            Member(name="admin", password=hashedPassword, salt=salt))
        self.session.add(
            Member(name="moderator", password=hashedPassword, salt=salt))
        for i in range(34):
            self.session.add(
                Member(name=f"Benutzer {i}", password=hashedPassword, salt=salt))

        for i in range(17):
            self.session.add(
                Drink(name=f"Drink {i}", stock=i*2, price=i*1.5))
        self.session.commit()

        for i in range(17):
            self.session.add(
                Transaction(description=f"Drink bought {i}", member_id=5, amount=-0.60))

        self.session.commit()
