import { API_URL, authHeaders, buildQuery, parseResponse } from './api.client';

export async function fetchGroups(filters = {}) {
  const response = await fetch(`${API_URL}/api/groups${buildQuery(filters)}`, { headers: authHeaders() });
  const data = await parseResponse(response);
  return data.groups ?? [];
}

export async function fetchGroup(id) {
  const response = await fetch(`${API_URL}/api/groups/${id}`, { headers: authHeaders() });
  const data = await parseResponse(response);
  return data.group;
}

export async function createGroup(payload) {
  const response = await fetch(`${API_URL}/api/groups`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateGroup(id, payload) {
  const response = await fetch(`${API_URL}/api/groups/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteGroup(id) {
  const response = await fetch(`${API_URL}/api/groups/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function fetchGroupStudents(id) {
  const response = await fetch(`${API_URL}/api/groups/${id}/students`, { headers: authHeaders() });
  return parseResponse(response);
}
