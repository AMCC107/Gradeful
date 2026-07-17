import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../../services/subjects.service';
import { ApiError } from '../../services/api.client';

const EMPTY_FORM = { nombre: '', descripcion: '' };
const SEARCH_DEBOUNCE_MS = 350;

function validateSubjectForm(form) {
  const errors = {};
  if (!form.nombre?.trim()) errors.nombre = 'El nombre es obligatorio.';
  else if (form.nombre.trim().length < 2) errors.nombre = 'Mínimo 2 caracteres.';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function useSubjectManagement() {
  const [subjects, setSubjects] = useState([]);
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

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSubjects(await fetchSubjects({ search: debouncedSearch }));
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar las materias.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const openCreateModal = () => {
    clearFeedback();
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (subject) => {
    clearFeedback();
    setEditing(subject);
    setForm({ nombre: subject.nombre, descripcion: subject.descripcion || '' });
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

    const validation = validateSubjectForm(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
      };
      if (editing) {
        const result = await updateSubject(editing.id, payload);
        setSuccess(result.message || 'Materia actualizada.');
      } else {
        const result = await createSubject(payload);
        setSuccess(result.message || 'Materia creada.');
      }
      closeModal();
      await loadSubjects();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
        setError(err.message);
      } else {
        setError(err?.message || 'No se pudo guardar la materia.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subject) => {
    if (!window.confirm(`¿Eliminar la materia "${subject.nombre}"?`)) return;
    clearFeedback();
    try {
      const result = await deleteSubject(subject.id);
      setSuccess(result.message || 'Materia eliminada.');
      await loadSubjects();
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar la materia.');
    }
  };

  return {
    subjects,
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
      onRefresh: loadSubjects,
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
