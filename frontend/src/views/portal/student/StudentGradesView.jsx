import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { AdminPageHero } from '../../admin/shared/AdminUi';
import { ExportButtons } from '../../../components/ui';
import BoletaPDF from '../../shared/BoletaPDF';
import { getAuthUser, getUserProfile } from '../../../models/auth.model';
import { downloadReportCard, fetchStudentGrades } from '../../../services/grades.service';

function formatGrade(value) {
  return value != null ? Number(value).toFixed(1) : '—';
}

/**
 * Boleta de calificaciones (estudiante o padre en modo lectura).
 */
function StudentGradesView({
  studentId,
  studentName,
  programLabel,
  matricula,
  grades,
  eyebrow = 'Portal estudiantil',
  readOnly = false,
}) {
  const user = getUserProfile();
  const authUser = getAuthUser();
  const resolvedStudentId = studentId ?? authUser?.studentRecordId;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(Boolean(resolvedStudentId && !grades));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!resolvedStudentId || grades) return;
    let active = true;
    fetchStudentGrades(resolvedStudentId)
      .then((data) => {
        if (active) {
          setReport(data);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError?.message || 'No se pudo cargar la boleta.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [resolvedStudentId, grades]);

  const resolvedGrades = grades ?? report?.grades ?? [];

  const resolvedProgram = programLabel
    ?? report?.program
    ?? '';

  const resolvedName = studentName
    ?? report?.student?.nombre
    ?? user?.name
    ?? 'Estudiante';

  const resolvedMatricula = matricula
    ?? report?.student?.matricula
    ?? user?.displayId
    ?? '—';

  const cycleAverage = report?.average ?? (resolvedGrades.length
    ? (resolvedGrades.reduce((sum, row) => sum + row.final, 0) / resolvedGrades.length).toFixed(1)
    : '—');

  const handleExportPDF = async () => {
    if (!resolvedStudentId) return;
    try {
      await downloadReportCard(resolvedStudentId);
    } catch (requestError) {
      setError(requestError?.message || 'No se pudo generar la boleta PDF.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print flex flex-col gap-6">
        <AdminPageHero
          eyebrow={eyebrow}
          title="Boleta de Calificaciones"
          description={
            studentName
              ? `Consulta oficial de parciales y promedio final de ${studentName}.`
              : 'Consulta oficial de parciales y promedio final del ciclo actual.'
          }
        />

        {loading && <p className="text-sm text-slate-500">Cargando boleta…</p>}
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex justify-end">
          <ExportButtons onExportPDF={handleExportPDF} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ciclo {report?.cycle?.nombre || 'actual'}
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
            {readOnly
              ? 'Vista de solo lectura. '
              : ''}
            Usa &quot;Exportar a PDF&quot; para imprimir el layout oficial de boleta.
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Vista previa de impresión (A4)
          </p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <BoletaPDF
              studentName={resolvedName}
              matricula={resolvedMatricula}
              programLabel={resolvedProgram}
              grades={resolvedGrades}
              className="p-6 sm:p-8"
            />
          </div>
        </div>
      </div>

      {/* Solo visible al imprimir */}
      <div className="print-only-boleta" aria-hidden="true">
        <BoletaPDF
          studentName={resolvedName}
          matricula={resolvedMatricula}
          programLabel={resolvedProgram}
          grades={resolvedGrades}
          className="p-8"
        />
      </div>
    </div>
  );
}

export default StudentGradesView;
