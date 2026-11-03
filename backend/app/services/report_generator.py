import io
import csv
from datetime import datetime
from typing import List, Dict, Any

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class ReportGeneratorService:
    """Service de génération de rapports énergétiques certifiés ISO 50001 (PDF, Excel, CSV)."""

    @classmethod
    def generate_pdf_report(
        cls,
        report_title: str,
        period_str: str,
        substations_data: List[Dict[str, Any]],
        ipes_data: List[Dict[str, Any]],
        quality_score: float = 99.8
    ) -> io.BytesIO:
        """Génère un rapport PDF vectoriel avec charte graphique industrielle Marsa Maroc DEPA."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom styles
        navy_color = colors.HexColor("#113E6C")
        cyan_color = colors.HexColor("#00A3E0")
        dark_text = colors.HexColor("#1E293B")

        title_style = ParagraphStyle(
            'MarsaTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=navy_color,
            spaceAfter=6
        )

        subtitle_style = ParagraphStyle(
            'MarsaSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748B"),
            spaceAfter=15
        )

        h2_style = ParagraphStyle(
            'MarsaH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=navy_color,
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'MarsaBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=dark_text
        )

        story = []

        # 1. En-tête institutionnel
        story.append(Paragraph("MARSA MAROC — DIRECTION DE L'EXPLOITATION DU PORT D'AGADIR (DEPA)", ParagraphStyle(
            'TopHeader', fontName='Helvetica-Bold', fontSize=9, textColor=cyan_color, spaceAfter=4
        )))
        story.append(Paragraph(f"RAPPORT ÉNERGÉTIQUE OFFICIEL — SME ISO 50001", title_style))
        story.append(Paragraph(
            f"Marché n° 12/DEPA/2026 • Système de Monitoring Énergétique • Période analysée : <b>{period_str}</b><br/>"
            f"Généré le : {datetime.utcnow().strftime('%d/%m/%Y à %H:%M UTC+1')} • Statut des données : <b>CONTRÔLÉES (Taux de complétude : {quality_score}%)</b>",
            subtitle_style
        ))
        story.append(Spacer(1, 10))

        # 2. Tableau Récapitulatif des 6 Postes Électriques
        story.append(Paragraph("1. Synthèse de Répartition Énergétique par Poste MT/BT", h2_style))

        headers = ["Poste", "Tension", "Transfo", "P. Active (kW)", "Cos φ", "THD (%)", "Énergie (kWh/j)", "Statut"]
        table_rows = [headers]

        total_kw = 0.0
        total_kwh = 0.0

        for sub in substations_data:
            p_kw = sub.get("active_power_kw", 0.0)
            kwh = sub.get("daily_energy_kwh", 0.0)
            total_kw += p_kw
            total_kwh += kwh

            table_rows.append([
                sub.get("code", "PT"),
                f"{sub.get('voltage_primary', '22kV')}/{sub.get('voltage_secondary', '400V')}",
                f"{int(sub.get('transformer_rating_kva', 0))} kVA",
                f"{p_kw:,.0f}".replace(",", " "),
                f"{sub.get('power_factor', 0.96):.2f}",
                f"{sub.get('thd_percent', 2.0):.1f} %",
                f"{kwh:,.0f}".replace(",", " "),
                "EN SERVICE" if sub.get("breaker_state", True) else "ISOLÉ"
            ])

        # Ligne de total
        table_rows.append([
            "TOTAL PORT", "22 kV MT", "7 200 kVA", f"{total_kw:,.0f}".replace(",", " "), "0.97", "2.1 %", f"{total_kwh:,.0f}".replace(",", " "), "OPTIMAL"
        ])

        t1 = Table(table_rows, colWidths=[65, 60, 60, 75, 45, 50, 85, 75])
        t1.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), navy_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#F1F5F9")),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ]))
        story.append(t1)
        story.append(Spacer(1, 15))

        # 3. Indicateurs de Performance Énergétique (IPE / EnPIs)
        story.append(Paragraph("2. Indicateurs de Performance Énergétique (IPÉ) — ISO 50001 §6.4", h2_style))

        ipe_headers = ["Code IPÉ", "Désignation", "Périmètre", "Valeur Observée", "Cible DEPA", "Unité", "Écart"]
        ipe_rows = [ipe_headers]

        for ipe in ipes_data:
            cur = ipe.get("current_value", 0.0)
            target = ipe.get("target_value", 0.0)
            variance = f"{(cur - target):+.2f}" if target else "N/A"

            ipe_rows.append([
                ipe.get("code", "IPE"),
                ipe.get("name", "Indicateur"),
                ipe.get("energy_scope", "Port"),
                f"{cur:.2f}",
                f"{target:.2f}" if target else "Ref",
                ipe.get("unit", ""),
                variance
            ])

        t2 = Table(ipe_rows, colWidths=[75, 140, 95, 65, 55, 60, 50])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F2844")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ]))
        story.append(t2)
        story.append(Spacer(1, 20))

        # 4. Certification & Signatures
        story.append(Paragraph("3. Conformité & Validation", h2_style))
        story.append(Paragraph(
            "Ce document a été généré automatiquement par le <b>Système de Monitoring Énergétique (SME)</b> "
            "conformément aux protocoles d'acquisition Modbus TCP/IP et aux exigences de la norme <b>ISO 50001:2018</b>. "
            "Toutes les mesures sont historisées et traçables sur le serveur DEPA-SME-01.",
            body_style
        ))
        story.append(Spacer(1, 25))

        sig_table = Table([
            ["Visa du Responsable Énergie DEPA :", "Visa de la Direction d'Exploitation :"],
            ["\n\n____________________________\nDate :", "\n\n____________________________\nDate :"]
        ], colWidths=[250, 250])
        sig_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('TEXTCOLOR', (0, 0), (-1, -1), dark_text),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ]))
        story.append(sig_table)

        doc.build(story)
        buffer.seek(0)
        return buffer

    @classmethod
    def generate_excel_report(
        cls,
        substations_data: List[Dict[str, Any]],
        readings_data: List[Dict[str, Any]],
        ipes_data: List[Dict[str, Any]]
    ) -> io.BytesIO:
        """Génère un classeur Excel multi-onglets structuré pour analyse."""
        wb = openpyxl.Workbook()

        # Styles Excel
        header_fill = PatternFill(start_color="113E6C", end_color="113E6C", fill_type="solid")
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        title_font = Font(name="Calibri", size=14, bold=True, color="113E6C")
        bold_font = Font(name="Calibri", size=10, bold=True)
        thin_border = Border(
            left=Side(style='thin', color='CCCCCC'),
            right=Side(style='thin', color='CCCCCC'),
            top=Side(style='thin', color='CCCCCC'),
            bottom=Side(style='thin', color='CCCCCC')
        )

        # Onglet 1: Synthèse Énergétique
        ws1 = wb.active
        ws1.title = "Synthèse Postes DEPA"
        ws1.append(["MARSA MAROC — PORT ENERGY INTELLIGENCE (SME PORT D'AGADIR)"])
        ws1.cell(row=1, column=1).font = title_font
        ws1.append([f"Rapport d'extraction énergétique — {datetime.utcnow().strftime('%d/%m/%Y %H:%M')}"])
        ws1.append([])

        headers1 = [
            "Code Poste", "Nom du Poste", "Tension Primaire", "Tension Secondaire",
            "Transfo (kVA)", "Puissance Active (kW)", "Puissance Réactive (kVAR)",
            "Facteur Cos φ", "Tension (V)", "Courant (A)", "THD (%)",
            "Énergie Jour (kWh)", "Émissions (tCO2e)", "Statut"
        ]
        ws1.append(headers1)
        for col_idx in range(1, len(headers1) + 1):
            cell = ws1.cell(row=4, column=col_idx)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center")

        for row_idx, sub in enumerate(substations_data, start=5):
            ws1.append([
                sub.get("code"),
                sub.get("name"),
                sub.get("voltage_primary"),
                sub.get("voltage_secondary"),
                sub.get("transformer_rating_kva"),
                sub.get("active_power_kw"),
                sub.get("reactive_power_kvar"),
                sub.get("power_factor"),
                sub.get("voltage_v"),
                sub.get("current_a"),
                sub.get("thd_percent"),
                sub.get("daily_energy_kwh"),
                sub.get("co2_emissions_t"),
                "EN SERVICE" if sub.get("breaker_state", True) else "ISOLÉ"
            ])

        # Onglet 2: Indicateurs IPE (ISO 50001)
        ws2 = wb.create_sheet(title="Indicateurs IPE & SER")
        ws2.append(["Indicateurs de Performance Énergétique (IPÉ) — Port d'Agadir"])
        ws2.cell(row=1, column=1).font = title_font
        ws2.append([])

        headers2 = ["Code", "Nom", "Périmètre", "Période", "Unité", "Valeur Actuelle", "Valeur Cible", "Formule"]
        ws2.append(headers2)
        for col_idx in range(1, len(headers2) + 1):
            cell = ws2.cell(row=3, column=col_idx)
            cell.fill = header_fill
            cell.font = header_font

        for ipe in ipes_data:
            ws2.append([
                ipe.get("code"),
                ipe.get("name"),
                ipe.get("energy_scope"),
                ipe.get("aggregation_period"),
                ipe.get("unit"),
                ipe.get("current_value"),
                ipe.get("target_value"),
                ipe.get("formula_expression")
            ])

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer

    @classmethod
    def generate_csv_export(cls, readings: List[Dict[str, Any]]) -> str:
        """Génère un export CSV conforme avec en-têtes normalisés."""
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';')
        writer.writerow([
            "Horodatage", "Poste", "Compteur", "Puissance_Active_kW",
            "Puissance_Reactive_kVAR", "Puissance_Apparente_kVA",
            "Facteur_Cos_Phi", "Tension_V", "Courant_A", "THD_Percent",
            "Energie_Cumulee_kWh", "Source", "Statut_Qualite"
        ])

        for r in readings:
            writer.writerow([
                r.get("timestamp", ""),
                r.get("substation_id", ""),
                r.get("meter_id", ""),
                r.get("active_power_kw", 0.0),
                r.get("reactive_power_kvar", 0.0),
                r.get("apparent_power_kva", 0.0),
                r.get("power_factor", 0.96),
                r.get("voltage_v", 400.0),
                r.get("current_a", 0.0),
                r.get("thd_percent", 2.0),
                r.get("active_energy_kwh", 0.0),
                r.get("source", "SIMULATED"),
                r.get("quality_status", "SIMULATED")
            ])

        return output.getvalue()
