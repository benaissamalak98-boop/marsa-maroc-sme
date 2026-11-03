import pytest
from backend.app.services.energy_engine import EnergyCalculationEngine
from backend.app.models import EnergyBaseline

def test_baseline_comparison_savings():
    """Vérifie le calcul d'écart avec la SER et la réduction d'émissions de CO2."""
    baseline = EnergyBaseline(
        id="ser-test",
        code="SER-TEST",
        name="Test SER",
        baseline_consumption_kwh=50000.0
    )

    # Cas 1 : Amélioration énergétique (consommation inférieure à la référence)
    result = EnergyCalculationEngine.compare_with_baseline(
        db=None,
        baseline=baseline,
        actual_consumption_kwh=46000.0
    )
    assert result["variance_kwh"] == -4000.0
    assert result["variance_percent"] == -8.0
    assert result["status"] == "IMPROVEMENT"
    assert result["is_iso50001_compliant"] is True
    assert result["co2_impact_tons"] == 2.4  # 4000 * 0.60 / 1000

    # Cas 2 : Surconsommation
    result_over = EnergyCalculationEngine.compare_with_baseline(
        db=None,
        baseline=baseline,
        actual_consumption_kwh=55000.0
    )
    assert result_over["variance_kwh"] == 5000.0
    assert result_over["status"] == "OVERCONSUMPTION"
    assert result_over["is_iso50001_compliant"] is False
