import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Table, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Leaf, 
  Calendar, 
  BarChart3, 
  PieChart, 
  RefreshCw,
  ShieldCheck,
  Building
} from 'lucide-react';
import { api, ReportSummaryApi } from '../../../services/api';

export const ReportingAnalytics: React.FC = () => {
  const [report, setReport] = useState<ReportSummaryApi | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const loadReport = async () => {
    try {
      setRefreshing(true);
      const data = await api.getReportSummary();
      setReport(data);
    } catch (err) {
      console.error("Erreur chargement rapport énergétique :", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleDownload = (format: 'pdf' | 'excel' | 'csv') => {
    setDownloadingFormat(format);
    let url = '';
    if (format === 'pdf') url = api.getDownloadUrlPdf();
    else if (format === 'excel') url = api.getDownloadUrlExcel();
    else if (format === 'csv') url = api.getDownloadUrlCsv();

    // Trigger direct browser download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingFormat(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/25 bg-deep-900/90 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-electric-cyan tracking-wider">
              <FileText className="w-4 h-4" />
              <span>MODULE 05 — REPORTING ÉNERGÉTIQUE, ANALYTICS & EXPORTS OFFICIELS</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">MARCHÉ 12/DEPA/2026</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Synthèse d'Exploitation & Production des Rapports DEPA
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Consolidation multi-postes, répartition de la charge portuaire, audits de qualité métrologique et exports normalisés.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadReport}
              className="p-2 rounded-xl bg-deep-850 hover:bg-cyan-950 border border-slate-700 text-slate-300 hover:text-electric-cyan transition-all"
              title="Actualiser le rapport"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive Download Center */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        
        {/* PDF Official Report */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-deep-900 to-deep-950 border border-cyan-500/30 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-electric-cyan uppercase">DOCUMENT OFFICIEL</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/40 font-bold">
                FORMAT PDF
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-2">Rapport Énergétique DEPA</h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Édition vectorielle prête pour la direction et l'audit ISO 50001 avec signature institutionnelle Marsa Maroc.
            </p>
          </div>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloadingFormat === 'pdf'}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-electric-cyan hover:bg-cyan-300 text-deep-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingFormat === 'pdf' ? 'GÉNÉRATION DU PDF...' : 'TÉLÉCHARGER LE RAPPORT PDF'}</span>
          </button>
        </div>

        {/* Excel Analytical Report */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-deep-900 to-deep-950 border border-emerald-500/30 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase">CLASSEUR ANALYTIQUE</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                EXCEL .XLSX
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-2">Synthèse Détaillée Multi-Feuilles</h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Formules de calcul intégrées, ventilation des 6 postes, bilans de charge et ratios EnPIs.
            </p>
          </div>
          <button
            onClick={() => handleDownload('excel')}
            disabled={downloadingFormat === 'excel'}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-deep-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{downloadingFormat === 'excel' ? 'EXPORTATION EN COURS...' : 'EXPORTER CLASSEUR EXCEL'}</span>
          </button>
        </div>

        {/* Raw CSV Data */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-deep-900 to-deep-950 border border-amber-500/30 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase">DONNÉES BRUTES GMAO</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-500/40 font-bold">
                FORMAT CSV
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-2">Extraction Télémétrie 15 min</h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Format normalisé point-virgule compatible avec SAP, Infor EAM et outils de modélisation énergétique.
            </p>
          </div>
          <button
            onClick={() => handleDownload('csv')}
            disabled={downloadingFormat === 'csv'}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-deep-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <Table className="w-4 h-4" />
            <span>{downloadingFormat === 'csv' ? 'EXTRACTION...' : 'EXTRAIRE DONNÉES CSV'}</span>
          </button>
        </div>

      </div>

      {/* 3. Consolidated Figures Grid */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
          <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] uppercase">Énergie Globale Aujourd'hui</span>
            <div className="text-2xl font-black text-white mt-1">
              {report.total_energy_kwh.toLocaleString('fr-FR')} <span className="text-xs font-normal text-electric-cyan">kWh</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-800 pt-1">
              Périmètre 6 postes DEPA
            </div>
          </div>

          <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] uppercase">Puissance Active Instantanée</span>
            <div className="text-2xl font-black text-electric-cyan mt-1">
              {report.total_active_power_kw.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-800 pt-1">
              Souscrit ONEE : 4 500 kVA
            </div>
          </div>

          <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] uppercase">Facteur Cos φ Global</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {report.average_cos_phi} <span className="text-xs font-normal text-slate-400">cos φ</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-2 border-t border-slate-800 pt-1">
              Bonus ONEE actif (&ge; 0.92)
            </div>
          </div>

          <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] uppercase">Bilan Émissions Carbone</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {report.co2_emissions_tons} <span className="text-xs font-normal text-slate-400">tCO2e</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-800 pt-1">
              Facteur : 0.60 kg CO2/kWh
            </div>
          </div>

          <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] uppercase">Taux de Complétude Données</span>
            <div className="text-2xl font-black text-white mt-1">
              {report.data_completeness_percent}%
            </div>
            <div className="text-[10px] text-emerald-400 mt-2 border-t border-slate-800 pt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Conforme ISO 50001 §9.1</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Substation Breakdown Table */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-electric-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Répartition Détaillée par Poste de Transformation Électrique
            </h3>
          </div>
          <span className="text-xs text-slate-400">Période : Dernières 24 Heures</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Poste</th>
                <th className="py-2.5 px-3">Tension & Transfo</th>
                <th className="py-2.5 px-3">P. Active P (kW)</th>
                <th className="py-2.5 px-3">P. Apparente S (kVA)</th>
                <th className="py-2.5 px-3">Facteur cos φ</th>
                <th className="py-2.5 px-3">Énergie (kWh/j)</th>
                <th className="py-2.5 px-3">Part Réseau (%)</th>
                <th className="py-2.5 px-3">Qualité Donnée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report?.substations.map((sub) => {
                const sharePercent = report.total_energy_kwh > 0 
                  ? Math.round((sub.daily_energy_kwh / report.total_energy_kwh) * 1000) / 10
                  : 0;
                return (
                  <tr key={sub.substation_id} className="hover:bg-deep-850/50 text-slate-300">
                    <td className="py-3 px-3 font-bold text-white">
                      <div className="text-electric-cyan">{sub.code}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{sub.name}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {sub.voltage_primary} / {sub.voltage_secondary} &bull; {sub.transformer_rating_kva} kVA
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{sub.active_power_kw} kW</td>
                    <td className="py-3 px-3 text-slate-400">{sub.apparent_power_kva} kVA</td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${sub.power_factor >= 0.92 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {sub.power_factor}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{sub.daily_energy_kwh.toLocaleString('fr-FR')}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-electric-cyan rounded-full"
                            style={{ width: `${Math.min(100, sharePercent * 2)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-electric-cyan font-bold">{sharePercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-electric-cyan border border-electric-cyan/30">
                        {sub.data_quality}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Provenance & Compliance Notice */}
      <div className="p-4 rounded-2xl bg-deep-950/90 border border-slate-800 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Certification des Données : Télémétrie horodatée avec traçabilité intégrale EEMUA 191 & ISO 50001</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Direction de l'Exploitation du Port d'Agadir (DEPA) &bull; Système SME V2.4
        </div>
      </div>

    </div>
  );
};
