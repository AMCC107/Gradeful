import { API_URL, buildQuery, parseResponse } from './api.client';

export async function fetchSubjects(filters = {}) {
  const response = await fetch(`${API_URL}/api/subjects${buildQuery(filters)}`);
  const data = await parseResponse(response);
  return data.subjects ?? [];
}

export async function createSubject(payload) {
  const response = await fetch(`${API_URL}/api/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateSubject(id, payload) {
  const response = await fetch(`${API_URL}/api/subjects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteSubject(id) {
  const response = await fetch(`${API_URL}/api/subjects/${id}`, {
    method: 'DELETE',
  });
  return parseResponse(response);
}
