import { API_URL, authHeaders, buildQuery, parseResponse } from './api.client';

export async function fetchTeachers(filters = {}) {
  const response = await fetch(`${API_URL}/api/teachers${buildQuery(filters)}`, { headers: authHeaders() });
  const data = await parseResponse(response);
  return data.teachers ?? [];
}

export async function createTeacher(payload) {
  const response = await fetch(`${API_URL}/api/teachers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateTeacher(id, payload) {
  const response = await fetch(`${API_URL}/api/teachers/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deactivateTeacher(id) {
  const response = await fetch(`${API_URL}/api/teachers/${id}/deactivate`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return parseResponse(response);
}
