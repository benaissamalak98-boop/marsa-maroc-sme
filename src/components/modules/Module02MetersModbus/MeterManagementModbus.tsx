import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Cpu, 
  Terminal, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Sliders, 
  Wifi, 
  WifiOff, 
  Clock, 
  Database,
  Info
} from 'lucide-react';
import { api, MeterApi, ModbusTestResult } from '../../../services/api';

export const MeterManagementModbus: React.FC = () => {
  const [meters, setMeters] = useState<MeterApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [testingMeterId, setTestingMeterId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<ModbusTestResult | null>(null);
  
  // Custom test bench form state
  const [benchIp, setBenchIp] = useState<string>('192.168.10.12');
  const [benchPort, setBenchPort] = useState<number>(502);
  const [benchUnitId, setBenchUnitId] = useState<number>(1);
  const [benchReg, setBenchReg] = useState<number>(3000);
  const [benchCount, setBenchCount] = useState<number>(2);
  const [benchSimulate, setBenchSimulate] = useState<boolean>(true);
  const [benchRunning, setBenchRunning] = useState<boolean>(false);

  // Selected meter for register view
  const [selectedMeter, setSelectedMeter] = useState<MeterApi | null>(null);

  // Load meters list
  const loadMeters = async () => {
    try {
      setLoading(true);
      const list = await api.getMeters();
      setMeters(list);
      if (list.length > 0 && !selectedMeter) {
        setSelectedMeter(list[0]);
      }
    } catch (err) {
      console.error("Erreur chargement compteurs :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeters();
  }, []);

  // Quick test for an existing meter
  const handleTestMeter = async (meter: MeterApi) => {
    try {
      setTestingMeterId(meter.id);
      const res = await api.testModbusComm({
        ip_address: meter.ip_address,
        port: meter.port,
        unit_id: meter.unit_id,
        register_address: 3000,
        register_count: 2,
        simulate: meter.mode === 'SIMULATION',
      });
      setTestResult(res);
      loadMeters();
    } catch (err: any) {
      setTestResult({
        success: false,
        latency_ms: 0,
        raw_registers: [],
        message: err.message || "Erreur de test",
        status: "ERROR"
      });
    } finally {
      setTestingMeterId(null);
    }
  };

  // Run Custom Test Bench
  const handleRunBenchTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBenchRunning(true);
      const res = await api.testModbusComm({
        ip_address: benchIp,
        port: benchPort,
        unit_id: benchUnitId,
        register_address: benchReg,
        register_count: benchCount,
        simulate: benchSimulate,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        latency_ms: 0,
        raw_registers: [],
        message: err.message || "Erreur banc d'essai",
        status: "ERROR"
      });
    } finally {
      setBenchRunning(false);
    }
  };

  // Toggle Meter Mode (Simulation vs Real OT)
  const handleToggleMode = async (meter: MeterApi) => {
    const newMode = meter.mode === 'SIMULATION' ? 'REAL_OT' : 'SIMULATION';
    try {
      await api.updateMeter(meter.id, { mode: newMode });
      setMeters(prev => prev.map(m => m.id === meter.id ? { ...m, mode: newMode } : m));
      if (selectedMeter?.id === meter.id) {
        setSelectedMeter(prev => prev ? { ...prev, mode: newMode } : null);
      }
    } catch (err) {
      console.error("Erreur mise à jour mode compteur :", err);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/25 bg-deep-900/90 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-electric-cyan tracking-wider">
              <Network className="w-4 h-4" />
              <span>MODULE 02 — ACQUISITION MODBUS TCP/IP & GESTION DES COMPTEURS</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">BUS INDUSTRIEL DEPA</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Topologie Métrologique & Banc de Test Modbus
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Supervision des passerelles communicantes, tables de conversion de registres Float32/Int16 et bascule Simulation / OT.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-deep-950 border border-slate-800 text-xs font-mono text-slate-300">
              Protocole : <b>Modbus TCP (Port 502)</b>
            </span>
            <button
              onClick={loadMeters}
              className="p-2 rounded-xl bg-deep-850 hover:bg-cyan-950 border border-slate-700 text-slate-300 hover:text-electric-cyan transition-all"
              title="Actualiser les compteurs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Mode Clarity Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-deep-950 via-deep-900 to-cyan-950/40 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-electric-cyan/40 text-electric-cyan shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-electric-cyan uppercase">
              ENVIRONNEMENT D'EXPLOITATION ACTIF : HYBRIDE SIMULATION & OT
            </span>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Toutes les données simulées sont explicitement marquées <b>[SIMULATED]</b> selon le cahier des charges SME.
              Le raccordement aux équipements physiques Schneider PM8000 / Siemens PAC4200 s'effectue par simple bascule de mode.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Meters Inventory Table */}
      <div className="cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-electric-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Compteurs Communicants Installés ({meters.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Fréquence de collecte : 5 secondes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="py-2.5 px-3">Tag & Code</th>
                <th className="py-2.5 px-3">Désignation</th>
                <th className="py-2.5 px-3">Fabricant / Modèle</th>
                <th className="py-2.5 px-3">Adresse IP : Port</th>
                <th className="py-2.5 px-3">Unit ID</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Statut Com</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {meters.map(meter => {
                const isSelected = selectedMeter?.id === meter.id;
                return (
                  <tr 
                    key={meter.id}
                    onClick={() => setSelectedMeter(meter)}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'bg-cyan-950/30 text-white' : 'hover:bg-deep-850/50 text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-electric-cyan">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-electric-cyan" />
                        <span>{meter.code}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">{meter.counting_point_tag}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">{meter.name}</td>
                    <td className="py-3 px-3 text-slate-300">{meter.manufacturer} &bull; {meter.model}</td>
                    <td className="py-3 px-3 text-slate-200">{meter.ip_address}:{meter.port}</td>
                    <td className="py-3 px-3 text-center">{meter.unit_id}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMode(meter);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                          meter.mode === 'SIMULATION'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                        }`}
                        title="Cliquer pour basculer Mode Simulation / Mode Réel OT"
                      >
                        {meter.mode}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{meter.comm_status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestMeter(meter);
                        }}
                        disabled={testingMeterId === meter.id}
                        className="px-2.5 py-1 rounded bg-deep-950 hover:bg-cyan-950 border border-slate-700 hover:border-electric-cyan text-electric-cyan text-[10px] font-bold transition-all"
                      >
                        {testingMeterId === meter.id ? 'TEST EN COURS...' : 'TESTER COM'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interactive Test Bench & Register Mapping Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Modbus Test Bench Form */}
        <div className="cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 font-mono">
            <Terminal className="w-4 h-4 text-electric-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Banc d'Essai de Communication Modbus TCP
            </h3>
          </div>

          <form onSubmit={handleRunBenchTest} className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <label className="text-[10px] text-slate-400 uppercase">Adresse IP Passerelle</label>
              <input
                type="text"
                value={benchIp}
                onChange={(e) => setBenchIp(e.target.value)}
                className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase">Port Modbus TCP</label>
              <input
                type="number"
                value={benchPort}
                onChange={(e) => setBenchPort(Number(e.target.value))}
                className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase">Slave Unit ID</label>
              <input
                type="number"
                value={benchUnitId}
                onChange={(e) => setBenchUnitId(Number(e.target.value))}
                className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase">Adresse Registre (Holding FC03)</label>
              <input
                type="number"
                value={benchReg}
                onChange={(e) => setBenchReg(Number(e.target.value))}
                className="w-full mt-1 bg-deep-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-electric-cyan"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-xl bg-deep-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="benchSim"
                  checked={benchSimulate}
                  onChange={(e) => setBenchSimulate(e.target.checked)}
                  className="rounded border-slate-700 text-electric-cyan focus:ring-0"
                />
                <label htmlFor="benchSim" className="text-xs text-slate-300 cursor-pointer">
                  Mode Simulation Traçable (Test sans compteur physique)
                </label>
              </div>

              <button
                type="submit"
                disabled={benchRunning}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-electric-cyan hover:bg-cyan-300 text-deep-950 font-bold transition-all text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{benchRunning ? 'ENVOI TRAME...' : 'EXÉCUTER REQUÊTE'}</span>
              </button>
            </div>
          </form>

          {/* Test Result Console Display */}
          {testResult && (
            <div className={`p-4 rounded-xl border font-mono text-xs flex flex-col gap-2 ${
              testResult.success
                ? 'bg-deep-950 border-emerald-500/40 text-slate-200'
                : 'bg-deep-950 border-rose-500/40 text-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2 font-bold">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>RÉSULTAT DE COMMUNICATION : {testResult.status}</span>
                </span>
                <span className="text-[10px] text-slate-400">Latence : {testResult.latency_ms} ms</span>
              </div>

              <p className="text-xs leading-relaxed">{testResult.message}</p>

              {testResult.raw_registers.length > 0 && (
                <div className="mt-2 p-2.5 rounded-lg bg-deep-900 border border-slate-800 text-[11px] grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px]">Registres 16 bits bruts :</span>
                    <div className="text-electric-cyan font-bold mt-0.5">
                      [{testResult.raw_registers.join(', ')}]
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px]">Valeur Float32 Décodée :</span>
                    <div className="text-emerald-400 font-bold mt-0.5">
                      {testResult.decoded_value} kW
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Meter Registers Table */}
        <div className="cyber-card rounded-2xl p-5 border border-cyan-500/20 bg-deep-900/80 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-electric-cyan" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Cartographie des Registres Modbus
              </h3>
            </div>
            {selectedMeter && (
              <span className="text-xs text-electric-cyan font-bold">{selectedMeter.code}</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-2.5">Grandeur</th>
                  <th className="py-2 px-2.5">Registre</th>
                  <th className="py-2 px-2.5">Format</th>
                  <th className="py-2 px-2.5">Échelle</th>
                  <th className="py-2 px-2.5">Unité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {selectedMeter?.registers && selectedMeter.registers.length > 0 ? (
                  selectedMeter.registers.map((reg, idx) => (
                    <tr key={idx} className="hover:bg-deep-850/50">
                      <td className="py-2 px-2.5 font-bold text-slate-200">{reg.variable_name}</td>
                      <td className="py-2 px-2.5 text-electric-cyan font-bold">{reg.register_address}</td>
                      <td className="py-2 px-2.5 text-slate-400">{reg.data_type} (2 mots)</td>
                      <td className="py-2 px-2.5 text-slate-300">&times; {reg.scale_factor}</td>
                      <td className="py-2 px-2.5 text-emerald-400 font-bold">{reg.unit}</td>
                    </tr>
                  ))
                ) : (
                  [
                    { name: 'ACTIVE_POWER_KW', addr: 3000, type: 'FLOAT32', scale: 1.0, unit: 'kW' },
                    { name: 'REACTIVE_POWER_KVAR', addr: 3002, type: 'FLOAT32', scale: 1.0, unit: 'kVAR' },
                    { name: 'APPARENT_POWER_KVA', addr: 3004, type: 'FLOAT32', scale: 1.0, unit: 'kVA' },
                    { name: 'POWER_FACTOR', addr: 3006, type: 'FLOAT32', scale: 1.0, unit: 'cos φ' },
                    { name: 'VOLTAGE_V', addr: 3008, type: 'FLOAT32', scale: 1.0, unit: 'V' },
                    { name: 'CURRENT_A', addr: 3010, type: 'FLOAT32', scale: 1.0, unit: 'A' },
                    { name: 'THD_PERCENT', addr: 3012, type: 'FLOAT32', scale: 1.0, unit: '%' },
                    { name: 'ACTIVE_ENERGY_KWH', addr: 3014, type: 'FLOAT32', scale: 1.0, unit: 'kWh' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-deep-850/50">
                      <td className="py-2 px-2.5 font-bold text-slate-200">{r.name}</td>
                      <td className="py-2 px-2.5 text-electric-cyan font-bold">{r.addr}</td>
                      <td className="py-2 px-2.5 text-slate-400">{r.type}</td>
                      <td className="py-2 px-2.5 text-slate-300">&times; {r.scale}</td>
                      <td className="py-2 px-2.5 text-emerald-400 font-bold">{r.unit}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-deep-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Ordre des octets : <b>Big-Endian IEEE 754</b></span>
            <span>Fonction lecture : <b>FC 03 (Holding Registers)</b></span>
          </div>
        </div>

      </div>

    </div>
  );
};
