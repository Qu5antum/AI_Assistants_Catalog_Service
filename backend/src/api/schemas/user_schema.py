from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

from src.database.models import UserRole

class DummyLoginRequest(BaseModel):
    role: UserRole


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    role: UserRole


class UserOut(UserBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True