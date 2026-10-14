"""
Script to clear all registered user accounts and associated records from mynexus.db
"""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "mynexus.db")

def clear_all_data():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"Found tables: {tables}")
    
    for table in tables:
        cursor.execute(f"DELETE FROM {table};")
        print(f"Cleared table: {table}")
        
    conn.commit()
    conn.close()
    print("\n[SUCCESS] All registered email/user data has been completely cleared from the database!")

if __name__ == "__main__":
    clear_all_data()
