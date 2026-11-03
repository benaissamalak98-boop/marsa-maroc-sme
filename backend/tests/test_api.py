import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    """Vérifie l'endpoint de santé du système SME."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "Port d'Agadir" in data["service"]

def test_auth_login_success():
    """Test d'authentification réussie avec le compte administrateur DEPA."""
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN_TECH"

def test_auth_login_failure():
    """Test d'échec d'authentification avec mauvais mot de passe."""
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "wrong_password"
    })
    assert response.status_code == 401

def test_substations_list():
    """Vérifie la présence et les caractéristiques des 6 postes électriques du Port d'Agadir."""
    response = client.get("/api/substations")
    assert response.status_code == 200
    substations = response.json()
    assert len(substations) == 6
    codes = [s["code"] for s in substations]
    assert "PS-60/22" in codes
    assert "PP-DEPA" in codes
    assert "PT1-CONT" in codes
    assert "PT3-FRIGO" in codes
    assert "PT2-POLY" in codes
    assert "PT6-OPS" in codes

def test_meters_list():
    """Vérifie que les compteurs communicants sont bien associés aux postes."""
    response = client.get("/api/meters")
    assert response.status_code == 200
    meters = response.json()
    assert len(meters) >= 5
    for m in meters:
        assert m["mode"] in ["REAL", "SIMULATION"]
        assert m["port"] == 502

def test_telemetry_curves():
    """Vérifie la génération des séries temporelles journalières."""
    response = client.get("/api/telemetry/curves?period=DAY")
    assert response.status_code == 200
    curves = response.json()
    assert len(curves) == 24
    assert "total_kw" in curves[0]

def test_alerts_lifecycle():
    """Vérifie la consultation et la mise à jour d'un statut d'alerte."""
    # 1. Login
    login_res = client.post("/api/auth/login", json={
        "username": "exploitant",
        "password": "exploit2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Liste des alertes
    res = client.get("/api/alerts")
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) > 0

    target_alert = alerts[0]
    # 3. Mise à jour de statut
    update_res = client.put(
        f"/api/alerts/{target_alert['id']}/status",
        headers=headers,
        json={"status": "PRISE_EN_CHARGE", "comment": "Contrôle en cours par l'équipe DEPA"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "PRISE_EN_CHARGE"

def test_ipe_indicators_and_ser():
    """Vérifie la restitution des IPÉ ISO 50001 et le calcul d'écart avec la SER."""
    # IPÉs
    res_ipe = client.get("/api/ipe/indicators")
    assert res_ipe.status_code == 200
    ipes = res_ipe.json()
    assert len(ipes) >= 4
    codes = [i["code"] for i in ipes]
    assert "IPE-01-SEC-TC" in codes

    # Comparaison SER
    res_ser = client.get("/api/ipe/baselines/compare")
    assert res_ser.status_code == 200
    ser_data = res_ser.json()
    assert "variance_kwh" in ser_data
    assert "co2_impact_tons" in ser_data

def test_reporting_summary_and_export():
    """Vérifie la synthèse énergétique globale et la génération des fichiers exportables."""
    # Synthèse
    res_summary = client.get("/api/reports/summary")
    assert res_summary.status_code == 200
    data = res_summary.json()
    assert data["market_ref"] == "12/DEPA/2026"
    assert data["data_completeness_percent"] > 95.0

    # Test export PDF
    res_pdf = client.get("/api/reports/export/pdf")
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert len(res_pdf.content) > 1000  # PDF binaire non vide

    # Test export Excel
    res_excel = client.get("/api/reports/export/excel")
    assert res_excel.status_code == 200
    assert "openxmlformats" in res_excel.headers["content-type"]
    assert len(res_excel.content) > 1000

    # Test export CSV
    res_csv = client.get("/api/reports/export/csv")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "Horodatage;Poste" in res_csv.text
