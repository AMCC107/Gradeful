import { API_URL, buildQuery, parseResponse } from './api.client';

export async function fetchStudents(filters = {}) {
  const response = await fetch(`${API_URL}/api/students${buildQuery(filters)}`);
  const data = await parseResponse(response);
  return data.students ?? [];
}

export async function createStudent(payload) {
  const response = await fetch(`${API_URL}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateStudent(id, payload) {
  const response = await fetch(`${API_URL}/api/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deactivateStudent(id) {
  const response = await fetch(`${API_URL}/api/students/${id}/deactivate`, {
    method: 'PATCH',
  });
  return parseResponse(response);
}
