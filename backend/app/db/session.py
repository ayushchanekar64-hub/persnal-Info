import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy import text, event
from backend.app.core.config import settings
from backend.app.db.base import Base

logger = logging.getLogger("mynexus.db")

def get_normalized_db_url(url: str) -> str:
    if not url:
        return settings.FALLBACK_DATABASE_URL
    # Render and Heroku provide postgres:// or postgresql:// instead of postgresql+asyncpg://
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


def _configure_sqlite_pragmas(db_engine):
    if "sqlite" not in str(db_engine.url):
        return

    @event.listens_for(db_engine.sync_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA temp_store=MEMORY")
        cursor.execute("PRAGMA cache_size=-16000")
        cursor.close()


# Primary Engine
primary_db_url = get_normalized_db_url(settings.DATABASE_URL)
try:
    is_sqlite = "sqlite" in primary_db_url
    connect_args = {} if is_sqlite else {"timeout": 10}
    engine = create_async_engine(
        primary_db_url,
        echo=False,
        future=True,
        pool_pre_ping=True,
        connect_args=connect_args
    )
    _configure_sqlite_pragmas(engine)
except Exception as e:
    logger.warning(f"Failed to create primary engine with {primary_db_url}: {e}")
    engine = create_async_engine(
        settings.FALLBACK_DATABASE_URL,
        echo=False,
        future=True,
    )
    _configure_sqlite_pragmas(engine)

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


async def _apply_sqlite_tuning(conn):
    if "sqlite" in str(conn.engine.url):
        await conn.execute(text("PRAGMA journal_mode=WAL"))
        await conn.execute(text("PRAGMA synchronous=NORMAL"))
        await conn.execute(text("PRAGMA temp_store=MEMORY"))


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
            await _apply_sqlite_tuning(conn)
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
        _configure_sqlite_pragmas(engine)
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )
        async with engine.begin() as conn:
            await _apply_sqlite_tuning(conn)
            await conn.run_sync(Base.metadata.create_all)
            await _auto_migrate(conn)
        logger.info("Fallback database initialized successfully.")
