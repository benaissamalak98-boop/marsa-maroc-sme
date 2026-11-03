import json
import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from ..models import AlertRule, AlertIncident, EnergyReading, Substation

class AlertEngine:
    """Moteur de surveillance des seuils et de gestion du cycle de vie des alertes."""

    @classmethod
    def evaluate_reading(cls, db: Session, reading: EnergyReading, substation: Substation):
        """Évalue une lecture énergétique par rapport aux règles configurées."""
        rules = db.query(AlertRule).filter(AlertRule.is_enabled == True).all()

        for rule in rules:
            # Filtrer par poste si spécifié
            if rule.substation_id and rule.substation_id != substation.id:
                continue

            triggered = False
            observed_val = ""
            msg = ""

            # Règle 1: Facteur de puissance bas (Pénalité ONEE)
            if rule.rule_type == "COS_PHI_LOW" and reading.power_factor < rule.threshold_value:
                triggered = True
                observed_val = f"{reading.power_factor:.2f}"
                msg = f"Facteur de puissance inférieur au seuil ONEE ({observed_val} < {rule.threshold_value}). Risque de pénalité."

            # Règle 2: Distorsion harmonique THD élevée
            elif rule.rule_type == "THD_HIGH" and reading.thd_percent > rule.threshold_value:
                triggered = True
                observed_val = f"{reading.thd_percent:.1f} %"
                msg = f"Distorsion harmonique THD anormalement élevée ({observed_val} > {rule.threshold_value} %)."

            # Règle 3: Surcharge du transformateur
            elif rule.rule_type == "TRANSFO_OVERLOAD" and reading.transformer_load_percent > rule.threshold_value:
                triggered = True
                observed_val = f"{reading.transformer_load_percent:.1f} %"
                msg = f"Taux de charge du transformateur en zone critique ({observed_val} > {rule.threshold_value} %)."

            # Règle 4: Dépassement de puissance active
            elif rule.rule_type == "POWER_THRESHOLD" and reading.active_power_kw > rule.threshold_value:
                triggered = True
                observed_val = f"{reading.active_power_kw:.0f} kW"
                msg = f"Appel de puissance active supérieur au seuil d'avertissement ({observed_val} > {rule.threshold_value} kW)."

            if triggered:
                # Vérifier si une alerte ouverte existe déjà pour éviter le spamming
                existing = db.query(AlertIncident).filter(
                    AlertIncident.rule_id == rule.id,
                    AlertIncident.substation_id == substation.id,
                    AlertIncident.status.in_(["NOUVELLE", "PRISE_EN_CHARGE"])
                ).first()

                if not existing:
                    incident = AlertIncident(
                        id=f"alt-{uuid.uuid4().hex[:8]}",
                        rule_id=rule.id,
                        substation_id=substation.id,
                        meter_id=reading.meter_id,
                        timestamp=datetime.utcnow(),
                        severity=rule.severity,
                        title=f"Alerte {rule.name} — {substation.code}",
                        message=msg,
                        observed_value=observed_val,
                        threshold_value=f"{rule.threshold_value} {rule.threshold_unit}",
                        status="NOUVELLE",
                        comments=json.dumps([f"Incident détecté automatiquement à {datetime.utcnow().strftime('%H:%M:%S')}"])
                    )
                    db.add(incident)
                    db.commit()

    @classmethod
    def update_incident_status(
        cls,
        db: Session,
        incident_id: str,
        new_status: str,
        username: str,
        comment: Optional[str] = None
    ) -> Optional[AlertIncident]:
        """Met à jour le statut d'une alerte (PRISE_EN_CHARGE ou CLOTUREE) avec traçabilité."""
        incident = db.query(AlertIncident).filter(AlertIncident.id == incident_id).first()
        if not incident:
            return None

        incident.status = new_status
        now = datetime.utcnow()

        if new_status == "PRISE_EN_CHARGE":
            incident.acknowledged_by = username
            incident.acknowledged_at = now
        elif new_status == "CLOTUREE":
            incident.closed_by = username
            incident.closed_at = now

        # Append comment
        comments_list = []
        try:
            if incident.comments:
                comments_list = json.loads(incident.comments)
        except Exception:
            comments_list = []

        action_msg = f"{new_status} par {username} le {now.strftime('%d/%m/%Y %H:%M')}"
        if comment:
            action_msg += f" : {comment}"
        comments_list.append(action_msg)
        incident.comments = json.dumps(comments_list, ensure_ascii=False)

        db.commit()
        db.refresh(incident)
        return incident
