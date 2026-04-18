"""
TON API service — wraps tonapi.io for token metadata and price data.
No API key needed for public endpoints (rate-limited at 1 req/s).
"""
import asyncio
import httpx
from typing import Optional

TONAPI_BASE = "https://tonapi.io/v2"

# Known popular jetton addresses (mainnet)
POPULAR_JETTONS = [
    "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  # USDT
    "EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728",  # STON
    "EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qB3",  # BOLT
    "EQAvDfWFG0oYX19jwNDNBBL1rKNT9XfaGP9HyTb5nb2Eml6y",  # jUSDC
]


"""
TON API service — wraps tonapi.io for token metadata and price data.
No API key needed for public endpoints (rate-limited at 1 req/s).
"""
import asyncio
import httpx
from typing import Optional

TONAPI_BASE = "https://tonapi.io/v2"

# Known popular jetton addresses (mainnet)
POPULAR_JETTONS = [
    "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",  # USDT
    "EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728",  # STON
    "EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qB3",  # BOLT
    "EQAvDfWFG0oYX19jwNDNBBL1rKNT9XfaGP9HyTb5nb2Eml6y",  # jUSDC
]


async def fetch_jetton_metadata(client: httpx.AsyncClient, address: str) -> Optional[dict]:
    """Fetch metadata for a single jetton."""
    try:
        r = await client.get(f"{TONAPI_BASE}/jettons/{address}")
        r.raise_for_status()
        data = r.json()
        return {
            "address": address,
            "symbol": data.get("metadata", {}).get("symbol", "?"),
            "name": data.get("metadata", {}).get("name", "Unknown"),
            "decimals": data.get("metadata", {}).get("decimals", 9),
            "image": data.get("metadata", {}).get("image", ""),
            "holders": data.get("holders_count", 0),
        }
    except Exception:
        return None


async def fetch_jetton_list() -> list[dict]:
    """Fetch metadata for popular jettons from tonapi.io in parallel."""
    async with httpx.AsyncClient(timeout=10) as client:
        tasks = [fetch_jetton_metadata(client, address) for address in POPULAR_JETTONS]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        # Filter out None and exceptions
        valid_results = [r for r in results if r is not None and not isinstance(r, Exception)]
        return valid_results


async def fetch_jetton_price(address: str) -> Optional[float]:
    """
    Fetch USD price from STON.fi price API.
    Returns None if unavailable.
    """
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(
                "https://api.ston.fi/v1/asset/price",
                params={"asset_address": address},
            )
            r.raise_for_status()
            data = r.json()
            price_str = data.get("price")
            return float(price_str) if price_str else None
    except Exception:
        return None


async def fetch_swap_stats() -> dict:
    """
    Placeholder — in production this would aggregate Omniston resolver stats.
    Returns mock statistics for UI demonstration.
    """
    return {
        "total_volume_usd": 24_300_000,
        "swaps_24h": 18_420,
        "resolvers": [
            {"name": "STON.fi v2", "volume_share": 0.52, "avg_savings_bps": 18},
            {"name": "DeDust",     "volume_share": 0.31, "avg_savings_bps": 12},
            {"name": "STON.fi v1", "volume_share": 0.11, "avg_savings_bps": 5},
            {"name": "TONCO",      "volume_share": 0.06, "avg_savings_bps": 22},
        ],
        "top_pairs": [
            {"base": "TON",  "quote": "USDT", "volume_usd": 8_100_000},
            {"base": "STON", "quote": "TON",  "volume_usd": 3_200_000},
            {"base": "TON",  "quote": "jUSDC","volume_usd": 2_900_000},
        ],
    }
