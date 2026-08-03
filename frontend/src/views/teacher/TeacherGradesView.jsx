import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { EditableTable } from '../../components/ui';
import { AdminPageHero, FeedbackBanner, inputClass } from '../admin/shared/AdminUi';
import { fetchGroups } from '../../services/groups.service';
import { fetchGroupGrades, saveGroupGrades } from '../../services/grades.service';

const COLUMNS = [
  { id: 'alumno', label: 'Alumno', type: 'text', editable: false, width: '220px' },
  { id: 'p1', label: 'Parcial 1', type: 'number', editable: true, width: '110px', min: 0, max: 10, step: 0.1 },
  { id: 'p2', label: 'Parcial 2', type: 'number', editable: true, width: '110px', min: 0, max: 10, step: 0.1 },
  { id: 'p3', label: 'Parcial 3', type: 'number', editable: true, width: '110px', min: 0, max: 10, step: 0.1 },
  { id: 'promedio', label: 'Promedio Final', type: 'number', editable: false, width: '130px' },
];

function average(row) {
  const values = [row.p1, row.p2, row.p3]
    .filter((value) => value !== '' && value != null && !Number.isNaN(Number(value)))
    .map(Number);
  return values.length
    ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
    : null;
}

function TeacherGradesView() {
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [periods, setPeriods] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const columns = useMemo(() => COLUMNS, []);
  const selectedGroup = groups.find((group) => String(group.id) === String(groupId));

  useEffect(() => {
    fetchGroups()
      .then((data) => {
        setGroups(data);
        setGroupId((current) => current || String(data[0]?.id ?? ''));
        if (!data.length) setLoading(false);
      })
      .catch((error) => {
        setFeedback({ error: error.message, success: '' });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!groupId) return;
    fetchGroupGrades(groupId)
      .then((data) => {
        setPeriods(data.periods ?? []);
        setRows((data.rows ?? []).map((row) => ({ ...row, promedio: average(row) })));
        setFeedback({ error: '', success: '' });
      })
      .catch((error) => setFeedback({ error: error.message, success: '' }))
      .finally(() => setLoading(false));
  }, [groupId]);

  const handleChange = (rowId, columnId, value) => {
    setRows((current) => current.map((row) => {
      if (row.id !== rowId) return row;
      const next = { ...row, [columnId]: value };
      return { ...next, promedio: average(next) };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback({ error: '', success: '' });
    try {
      const grades = rows.flatMap((row) => periods.flatMap((period) => {
        const value = row[`p${period.numero}`];
        return value === '' || value == null
          ? []
          : [{ student_id: row.student_id, period_id: period.id, calificacion: Number(value) }];
      }));
      const result = await saveGroupGrades(groupId, { grades });
      setFeedback({ error: '', success: result.message });
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero eyebrow="Portal docente" title="Calificaciones" description="Captura parciales y consulta el promedio final calculado automáticamente." />
      <FeedbackBanner {...feedback} onDismiss={() => setFeedback({ error: '', success: '' })} />
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="grd-group">Grupo</label>
          <select id="grd-group" value={groupId} onChange={(event) => setGroupId(event.target.value)} className={inputClass}>
            {groups.map((group) => <option key={group.id} value={group.id}>{group.course_nombre} {group.nombre} · {group.turno}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Materia asignada</label>
          <div className={`${inputClass} bg-slate-50`}>{selectedGroup?.subject_nombre || 'Sin grupo seleccionado'}</div>
        </div>
      </div>
      {loading ? <p className="text-sm text-slate-500">Cargando calificaciones…</p> : (
        <EditableTable columns={columns} data={rows} onChange={handleChange} emptyMessage="No hay alumnos en este grupo." />
      )}
      <div className="flex justify-end">
        <button type="button" disabled={saving || !rows.length} onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50">
          <Save className="size-4" />{saving ? 'Guardando…' : 'Guardar Calificaciones'}
        </button>
      </div>
    </div>
  );
}

export default TeacherGradesView;
