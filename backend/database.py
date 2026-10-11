"""
KnowYourLoan Database Persistence Layer
Dual-Engine Database Layer supporting:
1. SQLite (Default local development: know_your_loan.db)
2. PostgreSQL / Supabase PostgreSQL (Production / Cloud: DATABASE_URL)
"""

import os
import json
import sqlite3
import hashlib
import secrets
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple, Union

# Detect database dialect
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
IS_POSTGRES = bool(DATABASE_URL and (
    DATABASE_URL.startswith("postgres://") or
    DATABASE_URL.startswith("postgresql://")
))

DB_PATH = os.environ.get(
    "KYL_DB_PATH",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "know_your_loan.db")
)

# Conditionally import psycopg if PostgreSQL is targeted
if IS_POSTGRES:
    try:
        import psycopg
        from psycopg.rows import dict_row
    except ImportError:
        raise ImportError(
            "psycopg is required when DATABASE_URL is set for PostgreSQL/Supabase. "
            "Install it via: pip install 'psycopg[binary]>=3.1.18'"
        )


class DBConnectionWrapper:
    """Unified wrapper around sqlite3.Connection and psycopg.Connection."""

    def __init__(self, raw_conn, is_postgres: bool):
        self.raw = raw_conn
        self.is_postgres = is_postgres

    def cursor(self):
        raw_cur = self.raw.cursor()
        return DBCursorWrapper(raw_cur, self.is_postgres)

    def execute(self, sql: str, params: Optional[Union[tuple, list]] = None):
        cur = self.cursor()
        cur.execute(sql, params)
        return cur

    def commit(self):
        self.raw.commit()

    def rollback(self):
        self.raw.rollback()

    def close(self):
        self.raw.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.rollback()
        else:
            self.commit()
        self.close()


class DBCursorWrapper:
    """Unified cursor wrapper translating parameter placeholders and normalising row access."""

    def __init__(self, raw_cursor, is_postgres: bool):
        self.raw = raw_cursor
        self.is_postgres = is_postgres

    @property
    def rowcount(self) -> int:
        return self.raw.rowcount

    @property
    def lastrowid(self):
        if hasattr(self.raw, "lastrowid"):
            return self.raw.lastrowid
        return None

    def execute(self, sql: str, params: Optional[Union[tuple, list]] = None):
        if self.is_postgres:
            # PostgreSQL requires %s rather than SQLite's ?
            # Replace '?' with '%s' safely
            sql = sql.replace("?", "%s")
            if params is not None:
                params = list(params)
                self.raw.execute(sql, params)
            else:
                self.raw.execute(sql)
        else:
            if params is not None:
                self.raw.execute(sql, tuple(params))
            else:
                self.raw.execute(sql)
        return self

    def fetchone(self) -> Optional[Dict[str, Any]]:
        row = self.raw.fetchone()
        if row is None:
            return None
        return dict(row)

    def fetchall(self) -> List[Dict[str, Any]]:
        rows = self.raw.fetchall()
        return [dict(r) for r in rows]

    def close(self):
        self.raw.close()


def get_db_connection() -> DBConnectionWrapper:
    """
    Returns a unified database connection.
    If DATABASE_URL is set, connects to PostgreSQL / Supabase.
    Otherwise, connects to the local SQLite database at DB_PATH.
    """
    if IS_POSTGRES:
        # Supabase / Render PostgreSQL connection
        clean_url = DATABASE_URL
        if clean_url.startswith("postgres://"):
            clean_url = "postgresql://" + clean_url[len("postgres://"):]
        raw_conn = psycopg.connect(clean_url, row_factory=dict_row)
        return DBConnectionWrapper(raw_conn, is_postgres=True)
    else:
        # SQLite connection
        raw_conn = sqlite3.connect(DB_PATH)
        raw_conn.row_factory = sqlite3.Row
        raw_conn.execute("PRAGMA foreign_keys = ON")
        return DBConnectionWrapper(raw_conn, is_postgres=False)


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Secure PBKDF2 HMAC SHA-256 password hashing with random salt."""
    if salt is None:
        salt = secrets.token_hex(16)
    iterations = 260_000
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations
    )
    return hash_bytes.hex(), salt


def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    new_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(new_hash, stored_hash)


def init_db():
    """
    Idempotent schema initialization.
    Safely creates tables and indexes IF NOT EXISTS for both SQLite and PostgreSQL.
    Never deletes, drops, or alters existing application records.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    is_pg = conn.is_postgres
    auto_id_type = "SERIAL PRIMARY KEY" if is_pg else "INTEGER PRIMARY KEY AUTOINCREMENT"

    # 1. Applications table
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        applicant_data TEXT NOT NULL,
        derived_features TEXT NOT NULL,
        model_prediction TEXT NOT NULL,
        approval_probability REAL NOT NULL,
        decision_threshold REAL NOT NULL,
        review_status TEXT NOT NULL DEFAULT 'PENDING REVIEW',
        manual_override_status TEXT,
        manual_override_reason TEXT,
        manual_override_by TEXT,
        manual_override_at TEXT,
        shap_explanation TEXT NOT NULL,
        loan_amount REAL NOT NULL,
        credit_score INTEGER NOT NULL,
        foir REAL NOT NULL,
        dti_ratio REAL NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    # Indexes on applications
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_apps_created_at ON applications(created_at DESC);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_apps_review_status ON applications(review_status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_apps_model_pred ON applications(model_prediction);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_apps_prob ON applications(approval_probability);")

    # 2. Review Notes table
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS review_notes (
        id {auto_id_type},
        application_id TEXT NOT NULL,
        admin_username TEXT NOT NULL,
        note TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notes_app_id ON review_notes(application_id);")

    # 3. Audit Log table
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id {auto_id_type},
        timestamp TEXT NOT NULL,
        admin_username TEXT NOT NULL,
        action TEXT NOT NULL,
        application_id TEXT,
        previous_value TEXT,
        new_value TEXT,
        details TEXT
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp DESC);")

    # 4. Admin Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        full_name TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # 5. Admin Sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (username) REFERENCES admin_users(username) ON DELETE CASCADE
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);")

    # Ensure default admin user exists
    cursor.execute("SELECT username FROM admin_users WHERE username = ?", ("admin",))
    if not cursor.fetchone():
        initial_pw = os.environ.get("ADMIN_DEFAULT_PASSWORD", "Admin@KYL2026")
        p_hash, p_salt = hash_password(initial_pw)
        now_iso = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            "INSERT INTO admin_users (username, password_hash, salt, role, full_name, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            ("admin", p_hash, p_salt, "Super Administrator", "KnowYourLoan Officer", now_iso)
        )

    conn.commit()
    conn.close()


def record_audit_log(
    admin_username: str,
    action: str,
    application_id: Optional[str] = None,
    previous_value: Optional[str] = None,
    new_value: Optional[str] = None,
    details: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        """
        INSERT INTO audit_logs (timestamp, admin_username, action, application_id, previous_value, new_value, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (now_iso, admin_username, action, application_id, previous_value, new_value, details)
    )
    conn.commit()
    conn.close()


def save_application(
    app_id: str,
    applicant_data: Dict[str, Any],
    derived_features: Dict[str, Any],
    model_prediction: str,
    approval_probability: float,
    threshold: float,
    shap_explanation: Dict[str, Any]
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()

    loan_amount = float(applicant_data.get("loan_amount", 0))
    credit_score = int(applicant_data.get("credit_score", 0))
    foir = float(derived_features.get("foir", 0))
    dti_ratio = float(derived_features.get("dti_ratio", 0))

    cursor.execute(
        """
        INSERT INTO applications (
            id, created_at, applicant_data, derived_features,
            model_prediction, approval_probability, decision_threshold,
            review_status, shap_explanation, loan_amount, credit_score,
            foir, dti_ratio, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING REVIEW', ?, ?, ?, ?, ?, ?)
        """,
        (
            app_id, now_iso, json.dumps(applicant_data), json.dumps(derived_features),
            model_prediction, approval_probability, threshold,
            json.dumps(shap_explanation), loan_amount, credit_score,
            foir, dti_ratio, now_iso
        )
    )
    conn.commit()
    conn.close()

    return {
        "id": app_id,
        "created_at": now_iso,
        "model_prediction": model_prediction,
        "approval_probability": approval_probability,
        "review_status": "PENDING REVIEW"
    }


def get_application_by_id(app_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applications WHERE id = ?", (app_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    app_dict = dict(row)
    app_dict["applicant_data"] = json.loads(app_dict["applicant_data"])
    app_dict["derived_features"] = json.loads(app_dict["derived_features"])
    app_dict["shap_explanation"] = json.loads(app_dict["shap_explanation"])

    # Load review notes
    cursor.execute(
        "SELECT id, admin_username, note, created_at FROM review_notes WHERE application_id = ? ORDER BY created_at ASC",
        (app_id,)
    )
    notes = cursor.fetchall()
    app_dict["review_notes"] = notes

    # Load audit history for this application
    cursor.execute(
        "SELECT id, timestamp, admin_username, action, previous_value, new_value, details FROM audit_logs WHERE application_id = ? ORDER BY timestamp DESC",
        (app_id,)
    )
    history = cursor.fetchall()
    app_dict["audit_history"] = history

    conn.close()
    return app_dict


def update_review_status(
    app_id: str,
    new_status: str,
    admin_username: str,
    note: Optional[str] = None
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT review_status FROM applications WHERE id = ?", (app_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise ValueError(f"Application {app_id} not found.")

    prev_status = row["review_status"]
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor.execute(
        "UPDATE applications SET review_status = ?, updated_at = ? WHERE id = ?",
        (new_status, now_iso, app_id)
    )

    if note and note.strip():
        cursor.execute(
            "INSERT INTO review_notes (application_id, admin_username, note, created_at) VALUES (?, ?, ?, ?)",
            (app_id, admin_username, note.strip(), now_iso)
        )

    # Record audit log
    cursor.execute(
        """
        INSERT INTO audit_logs (timestamp, admin_username, action, application_id, previous_value, new_value, details)
        VALUES (?, ?, 'STATUS_UPDATE', ?, ?, ?, ?)
        """,
        (now_iso, admin_username, app_id, prev_status, new_status, f"Review status updated to {new_status}" + (f": {note.strip()}" if note else ""))
    )

    conn.commit()
    conn.close()

    return {
        "id": app_id,
        "previous_status": prev_status,
        "review_status": new_status,
        "updated_at": now_iso
    }


def update_manual_override(
    app_id: str,
    override_status: str,
    reason: str,
    admin_username: str
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT manual_override_status, model_prediction FROM applications WHERE id = ?", (app_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise ValueError(f"Application {app_id} not found.")

    prev_override = row["manual_override_status"]
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor.execute(
        """
        UPDATE applications
        SET manual_override_status = ?, manual_override_reason = ?, manual_override_by = ?, manual_override_at = ?, updated_at = ?
        WHERE id = ?
        """,
        (override_status, reason, admin_username, now_iso, now_iso, app_id)
    )

    # Record note
    note_text = f"Manual Decision Override: {override_status}. Reason: {reason}"
    cursor.execute(
        "INSERT INTO review_notes (application_id, admin_username, note, created_at) VALUES (?, ?, ?, ?)",
        (app_id, admin_username, note_text, now_iso)
    )

    # Record audit log
    cursor.execute(
        """
        INSERT INTO audit_logs (timestamp, admin_username, action, application_id, previous_value, new_value, details)
        VALUES (?, ?, 'MANUAL_OVERRIDE', ?, ?, ?, ?)
        """,
        (now_iso, admin_username, app_id, prev_override or "None", override_status, f"Admin override: {reason}")
    )

    conn.commit()
    conn.close()

    return {
        "id": app_id,
        "manual_override_status": override_status,
        "manual_override_reason": reason,
        "manual_override_by": admin_username,
        "manual_override_at": now_iso
    }


def add_review_note(app_id: str, note: str, admin_username: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor.execute("SELECT id FROM applications WHERE id = ?", (app_id,))
    if not cursor.fetchone():
        conn.close()
        raise ValueError(f"Application {app_id} not found.")

    cursor.execute(
        "INSERT INTO review_notes (application_id, admin_username, note, created_at) VALUES (?, ?, ?, ?)",
        (app_id, admin_username, note.strip(), now_iso)
    )
    note_id = cursor.lastrowid

    cursor.execute(
        """
        INSERT INTO audit_logs (timestamp, admin_username, action, application_id, previous_value, new_value, details)
        VALUES (?, ?, 'ADD_NOTE', ?, NULL, NULL, ?)
        """,
        (now_iso, admin_username, app_id, f"Added review note: {note.strip()[:60]}...")
    )

    conn.commit()
    conn.close()

    return {
        "id": note_id,
        "application_id": app_id,
        "admin_username": admin_username,
        "note": note.strip(),
        "created_at": now_iso
    }


def query_applications(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    model_prediction: Optional[str] = None,
    review_status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    min_prob: Optional[float] = None,
    max_prob: Optional[float] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc"
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    conditions = []
    params = []

    if search and search.strip():
        term = f"%{search.strip()}%"
        conditions.append("(id LIKE ? OR applicant_data LIKE ?)")
        params.extend([term, term])

    if model_prediction and model_prediction in ("APPROVED", "REJECTED"):
        conditions.append("model_prediction = ?")
        params.append(model_prediction)

    if review_status and review_status in ("PENDING REVIEW", "UNDER REVIEW", "REVIEWED"):
        conditions.append("review_status = ?")
        params.append(review_status)

    if date_from:
        conditions.append("created_at >= ?")
        params.append(date_from)

    if date_to:
        conditions.append("created_at <= ?")
        params.append(date_to)

    if min_amount is not None:
        conditions.append("loan_amount >= ?")
        params.append(min_amount)

    if max_amount is not None:
        conditions.append("loan_amount <= ?")
        params.append(max_amount)

    if min_prob is not None:
        conditions.append("approval_probability >= ?")
        params.append(min_prob)

    if max_prob is not None:
        conditions.append("approval_probability <= ?")
        params.append(max_prob)

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    # Count total matching
    count_query = f"SELECT COUNT(*) AS total FROM applications {where_clause}"
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()["total"]

    # Validate sorting column
    allowed_sorts = {
        "created_at": "created_at",
        "loan_amount": "loan_amount",
        "credit_score": "credit_score",
        "approval_probability": "approval_probability",
        "foir": "foir",
        "dti_ratio": "dti_ratio",
        "id": "id"
    }
    col = allowed_sorts.get(sort_by, "created_at")
    order = "ASC" if sort_order.lower() == "asc" else "DESC"

    offset = (page - 1) * page_size
    query = f"""
        SELECT id, created_at, model_prediction, approval_probability,
               review_status, manual_override_status, loan_amount,
               credit_score, foir, dti_ratio, decision_threshold,
               applicant_data
        FROM applications
        {where_clause}
        ORDER BY {col} {order}
        LIMIT ? OFFSET ?
    """
    cursor.execute(query, params + [page_size, offset])
    rows = []
    for r in cursor.fetchall():
        item = dict(r)
        if "applicant_data" in item and item["applicant_data"]:
            try:
                item["applicant_data"] = json.loads(item["applicant_data"])
            except Exception:
                pass
        rows.append(item)
    conn.close()

    total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 1

    return {
        "items": rows,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


def get_overview_metrics(date_from: Optional[str] = None, date_to: Optional[str] = None) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    conditions = []
    params = []
    if date_from:
        conditions.append("created_at >= ?")
        params.append(date_from)
    if date_to:
        conditions.append("created_at <= ?")
        params.append(date_to)
    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    # Totals
    cursor.execute(f"""
        SELECT
            COUNT(*) AS total_applications,
            SUM(CASE WHEN model_prediction = 'APPROVED' THEN 1 ELSE 0 END) AS approved_count,
            SUM(CASE WHEN model_prediction = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_count,
            SUM(CASE WHEN review_status IN ('PENDING REVIEW', 'UNDER REVIEW') THEN 1 ELSE 0 END) AS pending_review_count,
            SUM(CASE WHEN review_status = 'REVIEWED' THEN 1 ELSE 0 END) AS reviewed_count,
            AVG(approval_probability) AS avg_probability,
            AVG(credit_score) AS avg_credit_score,
            AVG(foir) AS avg_foir,
            AVG(loan_amount) AS avg_loan_amount,
            SUM(loan_amount) AS total_loan_requested
        FROM applications
        {where_clause}
    """, params)
    row = dict(cursor.fetchone())
    total_apps = row["total_applications"] or 0
    approved = row["approved_count"] or 0
    rejected = row["rejected_count"] or 0
    approval_rate = round((approved / total_apps * 100), 2) if total_apps > 0 else 0.0

    # Applications over time (daily buckets)
    cursor.execute(f"""
        SELECT
            SUBSTR(created_at, 1, 10) AS date_bucket,
            COUNT(*) AS total,
            SUM(CASE WHEN model_prediction = 'APPROVED' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN model_prediction = 'REJECTED' THEN 1 ELSE 0 END) AS rejected
        FROM applications
        {where_clause}
        GROUP BY SUBSTR(created_at, 1, 10)
        ORDER BY date_bucket ASC
    """, params)
    time_series = cursor.fetchall()

    # Recent applications (last 5)
    cursor.execute(f"""
        SELECT id, created_at, model_prediction, approval_probability, review_status, loan_amount, credit_score, foir
        FROM applications
        {where_clause}
        ORDER BY created_at DESC
        LIMIT 5
    """, params)
    recent = cursor.fetchall()

    conn.close()

    return {
        "total_applications": total_apps,
        "approved_predictions": approved,
        "rejected_predictions": rejected,
        "pending_review_count": row["pending_review_count"] or 0,
        "under_review_count": row["pending_review_count"] or 0,
        "reviewed_count": row["reviewed_count"] or 0,
        "approval_rate": approval_rate,
        "avg_probability": round(row["avg_probability"] or 0.0, 4),
        "avg_credit_score": round(row["avg_credit_score"] or 0.0, 1),
        "avg_foir": round(row["avg_foir"] or 0.0, 4),
        "avg_loan_amount": round(row["avg_loan_amount"] or 0.0, 2),
        "total_loan_requested": round(row["total_loan_requested"] or 0.0, 2),
        "time_series": time_series,
        "recent_applications": recent
    }


def get_analytics_data() -> Dict[str, Any]:
    """Retrieves full distribution and feature correlation arrays from real persisted applications."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, created_at, model_prediction, approval_probability,
               review_status, loan_amount, credit_score, foir, dti_ratio,
               shap_explanation
        FROM applications
        ORDER BY created_at ASC
    """)
    rows = cursor.fetchall()

    points = []
    shap_positive_counts = {}
    shap_negative_counts = {}
    shap_importance_sums = {}
    total_shap_records = 0

    # 10 probability bins: [0-0.1), [0.1-0.2), ..., [0.9-1.0]
    prob_bins = [0] * 10

    for r in rows:
        prob = r["approval_probability"]
        bin_idx = min(9, int(prob * 10))
        prob_bins[bin_idx] += 1

        points.append({
            "id": r["id"],
            "date": r["created_at"],
            "prediction": r["model_prediction"],
            "prob": round(prob, 4),
            "loan_amount": r["loan_amount"],
            "credit_score": r["credit_score"],
            "foir": round(r["foir"], 4),
            "dti": round(r["dti_ratio"], 4),
            "review_status": r["review_status"]
        })

        try:
            exp = json.loads(r["shap_explanation"])
            total_shap_records += 1

            for pos in exp.get("positive_factors", []):
                label = pos.get("label", pos.get("feature"))
                shap_positive_counts[label] = shap_positive_counts.get(label, 0) + 1

            for neg in exp.get("negative_factors", []):
                label = neg.get("label", neg.get("feature"))
                shap_negative_counts[label] = shap_negative_counts.get(label, 0) + 1

            for f in exp.get("all_factors", []):
                label = f.get("label", f.get("feature"))
                abs_val = f.get("abs_shap", abs(f.get("shap_value", 0.0)))
                shap_importance_sums[label] = shap_importance_sums.get(label, 0.0) + abs_val
        except Exception:
            pass

    conn.close()

    # Calculate average absolute SHAP importance
    avg_shap_importance = []
    if total_shap_records > 0:
        for lbl, total_imp in shap_importance_sums.items():
            avg_shap_importance.append({
                "feature": lbl,
                "avg_abs_shap": round(total_imp / total_shap_records, 4)
            })
        avg_shap_importance.sort(key=lambda x: x["avg_abs_shap"], reverse=True)

    sorted_positive = sorted(
        [{"feature": k, "count": v} for k, v in shap_positive_counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )

    sorted_negative = sorted(
        [{"feature": k, "count": v} for k, v in shap_negative_counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )

    return {
        "total_records": len(points),
        "data_points": points,
        "probability_histogram": [
            {"range": f"{i*10}-{(i+1)*10}%", "count": prob_bins[i]} for i in range(10)
        ],
        "shap_summary": {
            "records_analyzed": total_shap_records,
            "top_positive_contributors": sorted_positive[:8],
            "top_negative_contributors": sorted_negative[:8],
            "average_feature_importance": avg_shap_importance[:10]
        }
    }


def get_audit_logs(page: int = 1, page_size: int = 30) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) AS total FROM audit_logs")
    total = cursor.fetchone()["total"]

    offset = (page - 1) * page_size
    cursor.execute(
        "SELECT id, timestamp, admin_username, action, application_id, previous_value, new_value, details FROM audit_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?",
        (page_size, offset)
    )
    items = cursor.fetchall()
    conn.close()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 1
    }
