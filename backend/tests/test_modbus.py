import pytest
from backend.app.services.modbus_service import ModbusAcquisitionService

def test_register_decoding_float32():
    """Vérifie le décodage d'un registre IEEE 754 Float32 big-endian."""
    # 400.0 V en hexadécimal float32 = 0x43C80000 -> reg1=0x43C8 (17352), reg2=0x0000 (0)
    raw = [17352, 0]
    val = ModbusAcquisitionService.decode_registers(raw, data_type="FLOAT32", scale=1.0)
    assert abs(val - 400.0) < 0.01

def test_register_decoding_with_scale():
    """Vérifie l'application d'un facteur d'échelle (ex: 0.1 pour 4000 -> 400.0)."""
    raw = [4000]
    val = ModbusAcquisitionService.decode_registers(raw, data_type="UINT16", scale=0.1)
    assert val == 400.0

def test_simulation_reading_ranges():
    """Vérifie la cohérence physique des télémesures générées pour le Terminal Conteneurs."""
    reading = ModbusAcquisitionService.simulate_telemetry_reading(
        substation_code="PT1-CONT",
        substation_id="sub-tc1",
        meter_id="mtr-tc1",
        transformer_kva=1600.0,
        hour_of_day=14
    )
    # Puissance positive
    assert reading["active_power_kw"] > 0
    # Facteur de puissance entre 0.90 et 1.00
    assert 0.90 <= reading["power_factor"] <= 1.00
    # Tension 400V
    assert 380.0 <= reading["voltage_v"] <= 420.0
    # THD non nul et raisonnable
    assert 0.5 <= reading["thd_percent"] <= 8.0
    # Statut explicite SIMULATED
    assert reading["source"] == "SIMULATED"
    assert reading["quality_status"] == "SIMULATED"

def test_communication_simulation_mode():
    """Vérifie le test de communication Modbus en mode simulation."""
    res = ModbusAcquisitionService.test_communication(
        ip_address="127.0.0.1",
        port=502,
        unit_id=1,
        function_code=3,
        register_address=3000,
        register_count=2,
        simulate=True
    )
    assert res["success"] is True
    assert res["status"] == "SIMULATED"
    assert res["decoded_value"] == 425.5
    assert len(res["raw_registers"]) == 2
    assert "MODE SIMULATION" in res["message"]
