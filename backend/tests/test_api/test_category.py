from httpx import AsyncClient
import pytest

from tests.helpers import create_category


@pytest.mark.asyncio
async def test_create_category(client: AsyncClient, admin_token):
    response = await client.post(
        "/api/admin/category/create",
        json={
            "name": "Food",
            "description": "Food description"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Food"


@pytest.mark.asyncio
async def test_create_category_by_regular_user(client: AsyncClient, user_token):
    response = await client.post(
        "/api/admin/category/create",
        json={
            "name": "Food",
            "description": "Food description"
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_categories(client: AsyncClient, user_token, admin_token):
    category = await create_category(client=client, token=admin_token)

    assert category is not None

    response = await client.get(
        "/api/categories",
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 200
