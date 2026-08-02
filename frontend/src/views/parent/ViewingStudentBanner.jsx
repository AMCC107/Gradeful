import { UserRound } from 'lucide-react';

/** Banner de contexto: indica de qué alumno se muestran los datos (portal padre). */
function ViewingStudentBanner({ studentName }) {
  if (!studentName) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <UserRound className="size-4" />
      </div>
      <p>
        Mostrando información de:{' '}
        <span className="font-bold">{studentName}</span>
      </p>
    </div>
  );
}

export default ViewingStudentBanner;
