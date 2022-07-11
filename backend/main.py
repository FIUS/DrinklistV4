from datetime import datetime
import os
import TaskScheduler
from flask import helpers
from flask import request
from flask.wrappers import Request
from functools import wraps
import authenticator
import util
from web import *

from database import Queries


token_manager = authenticator.TokenManager()

db = Queries.Queries(sql_database)

taskScheduler = TaskScheduler.TaskScheduler()
taskScheduler.start()


def authenticated(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not token_manager.check_token(request.cookies.get('memberID'), request.cookies.get('token')):
            return util.build_response("Unauthorized", 403)
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper


@app.route('/api/users', methods=["GET"])
def get_users():
    return util.build_response(db.get_users())


@app.route('/api/users/<int:member_id>/favorites', methods=["GET"])
def get_user_favorites(member_id):
    return util.build_response(db.get_user_favorites(member_id))


@app.route('/api/users/<int:member_id>/history', methods=["GET"])
def get_user_history(member_id):
    return util.build_response(db.get_user_history(member_id))


@app.route('/api/users/<int:member_id>/favorites/add/<int:drink_id>', methods=["POST"])
def add_user_favorite(member_id, drink_id):
    db.add_user_favorite(member_id, drink_id)
    return util.build_response("Added favorite")


@app.route('/api/users/<int:member_id>/favorites/remove/<int:drink_id>', methods=["POST"])
def remove_user_favorite(member_id, drink_id):
    db.remove_user_favorite(member_id, drink_id)
    return util.build_response("Removed favorite")


@app.route('/api/users/<int:member_id>/password', methods=["POST"])
def change_user_password(member_id):
    """
    Input:
    {
        password:<new password>
    }
    """
    db.change_user_password(member_id, request.json["password"])
    return util.build_response("Password changed")


@app.route('/api/users/<int:member_id>/visibility/toggle', methods=["POST"])
def toggle_user_visibility(member_id):
    db.change_user_visibility(member_id)
    return util.build_response("Changed visibility")


@app.route('/api/users/<int:member_id>/delete', methods=["POST"])
def get_event_infos(member_id):
    return util.build_response("Not Implemented yet", code=501)


@app.route('/api/users/add', methods=["POST"])
def add_user():
    """
    Input:
    {
        name:<name>,
        money:<money>,
        password:<password>
    }
    """
    db.add_user(request.json["name"],
                request.json["money"], request.json["password"])
    return util.build_response("User added")


@app.route('/api/drinks', methods=["GET"])
def get_drinks():
    return util.build_response(db.get_drinks())


@app.route('/api/drinks/categories', methods=["GET"])
def get_drink_categories():
    return util.build_response(db.get_drink_categories())


@app.route('/api/drinks/<int:drink_id>/price', methods=["POST"])
def set_drink_price(drink_id):
    """
    Input:
    {
        price:<price>
    }
    """
    db.change_drink_price(drink_id, request.json["price"])
    return util.build_response("Price changed")


@app.route('/api/drinks/<int:drink_id>/stock', methods=["POST"])
def set_drink_stock(drink_id):
    """
    Input:
    {
        stock:<new stock>
    }
    """
    db.change_drink_stock(drink_id, request.json["stock"])
    return util.build_response("Stock changed")


@app.route('/api/drinks/<int:drink_id>/delete', methods=["POST"])
def delete_drink(drink_id):
    db.delete_drink(drink_id)
    return util.build_response("Drink deleted")


@app.route('/api/drinks/add', methods=["POST"])
def add_drink():
    """
    Input:
    {
        name:<name>,
        price:<price in euro>,
        stock:<stock>
    }
    """
    db.add_drink(request.json["name"],
                 request.json["price"], request.json["stock"])
    return util.build_response("Drink added")


@app.route('/api/drinks/buy', methods=["POST"])
def buy_drink():
    """
    Input:
    {
        drinkID:<drink_id>,
        memberID:<member_id>
    }
    """
    status = db.buy_drink(request.json["memberID"], request.json["drinkID"])
    if status == None:
        return util.build_response("Drink bought")
    else:
        return util.build_response(status, code=400)


@app.route('/api/transactions', methods=["GET"])
def get_transactions():
    return util.build_response(db.get_transactions(), code=404)


@app.route('/api/transactions/<int:transaction_id>/undo', methods=["GET"])
def undo_transaction(transaction_id):
    db.delete_transaction(transaction_id)
    return util.build_response("Transaction undone")


@app.route('/api/login/check', methods=["GET"])
@authenticated
def loginCheck():
    return util.build_response("OK")


@app.route('/api/logout', methods=["POST"])
@authenticated
def logout():
    token_manager.delete_token(request.cookies.get('token'))
    util.log("Logout", f"MemberID: {request.cookies.get('memberID')}")
    return util.build_response("OK")


if __name__ == "__main__":
    if util.logging_enabled:
        app.run("0.0.0.0", threaded=True)
    else:
        from waitress import serve
        serve(app, host="0.0.0.0", port=5000, threads=4)
