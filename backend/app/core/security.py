import uuid
from typing import Any, Dict
import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.models.character import Character

http_bearer = HTTPBearer(auto_error=False)


def decode_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Decodes and cryptographically validates the Supabase JWT token.
    Extracts the claims including subject (`sub`), expiration (`exp`), and role.
    """
    try:
        # Supabase uses HS256 with project JWT Secret and sets aud to "authenticated"
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={
                "verify_exp": True,
                "verify_signature": True,
                "verify_aud": False,  # Supabase aud can be 'authenticated' or custom
            },
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException(
            detail="Session has expired. Please log in again.",
            code="TOKEN_EXPIRED",
        )
    except jwt.InvalidTokenError as e:
        raise UnauthorizedException(
            detail=f"Invalid authentication token: {str(e)}",
            code="INVALID_TOKEN",
        )


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(http_bearer),
) -> uuid.UUID:
    """
    Extracts and validates the Supabase authenticated user UUID from the Bearer token.
    Never accepts client-supplied user IDs.
    """
    if not credentials or not credentials.credentials:
        raise UnauthorizedException(
            detail="Authentication bearer token required.",
            code="MISSING_TOKEN",
        )

    token = credentials.credentials
    payload = decode_supabase_jwt(token)

    sub = payload.get("sub")
    if not sub:
        raise UnauthorizedException(
            detail="Token missing valid subject claim.",
            code="INVALID_CLAIMS",
        )

    try:
        return uuid.UUID(sub)
    except ValueError:
        raise UnauthorizedException(
            detail="Subject claim is not a valid UUID.",
            code="INVALID_USER_ID",
        )


async def get_current_character(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> Character:
    """
    Resolves the authoritative Character record mapped 1:1 to the authenticated Supabase user.
    All protected database operations are scoped to this returned character.
    """
    stmt = select(Character).where(Character.user_id == user_id)
    result = await db.execute(stmt)
    character = result.scalar_one_or_none()

    if not character:
        raise UnauthorizedException(
            detail="Character profile not initialized. Onboarding required.",
            code="CHARACTER_NOT_FOUND",
        )

    return character
