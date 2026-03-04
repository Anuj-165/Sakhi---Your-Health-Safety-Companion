from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func,Date
from sqlalchemy.orm import declarative_base, relationship
from database import Base
from datetime import date, datetime




class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Relationship to UserQuery
    queries = relationship("UserQuery", back_populates="user", cascade="all, delete-orphan")
    period_cycles = relationship("PeriodCycle", back_populates="user", cascade="all, delete-orphan")



class UserQuery(Base):
    __tablename__ = "user_queries"
    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(String, nullable=False)
    answer_text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

   
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="queries")

class PeriodCycle(Base):
    __tablename__ = "period_cycles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="period_cycles")

    last_period_date = Column(Date, nullable=False)
    cycle_length = Column(Integer, nullable=True)
    next_period_date = Column(Date, nullable=True)
    ovulation_date = Column(Date, nullable=True)
    symptoms = Column(String, nullable=True)  # comma-separated symptoms

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
