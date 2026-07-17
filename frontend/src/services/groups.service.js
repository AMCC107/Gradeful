import { API_URL, buildQuery, parseResponse } from './api.client';

export async function fetchGroups(filters = {}) {
  const response = await fetch(`${API_URL}/api/groups${buildQuery(filters)}`);
  const data = await parseResponse(response);
  return data.groups ?? [];
}

export async function fetchGroup(id) {
  const response = await fetch(`${API_URL}/api/groups/${id}`);
  const data = await parseResponse(response);
  return data.group;
}

export async function createGroup(payload) {
  const response = await fetch(`${API_URL}/api/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateGroup(id, payload) {
  const response = await fetch(`${API_URL}/api/groups/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteGroup(id) {
  const response = await fetch(`${API_URL}/api/groups/${id}`, {
    method: 'DELETE',
  });
  return parseResponse(response);
}

export async function fetchGroupStudents(id) {
  const response = await fetch(`${API_URL}/api/groups/${id}/students`);
  return parseResponse(response);
}
