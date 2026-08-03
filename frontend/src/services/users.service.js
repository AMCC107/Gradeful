import { API_URL, authHeaders } from './api.client';

export class ApiError extends Error {
  constructor(message, { status = 500, errors = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data?.message || 'Ocurrió un error en la solicitud.', {
      status: response.status,
      errors: data?.errors ?? null,
    });
  }
  return data;
}

function buildUsersQuery(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.role !== undefined && filters.role !== null && filters.role !== '') {
    params.set('role', String(filters.role));
  }
  if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
    params.set('status', String(filters.status));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function fetchUsers(filters = {}) {
  const response = await fetch(`${API_URL}/api/users${buildUsersQuery(filters)}`, { headers: authHeaders() });
  const data = await parseResponse(response);
  return {
    users: data.users ?? [],
    roles: data.roles ?? [],
  };
}

export async function createUser(payload) {
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateUser(id, payload) {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deactivateUser(id) {
  const response = await fetch(`${API_URL}/api/users/${id}/deactivate`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return parseResponse(response);
}
