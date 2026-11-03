import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Database configuration (SQLite with absolute path, easily switchable to PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/data/marsa_energy.db")

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "MARSA_MAROC_DEPA_SME_SECRET_KEY_2026_AGADIR")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Modbus simulation & acquisition defaults
DEFAULT_ACQUISITION_INTERVAL = int(os.getenv("ACQUISITION_INTERVAL_SEC", "5"))
MODBUS_SIMULATOR_PORT = int(os.getenv("MODBUS_SIMULATOR_PORT", "5020"))

# Project metadata
PROJECT_NAME = "MARSA MAROC — PORT ENERGY INTELLIGENCE"
PROJECT_CODE = "SME-DEPA-12/2026"
PORT_NAME = "Port d'Agadir (DEPA)"
