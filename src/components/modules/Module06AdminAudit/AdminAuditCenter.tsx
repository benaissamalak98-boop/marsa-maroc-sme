import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  Lock, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  UserPlus, 
  Terminal, 
  Sliders, 
  Database,
  History,
  LogIn
} from 'lucide-react';
import { api, UserApi, AuditLogApi, setStoredAuth } from '../../../services/api';

export const AdminAuditCenter: React.FC = () => {
  const [users, setUsers] = useState<UserApi[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [resettingData, setResettingData] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // New user form state
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newFullName, setNewFullName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<'ADMIN_TECH' | 'RESPONSABLE_ENERGIE' | 'EXPLOITANT' | 'AUDITEUR'>('EXPLOITANT');

  // Search filter for audit log
  const [auditSearch, setAuditSearch] = useState<string>('');

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [uList, logs] = await Promise.all([
        api.getUsers(),
        api.getAuditLogs(100),
      ]);
      setUsers(uList);
      setAuditLogs(logs);
    } catch (err) {
      console.error("Erreur chargement administration :", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        username: newUsername,
        password: newPassword,
        full_name: newFullName,
        email: newEmail,
        role: newRole,
      });
      setShowAddUserModal(false);
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      setNewEmail('');
      loadData();
    } catch (err: any) {
      alert(`Erreur lors de la création d'utilisateur : ${err.message}`);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Confirmer la réinitialisation des données de démonstration du SME ?")) return;
    try {
      setResettingData(true);
      const res = await api.resetDemoData();
      setResetSuccessMessage(res.message || "Données réinitialisées avec succès");
      setTimeout(() => setResetSuccessMessage(null), 5000);
      loadData();
    } catch (err: any) {
      alert(`Erreur réinitialisation : ${err.message}`);
    } finally {
      setResettingData(false);
    }
  };

  const handleQuickLoginAs = async (username: string) => {
    try {
      const password = username === 'admin' ? 'admin123' :
                       username === 'resp_energie' ? 'energie123' :
                       username === 'exploitant' ? 'exploitant123' : 'auditeur123';
      const authData = await api.login(username, password);
      alert(`Connecté en tant que : ${authData.user.full_name} (${authData.user.role})`);
      loadData();
    } catch (err: any) {
      alert(`Erreur connexion : ${err.message}`);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return log.action.toLowerCase().includes(q) ||
           log.username.toLowerCase().includes(q) ||
           log.entity.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/25 bg-deep-900/90 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-electric-cyan tracking-wider">
              <Shield className="w-4 h-4 text-electric-cyan" />
              <span>MODULE 06 — ADMINISTRATION, RÔLES & JOURNAL D'AUDIT</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">GOUVERNANCE & SÉCURITÉ ANSSI / ISO 27001</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Contrôle des Accès (RBAC) & Traçabilité des Actions Sensibles
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Gestion des profils DEPA (Admin, Énergie, Exploitant, Auditeur), hachage PBKDF2 et Audit Log immuable.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-electric-cyan hover:bg-cyan-300 text-deep-950 text-xs font-bold font-mono transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>NOUVEL UTILISATEUR</span>
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-deep-850 hover:bg-cyan-950 border border-slate-700 text-slate-300 hover:text-electric-cyan transition-all"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {resetSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{resetSuccessMessage}</span>
        </div>
      )}

      {/* 2. RBAC Roles Matrix Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-deep-950 border border-rose-500/30">
          <div className="text-xs text-rose-400 font-bold uppercase">ADMIN_TECH</div>
          <div className="text-sm font-bold text-white mt-1">Administrateur Technique</div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Configuration globale, gestion des automates, accès root et paramétrage du serveur.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-deep-950 border border-cyan-500/30">
          <div className="text-xs text-electric-cyan font-bold uppercase">RESPONSABLE_ENERGIE</div>
          <div className="text-sm font-bold text-white mt-1">Responsable Énergie DEPA</div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Validation des SER, seuils d'alertes, EnPIs, audits ISO 50001 et optimisation ONEE.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-deep-950 border border-amber-500/30">
          <div className="text-xs text-amber-400 font-bold uppercase">EXPLOITANT</div>
          <div className="text-sm font-bold text-white mt-1">Exploitant / Opérateur</div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Supervision 24/7, acquittement des alarmes et télécommande des disjoncteurs.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-deep-950 border border-emerald-500/30">
          <div className="text-xs text-emerald-400 font-bold uppercase">AUDITEUR</div>
          <div className="text-sm font-bold text-white mt-1">Lecteur / Auditeur ISO</div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Consultation seule, vérification de la complétude métrologique et export des rapports.
          </p>
        </div>
      </div>

      {/* 3. Users Accounts Table */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-electric-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Comptes Définis & Habilitations DEPA ({users.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Authentification JWT & Bulles RBAC</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Identifiant</th>
                <th className="py-2.5 px-3">Nom & Prénom</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Rôle Assigné</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-right">Connexion Rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-deep-850/50 text-slate-300">
                  <td className="py-3 px-3 font-bold text-electric-cyan">{u.username}</td>
                  <td className="py-3 px-3 text-white font-semibold">{u.full_name}</td>
                  <td className="py-3 px-3 text-slate-400">{u.email || '—'}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      u.role === 'ADMIN_TECH'
                        ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                        : u.role === 'RESPONSABLE_ENERGIE'
                        ? 'bg-cyan-950 text-electric-cyan border-cyan-500/40'
                        : u.role === 'EXPLOITANT'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{u.is_active ? 'ACTIF' : 'SUSPENDU'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleQuickLoginAs(u.username)}
                      className="px-2.5 py-1 rounded bg-deep-950 hover:bg-cyan-950 border border-slate-700 hover:border-electric-cyan text-slate-300 hover:text-electric-cyan text-[10px] font-bold transition-all"
                    >
                      SESSION TEST
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Live Audit Log */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 font-mono">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-electric-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Journal d'Audit Immuable (Audit Log Traçable)
            </h3>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Filtrer l'audit par action, user..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="w-full bg-deep-950 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left font-mono text-xs">
            <thead className="sticky top-0 bg-deep-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Horodatage</th>
                <th className="py-2.5 px-3">Utilisateur</th>
                <th className="py-2.5 px-3">Action Réalisée</th>
                <th className="py-2.5 px-3">Entité Cible</th>
                <th className="py-2.5 px-3">Adresse IP</th>
                <th className="py-2.5 px-3">Détail des Modifications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-deep-850/50 text-slate-300">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString('fr-FR')} {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-electric-cyan">{log.username}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">
                    <span className="px-1.5 py-0.5 rounded bg-deep-950 border border-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{log.entity} {log.entity_id ? `(${log.entity_id})` : ''}</td>
                  <td className="py-2.5 px-3 text-slate-500">{log.ip_address}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono text-[10px] truncate max-w-xs" title={log.new_value || ''}>
                    {log.new_value || log.old_value || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. System Tools & Demonstration Reset Center */}
      <div className="p-4 rounded-2xl bg-deep-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
        <div>
          <span className="text-xs font-bold text-white uppercase">Maintenance de l'Environnement de Démonstration</span>
          <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
            Régénération des 6 postes, télémesures simulées, 4 comptes utilisateurs et conformité initiale du marché 12/DEPA/2026.
          </p>
        </div>

        <button
          onClick={handleResetData}
          disabled={resettingData}
          className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-bold transition-all shrink-0 text-xs"
        >
          {resettingData ? 'RÉINITIALISATION EN COURS...' : 'RÉINITIALISER LES DONNÉES DE DÉMO'}
        </button>
      </div>

      {/* Modal: Create User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-950/80 backdrop-blur-sm p-4">
          <div className="cyber-card rounded-2xl p-6 border border-cyan-500/30 bg-deep-900 w-full max-w-md shadow-[0_0_50px_rgba(0,240,255,0.2)] font-mono text-xs">
            <h3 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-3">
              Création d'un Nouveau Compte Utilisateur
            </h3>
            <form onSubmit={handleCreateUser} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase">Identifiant unique (login)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: ing_depa"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase">Mot de passe provisoire</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase">Nom complet & Titre</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Tariq Mansouri — Ingénieur Énergie"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase">Email institutionnel</label>
                <input
                  type="email"
                  placeholder="nom@marsamaroc.co.ma"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase">Profil & Habilitation RBAC</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
                >
                  <option value="EXPLOITANT">EXPLOITANT (Opérateur SCADA)</option>
                  <option value="RESPONSABLE_ENERGIE">RESPONSABLE_ENERGIE (Pilote ISO 50001)</option>
                  <option value="ADMIN_TECH">ADMIN_TECH (Administrateur Système)</option>
                  <option value="AUDITEUR">AUDITEUR (Consultation & Audit)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-deep-850 hover:bg-deep-800 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-electric-cyan hover:bg-cyan-300 text-deep-950 font-bold"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
