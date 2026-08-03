import { API_URL, authHeaders, buildQuery, parseResponse } from './api.client';

export async function fetchCourses(filters = {}) {
  const response = await fetch(`${API_URL}/api/courses${buildQuery(filters)}`, { headers: authHeaders() });
  const data = await parseResponse(response);
  return data.courses ?? [];
}

export async function createCourse(payload) {
  const response = await fetch(`${API_URL}/api/courses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateCourse(id, payload) {
  const response = await fetch(`${API_URL}/api/courses/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteCourse(id) {
  const response = await fetch(`${API_URL}/api/courses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return parseResponse(response);
}
