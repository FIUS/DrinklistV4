from flask import Response
import json
import os
import datetime
import time
import requests

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

auth_cookie_memberID = os.environ.get(
    "AUTH_COOKIE_PREFIX") if os.environ.get("AUTH_COOKIE_PREFIX") else ""

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

OIDC_CLIENT_ID = os.environ.get(
    "OIDC_CLIENT_ID") if os.environ.get("OIDC_CLIENT_ID") else None
OIDC_CLIENT_SECRET = os.environ.get(
    "OIDC_CLIENT_SECRET") if os.environ.get("OIDC_CLIENT_SECRET") else None
OIDC_REDIRECT_MAIN_PAGE = os.environ.get(
    "OIDC_REDIRECT_MAIN_PAGE") if os.environ.get("OIDC_REDIRECT_MAIN_PAGE") else "http://127.0.0.1:3000"
OIDC_AUTH_PATH = os.environ.get(
    "OIDC_AUTH_PATH") if os.environ.get("OIDC_AUTH_PATH") else None
OIDC_AUTH_TOKEN = os.environ.get(
    "OIDC_AUTH_TOKEN") if os.environ.get("OIDC_AUTH_TOKEN") else None
OIDC_AUTH_REDIRECT = os.environ.get(
    "OIDC_AUTH_REDIRECT") if os.environ.get("OIDC_AUTH_REDIRECT") else "http://127.0.0.1:5000/api/oidc-redirect"
OIDC_USER_INFO = os.environ.get(
    "OIDC_USER_INFO") if os.environ.get("OIDC_USER_INFO") else None
OIDC_USER_NEEDS_VERIFICATION = os.environ.get(
    "OIDC_USER_NEEDS_VERIFICATION") == "true" if os.environ.get("OIDC_USER_NEEDS_VERIFICATION") else True

CURRENT_VERSION = 1

pretix_url = os.environ.get("PRETIX_URL") if os.environ.get(
    "PRETIX_URL") else None
pretix_checkin_list_id = os.environ.get("PRETIX_CHECKIN_LIST_ID") if os.environ.get(
    "PRETIX_CHECKIN_LIST_ID") else None
pretix_organizer = os.environ.get("PRETIX_ORGANIZER") if os.environ.get(
    "PRETIX_ORGANIZER") else None
pretix_event = os.environ.get("PRETIX_EVENT") if os.environ.get(
    "PRETIX_EVENT") else None
pretix_api_token = os.environ.get("PRETIX_API_TOKEN") if os.environ.get(
    "PRETIX_API_TOKEN") else None


tempfile_path = "tempfiles"
backup_file_name = "backup.json"

os.environ['TZ'] = 'Europe/Berlin'
time.tzset()


def set_cookies(response: Response, cookieMemberID, cookieToken, is_Admin):
    if cookieMemberID and cookieToken:
        response.set_cookie(f"{auth_cookie_memberID}memberID", str(cookieMemberID),
                            max_age=cookie_expire, samesite='Strict', secure=not logging_enabled)
        response.set_cookie(f"{auth_cookie_memberID}token", cookieToken,
                            max_age=cookie_expire, samesite='Strict', secure=not logging_enabled)
        response.set_cookie(f"{auth_cookie_memberID}isAdmin", str(is_Admin),
                            max_age=cookie_expire, samesite='Strict', secure=not logging_enabled)


def build_response(message: object, code: int = 200, type: str = "application/json", cookieMemberID=None, cookieToken=None, is_Admin=False):
    """
    Build a flask response, default is json format
    """
    r = Response(response=json.dumps(message), status=code, mimetype=type)
    set_cookies(r, cookieMemberID, cookieToken, is_Admin)

    return r


def log(prefix, message):
    if logging_enabled:
        time = datetime.datetime.now().strftime("%x %X")
        output_string = f"[{time}] {prefix} -> {message}"
        with open("log.txt", 'a+') as f:
            f.write(f"{output_string}\n")


def get_oidc_token(token_url, code, redirect_uri):
    client_auth = requests.auth.HTTPBasicAuth(
        OIDC_CLIENT_ID, OIDC_CLIENT_SECRET)
    post_data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri
    }
    response = requests.post(token_url, auth=client_auth, data=post_data)
    token_json = response.json()
    return token_json["access_token"]


def get_user_info(access_token, resource_url):
    headers = {'Authorization': 'Bearer ' + access_token}
    response = requests.get(resource_url, headers=headers)
    return response.json()


checkout_mail_text = """Hallo {name},
eine Getränkelisten abrechnung wurde durchgeführt, wir möchten dich hiermit über deinen aktuellen Kontostand informieren.
Aktuell hast du ein Guthaben von {balance}€.

Viele Grüße
"""

money_request_mail_test = """Hallo {name},
{requester} möchte eine Ausgabe von {money}€ mit dir teilen, gehe jetzt auf {url} um die Zahlung zu bestätigen.
"""
