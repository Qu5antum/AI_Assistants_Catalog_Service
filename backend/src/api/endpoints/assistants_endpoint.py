from fastapi import APIRouter, Depends
from uuid import UUID

from src.database.db import AsyncSession, get_session
from src.database.models import User, UserRole
from src.api.dependencies.require_role_dependency import require_roles
from src.services.assistant_service import AssistantService
from src.api.schemas.assistant_schema import CreateAssitant, UpdateAssistant


assistant_route = APIRouter(
    prefix="/api",
    tags=["Assistants"]
)


async def get_assistant_service(session: AsyncSession = Depends(get_session)):
    return AssistantService(session=session)


@assistant_route.post("/admin/create/assistant", status_code=201)
async def create_assistant(
    assistant: CreateAssitant,
    user: User = Depends(require_roles(UserRole.ADMIN)),
    assistant_service: AssistantService = Depends(get_assistant_service)
):
    return await assistant_service.create_assistant(assistant=assistant)


@assistant_route.get("/assistants", status_code=200)
async def get_all_assistants(
    user: User = Depends(require_roles(UserRole.ADMIN, UserRole.USER)),
    assistant_service: AssistantService = Depends(get_assistant_service)
):
    return await assistant_service.get_all_assistants(user=user)


@assistant_route.get("/assistant/category/{category_id}", status_code=200)
async def get_assistant_by_category_id(
    category_id: UUID,
    user: User = Depends(require_roles(UserRole.ADMIN, UserRole.USER)),
    assistant_service: AssistantService = Depends(get_assistant_service)
):
    return await assistant_service.filter_assistant_by_category(category_id=category_id, user=user)


@assistant_route.get("/assistant/search/{name}", status_code=200)
async def search_assistant(
    assistant_name: str,
    user: User = Depends(require_roles(UserRole.ADMIN, UserRole.USER)),
    assistant_service: AssistantService = Depends(get_assistant_service)
):
    return await assistant_service.search_assistant_by_name(assistant_name=assistant_name, user=user)


@assistant_route.get("/assistant/{assistant_id}", status_code=200)
async def get_assistant(
    assistant_id: UUID,
    user: User = Depends(require_roles(UserRole.ADMIN, UserRole.USER)),
    assistant_service: AssistantService = Depends(get_assistant_service)
):
    return await assistant_service.get_assistant_with_id(assistant_id=assistant_id, user=user)


@assistant_route.put("/admin/update/assistant/{assistant_id}", status_code=201)
async def update_assistant(
    assistant_id: UUID,
    assistant_update: UpdateAssistant,
    user: User = Depends(require_roles(UserRole.ADMIN)),
    assistant_service: AssistantService = Depends(get_assistant_service)
):
    return await assistant_service.update_assistant_by_id(assistant_id=assistant_id, assistant_update=assistant_update)