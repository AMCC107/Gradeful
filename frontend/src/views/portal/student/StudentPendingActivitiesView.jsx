import { RefreshCw, ClipboardList } from 'lucide-react';
import { useStudentPendingActivities } from '../../../controllers/hooks/useStudentPendingActivities';
import { AdminPageHero, FeedbackBanner } from '../../admin/shared/AdminUi';

function isOverdue(fechaEntrega) {
  if (!fechaEntrega) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${fechaEntrega}T00:00:00`);
  return due < today;
}

function StudentPendingActivitiesView() {
  const { activities, loading, error, handlers } = useStudentPendingActivities();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Portal estudiantil"
        title="Actividades Pendientes"
        description="Tareas y actividades de tus grupos, ordenadas por fecha de entrega más próxima."
      />

      <FeedbackBanner error={error} success="" onDismiss={handlers.onDismissError} />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Tu lista</h3>
              <p className="text-xs text-slate-500">
                {loading ? 'Cargando…' : `${activities.length} pendiente${activities.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlers.onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Entrega</th>
                <th className="px-5 py-3">Título</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Materia</th>
                <th className="px-5 py-3">Profesor</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    Cargando actividades…
                  </td>
                </tr>
              )}
              {!loading && activities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    No tienes actividades pendientes. Cuando te inscriban a un grupo aparecerán aquí.
                  </td>
                </tr>
              )}
              {!loading &&
                activities.map((activity) => {
                  const overdue = isOverdue(activity.fecha_entrega);
                  return (
                    <tr key={activity.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <span className={overdue ? 'font-semibold text-red-600' : 'font-medium text-slate-900'}>
                          {activity.fecha_entrega}
                        </span>
                        {overdue && (
                          <span className="ml-2 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-600 ring-1 ring-red-100">
                            Vencida
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900">{activity.titulo}</p>
                        {activity.descripcion && (
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{activity.descripcion}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand-700 ring-1 ring-brand-100">
                          {activity.tipo}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{activity.subject_nombre}</td>
                      <td className="px-5 py-3.5 text-slate-600">{activity.teacher_nombre}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentPendingActivitiesView;
