import { useState, useEffect, useCallback } from 'react';
import { fetchProfile, updateProfile } from '../../services/profile.service';
import { getAuthUser, saveSession } from '../../models/auth.model';

export function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProfile();
      setProfile(data);
      setForm({
        nombre: data.nombre || '',
        correo: data.correo || '',
        contraseña: '',
      });
    } catch (err) {
      setError(err?.message || 'No se pudo cargar el perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    clearFeedback();
    setSaving(true);

    try {
      if (!form.nombre.trim() || !form.correo.trim()) {
        throw new Error('Nombre y correo son obligatorios.');
      }

      const payload = {
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
      };

      if (form.contraseña) {
        payload.contraseña = form.contraseña;
      }

      const result = await updateProfile(payload);
      setSuccess(result.message || 'Perfil actualizado.');
      setProfile(result.profile);
      setForm((prev) => ({ ...prev, contraseña: '' }));

      const current = getAuthUser();
      if (current && result.profile) {
        saveSession({
          user: {
            ...current,
            id: result.profile.id,
            name: result.profile.nombre,
            email: result.profile.correo,
            role: result.profile.role_id,
            roleName: result.profile.role_nombre,
          },
        });
      }
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    form,
    loading,
    saving,
    error,
    success,
    handlers: {
      onRefresh: loadProfile,
      onFormChange: handleFormChange,
      onSubmit: handleSubmit,
      onDismissFeedback: clearFeedback,
    },
  };
}
