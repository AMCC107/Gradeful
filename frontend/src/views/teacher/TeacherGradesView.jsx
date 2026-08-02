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

const INITIAL_ROWS = [
  { id: 1, alumno: 'Ana Pérez López', p1: 9.5, p2: 9.0, p3: 10.0 },
  { id: 2, alumno: 'Carlos Mendoza Ruiz', p1: 8.0, p2: 8.5, p3: 8.8 },
  { id: 3, alumno: 'Diana Soto Vargas', p1: 10.0, p2: 9.8, p3: 9.5 },
  { id: 4, alumno: 'Eduardo Ramírez Cruz', p1: 7.5, p2: 8.0, p3: 7.8 },
  { id: 5, alumno: 'Fernanda Gil Ortega', p1: 9.2, p2: 9.4, p3: 9.0 },
  { id: 6, alumno: 'Gabriel Núñez Peña', p1: 8.8, p2: 9.0, p3: 9.2 },
];

function calcAverage(p1, p2, p3) {
  const values = [p1, p2, p3].filter((v) => v != null && !Number.isNaN(Number(v)));
  if (values.length === 0) return null;
  const sum = values.reduce((acc, v) => acc + Number(v), 0);
  return Number((sum / values.length).toFixed(1));
}

function withAverages(rows) {
  return rows.map((row) => ({
    ...row,
    promedio: calcAverage(row.p1, row.p2, row.p3),
  }));
}

const COLUMNS = [
  { id: 'alumno', label: 'Alumno', type: 'text', editable: false, width: '220px' },
  { id: 'p1', label: 'Parcial 1', type: 'number', editable: true, width: '110px', min: 0, max: 10, step: 0.1 },
  { id: 'p2', label: 'Parcial 2', type: 'number', editable: true, width: '110px', min: 0, max: 10, step: 0.1 },
  { id: 'p3', label: 'Parcial 3', type: 'number', editable: true, width: '110px', min: 0, max: 10, step: 0.1 },
  { id: 'promedio', label: 'Promedio Final', type: 'number', editable: false, width: '130px' },
];

function TeacherGradesView() {
  const [groupId, setGroupId] = useState(MOCK_GROUPS[0].id);
  const [subjectId, setSubjectId] = useState(MOCK_SUBJECTS[0].id);
  const [rows, setRows] = useState(() => withAverages(INITIAL_ROWS));
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  const columns = useMemo(() => COLUMNS, []);

  const handleChange = (rowId, columnId, value) => {
    if (columnId === 'promedio') return;
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const next = { ...row, [columnId]: value };
        return { ...next, promedio: calcAverage(next.p1, next.p2, next.p3) };
      }),
    );
  };

  const handleSave = () => {
    setFeedback({
      error: '',
      success: 'Calificaciones guardadas correctamente (simulación).',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Portal docente"
        title="Calificaciones"
        description="Captura parciales y consulta el promedio final calculado automáticamente."
      />

      <FeedbackBanner
        error={feedback.error}
        success={feedback.success}
        onDismiss={() => setFeedback({ error: '', success: '' })}
      />

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="grd-group">
            Grupo
          </label>
          <select
            id="grd-group"
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
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="grd-subject">
            Materia
          </label>
          <select
            id="grd-subject"
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
          Guardar Calificaciones
        </button>
      </div>
    </div>
  );
}

export default TeacherGradesView;
