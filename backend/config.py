import os, json, base64
from pydantic import BaseModel
from typing import List

class Settings(BaseModel):
    JWT_PUBLIC_KEY_BASE64: str = os.getenv("JWT_PUBLIC_KEY_BASE64","")
    JWT_ALG: str = os.getenv("JWT_ALG", "RS256")
    AUTH_HEADER: str = os.getenv("AUTH_HEADER","Authorization")
    WALLET_BASE_URL: str = os.getenv("WALLET_BASE_URL","http://localhost:8000")
    WALLET_BAL_URL: str = os.getenv("WALLET_BAL_URL","/wallet/balance")
    WALLET_BET_URL: str = os.getenv("WALLET_BET_URL","/wallet/bet")
    WALLET_CREDIT_URL: str = os.getenv("WALLET_CREDIT_URL","/wallet/credit")
    SQLALCHEMY_DATABASE_URI: str = os.getenv("SQLALCHEMY_DATABASE_URI","sqlite+aiosqlite:///./casino.db")
    CORS_ORIGINS: List[str] = json.loads(os.getenv("CORS_ORIGINS",'["http://localhost:5173"]'))

settings = Settings()
