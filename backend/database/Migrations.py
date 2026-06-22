from flask_sqlalchemy import SQLAlchemy
from database.Models import *
from sqlalchemy.orm import session
from sqlalchemy import text
import util


def migrate(db: session):
    try:
        current_db_version: KeyValue = db.query(KeyValue).filter_by(
            key="version").first()
        print("Current database version:", current_db_version.value)
    except:
        return False

    migrations = [
        # Add lists for migrations
        # E.g ALTER TABLE drink ADD column price6 float DEFAULT 50
        ["ALTER TABLE member ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;",
            "UPDATE member SET is_admin = FALSE;"],
        ["ALTER TABLE drink ADD COLUMN sorting_index INTEGER DEFAULT 0;",
            "UPDATE drink SET sorting_index = 0;"],
        [
            "UPDATE key_value SET value = CAST(CAST(COALESCE((SELECT ROUND(balance) FROM member WHERE id = 1), 0) AS INTEGER) AS VARCHAR) WHERE key = 'config_state';",
            "INSERT INTO key_value (key, value) SELECT 'config_state', CAST(CAST(COALESCE((SELECT ROUND(balance) FROM member WHERE id = 1), 0) AS INTEGER) AS VARCHAR) WHERE NOT EXISTS (SELECT 1 FROM key_value WHERE key = 'config_state');",
            "ALTER TABLE member ADD COLUMN balance_cents INTEGER DEFAULT 0;",
            "UPDATE member SET balance_cents = CASE WHEN id = 1 THEN 0 WHEN balance IS NULL THEN NULL ELSE CAST(ROUND(balance * 100) AS INTEGER) END;",
            "ALTER TABLE drink ADD COLUMN price_cents INTEGER DEFAULT 0;",
            "UPDATE drink SET price_cents = CASE WHEN price IS NULL THEN NULL ELSE CAST(ROUND(price * 100) AS INTEGER) END;",
            "ALTER TABLE \"transaction\" ADD COLUMN amount_cents INTEGER;",
            "UPDATE \"transaction\" SET amount_cents = CASE WHEN amount IS NULL THEN NULL ELSE CAST(ROUND(amount * 100) AS INTEGER) END;",
            "ALTER TABLE checkout ADD COLUMN current_cash_cents INTEGER;",
            "UPDATE checkout SET current_cash_cents = CASE WHEN current_cash IS NULL THEN NULL ELSE CAST(ROUND(current_cash * 100) AS INTEGER) END;"
        ],
        [
            "ALTER TABLE member DROP COLUMN balance;",
            "ALTER TABLE member RENAME COLUMN balance_cents TO balance;",
            "ALTER TABLE drink DROP COLUMN price;",
            "ALTER TABLE drink RENAME COLUMN price_cents TO price;",
            "ALTER TABLE \"transaction\" DROP COLUMN amount;",
            "ALTER TABLE \"transaction\" RENAME COLUMN amount_cents TO amount;",
            "ALTER TABLE checkout DROP COLUMN current_cash;",
            "ALTER TABLE checkout RENAME COLUMN current_cash_cents TO current_cash;"
        ]
    ]

    if util.CURRENT_VERSION != len(migrations):
        print("Error: No migration available")
        exit()

    start_version = int(current_db_version.value)

    for migration in migrations[start_version:]:
        print("Migrating from", current_db_version.value,
              "to", int(current_db_version.value)+1)
        for statement in migration:
            db.execute(text(statement))
        current_db_version.value = int(current_db_version.value)+1
        db.commit()

    print("Migrations complete")

    return True
