"""
KnowYourLoan Admin Authentication & Security
Token-based authentication with cryptographically secure session storage,
PBKDF2 HMAC SHA-256 passwords, and FastAPI dependency injection guards.
"""

import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends
from backend.database import (
    get_db_connection,
    verify_password,
    hash_password,
    record_audit_log
)

SESSION_DURATION_HOURS = 24

def create_admin_session(username: str) -> str:
    """Generate a cryptographically secure hex token and store session with expiration."""
    token = secrets.token_hex(32)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=SESSION_DURATION_HOURS)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO admin_sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (token, username, now.isoformat(), expires_at.isoformat())
    )
    conn.commit()
    conn.close()
    return token

def revoke_admin_session(token: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM admin_sessions WHERE token = ?", (token,))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

def get_current_admin(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    FastAPI dependency: verifies Bearer token from Authorization header.
    Throws 401 Unauthorized if invalid or expired.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication credentials were not provided. Admin Bearer token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization scheme. Use 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    now_iso = datetime.now(timezone.utc).isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT s.token, s.username, s.expires_at, u.role, u.full_name
        FROM admin_sessions s
        JOIN admin_users u ON s.username = u.username
        WHERE s.token = ? AND s.expires_at > ?
        """,
        (token, now_iso)
    )
    session_row = cursor.fetchone()
    conn.close()

    if not session_row:
        raise HTTPException(
            status_code=401,
            detail="Invalid, expired, or revoked admin session token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "username": session_row["username"],
        "role": session_row["role"],
        "full_name": session_row["full_name"],
        "token": session_row["token"]
    }

def authenticate_admin_credentials(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Verifies username and password against PBKDF2 hash stored in SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT username, password_hash, salt, role, full_name FROM admin_users WHERE username = ?", (username,))
    user_row = cursor.fetchone()
    conn.close()

    if not user_row:
        return None

    is_valid = verify_password(password, user_row["password_hash"], user_row["salt"])
    if not is_valid:
        return None

    return {
        "username": user_row["username"],
        "role": user_row["role"],
        "full_name": user_row["full_name"]
    }
