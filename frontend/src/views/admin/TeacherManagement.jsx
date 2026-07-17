import { Pencil, UserMinus, UserPlus, RefreshCw, Search, X } from 'lucide-react';
import { useTeacherManagement } from '../../controllers/hooks/useTeacherManagement';
import {
  AdminPageHero,
  FeedbackBanner,
  FieldError,
  inputClass,
  inputErrorClass,
} from './shared/AdminUi';

function TeacherFormModal({
  open,
  editing,
  form,
  fieldErrors,
  eligibleUsers,
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
              {isEdit ? 'Editar profesor' : 'Nuevo profesor'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Asocia un usuario con rol Profesor y su número de empleado.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="teacher-user" className="mb-1.5 block text-sm font-medium text-slate-700">
              Usuario
            </label>
            <select
              id="teacher-user"
              value={form.user_id}
              onChange={(e) => onChange('user_id', e.target.value)}
              className={fieldErrors.user_id ? inputErrorClass : inputClass}
            >
              <option value="">Selecciona un usuario</option>
              {eligibleUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre} ({user.correo})
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.user_id} />
          </div>

          <div>
            <label htmlFor="teacher-emp" className="mb-1.5 block text-sm font-medium text-slate-700">
              Número de empleado
            </label>
            <input
              id="teacher-emp"
              type="text"
              value={form.numero_empleado}
              onChange={(e) => onChange('numero_empleado', e.target.value)}
              className={fieldErrors.numero_empleado ? inputErrorClass : inputClass}
              placeholder="DOC-001"
            />
            <FieldError message={fieldErrors.numero_empleado} />
          </div>

          <div>
            <label htmlFor="teacher-esp" className="mb-1.5 block text-sm font-medium text-slate-700">
              Especialidad
            </label>
            <input
              id="teacher-esp"
              type="text"
              value={form.especialidad}
              onChange={(e) => onChange('especialidad', e.target.value)}
              className={inputClass}
              placeholder="Ej. Matemáticas"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear profesor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeacherManagement() {
  const {
    teachers,
    eligibleUsers,
    loading,
    saving,
    error,
    success,
    isModalOpen,
    editing,
    form,
    fieldErrors,
    filters,
    handlers,
  } = useTeacherManagement();

  const hasFilters = Boolean(filters.search || filters.status);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Académico"
        title="Gestión de Profesores"
        description="Vincula usuarios docentes con su número de empleado y especialidad."
      />

      <FeedbackBanner
        error={error}
        success={success}
        onDismiss={handlers.onDismissFeedback}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Profesores registrados</h3>
            <p className="text-xs text-slate-500">
              {loading ? 'Cargando…' : `${teachers.length} profesor${teachers.length === 1 ? '' : 'es'}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlers.onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={handlers.onOpenCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <UserPlus className="size-4" />
              Nuevo profesor
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => handlers.onFilterChange('search', e.target.value)}
              placeholder="Buscar por nombre, correo, empleado o especialidad…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => handlers.onFilterChange('status', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={handlers.onClearFilters}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Empleado</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Especialidad</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Cargando profesores…
                  </td>
                </tr>
              )}
              {!loading && teachers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    {hasFilters
                      ? 'No hay profesores que coincidan con los filtros.'
                      : 'No hay profesores registrados.'}
                  </td>
                </tr>
              )}
              {!loading &&
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{teacher.id}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{teacher.numero_empleado}</td>
                    <td className="px-5 py-3.5 text-slate-700">{teacher.nombre}</td>
                    <td className="px-5 py-3.5 text-slate-600">{teacher.especialidad || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={[
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          teacher.is_active
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
                        ].join(' ')}
                      >
                        {teacher.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlers.onOpenEdit(teacher)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="size-3.5" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handlers.onDeactivate(teacher)}
                          disabled={!teacher.is_active}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                        >
                          <UserMinus className="size-3.5" />
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <TeacherFormModal
        open={isModalOpen}
        editing={editing}
        form={form}
        fieldErrors={fieldErrors}
        eligibleUsers={eligibleUsers}
        saving={saving}
        onClose={handlers.onCloseModal}
        onChange={handlers.onFormChange}
        onSubmit={handlers.onSubmit}
      />
    </div>
  );
}

export default TeacherManagement;
