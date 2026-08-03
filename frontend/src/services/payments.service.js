import { API_URL, authHeaders, parseResponse } from './api.client';

export async function fetchPaymentConcepts() {
  const response = await fetch(`${API_URL}/api/payments/concepts`, { headers: authHeaders() });
  const data = await parseResponse(response);
  return data.concepts ?? [];
}

export async function createPaymentConcept(payload) {
  const response = await fetch(`${API_URL}/api/payments/concepts`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updatePaymentConcept(id, payload) {
  const response = await fetch(`${API_URL}/api/payments/concepts/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function fetchStudentAccount(studentId) {
  const response = await fetch(`${API_URL}/api/payments/accounts/${studentId}`, { headers: authHeaders() });
  return parseResponse(response);
}

export async function createCharge(payload) {
  const response = await fetch(`${API_URL}/api/payments/charges`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function registerPayment(payload) {
  const response = await fetch(`${API_URL}/api/payments`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function submitPaymentProof(studentId, chargeId, document) {
  const formData = new FormData();
  formData.append('student_id', studentId);
  if (chargeId) formData.append('charge_id', chargeId);
  formData.append('document', document);
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/api/payments/proofs`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  return parseResponse(response);
}
