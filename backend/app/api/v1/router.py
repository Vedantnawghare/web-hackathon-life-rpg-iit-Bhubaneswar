from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    characters,
    quests,
    shop,
    inventory,
    streaks,
    achievements,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(characters.router, prefix="/characters", tags=["Characters"])
api_router.include_router(quests.router, prefix="/quests", tags=["Quests"])
api_router.include_router(shop.router, prefix="/shop", tags=["Guild Shop"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
api_router.include_router(streaks.router, prefix="/streaks", tags=["Streaks"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])
