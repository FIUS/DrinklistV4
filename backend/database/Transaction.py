import sqlalchemy as sql
from web import sql_database as db
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import util


class Transaction(db.Model):
    id = sql.Column(sql.Integer, primary_key=True)
    description = sql.Column(sql.String(100), nullable=False)
    member_id = sql.Column(sql.Integer, sql.ForeignKey(
        'member.id'), nullable=False)
    member = relationship(
        'database.Member.Member', lazy="joined")
    amount = sql.Column(sql.Float, nullable=True)
    date = sql.Column(sql.DateTime, default=datetime.now, nullable=False)
    checkout_id = sql.Column(sql.Integer, sql.ForeignKey(
        'checkout.id'), nullable=True, default=None)

    def to_dict(self):
        output = {
            "id": self.id,
            "description": self.description,
            "memberID": self.member_id,
            "amount": self.amount,
            "date": self.date.strftime('%Y-%m-%dT%H:%M:%SZ'),
            "revertable": self.date+timedelta(minutes=util.undo_timelimit) >= datetime.now()
        }

        if self.member is not None:
            output["memberName"] = self.member.name

        return output

    def to_dict_backup(self):
        return {
            "id": self.id,
            "description": self.description,
            "memberID": self.member_id,
            "amount": self.amount,
            "date": self.date.strftime('%Y-%m-%dT%H:%M:%SZ'),
            "checkout_id": self.checkout_id
        }
