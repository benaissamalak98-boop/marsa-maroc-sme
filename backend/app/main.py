import asyncio
import json
from contextlib import asynccontextmanager
from typing import Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .config import PROJECT_NAME, PROJECT_CODE, PORT_NAME
from .database import engine, Base, SessionLocal
from .routers import (
    auth_router,
    substations_router,
    meters_router,
    telemetry_router,
    ipe_router,
    alerts_router,
    reports_router,
    admin_router
)
from .routers.admin_router import seed_demo_data
from .models import Meter, Substation, EnergyReading
from .services.modbus_service import ModbusAcquisitionService
from .services.alert_engine import AlertEngine

# Assurer la création des tables dès l'initialisation
Base.metadata.create_all(bind=engine)
init_db = SessionLocal()
seed_demo_data(init_db)
init_db.close()

# WebSocket Connection Manager for live SCADA broadcasts
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        dead_connections = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.add(connection)
        for dc in dead_connections:
            self.active_connections.discard(dc)

ws_manager = ConnectionManager()

# Background acquisition loop
async def acquisition_worker():
    """Tâche d'arrière-plan simulant ou exécutant l'acquisition Modbus cyclique."""
    while True:
        try:
            db = SessionLocal()
            meters = db.query(Meter).filter(Meter.is_active == True).all()

            telemetry_snapshot = []
            for meter in meters:
                substation = meter.substation
                if not substation:
                    continue

                telemetry = ModbusAcquisitionService.simulate_telemetry_reading(
                    substation_code=substation.code,
                    substation_id=substation.id,
                    meter_id=meter.id,
                    transformer_kva=substation.transformer_rating_kva
                )

                reading = EnergyReading(**telemetry)
                db.add(reading)
                AlertEngine.evaluate_reading(db, reading, substation)

                telemetry_snapshot.append({
                    "substation_id": substation.id,
                    "substation_code": substation.code,
                    "meter_code": meter.code,
                    "active_power_kw": reading.active_power_kw,
                    "reactive_power_kvar": reading.reactive_power_kvar,
                    "power_factor": reading.power_factor,
                    "voltage_v": reading.voltage_v,
                    "current_a": reading.current_a,
                    "thd_percent": reading.thd_percent,
                    "transformer_load_percent": reading.transformer_load_percent,
                    "timestamp": reading.timestamp.isoformat(),
                    "quality_status": reading.quality_status
                })

            db.commit()
            db.close()

            if telemetry_snapshot:
                await ws_manager.broadcast({
                    "type": "SCADA_TELEMETRY_UPDATE",
                    "timestamp": telemetry_snapshot[0]["timestamp"],
                    "data": telemetry_snapshot
                })

        except Exception as e:
            print(f"[Acquisition Worker Error] : {e}")

        await asyncio.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    worker_task = asyncio.create_task(acquisition_worker())
    yield
    worker_task.cancel()

app = FastAPI(
    title=PROJECT_NAME,
    description="API de Supervision et de Monitoring Énergétique (SME) — Port d'Agadir (DEPA)",
    version="2.4.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(substations_router.router)
app.include_router(meters_router.router)
app.include_router(telemetry_router.router)
app.include_router(ipe_router.router)
app.include_router(alerts_router.router)
app.include_router(reports_router.router)
app.include_router(admin_router.router)

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": f"{PROJECT_NAME} — {PORT_NAME}",
        "code": PROJECT_CODE,
        "mode": "HYBRID_INTELLIGENCE",
        "db": "CONNECTED",
        "acquisition_worker": "RUNNING"
    }
