from sqlalchemy import select
from uuid import UUID

from .base_repository import BaseRepository
from src.database.models import Assistant, User, UserRole


class AssistantRepository(BaseRepository):
    model = Assistant

    async def filter_assistant_with_category(self, user: User, category_id: UUID):
        query = (
            select(self.model).where(self.model.category_id == category_id)
        )

        if user.role == UserRole.USER:
            query = query.where(self.model.is_active == True)

        result = await self.session.execute(query)

        return result.scalars().all()
    
    async def search_assistant_with_name(self, user: User, assistant_name: str):
        query = (
            select(self.model).where(self.model.name.ilike(f"%{assistant_name}%"))
        )

        if user.role == UserRole.USER:
            query = query.where(self.model.is_active == True)

        result = await self.session.execute(query)

        return result.scalars().all()
    
    async def get_assistant_with_id_and_user(self, user: User, assistant_id: UUID):
        query = (
            select(self.model).where(self.model.id == assistant_id)
        )

        if user.role == UserRole.USER:
            query = query.where(self.model.is_active == True)
        
        result = await self.session.execute(query)

        return result.scalar_one_or_none()
    
    async def get_all_assistants_by_user(self, user: User):
        query = (
            select(self.model)
        )

        if user.role == UserRole.USER:
            query = query.where(self.model.is_active == True)

        result = await self.session.execute(query)

        return result.scalars().all()
