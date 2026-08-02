import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { EditableTable } from '../../components/ui';
import { AdminPageHero, FeedbackBanner, inputClass } from '../admin/shared/AdminUi';

const MOCK_GROUPS = [
  { id: 'g1', label: '6A · Ingeniería de Software' },
  { id: 'g2', label: '5B · Ciencias de la Computación' },
  { id: 'g3', label: '4A · Desarrollo Web' },
];

const MOCK_SUBJECTS = [
  { id: 's1', label: 'Desarrollo de Aplicaciones Web' },
  { id: 's2', label: 'Bases de Datos II' },
  { id: 's3', label: 'Inteligencia Artificial' },
];

const ATTENDANCE_OPTIONS = [
  { value: 'P', label: 'Presente' },
  { value: 'F', label: 'Falta' },
  { value: 'R', label: 'Retardo' },
];

const MOCK_STUDENTS = [
  { id: 1, alumno: 'Ana Pérez López' },
  { id: 2, alumno: 'Carlos Mendoza Ruiz' },
  { id: 3, alumno: 'Diana Soto Vargas' },
  { id: 4, alumno: 'Eduardo Ramírez Cruz' },
  { id: 5, alumno: 'Fernanda Gil Ortega' },
  { id: 6, alumno: 'Gabriel Núñez Peña' },
];

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

function getWeekDayColumns() {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return WEEKDAY_LABELS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      id: `day_${index}`,
      label: `${label} ${date.getDate()}`,
      type: 'select',
      editable: true,
      width: '130px',
      align: 'center',
      options: ATTENDANCE_OPTIONS,
      placeholder: '—',
    };
  });
}

function buildInitialRows(dayColumns) {
  return MOCK_STUDENTS.map((student) => {
    const row = { id: student.id, alumno: student.alumno };
    dayColumns.forEach((col) => {
      row[col.id] = 'P';
    });
    return row;
  });
}

function TeacherAttendanceView() {
  const dayColumns = useMemo(() => getWeekDayColumns(), []);
  const columns = useMemo(
    () => [
      { id: 'alumno', label: 'Alumno', type: 'text', editable: false, width: '220px' },
      ...dayColumns,
    ],
    [dayColumns],
  );

  const [groupId, setGroupId] = useState(MOCK_GROUPS[0].id);
  const [subjectId, setSubjectId] = useState(MOCK_SUBJECTS[0].id);
  const [rows, setRows] = useState(() => buildInitialRows(dayColumns));
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  const handleChange = (rowId, columnId, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)),
    );
  };

  const handleSave = () => {
    setFeedback({
      error: '',
      success: 'Asistencia guardada correctamente (simulación).',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Portal docente"
        title="Asistencia"
        description="Registra asistencia semanal por grupo y materia."
      />

      <FeedbackBanner
        error={feedback.error}
        success={feedback.success}
        onDismiss={() => setFeedback({ error: '', success: '' })}
      />

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="att-group">
            Grupo
          </label>
          <select
            id="att-group"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className={inputClass}
          >
            {MOCK_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="att-subject">
            Materia
          </label>
          <select
            id="att-subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className={inputClass}
          >
            {MOCK_SUBJECTS.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <EditableTable
        columns={columns}
        data={rows}
        onChange={handleChange}
        emptyMessage="No hay alumnos en este grupo."
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Save className="size-4" />
          Guardar Asistencia
        </button>
      </div>
    </div>
  );
}

export default TeacherAttendanceView;
