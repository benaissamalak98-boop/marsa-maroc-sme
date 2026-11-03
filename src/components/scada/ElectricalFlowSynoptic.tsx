import React, { useState } from 'react';
import { 
  GitBranch, 
  ShieldCheck, 
} from 'lucide-react';
import { SUBSTATIONS_DATA } from '../../data/portTopology';
import type { SubstationNode } from '../../types/energy';

interface ElectricalFlowSynopticProps {
  onSelectSubstation: (sub: SubstationNode) => void;
  selectedSubstationId: string;
}

export const ElectricalFlowSynoptic: React.FC<ElectricalFlowSynopticProps> = ({
  onSelectSubstation,
  selectedSubstationId,
}) => {
  const [breakerStates, setBreakerStates] = useState<{ [key: string]: boolean }>({
    'D_SOURCE': true,
    'D_BUSBAR': true,
    'D_TC1': true,
    'D_FRIGO': true,
    'D_VRAC': true,
    'D_OPS': true,
    'D_CAP': true,
  });

  const toggleBreaker = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBreakerStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getSub = (id: string) => SUBSTATIONS_DATA.find(s => s.id === id);

  return (
    <div className="cyber-card rounded-2xl p-4 lg:p-6 tech-border-corner">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-electric-cyan/40 text-electric-cyan">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <span>SYNOPTIQUE ÉLECTRIQUE UNIFILAIRE DE RÉPARTITION MT 22 kV</span>
            </h2>
            <p className="text-xs text-slate-400">
              Architecture en boucle ouverte HTA • Arrivée ONEE Anza vers Postes Terminaux DEPA
            </p>
          </div>
        </div>

        {/* Real-time Electrical Health Pill */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-deep-900 border border-slate-700 text-slate-300">
            <span className="text-slate-500">FRÉQUENCE :</span>
            <span className="text-electric-cyan font-bold">50.02 Hz</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-deep-900 border border-slate-700 text-slate-300">
            <span className="text-slate-500">COMPENSATION VAR :</span>
            <span className="text-emerald-400 font-bold">ACTIVE (0.97)</span>
          </div>
        </div>
      </div>

      {/* Industrial SCADA Electrical Grid Canvas */}
      <div className="bg-[#030814] rounded-xl border border-cyan-500/20 p-4 lg:p-6 overflow-x-auto">
        <div className="min-w-[840px] flex flex-col gap-6">

          {/* Level 1: ONEE GRID INFEED */}
          <div className="flex items-center justify-between gap-4 bg-deep-900/80 p-3 rounded-xl border border-slate-700/80 font-mono">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-electric-cyan/10 border border-electric-cyan/40 flex items-center justify-center text-electric-cyan font-bold">
                ONEE
              </div>
              <div>
                <div className="text-xs text-slate-400">POSTE SOURCE D'INTERCONNEXION 60/22 kV</div>
                <div className="text-sm font-bold text-white">Ligne MT 22 kV — Réseau Souss-Massa</div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-slate-500 text-[10px]">TENSION RÉSEAU</span>
                <div className="text-white font-bold">22.15 kV</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">P. ACTIVE APPELÉE</span>
                <div className="text-electric-cyan font-bold">2 845 kW</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">COURANT I_L</span>
                <div className="text-white font-bold">76.5 A</div>
              </div>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <span className="text-slate-400 text-[11px]">DISJONCTEUR PRINCIPAL :</span>
                <button
                  onClick={(e) => toggleBreaker('D_SOURCE', e)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    breakerStates['D_SOURCE'] 
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50' 
                      : 'bg-red-950 text-red-400 border-red-500/50'
                  }`}
                >
                  {breakerStates['D_SOURCE'] ? 'FERMÉ (EN SERVICE)' : 'OUVERT (ISOLÉ)'}
                </button>
              </div>
            </div>
          </div>

          {/* Vertical Trunk Line */}
          <div className="flex justify-center -my-3">
            <div className="w-1 h-8 bg-cyan-400 shadow-[0_0_10px_#00F0FF] animate-pulse" />
          </div>

          {/* Level 2: JEU DE BARRES MT 22 kV (CENTRAL BUSBAR PP-DEPA) */}
          <div className="relative bg-gradient-to-r from-cyan-950/60 via-deep-850 to-cyan-950/60 border-2 border-electric-cyan/70 rounded-xl p-3 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-electric-cyan text-deep-950 font-bold text-[10px]">
                  JDB 22 kV
                </span>
                <span className="text-white font-bold tracking-wider">
                  JEU DE BARRES PRINCIPAL PP-DEPA — CELLULES MT SF6 (4 000 kVA)
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-300">
                <span>Charge : <strong className="text-electric-cyan">70.2 %</strong></span>
                <span>Cos φ : <strong className="text-emerald-400">0.97</strong></span>
                <span>THD : <strong className="text-slate-300">2.4 %</strong></span>
              </div>
            </div>

            {/* Glowing Busbar visualization line */}
            <div className="h-2 w-full bg-electric-cyan/80 rounded-full my-2 shadow-[0_0_15px_#00F0FF]" />

            {/* Capacitive Power Factor Compensation Unit connected to busbar */}
            <div className="flex justify-end pt-1">
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Batterie Condensateurs MT 400 kVAR (Régul Automatique)</span>
              </div>
            </div>
          </div>

          {/* Vertical Distribution Feeders */}
          <div className="grid grid-cols-4 gap-4">

            {/* FEEDER 1: PT1-CONT (Terminal Conteneurs) */}
            <div 
              onClick={() => {
                const sub = getSub('sub-tc1');
                if (sub) onSelectSubstation(sub);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer font-mono flex flex-col justify-between ${
                selectedSubstationId === 'sub-tc1'
                  ? 'bg-deep-800 border-electric-cyan shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                  : 'bg-deep-900/70 border-slate-700/80 hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold text-electric-cyan">FEEDER 01 • PT1</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">1 600 kVA</span>
                </div>
                <div className="text-xs font-bold text-white mb-1">
                  Terminal Conteneurs
                </div>
                <div className="text-[10px] text-slate-400 mb-2">
                  Portiques STS 1-2 & Racks Reefers
                </div>

                {/* Transformer Icon & Voltage */}
                <div className="flex items-center gap-2 bg-deep-950 p-2 rounded border border-slate-800 my-2">
                  <div className="text-[10px] text-electric-cyan font-bold">22 kV ➔ 400 V</div>
                  <div className="text-[10px] text-slate-400 ml-auto">Charge: 54.2%</div>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between border-t border-slate-800 pt-2 text-xs">
                  <span className="text-slate-400">P. Active :</span>
                  <span className="text-white font-bold text-sm">840 kW</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Cos φ : <strong className="text-emerald-400">0.96</strong></span>
                  <span>THD : <strong className="text-slate-300">3.8%</strong></span>
                </div>
              </div>
            </div>

            {/* FEEDER 2: PT3-FRIGO (Complexe Froid Souss) */}
            <div 
              onClick={() => {
                const sub = getSub('sub-frigo');
                if (sub) onSelectSubstation(sub);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer font-mono flex flex-col justify-between ${
                selectedSubstationId === 'sub-frigo'
                  ? 'bg-deep-800 border-electric-cyan shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                  : 'bg-deep-900/70 border-slate-700/80 hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold text-electric-teal">FEEDER 02 • PT3</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">2 000 kVA</span>
                </div>
                <div className="text-xs font-bold text-white mb-1">
                  Complexe Frigorifique
                </div>
                <div className="text-[10px] text-slate-400 mb-2">
                  Export Primeurs Souss & Halieutique
                </div>

                <div className="flex items-center gap-2 bg-deep-950 p-2 rounded border border-slate-800 my-2">
                  <div className="text-[10px] text-electric-teal font-bold">22 kV ➔ 400 V</div>
                  <div className="text-[10px] text-slate-400 ml-auto">Charge: 48.0%</div>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between border-t border-slate-800 pt-2 text-xs">
                  <span className="text-slate-400">P. Active :</span>
                  <span className="text-white font-bold text-sm">920 kW</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Cos φ : <strong className="text-emerald-400">0.95</strong></span>
                  <span>COP : <strong className="text-electric-teal">3.42</strong></span>
                </div>
              </div>
            </div>

            {/* FEEDER 3: PT2-POLY (Terminal Vrac & Grues) */}
            <div 
              onClick={() => {
                const sub = getSub('sub-vrac');
                if (sub) onSelectSubstation(sub);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer font-mono flex flex-col justify-between ${
                selectedSubstationId === 'sub-vrac'
                  ? 'bg-deep-800 border-electric-cyan shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                  : 'bg-deep-900/70 border-slate-700/80 hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold text-industrial-amber">FEEDER 03 • PT2</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">1 250 kVA</span>
                </div>
                <div className="text-xs font-bold text-white mb-1">
                  Polyvalent & Vracquiers
                </div>
                <div className="text-[10px] text-slate-400 mb-2">
                  Grues Gottwald & Convoyeurs
                </div>

                <div className="flex items-center gap-2 bg-deep-950 p-2 rounded border border-slate-800 my-2">
                  <div className="text-[10px] text-industrial-amber font-bold">22 kV ➔ 400 V</div>
                  <div className="text-[10px] text-slate-400 ml-auto">Charge: 39.8%</div>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between border-t border-slate-800 pt-2 text-xs">
                  <span className="text-slate-400">P. Active :</span>
                  <span className="text-white font-bold text-sm">480 kW</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Cos φ : <strong className="text-emerald-400">0.96</strong></span>
                  <span>Courant : <strong className="text-slate-300">718 A</strong></span>
                </div>
              </div>
            </div>

            {/* FEEDER 4: PT6-OPS (Shore-to-Ship Navires) */}
            <div 
              onClick={() => {
                const sub = getSub('sub-ops');
                if (sub) onSelectSubstation(sub);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer font-mono flex flex-col justify-between ${
                selectedSubstationId === 'sub-ops'
                  ? 'bg-deep-800 border-electric-cyan shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                  : 'bg-deep-900/70 border-slate-700/80 hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold text-[#38BDF8]">FEEDER 04 • PT6</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">2 500 kVA</span>
                </div>
                <div className="text-xs font-bold text-white mb-1">
                  Alimentation Navires OPS
                </div>
                <div className="text-[10px] text-slate-400 mb-2">
                  Cold Ironing Quai • MV TIZNIT
                </div>

                <div className="flex items-center gap-2 bg-deep-950 p-2 rounded border border-slate-800 my-2">
                  <div className="text-[10px] text-[#38BDF8] font-bold">22 kV ➔ 6.6 kV 60Hz</div>
                  <div className="text-[10px] text-slate-400 ml-auto">Charge: 23.2%</div>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between border-t border-slate-800 pt-2 text-xs">
                  <span className="text-slate-400">P. Active :</span>
                  <span className="text-white font-bold text-sm">570 kW</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Cos φ : <strong className="text-emerald-400">0.98</strong></span>
                  <span>CO2 Évité : <strong className="text-emerald-400">4.8 t</strong></span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
