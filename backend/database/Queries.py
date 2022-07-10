from authenticator import TokenManager
import util
from datetime import datetime, timedelta
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import session
from sqlalchemy.sql import func
from database.Models import *

from typing import List
import constants


class Queries:
    def __init__(self, db):

        self.db: SQLAlchemy = db
        self.session: session.Session = self.db.session
        self.db.create_all()
        if self.session.query(Member).first() is None:
            self.create_dummy_data()

    def create_dummy_data(self) -> None:
        hashedPassword, salt = TokenManager.hashPassword("unsafe")
        self.session.add(
            Member(name="admin", password=hashedPassword, salt=salt))
        self.session.commit()
