import json
from datetime import datetime
from sqlalchemy.orm import Session
from .models import AuditLog

def log_action(
    db: Session,
    username: str,
    action: str,
    entity: str,
    entity_id: str = None,
    old_value: dict = None,
    new_value: dict = None,
    ip_address: str = "127.0.0.1",
    user_id: str = None
):
    """Enregistre une action sensible dans le journal d'audit."""
    entry = AuditLog(
        timestamp=datetime.utcnow(),
        username=username,
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        old_value=json.dumps(old_value, ensure_ascii=False) if old_value else None,
        new_value=json.dumps(new_value, ensure_ascii=False) if new_value else None,
        ip_address=ip_address
    )
    db.add(entry)
    db.commit()
    return entry
