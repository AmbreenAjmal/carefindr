from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.repositories.chat import ChatRepository
from app.ai.chat import chat_service as ai_service
from app.db.models import User
from app.api.schemas import ChatResponse, HistoryResponse, MessageOut, SessionsResponse, SessionOut


class ChatService:
    def __init__(self, db: AsyncSession):
        self.repo = ChatRepository(db)

    async def handle_message(self, user: User, session_id: str | None, message: str) -> ChatResponse:
        if not message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty.")

        session = None
        if session_id:
            session = await self.repo.get_session(session_id, user.id)
        if not session:
            session = await self.repo.create_session(user.id)

        history = [
            {"role": m.role, "content": m.content}
            for m in await self.repo.get_messages(session.id)
        ]

        bot_reply = await ai_service.process_message(message, history)

        await self.repo.save_messages(session.id, message, bot_reply)
        await self.repo.set_session_title(session, message)

        return ChatResponse(session_id=str(session.id), message=bot_reply)

    async def get_history(self, user: User, session_id: str) -> HistoryResponse:
        session = await self.repo.get_session(session_id, user.id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found.")
        messages = await self.repo.get_messages(session.id)
        return HistoryResponse(
            session_id=session_id,
            messages=[MessageOut(role=m.role, content=m.content) for m in messages],
        )

    async def get_sessions(self, user: User) -> SessionsResponse:
        sessions = await self.repo.get_user_sessions(user.id)
        return SessionsResponse(sessions=[
            SessionOut(
                session_id=str(s.id),
                title=s.title or "New conversation",
                created_at=s.created_at.strftime("%b %d, %Y") if s.created_at else "",
            )
            for s in sessions
        ])
