import logging

from .base_provider import BaseProvider

logger = logging.getLogger("mock_provider")


class MockLLMProvider(BaseProvider):
    """Мок Провайдер ЛЛМ"""
    async def generate(self, model: str, user_prompt: str, system_prompt: str) -> str:
        if "timeout" in user_prompt:
            logger.warning(
                "Mock timeout error",
                extra={"user_prompt": user_prompt}
            )
            raise TimeoutError("Mock timeout error")
        
        if "error" in user_prompt:
            logger.warning(
                "Mock error",
                extra={"user_prompt": user_prompt}
            )
            raise Exception("Mock error")
        
        if not user_prompt:
            logger.warning(
                "Mock empty prompt",
                extra={"user_prompt": user_prompt} 
            )
            raise ValueError("Mock empty prompt")
        
        if "invalid" in user_prompt:
            logger.warning(
                "Mock invalid prompt",
                extra={"user_prompt": user_prompt}
            )
            raise ValueError("Mock invalid prompt")
        
        return """
            Mock response for prompt: {user_prompt}\n,
            Model: {model}\n,
            System prompt: {system_prompt},
        """