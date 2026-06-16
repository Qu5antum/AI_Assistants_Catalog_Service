from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from typing import AsyncGenerator

from src.core.config import settings

engine = create_async_engine(settings.URL_DATABASE, echo=False)
Base = declarative_base()
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

"""async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)"""

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session