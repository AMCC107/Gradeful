import { API_URL, authHeaders, buildQuery, parseResponse } from './api.client';

export async function fetchGroupGrades(groupId, filters = {}) {
  const response = await fetch(
    `${API_URL}/api/grades${buildQuery({ group_id: groupId, ...filters })}`,
    { headers: authHeaders() },
  );
  return parseResponse(response);
}

export async function saveGroupGrades(groupId, payload) {
  const response = await fetch(`${API_URL}/api/grades/group/${groupId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function fetchStudentGrades(studentId, filters = {}) {
  const response = await fetch(
    `${API_URL}/api/grades/student/${studentId}${buildQuery(filters)}`,
    { headers: authHeaders() },
  );
  return parseResponse(response);
}

export async function downloadReportCard(studentId) {
  const response = await fetch(`${API_URL}/api/reports/report-card/${studentId}.pdf`, {
    headers: authHeaders(),
  });
  if (!response.ok) return parseResponse(response);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `boleta-${studentId}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
