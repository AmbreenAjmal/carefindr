from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.repositories.user import UserRepository
from app.core.security import hash_password, verify_password, create_token
from app.api.schemas import AuthResponse, UserOut


class AuthService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def register(self, name: str, email: str, password: str) -> AuthResponse:
        if await self.repo.get_by_email(email.lower()):
            raise HTTPException(status_code=400, detail="Email already registered")
        user = await self.repo.create(
            name=name.strip(),
            email=email.lower(),
            password_hash=hash_password(password),
        )
        token = create_token(str(user.id))
        return AuthResponse(token=token, user_id=str(user.id), name=user.name, email=user.email)

    async def login(self, email: str, password: str) -> AuthResponse:
        user = await self.repo.get_by_email(email.lower())
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_token(str(user.id))
        return AuthResponse(token=token, user_id=str(user.id), name=user.name, email=user.email)

    @staticmethod
    def get_profile(user) -> UserOut:
        return UserOut(user_id=str(user.id), name=user.name, email=user.email)
