import { Download, GraduationCap } from 'lucide-react';
import { AdminPageHero } from '../../admin/shared/AdminUi';

const SAMPLE_GRADES = [
  {
    code: 'DSW-301',
    subject: 'Desarrollo de Aplicaciones Web',
    teacher: 'Mtro. Fernando Castro',
    p1: 9.5,
    p2: 9.0,
    p3: 10.0,
    final: 9.5,
    status: 'Aprobado',
  },
  {
    code: 'BBD-302',
    subject: 'Bases de Datos II',
    teacher: 'Dra. Patricia Medina',
    p1: 8.5,
    p2: 8.8,
    p3: 9.0,
    final: 8.8,
    status: 'Aprobado',
  },
  {
    code: 'IA-303',
    subject: 'Inteligencia Artificial',
    teacher: 'Dr. Hugo Sánchez',
    p1: 10.0,
    p2: 10.0,
    p3: 10.0,
    final: 10.0,
    status: 'Aprobado',
  },
  {
    code: 'UIX-304',
    subject: 'Diseño de Interfaces (UX/UI)',
    teacher: 'Mtra. Elena Gómez',
    p1: 9.0,
    p2: 9.2,
    p3: 9.5,
    final: 9.2,
    status: 'Aprobado',
  },
  {
    code: 'PM-305',
    subject: 'Programación Móvil',
    teacher: 'Mtro. Luis Torres',
    p1: 8.8,
    p2: 9.0,
    p3: 9.2,
    final: 9.0,
    status: 'Aprobado',
  },
];

function formatGrade(value) {
  return value != null ? Number(value).toFixed(1) : '—';
}

function StudentGradesView() {
  const cycleAverage = (
    SAMPLE_GRADES.reduce((sum, row) => sum + row.final, 0) / SAMPLE_GRADES.length
  ).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Portal estudiantil"
        title="Boleta de Calificaciones"
        description="Consulta oficial de parciales y promedio final del ciclo actual."
      />

      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          <Download className="size-4" />
          Descargar Boleta PDF
        </button>
      </div>

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
              <p className="mt-0.5 text-sm text-slate-500">6to Semestre · Ingeniería en Desarrollo de Software</p>
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
              {SAMPLE_GRADES.map((row) => (
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
          Documento informativo del portal. La descarga PDF estará disponible en una próxima versión.
        </div>
      </div>
    </div>
  );
}

export default StudentGradesView;
