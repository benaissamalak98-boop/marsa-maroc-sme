import React from 'react';
import { HardDrive, Cpu } from 'lucide-react';
import { PORT_AGADIR_METADATA } from '../../data/portTopology';

export const IndustrialFooter: React.FC = () => {
  return (
    <footer className="border-t border-cyan-500/15 bg-deep-950/90 py-6 px-4 lg:px-6 font-mono text-xs text-slate-500">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-bold text-white">MARSA MAROC</span>
            <span>—</span>
            <span>DEPA Agadir</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="text-slate-400">
            Système de Monitoring Énergétique (SME) • Norme ISO 50001:2018
          </div>
        </div>

        {/* Center Tech Specs */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-electric-cyan" />
            <span>PLC / Modbus-TCP / IEC 61850</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Serveur Edge DEPA-SME-01</span>
          </div>
        </div>

        {/* Right Certification & Location */}
        <div className="text-slate-400 text-center sm:text-right text-[11px]">
          Direction de l'Exploitation du Port d'Agadir &bull; {PORT_AGADIR_METADATA.gps}
        </div>
      </div>
    </footer>
  );
};
