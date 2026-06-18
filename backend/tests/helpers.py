from httpx import AsyncClient
import uuid


# get user token
async def get_token(client: AsyncClient, role: str):
    email = f"{uuid.uuid4()}@test.com"

    await client.post("/api/user/register", json={
        "email": email,
        "password": "123",
        "role": role,
    })

    login = await client.post("/api/user/login", data={
        "username": email,
        "password": "123"
    })

    return login.json()["access_token"]


async def create_category(client: AsyncClient, token: str):
    response = await client.post(
        "/api/admin/category/create",
        json={
            "name": "Sport",
            "description": "Sport description"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    data = response.json()

    return data.get("id")

async def get_categories(client: AsyncClient, token: str):
    response = await client.get(
        "/api/categories",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    data = response.json()

    return data[0].get("id") if data else None

async def create_assistant(client: AsyncClient, token: str):
    category_id = await create_category(client=client, token=token)

    response = await client.post(
        "/api/admin/create/assistant",
        json={
            {
                "name": "test_assistant1",
                "description": "test_description1",
                "model": "test_model1",
                "system_prompt": "test_system_prompt1",
                "example_prompt": "test_example_prompt1",
                "category_id": category_id
            }
        }
    )
    
    data = response.json()

    return data.get("id")


async def get_assistants(client: AsyncClient, token: str):
    response = await client.get(
        "/api/assistants",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    data = response.json()

    return data[0].get("id") if data else None
    
