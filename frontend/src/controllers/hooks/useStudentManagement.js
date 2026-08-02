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
const PROFILES_STORAGE_KEY = 'gradeful.studentProfiles';

const EMPTY_FORM = {
  user_id: '',
  matricula: '',
  nombre: '',
  apellidos: '',
  curp: '',
  fechaNacimiento: '',
  direccion: '',
  tipoSangre: '',
  alergias: '',
  tutorNombre: '',
  telefonoEmergencia: '',
  actaNacimiento: null,
  fotoPerfil: null,
  comprobanteDomicilio: null,
};

const EMPTY_FILTERS = { search: '', status: '' };
const SEARCH_DEBOUNCE_MS = 350;

function fileToMeta(file) {
  if (!file) return null;
  return { name: file.name, size: file.size, type: file.type };
}

function loadStoredProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) ?? {};
  } catch {
    return {};
  }
}

function persistProfiles(profiles) {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    /* ignore quota / private mode */
  }
}

function validateStep(step, form) {
  const errors = {};

  if (step === 1) {
    if (!form.nombre?.trim()) errors.nombre = 'El nombre es obligatorio.';
    if (!form.apellidos?.trim()) errors.apellidos = 'Los apellidos son obligatorios.';
    if (!form.curp?.trim()) errors.curp = 'La CURP es obligatoria.';
    else if (form.curp.trim().length !== 18) errors.curp = 'La CURP debe tener 18 caracteres.';
    if (!form.fechaNacimiento) errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
    if (!form.direccion?.trim()) errors.direccion = 'La dirección es obligatoria.';
    if (!form.user_id) errors.user_id = 'Selecciona un usuario.';
    if (!form.matricula?.trim()) errors.matricula = 'La matrícula es obligatoria.';
    else if (form.matricula.trim().length < 3) {
      errors.matricula = 'La matrícula debe tener al menos 3 caracteres.';
    }
  }

  if (step === 2) {
    if (!form.tipoSangre) errors.tipoSangre = 'Selecciona el tipo de sangre.';
    if (!form.tutorNombre?.trim()) errors.tutorNombre = 'El nombre del tutor es obligatorio.';
    if (!form.telefonoEmergencia?.trim()) {
      errors.telefonoEmergencia = 'El teléfono de emergencia es obligatorio.';
    }
  }

  if (step === 3) {
    if (!form.actaNacimiento || !form.fotoPerfil || !form.comprobanteDomicilio) {
      errors.documentos = 'Adjunta los tres documentos solicitados para finalizar.';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

function buildProfilePayload(form) {
  return {
    nombre: form.nombre.trim(),
    apellidos: form.apellidos.trim(),
    curp: form.curp.trim().toUpperCase(),
    fechaNacimiento: form.fechaNacimiento,
    direccion: form.direccion.trim(),
    tipoSangre: form.tipoSangre,
    alergias: form.alergias.trim() || 'Ninguna',
    tutorNombre: form.tutorNombre.trim(),
    telefonoEmergencia: form.telefonoEmergencia.trim(),
    documentos: {
      actaNacimiento: fileToMeta(form.actaNacimiento),
      fotoPerfil: fileToMeta(form.fotoPerfil),
      comprobanteDomicilio: fileToMeta(form.comprobanteDomicilio),
    },
  };
}

export function useStudentManagement() {
  const [students, setStudents] = useState([]);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [editing, setEditing] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState({ user_id: '', matricula: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [profiles, setProfiles] = useState(() => loadStoredProfiles());
  const [viewingStudent, setViewingStudent] = useState(null);
  const [profileTab, setProfileTab] = useState('info');
  const debounceRef = useRef(null);

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };

  const saveProfile = useCallback((key, profile) => {
    setProfiles((prev) => {
      const next = { ...prev, [String(key)]: profile };
      persistProfiles(next);
      return next;
    });
  }, []);

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
      (await fetchStudents()).map((s) => s.user_id).filter((id) => id !== currentUserId),
    );
    setEligibleUsers(users.filter((u) => !linkedIds.has(u.id) || u.id === currentUserId));
  };

  const openCreateWizard = async () => {
    clearFeedback();
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setWizardStep(1);
    setIsWizardOpen(true);
    try {
      await loadEligibleUsers();
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar usuarios elegibles.');
    }
  };

  const openEditModal = async (student) => {
    clearFeedback();
    setEditing(student);
    setEditForm({
      user_id: String(student.user_id),
      matricula: student.matricula,
    });
    setFieldErrors({});
    setIsEditModalOpen(true);
    try {
      await loadEligibleUsers(student.user_id);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar usuarios elegibles.');
    }
  };

  const closeWizard = () => {
    setIsWizardOpen(false);
    setWizardStep(1);
    setForm(EMPTY_FORM);
    setFieldErrors({});
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditing(null);
    setEditForm({ user_id: '', matricula: '' });
    setFieldErrors({});
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      if (
        field === 'actaNacimiento' ||
        field === 'fotoPerfil' ||
        field === 'comprobanteDomicilio'
      ) {
        delete next.documentos;
      }
      return next;
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const goNextStep = () => {
    const validation = validateStep(wizardStep, form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }
    setFieldErrors({});
    setWizardStep((prev) => Math.min(prev + 1, 3));
  };

  const goBackStep = () => {
    setFieldErrors({});
    setWizardStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinishWizard = async () => {
    if (saving) return;
    clearFeedback();

    const validation = validateStep(3, form);
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
      const result = await createStudent(payload);
      const created = result.student;
      const profile = buildProfilePayload(form);
      const profileKey = created?.id ?? form.matricula.trim();
      saveProfile(profileKey, profile);
      if (created?.matricula && created.matricula !== String(profileKey)) {
        saveProfile(created.matricula, profile);
      }

      setSuccess(result.message || 'Alumno inscrito correctamente.');
      closeWizard();
      await loadStudents();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
        setError(err.message);
        setWizardStep(1);
      } else {
        setError(err?.message || 'No se pudo guardar el alumno.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (saving || !editing) return;
    clearFeedback();

    const errors = {};
    if (!editForm.user_id) errors.user_id = 'Selecciona un usuario.';
    if (!editForm.matricula?.trim()) errors.matricula = 'La matrícula es obligatoria.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const result = await updateStudent(editing.id, {
        user_id: Number(editForm.user_id),
        matricula: editForm.matricula.trim(),
      });
      setSuccess(result.message || 'Alumno actualizado.');
      closeEditModal();
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

  const openProfile = (student) => {
    setViewingStudent(student);
    setProfileTab('info');
  };

  const closeProfile = () => {
    setViewingStudent(null);
    setProfileTab('info');
  };

  const getProfileForStudent = (student) => {
    if (!student) return null;
    return profiles[String(student.id)] || profiles[student.matricula] || null;
  };

  return {
    students,
    eligibleUsers,
    loading,
    saving,
    error,
    success,
    isWizardOpen,
    wizardStep,
    form,
    fieldErrors,
    filters,
    isEditModalOpen,
    editing,
    editForm,
    viewingStudent,
    profileTab,
    viewingProfile: getProfileForStudent(viewingStudent),
    handlers: {
      onRefresh: loadStudents,
      onOpenCreate: openCreateWizard,
      onOpenEdit: openEditModal,
      onCloseWizard: closeWizard,
      onCloseEditModal: closeEditModal,
      onFormChange: handleFormChange,
      onEditFormChange: handleEditFormChange,
      onNextStep: goNextStep,
      onBackStep: goBackStep,
      onFinishWizard: handleFinishWizard,
      onEditSubmit: handleEditSubmit,
      onDeactivate: handleDeactivate,
      onDismissFeedback: clearFeedback,
      onOpenProfile: openProfile,
      onCloseProfile: closeProfile,
      onProfileTabChange: setProfileTab,
      onFilterChange: (field, value) => setFilters((prev) => ({ ...prev, [field]: value })),
      onClearFilters: () => {
        setFilters(EMPTY_FILTERS);
        setDebouncedSearch('');
      },
    },
  };
}
