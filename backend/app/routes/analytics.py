from fastapi import APIRouter
from app.services.ton_api import fetch_swap_stats

router = APIRouter()


@router.get("/stats")
async def swap_stats():
    """Aggregate swap stats: volume, top pairs, resolver breakdown."""
    stats = await fetch_swap_stats()
    return stats
