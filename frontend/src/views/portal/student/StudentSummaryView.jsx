import { getUserProfile } from '../../../models/auth.model';
import { Award, Calendar, CreditCard, Clock, Bell } from 'lucide-react';

function StudentSummaryView() {
  const user = getUserProfile();

  const schedule = [
    { time: '08:00 AM - 09:30 AM', subject: 'Desarrollo de Aplicaciones Web', room: 'Lab de Cómputo 3' },
    { time: '09:40 AM - 11:10 AM', subject: 'Bases de Datos II', room: 'Aula B-12' },
    { time: '11:20 AM - 12:50 PM', subject: 'Inteligencia Artificial', room: 'Aula A-5' },
  ];

  const announcements = [
    {
      id: 1,
      title: 'Reinscripciones Ciclo Otoño 2026',
      date: 'Hace 2 horas',
      category: 'Académico',
      content: 'El periodo de selección de materias para el próximo periodo inicia el 22 de junio. Asegúrate de estar al corriente con tus pagos.',
      urgent: true,
    },
    {
      id: 2,
      title: 'Mantenimiento de Plataforma',
      date: 'Ayer',
      category: 'Sistemas',
      content: 'Este sábado el portal estará fuera de servicio de 10:00 PM a 02:00 AM por actualización de servidores.',
      urgent: false,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg md:p-8">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-bold md:text-4xl">¡Hola de nuevo, {user?.name}! 👋</h1>
          <p className="mt-2 text-blue-100">
            Bienvenido a tu portal estudiantil. Aquí puedes revisar tus calificaciones, realizar tus trámites escolares y consultar tus estados de cuenta.
          </p>
        </div>
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 -mb-16 size-48 rounded-full bg-indigo-500/20 blur-xl" />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Promedio General</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">9.4</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Award className="size-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span>¡Excelente rendimiento!</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Asistencia</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">96.5%</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Calendar className="size-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Periodo actual</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Próximo Pago</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">$150 USD</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CreditCard className="size-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <Clock className="size-3.5" />
            <span>Vence el 15/06/2026</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trámites Activos</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">1</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Clock className="size-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Constancia de Estudios</span>
          </div>
        </div>
      </div>

      {/* Double Column Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Schedule */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Horario de Clases (Hoy)</h2>
          <p className="text-xs text-slate-500 mb-4">Materias correspondientes al día de hoy</p>
          <div className="space-y-4">
            {schedule.map((item, index) => (
              <div key={index} className="flex gap-4 items-start border-l-4 border-blue-500 bg-slate-50 p-4 rounded-r-xl">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">{item.subject}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.room}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="size-5 text-indigo-500" /> Avisos Recientes
            </h2>
          </div>
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ann.urgent ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{ann.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentSummaryView;
