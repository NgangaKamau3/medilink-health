import mysql.connector
from mysql.connector import Error
import os
from typing import Optional

class DatabaseConnection:
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.database = os.getenv('DB_NAME', 'hospital')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '')
        self.port = int(os.getenv('DB_PORT', '3306'))
        self.connection = None

    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                database=self.database,
                user=self.user,
                password=self.password,
                port=self.port,
                autocommit=True
            )
            return self.connection
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            return None

    def disconnect(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()

    def execute_query(self, query: str, params: tuple = None):
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(query, params)
            return cursor.fetchall()
        except Error as e:
            print(f"Error executing query: {e}")
            return None

    def execute_insert(self, query: str, params: tuple = None):
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, params)
            return cursor.lastrowid
        except Error as e:
            print(f"Error executing insert: {e}")
            return None

def get_db_connection():
    db = DatabaseConnection()
    connection = db.connect()
    if not connection:
        raise Exception("Database connection failed")
    try:
        yield db
    finally:
        db.disconnect()