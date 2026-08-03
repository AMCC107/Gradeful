/**
 * Layout de boleta listo para impresión (A4).
 * Usado junto con @media print: solo este bloque es visible al imprimir.
 */

function formatGrade(value) {
  return value != null ? Number(value).toFixed(1) : '—';
}

function BoletaPDF({
  studentName = 'Estudiante',
  matricula = '—',
  programLabel = '',
  cycleLabel = 'Ciclo Primavera 2026',
  grades = [],
  className = '',
}) {
  const average = grades.length
    ? (grades.reduce((sum, row) => sum + Number(row.final || 0), 0) / grades.length).toFixed(1)
    : '—';

  return (
    <div
      id="boleta-print-root"
      className={['boleta-print-sheet mx-auto bg-white text-slate-900', className].filter(Boolean).join(' ')}
    >
      {/* Membrete */}
      <header className="boleta-print-header flex items-start justify-between gap-4 border-b-2 border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-xl border-2 border-slate-800 bg-slate-50 text-lg font-black tracking-tight">
            GF
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">Gradeful Academy</p>
            <p className="text-xs text-slate-600">Sistema Escolar Integral</p>
            <p className="text-xs text-slate-500">Av. Universidad 1200 · Ciudad de México</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Boleta oficial</p>
          <p className="text-sm font-bold">{cycleLabel}</p>
          <p className="mt-1 text-xs text-slate-500">Documento generado desde el portal</p>
        </div>
      </header>

      {/* Datos del alumno */}
      <section className="mt-5 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Alumno</p>
          <p className="font-bold">{studentName}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Matrícula</p>
          <p className="font-mono font-semibold">{matricula}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Programa</p>
          <p className="font-semibold">{programLabel || '—'}</p>
        </div>
      </section>

      {/* Tabla de calificaciones */}
      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">Calificaciones finales</h2>
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b-2 border-slate-800 bg-slate-100">
              <th className="px-2 py-2 font-bold">Clave</th>
              <th className="px-2 py-2 font-bold">Asignatura</th>
              <th className="px-2 py-2 text-center font-bold">P1</th>
              <th className="px-2 py-2 text-center font-bold">P2</th>
              <th className="px-2 py-2 text-center font-bold">P3</th>
              <th className="px-2 py-2 text-center font-bold">Final</th>
              <th className="px-2 py-2 text-center font-bold">Estatus</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((row) => (
              <tr key={row.code} className="border-b border-slate-200">
                <td className="px-2 py-2 font-mono">{row.code}</td>
                <td className="px-2 py-2 font-semibold">{row.subject}</td>
                <td className="px-2 py-2 text-center tabular-nums">{formatGrade(row.p1)}</td>
                <td className="px-2 py-2 text-center tabular-nums">{formatGrade(row.p2)}</td>
                <td className="px-2 py-2 text-center tabular-nums">{formatGrade(row.p3)}</td>
                <td className="px-2 py-2 text-center text-sm font-bold tabular-nums">
                  {formatGrade(row.final)}
                </td>
                <td className="px-2 py-2 text-center">{row.status || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-6 flex items-end justify-between border-t border-slate-200 pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Promedio del ciclo</p>
          <p className="text-2xl font-bold tabular-nums">{average}</p>
        </div>
        <div className="text-center">
          <div className="mb-1 h-px w-40 bg-slate-400" />
          <p className="text-[10px] text-slate-500">Firma / Sello de Control Escolar</p>
        </div>
      </footer>
    </div>
  );
}

export default BoletaPDF;
