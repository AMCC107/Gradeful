import { useState, useEffect, useCallback } from 'react';
import { fetchGroups, fetchGroupStudents } from '../../services/groups.service';
import { fetchStudents } from '../../services/students.service';
import { createEnrollment, deleteEnrollment } from '../../services/enrollments.service';
import { ApiError } from '../../services/api.client';

export function useEnrollmentManagement() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [groupDetail, setGroupDetail] = useState(null);
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFeedback = () => {
    setError('');
    setSuccess('');
  };

  const loadBase = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [groupsData, studentsData] = await Promise.all([
        fetchGroups(),
        fetchStudents({ status: 'active' }),
      ]);
      setGroups(groupsData);
      setStudents(studentsData);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  const loadGroupStudents = useCallback(async (groupId) => {
    if (!groupId) {
      setGroupDetail(null);
      setEnrolled([]);
      return;
    }
    setLoadingEnrolled(true);
    setError('');
    try {
      const data = await fetchGroupStudents(groupId);
      setGroupDetail(data.group);
      setEnrolled(data.students ?? []);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los inscritos.');
      setEnrolled([]);
    } finally {
      setLoadingEnrolled(false);
    }
  }, []);

  useEffect(() => {
    loadGroupStudents(selectedGroupId);
  }, [selectedGroupId, loadGroupStudents]);

  const selectedGroup =
    groups.find((g) => String(g.id) === String(selectedGroupId)) || groupDetail;

  const handleEnroll = async (event) => {
    event.preventDefault();
    if (saving) return;
    clearFeedback();

    const errors = {};
    if (!selectedGroupId) errors.group_id = 'Selecciona un grupo.';
    if (!selectedStudentId) errors.student_id = 'Selecciona un alumno.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    if (selectedGroup && selectedGroup.cupos_disponibles <= 0) {
      setFieldErrors({ group_id: 'Este grupo no tiene cupos disponibles.' });
      setError('No hay cupos disponibles en el grupo seleccionado.');
      return;
    }

    setFieldErrors({});
    setSaving(true);
    try {
      const result = await createEnrollment({
        group_id: Number(selectedGroupId),
        student_id: Number(selectedStudentId),
      });
      setSuccess(result.message || 'Inscripción realizada.');
      setSelectedStudentId('');
      await loadBase();
      await loadGroupStudents(selectedGroupId);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
        setError(err.message);
      } else {
        setError(err?.message || 'No se pudo inscribir al alumno.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUnenroll = async (enrollmentId, studentName) => {
    if (!window.confirm(`¿Quitar a "${studentName}" del grupo?`)) return;
    clearFeedback();
    try {
      const result = await deleteEnrollment(enrollmentId);
      setSuccess(result.message || 'Inscripción eliminada.');
      await loadBase();
      await loadGroupStudents(selectedGroupId);
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar la inscripción.');
    }
  };

  return {
    groups,
    students,
    selectedGroupId,
    selectedStudentId,
    selectedGroup,
    enrolled,
    loading,
    loadingEnrolled,
    saving,
    error,
    success,
    fieldErrors,
    handlers: {
      onRefresh: async () => {
        await loadBase();
        await loadGroupStudents(selectedGroupId);
      },
      onGroupChange: (value) => {
        setSelectedGroupId(value);
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.group_id;
          return next;
        });
      },
      onStudentChange: (value) => {
        setSelectedStudentId(value);
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.student_id;
          return next;
        });
      },
      onEnroll: handleEnroll,
      onUnenroll: handleUnenroll,
      onDismissFeedback: clearFeedback,
    },
  };
}
