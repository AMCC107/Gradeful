import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, DollarSign, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { AdminPageHero } from './shared/AdminUi';
import { fetchDashboardSummary } from '../../services/reports.service';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const DAYS = [{ key: '1', label: 'Lun' }, { key: '2', label: 'Mar' }, { key: '3', label: 'Mié' }, { key: '4', label: 'Jue' }, { key: '5', label: 'Vie' }];

function AdminDashboardView() {
  const [data, setData] = useState({ summary: {}, attendance: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardSummary()
      .then(setData)
      .catch((requestError) => setError(requestError?.message || 'No se pudieron cargar los indicadores.'));
  }, []);

  const kpis = useMemo(() => [
    { id: 'alumnos', label: 'Total de Alumnos Activos', value: data.summary.active_students ?? 0, hint: 'Registros activos', icon: Users, accent: 'bg-brand-50 text-brand-600', valueClass: 'text-slate-900' },
    { id: 'ingresos', label: 'Ingresos del Mes', value: money.format(data.summary.monthly_income ?? 0), hint: 'Pagos confirmados', icon: DollarSign, accent: 'bg-emerald-50 text-emerald-600', valueClass: 'text-emerald-700' },
    { id: 'morosidad', label: 'Índice de Morosidad', value: `${data.summary.delinquency_rate ?? 0}%`, hint: `${data.summary.overdue_students ?? 0} cuentas con atraso`, icon: AlertTriangle, accent: 'bg-red-50 text-red-600', valueClass: 'text-red-600' },
    { id: 'promedio', label: 'Promedio General', value: data.summary.average_grade ?? '—', hint: 'Calificaciones capturadas', icon: GraduationCap, accent: 'bg-violet-50 text-violet-600', valueClass: 'text-slate-900' },
  ], [data]);

  const weeklyAttendance = DAYS.map((day) => ({
    day: day.label,
    pct: Number(data.attendance.find((item) => item.weekday === day.key)?.percentage ?? 0),
  }));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero eyebrow="Administración" title="Resumen de Gestión" description="Indicadores calculados desde matrícula, tesorería, morosidad y desempeño académico." />
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpis.map((kpi) => { const Icon = kpi.icon; return <div key={kpi.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{kpi.label}</p><p className={`mt-2 text-3xl font-bold tabular-nums ${kpi.valueClass}`}>{kpi.value}</p></div><div className={`flex size-11 items-center justify-center rounded-xl ${kpi.accent}`}><Icon className="size-5" /></div></div><p className="mt-3 text-xs text-slate-500">{kpi.hint}</p></div>; })}</div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Asistencia semanal</h3><p className="text-xs text-slate-500">Porcentaje real de presentes por día.</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"><TrendingUp className="size-3.5" />Últimos 7 días</span></div><div className="flex h-56 items-end justify-between gap-3 border-b border-slate-100 px-2 pb-2">{weeklyAttendance.map((item) => <div key={item.day} className="flex flex-1 flex-col items-center gap-2"><span className="text-xs font-semibold">{item.pct}%</span><div className="flex w-full max-w-14 flex-1 items-end rounded-t-lg bg-slate-50"><div className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400" style={{ height: `${item.pct}%` }} /></div><span className="text-xs font-semibold text-slate-500">{item.day}</span></div>)}</div></div>
    </div>
  );
}

export default AdminDashboardView;
