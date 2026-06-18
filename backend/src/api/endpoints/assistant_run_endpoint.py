from fastapi import APIRouter, Depends
from uuid import UUID

from src.database.db import AsyncSession, get_session
from src.database.models import User, UserRole
from src.api.dependencies.require_role_dependency import require_roles
from src.services.assistant_runs_service import AssistantRunsService
from src.api.schemas.assistant_schema import RequestAssistantRun

run_assistant_route = APIRouter(
    prefix="/api",
    tags=["Assistant Runs"]
)

async def get_assistant_run_service(session: AsyncSession = Depends(get_session)):
    return AssistantRunsService(session=session)

@run_assistant_route.post("/assistants/{assistant_id}/run", status_code=201)
async def run_assistant(
    assistant_id: UUID,
    assistant_run_request: RequestAssistantRun,
    user: User = Depends(require_roles(UserRole.ADMIN, UserRole.USER)),
    assistant_run_service: AssistantRunsService = Depends(get_assistant_run_service)
):
    return await assistant_run_service.assistant_run(
        assistant_id=assistant_id, 
        user=user, 
        assistant_run_request=assistant_run_request
    )


@run_assistant_route.get("/runs/my", status_code=200)
async def get_user_runs(
    user: User = Depends(require_roles(UserRole.ADMIN, UserRole.USER)),
    assistant_run_service: AssistantRunsService = Depends(get_assistant_run_service)
):
    return await assistant_run_service.get_user_runs(user=user)


@run_assistant_route.get("/admin/runs", status_code=200)
async def get_admin_runs(
    user: User = Depends(require_roles(UserRole.ADMIN)),
    assistant_run_service: AssistantRunsService = Depends(get_assistant_run_service)
):
    return await assistant_run_service.get_all_runs()