from sqlalchemy.exc import IntegrityError
import logging
from uuid import UUID
from typing import Any, Optional, Sequence

from src.database.db import AsyncSession
from src.database.models import Assistant
from src.api.schemas.assistant_schema import CreateAssitant, UpdateAssistant
from src.repositories.assistant_repository import AssistantRepository
from src.repositories.category_repository import CategoryRepository
from src.exception_handlers.db_exception import DatabaseException
from src.exception_handlers.assistant_exception import AssistantNotFound
from src.exception_handlers.category_exception import CategoryNotFound

logger = logging.getLogger("assistant")


class AssistantService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.category_repo = CategoryRepository(session=self.session)
        self.assistant_repo = AssistantRepository(session=self.session)
    
    async def create_assistant(self, assistant: CreateAssitant) -> dict[Assistant, Any]:
        category = await self.category_repo.get(id=assistant.category_id)

        if not category:
            logger.warning(
                "Category with this id does not exists",
                extra={"category_id": assistant.category_id}
            )
        
            raise CategoryNotFound("Категория не найдена")
        
        try:
            new_assistant = await self.assistant_repo.create(
                name=assistant.name,
                description=assistant.description,
                model=assistant.model,
                system_prompt=assistant.system_prompt,
                example_prompt=assistant.example_prompt,
                category_id=assistant.category_id
            )

        except IntegrityError:
            logger.error(
                "Assistant not created, Database error",
                exc_info=True,
                extra={"assistant_name": assistant.name}
            )
            
            raise DatabaseException("Ошибка базы данных")
        
        logger.info(
            "New assistant inserted in db",
            extra={"assistant_name": new_assistant.name}
        )

        return new_assistant

    async def get_all_assistants(self):
        assistants = await self.assistant_repo.get_all()

        logger.info(
            "Successful list assistants"
        )

        return assistants
    
    async def filter_assistant_by_category(self, category_id: UUID) -> Optional[Assistant]:
        category = await self.category_repo.get(id=category_id)

        if not category:
            logger.warning(
                "Category with this id does not exists",
                extra={"category_id": category_id}
            )
        
            raise CategoryNotFound("Категория не найдена")
        
        assistants = await self.assistant_repo.filter_assistant_with_category(
            category_id=category_id
        )

        logger.info(
            "Successful filter assistants by category",
            extra={"category_id": category_id}
        )

        return assistants
    
    async def search_assistant_by_name(self, assistant_name: str) -> Sequence[Assistant]:
        assistants = await self.assistant_repo.search_assistant_with_name(
            assistant_name=assistant_name
        )

        logger.info(
            "Successful search by name",
            extra={"assitant_name": assistant_name}
        )

        return assistants
    
    async def get_assistant_with_id(self, assistant_id: UUID) -> dict[Assistant, Any]:
        assistant = await self.assistant_repo.get(id=assistant_id)

        if not assistant:
            logger.warning(
                "Assistant not found by this id",
                extra={"assistant_id": assistant_id}
            )

            raise AssistantNotFound("Ассистент не найден")
        
        logger.info(
            "Successful get assistant",
            extra={"assistant_id": assistant_id}
        )

        return assistant
    
    async def update_assistant_by_id(self, assistant_id: UUID, assistant_update: UpdateAssistant):
        assistant = await self.assistant_repo.get(id=assistant_id)

        if not assistant:
            logger.warning(
                "Assistant not found by this id",
                extra={"assistant_id": assistant_id}
            )

            raise AssistantNotFound("Ассистент не найден")
        
        category = await self.category_repo.get(id=assistant_update.category_id)

        if not category:
            logger.warning(
                "Category with this id does not exists",
                extra={"category_id": assistant_update.category_id}
            )
        
            raise CategoryNotFound("Категория не найдена")
        
        try:
            data=assistant_update.model_dump(exclude_unset=True)

            update_assistant = await self.assistant_repo.update(id=assistant_id, data=data)
        
        except IntegrityError:
            logger.error(
                "Assistant not updated, Database error",
                exc_info=True,
                extra={"assistant_id": assistant_id}
            )

            raise DatabaseException("Ошибка в базе данных")
        
        logger.info(
            "Assistant Successfuly updated",
            extra={"assistant_id": assistant_id}
        )

        return update_assistant

    


