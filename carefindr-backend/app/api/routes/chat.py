from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User
from app.api.schemas import ChatRequest, ChatResponse, HistoryResponse
from app.core.security import get_current_user
from app.services.chat import ChatService

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await ChatService(db).handle_message(
        user=current_user,
        session_id=str(request.session_id) if request.session_id else None,
        message=request.message,
    )


@router.get("/chat/{session_id}/history", response_model=HistoryResponse)
async def get_history(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await ChatService(db).get_history(current_user, session_id)
