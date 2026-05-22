from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    ALLOWED_ORIGINS: List[str] = ["*"]

    # AI
    GROQ_API_KEY: str
    GROQ_MODEL: str
    TAVILY_API_KEY: str

    # Database
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    POOL_SIZE: int = 10
    MAX_OVERFLOW: int = 20

    @property
    def DATABASE_URL(self) -> str:
        # async driver for the app
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def DATABASE_SYNC_URL(self) -> str:
        # sync driver for alembic migrations only
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str
    JWT_EXPIRE_HOURS: int

    # Redis — optional, app works without it (caching skipped)
    REDIS_URL: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()
