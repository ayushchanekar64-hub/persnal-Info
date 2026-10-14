import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from backend.app.core.config import settings
from backend.app.db.base import Base

logger = logging.getLogger("mynexus.db")

# Primary Engine
try:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
        pool_pre_ping=True,
        connect_args={"timeout": 2}
    )
except Exception as e:
    logger.warning(f"Failed to create primary engine with {settings.DATABASE_URL}: {e}")
    engine = create_async_engine(
        settings.FALLBACK_DATABASE_URL,
        echo=False,
        future=True,
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


from sqlalchemy import text

async def _auto_migrate(conn):
    is_postgres = "postgres" in str(conn.engine.url)
    date_type = "TIMESTAMP" if is_postgres else "DATETIME"

    columns_to_add = [
        ("tasks", "estimated_time", "VARCHAR(50)"),
        ("goals", "target_date", "VARCHAR(100)"),
        ("learning_items", "learning_date", "VARCHAR(50)"),
        ("learning_items", "duration", "VARCHAR(50)"),
        ("learning_items", "notes", "TEXT"),
        ("coding_problems", "time_taken", "VARCHAR(50)"),
        ("coding_problems", "solution_notes", "TEXT"),
        ("coding_problems", "mistake_learning", "TEXT"),
        ("users", "phone", "VARCHAR(50)"),
        ("users", "two_factor_enabled", "BOOLEAN DEFAULT TRUE"),
        ("users", "recovery_pin_hash", "VARCHAR(255)"),
        ("users", "recovery_attempts", "INTEGER DEFAULT 0"),
        ("users", "recovery_locked_until", date_type),
        ("users", "failed_login_attempts", "INTEGER DEFAULT 0"),
        ("users", "login_locked_until", date_type),
        ("users", "token_version", "INTEGER DEFAULT 1"),
    ]
    for table, col, col_type in columns_to_add:
        try:
            if is_postgres:
                await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {col_type}"))
            else:
                res = await conn.execute(text(f"PRAGMA table_info({table})"))
                existing_cols = [row[1] for row in res.fetchall()]
                if col not in existing_cols:
                    await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
        except Exception as e:
            logger.warning(f"Auto-migration skipped for {table}.{col}: {e}")


async def init_db():
    global engine, AsyncSessionLocal
    # Test connection and initialize tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await _auto_migrate(conn)
        logger.info("Database initialized successfully with primary engine.")
    except Exception as err:
        logger.warning(
            f"Primary database connection failed ({err}). Falling back to local storage: {settings.FALLBACK_DATABASE_URL}"
        )
        engine = create_async_engine(
            settings.FALLBACK_DATABASE_URL,
            echo=False,
            future=True,
        )
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await _auto_migrate(conn)
        logger.info("Fallback database initialized successfully.")

