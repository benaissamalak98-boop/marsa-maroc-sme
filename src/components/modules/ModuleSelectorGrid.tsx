import React from 'react';
import { 
  LayoutDashboard,
  Network, 
  Leaf, 
  AlertCircle,
  Receipt, 
  Shield,
  ArrowRight,
  Activity,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';
import { MODULES_CONFIG } from '../../data/modulesConfig';

interface ModuleSelectorGridProps {
  onSelectModule: (moduleId: string) => void;
}

export const ModuleSelectorGrid: React.FC<ModuleSelectorGridProps> = ({ onSelectModule }) => {
  const getIcon = (iconName: string) => {
    const iconClass = "w-5 h-5 text-electric-cyan";
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className={iconClass} />;
      case 'Network': return <Network className={iconClass} />;
      case 'Leaf': return <Leaf className={iconClass} />;
      case 'AlertCircle': return <AlertCircle className={iconClass} />;
      case 'Receipt': return <Receipt className={iconClass} />;
      case 'Shield': return <Shield className={iconClass} />;
      default: return <Activity className={iconClass} />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-electric-cyan" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-electric-cyan font-mono text-xs font-bold uppercase tracking-widest">
              SYSTÈME MODULAIRE DE SUPERVISION
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-xs font-mono">6 MODULES SPÉCIALISÉS PORT D'AGADIR</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-0.5">
            Architecture des Modules Analytiques & Décisionnels
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-deep-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
          CONFORME ISO 50001:2018 &bull; PROTOCOLES MODBUS-TCP / IEC 61850
        </div>
      </div>

      {/* Grid of 6 Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES_CONFIG.map((module) => {
          return (
            <div
              key={module.id}
              onClick={() => onSelectModule(module.id)}
              className="cyber-card rounded-2xl p-5 hover:cyber-card-active transition-all duration-300 cursor-pointer group flex flex-col justify-between border-slate-800 hover:border-cyan-500/50"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-cyan-950/80 border border-electric-cyan/40 group-hover:border-electric-cyan transition-colors">
                      {getIcon(module.iconName)}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-deep-850 text-electric-cyan border border-cyan-500/30">
                      MOD-{module.number}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-deep-900 text-slate-300 border border-slate-700">
                    {module.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-electric-cyan transition-colors leading-snug">
                  {module.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {module.description}
                </p>

                {/* Primary Physical Metric */}
                <div className="my-4 p-3 rounded-xl bg-deep-950/80 border border-cyan-500/15 group-hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>{module.primaryMetric.label}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(module.primaryMetric.trend)}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-2xl font-extrabold text-white group-hover:glow-text-cyan transition-all">
                      {module.primaryMetric.value}
                    </span>
                    <span className="text-xs font-bold text-electric-cyan">
                      {module.primaryMetric.unit}
                    </span>
                  </div>
                </div>

                {/* Secondary Operational Telemetry */}
                <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-800/80 text-[10px] font-mono">
                  {module.secondaryMetrics.map((sec, idx) => (
                    <div key={idx} className="bg-deep-900/60 p-1.5 rounded border border-slate-800">
                      <div className="text-slate-400 truncate">{sec.label}</div>
                      <div className="text-white font-bold mt-0.5">
                        {sec.value} <span className="text-slate-400 font-normal">{sec.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                  {module.isoStandard}
                </span>

                <div className="flex items-center gap-1 text-electric-cyan font-bold group-hover:translate-x-1 transition-transform">
                  <span>ACCÉDER</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
