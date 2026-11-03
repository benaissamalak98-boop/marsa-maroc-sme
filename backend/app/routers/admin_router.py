import uuid
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    User, AuditLog, Substation, Meter, RegisterMapping,
    EnergyReading, EnergyIndicator, EnergyBaseline, AlertRule, AlertIncident
)
from ..schemas import UserResponse, UserCreate, AuditLogResponse
from ..auth import hash_password, get_current_user, require_role
from ..audit import log_action

router = APIRouter(prefix="/api/admin", tags=["Administration & Audit"])

@router.get("/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN_TECH", "RESPONSABLE_ENERGIE"]))
):
    """Liste tous les comptes utilisateurs enregistrés."""
    return db.query(User).all()

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN_TECH"]))
):
    """Création d'un nouvel utilisateur avec rôle sécurisé."""
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ce nom d'utilisateur est déjà utilisé.")

    hashed_pw, salt = hash_password(user_in.password)
    new_user = User(
        id=f"usr-{uuid.uuid4().hex[:8]}",
        username=user_in.username,
        hashed_password=hashed_pw,
        salt=salt,
        full_name=user_in.full_name,
        email=user_in.email,
        role=user_in.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_action(
        db,
        username=current_user.username,
        action="CREATE_USER",
        entity="USER",
        entity_id=new_user.id,
        new_value={"username": new_user.username, "role": new_user.role},
        user_id=current_user.id
    )

    return new_user

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    action: Optional[str] = None,
    username: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN_TECH", "RESPONSABLE_ENERGIE", "AUDITEUR"]))
):
    """Consulte le journal d'audit des actions sensibles."""
    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    if action:
        query = query.filter(AuditLog.action == action)
    if username:
        query = query.filter(AuditLog.username == username)
    return query.limit(limit).all()

@router.post("/reset-demo")
def reset_demo_database(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN_TECH"]))
):
    """Réinitialise les données de démonstration de manière contrôlée et traçable."""
    seed_demo_data(db)
    log_action(
        db,
        username=current_user.username,
        action="RESET_DEMO_DATA",
        entity="SYSTEM",
        user_id=current_user.id
    )
    return {"message": "Base de données de démonstration réinitialisée avec succès."}

def seed_demo_data(db: Session):
    """Peuple la base de données avec les six postes, les utilisateurs et la configuration de référence."""
    # 1. Utilisateurs de démonstration par rôle
    users_seed = [
        {"username": "admin", "full_name": "Administrateur Technique DEPA", "role": "ADMIN_TECH", "pw": "admin2026"},
        {"username": "energie.depa", "full_name": "Responsable Énergie Port d'Agadir", "role": "RESPONSABLE_ENERGIE", "pw": "marsa2026"},
        {"username": "exploitant", "full_name": "Opérateur de Conduite SCADA", "role": "EXPLOITANT", "pw": "exploit2026"},
        {"username": "auditeur", "full_name": "Auditeur Énergétique ISO 50001", "role": "AUDITEUR", "pw": "audit2026"},
    ]

    for u in users_seed:
        existing = db.query(User).filter(User.username == u["username"]).first()
        if not existing:
            h_pw, s = hash_password(u["pw"])
            db.add(User(
                id=f"usr-{u['username']}",
                username=u["username"],
                hashed_password=h_pw,
                salt=s,
                full_name=u["full_name"],
                email=f"{u['username']}@marsamaroc.ma",
                role=u["role"],
                is_active=True
            ))
    db.commit()

    # 2. Les six postes électriques DEPA
    substations_seed = [
        {
            "id": "sub-source",
            "code": "PS-60/22",
            "name": "Poste Source ONEE Anza / DEPA",
            "description": "Poste de livraison Haute/Moyenne Tension reliant le réseau national ONEE à la boucle 22 kV interne.",
            "voltage_primary": "60kV",
            "voltage_secondary": "22kV",
            "transformer_rating_kva": 10000.0,
            "location_x": 18.0,
            "location_y": 22.0,
            "zone_name": "Zone Nord-Est / Accès Réseau ONEE",
            "breaker_state": True
        },
        {
            "id": "sub-depa-main",
            "code": "PP-DEPA",
            "name": "Poste Principal de Répartition DEPA",
            "description": "Cellules de répartition MT 22 kV avec disjoncteurs SF6 télécommandés et centrales de mesure classe 0.2S.",
            "voltage_primary": "22kV",
            "voltage_secondary": "22kV",
            "transformer_rating_kva": 4000.0,
            "location_x": 38.0,
            "location_y": 35.0,
            "zone_name": "Cœur Industriel DEPA",
            "breaker_state": True
        },
        {
            "id": "sub-tc1",
            "code": "PT1-CONT",
            "name": "Poste Terminal à Conteneurs (PT1)",
            "description": "Alimentation des engins de levage lourds à variation de vitesse régénérative (STS 1-2) et parcs reefers.",
            "voltage_primary": "22kV",
            "voltage_secondary": "400V",
            "transformer_rating_kva": 1600.0,
            "location_x": 55.0,
            "location_y": 62.0,
            "zone_name": "Terminal Conteneurs — Quai Nord",
            "breaker_state": True
        },
        {
            "id": "sub-frigo",
            "code": "PT3-FRIGO",
            "name": "Poste Complexe Frigorifique & Primeurs",
            "description": "Alimentation continue des 6 centrales frigorifiques NH3/CO2 pour les exportations d'agrumes et produits halieutiques.",
            "voltage_primary": "22kV",
            "voltage_secondary": "400V",
            "transformer_rating_kva": 2000.0,
            "location_x": 74.0,
            "location_y": 38.0,
            "zone_name": "Zone Agro-Alimentaire Souss-Massa",
            "breaker_state": True
        },
        {
            "id": "sub-vrac",
            "code": "PT2-POLY",
            "name": "Poste Terminal Polyvalent & Vracquiers",
            "description": "Poste alimentant les grues mobiles Gottwald HMK, clinker, minerais et convoyeurs d'ensachage.",
            "voltage_primary": "22kV",
            "voltage_secondary": "400V",
            "transformer_rating_kva": 1250.0,
            "location_x": 42.0,
            "location_y": 78.0,
            "zone_name": "Quai Polyvalent & Darse Vrac",
            "breaker_state": True
        },
        {
            "id": "sub-ops",
            "code": "PT6-OPS",
            "name": "Poste Shore-to-Ship / OPS Navires",
            "description": "Connexion électrique à quai (Cold Ironing) permettant aux navires d'arrêter leurs moteurs diesel auxiliaires.",
            "voltage_primary": "22kV",
            "voltage_secondary": "6.6kV",
            "transformer_rating_kva": 2500.0,
            "location_x": 68.0,
            "location_y": 82.0,
            "zone_name": "Front de Mer — Postes d'Accostage",
            "breaker_state": True
        },
    ]

    for s in substations_seed:
        existing = db.query(Substation).filter(Substation.id == s["id"]).first()
        if not existing:
            db.add(Substation(**s))
    db.commit()

    # 3. Compteurs communicants de démonstration
    meters_seed = [
        {"id": "mtr-01-pp", "code": "MTR-PP-01", "name": "Compteur Général PP-DEPA", "substation_id": "sub-depa-main", "counting_point_tag": "CP-PP-GEN", "ip_address": "192.168.10.10", "port": 502, "mode": "SIMULATION"},
        {"id": "mtr-02-tc", "code": "MTR-TC-01", "name": "Compteur Portiques STS Quai Nord", "substation_id": "sub-tc1", "counting_point_tag": "CP-TC-STS", "ip_address": "192.168.10.21", "port": 502, "mode": "SIMULATION"},
        {"id": "mtr-03-frigo", "code": "MTR-FRIGO-01", "name": "Compteur Centrales Froid Souss", "substation_id": "sub-frigo", "counting_point_tag": "CP-FRIGO-NH3", "ip_address": "192.168.10.31", "port": 502, "mode": "SIMULATION"},
        {"id": "mtr-04-vrac", "code": "MTR-VRAC-01", "name": "Compteur Grues Gottwald Vrac", "substation_id": "sub-vrac", "counting_point_tag": "CP-VRAC-CRANES", "ip_address": "192.168.10.41", "port": 502, "mode": "SIMULATION"},
        {"id": "mtr-05-ops", "code": "MTR-OPS-01", "name": "Compteur Borne Quai Shore-to-Ship", "substation_id": "sub-ops", "counting_point_tag": "CP-OPS-BERTH", "ip_address": "192.168.10.61", "port": 502, "mode": "SIMULATION"},
    ]

    for m in meters_seed:
        existing = db.query(Meter).filter(Meter.id == m["id"]).first()
        if not existing:
            meter = Meter(**m)
            db.add(meter)
            db.commit()
            # Ajout des registres
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
                db.add(RegisterMapping(meter_id=meter.id, **r))
            db.commit()

    # 4. Indicateurs IPÉ
    ipes_seed = [
        {
            "id": "ipe-01-sec-tc",
            "code": "IPE-01-SEC-TC",
            "name": "Consommation Spécifique Manutention Conteneurs",
            "description": "Consommation électrique par Equivalent Vingt Pieds (EVP) manipulé.",
            "formula_expression": "E_TC / TEU_COUNT",
            "unit": "kWh / EVP",
            "energy_scope": "Terminal Conteneurs",
            "aggregation_period": "DAILY",
            "target_value": 15.5,
            "current_value": 14.8
        },
        {
            "id": "ipe-02-frigo-spec",
            "code": "IPE-02-FRIGO-SPEC",
            "name": "Ratio Énergétique Froid Primeurs",
            "description": "Énergie consommée par m³ de volume frigorifique sous température dirigée.",
            "formula_expression": "E_FRIGO / VOLUME_M3",
            "unit": "kWh / m³ / jour",
            "energy_scope": "Complexe Frigorifique",
            "aggregation_period": "DAILY",
            "target_value": 0.090,
            "current_value": 0.082
        },
        {
            "id": "ipe-03-ops-elect",
            "code": "IPE-03-OPS-ELECT",
            "name": "Taux d'Électrification des Escales Navires",
            "description": "Ratio des escales raccordées au Cold Ironing vs total escales éligibles.",
            "formula_expression": "CONNECTED_BERTHS / ELIGIBLE_BERTHS * 100",
            "unit": "% escales",
            "energy_scope": "Quai OPS",
            "aggregation_period": "MONTHLY",
            "target_value": 70.0,
            "current_value": 68.5
        },
        {
            "id": "ipe-04-global-cos",
            "code": "IPE-04-GLOBAL-COS",
            "name": "Facteur de Puissance Global Réseau DEPA",
            "description": "Suivi du cos φ global par rapport au seuil de facturation ONEE (0.92).",
            "formula_expression": "P_GLOBAL / S_GLOBAL",
            "unit": "cos φ",
            "energy_scope": "Port Global",
            "aggregation_period": "HOURLY",
            "target_value": 0.95,
            "current_value": 0.97
        }
    ]

    for ip in ipes_seed:
        existing = db.query(EnergyIndicator).filter(EnergyIndicator.id == ip["id"]).first()
        if not existing:
            db.add(EnergyIndicator(**ip))
    db.commit()

    # 5. Situation Énergétique de Référence (SER)
    existing_ser = db.query(EnergyBaseline).filter(EnergyBaseline.id == "ser-depa-2025").first()
    if not existing_ser:
        db.add(EnergyBaseline(
            id="ser-depa-2025",
            code="SER-2025-V1",
            name="Situation Énergétique de Référence ISO 50001 (Année 2025)",
            version="v1.2",
            period_start=datetime(2025, 1, 1),
            period_end=datetime(2025, 12, 31),
            baseline_consumption_kwh=51000.0,
            relevant_variables='{"trafic_annuel_evp": 240000, "tonnage_vrac": 3200000, "volume_frigo_m3": 45000}',
            calculation_method="MULTIVARIATE_LINEAR_REGRESSION",
            formula_summary="E_ref = 0.082*Volume_Frigo + 15.2*EVP + 0.75*Tonnage + P_talon",
            assumptions_doc="Hypothèses basées sur la revue énergétique 2025 validée par le comité énergie DEPA.",
            is_active=True
        ))
    db.commit()

    # 6. Règles d'alertes & Incidents de démonstration
    rules_seed = [
        {"id": "rul-01", "code": "RUL-COS-PHI", "name": "Dégradation Facteur de Puissance", "rule_type": "COS_PHI_LOW", "threshold_value": 0.92, "threshold_unit": "cos φ", "severity": "WARNING"},
        {"id": "rul-02", "code": "RUL-THD-HARMONIQUE", "name": "Distorsion Harmonique THD Élevée", "rule_type": "THD_HIGH", "threshold_value": 5.0, "threshold_unit": "%", "severity": "WARNING"},
        {"id": "rul-03", "code": "RUL-SURCHARGE-TRANSFO", "name": "Surcharge Transformateur MT", "rule_type": "TRANSFO_OVERLOAD", "threshold_value": 85.0, "threshold_unit": "%", "severity": "CRITICAL"},
        {"id": "rul-04", "code": "RUL-PEAK-DEMAND", "name": "Alerte Dépassement Puissance Souscrite", "rule_type": "POWER_THRESHOLD", "threshold_value": 4200.0, "threshold_unit": "kW", "severity": "CRITICAL"},
    ]

    for r in rules_seed:
        existing = db.query(AlertRule).filter(AlertRule.id == r["id"]).first()
        if not existing:
            db.add(AlertRule(**r))
    db.commit()

    # Incidents d'exemple
    incidents_seed = [
        {
            "id": "alt-demo-01",
            "rule_id": "rul-01",
            "substation_id": "sub-tc1",
            "meter_id": "mtr-02-tc",
            "timestamp": datetime.utcnow() - timedelta(minutes=45),
            "severity": "WARNING",
            "title": "Alerte Facteur Cos φ — Quai Nord",
            "message": "Facteur de puissance mesuré à 0.91 pendant la montée de charge du portique STS 02 (seuil minimal ONEE = 0.92).",
            "observed_value": "0.91",
            "threshold_value": "0.92 cos φ",
            "status": "NOUVELLE",
            "comments": '["Incident détecté par automate de mesure PM8000"]'
        },
        {
            "id": "alt-demo-02",
            "rule_id": "rul-02",
            "substation_id": "sub-tc1",
            "meter_id": "mtr-02-tc",
            "timestamp": datetime.utcnow() - timedelta(hours=2),
            "severity": "INFO",
            "title": "Harmoniques de courant en phase de freinage régénératif",
            "message": "THD mesuré à 3.8% sur le bus continu du portique STS 01.",
            "observed_value": "3.8 %",
            "threshold_value": "5.0 %",
            "status": "PRISE_EN_CHARGE",
            "acknowledged_by": "exploitant",
            "acknowledged_at": datetime.utcnow() - timedelta(hours=1, minutes=45),
            "comments": '["Pris en charge par l\'exploitant : contrôle des filtres anti-harmoniques planifié."]'
        }
    ]

    for inc in incidents_seed:
        existing = db.query(AlertIncident).filter(AlertIncident.id == inc["id"]).first()
        if not existing:
            db.add(AlertIncident(**inc))
    db.commit()
