import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import ChatSession, ChatMessage


class ChatRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_session(self, session_id: str, user_id: uuid.UUID) -> ChatSession | None:
        result = await self.db.execute(
            select(ChatSession).where(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def create_session(self, user_id: uuid.UUID) -> ChatSession:
        session = ChatSession(user_id=user_id)
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def get_user_sessions(self, user_id: uuid.UUID) -> list[ChatSession]:
        result = await self.db.execute(
            select(ChatSession)
            .where(ChatSession.user_id == user_id)
            .order_by(ChatSession.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_messages(self, session_id: uuid.UUID) -> list[ChatMessage]:
        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at)
        )
        return list(result.scalars().all())

    async def save_messages(self, session_id: uuid.UUID, user_msg: str, bot_msg: str) -> None:
        # Two separate commits so each message gets a distinct created_at timestamp,
        # preserving order when loaded back via ORDER BY created_at.
        self.db.add(ChatMessage(session_id=session_id, role="user", content=user_msg))
        await self.db.commit()
        self.db.add(ChatMessage(session_id=session_id, role="assistant", content=bot_msg))
        await self.db.commit()

    async def set_session_title(self, session: ChatSession, first_message: str) -> None:
        if not session.title:
            session.title = first_message[:80]
            self.db.add(session)
            await self.db.commit()
