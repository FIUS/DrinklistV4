import json
from operator import truediv
from unicodedata import name
import requests
from authenticator import TokenManager
import util
from datetime import datetime, timedelta
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import session
from sqlalchemy.sql import func
from database.Models import *
from sqlalchemy import desc, asc
from typing import List
import constants
import os
from sqlalchemy import extract
from difflib import SequenceMatcher
from sqlalchemy import inspect, text
import database.Migrations
import math
from contextlib import contextmanager


class Queries:
    def __init__(self, db):

        self.db: SQLAlchemy = db
        self.db.create_all()

        with self.get_session() as session:
            if not database.Migrations.migrate(session):
                self.create_dummy_data()

    @contextmanager
    def get_session(self) -> session.Session:
        session = self.db.session()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_users(self):
        with self.get_session() as session:
            members = session.query(Member).all()

            output = []
            for m in members:
                member: Member = m
                if member.id > 2:
                    output.append(member.to_dict())

            return output

    def get_users_with_admin(self):
        with self.get_session() as session:
            members = session.query(Member).all()

            output = []
            for m in members:
                member: Member = m
                if member.id > 2:
                    output.append(member.to_dict_with_admin())

            return output

    def get_user_favorites(self, member_id):
        with self.get_session() as session:
            favorites = session.query(
                Favorite).filter_by(member_id=member_id).all()
            output = []
            for f in favorites:
                favorite: Favorite = f
                output.append(favorite.drink_id)

            return output

    def get_user_history(self, member_id):
        with self.get_session() as session:
            history = session.query(
                Transaction).filter_by(member_id=member_id)
            output = []
            for e in history:
                entry: Transaction = e
                output.append(entry.to_dict())

            output.sort(key=lambda transaction: transaction['id'])
            output.reverse()

            return output

    def add_user_favorite(self, member_id, drink_id):
        with self.get_session() as session:
            session.add(Favorite(member_id=member_id, drink_id=drink_id))
            session.commit()

    def remove_user_favorite(self, member_id, drink_id):
        with self.get_session() as session:
            favorite: Favorite = session.query(Favorite).filter_by(
                member_id=member_id, drink_id=drink_id).first()
            if favorite is not None:
                session.delete(favorite)
                session.commit()

    def change_user_password(self, member_id, new_password):
        with self.get_session() as session:
            pw_hash, salt = TokenManager.hashPassword(new_password)
            user: Member = session.query(
                Member).filter_by(id=member_id).first()
            user.password = pw_hash
            user.salt = salt
            session.commit()

    def change_user_privileges(self, member_id, is_admin):
        with self.get_session() as session:
            user: Member = session.query(
                Member).filter_by(id=member_id).first()
            user.is_admin = is_admin
            session.commit()

    def change_user_visibility(self, member_id, visibility=None):
        with self.get_session() as session:
            user: Member = session.query(
                Member).filter_by(id=int(member_id)).first()
            user.hidden = not user.hidden if visibility is None else visibility
            if user.hidden:
                user.is_admin = False
            print(user.name, user.hidden, visibility)
            session.commit()

    def add_user(self, name, money, password, alias="", hidden=False):
        with self.get_session() as session:
            pw_hash, salt = TokenManager.hashPassword(password)
            new_member = Member(name=name.lower(), balance=money,
                                password=pw_hash, salt=salt, alias=alias, hidden=hidden)
            session.add(new_member)
            session.commit()
            return new_member.to_dict()

    def get_drinks(self):
        with self.get_session() as session:
            drinks = session.query(Drink).all()
            output = []
            for d in drinks:
                drink: Drink = d
                output.append(drink.to_dict())

            return output

    def change_drink_price(self, drink_id, price):
        with self.get_session() as session:
            drink: Drink = session.query(
                Drink).filter_by(id=drink_id).first()
            drink.price = price
            session.commit()

    def change_drink_stock(self, drink_id, stock, is_increase=False):
        with self.get_session() as session:
            drink: Drink = session.query(
                Drink).filter_by(id=drink_id).first()
            if not is_increase:
                drink.stock = stock
            else:
                drink.stock += stock
            session.commit()

    def change_drink_name(self, drink_id, name):
        with self.get_session() as session:
            drink: Drink = session.query(
                Drink).filter_by(id=drink_id).first()
            drink.name = name
            session.commit()

    def change_drink_category(self, drink_id, category):
        with self.get_session() as session:
            drink: Drink = session.query(
                Drink).filter_by(id=drink_id).first()
            drink.category = category
            session.commit()

    def delete_drink(self, drink_id):
        with self.get_session() as session:
            drink: Drink = session.query(
                Drink).filter_by(id=drink_id).first()
            session.delete(drink)
            session.commit()

    def add_drink(self, name, price, stock, category=None):
        with self.get_session() as session:
            if category is None:
                session.add(Drink(name=name, stock=stock, price=price))
            else:
                session.add(Drink(name=name, stock=stock,
                                  price=price, category=category))

            session.commit()

    def buy_drink(self, member_id, drink_id):
        with self.get_session() as session:
            drink: Drink = session.query(
                Drink).filter_by(id=drink_id).first()
            if drink is None:
                return {}
            member: Member = session.query(
                Member).filter_by(id=member_id).first()

            member.balance -= drink.price
            drink.stock -= 1
            session.add(Transaction(
                description=f"{drink.name}", member_id=member.id, amount=(-drink.price)))

            session.commit()

            return drink.to_dict()

    def get_drink_categories(self):
        with self.get_session() as session:
            drinks = session.query(Drink).all()
            output = []

            for d in drinks:
                drink: Drink = d
                if drink.category not in output:
                    output.append(drink.category)

            return output

    def get_transactions(self, limit=None):
        with self.get_session() as session:
            transactions = []
            if limit is not None:
                transactions = session.query(Transaction).order_by(
                    desc(Transaction.date)).limit(limit).all()
            else:
                transactions = session.query(
                    Transaction).order_by(desc(Transaction.date)).all()
            output = []
            for t in transactions:
                transaction: Transaction = t
                output.append(transaction.to_dict())

            return output

    def get_transaction(self, transaction_id) -> dict:
        with self.get_session() as session:
            return session.query(Transaction).filter_by(id=transaction_id).first().to_dict()

    def delete_transaction(self, transaction_id):
        with self.get_session() as session:
            transaction: Transaction = session.query(
                Transaction).filter_by(id=transaction_id).first()
            if transaction.checkout_id is not None:
                # Cannot delete a transaction that is part of a checkout
                return False

            member: Member = session.query(Member).filter_by(
                id=transaction.member_id).first()
            member.balance -= transaction.amount

            if transaction.connected_transaction_id is not None:
                transaction_connected: Transaction = session.query(
                    Transaction).filter_by(id=transaction.connected_transaction_id).first()

                member_connected: Member = session.query(Member).filter_by(
                    id=transaction_connected.member_id).first()
                member_connected.balance -= transaction_connected.amount
                session.delete(transaction_connected)

            session.delete(transaction)

            session.commit()
            return True

    def delete_user(self, member_id):
        with self.get_session() as session:
            session.delete(session.query(
                Member).filter_by(id=member_id).first())
            session.commit()

    def deposit_user(self, member_id, amount):
        with self.get_session() as session:
            member: Member = session.query(
                Member).filter_by(id=member_id).first()
            member.balance += amount
            deposit_transaction = Transaction(description=f"Deposit",
                                              member_id=member_id, amount=amount)
            session.add(deposit_transaction)
            checkouts = self.get_checkouts()
            if len(checkouts) > 0:
                most_recent_checkout = session.query(
                    Checkout).filter_by(id=checkouts[-1]["id"]).first()
                most_recent_checkout.current_cash += amount
                deposit_transaction.checkout_id = most_recent_checkout.id

            session.commit()

    def get_checkouts(self):
        with self.get_session() as session:
            checkouts = session.query(Checkout).order_by(
                asc(Checkout.id)).all()
            output = []

            for c in checkouts:
                checkout: Checkout = c
                output.append(checkout.dict())
            return output

    def delete_checkout(self, checkout_id):
        with self.get_session() as session:
            checkout: Checkout = session.query(
                Checkout).filter_by(id=checkout_id).first()
            transactions: list[Transaction] = session.query(
                Transaction).filter_by(checkout_id=checkout_id).all()

            for t in transactions:
                transaction: Transaction = t
                if transaction.member is not None:
                    transaction.member.balance -= transaction.amount

                session.delete(t)

            session.delete(checkout)
            session.commit()

    def get_checkout_expanded(self, id):
        with self.get_session() as session:
            checkout: Checkout = session.query(
                Checkout).filter_by(id=id).first()

            return checkout.dict_expanded()

    def do_checkout(self, checkouts):
        with self.get_session() as session:
            checkout = None
            if checkouts['newCash'] is not None:
                checkout: Checkout = Checkout(
                    current_cash=checkouts['newCash'])
            else:
                db_checkouts: Checkout = session.query(Checkout).order_by(
                    asc(Checkout.id)).all()

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

                last_db_checkout_cash = math.floor(
                    last_db_checkout_cash*100)/100

                checkout: Checkout = Checkout(
                    current_cash=last_db_checkout_cash)
            session.add(checkout)
            session.commit()

            for c in checkouts['members']:
                member_id = c["memberID"]
                amount = c["amount"]

                member: Member = session.query(
                    Member).filter_by(id=member_id).first()
                member.balance += amount

                session.add(Transaction(
                    description="Checkout", member_id=member_id, amount=amount, checkout_id=checkout.id))

            for c in checkouts['invoices']:
                amount = c["amount"]
                name = "Rechnung: "+c["name"]
                session.add(Transaction(
                    description=name, member_id=1, amount=amount, checkout_id=checkout.id))

            session.commit()

    def get_checkout_mail(self, memberIDs):
        with self.get_session() as session:
            members: list[Member] = session.query(Member).all()
            checkouts = self.get_checkouts()
            if len(checkouts) > 2:
                last_checkout = self.get_checkouts()[-2]
                last_date = datetime.strptime(
                    last_checkout["date"], '%Y-%m-%dT%H:%M:%SZ')
                "{price,income,paid,name}"
                member_dict = {}
                for m in members:
                    if m.id not in memberIDs:
                        continue

                    transactions: list[Transaction] = session.query(Transaction).filter(
                        Transaction.date > last_date, Transaction.member_id == m.id).all()
                    temp_dict = {}
                    temp_dict["balance"] = m.balance
                    temp_dict["name"] = m.alias if m.alias != "" else m.name
                    temp_dict["id"] = m.id
                    income_transactions = []
                    paid_transactions = []

                    for t in transactions:
                        t_dict = t.to_dict()
                        if t_dict["amount"] > 0:
                            # income
                            income_transactions.append(
                                [str(t_dict["description"]).replace("&", "\&"), t.date.strftime('%d.%m.%Y'), t_dict["amount"]])
                        else:
                            # paid
                            paid_transactions.append(
                                [str(t_dict["description"]).replace("&", "\&"), t.date.strftime('%d.%m.%Y'), float(t_dict["amount"])*-1])
                    temp_dict["income"] = income_transactions
                    temp_dict["paid"] = paid_transactions

                    member_dict[m.name] = temp_dict

                return member_dict
            else:
                return {}

    def checkPassword(self, name, password):
        with self.get_session() as session:
            member: Member = session.query(
                Member).filter_by(name=name.lower()).first()
            if member is None:
                return None

            hashed_pw = TokenManager.hashPassword(password, member.salt)

            if hashed_pw == member.password:
                return member.id
            else:
                return None

    def check_user(self, name):
        with self.get_session() as session:
            member: Member = session.query(
                Member).filter_by(name=name.lower()).first()

            return member.id if member is not None else None

    def get_most_bought_drink_name(self, member_id: int, timestamp: datetime):
        with self.get_session() as session:
            # Round timestamp down to nearest 15-minute interval
            now = datetime.now()
            timestamp = timestamp.replace(second=0, microsecond=0)
            timestamp = timestamp.replace(
                year=now.year, month=now.month, day=now.day)
            timestamp = timestamp - timedelta(minutes=timestamp.minute % 15)

            # Calculate the date 120 days ago
            date_range = timestamp - timedelta(days=120)

            # Check for transactions for given member_id for the rest of the day
            max_drink_amounts = {}
            for i in range(0, 24*4):
                interval_start = timestamp + timedelta(minutes=i*15)
                interval_end = timestamp + timedelta(minutes=(i+1)*15)

                # Get all transactions for member_id within current 15-minute interval
                transactions = session.query(Transaction).filter(
                    Transaction.member_id == member_id,
                    extract('hour', Transaction.date) == interval_start.hour,
                    extract('minute', Transaction.date) >= interval_start.minute,
                    extract('minute', Transaction.date) < interval_end.minute,
                    Transaction.date >= date_range
                ).all()

                transactions = [
                    t for t in transactions if "Transfer" not in t.description]

                # Calculate total amount of each drink purchased
                drink_amounts = {}
                for transaction in transactions:
                    drink_name = transaction.description
                    if drink_name in drink_amounts:
                        drink_amounts[drink_name] += 1
                    else:
                        drink_amounts[drink_name] = 1

                # If transactions found in interval, return drink with highest total amount
                if drink_amounts:
                    return {"drink": max(drink_amounts, key=drink_amounts.get), "confident": True if i == 0 else False}

                # Update max_drink_amounts with current interval's drink amounts
                for drink, amount in drink_amounts.items():
                    if drink in max_drink_amounts:
                        max_drink_amounts[drink] += amount
                    else:
                        max_drink_amounts[drink] = amount

            # If no transactions found for any interval, return drink with highest total amount for entire day
            if max_drink_amounts:
                return {"drink": max(max_drink_amounts, key=max_drink_amounts.get), "confident": False}
            else:
                return {"drink": None, "confident": False}

    def get_drink_id_from_name(self, name):
        with self.get_session() as session:
            if name is None:
                print("No favorite drink found")
                return None
            drink: Drink = session.query(
                Drink).filter_by(name=name).first()
            if drink is not None:
                return drink.id
            else:
                # Find closest match using sequence matcher
                drinks = session.query(Drink).all()
                best_match = None
                best_match_ratio = 0
                for drink in drinks:
                    ratio = SequenceMatcher(None, name, drink.name).ratio()
                    if ratio > best_match_ratio:
                        best_match = drink
                        best_match_ratio = ratio

                if best_match_ratio > 0.9:
                    return best_match.id
                else:
                    return None

    def get_most_bought_drink_id(self, member_id: int, timestamp: datetime) -> int:
        with self.get_session() as session:
            drink_name = self.get_most_bought_drink_name(member_id, timestamp)
            return {"drinkID": self.get_drink_id_from_name(drink_name["drink"]), "confidence": drink_name["confident"]}

    def change_member_password(self, password, member_id):
        with self.get_session() as session:
            member: Member = session.query(
                Member).filter_by(id=member_id).first()
            hashedPassword, salt = TokenManager.hashPassword(password)
            member.password = hashedPassword
            member.salt = salt
            session.commit()

    def change_user_alias(self, member_id, alias):
        with self.get_session() as session:
            member: Member = session.query(
                Member).filter_by(id=member_id).first()
            member.alias = alias
            session.commit()

    def change_user_name(self, member_id, name):
        with self.get_session() as session:
            member: Member = session.query(
                Member).filter_by(id=member_id).first()

            member.name = name
            session.commit()

    def backup_database(self):
        with self.get_session() as session:
            checkouts: list[Checkout] = session.query(Checkout).all()
            drinks: list[Drink] = session.query(Drink).all()
            favorites: list[Favorite] = session.query(Favorite).all()
            members: list[Member] = session.query(Member).all()
            transactions: list[Transaction] = session.query(
                Transaction).all()

            output = {}

            output['checkouts'] = []
            output['drinks'] = []
            output['favorites'] = []
            output['members'] = []
            output['transactions'] = []

            for c in checkouts:
                output["checkouts"].append(c.dict())
            for d in drinks:
                output["drinks"].append(d.to_dict())
            for f in favorites:
                output["favorites"].append(f.to_dict())
            for m in members:
                output["members"].append(m.to_dict_with_password())
            for t in transactions:
                output["transactions"].append(t.to_dict_backup())

            success = False
            path = f"{util.tempfile_path}/{util.backup_file_name}"
            os.makedirs(os.path.dirname(
                path), exist_ok=True)
            with open(path, 'w') as f:
                f.write(json.dumps(output))
                success = True

            return success

    def set_current_release(self, release_data):
        with self.get_session() as session:
            release_tag = session.query(
                KeyValue).filter_by(key="release_tag").first()
            release_message = session.query(
                KeyValue).filter_by(key="release_message").first()
            open_issues = session.query(
                KeyValue).filter_by(key="open_issues").first()

            if release_tag == None:
                session.add(KeyValue(key="release_tag",
                                     value=release_data['release_tag']))
            else:
                release_tag.value = release_data['release_tag']

            if release_message == None:
                session.add(KeyValue(key="release_message",
                                     value=release_data['release_message']))
            else:
                release_message.value = release_data['release_message']

            if open_issues == None:
                session.add(KeyValue(key="open_issues",
                                     value=release_data['open_issues']))
            else:
                open_issues.value = release_data['open_issues']

            session.commit()

    def get_repo_information(self):
        with self.get_session() as session:
            release_tag = session.query(
                KeyValue).filter_by(key="release_tag").first()
            if release_tag is not None:
                release_tag = release_tag.value
            release_message = session.query(
                KeyValue).filter_by(key="release_message").first()
            if release_message is not None:
                release_message = release_message.value
            open_issues = session.query(
                KeyValue).filter_by(key="open_issues").first()
            if open_issues is not None:
                open_issues = int(open_issues.value)

            return {"releaseTag": release_tag, "releaseMessage": release_message, "openIssues": open_issues}

    def transfer(self, member_id_from, member_id_to, amount, message=None):
        with self.get_session() as session:
            member_from: Member = session.query(
                Member).filter_by(id=member_id_from).first()
            member_to: Member = session.query(
                Member).filter_by(id=member_id_to).first()

            member_from.balance -= amount
            member_to.balance += amount

            string_to = f"Transfer money to {member_to.alias if member_to.alias!='' else member_to.name}"
            string_from = f"Transfer money from {member_from.alias if member_from.alias!='' else member_from.name}"

            if message is not None:
                string_to = f"Transfer money to {member_to.alias if member_to.alias!='' else member_to.name}: {message}"
                string_from = f"Transfer money from {member_from.alias if member_from.alias!='' else member_from.name}: {message}"

            transaction_minus = Transaction(
                description=string_to,
                member_id=member_from.id,
                amount=-amount,
                date=datetime.now())

            transaction_plus = Transaction(
                description=string_from,
                member_id=member_to.id,
                amount=amount,
                date=datetime.now())

            session.add(transaction_minus)
            session.add(transaction_plus)

            session.commit()

            transaction_minus.connected_transaction_id = transaction_plus.id
            transaction_plus.connected_transaction_id = transaction_minus.id

            session.commit()

            return member_from.name

    def add_message(self, member_id, message, from_name=None, emoji=None, request=None):
        with self.get_session() as session:
            session.add(Reminder(member_id=member_id, text=message,
                                 member_name_from=from_name, emoji=emoji, request=request))
            session.commit()

    def get_messages(self, member_id):
        with self.get_session() as session:
            reminders: list[Reminder] = session.query(
                Reminder).filter_by(member_id=member_id).all()
            output = []
            for r in reminders:
                output.append(r.to_dict())

            return output

    def remove_messages(self, member_id):
        with self.get_session() as session:
            reminders: list[Reminder] = session.query(
                Reminder).filter_by(member_id=member_id).all()

            for r in reminders:
                session.delete(r)

            session.commit()

    def remove_message(self, message_id):
        with self.get_session() as session:
            reminder: Reminder = session.query(
                Reminder).filter_by(id=message_id).first()

            session.delete(reminder)

            session.commit()

    def get_username_alias(self, member_id):
        with self.get_session() as session:
            member: Member = session.query(
                Member).filter_by(id=member_id).first()
            return member.name, member.alias

    def get_safe_name(self, member_id):
        with self.get_session() as session:
            name, alias = self.get_username_alias(member_id)
            output = alias if alias is not None and alias != "" else name
            return output

    def hide_inactive(self):
        with self.get_session() as session:
            if util.auto_hide_days is None:
                return

            latest_transactions = session.query(Transaction.member_id, func.max(Transaction.date).label('latest_date')) \
                .group_by(Transaction.member_id).all()

            # Print the results
            for result in latest_transactions:
                try:
                    if result[1] < datetime.now()-timedelta(days=int(util.auto_hide_days)):
                        self.change_user_visibility(result[0], True)
                    # else:
                    #    self.change_user_visibility(result[0], False)
                except:
                    pass

    def convert_usernames_to_lower(self):
        with self.get_session() as session:
            members = session.query(Member).all()

            for m in members:
                member: Member = m
                member.name = member.name.lower()

            session.commit()

    def add_aliases_if_non_existend(self):
        with self.get_session() as session:
            members = session.query(Member).all()

            for m in members:
                member: Member = m
                if member.alias == "":
                    # Set the username as alias with first letter after spaces capitalized
                    member.alias = " ".join([name.capitalize()
                                            for name in member.name.split(" ")])

            session.commit()

    def get_checkin_status_from_pretix(self):
        with self.get_session() as session:
            # Define the endpoint
            endpoint = f"{util.pretix_url}/api/v1/organizers/{util.pretix_organizer}/events/{util.pretix_event}/checkinlists/{util.pretix_checkin_list_id}/positions/"
            headers = {
                "Authorization": f"Token {util.pretix_api_token}",
                "Content-Type": "application/json"
            }

            try:
                # Send the request
                response = requests.get(endpoint, headers=headers)
                response.raise_for_status()  # Raise an error for unsuccessful requests

                # Parse JSON response
                data = response.json()

                # Extract and print attendee name and check-in state
                attendees = []

                for position in data.get("results", []):
                    name = position.get("attendee_name", "No Name Provided")
                    checkin_state = position.get("checkins", [])

                    if len(checkin_state) > 0:
                        checkin_state = checkin_state[0].get(
                            "type", "exit") == "entry"
                    else:
                        checkin_state = False
                    attendees.append((name, checkin_state))

                nextPage = data.get("next")
                while nextPage is not None:
                    response = requests.get(nextPage, headers=headers)
                    response.raise_for_status()
                    data = response.json()
                    for position in data.get("results", []):
                        name = position.get(
                            "attendee_name", "No Name Provided")
                        checkin_state = position.get("checkins", [])

                        if len(checkin_state) > 0:
                            checkin_state = checkin_state[0].get(
                                "type", "exit") == "entry"
                        else:
                            checkin_state = False
                        attendees.append((name, checkin_state))
                    nextPage = data.get("next")

                return attendees

            except requests.exceptions.RequestException as e:
                print("Error fetching check-in data:", e)
                return []

    def enable_disable_pretix_user(self):
        with self.get_session() as session:
            print("Checking pretix check-in")
            attendee_list = self.get_checkin_status_from_pretix()

            for attendee in attendee_list:
                name, checked_in = attendee
                member: Member | None = session.query(
                    Member).filter_by(name=name.lower()).first()
                if member is not None:
                    if checked_in:
                        self.change_user_visibility(
                            member.id, visibility=False)
                    else:
                        self.change_user_visibility(member.id, visibility=True)
                else:
                    print(f"User {name} not found in database")
                    # Add user to database
                    self.add_user(name, 0, util.standard_user_password,
                                  name, hidden=not checked_in)

    def is_admin(self, member_id):
        with self.get_session() as session:
            member: Member = session.query(
                Member).filter_by(id=member_id).first()
            return member.is_admin

    def add_token(self, token, member_id, time):
        with self.get_session() as session:
            session: Session = session.query(
                Session).filter_by(member_id=member_id).first()
            if session is None:
                session.add(
                    Session(token=token, member_id=member_id, time=time))
            else:
                session.token = token
                session.time = time

            session.commit()

    def delete_token(self, token):
        with self.get_session() as session:
            session: Session = session.query(
                Session).filter_by(token=token).first()

            if session is not None:
                session.delete(session)
                session.commit()

    def load_tokens(self):
        with self.get_session() as session:

            sessions = session.query(Session).all()
            return [s.to_dict() for s in sessions]

    def get_config_state(self):
        with self.get_session() as session:
            admin: Member = session.query(Member).filter_by(
                name=util.admin_username).first()

            return admin.balance

    def set_config_state(self, state):
        with self.get_session() as session:
            admin: Member = session.query(Member).filter_by(
                name=util.admin_username).first()
            admin.balance = state
            session.commit()

    def restore_database(self, imported_data):
        with self.get_session() as session:
            checkouts: list[Checkout] = session.query(Checkout).all()
            drinks: list[Drink] = session.query(Drink).all()
            favorites: list[Favorite] = session.query(Favorite).all()
            members: list[Member] = session.query(Member).all()
            transactions: list[Transaction] = session.query(
                Transaction).all()
            sessions: list[Session] = session.query(Session).all()

            for c in checkouts:
                session.delete(c)
            for d in drinks:
                session.delete(d)
            for f in favorites:
                session.delete(f)
            for m in members:
                session.delete(m)
            for t in transactions:
                session.delete(t)
            for s in sessions:
                session.delete(s)

            print("Deleting old data...")
            session.commit()
            print("Done")

            for m in imported_data["members"]:
                session.add(Member(
                    id=m['id'],
                    name=m['name'],
                    balance=m['balance'],
                    hidden=m['hidden'],
                    alias=m['alias'],
                    password=bytes.fromhex(m['password']),
                    salt=m['salt'],
                    is_admin=m['isAdmin'] if 'isAdmin' in m else False))

            print("Added members")

            try:
                for d in imported_data["drinks"]:
                    session.add(Drink(
                        id=d['id'],
                        name=d['name'],
                        stock=d['stock'],
                        price=d['price'],
                        category=d['category']))

                session.commit()
            except:
                session.rollback()
                for d in imported_data["drinks"]:
                    try:
                        session.add(Drink(
                            id=d['id'],
                            name=d['name'],
                            stock=d['stock'],
                            price=d['price'],
                            category=d['category']))

                        session.commit()
                    except:
                        session.rollback()
                        print("Failed to import drink", d['name'])

            print("Added drinks")

            for c in imported_data["checkouts"]:
                session.add(
                    Checkout(
                        id=c['id'],
                        date=datetime.strptime(
                            c['date'], "%Y-%m-%dT%H:%M:%SZ"),
                        current_cash=c['currentCash']))

            session.commit()

            print("Added checkouts")

            try:

                for f in imported_data["favorites"]:
                    session.add(Favorite(
                        id=f['id'],
                        member_id=f['member_id'],
                        drink_id=f['drink_id']))

                session.commit()
            except:
                session.rollback()
                for f in imported_data["favorites"]:
                    try:
                        session.add(Favorite(
                            id=f['id'],
                            member_id=f['member_id'],
                            drink_id=f['drink_id']))

                        session.commit()
                    except:
                        session.rollback()
                        print("Failed to import favorite", f['id'])
            print("Added favorites")

            try:

                for t in imported_data["transactions"]:
                    session.add(Transaction(
                        id=t['id'],
                        description=t['description'],
                        member_id=t['memberID'],
                        amount=t['amount'],
                        date=datetime.strptime(
                            t['date'], "%Y-%m-%dT%H:%M:%SZ"),
                        checkout_id=t['checkout_id']))

                session.commit()
            except:
                session.rollback()
                print("Failed to import transactions")
                counter = 0
                failed_counter = 0
                for idx, t in enumerate(imported_data["transactions"]):
                    try:
                        session.add(Transaction(
                            id=t['id'],
                            description=t['description'],
                            member_id=t['memberID'],
                            amount=t['amount'],
                            date=datetime.strptime(
                                t['date'], "%Y-%m-%dT%H:%M:%SZ"),
                            checkout_id=t['checkout_id']))

                        session.commit()
                        counter += 1
                        if counter % 100 == 0:
                            print("Imported transaction", idx, "/",
                                  len(imported_data["transactions"]))
                            counter = 0
                    except:
                        session.rollback()
                        failed_counter += 1
                        print("Failed to import transaction",
                              t['id'], t['description'])
                print("Failed to import", failed_counter, "transactions")

            print("Added transactions")

            # Get table names
            tables = inspect(self.db.engine).get_table_names()

            try:
                # For each table update the auto increment value
                for table in tables:
                    query = text(
                        f"SELECT setval('{str(table).lower()}_id_seq', (SELECT MAX(id) from {table}));")
                    session.execute(query)
            except:
                print("Failed to update auto increment values (expected on sqlite))")

            return

    def create_dummy_data(self) -> None:
        with self.get_session() as session:
            hashedPassword, salt = TokenManager.hashPassword(
                util.admin_password)
            session.add(
                Member(name=util.admin_username, password=hashedPassword, salt=salt, is_admin=True))
            hashedPassword, salt = TokenManager.hashPassword(
                util.moderator_password)
            session.add(
                Member(name=util.moderator_username, password=hashedPassword, salt=salt))
            session.add(
                KeyValue(key="version", value=util.CURRENT_VERSION))
            session.commit()

            if util.token is not None and util.old_domain is not None:

                # Import Users
                resp = requests.get(f"https://{util.old_domain}/api/users",
                                    headers={"x-auth-token": util.token}, timeout=10)

                for user in resp.json():
                    self.add_user(user["name"], user["balance"]/100,
                                  util.standard_user_password, hidden=True if user["hidden"] == 1 else False)
                    print("User", user["name"], "imported")

                print("-->", len(resp.json()), "users imported")
                print()

                # Import Drinks
                resp = requests.get(f"https://{util.old_domain}/api/beverages",
                                    headers={"x-auth-token": util.token}, timeout=10)

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
                                        headers={"x-auth-token": util.token}, timeout=10)

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
                    session.add(Transaction(description=t["description"],
                                            member_id=t["member_id"],
                                            amount=t["amount"],
                                            date=t["date"]))

                print("Starting to commit Transactions to database")
                session.commit()
                print("Done")
