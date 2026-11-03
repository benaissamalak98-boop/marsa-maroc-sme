from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

# User & Auth Schemas
class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    full_name: str
    email: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: Optional[str] = None
    role: str = "EXPLOITANT"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Audit Log Schema
class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    username: str
    user_id: Optional[str] = None
    action: str
    entity: str
    entity_id: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: str

    model_config = ConfigDict(from_attributes=True)

# Register Mapping Schemas
class RegisterMappingCreate(BaseModel):
    variable_name: str
    register_address: int
    register_count: int = 2
    function_code: int = 3
    data_type: str = "FLOAT32"
    scale_factor: float = 1.0
    unit: str
    is_enabled: bool = True

class RegisterMappingResponse(RegisterMappingCreate):
    id: int
    meter_id: str

    model_config = ConfigDict(from_attributes=True)

# Meter Schemas
class MeterCreate(BaseModel):
    code: str
    name: str
    substation_id: str
    counting_point_tag: str
    manufacturer: str = "Schneider Electric"
    model: str = "PowerLogic PM8000"
    ip_address: str = "127.0.0.1"
    port: int = 502
    unit_id: int = 1
    protocol: str = "MODBUS_TCP"
    acquisition_interval_sec: int = 5
    timeout_sec: float = 3.0
    retry_count: int = 3
    mode: str = "SIMULATION"
    is_active: bool = True

class MeterUpdate(BaseModel):
    name: Optional[str] = None
    substation_id: Optional[str] = None
    counting_point_tag: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    ip_address: Optional[str] = None
    port: Optional[int] = None
    unit_id: Optional[int] = None
    protocol: Optional[str] = None
    acquisition_interval_sec: Optional[int] = None
    timeout_sec: Optional[float] = None
    retry_count: Optional[int] = None
    mode: Optional[str] = None
    is_active: Optional[bool] = None

class MeterResponse(BaseModel):
    id: str
    code: str
    name: str
    substation_id: str
    counting_point_tag: str
    manufacturer: str
    model: str
    ip_address: str
    port: int
    unit_id: int
    protocol: str
    acquisition_interval_sec: int
    timeout_sec: float
    retry_count: int
    mode: str
    is_active: bool
    last_communication: Optional[datetime] = None
    comm_status: str
    last_error_message: Optional[str] = None
    registers: List[RegisterMappingResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Substation Schemas
class SubstationResponse(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    voltage_primary: str
    voltage_secondary: str
    transformer_rating_kva: float
    location_x: float
    location_y: float
    zone_name: str
    is_active: bool
    breaker_state: bool
    is_simulated: bool
    meters_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class SubstationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    voltage_primary: Optional[str] = None
    voltage_secondary: Optional[str] = None
    transformer_rating_kva: Optional[float] = None
    is_active: Optional[bool] = None
    breaker_state: Optional[bool] = None

# Energy Reading Schemas
class EnergyReadingResponse(BaseModel):
    id: int
    timestamp: datetime
    received_at: datetime
    substation_id: str
    meter_id: str
    active_power_kw: float
    reactive_power_kvar: float
    apparent_power_kva: float
    power_factor: float
    voltage_v: float
    current_a: float
    frequency_hz: float
    thd_percent: float
    active_energy_kwh: float
    transformer_load_percent: float
    source: str
    quality_status: str

    model_config = ConfigDict(from_attributes=True)

# Energy Indicator (IPE) Schemas
class EnergyIndicatorCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    formula_expression: str
    source_variables: str = "[]"
    unit: str
    energy_scope: str
    aggregation_period: str = "HOURLY"
    target_value: Optional[float] = None
    is_active: bool = True

class EnergyIndicatorResponse(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    formula_expression: str
    source_variables: str
    unit: str
    energy_scope: str
    aggregation_period: str
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    is_active: bool
    effective_date: datetime

    model_config = ConfigDict(from_attributes=True)

# Energy Baseline (SER) Schemas
class EnergyBaselineCreate(BaseModel):
    code: str
    name: str
    version: str = "v1.0"
    period_start: datetime
    period_end: datetime
    baseline_consumption_kwh: float
    relevant_variables: str = "{}"
    calculation_method: str = "LINEAR_REGRESSION"
    formula_summary: Optional[str] = None
    assumptions_doc: Optional[str] = None
    is_active: bool = True

class EnergyBaselineResponse(BaseModel):
    id: str
    code: str
    name: str
    version: str
    period_start: datetime
    period_end: datetime
    baseline_consumption_kwh: float
    relevant_variables: str
    calculation_method: str
    formula_summary: Optional[str] = None
    assumptions_doc: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Alert Schemas
class AlertRuleCreate(BaseModel):
    code: str
    name: str
    substation_id: Optional[str] = None
    meter_id: Optional[str] = None
    rule_type: str
    threshold_value: float
    threshold_unit: str
    severity: str = "WARNING"
    is_enabled: bool = True

class AlertRuleResponse(AlertRuleCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)

class AlertIncidentResponse(BaseModel):
    id: str
    rule_id: Optional[str] = None
    substation_id: Optional[str] = None
    meter_id: Optional[str] = None
    timestamp: datetime
    severity: str
    title: str
    message: str
    observed_value: Optional[str] = None
    threshold_value: Optional[str] = None
    status: str
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    closed_by: Optional[str] = None
    closed_at: Optional[datetime] = None
    comments: str

    model_config = ConfigDict(from_attributes=True)

class AlertStatusUpdate(BaseModel):
    status: str # PRISE_EN_CHARGE ou CLOTUREE
    comment: Optional[str] = None

# Modbus Communication Test Request/Response
class ModbusTestRequest(BaseModel):
    ip_address: str
    port: int = 502
    unit_id: int = 1
    function_code: int = 3
    register_address: int = 3000
    register_count: int = 2
    timeout_sec: float = 3.0
    simulate: Optional[bool] = False

class ModbusTestResponse(BaseModel):
    success: bool
    latency_ms: float
    raw_registers: List[int] = []
    decoded_value: Optional[float] = None
    message: str
    status: str
