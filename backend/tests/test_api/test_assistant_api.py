from httpx import AsyncClient
import pytest

from tests.helpers import get_categories, get_assistants


@pytest.mark.asyncio
async def test_create_assistant(client: AsyncClient, admin_token):
    category = await client.post(
        "/api/admin/category/create",
        json={
            "name": "test_category1",
            "description": "test_description1"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    data = category.json()
    
    response = await client.post(
        "/api/admin/create/assistant",
        json={
            "name": "test_assistant1",
            "description": "test_description1",
            "model": "test_model1",
            "system_prompt": "test_system_prompt1",
            "example_prompt": "test_example_prompt1",
            "category_id": data.get("id")
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "test_assistant1"
    assert data["description"] == "test_description1"


@pytest.mark.asyncio
async def test_create_assistant_by_user(client: AsyncClient, user_token, admin_token):
    category = await client.post(
        "/api/admin/category/create",
        json={
            "name": "test_category2",
            "description": "test_description2"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    data = category.json()

    response = await client.post(
        "/api/admin/create/assistant",
        json={
            "name": "test_assistant2",
            "description": "test_description2",
            "model": "test_model2",
            "system_prompt": "test_system_prompt2",
            "example_prompt": "test_example_prompt2",
            "category_id": data.get("id")
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_assistant_with_wrong_category(client: AsyncClient, admin_token):
    response = await client.post(
        "/api/admin/create/assistant",
        json={
            "name": "test_assistant3",
            "description": "test_description3",
            "model": "test_model3",
            "system_prompt": "test_system_prompt3",
            "example_prompt": "test_example_prompt3",
            "category_id": "00000000-0000-0000-0000-000000000000"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_assistants(client: AsyncClient, user_token):
    response = await client.get(
        "/api/assistants",
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) > 0


@pytest.mark.asyncio
async def test_get_assistants_by_category(client: AsyncClient, admin_token):
    category_id = await get_categories(client, admin_token)

    assert category_id is not None  
 
    response = await client.get(
        f"/api/assistant/category/{category_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) > 0


@pytest.mark.asyncio
async def test_search_assistant_by_name(client: AsyncClient, user_token):
    assistant_name = "test_assistant1"

    response = await client.get(
        f"/api/assistant/search/{assistant_name}",
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) > 0


@pytest.mark.asyncio
async def test_get_assistant_by_id(client: AsyncClient, user_token):
    assistant_id = await get_assistants(client, user_token)

    assert assistant_id is not None

    response = await client.get(
        f"/api/assistant/{assistant_id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == assistant_id


@pytest.mark.asyncio
async def test_get_assistant_by_wrong_id(client: AsyncClient, user_token):
    response = await client.get(
        f"/api/assistant/00000000-0000-0000-0000-000000000000",
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_assistant(client: AsyncClient, admin_token):
    category = await client.post(
        "/api/admin/category/create",
        json={
            "name": "test_category3",
            "description": "test_description3"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    data = category.json()

    assistant_id = await get_assistants(client, admin_token)

    assert assistant_id is not None

    response = await client.put(
        f"/api/admin/update/assistant/{assistant_id}",
        json={
            "name": "updated_test_assistant",
            "description": "updated_test_description",
            "model": "updated_test_model",
            "system_prompt": "updated_test_system_prompt",
            "example_prompt": "updated_test_example_prompt",
            "category_id": data.get("id")
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "updated_test_assistant"
    assert data["description"] == "updated_test_description"


@pytest.mark.asyncio
async def test_update_assistant_with_wrong_category(client: AsyncClient, admin_token):
    assistant_id = await get_assistants(client, admin_token)

    assert assistant_id is not None

    response = await client.put(
        f"/api/admin/update/assistant/{assistant_id}",
        json={
            "name": "updated_test_assistant2",
            "description": "updated_test_description2",
            "model": "updated_test_model2",
            "system_prompt": "updated_test_system_prompt2",
            "example_prompt": "updated_test_example_prompt2",
            "category_id": "00000000-0000-0000-0000-000000000000"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_assistant_by_wrong_id(client: AsyncClient, admin_token):
    category = await client.post(
        "/api/admin/category/create",
        json={
            "name": "test_category4",
            "description": "test_description4"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    data = category.json()

    response = await client.put(
        f"/api/admin/update/assistant/00000000-0000-0000-0000-000000000000",
        json={
            "name": "updated_test_assistant3",
            "description": "updated_test_description3",
            "model": "updated_test_model3",
            "system_prompt": "updated_test_system_prompt3",
            "example_prompt": "updated_test_example_prompt3",
            "category_id": data.get("id")
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 404
