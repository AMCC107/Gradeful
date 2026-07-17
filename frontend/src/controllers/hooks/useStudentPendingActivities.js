import { useState, useEffect, useCallback } from 'react';
import { fetchPendingActivities } from '../../services/activities.service';
import { getAuthUser } from '../../models/auth.model';

export function useStudentPendingActivities() {
  const authUser = getAuthUser();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!authUser?.id) {
      setError('Sesión no válida. Vuelve a iniciar sesión.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      setActivities(await fetchPendingActivities(authUser.id));
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar las actividades pendientes.');
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    activities,
    loading,
    error,
    handlers: {
      onRefresh: load,
      onDismissError: () => setError(''),
    },
  };
}
