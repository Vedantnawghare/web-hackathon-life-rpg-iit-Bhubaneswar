import asyncio
import os
import tempfile
import uuid
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.main import app as fastapi_app
import app.models  # ensure models registered
from tests.test_auth import generate_test_jwt


@pytest.fixture
async def concurrency_client():
    """
    Provides an AsyncClient backed by a file-based SQLite database in WAL mode.
    This allows genuine connection isolation so that concurrent transactions
    have their own SQLite connections without rollbacks bleeding into other sessions.
    """
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    db_path = tmp.name
    tmp.close()

    db_url = f"sqlite+aiosqlite:///{db_path}"
    engine = create_async_engine(
        db_url,
        connect_args={"check_same_thread": False, "timeout": 30.0},
    )

    @event.listens_for(engine.sync_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=30000")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def override_get_db():
        async with session_factory() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=fastapi_app)

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    fastapi_app.dependency_overrides.clear()
    await engine.dispose()

    for ext in ["", "-wal", "-shm"]:
        f_path = db_path + ext
        if os.path.exists(f_path):
            try:
                os.remove(f_path)
            except OSError:
                pass


@pytest.mark.asyncio
async def test_concurrent_quest_completion_no_duplicate_rewards(concurrency_client: AsyncClient):
    """
    Simulates 8 concurrent completion requests fired at the exact same moment.
    Verifies that pessimistic locking & unique idempotency keys guarantee:
    1. Exactly ONE request succeeds (200 OK).
    2. All other concurrent attempts fail with 409 Conflict (QUEST_ALREADY_COMPLETED).
    3. The character only receives rewards for ONE completion.
    """
    client = concurrency_client
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # Onboard
    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "ConcurrencyHero", "timezone": "UTC"},
    )

    # Create HARD quest (100 base XP, 60 Gold)
    res_quest = await client.post(
        "/api/v1/quests",
        headers=headers,
        json={
            "title": "Solve Complex System Architecture",
            "category": "Coding",
            "difficulty": "HARD",
            "recurrence": "DAILY",
        },
    )
    quest_id = res_quest.json()["id"]

    # Fire 8 concurrent completion requests
    async def attempt_completion():
        return await client.post(f"/api/v1/quests/{quest_id}/complete", headers=headers)

    responses = await asyncio.gather(*[attempt_completion() for _ in range(8)])

    status_codes = [r.status_code for r in responses]
    successes = [s for s in status_codes if s == 200]
    conflicts = [c for c in status_codes if c == 409]

    # Exactly 1 success, 7 conflicts
    assert len(successes) == 1, f"Expected exactly 1 success, got {len(successes)}. Statuses: {status_codes}"
    assert len(conflicts) == 7, f"Expected 7 conflicts, got {len(conflicts)}. Statuses: {status_codes}"

    # Verify character's authoritative balance in database
    char_res = await client.get("/api/v1/characters/me", headers=headers)
    char_data = char_res.json()

    # Base gold for HARD quest is 60. Should be exactly 60, not 60 * 8!
    assert char_data["gold"] == 60

    # Base XP is 100 * 1.02 streak bonus = 102 XP. Should be exactly 102 XP!
    assert char_data["lifetime_xp"] == 102

    # Verify completion history has exactly 1 entry
    hist_res = await client.get("/api/v1/quests/history", headers=headers)
    assert hist_res.json()["total"] == 1
