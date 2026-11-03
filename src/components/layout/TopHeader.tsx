import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  User,
  Shield,
  Wifi,
  ChevronDown
} from 'lucide-react';
import { TARIFF_PROFILE } from '../../data/portTopology';
import { api, getStoredUser, UserApi } from '../../services/api';

interface TopHeaderProps {
  activeModuleId: string | null;
  onNavigateHome: () => void;
  onSelectModule: (id: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ 
  activeModuleId, 
  onNavigateHome,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserApi | null>(getStoredUser());
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        timeZone: 'Africa/Casablanca' 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Check backend health
    api.checkHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));

    return () => clearInterval(interval);
  }, []);

  const handleSwitchUser = async (username: string) => {
    try {
      const password = username === 'admin' ? 'admin123' :
                       username === 'resp_energie' ? 'energie123' :
                       username === 'exploitant' ? 'exploitant123' : 'auditeur123';
      const authData = await api.login(username, password);
      setCurrentUser(authData.user);
      setShowUserMenu(false);
    } catch (err) {
      console.error("Erreur switch user :", err);
    }
  };

  return (
    <header className="border-b border-cyan-500/20 bg-deep-900/95 backdrop-blur-xl sticky top-0 z-50">
      {/* Top Industrial Safety & Network Status Banner */}
      <div className="bg-gradient-to-r from-deep-950 via-deep-900 to-deep-950 border-b border-slate-800/80 px-4 py-1 text-[11px] font-mono flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-electric-cyan">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-cyan"></span>
            </span>
            <span className="font-semibold tracking-wider">SCADA SC-DEPA LIVE</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="hidden md:inline text-slate-300">
            SITE : <strong className="text-white">PORT D'AGADIR</strong> (DEPA)
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden lg:inline text-slate-400">
            NORME : <span className="text-emerald-400 font-medium">ISO 50001:2018 SME</span>
          </span>
          <span className="text-slate-600 hidden lg:inline">|</span>
          <span className="hidden xl:inline text-slate-400">
            RÉSEAU MT : <span className="text-electric-blue">22 kV ONEE BOUCLE ANZA</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Backend Status */}
          <div className="flex items-center gap-1.5">
            <Wifi className={`w-3.5 h-3.5 ${backendOnline ? 'text-emerald-400' : 'text-rose-500'}`} />
            <span className={`text-[10px] font-bold ${backendOnline ? 'text-emerald-400' : 'text-rose-500'}`}>
              {backendOnline ? 'API BACKEND CONNECTÉE' : 'HORS LIGNE'}
            </span>
          </div>

          <span className="text-slate-700">|</span>

          {/* ONEE Tariff Status Pill */}
          <div className="flex items-center gap-2 bg-deep-850 px-2.5 py-0.5 rounded border border-cyan-500/30">
            <Zap className="w-3.5 h-3.5 text-industrial-amber animate-pulse" />
            <span className="text-slate-300 font-semibold hidden sm:inline">ONEE MT :</span>
            <span className="text-emerald-400 font-bold tracking-wide">HEURES CREUSES</span>
            <span className="text-slate-400 text-[10px] hidden sm:inline">({TARIFF_PROFILE.currentPriceMadKwh} MAD/kWh)</span>
          </div>

          {/* Clock Agadir Port Time */}
          <div className="flex items-center gap-2 text-slate-300 pl-2">
            <Clock className="w-3.5 h-3.5 text-electric-cyan" />
            <span className="font-semibold text-white tracking-wider">{currentTime}</span>
            <span className="text-slate-500 text-[10px] hidden sm:inline">GMT+1</span>
          </div>
        </div>
      </div>

      {/* Main Branding & Signature Bar */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Official Marsa Maroc Branding + DEPA Signature */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-4 cursor-pointer group select-none"
        >
          {/* Logo Container with glassmorphic industrial badge */}
          <div className="relative p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-all duration-300 shadow-[0_0_20px_rgba(0,163,224,0.15)] flex items-center justify-center h-12 w-32 md:w-40 overflow-hidden">
            <img 
              src="/marsa-maroc-logo.png" 
              alt="Logo Officiel Marsa Maroc" 
              className="max-h-full max-w-full object-contain filter contrast-125"
            />
            {/* Tech Corner Accents */}
            <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-electric-cyan" />
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-electric-cyan" />
          </div>

          {/* Divider */}
          <div className="h-9 w-px bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent hidden sm:block" />

          {/* Title & Signature DEPA */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>PORT ENERGY INTELLIGENCE</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-electric-cyan border border-cyan-500/40 tracking-wider font-semibold">
                SME v2.4
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="text-electric-cyan/90 font-semibold tracking-wide">
                DEPA — Direction de l'Exploitation du Port d'Agadir
              </span>
              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="text-slate-400 hidden md:inline">Système de Monitoring Énergétique</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Indicators & User Switcher */}
        <div className="flex items-center gap-3">
          {/* Active Total Power Gauge Badge */}
          <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-lg bg-deep-850/80 border border-slate-700/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3 text-electric-cyan" /> P. ACTIVE APPELÉE
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-lg font-bold text-white glow-text-cyan">2 810</span>
              <span className="text-xs text-electric-cyan font-semibold">kW</span>
              <span className="text-[10px] text-slate-500 ml-1">/ 4 500 kVA</span>
            </div>
          </div>

          {/* Cos Phi Indicator */}
          <div className="hidden lg:flex flex-col items-end px-3 py-1.5 rounded-lg bg-deep-850/80 border border-slate-700/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> FACTEUR COS φ
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-lg font-bold text-emerald-400">0.97</span>
              <span className="text-[10px] text-emerald-500/80 font-medium">(Bonus ONEE)</span>
            </div>
          </div>

          {/* User Account / Role Selector */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-deep-850 hover:bg-deep-800 border border-slate-700 text-xs font-mono text-slate-200 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-electric-cyan/20 border border-electric-cyan/40 flex items-center justify-center text-electric-cyan font-bold text-[10px]">
                {currentUser?.role ? currentUser.role[0] : 'U'}
              </div>
              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-[10px] text-electric-cyan font-bold leading-none">
                  {currentUser?.role || 'RESPONSABLE_ENERGIE'}
                </span>
                <span className="text-[11px] text-white leading-tight font-sans">
                  {currentUser?.full_name || 'Tariq Mansouri'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-deep-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] p-2 z-50 font-mono text-xs">
                <div className="p-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                  Changer de Profil DEPA (Démonstration)
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  {[
                    { user: 'resp_energie', role: 'RESPONSABLE_ENERGIE', name: 'Tariq Mansouri' },
                    { user: 'admin', role: 'ADMIN_TECH', name: 'Karim Bennani (Admin)' },
                    { user: 'exploitant', role: 'EXPLOITANT', name: 'Youssef Alami (Salle SCADA)' },
                    { user: 'auditeur', role: 'AUDITEUR', name: 'Fatima Zahra (Auditeur ISO)' },
                  ].map((p) => (
                    <button
                      key={p.user}
                      onClick={() => handleSwitchUser(p.user)}
                      className="flex flex-col items-start p-2 rounded-xl hover:bg-cyan-950/60 text-left transition-all border border-transparent hover:border-cyan-500/20"
                    >
                      <span className="text-electric-cyan font-bold text-[10px]">{p.role}</span>
                      <span className="text-white text-xs font-sans">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Return to Overview if in a module */}
          {activeModuleId && (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-950/80 border border-electric-cyan/50 text-electric-cyan hover:bg-cyan-900/80 transition-all font-mono text-xs font-semibold shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <span>ACCUEIL SCADA</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
