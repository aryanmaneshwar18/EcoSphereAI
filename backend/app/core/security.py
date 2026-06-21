"""
EcoSphere AI - Security Utilities
JWT verification, Clerk integration, password hashing, and rate limiting.
Follows OWASP Top 10 and zero-trust principles.
"""

from __future__ import annotations

import hashlib
import hmac
import time
from datetime import UTC, datetime, timedelta
from typing import Any

import httpx
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

# ── Password Hashing ──────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

security_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT Token Management ──────────────────────────────────────────
def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(hours=24))
    to_encode.update({"exp": expire, "iat": datetime.now(UTC)})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


# ── Clerk JWT Verification ────────────────────────────────────────
class ClerkJWTVerifier:
    """
    Verifies JWTs issued by Clerk authentication service.
    Caches the JWKS for performance.
    """

    _jwks_cache: dict[str, Any] | None = None
    _jwks_fetched_at: float = 0
    _jwks_ttl: int = 3600  # 1 hour cache

    @classmethod
    async def get_jwks(cls) -> dict[str, Any]:
        """Fetch Clerk's JSON Web Key Set."""
        now = time.time()
        if cls._jwks_cache and (now - cls._jwks_fetched_at) < cls._jwks_ttl:
            return cls._jwks_cache

        if not settings.CLERK_JWT_ISSUER:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Clerk JWT issuer not configured",
            )

        jwks_url = f"{settings.CLERK_JWT_ISSUER}/.well-known/jwks.json"
        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url, timeout=10.0)
            response.raise_for_status()
            cls._jwks_cache = response.json()
            cls._jwks_fetched_at = now
            return cls._jwks_cache

    @classmethod
    async def verify_token(cls, token: str) -> dict[str, Any]:
        """Verify a Clerk-issued JWT and return the payload."""
        try:
            jwks = await cls.get_jwks()
            unverified_header = jwt.get_unverified_header(token)
            rsa_key: dict[str, str] = {}

            for key in jwks.get("keys", []):
                if key["kid"] == unverified_header.get("kid"):
                    rsa_key = {
                        "kty": key["kty"],
                        "kid": key["kid"],
                        "use": key["use"],
                        "n": key["n"],
                        "e": key["e"],
                    }
                    break

            if not rsa_key:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Unable to find matching signing key",
                )

            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                issuer=settings.CLERK_JWT_ISSUER,
            )
            return payload

        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token verification failed: {str(e)}",
            ) from e


# ── Authentication Dependency ─────────────────────────────────────
async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
) -> str:
    """
    FastAPI dependency to extract and verify the current user's ID from JWT.
    Supports both Clerk tokens and internal tokens.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Try Clerk verification first if configured
    if settings.CLERK_JWT_ISSUER:
        try:
            payload = await ClerkJWTVerifier.verify_token(token)
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token missing subject claim",
                )
            return user_id
        except HTTPException:
            pass  # Fall through to internal token verification

    # Internal token verification
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
        )
    return user_id


# ── Webhook Signature Verification ────────────────────────────────
def verify_clerk_webhook_signature(
    payload: bytes,
    signature: str,
    timestamp: str,
) -> bool:
    """
    Verify Clerk webhook signature using HMAC-SHA256.
    Protects against replay attacks by checking timestamp freshness.
    """
    if not settings.CLERK_WEBHOOK_SECRET:
        return False

    # Reject if timestamp is older than 5 minutes
    try:
        ts = int(timestamp)
        if abs(time.time() - ts) > 300:
            return False
    except (ValueError, TypeError):
        return False

    signed_content = f"{timestamp}.{payload.decode('utf-8')}"
    expected_signature = hmac.new(
        settings.CLERK_WEBHOOK_SECRET.encode("utf-8"),
        signed_content.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(signature, expected_signature)


# ── API Key Hashing ───────────────────────────────────────────────
def hash_api_key(api_key: str) -> str:
    """Hash an API key using SHA-256 for storage."""
    return hashlib.sha256(api_key.encode("utf-8")).hexdigest()


def verify_api_key(api_key: str, hashed_key: str) -> bool:
    """Verify an API key against its stored hash."""
    return hmac.compare_digest(hash_api_key(api_key), hashed_key)
