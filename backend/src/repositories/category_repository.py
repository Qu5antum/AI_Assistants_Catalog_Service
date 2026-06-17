from sqlalchemy import select

from .base_repository import BaseRepository
from src.database.models import Category


class CategoryRepository(BaseRepository):
    model = Category

    async def get_category_by_name(self, name: str):
        result = await self.session.execute(
            select(self.model).where(self.model.name == name)
        )

        return result.scalar_one_or_none()