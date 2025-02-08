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
            "UPDATE member SET is_admin = FALSE;"]
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
