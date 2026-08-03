import { API_URL, authHeaders, parseResponse } from './api.client';

export async function fetchDashboardSummary() {
  const response = await fetch(`${API_URL}/api/reports/dashboard/summary`, { headers: authHeaders() });
  return parseResponse(response);
}
