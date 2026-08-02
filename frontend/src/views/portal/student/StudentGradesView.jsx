import { Download, GraduationCap } from 'lucide-react';
import { AdminPageHero } from '../../admin/shared/AdminUi';
import { GRADES_BY_STUDENT, MOCK_CHILDREN } from '../../../contexts/ParentStudentContext';

const DEFAULT_GRADES = GRADES_BY_STUDENT['child-2'];
const DEFAULT_PROGRAM = MOCK_CHILDREN.find((child) => child.id === 'child-2')?.program
  ?? '6to Semestre · Ingeniería en Desarrollo de Software';

function formatGrade(value) {
  return value != null ? Number(value).toFixed(1) : '—';
}

/**
 * Boleta de calificaciones (estudiante o padre en modo lectura).
 *
 * @param {object} props
 * @param {string} [props.studentId] - Si se pasa, carga mock de ese alumno
 * @param {string} [props.studentName]
 * @param {string} [props.programLabel]
 * @param {Array} [props.grades]
 * @param {string} [props.eyebrow]
 * @param {boolean} [props.readOnly] - Oculta acciones no aplicables al padre
 */
function StudentGradesView({
  studentId,
  studentName,
  programLabel,
  grades,
  eyebrow = 'Portal estudiantil',
  readOnly = false,
}) {
  const resolvedGrades = grades
    ?? (studentId ? GRADES_BY_STUDENT[studentId] : null)
    ?? DEFAULT_GRADES;

  const resolvedProgram = programLabel
    ?? MOCK_CHILDREN.find((child) => child.id === studentId)?.program
    ?? DEFAULT_PROGRAM;

  const cycleAverage = resolvedGrades.length
    ? (resolvedGrades.reduce((sum, row) => sum + row.final, 0) / resolvedGrades.length).toFixed(1)
    : '—';

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow={eyebrow}
        title="Boleta de Calificaciones"
        description={
          studentName
            ? `Consulta oficial de parciales y promedio final de ${studentName}.`
            : 'Consulta oficial de parciales y promedio final del ciclo actual.'
        }
      />

      {!readOnly && (
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <Download className="size-4" />
            Descargar Boleta PDF
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ciclo Primavera 2026
              </p>
              <h3 className="text-base font-bold text-slate-900">Boleta oficial del periodo</h3>
              <p className="mt-0.5 text-sm text-slate-500">{resolvedProgram}</p>
            </div>
          </div>
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">Promedio general</p>
            <p className="text-2xl font-bold tabular-nums text-brand-700">{cycleAverage}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5">Clave</th>
                <th className="px-5 py-3.5">Asignatura</th>
                <th className="px-5 py-3.5">Docente</th>
                <th className="px-5 py-3.5 text-center">Parcial 1</th>
                <th className="px-5 py-3.5 text-center">Parcial 2</th>
                <th className="px-5 py-3.5 text-center">Parcial 3</th>
                <th className="px-5 py-3.5 text-center">Final</th>
                <th className="px-5 py-3.5 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resolvedGrades.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-semibold text-slate-400">
                    {row.code}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{row.subject}</td>
                  <td className="px-5 py-3.5 text-slate-500">{row.teacher}</td>
                  <td className="px-5 py-3.5 text-center tabular-nums text-slate-700">{formatGrade(row.p1)}</td>
                  <td className="px-5 py-3.5 text-center tabular-nums text-slate-700">{formatGrade(row.p2)}</td>
                  <td className="px-5 py-3.5 text-center tabular-nums text-slate-700">{formatGrade(row.p3)}</td>
                  <td className="px-5 py-3.5 text-center text-base font-bold tabular-nums text-brand-600">
                    {formatGrade(row.final)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-xs text-slate-500">
          Documento informativo del portal.
          {readOnly
            ? ' Vista de solo lectura para padres de familia.'
            : ' La descarga PDF estará disponible en una próxima versión.'}
        </div>
      </div>
    </div>
  );
}

export default StudentGradesView;
