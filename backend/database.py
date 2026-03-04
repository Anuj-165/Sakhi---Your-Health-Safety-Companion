# backend/models/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ----------------------------
# Database credentials


# ----------------------------
# Database URL
# ----------------------------
DATABASE_URL = "postgresql://anujpu:anuj165@localhost:5432/sakhi_db"


# ----------------------------
# Base class for models
# ----------------------------
Base = declarative_base()

# ----------------------------
# Engine
# ----------------------------
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# ----------------------------
# Session factory
# ----------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ----------------------------
# Dependency for FastAPI endpoints
# ----------------------------
def get_db():
    """
    Provides a database session to FastAPI endpoints.
    Usage: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
