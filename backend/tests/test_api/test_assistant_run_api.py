from httpx import AsyncClient
import pytest

from tests.helpers import get_assistants


@pytest.mark.asyncio
async def test_run_assistant(client: AsyncClient, user_token, admin_token):
    assistant_id = await get_assistants(client=client, token=admin_token)

    response = await client.post(
        f"/api/assistants/{assistant_id}/run",
        json={
            "user_prompt": "hello"
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 201

    data = response.json()

    assert data["status"] == "success"


@pytest.mark.asyncio
async def test_run_assistant_with_wrong_assistant_id(client: AsyncClient, user_token, admin_token):
    response = await client.post(
        f"/api/assistants/00000000-0000-0000-0000-000000000000/run",
        json={
            "user_prompt": "hello"
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_run_assistant_failed(client: AsyncClient, user_token, admin_token):
    assistant_id = await get_assistants(client=client, token=admin_token)

    response = await client.post(
        f"/api/assistants/{assistant_id}/run",
        json={
            "user_prompt": ""
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 201

    data = response.json()

    assert data["status"] == "failed"


@pytest.mark.asyncio
async def test_user_runs(client: AsyncClient, user_token, admin_token):
    assistant_id = await get_assistants(client=client, token=admin_token)

    run = await client.post(
        f"/api/assistants/{assistant_id}/run",
        json={
            "user_prompt": "hi"
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert run is not None

    response = await client.get(
        "/api/runs/my",
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) > 0


@pytest.mark.asyncio
async def test_admin_runs(client: AsyncClient, admin_token):
    assistant_id = await get_assistants(client=client, token=admin_token)

    run = await client.post(
        f"/api/assistants/{assistant_id}/run",
        json={
            "user_prompt": "hi"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert run is not None

    response = await client.get(
        "/api/admin/runs",
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) > 0


@pytest.mark.asyncio
async def test_admin_runs_with_regular_user(client: AsyncClient, user_token, admin_token):
    assistant_id = await get_assistants(client=client, token=admin_token)

    run = await client.post(
        f"/api/assistants/{assistant_id}/run",
        json={
            "user_prompt": "hi1"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert run is not None

    response = await client.get(
        "/api/admin/runs",
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 403