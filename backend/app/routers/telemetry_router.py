from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Substation, EnergyReading
from ..schemas import EnergyReadingResponse
from ..services.energy_engine import EnergyCalculationEngine

router = APIRouter(prefix="/api/telemetry", tags=["Télémétrie & Courbes"])

@router.get("/curves")
def get_energy_curves(
    substation_id: Optional[str] = Query(None, description="Filtrer par poste"),
    period: str = Query("DAY", description="Période : DAY, WEEK, MONTH"),
    db: Session = Depends(get_db)
):
    """Retourne les séries temporelles de consommation pour les graphiques interactifs."""
    return EnergyCalculationEngine.get_power_curves(db, substation_id, period)

@router.get("/comparison")
def get_substations_comparison(db: Session = Depends(get_db)):
    """Tableau comparatif des indicateurs énergétiques des six postes."""
    substations = db.query(Substation).all()
    comparison = []
    for s in substations:
        summary = EnergyCalculationEngine.calculate_substation_summary(db, s)
        comparison.append(summary)
    return comparison

@router.get("/latest", response_model=List[EnergyReadingResponse])
def get_latest_readings(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retourne les dernières mesures enregistrées en base."""
    readings = db.query(EnergyReading).order_by(EnergyReading.timestamp.desc()).limit(limit).all()
    return readings
