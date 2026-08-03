import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { EditableTable } from '../../components/ui';
import { AdminPageHero, FeedbackBanner, inputClass } from '../admin/shared/AdminUi';
import { fetchGroups } from '../../services/groups.service';
import { fetchGroupAttendance, saveAttendance } from '../../services/attendance.service';

const ATTENDANCE_OPTIONS = [
  { value: 'presente', label: 'Presente' },
  { value: 'ausente', label: 'Ausente' },
  { value: 'retardo', label: 'Retardo' },
];
const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

function getWeekDates() {
  const today = new Date();
  const offset = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() + offset);
  return WEEKDAY_LABELS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      label: `${label} ${date.getDate()}`,
    };
  });
}

function TeacherAttendanceView() {
  const weekDates = useMemo(() => getWeekDates(), []);
  const columns = useMemo(() => [
    { id: 'alumno', label: 'Alumno', type: 'text', editable: false, width: '220px' },
    ...weekDates.map((day) => ({
      id: day.date,
      label: day.label,
      type: 'select',
      editable: true,
      width: '130px',
      align: 'center',
      options: ATTENDANCE_OPTIONS,
      placeholder: '—',
    })),
  ], [weekDates]);
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const selectedGroup = groups.find((group) => String(group.id) === String(groupId));

  useEffect(() => {
    fetchGroups()
      .then((data) => {
        setGroups(data);
        setGroupId(String(data[0]?.id ?? ''));
        if (!data.length) setLoading(false);
      })
      .catch((error) => {
        setFeedback({ error: error.message, success: '' });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!groupId) return;
    fetchGroupAttendance(groupId, {
      fecha_desde: weekDates[0].date,
      fecha_hasta: weekDates.at(-1).date,
    })
      .then((data) => setRows((data.rows ?? []).map((row) => ({
        ...row,
        ...Object.fromEntries(weekDates.map((day) => [day.date, row.attendance?.[day.date]?.estado ?? ''])),
      }))))
      .catch((error) => setFeedback({ error: error.message, success: '' }))
      .finally(() => setLoading(false));
  }, [groupId, weekDates]);

  const handleChange = (rowId, columnId, value) => {
    setRows((current) => current.map((row) => row.id === rowId ? { ...row, [columnId]: value } : row));
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback({ error: '', success: '' });
    try {
      await Promise.all(weekDates.map((day) => {
        const records = rows
          .filter((row) => row[day.date])
          .map((row) => ({ student_id: row.student_id, estado: row[day.date] }));
        return records.length ? saveAttendance(groupId, day.date, records) : Promise.resolve();
      }));
      setFeedback({ error: '', success: 'Asistencia guardada correctamente.' });
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero eyebrow="Portal docente" title="Asistencia" description="Registra asistencia semanal por grupo y materia." />
      <FeedbackBanner {...feedback} onDismiss={() => setFeedback({ error: '', success: '' })} />
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="att-group">Grupo</label>
          <select id="att-group" value={groupId} onChange={(event) => setGroupId(event.target.value)} className={inputClass}>
            {groups.map((group) => <option key={group.id} value={group.id}>{group.course_nombre} {group.nombre} · {group.turno}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Materia asignada</label>
          <div className={`${inputClass} bg-slate-50`}>{selectedGroup?.subject_nombre || 'Sin grupo seleccionado'}</div>
        </div>
      </div>
      {loading ? <p className="text-sm text-slate-500">Cargando asistencia…</p> : (
        <EditableTable columns={columns} data={rows} onChange={handleChange} emptyMessage="No hay alumnos en este grupo." />
      )}
      <div className="flex justify-end">
        <button type="button" disabled={saving || !rows.length} onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50">
          <Save className="size-4" />{saving ? 'Guardando…' : 'Guardar Asistencia'}
        </button>
      </div>
    </div>
  );
}

export default TeacherAttendanceView;
