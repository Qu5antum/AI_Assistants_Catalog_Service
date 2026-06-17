from .base_exception import BaseAppException


class CategoryAlreadyExists(BaseAppException):
    """Ошибка если категория существует"""
    def __init__(self, message, status_code = 400):
        super().__init__(message, status_code)


class CategoryNotFound(BaseAppException):
    """Ошибка если категория не существует"""
    def __init__(self, message, status_code = 404):
        super().__init__(message, status_code)