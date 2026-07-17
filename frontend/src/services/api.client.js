const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const AUTH_TOKEN_KEY = 'authToken';

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function authHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Ocurrió un error en la solicitud.');
  }
  return data;
}

export { API_URL };
