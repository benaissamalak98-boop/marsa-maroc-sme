import time
import math
import struct
import random
from datetime import datetime
from typing import Dict, Any, List, Optional

try:
    from pymodbus.client import ModbusTcpClient
    PYMODBUS_AVAILABLE = True
except ImportError:
    PYMODBUS_AVAILABLE = False

class ModbusAcquisitionService:
    """
    Service d'acquisition Modbus TCP/IP pour le SME Port d'Agadir.
    Gère le mode réel (connexion matérielle) et le mode simulation (démonstration traçable).
    """

    @staticmethod
    def decode_registers(raw_registers: List[int], data_type: str = "FLOAT32", scale: float = 1.0) -> float:
        """Décode une liste de registres 16 bits en valeur flottante selon le type et facteur d'échelle."""
        if not raw_registers:
            return 0.0

        if data_type == "FLOAT32" and len(raw_registers) >= 2:
            # Big-endian IEEE 754 float
            packed = struct.pack(">HH", raw_registers[0], raw_registers[1])
            val = struct.unpack(">f", packed)[0]
            return round(val * scale, 3)

        elif data_type == "UINT32" and len(raw_registers) >= 2:
            val = (raw_registers[0] << 16) | raw_registers[1]
            return round(val * scale, 3)

        elif data_type == "INT32" and len(raw_registers) >= 2:
            packed = struct.pack(">HH", raw_registers[0], raw_registers[1])
            val = struct.unpack(">i", packed)[0]
            return round(val * scale, 3)

        elif data_type in ("UINT16", "INT16"):
            val = raw_registers[0]
            if data_type == "INT16" and val > 32767:
                val -= 65536
            return round(val * scale, 3)

        return round(float(raw_registers[0]) * scale, 3)

    @classmethod
    def test_communication(
        cls,
        ip_address: str,
        port: int = 502,
        unit_id: int = 1,
        function_code: int = 3,
        register_address: int = 3000,
        register_count: int = 2,
        timeout_sec: float = 3.0,
        simulate: bool = False
    ) -> Dict[str, Any]:
        """Teste la communication avec un compteur physique ou virtuel."""
        start_time = time.time()

        # Si le mode simulation est explicitement demandé ou si IP simulée
        if simulate or ip_address.lower() in ("simulation", "simulated"):
            # Encodage réaliste d'une valeur Float32 IEEE 754 (ex: 425.5 kW)
            sim_val = 425.5
            packed = struct.pack(">f", sim_val)
            reg1, reg2 = struct.unpack(">HH", packed)
            return {
                "success": True,
                "latency_ms": 6.8,
                "raw_registers": [reg1, reg2],
                "decoded_value": sim_val,
                "message": f"[MODE SIMULATION] Communication avec simulateur de compteur validée ({ip_address}:{port}, ID:{unit_id}, Reg:{register_address})",
                "status": "SIMULATED"
            }

        # Si PyModbus n'est pas disponible
        if not PYMODBUS_AVAILABLE:
            return {
                "success": False,
                "latency_ms": 0.0,
                "raw_registers": [],
                "decoded_value": None,
                "message": "Bibliothèque PyModbus non disponible sur le système hôte.",
                "status": "ERROR"
            }

        try:
            client = ModbusTcpClient(host=ip_address, port=port, timeout=timeout_sec)
            connected = client.connect()
            elapsed_ms = round((time.time() - start_time) * 1000, 2)

            if not connected:
                return {
                    "success": False,
                    "latency_ms": elapsed_ms,
                    "raw_registers": [],
                    "decoded_value": None,
                    "message": f"Échec de connexion socket Modbus TCP à {ip_address}:{port}",
                    "status": "TIMEOUT"
                }

            # Lecture du registre demandé
            if function_code == 4:
                result = client.read_input_registers(address=register_address, count=register_count, slave=unit_id)
            else:
                result = client.read_holding_registers(address=register_address, count=register_count, slave=unit_id)

            client.close()

            if result.isError():
                return {
                    "success": False,
                    "latency_ms": elapsed_ms,
                    "raw_registers": [],
                    "decoded_value": None,
                    "message": f"Erreur de réponse Modbus (Code exception : {result})",
                    "status": "ERROR"
                }

            raw_regs = result.registers
            decoded = cls.decode_registers(raw_regs, "FLOAT32", 1.0)
            return {
                "success": True,
                "latency_ms": elapsed_ms,
                "raw_registers": raw_regs,
                "decoded_value": decoded,
                "message": f"Communication réussie avec l'équipement Modbus ({len(raw_regs)} registres lus)",
                "status": "CONNECTED"
            }

        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "success": False,
                "latency_ms": elapsed_ms,
                "raw_registers": [],
                "decoded_value": None,
                "message": f"Exception lors du test Modbus : {str(e)}",
                "status": "ERROR"
            }

    @classmethod
    def simulate_telemetry_reading(
        cls,
        substation_code: str,
        substation_id: str,
        meter_id: str,
        transformer_kva: float = 1600.0,
        hour_of_day: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Génère une mesure physique cohérente pour le mode SIMULATION.
        Reproduit les régimes de fonctionnement réels du Port d'Agadir selon le poste :
        - PT1-CONT : variations de levage STS (avec régénération occasionnelle)
        - PT3-FRIGO : compresseurs NH3 et chambres froides export primeurs
        - PT2-POLY : grues mobiles Gottwald et bandes transporteuses
        - PT6-OPS : alimentation navire 60 Hz
        - PP-DEPA : sommation du port
        - PS-60/22 : arrivée réseau ONEE Anza
        """
        if hour_of_day is None:
            now = datetime.utcnow()
            hour_of_day = now.hour

        # Profil horaire industriel (creuse la nuit, pointe 18h-22h)
        base_factor = 0.5 + 0.3 * math.sin((hour_of_day - 6) * math.pi / 12)
        jitter = random.uniform(0.95, 1.05)

        if "PT1" in substation_code or "CONT" in substation_code:
            # Terminal Conteneurs : 600 - 1100 kW
            p_active = round((750 * base_factor * jitter), 1)
            cos_phi = round(random.uniform(0.95, 0.98), 2)
            voltage = round(random.uniform(399.0, 403.5), 1)
            thd = round(random.uniform(2.8, 4.2), 1) # Variateurs de vitesse STS
        elif "FRIGO" in substation_code:
            # Complexe Frigo : 700 - 1050 kW (relativement constant pour maintien froid)
            p_active = round((880 * (0.8 + 0.2 * base_factor) * jitter), 1)
            cos_phi = round(random.uniform(0.94, 0.97), 2)
            voltage = round(random.uniform(397.5, 401.0), 1)
            thd = round(random.uniform(2.1, 3.2), 1)
        elif "POLY" in substation_code or "VRAC" in substation_code:
            # Vrac : 350 - 650 kW
            p_active = round((460 * base_factor * jitter), 1)
            cos_phi = round(random.uniform(0.94, 0.97), 2)
            voltage = round(random.uniform(398.0, 402.0), 1)
            thd = round(random.uniform(1.8, 2.6), 1)
        elif "OPS" in substation_code:
            # Shore Power : 450 - 750 kW
            p_active = round(570.0 * jitter, 1)
            cos_phi = round(random.uniform(0.97, 0.99), 2)
            voltage = round(random.uniform(6580.0, 6620.0), 1) # 6.6 kV
            thd = round(random.uniform(1.5, 2.4), 1)
        elif "PP" in substation_code or "DEPA" in substation_code:
            # Poste Principal : Somme de la consommation DEPA (~2500 - 3200 kW)
            p_active = round(2810.0 * (0.8 + 0.25 * base_factor) * jitter, 1)
            cos_phi = round(random.uniform(0.96, 0.98), 2)
            voltage = round(random.uniform(21980.0, 22120.0), 1) # 22 kV
            thd = round(random.uniform(2.0, 2.7), 1)
        else: # PS-60/22
            p_active = round(2845.0 * (0.8 + 0.25 * base_factor) * jitter, 1)
            cos_phi = round(random.uniform(0.96, 0.98), 2)
            voltage = round(random.uniform(22100.0, 22250.0), 1)
            thd = round(random.uniform(1.9, 2.5), 1)

        # Calcul des grandeurs liées (P, Q, S, I)
        sin_phi = math.sqrt(max(0.0, 1.0 - cos_phi**2))
        q_reactive = round(p_active * math.tan(math.acos(cos_phi)), 1)
        s_apparent = round(p_active / max(cos_phi, 0.1), 1)

        # Courant I = S / (sqrt(3) * U)
        u_volts = voltage if voltage > 1000 else voltage
        current = round((s_apparent * 1000) / (math.sqrt(3) * u_volts), 1)
        transfo_load = round((s_apparent / max(transformer_kva, 100.0)) * 100, 1)

        # Cumul journalier estimé
        daily_kwh = round(p_active * 18.4, 0)

        return {
            "substation_id": substation_id,
            "meter_id": meter_id,
            "timestamp": datetime.utcnow(),
            "received_at": datetime.utcnow(),
            "active_power_kw": p_active,
            "reactive_power_kvar": q_reactive,
            "apparent_power_kva": s_apparent,
            "power_factor": cos_phi,
            "voltage_v": voltage,
            "current_a": current,
            "frequency_hz": round(random.uniform(49.98, 50.03), 2),
            "thd_percent": thd,
            "active_energy_kwh": daily_kwh,
            "transformer_load_percent": transfo_load,
            "source": "SIMULATED",
            "quality_status": "SIMULATED"
        }
