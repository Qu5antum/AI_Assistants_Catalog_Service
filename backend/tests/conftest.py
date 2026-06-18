from typing import AsyncGenerator
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from src.database.db import get_session
from src.database.models import Base
from src.main import app

from tests.helpers import get_token


engine = create_async_engine(
    url="sqlite+aiosqlite:///./test.db"
)

new_session = async_sessionmaker(bind=engine, expire_on_commit=False)


async def get_test_session() -> AsyncGenerator[AsyncSession, None]:
    async with new_session() as session:
        yield session

app.dependency_overrides[get_session] = get_test_session

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)

@pytest_asyncio.fixture(scope="session")
async def client(setup_db) -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def admin_token(client):
    return await get_token(client, "admin")

@pytest_asyncio.fixture
async def user_token(client):
    return await get_token(client, "user")
