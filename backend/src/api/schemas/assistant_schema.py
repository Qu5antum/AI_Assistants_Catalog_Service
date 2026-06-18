from pydantic import BaseModel
from uuid import UUID


class CreateAssitant(BaseModel):
    name: str
    description: str
    model: str
    system_prompt: str
    example_prompt: str
    category_id: UUID


class UpdateAssistant(BaseModel):
    name: str | None = None
    description: str | None = None
    model: str | None = None
    system_prompt: str | None = None
    example_prompt: str | None = None
    category_id: UUID | None = None


class RequestAssistantRun(BaseModel):
    user_prompt: str