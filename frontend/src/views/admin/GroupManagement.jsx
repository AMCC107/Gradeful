import { Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useGroupManagement } from '../../controllers/hooks/useGroupManagement';
import {
  AdminPageHero,
  FeedbackBanner,
  FieldError,
  inputClass,
  inputErrorClass,
} from './shared/AdminUi';

function GroupFormModal({
  open,
  editing,
  form,
  fieldErrors,
  courses,
  subjects,
  teachers,
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
              {isEdit ? 'Editar grupo' : 'Nuevo grupo'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Asigna curso, materia, profesor y capacidad máxima.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="group-course">Curso</label>
            <select
              id="group-course"
              value={form.course_id}
              onChange={(e) => onChange('course_id', e.target.value)}
              className={fieldErrors.course_id ? inputErrorClass : inputClass}
            >
              <option value="">Selecciona un curso</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.nivel})</option>
              ))}
            </select>
            <FieldError message={fieldErrors.course_id} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="group-subject">Materia</label>
            <select
              id="group-subject"
              value={form.subject_id}
              onChange={(e) => onChange('subject_id', e.target.value)}
              className={fieldErrors.subject_id ? inputErrorClass : inputClass}
            >
              <option value="">Selecciona una materia</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            <FieldError message={fieldErrors.subject_id} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="group-teacher">Profesor</label>
            <select
              id="group-teacher"
              value={form.teacher_id}
              onChange={(e) => onChange('teacher_id', e.target.value)}
              className={fieldErrors.teacher_id ? inputErrorClass : inputClass}
            >
              <option value="">Selecciona un profesor</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre} — {t.numero_empleado}</option>
              ))}
            </select>
            <FieldError message={fieldErrors.teacher_id} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="group-cap">Capacidad máxima</label>
            <input
              id="group-cap"
              type="number"
              min={1}
              value={form.capacidad_maxima}
              onChange={(e) => onChange('capacidad_maxima', e.target.value)}
              className={fieldErrors.capacidad_maxima ? inputErrorClass : inputClass}
            />
            <FieldError message={fieldErrors.capacidad_maxima} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GroupManagement() {
  const {
    groups,
    courses,
    subjects,
    teachers,
    loading,
    saving,
    error,
    success,
    isModalOpen,
    editing,
    form,
    fieldErrors,
    search,
    handlers,
  } = useGroupManagement();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Académico"
        title="Gestión de Grupos"
        description="Crea grupos con curso, materia, profesor responsable y cupo máximo."
      />

      <FeedbackBanner error={error} success={success} onDismiss={handlers.onDismissFeedback} />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Grupos académicos</h3>
            <p className="text-xs text-slate-500">
              {loading ? 'Cargando…' : `${groups.length} grupo${groups.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handlers.onRefresh} disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button type="button" onClick={handlers.onOpenCreate} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              <Plus className="size-4" />
              Nuevo grupo
            </button>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => handlers.onSearchChange(e.target.value)}
              placeholder="Buscar por curso, materia o profesor…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Curso</th>
                <th className="px-5 py-3">Materia</th>
                <th className="px-5 py-3">Profesor</th>
                <th className="px-5 py-3">Cupo</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">Cargando grupos…</td></tr>
              )}
              {!loading && groups.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">{search ? 'Sin resultados.' : 'No hay grupos registrados.'}</td></tr>
              )}
              {!loading && groups.map((group) => (
                <tr key={group.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{group.id}</td>
                  <td className="px-5 py-3.5 text-slate-700">{group.course_nombre} <span className="text-slate-400">({group.course_nivel})</span></td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{group.subject_nombre}</td>
                  <td className="px-5 py-3.5 text-slate-600">{group.teacher_nombre}</td>
                  <td className="px-5 py-3.5">
                    <span className={[
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      group.cupos_disponibles > 0
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
                    ].join(' ')}>
                      {group.inscritos}/{group.capacidad_maxima}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button type="button" onClick={() => handlers.onOpenEdit(group)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                        <Pencil className="size-3.5" /> Editar
                      </button>
                      <button type="button" onClick={() => handlers.onDelete(group)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
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

      <GroupFormModal
        open={isModalOpen}
        editing={editing}
        form={form}
        fieldErrors={fieldErrors}
        courses={courses}
        subjects={subjects}
        teachers={teachers}
        saving={saving}
        onClose={handlers.onCloseModal}
        onChange={handlers.onFormChange}
        onSubmit={handlers.onSubmit}
      />
    </div>
  );
}

export default GroupManagement;
