import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  CheckCircle2
} from 'lucide-react';
import type { SubstationNode } from '../../types/energy';

interface SubstationInspectorProps {
  substation: SubstationNode;
  onClose?: () => void;
  onOpenModule?: (moduleId: string) => void;
}

export const SubstationInspector: React.FC<SubstationInspectorProps> = ({
  substation,
}) => {
  const { telemetry } = substation;
  const cosPhiGood = telemetry.powerFactorCosPhi >= 0.92;

  return (
    <div className="cyber-card rounded-2xl p-4 lg:p-6 tech-border-corner font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/90 border border-electric-cyan/50 text-electric-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/40 font-bold">
                {substation.code}
              </span>
              <span className="text-xs text-slate-400 font-sans">
                {substation.location.zone}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-wide mt-0.5">
              {substation.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>DISJONCTEUR ENCLENCHÉ</span>
          </div>
          <span className="text-xs text-slate-400 px-2 py-1 rounded bg-deep-900 border border-slate-700">
            {substation.transformerRatingKva} kVA
          </span>
        </div>
      </div>

      {/* Grid of Real Physical Electrical Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        
        {/* Active Power P */}
        <div className="bg-deep-900/90 p-3 rounded-xl border border-cyan-500/20 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>P. ACTIVE (P)</span>
            <Activity className="w-3 h-3 text-electric-cyan" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-white glow-text-cyan">
              {telemetry.activePowerKw.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-electric-cyan font-bold">kW</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Énergie utile</div>
        </div>

        {/* Reactive Power Q */}
        <div className="bg-deep-900/90 p-3 rounded-xl border border-cyan-500/20 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>P. RÉACTIVE (Q)</span>
            <span className="text-[10px] text-slate-500">Var</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-200">
              {telemetry.reactivePowerKvar}
            </span>
            <span className="text-xs text-slate-400 font-bold">kVAR</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Magnétisant</div>
        </div>

        {/* Apparent Power S */}
        <div className="bg-deep-900/90 p-3 rounded-xl border border-cyan-500/20 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>P. APPARENTE (S)</span>
            <span className="text-[10px] text-slate-500">KVA</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">
              {telemetry.apparentPowerKva}
            </span>
            <span className="text-xs text-electric-blue font-bold">kVA</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Dimensionnement</div>
        </div>

        {/* Power Factor Cos Phi */}
        <div className={`p-3 rounded-xl border flex flex-col justify-between ${
          cosPhiGood 
            ? 'bg-deep-900/90 border-emerald-500/30' 
            : 'bg-red-950/30 border-red-500/40'
        }`}>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>FACTEUR COS φ</span>
            <ShieldCheck className={`w-3 h-3 ${cosPhiGood ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-xl font-bold ${cosPhiGood ? 'text-emerald-400' : 'text-red-400'}`}>
              {telemetry.powerFactorCosPhi.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400">/ 1.00</span>
          </div>
          <div className="text-[10px] text-emerald-400/90 mt-1 font-semibold">
            {cosPhiGood ? 'Bonus ONEE (>0.92)' : 'Pénalité ONEE'}
          </div>
        </div>

        {/* THD Harmoniques */}
        <div className="bg-deep-900/90 p-3 rounded-xl border border-cyan-500/20 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>DISTORSION THD</span>
            <span className="text-[10px] text-slate-500">I & U</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">
              {telemetry.thdPercent}
            </span>
            <span className="text-xs text-slate-400 font-bold">%</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Norme &lt; 5.0%</div>
        </div>

        {/* Transformer Load Rate */}
        <div className="bg-deep-900/90 p-3 rounded-xl border border-cyan-500/20 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>CHARGE TRANSFO</span>
            <Zap className="w-3 h-3 text-industrial-amber" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-industrial-amber">
              {telemetry.transformerLoadPercent}
            </span>
            <span className="text-xs text-industrial-amber font-bold">%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-industrial-amber h-full rounded-full transition-all duration-500"
              style={{ width: `${telemetry.transformerLoadPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Feeders & Operational Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-deep-950/70 p-4 rounded-xl border border-slate-800/80">
        <div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-electric-cyan" />
            DÉPARTS BT / MT & INSTALLATIONS ALIMENTÉES
          </span>
          <div className="flex flex-wrap gap-2">
            {substation.assignedFeeders.map((feeder, idx) => (
              <span 
                key={idx}
                className="text-xs px-2.5 py-1 rounded bg-deep-900 border border-cyan-500/20 text-slate-200 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {feeder}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-electric-teal" />
              ÉNERGIE JOURNALIÈRE & EMPREINTE CARBONE
            </span>
            <div className="flex items-center gap-6 mt-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px]">CONSOMMATION CUMULÉE 24H :</span>
                <div className="text-white font-bold text-sm">
                  {telemetry.dailyEnergyKwh.toLocaleString('fr-FR')} kWh
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">ÉMISSIONS ASSOCIÉES :</span>
                <div className="text-emerald-400 font-bold text-sm">
                  {(telemetry.co2EmissionsKg / 1000).toFixed(2)} tCO2e
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-sans mt-3 border-t border-slate-800/80 pt-2">
            {substation.description}
          </div>
        </div>
      </div>
    </div>
  );
};
