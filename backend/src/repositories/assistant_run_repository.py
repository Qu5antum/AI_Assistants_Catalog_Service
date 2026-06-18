from sqlalchemy import select
from uuid import UUID

from .base_repository import BaseRepository
from src.database.models import AssistantRun


class AssistantRunRepository(BaseRepository):
    model = AssistantRun

    async def get_user_runs(self, user_id: UUID):
        result = await self.session.execute(
            select(self.model).where(self.model.user_id == user_id)
        )

        return result.scalars().all()