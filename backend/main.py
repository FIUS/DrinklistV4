from datetime import datetime, timedelta
import os
from statistics import mode
import TaskScheduler
from flask import helpers
from flask import request
from flask import send_from_directory
from flask.wrappers import Request
from functools import wraps
import authenticator
import util
from web import *
import json
from database import Queries
from flask_restx import fields, Resource, Api
from flask_restx import reqparse

api = Api(app, doc='/docu/')
token_manager = authenticator.TokenManager()

db = Queries.Queries(sql_database)

taskScheduler = TaskScheduler.TaskScheduler()
taskScheduler.start()


def is_admin():
    return int(request.cookies.get('memberID')) == 1 and token_manager.check_token(request.cookies.get('memberID'), request.cookies.get('token'))


def authenticated(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not token_manager.check_token(request.cookies.get('memberID'), request.cookies.get('token')):
            return util.build_response("Unauthorized", 403)
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper


def admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not is_admin():
            return util.build_response("Unauthorized", 403)
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper


@api.route('/api/users')
class GET_USERS(Resource):
    @authenticated
    def get(self):
        """
        Gets all users
        """
        return util.build_response(db.get_users())


@api.route('/api/users/<int:member_id>/favorites')
class get_user_favorites(Resource):
    @authenticated
    def get(self, member_id):
        """
        Get favorite drinks of a user
        """
        return util.build_response(db.get_user_favorites(member_id))


@api.route('/api/users/<int:member_id>/history')
class get_user_history(Resource):
    @authenticated
    def get(self, member_id):
        """
        Get history of a user
        """
        return util.build_response(db.get_user_history(member_id))


@api.route('/api/users/<int:member_id>/favorites/add/<int:drink_id>')
class add_user_favorite(Resource):
    @authenticated
    def post(self, member_id, drink_id):
        """
        Add favorite drink of a user
        """
        db.add_user_favorite(member_id, drink_id)
        return util.build_response("Added favorite")


@api.route('/api/users/<int:member_id>/favorites/remove/<int:drink_id>')
class get_user_favorites(Resource):
    @authenticated
    def post(self, member_id, drink_id):
        """
        Remove favorite drink of a user
        """
        db.remove_user_favorite(member_id, drink_id)
        return util.build_response("Removed favorite")


model_password = api.model('Password', {
    'password': fields.String(required=True)
})


@api.route('/api/users/<int:member_id>/password')
class change_user_password(Resource):
    @admin
    @api.doc(body=model_password)
    def post(self, member_id):
        """
        Change the password of a user
        """
        db.change_user_password(member_id, request.json["password"])
        return util.build_response("Password changed")


@api.route('/api/users/<int:member_id>/visibility/toggle')
class toggle_user_visibility(Resource):
    @admin
    def post(self, member_id):
        """
        Toggle the visibility for the dashboard of a user
        """
        db.change_user_visibility(member_id)
        return util.build_response("Changed visibility")


model_amount = api.model('Amount', {
    'amount': fields.Float(required=True)
})


@api.route('/api/users/<int:member_id>/deposit')
class user_deposit(Resource):
    @admin
    @api.doc(body=model_amount)
    def post(self, member_id):
        """
        Deposit money for a user
        """
        db.deposit_user(member_id, float(request.json["amount"]))
        return util.build_response("Money added")


@api.route('/api/users/<int:member_id>/delete')
class delete_user(Resource):
    @admin
    def post(self, member_id):
        """
        Delete a user
        """
        db.delete_user(member_id)
        return util.build_response("User deleted")


model = api.model('Add User', {
    'name': fields.String(description='Name of the new user', required=True),
    'money': fields.Float(description='Initial balance of the user', required=True),
    'password': fields.String(description='Initial password of user', required=True),
})


@api.route('/api/users/add')
class add_user(Resource):
    @admin
    @api.doc(body=model)
    def post(self):
        """
        Add a user
        """
        db.add_user(request.json["name"],
                    request.json["money"], request.json["password"])
        return util.build_response("User added")


@api.route('/api/drinks')
class get_drinks(Resource):
    @authenticated
    def get(self):
        """
        Get all drinks
        """
        return util.build_response(db.get_drinks())


@api.route('/api/drinks/categories')
class get_user_categories(Resource):
    @authenticated
    def get(self):
        """
        Get all categories
        """
        return util.build_response(db.get_drink_categories())


@api.route('/api/drinks/<int:drink_id>/price')
class set_drink_price(Resource):
    @admin
    @api.doc(body=model_amount)
    def post(self, drink_id):
        """
        Set the price of a drink
        """
        db.change_drink_price(drink_id, request.json["amount"])
        return util.build_response("Price changed")


@api.route('/api/drinks/<int:drink_id>/stock')
class set_drink_stock(Resource):
    @admin
    @api.doc(body=model_amount)
    def post(self, drink_id):
        """
        Set the current stock of a drink
        """
        db.change_drink_stock(drink_id, request.json["amount"])
        return util.build_response("Stock changed")


@api.route('/api/drinks/<int:drink_id>/stock/increase')
class set_drink_stock_increase(Resource):
    @admin
    @api.doc(body=model_amount)
    def post(self, drink_id):
        """
        Increase the current stock of a drink
        """
        db.change_drink_stock(
            drink_id, request.json["amount"], is_increase=True)
        return util.build_response("Stock changed")


@api.route('/api/drinks/<int:drink_id>/delete')
class delete_drink(Resource):
    @admin
    def post(self, drink_id):
        """
        Delete a drink
        """
        db.delete_drink(drink_id)
        return util.build_response("Drink deleted")


model = api.model('Add-Drink', {
    'name': fields.String(description='What the drink should be named', required=True),
    'price': fields.Float(description='The price in euro', required=True),
    'stock': fields.Integer(description='The current stock', required=True),
    'category': fields.String(description='The category that the drink should be sorted into', required=False),
})


@api.route('/api/drinks/add')
class add_drink(Resource):
    @admin
    @api.doc(body=model)
    def post(self):
        """
        Add a drink
        """
        db.add_drink(request.json["name"],
                     request.json["price"], request.json["stock"], request.json["category"] if "category" in request.json else None)
        return util.build_response("Drink added")


buy_drink_model = api.model('Drink Buy', {
    'drinkID': fields.Integer(description='ID of the Drink that will be bought', required=True),
    'memberID': fields.Integer(description='ID of the user that buy the drink', required=True)
})


@api.route('/api/drinks/buy')
class buy_drink(Resource):
    @authenticated
    @api.doc(body=buy_drink_model)
    def post(self):
        """
        Buy a drink
        """
        status = db.buy_drink(
            request.json["memberID"], request.json["drinkID"])
        if status == None:
            return util.build_response("Drink bought")
        else:
            return util.build_response(status, code=400)


@api.route('/api/transactions')
class get_transactions(Resource):
    @authenticated
    def get(self):
        """
        Get all transactions
        """
        return util.build_response(db.get_transactions())


@api.route('/api/transactions/limit/<int:limit>')
class get_transactions_limited(Resource):
    @authenticated
    def get(self, limit):
        """
        Get the lastest x transactions
        """
        return util.build_response(db.get_transactions(limit))


@api.route('/api/transactions/<int:transaction_id>/undo')
class undo_transaction(Resource):
    @authenticated
    def post(self, transaction_id):
        """
        Undo the given transaction
        """
        if not is_admin():
            transaction_date = datetime.strptime(db.get_transaction(transaction_id)[
                'date'], "%Y-%m-%dT%H:%M:%SZ")
            if transaction_date+timedelta(minutes=util.undo_timelimit) < datetime.now():
                return util.build_response("Too late", code=412)

        db.delete_transaction(transaction_id)
        return util.build_response("Transaction undone")


member_model = api.model('Member-Checkout', {
    'memberID': fields.Integer,
    'amount': fields.Float
})

invoice_model = api.model('Invoice-Checkout', {
    'name': fields.Integer,
    'amount': fields.Float
})

model = api.model('Do-Checkout', {
    'newCash': fields.Float(description='The value that what was counted after the checkout', required=False),
    'members': fields.Nested(member_model, as_list=True),
    'invoices': fields.Nested(invoice_model, as_list=True)
})


@api.route('/api/checkout')
class do_checkout(Resource):
    @admin
    @api.doc(body=model)
    def post(self):
        """
        Create a checkout
        """
        return util.build_response(db.do_checkout(request.json))

    @admin
    def get(self):
        """
        Get all checkouts
        """
        return util.build_response(db.get_checkouts())


@api.route('/api/checkout/<int:checkout_id>')
class get_checkout_expanded(Resource):
    @admin
    def get(self, checkout_id):
        """
        Get the extended infos of a checkout
        """
        return util.build_response(db.get_checkout_expanded(checkout_id))


@api.route('/api/settings/backup')
class get_backup(Resource):
    @admin
    def get(self):
        """
        Get a json backup of the database
        """
        if db.backup_database():
            return send_from_directory(util.tempfile_path, util.backup_file_name)
        return util.build_response("Error creating file", code=500)


@api.route('/api/settings/restore')
class restore_db(Resource):
    @admin
    def post(self):
        """
        Restore from a json backup
        """
        file = request.files['file']
        file_json = json.loads(file.stream.read().decode("utf-8"))
        db.restore_database(file_json)
        return util.build_response("ok")


@api.route('/api/settings/password/admin')
class change_admin_password(Resource):
    @admin
    @api.doc(body=model_password)
    def post(self):
        """
        Change the admin password
        """
        db.change_member_password(request.json['password'], 1)
        return util.build_response("ok")


@api.route('/api/settings/password/kiosk')
class change_kiosk_password(Resource):
    @admin
    @api.doc(body=model_password)
    def post(self):
        """
        change the kiosk user password
        """
        db.change_member_password(request.json['password'], 2)
        return util.build_response("ok")


@api.route('/api/login/check')
class login_Check(Resource):
    @authenticated
    def get(self):
        """
        Check if your login token is valid
        """
        return util.build_response("OK")


@api.route('/api/login/admin/check')
class login_Check_Admin(Resource):
    @admin
    def get(self):
        """
        Check if your token is a valid admin token
        """
        return util.build_response("OK")


model = api.model('Login', {
    'name': fields.String(description='Name of the user that wants to log in', required=True),
    'password': fields.String(description='Password of the user that wants to log in', required=True)
})


@api.route('/api/login')
class login(Resource):
    @api.doc(body=model)
    def post(self):
        """
        Get the memberID and token for using the api
        """
        post_data = request.json
        name = post_data["name"]
        password = post_data["password"]
        member_id = db.checkPassword(name, password)

        if member_id is not None:
            util.log("Login", "User logged in")
            token = token_manager.create_token(member_id)
            return util.build_response("Login successfull", cookieToken=token, cookieMemberID=member_id)
        return util.build_response("Unauthorized", code=403)


@api.route('/api/logout')
class logout(Resource):
    @authenticated
    def post(self):
        """
        Invalidates the current token
        """
        token_manager.delete_token(request.cookies.get('token'))
        util.log("Logout", f"MemberID: {request.cookies.get('memberID')}")
        return util.build_response("OK")


if __name__ == "__main__":
    if util.logging_enabled:
        app.run("0.0.0.0", threaded=True)
    else:
        from waitress import serve
        serve(app, host="0.0.0.0", port=5000, threads=4)
