import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchUsers,
  createUser,
  updateUser,
  deactivateUser,
  ApiError,
} from '../../services/users.service';
import { validateUserForm } from '../../utils/userFormValidation';

const EMPTY_FORM = {
  nombre: '',
  correo: '',
  contraseña: '',
  role_id: '',
};

const EMPTY_FILTERS = {
  search: '',
  role: '',
  status: '',
};

const SEARCH_DEBOUNCE_MS = 350;

export function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };

  // Debounce solo sobre el texto de búsqueda
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters.search]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers({
        search: debouncedSearch,
        role: filters.role,
        status: filters.status,
      });
      setUsers(data.users);
      setRoles(data.roles);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.role, filters.status]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setDebouncedSearch('');
  };

  const openCreateModal = () => {
    clearFeedback();
    setEditingUser(null);
    setForm({
      ...EMPTY_FORM,
      role_id: roles[0]?.id ? String(roles[0].id) : '',
    });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    clearFeedback();
    setEditingUser(user);
    setForm({
      nombre: user.nombre,
      correo: user.correo,
      contraseña: '',
      role_id: user.role_id != null ? String(user.role_id) : '',
    });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
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

    const isEdit = Boolean(editingUser);
    const clientValidation = validateUserForm(form, { isEdit });
    if (!clientValidation.isValid) {
      setFieldErrors(clientValidation.errors);
      return;
    }

    setFieldErrors({});
    setSaving(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        role_id: Number(form.role_id),
      };

      if (form.contraseña) {
        payload.contraseña = form.contraseña;
      }

      if (isEdit) {
        const result = await updateUser(editingUser.id, payload);
        setSuccess(result.message || 'Usuario actualizado.');
      } else {
        payload.contraseña = form.contraseña;
        const result = await createUser(payload);
        setSuccess(result.message || 'Usuario creado.');
      }

      closeModal();
      await loadUsers();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
        setError(err.message || 'Corrige los errores del formulario.');
      } else {
        setError(err?.message || 'No se pudo guardar el usuario.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (user) => {
    if (!user.is_active) return;

    const confirmed = window.confirm(
      `¿Desactivar a "${user.nombre}"? El registro no se eliminará.`
    );
    if (!confirmed) return;

    clearFeedback();
    try {
      const result = await deactivateUser(user.id);
      setSuccess(result.message || 'Usuario desactivado.');
      await loadUsers();
    } catch (err) {
      setError(err?.message || 'No se pudo desactivar el usuario.');
    }
  };

  return {
    users,
    roles,
    loading,
    saving,
    error,
    success,
    isModalOpen,
    editingUser,
    form,
    fieldErrors,
    filters,
    handlers: {
      onRefresh: loadUsers,
      onOpenCreate: openCreateModal,
      onOpenEdit: openEditModal,
      onCloseModal: closeModal,
      onFormChange: handleFormChange,
      onSubmit: handleSubmit,
      onDeactivate: handleDeactivate,
      onDismissFeedback: clearFeedback,
      onFilterChange: handleFilterChange,
      onClearFilters: clearFilters,
    },
  };
}
