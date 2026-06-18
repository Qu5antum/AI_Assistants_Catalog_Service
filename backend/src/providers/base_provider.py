from abc import ABC, abstractmethod


class BaseProvider(ABC):
    """Базовый класс для провайдеров LLM"""
    @abstractmethod
    async def generate(self, model: str, user_prompt: str, system_prompt: str) -> str:
        return NotImplementedError
