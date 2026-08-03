import { API_URL, authHeaders, buildQuery, parseResponse } from './api.client';

export async function fetchSubjects(filters = {}) {
  const response = await fetch(`${API_URL}/api/subjects${buildQuery(filters)}`, { headers: authHeaders() });
  const data = await parseResponse(response);
  return data.subjects ?? [];
}

export async function createSubject(payload) {
  const response = await fetch(`${API_URL}/api/subjects`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateSubject(id, payload) {
  const response = await fetch(`${API_URL}/api/subjects/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteSubject(id) {
  const response = await fetch(`${API_URL}/api/subjects/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return parseResponse(response);
}
