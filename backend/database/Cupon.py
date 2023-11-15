import sqlalchemy as sql
from web import sql_database as db


class Cupon(db.Model):
    id = sql.Column(sql.Integer, primary_key=True)
    name = sql.Column(sql.String(100), nullable=False, unique=True)
    color = sql.Column(sql.String(7), nullable=False)