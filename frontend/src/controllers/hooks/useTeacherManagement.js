import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchTeachers,
  createTeacher,
  updateTeacher,
  deactivateTeacher,
} from '../../services/teachers.service';
import { fetchUsers } from '../../services/users.service';
import { ApiError } from '../../services/api.client';

const ROLE_TEACHER = 4;
const EMPTY_FORM = { user_id: '', numero_empleado: '', especialidad: '' };
const EMPTY_FILTERS = { search: '', status: '' };
const SEARCH_DEBOUNCE_MS = 350;

function validateTeacherForm(form) {
  const errors = {};
  if (!form.user_id) errors.user_id = 'Selecciona un usuario.';
  if (!form.numero_empleado?.trim()) {
    errors.numero_empleado = 'El número de empleado es obligatorio.';
  } else if (form.numero_empleado.trim().length < 3) {
    errors.numero_empleado = 'Mínimo 3 caracteres.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function useTeacherManagement() {
  const [teachers, setTeachers] = useState([]);
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

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTeachers(
        await fetchTeachers({ search: debouncedSearch, status: filters.status })
      );
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los profesores.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.status]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const loadEligibleUsers = async (currentUserId = null) => {
    const { users } = await fetchUsers({ role: ROLE_TEACHER, status: 'active' });
    const linkedIds = new Set(
      (await fetchTeachers()).map((t) => t.user_id).filter((id) => id !== currentUserId)
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

  const openEditModal = async (teacher) => {
    clearFeedback();
    setEditing(teacher);
    setForm({
      user_id: String(teacher.user_id),
      numero_empleado: teacher.numero_empleado,
      especialidad: teacher.especialidad || '',
    });
    setFieldErrors({});
    setIsModalOpen(true);
    try {
      await loadEligibleUsers(teacher.user_id);
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

    const validation = validateTeacherForm(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        user_id: Number(form.user_id),
        numero_empleado: form.numero_empleado.trim(),
        especialidad: form.especialidad.trim(),
      };
      if (editing) {
        const result = await updateTeacher(editing.id, payload);
        setSuccess(result.message || 'Profesor actualizado.');
      } else {
        const result = await createTeacher(payload);
        setSuccess(result.message || 'Profesor creado.');
      }
      closeModal();
      await loadTeachers();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
        setError(err.message);
      } else {
        setError(err?.message || 'No se pudo guardar el profesor.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (teacher) => {
    if (!teacher.is_active) return;
    if (!window.confirm(`¿Desactivar a "${teacher.nombre}"?`)) return;
    clearFeedback();
    try {
      const result = await deactivateTeacher(teacher.id);
      setSuccess(result.message || 'Profesor desactivado.');
      await loadTeachers();
    } catch (err) {
      setError(err?.message || 'No se pudo desactivar el profesor.');
    }
  };

  return {
    teachers,
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
      onRefresh: loadTeachers,
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
