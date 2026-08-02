import { Award, Calendar, CreditCard, Clock, Bell } from 'lucide-react';

/**
 * @param {object} props
 * @param {string} [props.userName]
 * @param {{ average?: string|number, attendance?: string|number, nextPayment?: string, nextPaymentDue?: string, activeProcedures?: number, activeProcedureLabel?: string }} [props.kpis]
 * @param {{ time: string, subject: string, room: string }[]} [props.schedule]
 * @param {{ id: string|number, title: string, date: string, category: string, content: string, urgent?: boolean }[]} [props.announcements]
 */
function StudentSummaryView({
  userName = '',
  kpis = {},
  schedule = [],
  announcements = [],
}) {
  const {
    average,
    attendance,
    nextPayment,
    nextPaymentDue,
    activeProcedures,
    activeProcedureLabel,
  } = kpis;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg md:p-8">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-bold md:text-4xl">
            ¡Hola de nuevo{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="mt-2 text-blue-100">
            Bienvenido a tu portal estudiantil. Aquí puedes revisar tus calificaciones, realizar tus trámites escolares y consultar tus estados de cuenta.
          </p>
        </div>
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 -mb-16 size-48 rounded-full bg-indigo-500/20 blur-xl" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Promedio General</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{average ?? '—'}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Award className="size-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>{average != null ? 'Rendimiento académico' : 'Sin datos aún'}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Asistencia</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{attendance ?? '—'}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Calendar className="size-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Periodo actual</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Próximo Pago</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{nextPayment ?? '—'}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CreditCard className="size-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <Clock className="size-3.5" />
            <span>{nextPaymentDue ? `Vence el ${nextPaymentDue}` : 'Sin vencimientos'}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trámites Activos</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{activeProcedures ?? '—'}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Clock className="size-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span>{activeProcedureLabel || 'Sin trámites activos'}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Horario de Clases (Hoy)</h2>
          <p className="mb-4 text-xs text-slate-500">Materias correspondientes al día de hoy</p>
          <div className="space-y-4">
            {schedule.length === 0 && (
              <p className="rounded-r-xl border-l-4 border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No hay clases programadas para hoy.
              </p>
            )}
            {schedule.map((item) => (
              <div
                key={`${item.subject}-${item.time}`}
                className="flex items-start gap-4 rounded-r-xl border-l-4 border-blue-500 bg-slate-50 p-4"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-slate-900">{item.subject}</h4>
                  <p className="mt-0.5 text-xs text-slate-500">{item.room}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Bell className="size-5 text-indigo-500" /> Avisos Recientes
            </h2>
          </div>
          <div className="space-y-4">
            {announcements.length === 0 && (
              <p className="text-sm text-slate-500">No hay avisos recientes.</p>
            )}
            {announcements.map((ann) => (
              <div key={ann.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      ann.urgent ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{ann.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentSummaryView;
