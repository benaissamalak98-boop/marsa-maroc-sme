import React, { useState } from 'react';
import { 
  Radio
} from 'lucide-react';
import { SUBSTATIONS_DATA, PORT_ZONES } from '../../data/portTopology';
import type { SubstationNode, PortZone } from '../../types/energy';

interface PortAgadirDigitalTwinProps {
  selectedSubstation: SubstationNode;
  onSelectSubstation: (sub: SubstationNode) => void;
  selectedZone: PortZone | null;
  onSelectZone: (zone: PortZone | null) => void;
}

export const PortAgadirDigitalTwin: React.FC<PortAgadirDigitalTwinProps> = ({
  selectedSubstation,
  onSelectSubstation,
  onSelectZone,
}) => {
  const [viewMode, setViewMode] = useState<'ELECTRICAL' | 'OPERATIONAL' | 'LOAD_HEAT'>('ELECTRICAL');
  const showFlowLines = true;

  return (
    <div className="cyber-card rounded-2xl p-4 lg:p-6 tech-border-corner overflow-hidden flex flex-col gap-4">
      {/* Top Header of the Digital Twin */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-electric-cyan/40 text-electric-cyan">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase font-mono">
              JUMEAU NUMÉRIQUE ÉNERGÉTIQUE — PORT D'AGADIR (DEPA)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold">
              SCADA 22 kV ACTIF
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Topologie spatiale interactive des postes de transformation MT/BT, boucles d'alimentation et quais d'accostage.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-deep-900/90 p-1 rounded-xl border border-slate-700/80 text-xs font-mono">
          <button
            onClick={() => setViewMode('ELECTRICAL')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'ELECTRICAL'
                ? 'bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/40 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FLUX ÉLECTRIQUES 22kV
          </button>
          <button
            onClick={() => setViewMode('OPERATIONAL')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'OPERATIONAL'
                ? 'bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/40 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            QUAIS & TERMINAUX
          </button>
          <button
            onClick={() => setViewMode('LOAD_HEAT')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'LOAD_HEAT'
                ? 'bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/40 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CHARGE TRANSFOS (%)
          </button>
        </div>
      </div>

      {/* Interactive SCADA SVG Canvas */}
      <div className="relative w-full aspect-[16/9] min-h-[420px] max-h-[580px] bg-gradient-to-b from-[#020713] via-[#040E20] to-[#01040A] rounded-xl border border-cyan-500/20 overflow-hidden shadow-inner select-none">
        
        {/* Subtle Radar & Coordinate Grid Background */}
        <div className="absolute inset-0 bg-subtle-grid opacity-30 pointer-events-none" />

        {/* Agadir Coastline / Ocean Bay SVG Map */}
        <svg 
          viewBox="0 0 1000 580" 
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="oceanGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#020919" />
              <stop offset="60%" stopColor="#051833" />
              <stop offset="100%" stopColor="#09274D" />
            </linearGradient>

            <linearGradient id="pierGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F243E" />
              <stop offset="100%" stopColor="#091729" />
            </linearGradient>

            <linearGradient id="quayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#132B4A" />
              <stop offset="100%" stopColor="#0A182A" />
            </linearGradient>

            {/* Filter Glow */}
            <filter id="glowSubstation" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="glowPulse" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Bassin Maritime / Océan Atlantique (Port d'Agadir) */}
          <rect width="1000" height="580" fill="url(#oceanGradient)" />

          {/* Sea water ripples and depth lines */}
          <path d="M 50 180 Q 200 160 350 200 T 700 190 T 950 210" fill="none" stroke="#00F0FF" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M 30 320 Q 250 290 450 330 T 800 310" fill="none" stroke="#00F0FF" strokeWidth="0.5" strokeOpacity="0.1" />
          <path d="M 80 460 Q 300 420 600 470 T 950 440" fill="none" stroke="#00F0FF" strokeWidth="0.5" strokeOpacity="0.15" />

          {/* 2. Grandes Digues & Brise-Lames du Port d'Agadir (Jetée Principale & Contre-Jetée) */}
          <polygon 
            points="60,40 120,40 320,380 280,420 210,380 90,140" 
            fill="url(#pierGradient)" 
            stroke="#1E4B7A" 
            strokeWidth="1.5"
            className="filter drop-shadow-lg"
          />
          <polygon 
            points="280,410 370,410 430,340 380,310 320,380" 
            fill="url(#quayGradient)" 
            stroke="#00E5FF" 
            strokeWidth="1" 
            strokeOpacity="0.4"
          />

          {/* 3. Terre-Pleins & Terminaux Portuaires */}
          {/* Terminal à Conteneurs (Quai Nord / TC) */}
          <path 
            d="M 440 240 L 820 240 L 820 370 L 520 370 L 480 340 L 440 340 Z" 
            fill="#0B1C33" 
            stroke="#00F0FF" 
            strokeWidth="1.5" 
            strokeDasharray="4 2"
            strokeOpacity={viewMode === 'OPERATIONAL' ? '0.8' : '0.4'}
            className="cursor-pointer hover:fill-[#102747] transition-colors"
            onClick={() => onSelectZone(PORT_ZONES.find(z => z.id === 'zone-tc') || null)}
          />

          {/* Terminal Polyvalent & Vracquiers */}
          <path 
            d="M 350 375 L 560 375 L 560 520 L 320 520 L 320 440 Z" 
            fill="#09182C" 
            stroke="#F59E0B" 
            strokeWidth="1.5"
            strokeDasharray="4 2"
            strokeOpacity={viewMode === 'OPERATIONAL' ? '0.8' : '0.4'}
            className="cursor-pointer hover:fill-[#0E2442] transition-colors"
            onClick={() => onSelectZone(PORT_ZONES.find(z => z.id === 'zone-vrac') || null)}
          />

          {/* Complexe Frigorifique & Magasins Primeurs Souss-Massa */}
          <path 
            d="M 620 80 L 940 80 L 940 220 L 620 220 Z" 
            fill="#08182B" 
            stroke="#00E5C8" 
            strokeWidth="1.5"
            strokeDasharray="4 2"
            strokeOpacity={viewMode === 'OPERATIONAL' ? '0.8' : '0.4'}
            className="cursor-pointer hover:fill-[#0D2644] transition-colors"
            onClick={() => onSelectZone(PORT_ZONES.find(z => z.id === 'zone-frigo') || null)}
          />

          {/* Front de Mer OPS & Quais d'Accostage Navires */}
          <path 
            d="M 580 380 L 900 380 L 900 480 L 620 480 Z" 
            fill="#071526" 
            stroke="#38BDF8" 
            strokeWidth="1.5"
            strokeDasharray="4 2"
            strokeOpacity={viewMode === 'OPERATIONAL' ? '0.8' : '0.4'}
            className="cursor-pointer hover:fill-[#0C213B] transition-colors"
            onClick={() => onSelectZone(PORT_ZONES.find(z => z.id === 'zone-ops') || null)}
          />

          {/* Postes de Transformation (Electrical Network Lines MT 22 kV) */}
          {showFlowLines && (
            <g className="electrical-grid-cables">
              {/* Ligne ONEE Anza vers Poste Principal DEPA */}
              <line 
                x1="180" y1="120" x2="380" y2="190" 
                stroke="#00F0FF" strokeWidth="2.5" 
                strokeDasharray="6 4"
                className="animate-flow"
              />
              {/* Ligne PP-DEPA vers PT1-CONT */}
              <line 
                x1="380" y1="190" x2="560" y2="300" 
                stroke="#00F0FF" strokeWidth="2" 
                strokeDasharray="5 3"
                className="animate-flow"
              />
              {/* Ligne PP-DEPA vers PT3-FRIGO */}
              <line 
                x1="380" y1="190" x2="740" y2="150" 
                stroke="#00E5C8" strokeWidth="2" 
                strokeDasharray="5 3"
                className="animate-flow"
              />
              {/* Ligne PP-DEPA vers PT2-POLY */}
              <line 
                x1="380" y1="190" x2="420" y2="430" 
                stroke="#F59E0B" strokeWidth="2" 
                strokeDasharray="5 3"
                className="animate-flow"
              />
              {/* Ligne PP-DEPA vers PT6-OPS */}
              <line 
                x1="380" y1="190" x2="710" y2="430" 
                stroke="#38BDF8" strokeWidth="2" 
                strokeDasharray="5 3"
                className="animate-flow"
              />
              {/* Interconnexion boucle de secours PT1-PT6 */}
              <line 
                x1="560" y1="300" x2="710" y2="430" 
                stroke="#64748B" strokeWidth="1" 
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* Visual Elements: Navire à Quai (OPS Raccordé) */}
          <g transform="translate(730, 440) rotate(-5)">
            <path 
              d="M 0 0 L 110 0 L 130 14 L 115 28 L 0 28 L -15 14 Z" 
              fill="#1E293B" 
              stroke="#38BDF8" 
              strokeWidth="1.5"
            />
            {/* Cabine navire */}
            <rect x="20" y="5" width="35" height="18" fill="#334155" />
            <text x="65" y="18" fill="#38BDF8" fontSize="8" fontFamily="monospace" fontWeight="bold">
              MV TIZNIT [OPS: 570 kW]
            </text>
            <path d="M 40 28 Q 30 40 PT6 430" fill="none" stroke="#00F0FF" strokeWidth="2" strokeDasharray="3 2" />
          </g>

          {/* Visual Elements: Portiques STS sur Quai Nord */}
          <g transform="translate(540, 240)">
            <line x1="-30" y1="0" x2="180" y2="0" stroke="#00F0FF" strokeWidth="2" strokeOpacity="0.7" />
            <rect x="10" y="-18" width="24" height="18" fill="#0284C7" stroke="#00F0FF" strokeWidth="1" />
            <line x1="22" y1="-18" x2="22" y2="-45" stroke="#00F0FF" strokeWidth="2" />
            <line x1="22" y1="-45" x2="60" y2="-30" stroke="#00F0FF" strokeWidth="1.5" />
            <text x="5" y="-52" fill="#E2E8F0" fontSize="8" fontFamily="monospace">STS 01</text>

            <rect x="90" y="-18" width="24" height="18" fill="#0284C7" stroke="#00F0FF" strokeWidth="1" />
            <line x1="102" y1="-18" x2="102" y2="-45" stroke="#00F0FF" strokeWidth="2" />
            <line x1="102" y1="-45" x2="140" y2="-30" stroke="#00F0FF" strokeWidth="1.5" />
            <text x="85" y="-52" fill="#E2E8F0" fontSize="8" fontFamily="monospace">STS 02 (Regen)</text>
          </g>

          {/* Visual Elements: Zone Conteneurs Empilés */}
          <g transform="translate(680, 270)">
            <rect x="0" y="0" width="30" height="12" fill="#0284C7" opacity="0.7" />
            <rect x="35" y="0" width="30" height="12" fill="#F59E0B" opacity="0.7" />
            <rect x="70" y="0" width="30" height="12" fill="#10B981" opacity="0.7" />
            <rect x="15" y="16" width="30" height="12" fill="#0284C7" opacity="0.7" />
            <rect x="50" y="16" width="30" height="12" fill="#EF4444" opacity="0.7" />
            <text x="10" y="42" fill="#94A3B8" fontSize="8" fontFamily="monospace">PARC DE STOCKAGE TC</text>
          </g>

          {/* Visual Elements: Zone Frigorifique Reefers */}
          <g transform="translate(670, 110)">
            <text x="0" y="20" fill="#00E5C8" fontSize="10" fontFamily="monospace" fontWeight="bold">
              COMPLEXE FROID EXPORT
            </text>
            <text x="0" y="34" fill="#94A3B8" fontSize="8" fontFamily="monospace">
              Primeurs Souss • Halieutique • 45 000 m³
            </text>
            <circle cx="200" cy="25" r="14" fill="#00E5C8" fillOpacity="0.1" stroke="#00E5C8" strokeWidth="1" />
            <text x="192" y="29" fill="#00E5C8" fontSize="9" fontFamily="monospace" fontWeight="bold">COP 3.4</text>
          </g>

          {/* 4. Substation Nodes (Interactive Clickable SVG Points) */}
          {SUBSTATIONS_DATA.map((sub) => {
            const cx = (sub.location.x / 100) * 1000;
            const cy = (sub.location.y / 100) * 580;
            const isSelected = selectedSubstation.id === sub.id;

            let statusColor = '#00F0FF';
            if (viewMode === 'LOAD_HEAT') {
              if (sub.telemetry.transformerLoadPercent > 65) statusColor = '#F59E0B';
              if (sub.telemetry.transformerLoadPercent > 80) statusColor = '#EF4444';
            }

            return (
              <g 
                key={sub.id} 
                className="cursor-pointer transition-transform duration-200 group"
                onClick={() => onSelectSubstation(sub)}
              >
                {isSelected && (
                  <>
                    <circle 
                      cx={cx} cy={cy} r="28" 
                      fill="none" stroke="#00F0FF" strokeWidth="1.5" 
                      className="animate-ping" opacity="0.6" 
                    />
                    <circle 
                      cx={cx} cy={cy} r="22" 
                      fill="#00F0FF" fillOpacity="0.15" 
                      stroke="#00F0FF" strokeWidth="2" 
                    />
                  </>
                )}

                <circle 
                  cx={cx} cy={cy} r={isSelected ? "14" : "11"} 
                  fill="#030A17" 
                  stroke={statusColor} 
                  strokeWidth={isSelected ? "2.5" : "1.8"}
                  filter={isSelected ? "url(#glowPulse)" : undefined}
                />

                <circle 
                  cx={cx} cy={cy} r={isSelected ? "5" : "4"} 
                  fill={statusColor} 
                />

                <g transform={`translate(${cx + 18}, ${cy - 12})`}>
                  <rect 
                    x="-4" y="-12" 
                    width={sub.code.length * 8 + 36} height="24" 
                    rx="4" 
                    fill="#050E1D" 
                    fillOpacity="0.9" 
                    stroke={isSelected ? "#00F0FF" : "rgba(0, 240, 255, 0.3)"} 
                    strokeWidth="1" 
                  />
                  <text 
                    x="4" y="4" 
                    fill="#FFFFFF" 
                    fontSize="10" 
                    fontFamily="monospace" 
                    fontWeight="bold"
                  >
                    {sub.code}
                  </text>
                  <text 
                    x={sub.code.length * 8 + 8} y="4" 
                    fill={statusColor} 
                    fontSize="9" 
                    fontFamily="monospace" 
                    fontWeight="bold"
                  >
                    {viewMode === 'LOAD_HEAT' 
                      ? `${sub.telemetry.transformerLoadPercent}%` 
                      : `${sub.telemetry.activePowerKw}kW`}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Compass Rose & Port Coordinates */}
          <g transform="translate(920, 520)">
            <circle cx="0" cy="0" r="22" fill="#0A182A" stroke="#00F0FF" strokeWidth="1" opacity="0.6" />
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#00F0FF" strokeWidth="1.5" />
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#00F0FF" strokeWidth="1.5" />
            <text x="-4" y="-22" fill="#00F0FF" fontSize="9" fontFamily="monospace" fontWeight="bold">N</text>
            <text x="2" y="12" fill="#94A3B8" fontSize="6" fontFamily="monospace">AGADIR</text>
          </g>
        </svg>

        {/* Floating Quick Legend in Canvas Bottom-Left */}
        <div className="absolute bottom-3 left-3 bg-deep-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-cyan-500/30 text-[10px] font-mono text-slate-300 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-electric-cyan" />
            <span>Ligne 22 kV Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Poste Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-industrial-amber" />
            <span>Vrac & Convoyeurs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-electric-teal" />
            <span>Complexe Frigo Souss</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
            <span>OPS Cold Ironing Navires</span>
          </div>
        </div>

        {/* Selected Node Quick HUD Tooltip Overlay */}
        <div className="absolute top-3 right-3 bg-deep-900/95 backdrop-blur-md px-4 py-3 rounded-xl border border-electric-cyan/50 text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.2)] max-w-xs">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-electric-cyan font-bold">
              <span>{selectedSubstation.code}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-semibold">
              EN SERVICE
            </span>
          </div>
          <div className="text-slate-200 font-semibold text-[11px] mb-1">
            {selectedSubstation.name}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-300">
            <div>
              <span className="text-slate-500 text-[10px]">P. ACTIVE :</span>
              <div className="text-white font-bold">{selectedSubstation.telemetry.activePowerKw} kW</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">TENSION :</span>
              <div className="text-electric-cyan font-bold">{selectedSubstation.voltagePrimary} / {selectedSubstation.voltageSecondary}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">COS φ :</span>
              <div className="text-emerald-400 font-bold">{selectedSubstation.telemetry.powerFactorCosPhi}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">CHARGE TRANSFO :</span>
              <div className="text-industrial-amber font-bold">{selectedSubstation.telemetry.transformerLoadPercent} %</div>
            </div>
          </div>
        </div>
      </div>

      {/* Substation Selector Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SUBSTATIONS_DATA.map((sub) => {
          const isSelected = selectedSubstation.id === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => onSelectSubstation(sub)}
              className={`p-2.5 rounded-xl border text-left transition-all duration-200 font-mono ${
                isSelected
                  ? 'bg-deep-800 border-electric-cyan text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'bg-deep-900/60 border-slate-800/80 hover:border-cyan-500/30 text-slate-300 hover:bg-deep-850'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-electric-cyan">{sub.code}</span>
                <span className="text-[10px] text-slate-400">{sub.voltageSecondary}</span>
              </div>
              <div className="text-xs font-semibold truncate text-slate-200">
                {sub.name.replace('Poste ', '')}
              </div>
              <div className="flex items-baseline justify-between mt-1 text-[11px]">
                <span className="text-slate-400 font-normal">Appel :</span>
                <span className="font-bold text-white">{sub.telemetry.activePowerKw} kW</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
