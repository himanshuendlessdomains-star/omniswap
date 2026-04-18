from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import tokens, analytics

app = FastAPI(title="OmniSwap API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://omniswap.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tokens.router, prefix="/api/tokens", tags=["tokens"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])


@app.get("/health")
async def health():
    return {"status": "ok"}
