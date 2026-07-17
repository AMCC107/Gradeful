import { API_URL, buildQuery, parseResponse } from './api.client';

export async function fetchTeachers(filters = {}) {
  const response = await fetch(`${API_URL}/api/teachers${buildQuery(filters)}`);
  const data = await parseResponse(response);
  return data.teachers ?? [];
}

export async function createTeacher(payload) {
  const response = await fetch(`${API_URL}/api/teachers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateTeacher(id, payload) {
  const response = await fetch(`${API_URL}/api/teachers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deactivateTeacher(id) {
  const response = await fetch(`${API_URL}/api/teachers/${id}/deactivate`, {
    method: 'PATCH',
  });
  return parseResponse(response);
}
