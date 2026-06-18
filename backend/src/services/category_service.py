import logging
from sqlalchemy.exc import IntegrityError

from src.database.db import AsyncSession
from src.database.models import Category
from src.api.schemas.category_schema import CreateCategory
from src.repositories.category_repository import CategoryRepository
from src.exception_handlers.category_exception import CategoryAlreadyExists
from src.exception_handlers.db_exception import DatabaseException

logger = logging.getLogger("category")


class CategoryService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.category_repo = CategoryRepository(session=self.session)

    async def create_category(self, category: CreateCategory) -> dict[Category]:
        existing_category = await self.category_repo.get_category_by_name(
            name=category.name
        )

        if existing_category:
            logger.warning(
                "Category already exists",
                extra={"category_name": category.name}
            )

            raise CategoryAlreadyExists("Категория уже существует")
        
        try:
            new_category = await self.category_repo.create(
                name=category.name,
                description=category.description
            )
        
        except IntegrityError:
            logger.error(
                "Category not created, Database error",
                exc_info=True,
                extra={"category_name": category.name}
            )

            raise DatabaseException("Ошибка базы данных")
        
        logger.info(
            "New category inserted in db",
            extra={"category_name": new_category.name}
        )

        return new_category
    
    async def get_categories(self) -> dict[list[Category]]:
        categories = await self.category_repo.get_all()

        logger.info(
            "Successful category list"
        )

        return categories