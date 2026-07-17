import { API_URL, authHeaders, parseResponse } from './api.client';

export async function fetchRoles() {
  const response = await fetch(`${API_URL}/api/roles`, {
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function createRole(payload) {
  const response = await fetch(`${API_URL}/api/roles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateRole(id, payload) {
  const response = await fetch(`${API_URL}/api/roles/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}
