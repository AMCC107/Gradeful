import { API_URL, buildQuery, parseResponse } from './api.client';

export async function fetchCourses(filters = {}) {
  const response = await fetch(`${API_URL}/api/courses${buildQuery(filters)}`);
  const data = await parseResponse(response);
  return data.courses ?? [];
}

export async function createCourse(payload) {
  const response = await fetch(`${API_URL}/api/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateCourse(id, payload) {
  const response = await fetch(`${API_URL}/api/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteCourse(id) {
  const response = await fetch(`${API_URL}/api/courses/${id}`, {
    method: 'DELETE',
  });
  return parseResponse(response);
}
