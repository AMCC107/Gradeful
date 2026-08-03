import {
  Users,
  DollarSign,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { AdminPageHero } from './shared/AdminUi';

const KPIS = [
  {
    id: 'alumnos',
    label: 'Total de Alumnos Activos',
    value: '342',
    hint: '+18 vs. mes anterior',
    icon: Users,
    accent: 'bg-brand-50 text-brand-600',
    valueClass: 'text-slate-900',
  },
  {
    id: 'ingresos',
    label: 'Ingresos del Mes',
    value: '$125,000',
    hint: 'Colegiaturas + inscripciones',
    icon: DollarSign,
    accent: 'bg-emerald-50 text-emerald-600',
    valueClass: 'text-emerald-700',
  },
  {
    id: 'morosidad',
    label: 'Índice de Morosidad',
    value: '12%',
    hint: '41 cuentas con atraso',
    icon: AlertTriangle,
    accent: 'bg-red-50 text-red-600',
    valueClass: 'text-red-600',
  },
  {
    id: 'promedio',
    label: 'Promedio General',
    value: '8.7',
    hint: 'Ciclo Primavera 2026',
    icon: GraduationCap,
    accent: 'bg-violet-50 text-violet-600',
    valueClass: 'text-slate-900',
  },
];

const WEEKLY_ATTENDANCE = [
  { day: 'Lun', pct: 94 },
  { day: 'Mar', pct: 91 },
  { day: 'Mié', pct: 88 },
  { day: 'Jue', pct: 92 },
  { day: 'Vie', pct: 85 },
];

function AdminDashboardView() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Administración"
        title="Resumen de Gestión"
        description="Indicadores clave del campus: matrícula, tesorería, morosidad y desempeño académico."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {kpi.label}
                  </p>
                  <p className={`mt-2 text-3xl font-bold tabular-nums ${kpi.valueClass}`}>
                    {kpi.value}
                  </p>
                </div>
                <div className={`flex size-11 items-center justify-center rounded-xl ${kpi.accent}`}>
                  <Icon className="size-5" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">{kpi.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Asistencia Semanal</h3>
            <p className="text-xs text-slate-500">
              Porcentaje promedio de asistencia por día (placeholder de gráfica).
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
            <TrendingUp className="size-3.5" />
            Semana actual
          </span>
        </div>

        <div className="flex h-56 items-end justify-between gap-3 border-b border-slate-100 px-2 pb-2 sm:gap-6">
          {WEEKLY_ATTENDANCE.map((item) => (
            <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold tabular-nums text-slate-600">{item.pct}%</span>
              <div className="flex w-full max-w-14 flex-1 items-end justify-center rounded-t-lg bg-slate-50">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition"
                  style={{ height: `${item.pct}%` }}
                  title={`${item.day}: ${item.pct}%`}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500">{item.day}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Gráfica ilustrativa · se conectará a datos reales de asistencia en una siguiente iteración.
        </p>
      </div>
    </div>
  );
}

export default AdminDashboardView;
