import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deactivateStudent,
} from '../../services/students.service';
import { fetchUsers } from '../../services/users.service';
import { ApiError } from '../../services/api.client';

const ROLE_STUDENT = 3;
const EMPTY_FORM = { user_id: '', matricula: '' };
const EMPTY_FILTERS = { search: '', status: '' };
const SEARCH_DEBOUNCE_MS = 350;

function validateStudentForm(form) {
  const errors = {};
  if (!form.user_id) errors.user_id = 'Selecciona un usuario.';
  if (!form.matricula?.trim()) errors.matricula = 'La matrícula es obligatoria.';
  else if (form.matricula.trim().length < 3) {
    errors.matricula = 'La matrícula debe tener al menos 3 caracteres.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function useStudentManagement() {
  const [students, setStudents] = useState([]);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [filters.search]);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchStudents({
        search: debouncedSearch,
        status: filters.status,
      });
      setStudents(list);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los alumnos.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.status]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const loadEligibleUsers = async (currentUserId = null) => {
    const { users } = await fetchUsers({ role: ROLE_STUDENT, status: 'active' });
    const linkedIds = new Set(
      (await fetchStudents()).map((s) => s.user_id).filter((id) => id !== currentUserId)
    );
    setEligibleUsers(users.filter((u) => !linkedIds.has(u.id) || u.id === currentUserId));
  };

  const openCreateModal = async () => {
    clearFeedback();
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setIsModalOpen(true);
    try {
      await loadEligibleUsers();
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar usuarios elegibles.');
    }
  };

  const openEditModal = async (student) => {
    clearFeedback();
    setEditing(student);
    setForm({
      user_id: String(student.user_id),
      matricula: student.matricula,
    });
    setFieldErrors({});
    setIsModalOpen(true);
    try {
      await loadEligibleUsers(student.user_id);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar usuarios elegibles.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    clearFeedback();

    const validation = validateStudentForm(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        user_id: Number(form.user_id),
        matricula: form.matricula.trim(),
      };
      if (editing) {
        const result = await updateStudent(editing.id, payload);
        setSuccess(result.message || 'Alumno actualizado.');
      } else {
        const result = await createStudent(payload);
        setSuccess(result.message || 'Alumno creado.');
      }
      closeModal();
      await loadStudents();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
        setError(err.message);
      } else {
        setError(err?.message || 'No se pudo guardar el alumno.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (student) => {
    if (!student.is_active) return;
    if (!window.confirm(`¿Desactivar a "${student.nombre}"?`)) return;
    clearFeedback();
    try {
      const result = await deactivateStudent(student.id);
      setSuccess(result.message || 'Alumno desactivado.');
      await loadStudents();
    } catch (err) {
      setError(err?.message || 'No se pudo desactivar el alumno.');
    }
  };

  return {
    students,
    eligibleUsers,
    loading,
    saving,
    error,
    success,
    isModalOpen,
    editing,
    form,
    fieldErrors,
    filters,
    handlers: {
      onRefresh: loadStudents,
      onOpenCreate: openCreateModal,
      onOpenEdit: openEditModal,
      onCloseModal: closeModal,
      onFormChange: handleFormChange,
      onSubmit: handleSubmit,
      onDeactivate: handleDeactivate,
      onDismissFeedback: clearFeedback,
      onFilterChange: (field, value) => setFilters((prev) => ({ ...prev, [field]: value })),
      onClearFilters: () => {
        setFilters(EMPTY_FILTERS);
        setDebouncedSearch('');
      },
    },
  };
}
