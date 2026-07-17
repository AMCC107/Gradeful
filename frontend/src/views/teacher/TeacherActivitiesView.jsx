import { Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useTeacherActivities } from '../../controllers/hooks/useTeacherActivities';
import {
  AdminPageHero,
  FeedbackBanner,
  FieldError,
  inputClass,
  inputErrorClass,
} from '../admin/shared/AdminUi';

function ActivityFormModal({
  open,
  editing,
  form,
  fieldErrors,
  groups,
  saving,
  onClose,
  onChange,
  onSubmit,
}) {
  if (!open) return null;
  const isEdit = Boolean(editing);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit ? 'Editar actividad' : 'Nueva actividad / tarea'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Asígnala a uno de tus grupos con fecha de vencimiento.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="act-group">Grupo</label>
            <select
              id="act-group"
              value={form.group_id}
              onChange={(e) => onChange('group_id', e.target.value)}
              className={fieldErrors.group_id ? inputErrorClass : inputClass}
            >
              <option value="">Selecciona un grupo</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  #{g.id} · {g.subject_nombre} · {g.course_nombre}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.group_id} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="act-titulo">Título</label>
            <input
              id="act-titulo"
              type="text"
              value={form.titulo}
              onChange={(e) => onChange('titulo', e.target.value)}
              className={fieldErrors.titulo ? inputErrorClass : inputClass}
              placeholder="Ej. Ensayo de álgebra"
            />
            <FieldError message={fieldErrors.titulo} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="act-tipo">Tipo</label>
            <select
              id="act-tipo"
              value={form.tipo}
              onChange={(e) => onChange('tipo', e.target.value)}
              className={fieldErrors.tipo ? inputErrorClass : inputClass}
            >
              <option value="tarea">Tarea</option>
              <option value="actividad">Actividad</option>
            </select>
            <FieldError message={fieldErrors.tipo} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="act-fecha">Fecha de entrega</label>
            <input
              id="act-fecha"
              type="date"
              value={form.fecha_entrega}
              onChange={(e) => onChange('fecha_entrega', e.target.value)}
              className={fieldErrors.fecha_entrega ? inputErrorClass : inputClass}
            />
            <FieldError message={fieldErrors.fecha_entrega} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="act-desc">Descripción</label>
            <textarea
              id="act-desc"
              rows={3}
              value={form.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              className={inputClass}
              placeholder="Instrucciones opcionales"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeacherActivitiesView() {
  const {
    groups,
    activities,
    filterGroupId,
    filterFecha,
    loading,
    saving,
    error,
    success,
    isModalOpen,
    editing,
    form,
    fieldErrors,
    handlers,
  } = useTeacherActivities();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Docente"
        title="Actividades y Tareas"
        description="Crea y gestiona actividades o tareas para tus grupos asignados."
      />

      <FeedbackBanner error={error} success={success} onDismiss={handlers.onDismissFeedback} />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Mis asignaciones</h3>
            <p className="text-xs text-slate-500">
              {loading ? 'Cargando…' : `${activities.length} registro${activities.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handlers.onRefresh} disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={handlers.onOpenCreate}
              disabled={groups.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <Plus className="size-4" />
              Nueva
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:grid-cols-2">
          <select
            value={filterGroupId}
            onChange={(e) => handlers.onFilterGroup(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Todos mis grupos</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>#{g.id} · {g.subject_nombre}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterFecha}
            onChange={(e) => handlers.onFilterFecha(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            aria-label="Filtrar por fecha de entrega"
          />
        </div>

        {!loading && groups.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            Aún no tienes grupos asignados. Pide al administrador que te asigne como profesor de un grupo.
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Título</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Grupo / Materia</th>
                <th className="px-5 py-3">Entrega</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">Cargando…</td></tr>
              )}
              {!loading && activities.length === 0 && groups.length > 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No hay actividades con estos filtros.</td></tr>
              )}
              {!loading && activities.map((activity) => (
                <tr key={activity.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{activity.titulo}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand-700 ring-1 ring-brand-100">
                      {activity.tipo}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    #{activity.group_id} · {activity.subject_nombre}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{activity.fecha_entrega}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => handlers.onOpenEdit(activity)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                        <Pencil className="size-3.5" /> Editar
                      </button>
                      <button type="button" onClick={() => handlers.onDelete(activity)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                        <Trash2 className="size-3.5" /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ActivityFormModal
        open={isModalOpen}
        editing={editing}
        form={form}
        fieldErrors={fieldErrors}
        groups={groups}
        saving={saving}
        onClose={handlers.onCloseModal}
        onChange={handlers.onFormChange}
        onSubmit={handlers.onSubmit}
      />
    </div>
  );
}

export default TeacherActivitiesView;
