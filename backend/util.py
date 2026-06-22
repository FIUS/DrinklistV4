from flask import Response
import base64
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
import hashlib
import json
import os
import datetime
import time
import requests


def euro_to_cents(value):
    if value is None:
        return None
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError("Invalid euro amount")
    return int((amount * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def parse_cents(value):
    if value is None or isinstance(value, bool):
        raise ValueError("Invalid cent amount")
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        if value.is_integer():
            return int(value)
        raise ValueError("Cent amount must be an integer")
    if isinstance(value, str):
        stripped = value.strip()
        if stripped == "":
            raise ValueError("Cent amount must not be empty")
        try:
            decimal_value = Decimal(stripped)
        except InvalidOperation:
            raise ValueError("Invalid cent amount")
        if decimal_value != decimal_value.to_integral_value():
            raise ValueError("Cent amount must be an integer")
        return int(decimal_value)
    raise ValueError("Invalid cent amount")


def cents_to_euros(cents):
    if cents is None:
        return None
    return Decimal(int(cents)) / Decimal("100")


def format_cents(cents, decimal_separator="."):
    formatted = f"{cents_to_euros(cents):.2f}"
    return formatted.replace(".", decimal_separator)

cookie_expire = int(os.environ.get("COOKIE_EXPIRE_TIME")) * \
    60*60 if os.environ.get("COOKIE_EXPIRE_TIME") else 60**3
domain = os.environ.get("DOMAIN") if os.environ.get(
    "DOMAIN") else "127.0.0.1:3000"
logging_enabled = os.environ.get(
    "DEBUG") == "true" if os.environ.get("DEBUG") else False
event_mode_enabled = os.environ.get(
    "EVENT_MODE") == "true" if os.environ.get("EVENT_MODE") else False

token = os.environ.get("X_AUTH_TOKEN")
old_domain = os.environ.get("OLD_DOMAIN")

event_secret_key = os.environ.get("EVENT_SECRET_KEY") if os.environ.get(
    "EVENT_SECRET_KEY") else "default_unsafe_event_secret"
event_secret_length = int(os.environ.get(
    "EVENT_SECRET_LENGTH")) if os.environ.get("EVENT_SECRET_LENGTH") else 16

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

CURRENT_VERSION = 4

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

low_balance_threshold = euro_to_cents(os.environ.get(
    "LOW_BALANCE_THRESHOLD")) if os.environ.get("LOW_BALANCE_THRESHOLD") else None
low_balance_transfer_name = os.environ.get(
    "LOW_BALANCE_TRANSFER_NAME") if os.environ.get("LOW_BALANCE_TRANSFER_NAME") else None
low_balance_transfer_iban = os.environ.get(
    "LOW_BALANCE_TRANSFER_IBAN") if os.environ.get("LOW_BALANCE_TRANSFER_IBAN") else None
low_balance_transfer_bic = os.environ.get(
    "LOW_BALANCE_TRANSFER_BIC") if os.environ.get("LOW_BALANCE_TRANSFER_BIC") else None
low_balance_paypal_me = os.environ.get(
    "LOW_BALANCE_PAYPAL_ME") if os.environ.get("LOW_BALANCE_PAYPAL_ME") else None


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


def build_low_balance_epc_qr_text(amount_cents: int, member_name: str, member_id: int):
    if low_balance_transfer_name is None or low_balance_transfer_iban is None or low_balance_transfer_bic is None:
        return None

    remittance = f"Drinklist {member_name} - {member_id}"
    amount_str = format_cents(amount_cents)
    lines = [
        "BCD",
        "001",
        "1",
        "SCT",
        low_balance_transfer_bic,
        low_balance_transfer_name,
        low_balance_transfer_iban,
        f"EUR{amount_str}",
        "",
        remittance,
        "",
    ]
    return "\n".join(lines)


def build_low_balance_paypal_qr_text(amount_cents: int):
    if low_balance_paypal_me is None:
        return None

    username = low_balance_paypal_me.strip()
    if username == "":
        return None

    if "paypal.me" in username:
        username = username.rstrip("/").split("/")[-1]

    amount_str = format_cents(amount_cents, decimal_separator=",")
    return f"https://paypal.me/{username}/{amount_str}"


def get_event_secret_for_date(date: datetime.date = None):
    if date is None:
        date = datetime.date.today()

    date_str = date.strftime("%Y-%m-%d")
    digest = hashlib.sha256(
        f"{event_secret_key}|{date_str}".encode("utf-8")
    ).digest()
    encoded = base64.b32encode(digest).decode("ascii").lower()
    return encoded[:event_secret_length]


def get_event_secret_candidates():
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)
    return [
        get_event_secret_for_date(today),
        #get_event_secret_for_date(yesterday)
    ]


def is_event_secret_valid(secret):
    if secret is None:
        return False
    secret = str(secret).strip()
    if secret == "":
        return False
    return secret in get_event_secret_candidates()


checkout_mail_text = """Hallo {name},
eine Getränkelisten abrechnung wurde durchgeführt, wir möchten dich hiermit über deinen aktuellen Kontostand informieren.
Aktuell hast du ein Guthaben von {balance}€.

Viele Grüße
"""

money_request_mail_test = """Hallo {name},
{requester} möchte eine Ausgabe von {money}€ mit dir teilen, gehe jetzt auf {url} um die Zahlung zu bestätigen.
"""
