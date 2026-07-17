import { useState, useEffect, useCallback } from 'react';
import { fetchRoles, createRole, updateRole } from '../../services/roles.service';

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  permissionIds: [],
};

export function useRoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchRoles();
      setRoles(data.roles ?? []);
      setPermissions(data.permissions ?? []);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const openCreateModal = () => {
    clearFeedback();
    setEditingRole(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    clearFeedback();
    setEditingRole(role);
    setForm({
      nombre: role.nombre,
      descripcion: role.descripcion || '',
      permissionIds: (role.permissions || []).map((p) => p.id),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const togglePermission = (permissionId) => {
    setForm((prev) => {
      const exists = prev.permissionIds.includes(permissionId);
      return {
        ...prev,
        permissionIds: exists
          ? prev.permissionIds.filter((id) => id !== permissionId)
          : [...prev.permissionIds, permissionId],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    clearFeedback();
    setSaving(true);

    try {
      if (!form.nombre.trim()) {
        throw new Error('El nombre del rol es obligatorio.');
      }

      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        permissionIds: form.permissionIds,
      };

      if (editingRole) {
        const result = await updateRole(editingRole.id, payload);
        setSuccess(result.message || 'Rol actualizado.');
      } else {
        const result = await createRole(payload);
        setSuccess(result.message || 'Rol creado.');
      }

      closeModal();
      await loadRoles();
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el rol.');
    } finally {
      setSaving(false);
    }
  };

  return {
    roles,
    permissions,
    loading,
    saving,
    error,
    success,
    isModalOpen,
    editingRole,
    form,
    handlers: {
      onRefresh: loadRoles,
      onOpenCreate: openCreateModal,
      onOpenEdit: openEditModal,
      onCloseModal: closeModal,
      onFormChange: handleFormChange,
      onTogglePermission: togglePermission,
      onSubmit: handleSubmit,
      onDismissFeedback: clearFeedback,
    },
  };
}
