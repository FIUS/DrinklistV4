import sqlalchemy as sql
from web import sql_database as db
from sqlalchemy.orm import relationship
import util


class Federation(db.Model):
    id = sql.Column(sql.Integer, primary_key=True)
    name = sql.Column(sql.String(100), nullable=False)
    url = sql.Column(sql.String(200), nullable=False)
    remote_password = sql.Column(sql.String(100), nullable=True)
    remote_id = sql.Column(sql.Integer, nullable=True)
    federation_user_id = sql.Column(sql.Integer, sql.ForeignKey(
        'member.id', ondelete='CASCADE'), nullable=False)
    federation_user = relationship(
        'database.Member.Member', lazy="joined")
    accepted = sql.Column(sql.Boolean, nullable=False, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "url": self.url,
            "remote_id": self.remote_id,
            "federation_user_id": self.federation_user_id,
            "accepted": self.accepted
        }
