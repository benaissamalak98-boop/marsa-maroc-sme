/**
 * MARSA MAROC — PORT ENERGY INTELLIGENCE
 * Service API & Client HTTP / WebSocket SCADA
 */

export interface SubstationApi {
  id: string;
  code: string;
  name: string;
  description: string;
  voltage_primary: string;
  voltage_secondary: string;
  transformer_rating_kva: number;
  location_x: number;
  location_y: number;
  zone_name: string;
  is_active: boolean;
  breaker_state: boolean;
  is_simulated: boolean;
  meters_count?: number;
}

export interface RegisterMappingApi {
  id?: number;
  meter_id?: string;
  variable_name: string;
  register_address: number;
  register_count: number;
  function_code: number;
  data_type: string;
  scale_factor: number;
  unit: string;
  is_enabled: boolean;
}

export interface MeterApi {
  id: string;
  code: string;
  name: string;
  substation_id: string;
  counting_point_tag: string;
  manufacturer: string;
  model: string;
  ip_address: string;
  port: number;
  unit_id: number;
  protocol: string;
  acquisition_interval_sec: number;
  timeout_sec: number;
  retry_count: number;
  mode: 'SIMULATION' | 'REAL_OT';
  is_active: boolean;
  last_communication?: string;
  comm_status: 'ONLINE' | 'SIMULATED' | 'TIMEOUT' | 'ERROR' | 'OFFLINE';
  last_error_message?: string;
  registers: RegisterMappingApi[];
}

export interface TelemetryPointApi {
  timestamp: string;
  active_power_kw: number;
  reactive_power_kvar: number;
  apparent_power_kva: number;
  power_factor: number;
  voltage_v: number;
  current_a: number;
  thd_percent: number;
  active_energy_kwh: number;
  quality_status: string;
}

export interface IpeIndicatorApi {
  id: string;
  code: string;
  name: string;
  description?: string;
  formula_expression: string;
  source_variables: string;
  unit: string;
  energy_scope: string;
  aggregation_period: string;
  target_value?: number;
  current_value?: number;
  is_active: boolean;
  effective_date: string;
}

export interface EnergyBaselineApi {
  id: string;
  code: string;
  name: string;
  version: string;
  period_start: string;
  period_end: string;
  baseline_consumption_kwh: number;
  relevant_variables: string;
  calculation_method: string;
  formula_summary?: string;
  assumptions_doc?: string;
  is_active: boolean;
  created_at: string;
}

export interface BaselineComparisonApi {
  active_baseline_code: string;
  baseline_name: string;
  period_reference: string;
  baseline_consumption_kwh: number;
  actual_consumption_kwh: number;
  delta_kwh: number;
  delta_percent: number;
  savings_status: 'PERFORMANCE_OPTIMALE' | 'CONFORME_SER' | 'SURCONSOMMATION';
  avoided_co2_tons: number;
  estimated_savings_mad: number;
  timestamp: string;
}

export interface AlertIncidentApi {
  id: string;
  rule_id?: string;
  substation_id?: string;
  meter_id?: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  observed_value?: string;
  threshold_value?: string;
  status: 'NOUVELLE' | 'PRISE_EN_CHARGE' | 'CLOTUREE';
  acknowledged_by?: string;
  acknowledged_at?: string;
  closed_by?: string;
  closed_at?: string;
  comments: string;
}

export interface AlertRuleApi {
  id: string;
  code: string;
  name: string;
  substation_id?: string;
  meter_id?: string;
  rule_type: string;
  threshold_value: number;
  threshold_unit: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  is_enabled: boolean;
}

export interface ReportSummarySubstationApi {
  substation_id: string;
  code: string;
  name: string;
  voltage_primary: string;
  voltage_secondary: string;
  transformer_rating_kva: number;
  active_power_kw: number;
  reactive_power_kvar: number;
  apparent_power_kva: number;
  power_factor: number;
  voltage_v: number;
  current_a: number;
  thd_percent: number;
  daily_energy_kwh: number;
  co2_emissions_t: number;
  transformer_load_percent: number;
  breaker_state: boolean;
  status: string;
  last_reading_time: string;
  data_quality: string;
}

export interface ReportSummaryApi {
  report_generated_at: string;
  period: string;
  entity: string;
  market_ref: string;
  iso_standard: string;
  total_active_power_kw: number;
  total_energy_kwh: number;
  co2_emissions_tons: number;
  average_cos_phi: number;
  data_completeness_percent: number;
  substations: ReportSummarySubstationApi[];
}

export interface UserApi {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  role: 'ADMIN_TECH' | 'RESPONSABLE_ENERGIE' | 'EXPLOITANT' | 'AUDITEUR';
  is_active: boolean;
  created_at: string;
}

export interface AuditLogApi {
  id: number;
  timestamp: string;
  username: string;
  user_id?: string;
  action: string;
  entity: string;
  entity_id?: string;
  old_value?: string;
  new_value?: string;
  ip_address: string;
}

export interface ModbusTestResult {
  success: boolean;
  latency_ms: number;
  raw_registers: number[];
  decoded_value?: number;
  message: string;
  status: string;
}

// Token management
const TOKEN_KEY = 'marsa_sme_auth_token';
const USER_KEY = 'marsa_sme_auth_user';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredAuth = (token: string, user: UserApi) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): UserApi | null => {
  const u = localStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
};

// Generic Fetcher
const BASE_URL = '/api';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let detail = `Erreur HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      detail = parsed.detail || detail;
    } catch {
      detail = errorBody || detail;
    }
    throw new Error(detail);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: () => fetchApi<{ status: string; service: string; code: string; db: string }>('/health'),

  // Auth
  login: async (username: string, password: string): Promise<{ access_token: string; user: UserApi }> => {
    const data = await fetchApi<{ access_token: string; user: UserApi }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setStoredAuth(data.access_token, data.user);
    return data;
  },

  getMe: () => fetchApi<UserApi>('/auth/me'),

  // Substations (Module 01 & SCADA)
  getSubstations: () => fetchApi<SubstationApi[]>('/substations'),
  getSubstationSummary: (substationId: string) => fetchApi<any>(`/substations/${substationId}/summary`),
  updateSubstation: (substationId: string, data: Partial<SubstationApi>) =>
    fetchApi<SubstationApi>(`/substations/${substationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Meters & Modbus (Module 02)
  getMeters: () => fetchApi<MeterApi[]>('/meters'),
  createMeter: (meter: Partial<MeterApi>) =>
    fetchApi<MeterApi>('/meters', {
      method: 'POST',
      body: JSON.stringify(meter),
    }),
  updateMeter: (meterId: string, data: Partial<MeterApi>) =>
    fetchApi<MeterApi>(`/meters/${meterId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  testModbusComm: (params: {
    ip_address: string;
    port?: number;
    unit_id?: number;
    function_code?: number;
    register_address?: number;
    register_count?: number;
    timeout_sec?: number;
    simulate?: boolean;
  }) =>
    fetchApi<ModbusTestResult>('/meters/test-comm', {
      method: 'POST',
      body: JSON.stringify({
        port: 502,
        unit_id: 1,
        function_code: 3,
        register_address: 3000,
        register_count: 2,
        timeout_sec: 3.0,
        ...params,
      }),
    }),
  pollMeter: (meterId: string) => fetchApi<any>(`/meters/${meterId}/poll`, { method: 'POST' }),

  // Telemetry (Module 01)
  getTelemetryCurves: (substationId: string, variable: string = 'ACTIVE_POWER_KW', period: string = 'DAY') =>
    fetchApi<{
      substation_id: string;
      variable: string;
      period: string;
      points_count: number;
      series: TelemetryPointApi[];
    }>(`/telemetry/curves?substation_id=${substationId}&variable=${variable}&period=${period}`),
  getInterSubstationsComparison: () => fetchApi<any[]>('/telemetry/compare-substations'),

  // IPE & SER (Module 03)
  getIndicators: () => fetchApi<IpeIndicatorApi[]>('/ipe/indicators'),
  createIndicator: (ind: Partial<IpeIndicatorApi>) =>
    fetchApi<IpeIndicatorApi>('/ipe/indicators', {
      method: 'POST',
      body: JSON.stringify(ind),
    }),
  getBaselines: () => fetchApi<EnergyBaselineApi[]>('/ipe/baselines'),
  createBaseline: (ser: Partial<EnergyBaselineApi>) =>
    fetchApi<EnergyBaselineApi>('/ipe/baselines', {
      method: 'POST',
      body: JSON.stringify(ser),
    }),
  compareActiveBaseline: () => fetchApi<BaselineComparisonApi>('/ipe/baselines/compare'),

  // Alerts & Incidents (Module 04)
  getAlertIncidents: (status?: string, severity?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status_filter', status);
    if (severity) params.append('severity_filter', severity);
    return fetchApi<AlertIncidentApi[]>(`/alerts/incidents?${params.toString()}`);
  },
  getAlertRules: () => fetchApi<AlertRuleApi[]>('/alerts/rules'),
  createAlertRule: (rule: Partial<AlertRuleApi>) =>
    fetchApi<AlertRuleApi>('/alerts/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    }),
  getAlertStats: () => fetchApi<any>('/alerts/stats'),
  updateAlertStatus: (alertId: string, status: 'PRISE_EN_CHARGE' | 'CLOTUREE', comment?: string) =>
    fetchApi<AlertIncidentApi>(`/alerts/incidents/${alertId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comment }),
    }),

  // Reports & Analytics (Module 05)
  getReportSummary: () => fetchApi<ReportSummaryApi>('/reports/summary'),
  getDownloadUrlPdf: () => '/api/reports/export/pdf',
  getDownloadUrlExcel: () => '/api/reports/export/excel',
  getDownloadUrlCsv: () => '/api/reports/export/csv',

  // Administration & Audit (Module 06)
  getUsers: () => fetchApi<UserApi[]>('/admin/users'),
  createUser: (user: any) =>
    fetchApi<UserApi>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
  getAuditLogs: (limit: number = 100) => fetchApi<AuditLogApi[]>(`/admin/audit-logs?limit=${limit}`),
  resetDemoData: () => fetchApi<any>('/admin/system/reset-demo-data', { method: 'POST' }),
  getSystemConfig: () => fetchApi<any>('/admin/system/config'),
};
