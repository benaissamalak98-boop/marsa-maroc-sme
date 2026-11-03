import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Leaf,
  AlertCircle,
  Receipt, 
  Shield,
  Layers
} from 'lucide-react';
import { MODULES_CONFIG } from '../../data/modulesConfig';

interface ModuleNavigationProps {
  activeModuleId: string | null;
  onSelectModule: (id: string | null) => void;
}

export const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  activeModuleId,
  onSelectModule,
}) => {
  const getIcon = (iconName: string, active: boolean) => {
    const iconClass = `w-4 h-4 transition-colors ${active ? 'text-electric-cyan' : 'text-slate-400 group-hover:text-cyan-300'}`;
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className={iconClass} />;
      case 'Network': return <Network className={iconClass} />;
      case 'Leaf': return <Leaf className={iconClass} />;
      case 'AlertCircle': return <AlertCircle className={iconClass} />;
      case 'Receipt': return <Receipt className={iconClass} />;
      case 'Shield': return <Shield className={iconClass} />;
      default: return <Layers className={iconClass} />;
    }
  };

  return (
    <nav className="border-b border-cyan-500/15 bg-deep-950/80 backdrop-blur-md sticky top-[82px] z-40 overflow-x-auto no-scrollbar">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 flex items-center gap-1.5 py-1.5 min-w-max">
        {/* Home / Central Command Center Button */}
        <button
          onClick={() => onSelectModule(null)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all duration-200 border relative group ${
            activeModuleId === null
              ? 'bg-gradient-to-r from-cyan-950/90 to-deep-850 text-electric-cyan border-electric-cyan/60 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-deep-900/60 border-transparent'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeModuleId === null ? 'text-electric-cyan' : 'text-slate-400'}`} />
          <span>VUE D'ENSEMBLE SCADA</span>
          {activeModuleId === null && (
            <span className="w-1.5 h-1.5 rounded-full bg-electric-cyan animate-pulse ml-0.5" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* 6 Modules Nav Items */}
        {MODULES_CONFIG.map((mod) => {
          const isActive = activeModuleId === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border relative group ${
                isActive
                  ? 'bg-gradient-to-r from-deep-850 to-deep-800 text-white border-electric-cyan/60 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-deep-900/80 border-slate-800/40 hover:border-cyan-500/30'
              }`}
            >
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                isActive 
                  ? 'bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/40' 
                  : 'bg-slate-800/80 text-slate-400 group-hover:text-cyan-300'
              }`}>
                {mod.number}
              </span>

              {getIcon(mod.iconName, isActive)}

              <span className="tracking-wide">{mod.shortTitle}</span>

              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-electric-cyan animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
