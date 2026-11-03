import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Filter, 
  Search, 
  MessageSquare, 
  Check, 
  X, 
  RefreshCw,
  Bell,
  Settings
} from 'lucide-react';
import { api, AlertIncidentApi, AlertRuleApi } from '../../../services/api';

export const AlertIncidentCenter: React.FC = () => {
  const [incidents, setIncidents] = useState<AlertIncidentApi[]>([]);
  const [rules, setRules] = useState<AlertRuleApi[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Modal for acknowledging or closing incident
  const [activeIncidentForAction, setActiveIncidentForAction] = useState<AlertIncidentApi | null>(null);
  const [actionType, setActionType] = useState<'PRISE_EN_CHARGE' | 'CLOTUREE'>('PRISE_EN_CHARGE');
  const [actionComment, setActionComment] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [incs, rls] = await Promise.all([
        api.getAlertIncidents(statusFilter || undefined, severityFilter || undefined),
        api.getAlertRules(),
      ]);
      setIncidents(incs);
      setRules(rls);
    } catch (err) {
      console.error("Erreur chargement alertes :", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [statusFilter, severityFilter]);

  // Handle Status Update
  const handleConfirmAction = async () => {
    if (!activeIncidentForAction) return;
    try {
      setSubmittingAction(true);
      await api.updateAlertStatus(activeIncidentForAction.id, actionType, actionComment);
      setActiveIncidentForAction(null);
      setActionComment('');
      loadData();
    } catch (err) {
      console.error("Erreur mise à jour alerte :", err);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter(inc => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return inc.title.toLowerCase().includes(q) || 
             inc.message.toLowerCase().includes(q) || 
             (inc.substation_id && inc.substation_id.toLowerCase().includes(q));
    }
    return true;
  });

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'CLOTUREE').length;
  const warningCount = incidents.filter(i => i.severity === 'WARNING' && i.status !== 'CLOTUREE').length;
  const closedCount = incidents.filter(i => i.status === 'CLOTUREE').length;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/25 bg-deep-900/90 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-electric-cyan tracking-wider">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>MODULE 04 — GESTION DES ALERTES & INCIDENTS ÉNERGÉTIQUES</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">SUPERVISION SCADA 24/7</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Centre de Traitement & Résolution des Incidents Réseau
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Cycle de vie traçable : Nouvelle ➔ Prise en charge ➔ Clôturée avec consigne d'exploitation et horodatage strict.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-deep-850 hover:bg-cyan-950 border border-slate-700 text-slate-300 hover:text-electric-cyan transition-all text-xs font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>ACTUALISER</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Alarms KPI Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
        <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between border-rose-500/30">
          <div className="flex items-center justify-between text-rose-400 text-xs">
            <span>ALARMES CRITIQUES</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-rose-400 mt-2">
            {criticalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-800 pt-1.5">
            Intervention immédiate requise
          </div>
        </div>

        <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between border-amber-500/30">
          <div className="flex items-center justify-between text-amber-400 text-xs">
            <span>AVERTISSEMENTS</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {warningCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-800 pt-1.5">
            Dérives de seuil & cos φ
          </div>
        </div>

        <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span>INCIDENTS CLÔTURÉS</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            {closedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-800 pt-1.5">
            Historique archivé avec traçabilité
          </div>
        </div>

        <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between border-cyan-500/30">
          <div className="flex items-center justify-between text-electric-cyan text-xs">
            <span>RÈGLES DE SURVEILLANCE</span>
            <Settings className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-electric-cyan mt-2">
            {rules.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-800 pt-1.5">
            Seuils ONEE et dérives modbus
          </div>
        </div>
      </div>

      {/* 3. Incidents Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-deep-900/80 border border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, message ou poste..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-deep-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-electric-cyan"
          >
            <option value="">Tous les statuts</option>
            <option value="NOUVELLE">Nouvelle</option>
            <option value="PRISE_EN_CHARGE">Prise en charge</option>
            <option value="CLOTUREE">Clôturée</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-deep-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-electric-cyan"
          >
            <option value="">Toutes sévérités</option>
            <option value="CRITICAL">Critique</option>
            <option value="WARNING">Majeure</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* 4. Incidents Table */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Journal des Événements & Alarmes Déclenchées ({filteredIncidents.length})
          </h3>
          <span className="text-xs text-slate-400">Norme EEMUA 191 / ISA-18.2</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Date / Heure</th>
                <th className="py-2.5 px-3">Sévérité</th>
                <th className="py-2.5 px-3">Poste / Équipement</th>
                <th className="py-2.5 px-3">Titre de l'Alerte</th>
                <th className="py-2.5 px-3">Valeur Observée</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-right">Action Opérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-deep-850/50 text-slate-300">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(inc.timestamp).toLocaleDateString('fr-FR')} à {new Date(inc.timestamp).toLocaleTimeString('fr-FR')}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-rose-950/90 text-rose-400 border-rose-500/40 animate-pulse'
                          : inc.severity === 'WARNING'
                          ? 'bg-amber-950/90 text-amber-400 border-amber-500/40'
                          : 'bg-cyan-950 text-electric-cyan border-cyan-500/40'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-electric-cyan">
                      {inc.substation_id || 'RESEAU-GLOBAL'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-white font-bold">{inc.title}</div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-1">{inc.message}</div>
                    </td>
                    <td className="py-3 px-3 text-amber-300 font-semibold whitespace-nowrap">
                      {inc.observed_value || '—'} {inc.threshold_value ? `(seuil: ${inc.threshold_value})` : ''}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.status === 'NOUVELLE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : inc.status === 'PRISE_EN_CHARGE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {inc.status === 'NOUVELLE' && (
                        <button
                          onClick={() => {
                            setActiveIncidentForAction(inc);
                            setActionType('PRISE_EN_CHARGE');
                          }}
                          className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-[10px] font-bold transition-all"
                        >
                          PRENDRE EN CHARGE
                        </button>
                      )}
                      {inc.status === 'PRISE_EN_CHARGE' && (
                        <button
                          onClick={() => {
                            setActiveIncidentForAction(inc);
                            setActionType('CLOTUREE');
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold transition-all"
                        >
                          CLÔTURER
                        </button>
                      )}
                      {inc.status === 'CLOTUREE' && (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>RÉSOLU</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    Aucun incident ne correspond aux critères de filtrage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Alert Rules Registry Table */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-electric-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Règles de Détection & Seuils Contractuels ONEE ({rules.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Surveillance temps réel continue</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
          {rules.map((rule) => (
            <div key={rule.id} className="p-3 rounded-xl bg-deep-950/80 border border-slate-800 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-electric-cyan font-bold">{rule.code}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  rule.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                }`}>
                  {rule.severity}
                </span>
              </div>
              <div className="text-white font-bold text-xs">{rule.name}</div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5 text-[11px]">
                <span className="text-slate-400">Seuil de déclenchement :</span>
                <span className="text-amber-300 font-bold">{rule.threshold_value} {rule.threshold_unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Dialog Modal */}
      {activeIncidentForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-950/80 backdrop-blur-sm p-4">
          <div className="cyber-card rounded-2xl p-6 border border-cyan-500/30 bg-deep-900 w-full max-w-md shadow-[0_0_50px_rgba(0,240,255,0.2)] font-mono text-xs">
            <h3 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-3">
              {actionType === 'PRISE_EN_CHARGE' ? 'Prise en Charge de l\'Incident' : 'Clôture & Archivage de l\'Incident'}
            </h3>
            <div className="mt-3 p-3 rounded-xl bg-deep-950 border border-slate-800 text-[11px] text-slate-300">
              <span className="text-electric-cyan font-bold">{activeIncidentForAction.title}</span>
              <p className="mt-1 text-slate-400">{activeIncidentForAction.message}</p>
            </div>

            <div className="mt-4">
              <label className="text-[10px] text-slate-400 uppercase">
                Consigne ou commentaire de l'exploitant DEPA (Obligatoire) :
              </label>
              <textarea
                required
                rows={3}
                placeholder="Indiquez l'action entreprise ou le motif de résolution..."
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-electric-cyan"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setActiveIncidentForAction(null)}
                className="px-4 py-1.5 rounded-lg bg-deep-850 hover:bg-deep-800 text-slate-300"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={submittingAction || !actionComment.trim()}
                onClick={handleConfirmAction}
                className="px-4 py-1.5 rounded-lg bg-electric-cyan hover:bg-cyan-300 text-deep-950 font-bold"
              >
                {submittingAction ? 'Validation...' : 'Valider l\'opération'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
