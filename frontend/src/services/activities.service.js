import { API_URL, authHeaders, buildQuery, parseResponse } from './api.client';

export async function fetchActivities(filters = {}) {
  const response = await fetch(`${API_URL}/api/activities${buildQuery(filters)}`, { headers: authHeaders() });
  const data = await parseResponse(response);
  return data.activities ?? [];
}

export async function fetchPendingActivities(userId) {
  const response = await fetch(
    `${API_URL}/api/activities/pending${buildQuery({ user_id: userId })}`,
    { headers: authHeaders() },
  );
  const data = await parseResponse(response);
  return data.activities ?? [];
}

export async function createActivity(payload) {
  const response = await fetch(`${API_URL}/api/activities`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateActivity(id, payload) {
  const response = await fetch(`${API_URL}/api/activities/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteActivity(id) {
  const response = await fetch(`${API_URL}/api/activities/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return parseResponse(response);
}
