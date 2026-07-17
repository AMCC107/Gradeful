import { API_URL, buildQuery, parseResponse } from './api.client';

export async function fetchActivities(filters = {}) {
  const response = await fetch(`${API_URL}/api/activities${buildQuery(filters)}`);
  const data = await parseResponse(response);
  return data.activities ?? [];
}

export async function fetchPendingActivities(userId) {
  const response = await fetch(
    `${API_URL}/api/activities/pending${buildQuery({ user_id: userId })}`
  );
  const data = await parseResponse(response);
  return data.activities ?? [];
}

export async function createActivity(payload) {
  const response = await fetch(`${API_URL}/api/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateActivity(id, payload) {
  const response = await fetch(`${API_URL}/api/activities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteActivity(id) {
  const response = await fetch(`${API_URL}/api/activities/${id}`, {
    method: 'DELETE',
  });
  return parseResponse(response);
}
