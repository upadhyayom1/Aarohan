"""Convenience launcher:  python run.py"""
import os

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=os.getenv("AI_HOST", "0.0.0.0"),
        port=int(os.getenv("AI_PORT", "8001")),
        reload=os.getenv("AI_RELOAD", "false").lower() == "true",
    )
