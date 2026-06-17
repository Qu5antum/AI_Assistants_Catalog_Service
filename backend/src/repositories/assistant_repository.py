from sqlalchemy import select
from uuid import UUID

from .base_repository import BaseRepository
from src.database.models import Assistant 


class AssistantRepository(BaseRepository):
    model = Assistant

    async def filter_assistant_with_category(self, category_id: UUID):
        result = await self.session.execute(
            select(self.model).where(self.model.category_id == category_id)
        )

        return result.scalars().all()
    
    async def search_assistant_with_name(self, assistant_name: str):
        result = await self.session.execute(
            select(self.model).where(self.model.name.ilike(f"%{assistant_name}%"))
        )

        return result.scalars().all()
