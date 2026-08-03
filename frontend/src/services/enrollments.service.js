import { API_URL, authHeaders, buildQuery, parseResponse } from './api.client';

export async function fetchEnrollments(filters = {}) {
  const response = await fetch(`${API_URL}/api/enrollments${buildQuery(filters)}`, { headers: authHeaders() });
  const data = await parseResponse(response);
  return data.enrollments ?? [];
}

export async function createEnrollment(payload) {
  const response = await fetch(`${API_URL}/api/enrollments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteEnrollment(id) {
  const response = await fetch(`${API_URL}/api/enrollments/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return parseResponse(response);
}
