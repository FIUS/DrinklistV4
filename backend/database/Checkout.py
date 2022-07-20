from curses import ALL_MOUSE_EVENTS
import sqlalchemy as sql
from web import sql_database as db
from sqlalchemy.orm import relationship
from datetime import datetime


class Checkout(db.Model):
    id = sql.Column(sql.Integer, primary_key=True)
    transactions = relationship(
        'database.Transaction.Transaction', lazy="joined")
    date = sql.Column(sql.DateTime, default=datetime.now, nullable=False)
