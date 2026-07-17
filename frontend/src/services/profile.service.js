import { API_URL, authHeaders, parseResponse } from './api.client';

export async function fetchProfile() {
  const response = await fetch(`${API_URL}/api/profile`, {
    headers: authHeaders(),
  });
  const data = await parseResponse(response);
  return data.profile;
}

export async function updateProfile(payload) {
  const response = await fetch(`${API_URL}/api/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}
