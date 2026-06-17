from .base_exception import BaseAppException 


class AssistantNotFound(BaseAppException):
    """Ошибка ассистент не найден"""
    def __init__(self, detail: str):
        super().__init__(detail, status_code=404)