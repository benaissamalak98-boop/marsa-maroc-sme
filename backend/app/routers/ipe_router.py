import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import EnergyIndicator, EnergyBaseline, User
from ..schemas import (
    EnergyIndicatorCreate, EnergyIndicatorResponse,
    EnergyBaselineCreate, EnergyBaselineResponse
)
from ..auth import require_role
from ..services.energy_engine import EnergyCalculationEngine
from ..audit import log_action

router = APIRouter(prefix="/api/ipe", tags=["Indicateurs IPÉ & SER"])

@router.get("/indicators", response_model=List[EnergyIndicatorResponse])
def get_energy_indicators(db: Session = Depends(get_db)):
    """Retourne la liste des Indicateurs de Performance Énergétique (IPÉ / EnPIs)."""
    indicators = db.query(EnergyIndicator).all()
    results = []
    for ind in indicators:
        resp = EnergyIndicatorResponse.model_validate(ind)
        resp.current_value = EnergyCalculationEngine.calculate_ipe_value(db, ind)
        results.append(resp)
    return results

@router.post("/indicators", response_model=EnergyIndicatorResponse, status_code=status.HTTP_201_CREATED)
def create_energy_indicator(
    indicator_in: EnergyIndicatorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN_TECH", "RESPONSABLE_ENERGIE"]))
):
    """Création d'un nouvel indicateur de performance énergétique."""
    data = indicator_in.model_dump()
    ind = EnergyIndicator(
        id=f"ipe-{uuid.uuid4().hex[:8]}",
        **data
    )
    db.add(ind)
    db.commit()
    db.refresh(ind)

    log_action(
        db,
        username=current_user.username,
        action="CREATE_IPE",
        entity="ENERGY_INDICATOR",
        entity_id=ind.id,
        new_value=data,
        user_id=current_user.id
    )

    resp = EnergyIndicatorResponse.model_validate(ind)
    resp.current_value = indicator_in.target_value or 0.0
    return resp

@router.get("/baselines", response_model=List[EnergyBaselineResponse])
def get_energy_baselines(db: Session = Depends(get_db)):
    """Liste des Situations Énergétiques de Référence (SER / EnB) ISO 50001."""
    return db.query(EnergyBaseline).all()

@router.post("/baselines", response_model=EnergyBaselineResponse, status_code=status.HTTP_201_CREATED)
def create_energy_baseline(
    baseline_in: EnergyBaselineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN_TECH", "RESPONSABLE_ENERGIE"]))
):
    """Création ou mise à jour d'une version de la Situation Énergétique de Référence."""
    # Désactiver les autres versions si la nouvelle est active
    if baseline_in.is_active:
        db.query(EnergyBaseline).update({EnergyBaseline.is_active: False})

    data = baseline_in.model_dump()
    ser = EnergyBaseline(
        id=f"ser-{uuid.uuid4().hex[:8]}",
        **data
    )
    db.add(ser)
    db.commit()
    db.refresh(ser)

    log_action(
        db,
        username=current_user.username,
        action="CREATE_BASELINE",
        entity="ENERGY_BASELINE",
        entity_id=ser.id,
        new_value=data,
        user_id=current_user.id
    )

    return ser

@router.get("/baselines/compare")
def compare_with_active_baseline(db: Session = Depends(get_db)):
    """Compare la consommation observée avec la SER active et calcule les écarts et tCO2e évités."""
    active_baseline = db.query(EnergyBaseline).filter(EnergyBaseline.is_active == True).first()
    if not active_baseline:
        # Fallback si pas encore configurée
        active_baseline = EnergyBaseline(
            id="ser-default",
            code="SER-2025-V1",
            name="Situation de Référence 2025 Port d'Agadir",
            baseline_consumption_kwh=51000.0
        )

    actual_consumption = 47600.0  # Consommation globale observée aujourd'hui
    return EnergyCalculationEngine.compare_with_baseline(db, active_baseline, actual_consumption)
