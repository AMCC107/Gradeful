import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../../services/courses.service';
import { ApiError } from '../../services/api.client';

const EMPTY_FORM = { nombre: '', nivel: '' };
const SEARCH_DEBOUNCE_MS = 350;

function validateCourseForm(form) {
  const errors = {};
  if (!form.nombre?.trim()) errors.nombre = 'El nombre es obligatorio.';
  else if (form.nombre.trim().length < 2) errors.nombre = 'Mínimo 2 caracteres.';
  if (!form.nivel?.trim()) errors.nivel = 'El nivel es obligatorio.';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function useCourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCourses(await fetchCourses({ search: debouncedSearch }));
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los cursos.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const openCreateModal = () => {
    clearFeedback();
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    clearFeedback();
    setEditing(course);
    setForm({ nombre: course.nombre, nivel: course.nivel });
    setFieldErrors({});
    setIsModalOpen(true);
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

    const validation = validateCourseForm(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        nivel: form.nivel.trim(),
      };
      if (editing) {
        const result = await updateCourse(editing.id, payload);
        setSuccess(result.message || 'Curso actualizado.');
      } else {
        const result = await createCourse(payload);
        setSuccess(result.message || 'Curso creado.');
      }
      closeModal();
      await loadCourses();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
        setError(err.message);
      } else {
        setError(err?.message || 'No se pudo guardar el curso.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`¿Eliminar el curso "${course.nombre}" (${course.nivel})?`)) return;
    clearFeedback();
    try {
      const result = await deleteCourse(course.id);
      setSuccess(result.message || 'Curso eliminado.');
      await loadCourses();
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar el curso.');
    }
  };

  return {
    courses,
    loading,
    saving,
    error,
    success,
    isModalOpen,
    editing,
    form,
    fieldErrors,
    search,
    handlers: {
      onRefresh: loadCourses,
      onOpenCreate: openCreateModal,
      onOpenEdit: openEditModal,
      onCloseModal: closeModal,
      onFormChange: handleFormChange,
      onSubmit: handleSubmit,
      onDelete: handleDelete,
      onDismissFeedback: clearFeedback,
      onSearchChange: setSearch,
      onClearSearch: () => {
        setSearch('');
        setDebouncedSearch('');
      },
    },
  };
}
