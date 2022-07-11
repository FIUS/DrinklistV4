from curses import ALL_MOUSE_EVENTS
import sqlalchemy as sql
from web import sql_database as db
from sqlalchemy.orm import relationship
from datetime import datetime


class Transaction(db.Model):
    id = sql.Column(sql.Integer, primary_key=True)
    description = sql.Column(sql.String(100), nullable=False)
    member_id = sql.Column(sql.Integer, sql.ForeignKey(
        'member.id'), nullable=False)
    member = relationship(
        'database.Member.Member', lazy="joined")
    amount = sql.Column(sql.Float, nullable=True)
    date = sql.Column(sql.DateTime, default=datetime.now, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "memberID": self.member_id,
            "amount": self.amount,
            "date": self.date.strftime('%Y-%m-%dT%H:%M:%SZ')
        }
