import { useState } from 'react';
import { GraduationCap, TrendingUp, CheckCircle } from 'lucide-react';

/**
 * @param {object} props
 * @param {{ value: string, label: string }[]} [props.semesters]
 * @param {Record<string, { code: string, subject: string, teacher: string, p1: number|null, p2: number|null, p3: number|null, final: number|null, status?: string }[]>} [props.gradesBySemester]
 * @param {string} [props.selectedSemester]
 * @param {(value: string) => void} [props.onSemesterChange]
 * @param {{ cycleAverage?: string|number, approvedCount?: string|number, credits?: string }} [props.stats]
 */
function StudentGradesView({
  semesters = [],
  gradesBySemester = {},
  selectedSemester: controlledSemester,
  onSemesterChange,
  stats = {},
}) {
  const [internalSemester, setInternalSemester] = useState(semesters[0]?.value ?? '');
  const selectedSemester = controlledSemester ?? internalSemester;

  const handleSemesterChange = (value) => {
    onSemesterChange?.(value);
    if (controlledSemester === undefined) {
      setInternalSemester(value);
    }
  };

  const currentGrades = gradesBySemester[selectedSemester] ?? [];
  const {
    cycleAverage = '—',
    approvedCount = '—',
    credits = '—',
  } = stats;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Boleta de Calificaciones</h1>
          <p className="text-sm text-slate-500">Consulta tu historial de notas parciales y finales</p>
        </div>
        <div className="w-full sm:w-72">
          <select
            value={selectedSemester}
            onChange={(e) => handleSemesterChange(e.target.value)}
            disabled={semesters.length === 0}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
          >
            {semesters.length === 0 && <option value="">Sin periodos disponibles</option>}
            {semesters.map((sem) => (
              <option key={sem.value} value={sem.value}>
                {sem.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Promedio del Ciclo</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{cycleAverage}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Materias Aprobadas</p>
              <h3 className="mt-1 text-2xl font-bold text-emerald-700">{approvedCount}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="size-6" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Créditos Obtenidos</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{credits}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <GraduationCap className="size-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700">
              <tr>
                <th className="px-6 py-4">Clave</th>
                <th className="px-6 py-4">Asignatura</th>
                <th className="px-6 py-4">Docente</th>
                <th className="px-6 py-4 text-center">Parcial 1</th>
                <th className="px-6 py-4 text-center">Parcial 2</th>
                <th className="px-6 py-4 text-center">Parcial 3</th>
                <th className="px-6 py-4 text-center">Final</th>
                <th className="px-6 py-4 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentGrades.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                    No hay calificaciones para mostrar.
                  </td>
                </tr>
              )}
              {currentGrades.map((row) => (
                <tr key={row.code} className="transition-colors hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-slate-400">
                    {row.code}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{row.subject}</td>
                  <td className="px-6 py-4 text-slate-500">{row.teacher}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-700">
                    {row.p1 != null ? Number(row.p1).toFixed(1) : '—'}
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-700">
                    {row.p2 != null ? Number(row.p2).toFixed(1) : '—'}
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-700">
                    {row.p3 != null ? Number(row.p3).toFixed(1) : '—'}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">
                    {row.final != null ? Number(row.final).toFixed(1) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    {row.status ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        {row.status}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentGradesView;
