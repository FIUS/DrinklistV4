import sqlalchemy as sql
from web import sql_database as db
from sqlalchemy.orm import relationship


class Favorite(db.Model):
    id = sql.Column(sql.Integer, primary_key=True)
    member_id = sql.Column(sql.Integer, sql.ForeignKey(
        'member.id'), nullable=False)
    member = relationship(
        'database.Member.Member', lazy="joined")

    drink_id = sql.Column(sql.Integer, sql.ForeignKey(
        'drink.id'), nullable=False)
    drink = relationship(
        'database.Drink.Drink', lazy="joined")
