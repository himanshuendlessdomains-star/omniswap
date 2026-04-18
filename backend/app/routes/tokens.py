from fastapi import APIRouter, HTTPException
from app.services.ton_api import fetch_jetton_list, fetch_jetton_price

router = APIRouter()


@router.get("/")
async def list_tokens():
    """Return popular TON tokens with metadata."""
    tokens = await fetch_jetton_list()
    return {"tokens": tokens}


@router.get("/{address}/price")
async def token_price(address: str):
    """Fetch USD price for a jetton by address."""
    price = await fetch_jetton_price(address)
    if price is None:
        raise HTTPException(status_code=404, detail="Price not available")
    return {"address": address, "usd": price}
