from httpx import AsyncClient
import pytest

@pytest.mark.asyncio
async def test_dummyLogin(client: AsyncClient):
    response = await client.post(
        "/api/user/dummyLogin",
        json={"role": "admin"}
    )

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"

    assert response.status_code == 201


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post(
        "/api/user/register",
        json={
            "email": "test@example.com",
            "password": "123",
            "role": "admin",
        }
    )

    assert "detail" in response.json()
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_duplicate_register(client: AsyncClient):
    json = {
        "email": "test@example.com",
        "password": "123",
        "role": "admin",
    }
    await client.post("/api/user/register", json=json)
    response = await client.post("/api/user/register", json=json)

    assert response.status_code != 201


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post(
        "/api/user/register",
        json = {
            "email": "test@example.com",
            "password": "123",
            "role": "admin",
        }
    )

    response = await client.post(
        "/api/user/login",
        data = {
            "username": "test@example.com",
            "password": "123"
        }
    )

    data = response.json()

    assert "access_token" in data
    assert "refresh_token" in data
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_wrong_password(client: AsyncClient):
    await client.post(
        "/api/user/register",
        json = {
            "email": "test@example.com",
            "password": "123",
            "role": "admin",
        }
    )

    response = await client.post(
        "/api/user/login",
        json = {
            "username": "test@example.com",
            "password": "r23424"
        }
    )

    assert response.status_code != 201