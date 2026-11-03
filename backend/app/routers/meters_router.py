import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Meter, RegisterMapping, Substation, User
from ..schemas import (
    MeterCreate, MeterUpdate, MeterResponse,
    RegisterMappingCreate, RegisterMappingResponse,
    ModbusTestRequest, ModbusTestResponse
)
from ..auth import get_current_user, require_role
from ..services.modbus_service import ModbusAcquisitionService
from ..audit import log_action

router = APIRouter(prefix="/api/meters", tags=["Compteurs & Modbus"])

@router.get("", response_model=List[MeterResponse])
def get_meters(
    substation_id: Optional[str] = None,
    mode: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Liste tous les compteurs communicants avec filtrage optionnel."""
    query = db.query(Meter)
    if substation_id:
        query = query.filter(Meter.substation_id == substation_id)
    if mode:
        query = query.filter(Meter.mode == mode)
    return query.all()

@router.get("/{meter_id}", response_model=MeterResponse)
def get_meter(meter_id: str, db: Session = Depends(get_db)):
    """Détail d'un compteur et sa cartographie de registres."""
    meter = db.query(Meter).filter(Meter.id == meter_id).first()
    if not meter:
        raise HTTPException(status_code=404, detail="Compteur introuvable.")
    return meter

@router.post("", response_model=MeterResponse, status_code=status.HTTP_201_CREATED)
def create_meter(
    meter_in: MeterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN_TECH", "RESPONSABLE_ENERGIE"]))
):
    """Création d'un nouveau compteur communicant."""
    existing = db.query(Meter).filter(Meter.code == meter_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un compteur avec ce code existe déjà.")

    data = meter_in.model_dump()
    meter = Meter(
        id=f"mtr-{uuid.uuid4().hex[:8]}",
        **data
    )
    db.add(meter)
    db.commit()
    db.refresh(meter)

    # Initialiser les registres par défaut selon les spécifications
    default_regs = [
        {"variable_name": "ACTIVE_POWER_KW", "register_address": 3000, "unit": "kW"},
        {"variable_name": "REACTIVE_POWER_KVAR", "register_address": 3002, "unit": "kVAR"},
        {"variable_name": "APPARENT_POWER_KVA", "register_address": 3004, "unit": "kVA"},
        {"variable_name": "POWER_FACTOR", "register_address": 3006, "unit": "cos φ"},
        {"variable_name": "VOLTAGE_V", "register_address": 3008, "unit": "V"},
        {"variable_name": "CURRENT_A", "register_address": 3010, "unit": "A"},
        {"variable_name": "THD_PERCENT", "register_address": 3012, "unit": "%"},
        {"variable_name": "ACTIVE_ENERGY_KWH", "register_address": 3014, "unit": "kWh"},
    ]
    for r in default_regs:
        reg = RegisterMapping(meter_id=meter.id, **r)
        db.add(reg)
    db.commit()
    db.refresh(meter)

    log_action(
        db,
        username=current_user.username,
        action="CREATE_METER",
        entity="METER",
        entity_id=meter.id,
        new_value=data,
        user_id=current_user.id
    )

    return meter

@router.put("/{meter_id}", response_model=MeterResponse)
def update_meter(
    meter_id: str,
    update_data: MeterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN_TECH", "RESPONSABLE_ENERGIE"]))
):
    """Mise à jour de la configuration réseau et Modbus d'un compteur."""
    meter = db.query(Meter).filter(Meter.id == meter_id).first()
    if not meter:
        raise HTTPException(status_code=404, detail="Compteur introuvable.")

    old_val = {"name": meter.name, "ip_address": meter.ip_address, "mode": meter.mode}

    dumped = update_data.model_dump(exclude_unset=True)
    for key, value in dumped.items():
        setattr(meter, key, value)

    db.commit()
    db.refresh(meter)

    log_action(
        db,
        username=current_user.username,
        action="UPDATE_METER",
        entity="METER",
        entity_id=meter.id,
        old_value=old_val,
        new_value=dumped,
        user_id=current_user.id
    )

    return meter

@router.post("/test-comm", response_model=ModbusTestResponse)
def test_modbus_communication(request: ModbusTestRequest):
    """Effectue un test de connexion Modbus TCP en direct."""
    result = ModbusAcquisitionService.test_communication(
        ip_address=request.ip_address,
        port=request.port,
        unit_id=request.unit_id,
        function_code=request.function_code,
        register_address=request.register_address,
        register_count=request.register_count,
        timeout_sec=request.timeout_sec,
        simulate=request.simulate or False
    )
    return result
