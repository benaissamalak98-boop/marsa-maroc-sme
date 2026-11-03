import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  FileText, 
  Layers, 
  ShieldCheck, 
  DollarSign, 
  Scale, 
  Clock, 
  Calculator,
  RefreshCw,
  Info
} from 'lucide-react';
import { api, IpeIndicatorApi, EnergyBaselineApi, BaselineComparisonApi } from '../../../services/api';

export const EnergyPerformanceIpeSer: React.FC = () => {
  const [indicators, setIndicators] = useState<IpeIndicatorApi[]>([]);
  const [baselines, setBaselines] = useState<EnergyBaselineApi[]>([]);
  const [comparison, setComparison] = useState<BaselineComparisonApi | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showAddIpeModal, setShowAddIpeModal] = useState<boolean>(false);

  // Form state for creating new IPE
  const [newCode, setNewCode] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newFormula, setNewFormula] = useState<string>('');
  const [newUnit, setNewUnit] = useState<string>('kWh / EVP');
  const [newScope, setNewScope] = useState<string>('Terminal Conteneurs');
  const [newTarget, setNewTarget] = useState<number>(15.0);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [inds, bases, comp] = await Promise.all([
        api.getIndicators(),
        api.getBaselines(),
        api.compareActiveBaseline(),
      ]);
      setIndicators(inds);
      setBaselines(bases);
      setComparison(comp);
    } catch (err) {
      console.error("Erreur chargement IPÉ & SER :", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateIpe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createIndicator({
        code: newCode,
        name: newName,
        formula_expression: newFormula,
        source_variables: "['ACTIVE_POWER_KW', 'VOLUME_TEU']",
        unit: newUnit,
        energy_scope: newScope,
        target_value: newTarget,
        aggregation_period: 'HOURLY',
        is_active: true,
      });
      setShowAddIpeModal(false);
      loadData();
    } catch (err) {
      console.error("Erreur création IPÉ :", err);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/25 bg-deep-900/90 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-electric-cyan tracking-wider">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>MODULE 03 — INDICATEURS DE PERFORMANCE ÉNERGÉTIQUE (IPÉ) & SER</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">RÉFÉRENTIEL ISO 50001:2018</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Moteur Analytique des EnPIs & Situation Énergétique de Référence
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Normalisation des consommations spécifiques portuaires, calcul dynamique des écarts à la SER et quantification des gains carbone.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddIpeModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-electric-cyan hover:bg-cyan-300 text-deep-950 text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>NOUVEL IPÉ</span>
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-deep-850 hover:bg-cyan-950 border border-slate-700 text-slate-300 hover:text-electric-cyan transition-all"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. ISO 50001 SER Baseline Performance KPI Cards */}
      {comparison && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          
          {/* Card 1: Reference vs Observed */}
          <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>CONSOMMATION SER</span>
                <span className="text-electric-cyan font-bold">{comparison.active_baseline_code}</span>
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {comparison.baseline_consumption_kwh.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">kWh/j</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
              <span>Observée aujourd'hui :</span>
              <span className="text-white font-bold">{comparison.actual_consumption_kwh.toLocaleString('fr-FR')} kWh</span>
            </div>
          </div>

          {/* Card 2: Energy Delta */}
          <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>ÉCART ÉNERGÉTIQUE NET</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                  {comparison.savings_status}
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1 flex items-baseline gap-1">
                <span>{comparison.delta_kwh.toLocaleString('fr-FR')}</span>
                <span className="text-xs text-slate-400">kWh/j ({comparison.delta_percent}%)</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-emerald-400 border-t border-slate-800 pt-2 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Conforme aux objectifs de sobriété DEPA</span>
            </div>
          </div>

          {/* Card 3: Financial Savings */}
          <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>GAINS FINANCIERS ESTIMÉS</span>
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {comparison.estimated_savings_mad.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">MAD / j</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
              <span>Base tarifaire ONEE :</span>
              <span className="text-slate-300 font-bold">0.74 MAD / kWh</span>
            </div>
          </div>

          {/* Card 4: Avoided Carbon Emissions */}
          <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>DÉCARBONATION PORTUAIRE</span>
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {comparison.avoided_co2_tons} <span className="text-xs text-slate-400">tCO2e / j</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
              <span>Facteur réseau :</span>
              <span className="text-slate-300 font-bold">0.60 kg CO2 / kWh</span>
            </div>
          </div>

        </div>
      )}

      {/* 3. Operational EnPI / IPE Indicator Cards Grid */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-mono">
            <Calculator className="w-4 h-4 text-electric-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Indicateurs de Performance Énergétique (IPÉ) Spécifiés ({indicators.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Formules mathématiques documentées selon ISO 50001 §6.4
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indicators.map((ind) => (
            <div key={ind.id} className="p-4 rounded-xl bg-deep-950/80 border border-slate-800 flex flex-col justify-between gap-3 font-mono">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-electric-cyan/20 text-electric-cyan text-[10px] font-bold border border-electric-cyan/40">
                    {ind.code}
                  </span>
                  <span className="text-[10px] text-slate-400">{ind.energy_scope}</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2 leading-tight">{ind.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">{ind.description}</p>
              </div>

              <div className="p-3 rounded-lg bg-deep-900 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase">Formule de calcul :</div>
                <div className="text-xs text-electric-cyan font-bold mt-0.5 truncate" title={ind.formula_expression}>
                  {ind.formula_expression}
                </div>
              </div>

              <div className="flex items-baseline justify-between border-t border-slate-800 pt-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Valeur Actuelle :</span>
                  <div className="text-xl font-black text-white">
                    {ind.current_value} <span className="text-xs font-normal text-electric-cyan">{ind.unit}</span>
                  </div>
                </div>

                {ind.target_value && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase">Cible DEPA :</span>
                    <div className="text-sm font-bold text-emerald-400">
                      {ind.target_value} <span className="text-[10px] text-slate-400">{ind.unit}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SER Baseline Versioning & Traceability Table */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-electric-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Gestion des Versions de la Situation Énergétique de Référence (SER)
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-bold">Traçabilité Immuable ISO 50001 §6.5</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Code & Version</th>
                <th className="py-2.5 px-3">Désignation</th>
                <th className="py-2.5 px-3">Période de Référence</th>
                <th className="py-2.5 px-3">Conso Référence</th>
                <th className="py-2.5 px-3">Méthode Mathématique</th>
                <th className="py-2.5 px-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {baselines.map((base) => (
                <tr key={base.id} className="hover:bg-deep-850/50 text-slate-300">
                  <td className="py-3 px-3 font-bold text-electric-cyan">
                    {base.code} ({base.version})
                  </td>
                  <td className="py-3 px-3 text-white font-semibold">{base.name}</td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(base.period_start).toLocaleDateString('fr-FR')} &bull; {new Date(base.period_end).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-3 text-white font-bold">
                    {base.baseline_consumption_kwh.toLocaleString('fr-FR')} kWh/j
                  </td>
                  <td className="py-3 px-3 text-slate-300">{base.calculation_method}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      base.is_active 
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {base.is_active ? 'ACTIVE (EN VIGUEUR)' : 'ARCHIVÉE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New IPE creation */}
      {showAddIpeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-950/80 backdrop-blur-sm p-4">
          <div className="cyber-card rounded-2xl p-6 border border-cyan-500/30 bg-deep-900 w-full max-w-lg shadow-[0_0_50px_rgba(0,240,255,0.2)]">
            <h3 className="text-base font-bold text-white font-mono uppercase border-b border-slate-800 pb-3">
              Définition d'un Nouvel Indicateur IPÉ (ISO 50001)
            </h3>
            <form onSubmit={handleCreateIpe} className="mt-4 flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase">Code de l'indicateur</label>
                <input
                  type="text"
                  required
                  placeholder="ex: SEC-RO-RO"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase">Nom complet</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Consommation Spécifique Quai Ro-Ro"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase">Formule mathématique documentée</label>
                <input
                  type="text"
                  required
                  placeholder="ex: kWh_TOTAL / NOMBRE_CAMIONS"
                  value={newFormula}
                  onChange={(e) => setNewFormula(e.target.value)}
                  className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase">Unité de mesure</label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase">Valeur cible</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddIpeModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-deep-850 hover:bg-deep-800 text-slate-300 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-electric-cyan hover:bg-cyan-300 text-deep-950 font-bold text-xs"
                >
                  Enregistrer l'indicateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
