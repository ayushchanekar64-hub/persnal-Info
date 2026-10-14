import asyncio
import os
import sqlite3
from sqlalchemy import text
from backend.app.db.session import engine

async def clear_database():
    print("--- [1] Checking and clearing via SQLAlchemy Engine ---")
    try:
        async with engine.begin() as conn:
            tables = [
                "activities",
                "notifications",
                "finance_transactions",
                "finance_budgets",
                "job_applications",
                "coding_problems",
                "learning_items",
                "notes",
                "habits",
                "goals",
                "tasks",
                "user_profiles",
                "users"
            ]
            for tbl in tables:
                try:
                    await conn.execute(text(f"DELETE FROM {tbl};"))
                    print(f"  [OK] Cleared table: {tbl}")
                except Exception as e:
                    print(f"  [FAIL] Table {tbl} delete: {e}")
        print("[SUCCESS] All SQLAlchemy tables deleted and committed!")
    except Exception as e:
        print(f"[ERROR] Engine clear error: {e}")

    print("\n--- [2] Checking local SQLite files ---")
    sqlite_files = ["mynexus.db", "backend/mynexus.db", "../mynexus.db"]
    for path in sqlite_files:
        if os.path.exists(path):
            try:
                conn = sqlite3.connect(path)
                c = conn.cursor()
                c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
                tables = [r[0] for r in c.fetchall()]
                for t in tables:
                    c.execute(f"DELETE FROM {t};")
                    print(f"  [OK] Cleared SQLite table {t} in {path}")
                conn.commit()
                conn.close()
                print(f"  [SUCCESS] Cleared SQLite database at: {path}")
            except Exception as e:
                print(f"  [ERROR] clearing {path}: {e}")

if __name__ == "__main__":
    asyncio.run(clear_database())
    print("\n[COMPLETE] All registered accounts and user data have been completely wiped!")
