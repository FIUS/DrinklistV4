from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
if os.environ.get("DB_CONNECTION"):
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DB_CONNECTION")
else:
    os.makedirs("instance/sqlite", exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sqlite/database.db'

sql_database = SQLAlchemy(app)
