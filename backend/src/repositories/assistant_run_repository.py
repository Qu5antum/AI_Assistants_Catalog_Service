from .base_repository import BaseRepository
from src.database.models import AssistantRun


class AssistantRunRepository(BaseRepository):
    model = AssistantRun