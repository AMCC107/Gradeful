import { API_URL, authHeaders, buildQuery, parseResponse } from './api.client';

export async function fetchStudents(filters = {}) {
  const response = await fetch(`${API_URL}/api/students${buildQuery(filters)}`, { headers: authHeaders() });
  const data = await parseResponse(response);
  return data.students ?? [];
}

export async function createStudent(payload) {
  const response = await fetch(`${API_URL}/api/students`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateStudent(id, payload) {
  const response = await fetch(`${API_URL}/api/students/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deactivateStudent(id) {
  const response = await fetch(`${API_URL}/api/students/${id}/deactivate`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function importStudents(file) {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/api/students/import`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  return parseResponse(response);
}

async function downloadFile(url, filename) {
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) return parseResponse(response);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export function exportStudentsExcel() {
  return downloadFile(`${API_URL}/api/students/export.xlsx`, 'alumnos.xlsx');
}

export function exportStudentsPdf() {
  return downloadFile(`${API_URL}/api/reports/students/export.pdf`, 'alumnos.pdf');
}
