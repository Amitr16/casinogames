from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Float, Integer, JSON, DateTime
from datetime import datetime, timezone

class Base(DeclarativeBase):
    pass

class GameConfig(Base):
    __tablename__ = "game_config"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    game_key: Mapped[str] = mapped_column(String(50), index=True, unique=True)
    target_rtp: Mapped[float] = mapped_column(Float, default=0.96)
    volatility: Mapped[float] = mapped_column(Float, default=1.0)
    min_bet: Mapped[float] = mapped_column(Float, default=1.0)
    max_bet: Mapped[float] = mapped_column(Float, default=1000.0)
    meta_json: Mapped[dict] = mapped_column(JSON, default={})
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class GameRound(Base):
    __tablename__ = "game_round"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    game_key: Mapped[str] = mapped_column(String(50), index=True)
    user_id: Mapped[str] = mapped_column(String(120), index=True)
    stake: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    result_json: Mapped[dict] = mapped_column(JSON, default={})
    payout: Mapped[float] = mapped_column(Float, default=0.0)
    ref: Mapped[str] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
