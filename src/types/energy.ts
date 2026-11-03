export type VoltageLevel = '60kV' | '22kV' | '6.6kV' | '400V';

export type TariffSlot = 'HEURES_CREUSES' | 'HEURES_PLEINES' | 'HEURES_POINTE';

export interface ElectricalTelemetry {
  activePowerKw: number;       // Puissance Active P (kW)
  reactivePowerKvar: number;   // Puissance Réactive Q (kVAR)
  apparentPowerKva: number;    // Puissance Apparente S (kVA)
  powerFactorCosPhi: number;   // Facteur de puissance cos φ (Seuil ONEE 0.92)
  voltageV: number;            // Tension efficace U (V ou kV)
  currentA: number;            // Courant moyen I (A)
  frequencyHz: number;         // Fréquence réseau (Hz)
  thdPercent: number;          // Taux de Distorsion Harmonique THD (%)
  transformerLoadPercent: number; // Taux de charge du transformateur (%)
  dailyEnergyKwh: number;      // Énergie active cumulée journalière (kWh)
  co2EmissionsKg: number;      // Facteur émission (kg CO2e)
}

export interface SubstationNode {
  id: string;
  code: string;
  name: string;
  type: 'POSTE_SOURCE' | 'POSTE_DISTRIBUTION' | 'POSTE_TERMINAL' | 'POSTE_OPS';
  voltagePrimary: VoltageLevel;
  voltageSecondary: VoltageLevel;
  transformerRatingKva: number;
  location: { x: number; y: number; zone: string };
  status: 'OPTIMAL' | 'WARNING' | 'ALERT' | 'MAINTENANCE';
  breakerClosed: boolean;
  telemetry: ElectricalTelemetry;
  assignedFeeders: string[];
  description: string;
}

export interface PortZone {
  id: string;
  name: string;
  code: string;
  category: 'CONTAINER' | 'BULK' | 'COLD_CHAIN' | 'NAVAL_FISHING' | 'RO_RO' | 'OPS';
  connectedSubstationId: string;
  currentPowerKw: number;
  peakPowerTodayKw: number;
  primaryEquipment: string[];
  secIndicator: {
    value: number;
    unit: string; // e.g. "kWh / EVP" or "kWh / Tonne"
    target: number;
  };
  operationalStatus: 'ACTIVE' | 'STANDBY' | 'MAINTENANCE';
}

export interface EquipmentEnergyProfile {
  id: string;
  tag: string;
  name: string;
  category: 'STS_CRANE' | 'MHC_CRANE' | 'RTG' | 'REEFER_RACK' | 'OPS_CONVERTER' | 'PUMPING_STATION';
  zoneId: string;
  powerKw: number;
  ratedPowerKw: number;
  dailyHoursOperating: number;
  secValue: number;
  secUnit: string;
  status: 'RUNNING' | 'IDLE' | 'REGENERATION' | 'OFFLINE';
  isRegeneratingPower?: boolean; // Réinjection au réseau lors de la descente de conteneur
  regenerationKw?: number;
}

export interface SCADAAlert {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  subsystem: string;
  message: string;
  value: string;
  threshold: string;
  acknowledged: boolean;
}

export interface ModuleDefinition {
  id: string;
  code: string;
  number: string;
  title: string;
  shortTitle: string;
  badge: string;
  description: string;
  primaryMetric: {
    label: string;
    value: string;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    status: 'nominal' | 'warning' | 'alert';
  };
  secondaryMetrics: {
    label: string;
    value: string;
    unit: string;
  }[];
  scadaFeatures: string[];
  isoStandard: string;
  iconName: string;
}
