import { useState, useEffect, useCallback } from 'react';
import {
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../../services/activities.service';
import { fetchGroups } from '../../services/groups.service';
import { getAuthUser } from '../../models/auth.model';
import { ApiError } from '../../services/api.client';

const EMPTY_FORM = {
  group_id: '',
  titulo: '',
  descripcion: '',
  tipo: 'tarea',
  fecha_entrega: '',
};

function validateActivityForm(form) {
  const errors = {};
  if (!form.group_id) errors.group_id = 'Selecciona un grupo.';
  if (!form.titulo?.trim()) errors.titulo = 'El título es obligatorio.';
  else if (form.titulo.trim().length < 3) errors.titulo = 'Mínimo 3 caracteres.';
  if (!form.tipo) errors.tipo = 'Selecciona el tipo.';
  if (!form.fecha_entrega) errors.fecha_entrega = 'La fecha de entrega es obligatoria.';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function useTeacherActivities() {
  const authUser = getAuthUser();
  const [groups, setGroups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filterGroupId, setFilterGroupId] = useState('');
  const [filterFecha, setFilterFecha] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };

  const loadData = useCallback(async () => {
    if (!authUser?.id) {
      setError('Sesión no válida. Vuelve a iniciar sesión.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const teacherGroups = await fetchGroups({ teacher_user_id: authUser.id });
      setGroups(teacherGroups);

      const filters = { teacher_user_id: authUser.id };
      if (filterGroupId) filters.group_id = filterGroupId;
      if (filterFecha) filters.fecha_entrega = filterFecha;

      setActivities(await fetchActivities(filters));
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar las actividades.');
    } finally {
      setLoading(false);
    }
  }, [authUser?.id, filterGroupId, filterFecha]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    clearFeedback();
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      group_id: filterGroupId || (groups[0] ? String(groups[0].id) : ''),
    });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (activity) => {
    clearFeedback();
    setEditing(activity);
    setForm({
      group_id: String(activity.group_id),
      titulo: activity.titulo,
      descripcion: activity.descripcion || '',
      tipo: activity.tipo,
      fecha_entrega: activity.fecha_entrega,
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

    const validation = validateActivityForm(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        group_id: Number(form.group_id),
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        tipo: form.tipo,
        fecha_entrega: form.fecha_entrega,
      };
      if (editing) {
        const result = await updateActivity(editing.id, payload);
        setSuccess(result.message || 'Actividad actualizada.');
      } else {
        const result = await createActivity(payload);
        setSuccess(result.message || 'Actividad creada.');
      }
      closeModal();
      await loadData();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
        setError(err.message);
      } else {
        setError(err?.message || 'No se pudo guardar la actividad.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (activity) => {
    if (!window.confirm(`¿Eliminar "${activity.titulo}"?`)) return;
    clearFeedback();
    try {
      const result = await deleteActivity(activity.id);
      setSuccess(result.message || 'Actividad eliminada.');
      await loadData();
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar la actividad.');
    }
  };

  return {
    groups,
    activities,
    filterGroupId,
    filterFecha,
    loading,
    saving,
    error,
    success,
    isModalOpen,
    editing,
    form,
    fieldErrors,
    handlers: {
      onRefresh: loadData,
      onFilterGroup: setFilterGroupId,
      onFilterFecha: setFilterFecha,
      onOpenCreate: openCreateModal,
      onOpenEdit: openEditModal,
      onCloseModal: closeModal,
      onFormChange: handleFormChange,
      onSubmit: handleSubmit,
      onDelete: handleDelete,
      onDismissFeedback: clearFeedback,
    },
  };
}
