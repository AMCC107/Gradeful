/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchParentStudents } from '../services/parents.service';

const ParentStudentContext = createContext(null);

export function ParentStudentProvider({ children, initialChildren = null }) {
  const [students, setStudents] = useState(initialChildren ?? []);
  const [selectedStudentId, setSelectedStudentId] = useState(initialChildren?.[0]?.id ?? null);
  const [loading, setLoading] = useState(initialChildren == null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialChildren != null) return;
    let active = true;
    fetchParentStudents()
      .then((rows) => {
        if (!active) return;
        setStudents(rows);
        setSelectedStudentId((current) => current ?? rows[0]?.id ?? null);
        setError('');
      })
      .catch((requestError) => {
        if (active) setError(requestError?.message || 'No se pudieron cargar los alumnos vinculados.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [initialChildren]);

  const value = useMemo(() => {
    const selectedStudent =
      students.find((student) => String(student.id) === String(selectedStudentId))
      ?? students[0]
      ?? null;
    return {
      students,
      selectedStudentId: selectedStudent?.id ?? null,
      selectedStudent,
      setSelectedStudentId,
      loading,
      error,
    };
  }, [students, selectedStudentId, loading, error]);

  return (
    <ParentStudentContext.Provider value={value}>
      {children}
    </ParentStudentContext.Provider>
  );
}

export function useParentStudent() {
  const context = useContext(ParentStudentContext);
  if (!context) throw new Error('useParentStudent debe usarse dentro de ParentStudentProvider');
  return context;
}
