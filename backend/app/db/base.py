from datetime import datetime, timezone
from sqlalchemy.orm import declarative_base

Base = declarative_base()


def utc_now(context=None):
    """Return timezone-naive UTC datetime compatible with PostgreSQL TIMESTAMP WITHOUT TIME ZONE and SQLite."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
