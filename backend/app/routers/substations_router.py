from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Substation, User
from ..schemas import SubstationResponse, SubstationUpdate
from ..auth import get_current_user, require_role
from ..services.energy_engine import EnergyCalculationEngine
from ..audit import log_action

router = APIRouter(prefix="/api/substations", tags=["Postes Électriques"])

@router.get("", response_model=List[SubstationResponse])
def get_all_substations(db: Session = Depends(get_db)):
    """Retourne la liste des six postes électriques avec leurs métriques."""
    substations = db.query(Substation).all()
    results = []
    for s in substations:
        resp = SubstationResponse.model_validate(s)
        resp.meters_count = len(s.meters)
        results.append(resp)
    return results

@router.get("/{substation_id}/summary")
def get_substation_summary(substation_id: str, db: Session = Depends(get_db)):
    """Retourne la synthèse énergétique instantanée et quotidienne pour un poste donné."""
    substation = db.query(Substation).filter(Substation.id == substation_id).first()
    if not substation:
        raise HTTPException(status_code=404, detail="Poste électrique non trouvé.")
    return EnergyCalculationEngine.calculate_substation_summary(db, substation)

@router.put("/{substation_id}", response_model=SubstationResponse)
def update_substation(
    substation_id: str,
    update_data: SubstationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN_TECH", "RESPONSABLE_ENERGIE"]))
):
    """Mise à jour des paramètres d'un poste électrique (Administrateur / Responsable)."""
    substation = db.query(Substation).filter(Substation.id == substation_id).first()
    if not substation:
        raise HTTPException(status_code=404, detail="Poste électrique non trouvé.")

    old_val = {"name": substation.name, "breaker_state": substation.breaker_state}

    dumped = update_data.model_dump(exclude_unset=True)
    for key, value in dumped.items():
        setattr(substation, key, value)

    db.commit()
    db.refresh(substation)

    log_action(
        db,
        username=current_user.username,
        action="UPDATE_SUBSTATION",
        entity="SUBSTATION",
        entity_id=substation.id,
        old_value=old_val,
        new_value=dumped,
        user_id=current_user.id
    )

    return substation
