from datetime import datetime
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Substation, EnergyIndicator, EnergyReading
from ..services.energy_engine import EnergyCalculationEngine
from ..services.report_generator import ReportGeneratorService

router = APIRouter(prefix="/api/reports", tags=["Reporting & Exports"])

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """Synthèse analytique globale pour l'écran de reporting."""
    substations = db.query(Substation).all()
    sub_data = [EnergyCalculationEngine.calculate_substation_summary(db, s) for s in substations]

    total_kw = sum(s["active_power_kw"] for s in sub_data)
    total_kwh = sum(s["daily_energy_kwh"] for s in sub_data)
    co2_total_tons = sum(s["co2_emissions_t"] for s in sub_data)
    avg_cos_phi = round(sum(s["power_factor"] for s in sub_data) / max(len(sub_data), 1), 2)

    return {
        "report_generated_at": datetime.utcnow().isoformat(),
        "period": "JOURNALIER (Dernières 24 Heures)",
        "entity": "Marsa Maroc — Port d'Agadir (DEPA)",
        "market_ref": "12/DEPA/2026",
        "iso_standard": "ISO 50001:2018",
        "total_active_power_kw": total_kw,
        "total_energy_kwh": total_kwh,
        "co2_emissions_tons": co2_total_tons,
        "average_cos_phi": avg_cos_phi,
        "data_completeness_percent": 99.8,
        "substations": sub_data,
        "onee_tariff": {
            "subscribed_power_kva": 4500,
            "current_demand_kw": total_kw,
            "current_slot": "HEURES_CREUSES",
            "unit_price_mad_kwh": 0.74,
            "cos_phi_status": "BONUS ACTIF (> 0.92)" if avg_cos_phi >= 0.92 else "RISQUE PÉNALITÉ"
        }
    }

@router.get("/export/pdf")
def export_pdf_report(
    period: str = Query("24 Heures Glissantes", description="Période"),
    db: Session = Depends(get_db)
):
    """Télécharge le rapport officiel d'audit énergétique au format PDF vectoriel."""
    substations = db.query(Substation).all()
    sub_data = [EnergyCalculationEngine.calculate_substation_summary(db, s) for s in substations]

    indicators = db.query(EnergyIndicator).all()
    ipe_data = []
    for ind in indicators:
        val = EnergyCalculationEngine.calculate_ipe_value(db, ind)
        ipe_data.append({
            "code": ind.code,
            "name": ind.name,
            "energy_scope": ind.energy_scope,
            "current_value": val,
            "target_value": ind.target_value,
            "unit": ind.unit
        })

    pdf_buffer = ReportGeneratorService.generate_pdf_report(
        report_title="Rapport Énergétique Port d'Agadir",
        period_str=period,
        substations_data=sub_data,
        ipes_data=ipe_data,
        quality_score=99.8
    )

    filename = f"Rapport_Energetique_DEPA_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/excel")
def export_excel_report(db: Session = Depends(get_db)):
    """Télécharge le classeur Excel multi-onglets structuré pour analyse approfondie."""
    substations = db.query(Substation).all()
    sub_data = [EnergyCalculationEngine.calculate_substation_summary(db, s) for s in substations]

    indicators = db.query(EnergyIndicator).all()
    ipe_data = []
    for ind in indicators:
        ipe_data.append({
            "code": ind.code,
            "name": ind.name,
            "energy_scope": ind.energy_scope,
            "aggregation_period": ind.aggregation_period,
            "unit": ind.unit,
            "current_value": EnergyCalculationEngine.calculate_ipe_value(db, ind),
            "target_value": ind.target_value,
            "formula_expression": ind.formula_expression
        })

    excel_buffer = ReportGeneratorService.generate_excel_report(
        substations_data=sub_data,
        readings_data=[],
        ipes_data=ipe_data
    )

    filename = f"Synthese_Energetique_DEPA_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.xlsx"
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/csv")
def export_csv_report(db: Session = Depends(get_db)):
    """Exporte les données brutes sous format CSV séparateur point-virgule."""
    readings = db.query(EnergyReading).order_by(EnergyReading.timestamp.desc()).limit(100).all()
    readings_dicts = []
    for r in readings:
        readings_dicts.append({
            "timestamp": r.timestamp.isoformat(),
            "substation_id": r.substation_id,
            "meter_id": r.meter_id,
            "active_power_kw": r.active_power_kw,
            "reactive_power_kvar": r.reactive_power_kvar,
            "apparent_power_kva": r.apparent_power_kva,
            "power_factor": r.power_factor,
            "voltage_v": r.voltage_v,
            "current_a": r.current_a,
            "thd_percent": r.thd_percent,
            "active_energy_kwh": r.active_energy_kwh,
            "source": r.source,
            "quality_status": r.quality_status
        })

    csv_content = ReportGeneratorService.generate_csv_export(readings_dicts)
    filename = f"Mesures_Telemetrie_DEPA_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
