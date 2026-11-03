import React from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Database,
  Sliders,
  AlertCircle
} from 'lucide-react';
import type { ModuleDefinition } from '../../types/energy';
import { DashboardSupervision } from './Module01Supervision/DashboardSupervision';
import { MeterManagementModbus } from './Module02MetersModbus/MeterManagementModbus';
import { EnergyPerformanceIpeSer } from './Module03IpeSer/EnergyPerformanceIpeSer';
import { AlertIncidentCenter } from './Module04Alerts/AlertIncidentCenter';
import { ReportingAnalytics } from './Module05Reporting/ReportingAnalytics';
import { AdminAuditCenter } from './Module06AdminAudit/AdminAuditCenter';

interface ModuleDetailViewProps {
  module: ModuleDefinition;
  onBack: () => void;
}

export const ModuleDetailView: React.FC<ModuleDetailViewProps> = ({ module, onBack }) => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-deep-900/80 p-4 rounded-2xl border border-cyan-500/20 font-mono">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-deep-850 hover:bg-cyan-950 border border-slate-700 hover:border-electric-cyan text-slate-300 hover:text-electric-cyan transition-all text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETOUR AU CENTRE DE CONTRÔLE</span>
          </button>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-electric-cyan/20 text-electric-cyan text-xs font-bold border border-electric-cyan/40">
              MOD-{module.number}
            </span>
            <span className="text-white text-xs font-bold tracking-wide">
              {module.shortTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">RÉFÉRENTIEL :</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold">
            {module.isoStandard}
          </span>
        </div>
      </div>

      {/* Render the specialized functional component based on module.id */}
      {module.id === 'module-supervision' && <DashboardSupervision />}
      {module.id === 'module-meters' && <MeterManagementModbus />}
      {module.id === 'module-ipe-ser' && <EnergyPerformanceIpeSer />}
      {module.id === 'module-alerts' && <AlertIncidentCenter />}
      {module.id === 'module-reporting' && <ReportingAnalytics />}
      {module.id === 'module-admin' && <AdminAuditCenter />}

    </div>
  );
};
