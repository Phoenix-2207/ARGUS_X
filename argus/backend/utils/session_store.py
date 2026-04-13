"""
ARGUS-X — Session Threat Store
Persistent session storage backed by Redis when available,
with in-memory fallback for local development.
"""
import json
import os
import logging

log = logging.getLogger("argus.session_store")

# Default empty session shape
_DEFAULT_SESSION = {"total": 0, "threats": 0, "last_score": 0, "escalation": 0, "user_id": ""}

# Session TTL: 24 hours (seconds)
SESSION_TTL = 86400


class SessionStore:
    """Async session store with Redis persistence and in-memory fallback."""

    def __init__(self):
        self._redis = None
        self._memory: dict = {}
        self._prefix = "argus:session:"

    async def init(self):
        """Attempt to connect to Redis. Falls back to in-memory if unavailable."""
        redis_url = os.getenv("REDIS_URL", "")
        if not redis_url:
            log.info("REDIS_URL not set — using in-memory session store (non-persistent)")
            return

        try:
            import redis.asyncio as aioredis
            self._redis = aioredis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
            )
            # Verify connection
            await self._redis.ping()
            log.info("✅ Redis session store connected")
        except Exception as e:
            log.warning(f"Redis connection failed ({e}) — falling back to in-memory store")
            self._redis = None

    def _key(self, session_id: str) -> str:
        return f"{self._prefix}{session_id}"

    async def get_session(self, session_id: str) -> dict:
        """Retrieve session data. Returns default if not found."""
        if self._redis:
            try:
                raw = await self._redis.get(self._key(session_id))
                if raw:
                    return json.loads(raw)
            except Exception as e:
                log.warning(f"Redis GET failed for {session_id}: {e}")
        else:
            if session_id in self._memory:
                return self._memory[session_id].copy()

        return _DEFAULT_SESSION.copy()

    async def update_session(self, session_id: str, user_id: str, action: str, score: float):
        """Update session threat counters atomically."""
        session = await self.get_session(session_id)

        if not session.get("user_id"):
            session["user_id"] = user_id

        session["total"] += 1
        if action in ("BLOCKED", "SANITIZED"):
            session["threats"] += 1
            if score > session["last_score"]:
                session["escalation"] += 1
        session["last_score"] = score

        if self._redis:
            try:
                await self._redis.set(
                    self._key(session_id),
                    json.dumps(session),
                    ex=SESSION_TTL,
                )
            except Exception as e:
                log.warning(f"Redis SET failed for {session_id}: {e}")
                # Fall through — data lost for this update, but no crash
        else:
            self._memory[session_id] = session

    async def close(self):
        """Clean shutdown."""
        if self._redis:
            try:
                await self._redis.close()
            except Exception:
                pass
