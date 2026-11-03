from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AlertIncident, AlertRule, User
from ..schemas import AlertIncidentResponse, AlertStatusUpdate, AlertRuleResponse, AlertRuleCreate
from ..auth import get_current_user, require_role
from ..services.alert_engine import AlertEngine
from ..audit import log_action

router = APIRouter(prefix="/api/alerts", tags=["Alertes & Incidents"])

@router.get("", response_model=List[AlertIncidentResponse])
def get_alerts(
    status_filter: Optional[str] = Query(None, alias="status", description="NOUVELLE, PRISE_EN_CHARGE, CLOTUREE"),
    severity_filter: Optional[str] = Query(None, alias="severity"),
    substation_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Liste des incidents et alertes avec filtres de tri."""
    query = db.query(AlertIncident).order_by(AlertIncident.timestamp.desc())
    if status_filter:
        query = query.filter(AlertIncident.status == status_filter)
    if severity_filter:
        query = query.filter(AlertIncident.severity == severity_filter)
    if substation_id:
        query = query.filter(AlertIncident.substation_id == substation_id)
    return query.all()

@router.put("/{incident_id}/status", response_model=AlertIncidentResponse)
def update_alert_status(
    incident_id: str,
    update_data: AlertStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Prise en charge ou clôture d'un incident énergétique."""
    incident = AlertEngine.update_incident_status(
        db,
        incident_id=incident_id,
        new_status=update_data.status,
        username=current_user.username,
        comment=update_data.comment
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident introuvable.")

    log_action(
        db,
        username=current_user.username,
        action="UPDATE_ALERT_STATUS",
        entity="ALERT_INCIDENT",
        entity_id=incident.id,
        new_value={"status": update_data.status, "comment": update_data.comment},
        user_id=current_user.id
    )

    return incident

@router.get("/rules", response_model=List[AlertRuleResponse])
def get_alert_rules(db: Session = Depends(get_db)):
    """Liste des règles de déclenchement d'alertes configurées."""
    return db.query(AlertRule).all()

@router.post("/rules", response_model=AlertRuleResponse, status_code=status.HTTP_201_CREATED)
def create_alert_rule(
    rule_in: AlertRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN_TECH", "RESPONSABLE_ENERGIE"]))
):
    """Création d'une nouvelle règle d'alerte et de seuil."""
    import uuid
    data = rule_in.model_dump()
    rule = AlertRule(
        id=f"rul-{uuid.uuid4().hex[:8]}",
        **data
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)

    log_action(
        db,
        username=current_user.username,
        action="CREATE_ALERT_RULE",
        entity="ALERT_RULE",
        entity_id=rule.id,
        new_value=data,
        user_id=current_user.id
    )

    return rule
