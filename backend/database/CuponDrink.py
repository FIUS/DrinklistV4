import sqlalchemy as sql
from web import sql_database as db
from sqlalchemy.orm import relationship


class CuponDrink(db.Model):
    id = sql.Column(sql.Integer, primary_key=True)
    cupon_id = sql.Column(sql.Integer, sql.ForeignKey(
        'cupon.id'), nullable=False)
    cupon = relationship(
        'database.Cupon.Cupon', lazy="joined")

    drink_id = sql.Column(sql.Integer, sql.ForeignKey(
        'drink.id'), nullable=False)
    drink = relationship(
        'database.Drink.Drink', lazy="joined")
    
    price = sql.Column(sql.Float, nullable=False)