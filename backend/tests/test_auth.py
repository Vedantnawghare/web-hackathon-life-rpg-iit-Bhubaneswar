import time
import uuid
import jwt
import pytest
from httpx import AsyncClient
from app.core.config import settings
from app.core.security import decode_supabase_jwt
from app.core.exceptions import UnauthorizedException


def generate_test_jwt(user_id: uuid.UUID, expires_in: int = 3600, secret: str = settings.SUPABASE_JWT_SECRET) -> str:
    payload = {
        "sub": str(user_id),
        "aud": "authenticated",
        "role": "authenticated",
        "exp": int(time.time()) + expires_in,
        "iat": int(time.time()),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def test_decode_supabase_jwt_valid():
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    payload = decode_supabase_jwt(token)
    assert payload["sub"] == str(user_id)
    assert payload["role"] == "authenticated"


def test_decode_supabase_jwt_expired():
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id, expires_in=-10)
    with pytest.raises(UnauthorizedException) as exc_info:
        decode_supabase_jwt(token)
    assert exc_info.value.code == "TOKEN_EXPIRED"


def test_decode_supabase_jwt_invalid_signature():
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id, secret="wrong-secret-key-for-test-32chars")
    with pytest.raises(UnauthorizedException) as exc_info:
        decode_supabase_jwt(token)
    assert exc_info.value.code == "INVALID_TOKEN"


@pytest.mark.asyncio
async def test_protected_route_missing_token(client: AsyncClient):
    response = await client.get("/api/v1/characters/me")
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "MISSING_TOKEN"


@pytest.mark.asyncio
async def test_protected_route_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/v1/characters/me",
        headers={"Authorization": "Bearer invalid.jwt.token"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "INVALID_TOKEN"


@pytest.mark.asyncio
async def test_character_onboarding_and_fetch_flow(client: AsyncClient):
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Before onboarding, GET /characters/me should report CHARACTER_NOT_FOUND
    res_before = await client.get("/api/v1/characters/me", headers=headers)
    assert res_before.status_code == 401
    assert res_before.json()["code"] == "CHARACTER_NOT_FOUND"

    # 2. Onboard character
    onboard_payload = {
        "username": "PaladinOne",
        "title": "Novice Adventurer",
        "timezone": "America/New_York",
    }
    res_onboard = await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json=onboard_payload,
    )
    assert res_onboard.status_code == 201
    char_data = res_onboard.json()
    assert char_data["username"] == "PaladinOne"
    assert char_data["current_level"] == 1
    assert char_data["lifetime_xp"] == 0
    assert char_data["xp_into_current_level"] == 0
    assert char_data["xp_required_for_next_level"] == 100
    assert char_data["gold"] == 0
    assert char_data["strength"] == 10
    assert char_data["user_id"] == str(user_id)

    # 3. Subsequent GET /characters/me succeeds
    res_after = await client.get("/api/v1/characters/me", headers=headers)
    assert res_after.status_code == 200
    assert res_after.json()["username"] == "PaladinOne"
    assert res_after.json()["current_streak"] == 0

    # 4. Attempting duplicate onboarding returns 409 Conflict
    res_duplicate = await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json=onboard_payload,
    )
    assert res_duplicate.status_code == 409
    assert res_duplicate.json()["code"] == "CHARACTER_ALREADY_EXISTS"
