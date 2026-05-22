from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid


# ── Chat ─────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: Optional[uuid.UUID] = None
    message: str


class ChatResponse(BaseModel):
    session_id: str
    message: str
    role: str = "assistant"


class MessageOut(BaseModel):
    role: str
    content: str

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    session_id: str
    messages: list[MessageOut]


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user_id: str
    name: str
    email: str


class UserOut(BaseModel):
    user_id: str
    name: str
    email: str


# ── Sessions list ─────────────────────────────────────────────────────────────

class SessionOut(BaseModel):
    session_id: str
    title: str
    created_at: str


class SessionsResponse(BaseModel):
    sessions: list[SessionOut]
