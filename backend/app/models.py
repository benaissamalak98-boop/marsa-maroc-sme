from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    salt = Column(String(64), nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    role = Column(String(30), nullable=False) # ADMIN_TECH, RESPONSABLE_ENERGIE, EXPLOITANT, AUDITEUR
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    username = Column(String(50), nullable=False, index=True)
    user_id = Column(String(50), nullable=True)
    action = Column(String(50), nullable=False)
    entity = Column(String(50), nullable=False)
    entity_id = Column(String(50), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")

class Substation(Base):
    __tablename__ = "substations"

    id = Column(String(50), primary_key=True)
    code = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    voltage_primary = Column(String(20), nullable=False)
    voltage_secondary = Column(String(20), nullable=False)
    transformer_rating_kva = Column(Float, nullable=False)
    location_x = Column(Float, default=50.0)
    location_y = Column(Float, default=50.0)
    zone_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    breaker_state = Column(Boolean, default=True) # True=Fermé (en service), False=Ouvert
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    meters = relationship("Meter", back_populates="substation", cascade="all, delete-orphan")
    readings = relationship("EnergyReading", back_populates="substation", cascade="all, delete-orphan")

class Meter(Base):
    __tablename__ = "meters"

    id = Column(String(50), primary_key=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    substation_id = Column(String(50), ForeignKey("substations.id"), nullable=False)
    counting_point_tag = Column(String(50), nullable=False)
    manufacturer = Column(String(50), default="Schneider Electric")
    model = Column(String(50), default="PowerLogic PM8000")
    ip_address = Column(String(50), default="127.0.0.1")
    port = Column(Integer, default=502)
    unit_id = Column(Integer, default=1)
    protocol = Column(String(30), default="MODBUS_TCP") # MODBUS_TCP, MODBUS_RTU_OVER_TCP
    acquisition_interval_sec = Column(Integer, default=5)
    timeout_sec = Column(Float, default=3.0)
    retry_count = Column(Integer, default=3)
    mode = Column(String(20), default="SIMULATION") # REAL ou SIMULATION
    is_active = Column(Boolean, default=True)
    last_communication = Column(DateTime, nullable=True)
    comm_status = Column(String(30), default="SIMULATING") # CONNECTED, TIMEOUT, ERROR, DISABLED, SIMULATING
    last_error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    substation = relationship("Substation", back_populates="meters")
    registers = relationship("RegisterMapping", back_populates="meter", cascade="all, delete-orphan")
    readings = relationship("EnergyReading", back_populates="meter", cascade="all, delete-orphan")

class RegisterMapping(Base):
    __tablename__ = "register_mappings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    meter_id = Column(String(50), ForeignKey("meters.id"), nullable=False)
    variable_name = Column(String(50), nullable=False)
    register_address = Column(Integer, nullable=False)
    register_count = Column(Integer, default=2)
    function_code = Column(Integer, default=3) # 3: Read Holding, 4: Read Input
    data_type = Column(String(20), default="FLOAT32") # FLOAT32, INT32, UINT32, INT16, UINT16
    scale_factor = Column(Float, default=1.0)
    unit = Column(String(20), nullable=False)
    is_enabled = Column(Boolean, default=True)

    meter = relationship("Meter", back_populates="registers")

class EnergyReading(Base):
    __tablename__ = "energy_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    received_at = Column(DateTime, default=datetime.utcnow)
    substation_id = Column(String(50), ForeignKey("substations.id"), nullable=False, index=True)
    meter_id = Column(String(50), ForeignKey("meters.id"), nullable=False, index=True)
    active_power_kw = Column(Float, nullable=False)
    reactive_power_kvar = Column(Float, nullable=False)
    apparent_power_kva = Column(Float, nullable=False)
    power_factor = Column(Float, nullable=False)
    voltage_v = Column(Float, nullable=False)
    current_a = Column(Float, nullable=False)
    frequency_hz = Column(Float, default=50.0)
    thd_percent = Column(Float, default=2.0)
    active_energy_kwh = Column(Float, default=0.0)
    transformer_load_percent = Column(Float, default=0.0)
    source = Column(String(20), default="SIMULATED") # REAL, SIMULATED
    quality_status = Column(String(30), default="SIMULATED") # REAL, SIMULATED, ESTIMATED, MISSING, INVALID, COMMUNICATION_ERROR

    substation = relationship("Substation", back_populates="readings")
    meter = relationship("Meter", back_populates="readings")

class EnergyIndicator(Base):
    __tablename__ = "energy_indicators"

    id = Column(String(50), primary_key=True)
    code = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    formula_expression = Column(String(255), nullable=False)
    source_variables = Column(Text, default="[]") # JSON list of variable tags
    unit = Column(String(30), nullable=False)
    energy_scope = Column(String(50), nullable=False)
    aggregation_period = Column(String(20), default="HOURLY") # HOURLY, DAILY, MONTHLY
    target_value = Column(Float, nullable=True)
    current_value = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    effective_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class EnergyBaseline(Base):
    __tablename__ = "energy_baselines"

    id = Column(String(50), primary_key=True)
    code = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    version = Column(String(20), default="v1.0")
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    baseline_consumption_kwh = Column(Float, nullable=False)
    relevant_variables = Column(Text, default="{}") # JSON dict
    calculation_method = Column(String(50), default="LINEAR_REGRESSION")
    formula_summary = Column(String(255), nullable=True)
    assumptions_doc = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(String(50), primary_key=True)
    code = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    substation_id = Column(String(50), nullable=True)
    meter_id = Column(String(50), nullable=True)
    rule_type = Column(String(50), nullable=False) # COMM_LOSS, POWER_THRESHOLD, COS_PHI_LOW, THD_HIGH, TRANSFO_OVERLOAD, ENERGY_DEVIATION
    threshold_value = Column(Float, nullable=False)
    threshold_unit = Column(String(20), nullable=False)
    severity = Column(String(20), default="WARNING") # INFO, WARNING, CRITICAL
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AlertIncident(Base):
    __tablename__ = "alert_incidents"

    id = Column(String(50), primary_key=True)
    rule_id = Column(String(50), nullable=True)
    substation_id = Column(String(50), nullable=True, index=True)
    meter_id = Column(String(50), nullable=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    severity = Column(String(20), default="WARNING") # INFO, WARNING, CRITICAL
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    observed_value = Column(String(50), nullable=True)
    threshold_value = Column(String(50), nullable=True)
    status = Column(String(30), default="NOUVELLE") # NOUVELLE, PRISE_EN_CHARGE, CLOTUREE
    acknowledged_by = Column(String(50), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    closed_by = Column(String(50), nullable=True)
    closed_at = Column(DateTime, nullable=True)
    comments = Column(Text, default="[]") # JSON list of comments
