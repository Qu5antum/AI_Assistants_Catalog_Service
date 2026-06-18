from sqlalchemy.exc import IntegrityError
import logging
from uuid import UUID

from src.database.db import AsyncSession
from src.database.models import User, Status
from src.api.schemas.assistant_schema import RequestAssistantRun
from src.repositories.assistant_repository import AssistantRepository
from src.repositories.assistant_run_repository import AssistantRunRepository
from src.exception_handlers.assistant_exception import AssistantNotFound, AssistantInactive
from src.exception_handlers.db_exception import DatabaseException
from src.providers.llm_mock_provider import MockLLMProvider

logger = logging.getLogger("assistant_runs")


class AssistantRunsService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.assistant_repo = AssistantRepository(session=self.session)
        self.assistant_run_repo = AssistantRunRepository(session=self.session)
        self.mock_llm_provider = MockLLMProvider()
    
    async def assistant_run(self, assistant_id: UUID, user: User, assistant_run_request: RequestAssistantRun):
        assistant = await self.assistant_repo.get(
            id=assistant_id
        )

        if not assistant:
            logger.warning(
                "Assistant not found by this id",
                extra={"assistant_id": assistant_id}
            )

            raise AssistantNotFound("Ассистент не найден")
        
        if not assistant.is_active:
            logger.warning(
                "Assistant is inactive",
                extra={"assistant_id": assistant_id}
            )

            raise AssistantInactive("Ассистент выключен")
        
        try: 
            new_assistant_run = await self.assistant_run_repo.create(
                user_prompt=assistant_run_request.user_prompt,
                status=Status.PENDING,
                assistant_id=assistant_id,
                user_id=user.id
            )
        
        except IntegrityError:
            await self.session.rollback()
            
            logger.error(
                "Assistant run not created, Database error",
                exc_info=True,
                extra={"assistant_id": assistant_id}
            )

            raise DatabaseException("Ошибка в базе данных")
        
        try:
            response = await self.mock_llm_provider.generate(
                model=assistant.model,
                user_prompt=assistant_run_request.user_prompt,
                system_prompt=assistant.system_prompt
            )

            new_assistant_run.output = response
            new_assistant_run.status = Status.SUCCESS

            await self.session.commit()
            await self.session.refresh(new_assistant_run)
        
        except (ValueError, TimeoutError, Exception) as e:
            logger.warning(
                "Assistant run failed",
                exc_info=True,
                extra={
                    "assistant_id": assistant_id,
                    "user_prompt": assistant_run_request.user_prompt
                }
            )
            
            new_assistant_run.status = Status.FAILED
            new_assistant_run.error = str(e)

        await self.session.commit()
        await self.session.refresh(new_assistant_run)       

        logger.info(
            "Assistant run successfuly created",
            extra={
                "assistant_run_id": str(new_assistant_run.id),
                "user_prompt": new_assistant_run.user_prompt
            }
        )

        return new_assistant_run
    