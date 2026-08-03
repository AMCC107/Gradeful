import { API_URL, authHeaders, parseResponse } from './api.client';

export async function fetchParentStudents() {
  const response = await fetch(`${API_URL}/api/parents/students`, { headers: authHeaders() });
  const data = await parseResponse(response);
  return data.students ?? [];
}
