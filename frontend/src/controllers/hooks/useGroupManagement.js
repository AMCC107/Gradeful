import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../../services/groups.service';
import { fetchCourses } from '../../services/courses.service';
import { fetchSubjects } from '../../services/subjects.service';
import { fetchTeachers } from '../../services/teachers.service';
import { ApiError } from '../../services/api.client';

const EMPTY_FORM = {
  course_id: '',
  subject_id: '',
  teacher_id: '',
  capacidad_maxima: '30',
};
const SEARCH_DEBOUNCE_MS = 350;

function validateGroupForm(form) {
  const errors = {};
  if (!form.course_id) errors.course_id = 'Selecciona un curso.';
  if (!form.subject_id) errors.subject_id = 'Selecciona una materia.';
  if (!form.teacher_id) errors.teacher_id = 'Selecciona un profesor.';
  const cap = Number(form.capacidad_maxima);
  if (!form.capacidad_maxima || Number.isNaN(cap) || !Number.isInteger(cap) || cap < 1) {
    errors.capacidad_maxima = 'Capacidad mínima: 1.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function useGroupManagement() {
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setGroups(await fetchGroups({ search: debouncedSearch }));
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los grupos.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  const loadCatalogs = useCallback(async () => {
    const [coursesData, subjectsData, teachersData] = await Promise.all([
      fetchCourses(),
      fetchSubjects(),
      fetchTeachers({ status: 'active' }),
    ]);
    setCourses(coursesData);
    setSubjects(subjectsData);
    setTeachers(teachersData);
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    loadCatalogs().catch((err) => {
      setError(err?.message || 'No se pudieron cargar catálogos.');
    });
  }, [loadCatalogs]);

  const openCreateModal = () => {
    clearFeedback();
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (group) => {
    clearFeedback();
    setEditing(group);
    setForm({
      course_id: String(group.course_id),
      subject_id: String(group.subject_id),
      teacher_id: String(group.teacher_id),
      capacidad_maxima: String(group.capacidad_maxima),
    });
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

    const validation = validateGroupForm(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        course_id: Number(form.course_id),
        subject_id: Number(form.subject_id),
        teacher_id: Number(form.teacher_id),
        capacidad_maxima: Number(form.capacidad_maxima),
      };
      if (editing) {
        const result = await updateGroup(editing.id, payload);
        setSuccess(result.message || 'Grupo actualizado.');
      } else {
        const result = await createGroup(payload);
        setSuccess(result.message || 'Grupo creado.');
      }
      closeModal();
      await loadGroups();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
        setError(err.message);
      } else {
        setError(err?.message || 'No se pudo guardar el grupo.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group) => {
    if (!window.confirm(`¿Eliminar el grupo #${group.id}? Se borrarán sus inscripciones.`)) {
      return;
    }
    clearFeedback();
    try {
      const result = await deleteGroup(group.id);
      setSuccess(result.message || 'Grupo eliminado.');
      await loadGroups();
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar el grupo.');
    }
  };

  return {
    groups,
    courses,
    subjects,
    teachers,
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
      onRefresh: loadGroups,
      onOpenCreate: openCreateModal,
      onOpenEdit: openEditModal,
      onCloseModal: closeModal,
      onFormChange: handleFormChange,
      onSubmit: handleSubmit,
      onDelete: handleDelete,
      onDismissFeedback: clearFeedback,
      onSearchChange: setSearch,
    },
  };
}
