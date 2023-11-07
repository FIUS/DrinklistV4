from flask import Response
import json
import os
import datetime
import time
cookie_expire = int(os.environ.get("COOKIE_EXPIRE_TIME")) * \
    60*60 if os.environ.get("COOKIE_EXPIRE_TIME") else 60**3
domain = os.environ.get("DOMAIN") if os.environ.get(
    "DOMAIN") else "127.0.0.1:3000"
logging_enabled = os.environ.get(
    "DEBUG") == "true" if os.environ.get("DEBUG") else False

token = os.environ.get("X_AUTH_TOKEN")
old_domain = os.environ.get("OLD_DOMAIN")

admin_username = os.environ.get("ADMIN_USERNAME") if os.environ.get(
    "ADMIN_USERNAME") else "admin"
admin_password = os.environ.get("ADMIN_PASSWORD") if os.environ.get(
    "ADMIN_PASSWORD") else "unsafe"

moderator_username = os.environ.get(
    "MOD_USERNAME") if os.environ.get("MOD_USERNAME") else "moderator"
moderator_password = os.environ.get(
    "MOD_PASSWORD") if os.environ.get("MOD_PASSWORD") else "unsafe"
standard_user_password = os.environ.get(
    "USER_PASSWORD") if os.environ.get("USER_PASSWORD") else "unsafe"
undo_timelimit = int(os.environ.get(
    "UNDO_TIMELIMIT")) if os.environ.get("UNDO_TIMELIMIT") else 1
default_drink_category = int(os.environ.get(
    "DEFAULT_DRINK_CATEGORY")) if os.environ.get("DEFAULT_DRINK_CATEGORY") else "Getränk"
use_alias = os.environ.get(
    "USE_ALIAS") == "true" if os.environ.get("USE_ALIAS") else True
auto_hide_days = int(os.environ.get(
    "AUTO_HIDE_DAYS")) if os.environ.get("AUTO_HIDE_DAYS") else None
password_hash_rounds = max(10000, int(os.environ.get(
    "PASSSWORD_HASH_ROUNDS"))) if os.environ.get("PASSSWORD_HASH_ROUNDS") else 500000


mail_server = os.environ.get(
    "MAIL_SERVER") if os.environ.get("MAIL_SERVER") else None
mail_port = os.environ.get(
    "MAIL_PORT") if os.environ.get("MAIL_PORT") else 587
mail_email = os.environ.get(
    "MAIL_EMAIL") if os.environ.get("MAIL_EMAIL") else None
mail_username = os.environ.get(
    "MAIL_USERNAME") if os.environ.get("MAIL_USERNAME") else None
mail_password = os.environ.get(
    "MAIL_PASSWORD") if os.environ.get("MAIL_PASSWORD") else None
mail_postfix = os.environ.get(
    "MAIL_POSTFIX") if os.environ.get("MAIL_POSTFIX") else None

tempfile_path = "tempfiles"
backup_file_name = "backup.json"

os.environ['TZ'] = 'Europe/Berlin'
time.tzset()


def build_response(message: object, code: int = 200, type: str = "application/json", cookieMemberID=None, cookieToken=None):
    """
    Build a flask response, default is json format
    """
    r = Response(response=json.dumps(message), status=code, mimetype=type)
    if cookieMemberID and cookieToken:
        r.set_cookie("memberID", str(cookieMemberID),
                     domain=domain, max_age=cookie_expire, samesite='Strict')
        r.set_cookie("token", cookieToken,
                     domain=domain, max_age=cookie_expire, samesite='Strict')

    return r


def log(prefix, message):
    if logging_enabled:
        time = datetime.datetime.now().strftime("%x %X")
        output_string = f"[{time}] {prefix} -> {message}"
        with open("log.txt", 'a+') as f:
            f.write(f"{output_string}\n")


checkout_mail_text = """Hallo {name},
eine Getränkelisten abrechnung wurde durchgeführt, wir möchten dich hiermit über deinen aktuellen Kontostand informieren.
Aktuell hast du ein Guthaben von {balance}€.

Viele Grüße
"""
