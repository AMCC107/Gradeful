import { API_URL, authHeaders, buildQuery, parseResponse } from './api.client';

export async function fetchGroupAttendance(groupId, filters = {}) {
  const response = await fetch(
    `${API_URL}/api/attendance${buildQuery({ group_id: groupId, ...filters })}`,
    { headers: authHeaders() },
  );
  return parseResponse(response);
}

export async function saveAttendance(groupId, fecha, records) {
  const response = await fetch(`${API_URL}/api/attendance/group/${groupId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ fecha, records }),
  });
  return parseResponse(response);
}

export async function fetchStudentAttendance(studentId, filters = {}) {
  const response = await fetch(
    `${API_URL}/api/attendance/student/${studentId}${buildQuery(filters)}`,
    { headers: authHeaders() },
  );
  return parseResponse(response);
}

export async function submitAttendanceJustification(attendanceId, motivo, document) {
  const formData = new FormData();
  formData.append('motivo', motivo);
  formData.append('document', document);
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/api/attendance/${attendanceId}/justification`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  return parseResponse(response);
}
