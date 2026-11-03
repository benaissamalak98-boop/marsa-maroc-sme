import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Zap, 
  Clock, 
  Gauge, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { api, SubstationApi, TelemetryPointApi } from '../../../services/api';

export const DashboardSupervision: React.FC = () => {
  const [substations, setSubstations] = useState<SubstationApi[]>([]);
  const [selectedSubstationId, setSelectedSubstationId] = useState<string>('sub-depa-main');
  const [selectedVariable, setSelectedVariable] = useState<string>('ACTIVE_POWER_KW');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('DAY');
  const [curvesData, setCurvesData] = useState<TelemetryPointApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [toggleBreakerLoading, setToggleBreakerLoading] = useState<string | null>(null);

  // Fetch initial substations and telemetry
  const loadData = async () => {
    try {
      setRefreshing(true);
      const subs = await api.getSubstations();
      setSubstations(subs);

      const curvesResp = await api.getTelemetryCurves(selectedSubstationId, selectedVariable, selectedPeriod);
      setCurvesData(curvesResp.series || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Erreur chargement Module 01 :", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [selectedSubstationId, selectedVariable, selectedPeriod]);

  // Handle toggling circuit breaker
  const handleToggleBreaker = async (sub: SubstationApi) => {
    try {
      setToggleBreakerLoading(sub.id);
      const newState = !sub.breaker_state;
      await api.updateSubstation(sub.id, { breaker_state: newState });
      setSubstations(prev => prev.map(s => s.id === sub.id ? { ...s, breaker_state: newState } : s));
    } catch (err) {
      console.error("Erreur commutation disjoncteur :", err);
    } finally {
      setToggleBreakerLoading(null);
    }
  };

  // Selected substation object
  const currentSub = useMemo(() => {
    return substations.find(s => s.id === selectedSubstationId) || substations[0];
  }, [substations, selectedSubstationId]);

  // Aggregate Metrics
  const aggregates = useMemo(() => {
    if (!curvesData.length) return { min: 0, max: 0, avg: 0, latest: 0 };
    const values = curvesData.map(p => {
      switch (selectedVariable) {
        case 'ACTIVE_POWER_KW': return p.active_power_kw;
        case 'REACTIVE_POWER_KVAR': return p.reactive_power_kvar;
        case 'APPARENT_POWER_KVA': return p.apparent_power_kva;
        case 'VOLTAGE_V': return p.voltage_v;
        case 'CURRENT_A': return p.current_a;
        case 'POWER_FACTOR': return p.power_factor;
        case 'THD_PERCENT': return p.thd_percent;
        default: return p.active_power_kw;
      }
    });
    const sum = values.reduce((acc, v) => acc + v, 0);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: Math.round((sum / values.length) * 10) / 10,
      latest: values[values.length - 1] || 0
    };
  }, [curvesData, selectedVariable]);

  const getVariableUnit = (v: string) => {
    switch (v) {
      case 'ACTIVE_POWER_KW': return 'kW';
      case 'REACTIVE_POWER_KVAR': return 'kVAR';
      case 'APPARENT_POWER_KVA': return 'kVA';
      case 'VOLTAGE_V': return 'V';
      case 'CURRENT_A': return 'A';
      case 'POWER_FACTOR': return 'cos φ';
      case 'THD_PERCENT': return '%';
      default: return 'kW';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* 1. Global SCADA Header for Module 01 */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/25 bg-deep-900/90 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-electric-cyan tracking-wider">
              <span className="w-2 h-2 rounded-full bg-electric-cyan animate-ping" />
              <span>MODULE 01 — TÉLÉMESURE & SUPERVISION ÉNERGÉTIQUE HTA/BT</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">PORT D'AGADIR (DEPA)</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Supervision des 6 Postes de Transformation Électrique
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Acquisition continue des flux de puissance, analyse des courbes de charge, facteur de puissance et distorsion harmonique.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-deep-950 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-electric-cyan" />
              <span>Maj : {lastUpdated.toLocaleTimeString('fr-FR')}</span>
            </div>
            <button
              onClick={loadData}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-electric-cyan/15 hover:bg-electric-cyan/25 border border-electric-cyan/40 text-electric-cyan text-xs font-bold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>ACTUALISER</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Substation Quick Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {substations.map(sub => {
          const isSelected = sub.id === selectedSubstationId;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubstationId(sub.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between font-mono ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-950/80 to-deep-850 border-electric-cyan shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'bg-deep-900/60 hover:bg-deep-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-electric-cyan text-deep-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {sub.code}
                </span>
                <span className={`w-2 h-2 rounded-full ${sub.breaker_state ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              </div>
              <div className="mt-2">
                <div className="text-xs font-bold text-white truncate">{sub.name.replace('Poste ', '')}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{sub.voltage_primary} &bull; {sub.transformer_rating_kva} kVA</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Deep Dive into Selected Substation */}
      {currentSub && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Substation Info & Breaker Controller */}
          <div className="cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-electric-cyan uppercase">Poste Actif : {currentSub.code}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{currentSub.name}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                currentSub.breaker_state 
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' 
                  : 'bg-rose-950/80 text-rose-400 border-rose-500/40'
              }`}>
                {currentSub.breaker_state ? 'DISJONCTEUR SF6 ENCLENCHÉ' : 'DISJONCTEUR DÉCLENCHÉ'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-deep-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Tension Primaire</span>
                <div className="text-white font-bold text-sm mt-0.5">{currentSub.voltage_primary}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-deep-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Tension Secondaire</span>
                <div className="text-white font-bold text-sm mt-0.5">{currentSub.voltage_secondary}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-deep-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Puissance Transfo</span>
                <div className="text-white font-bold text-sm mt-0.5">{currentSub.transformer_rating_kva} kVA</div>
              </div>
              <div className="p-2.5 rounded-xl bg-deep-950/70 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Zone Portuaire</span>
                <div className="text-white font-bold text-sm mt-0.5 truncate">{currentSub.zone_name}</div>
              </div>
            </div>

            {/* Circuit Breaker Toggle Action */}
            <div className="p-3 rounded-xl bg-deep-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Commande Disjoncteur SF6</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Télécommande motorisée depuis le SME</p>
              </div>
              <button
                onClick={() => handleToggleBreaker(currentSub)}
                disabled={toggleBreakerLoading === currentSub.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  currentSub.breaker_state
                    ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300'
                }`}
              >
                {toggleBreakerLoading === currentSub.id 
                  ? 'COMMUTATION...' 
                  : (currentSub.breaker_state ? 'DÉCLENCHER' : 'RÉENCLENCHER')}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-300">Statut Métrologique :</span>
              <span className="px-2 py-0.5 rounded bg-electric-cyan/20 text-electric-cyan font-bold border border-electric-cyan/40">
                {currentSub.is_simulated ? 'SIMULÉ (QUALIFIÉ)' : 'RÉEL OT'}
              </span>
            </div>
          </div>

          {/* Interactive Chart & Telemetry Waveform */}
          <div className="lg:col-span-2 cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
            
            {/* Chart Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-electric-cyan" />
                <span className="text-xs font-mono font-bold text-white uppercase">Courbe Chronologique des Mesures</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                {/* Variable Selector */}
                <select
                  value={selectedVariable}
                  onChange={(e) => setSelectedVariable(e.target.value)}
                  className="bg-deep-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-electric-cyan text-xs"
                >
                  <option value="ACTIVE_POWER_KW">Puissance Active P (kW)</option>
                  <option value="REACTIVE_POWER_KVAR">Puissance Réactive Q (kVAR)</option>
                  <option value="APPARENT_POWER_KVA">Puissance Apparente S (kVA)</option>
                  <option value="VOLTAGE_V">Tension Efficace U (V)</option>
                  <option value="CURRENT_A">Courant Moyen I (A)</option>
                  <option value="POWER_FACTOR">Facteur de Puissance cos φ</option>
                  <option value="THD_PERCENT">Taux Harmonique THD (%)</option>
                </select>

                {/* Period Selector */}
                <div className="flex items-center bg-deep-950 rounded-lg p-0.5 border border-slate-800">
                  {['DAY', 'WEEK', 'MONTH'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPeriod(p)}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                        selectedPeriod === p
                          ? 'bg-electric-cyan text-deep-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p === 'DAY' ? '24H' : p === 'WEEK' ? '7J' : '30J'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Aggregate Stats Badges */}
            <div className="grid grid-cols-4 gap-2 font-mono">
              <div className="p-2 rounded-lg bg-deep-950/80 border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Actuel</div>
                <div className="text-sm font-bold text-electric-cyan mt-0.5">
                  {aggregates.latest} <span className="text-[10px] text-slate-400">{getVariableUnit(selectedVariable)}</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-deep-950/80 border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Moyenne</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {aggregates.avg} <span className="text-[10px] text-slate-400">{getVariableUnit(selectedVariable)}</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-deep-950/80 border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Pointe Max</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">
                  {aggregates.max} <span className="text-[10px] text-slate-400">{getVariableUnit(selectedVariable)}</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-deep-950/80 border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Minimum</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {aggregates.min} <span className="text-[10px] text-slate-400">{getVariableUnit(selectedVariable)}</span>
                </div>
              </div>
            </div>

            {/* SVG Visual Chart */}
            <div className="h-56 w-full relative bg-deep-950/60 rounded-xl p-3 border border-slate-800/60 flex items-center justify-center">
              {curvesData.length > 1 ? (
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="600" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" strokeDasharray="3 3" />

                  {/* Gradient Area Definition */}
                  <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  <polygon
                    points={`0,150 ${curvesData.map((pt, i) => {
                      const x = (i / (curvesData.length - 1)) * 600;
                      const val = (selectedVariable === 'ACTIVE_POWER_KW' ? pt.active_power_kw :
                                   selectedVariable === 'VOLTAGE_V' ? pt.voltage_v :
                                   selectedVariable === 'CURRENT_A' ? pt.current_a :
                                   selectedVariable === 'POWER_FACTOR' ? pt.power_factor : pt.thd_percent);
                      const range = aggregates.max - aggregates.min || 1;
                      const y = 140 - ((val - aggregates.min) / range) * 110;
                      return `${x},${y}`;
                    }).join(' ')} 600,150`}
                    fill="url(#curveGradient)"
                  />

                  {/* Polyline Curve */}
                  <polyline
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={curvesData.map((pt, i) => {
                      const x = (i / (curvesData.length - 1)) * 600;
                      const val = (selectedVariable === 'ACTIVE_POWER_KW' ? pt.active_power_kw :
                                   selectedVariable === 'VOLTAGE_V' ? pt.voltage_v :
                                   selectedVariable === 'CURRENT_A' ? pt.current_a :
                                   selectedVariable === 'POWER_FACTOR' ? pt.power_factor : pt.thd_percent);
                      const range = aggregates.max - aggregates.min || 1;
                      const y = 140 - ((val - aggregates.min) / range) * 110;
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Peak Marker Point */}
                  <circle cx="500" cy="45" r="4" fill="#00F0FF" className="animate-pulse" />
                </svg>
              ) : (
                <div className="text-xs font-mono text-slate-500">Collecte des échantillons Modbus en cours...</div>
              )}
            </div>

            {/* Data Quality & Traceability Bar */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 bg-deep-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Horodatage : Pas de 15 minutes normalisé &bull; Traçabilité ISO 50001</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-300">Statut Donnée : <b className="text-electric-cyan">VALIDÉE</b></span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300">Taux de Complétude : <b className="text-emerald-400">99.8%</b></span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
