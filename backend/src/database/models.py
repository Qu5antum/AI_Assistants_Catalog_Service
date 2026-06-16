from sqlalchemy import DateTime, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from sqlalchemy.dialects.postgresql import UUID
from typing import Optional
from enum import Enum
import uuid
import datetime


class UserRole(str, Enum):
    USER = 'user'
    ADMIN = 'admin'


class Status(str, Enum):
    PENDING = 'pending'
    SUCCESS = 'success'
    FAILED = 'failed'


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    email: Mapped[str] = mapped_column(nullable=False, unique=True, index=True)
    password: Mapped[str] = mapped_column(nullable=False)
    role: Mapped[UserRole] = mapped_column(default=UserRole.USER)
    is_active: Mapped[bool] = mapped_column(default=True)

    assistant_runs: Mapped[list['AssistantRun']] = relationship(
        back_populates="user"
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.datetime.now(datetime.UTC), 
        index=True
    )


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    description:  Mapped[str] = mapped_column(nullable=False)

    assistants: Mapped[list["Assistant"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan"
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.datetime.now(datetime.UTC), 
        index=True
    )

class Assistant(Base):
    __tablename__ = "assistants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(nullable=False, index=True)
    description:  Mapped[str] = mapped_column(nullable=False)
    model: Mapped[str] = mapped_column(nullable=False)
    system_prompt: Mapped[str] = mapped_column(nullable=False)
    example_prompt: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)

    category: Mapped["Category"] = relationship(
        back_populates="assistants"
    )

    category_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("categories.id"), index=True)

    assistant_runs: Mapped[list['AssistantRun']] = relationship(
        back_populates="assistant"
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.datetime.now(datetime.UTC), 
        index=True
    )


class AssistantRun(Base):
    __tablename__ = "assistant_runs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_prompt: Mapped[str] = mapped_column(nullable=False)
    output: Mapped[Optional[str]] = mapped_column(nullable=True)
    status: Mapped[Status] = mapped_column(default=Status.PENDING)
    error: Mapped[Optional[str]] = mapped_column(nullable=True)

    assistant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("assistants.id"), index=True)
    assistant: Mapped['Assistant'] = relationship(
        back_populates="assistant_runs"
    )

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    user: Mapped['User'] = relationship(
        back_populates="assistant_runs"
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.datetime.now(datetime.UTC), 
        index=True
    )

