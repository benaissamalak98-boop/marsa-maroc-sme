import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { SCADA_ALERTS } from '../../data/portTopology';
import { api, AlertIncidentApi } from '../../services/api';

export const AlertTicker: React.FC = () => {
  const [liveAlerts, setLiveAlerts] = useState<AlertIncidentApi[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const incs = await api.getAlertIncidents();
        const active = incs.filter(i => i.status !== 'CLOTUREE');
        if (active.length > 0) {
          setLiveAlerts(active);
        }
      } catch {
        // Fallback silently to static topology alerts if offline
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const displayList = liveAlerts.length > 0 ? liveAlerts.map(a => ({
    id: a.id,
    timestamp: new Date(a.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    subsystem: a.substation_id || 'RESEAU',
    message: a.title,
    value: a.observed_value || a.severity,
    severity: a.severity
  })) : SCADA_ALERTS;

  return (
    <div className="bg-deep-900/90 border border-cyan-500/20 rounded-xl px-4 py-2 flex items-center gap-3 overflow-hidden font-mono text-xs shadow-md">
      <div className="flex items-center gap-1.5 text-industrial-amber shrink-0 font-bold border-r border-slate-700/80 pr-3">
        <Bell className="w-3.5 h-3.5 animate-bounce" />
        <span className="hidden sm:inline">ALARMES & ÉVÉNEMENTS SCADA :</span>
        <span className="sm:hidden">ALERTES :</span>
      </div>

      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5 text-slate-300">
        {displayList.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          return (
            <div key={alert.id} className="flex items-center gap-2 shrink-0">
              <span className={`w-2 h-2 rounded-full ${
                isCritical ? 'bg-rose-500 animate-ping' : 'bg-industrial-amber animate-pulse'
              }`} />
              <span className="text-slate-500 text-[11px]">{alert.timestamp}</span>
              <span className="px-1.5 py-0.2 rounded bg-deep-850 text-white font-bold text-[10px] border border-slate-700">
                {alert.subsystem}
              </span>
              <span className="text-slate-300 text-[11px]">{alert.message}</span>
              <span className="text-electric-cyan font-bold text-[10px]">({alert.value})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
