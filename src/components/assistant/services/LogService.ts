export interface LogData {
  _id: string;
  "Time (sec)": number;
  " Vehicle speed (MPH)": number;
  " Engine RPM (RPM)": number;
  " Engine coolant temperature (°F)": number;
  " Calculated load value (%)": number;
  " Fuel rate (gal/hr)": number;
  " Throttle position (%)": number;
  " Intake manifold pressure (psi)": number;
  " Air intake temperature (°F)": number;
  " MAF air flow rate (lb/min)": number;
  " O2 Voltage Bank 1 sensor 1 (V)": number;
  " O2 Voltage Bank 1 sensor 2 (V)": number;
  " Short term fuel trim Bank 1 (%)": number;
  " Long term fuel trim Bank 1 (%)": number;
  " Short term fuel trim Bank 2 (%)": number;
  " Long term fuel trim Bank 2 (%)": number;
  " Absolute throttle position (%)": number;
  " Relative throttle position (%)": number;
  " Timing advance (°)": number;
  " Catalyst temperature Bank 1 Sensor 1 (°F)": number;
  " Catalyst temperature Bank 1 Sensor 2 (°F)": number;
  " Catalyst temperature Bank 2 Sensor 1 (°F)": number;
  " Catalyst temperature Bank 2 Sensor 2 (°F)": number;
  " Control module voltage (V)": number;
  " Absolute load value (%)": number;
  " Commanded equivalence ratio": number;
  " Relative accelerator pedal position (%)": number;
  " Hybrid battery pack remaining life (%)": number;
  " Engine oil temperature (°F)": number;
  " Fuel injection timing (°)": number;
  " Engine fuel rate (gal/hr)": number;
}

export interface LogResponse {
  logs: LogData[];
  totalPages: number;
  currentPage: number;
  totalLogs: number;
}

export interface LogQueryParams {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  logId?: string;
}

export class LogService {
  private baseUrl = 'http://localhost:3005/api/logs';

  async getLogs(params?: LogQueryParams): Promise<LogResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.startDate) queryParams.set('startDate', params.startDate.toISOString());
      if (params?.endDate) queryParams.set('endDate', params.endDate.toISOString());
      if (params?.logId) queryParams.set('logId', params.logId);

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      
      if (!response.ok) throw new Error(`Failed to fetch logs: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }
}

export default LogService;

