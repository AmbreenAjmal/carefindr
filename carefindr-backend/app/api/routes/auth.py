from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User
from app.api.schemas import RegisterRequest, LoginRequest, AuthResponse, UserOut, SessionsResponse
from app.core.security import get_current_user
from app.services.auth import AuthService
from app.services.chat import ChatService

router = APIRouter()


@router.post("/auth/register", response_model=AuthResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await AuthService(db).register(body.name, body.email, body.password)


@router.post("/auth/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await AuthService(db).login(body.email, body.password)


@router.get("/auth/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return AuthService.get_profile(current_user)


@router.get("/user/sessions", response_model=SessionsResponse)
async def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ChatService(db).get_sessions(current_user)
