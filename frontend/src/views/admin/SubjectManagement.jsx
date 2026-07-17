import { Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useSubjectManagement } from '../../controllers/hooks/useSubjectManagement';
import {
  AdminPageHero,
  FeedbackBanner,
  FieldError,
  inputClass,
  inputErrorClass,
} from './shared/AdminUi';

function SubjectFormModal({
  open,
  editing,
  form,
  fieldErrors,
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
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit ? 'Editar materia' : 'Nueva materia'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              El nombre debe ser único en el catálogo.
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
            <label htmlFor="subject-nombre" className="mb-1.5 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="subject-nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => onChange('nombre', e.target.value)}
              className={fieldErrors.nombre ? inputErrorClass : inputClass}
              placeholder="Ej. Álgebra"
            />
            <FieldError message={fieldErrors.nombre} />
          </div>

          <div>
            <label htmlFor="subject-desc" className="mb-1.5 block text-sm font-medium text-slate-700">
              Descripción
            </label>
            <textarea
              id="subject-desc"
              rows={3}
              value={form.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              className={inputClass}
              placeholder="Descripción opcional"
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
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear materia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubjectManagement() {
  const {
    subjects,
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
  } = useSubjectManagement();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHero
        eyebrow="Académico"
        title="Gestión de Materias"
        description="Catálogo de materias del plan de estudios."
      />

      <FeedbackBanner
        error={error}
        success={success}
        onDismiss={handlers.onDismissFeedback}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Materias</h3>
            <p className="text-xs text-slate-500">
              {loading ? 'Cargando…' : `${subjects.length} materia${subjects.length === 1 ? '' : 's'}`}
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
              <Plus className="size-4" />
              Nueva materia
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
              placeholder="Buscar materia…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Descripción</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                    Cargando materias…
                  </td>
                </tr>
              )}
              {!loading && subjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                    {search ? 'Sin resultados.' : 'No hay materias registradas.'}
                  </td>
                </tr>
              )}
              {!loading &&
                subjects.map((subject) => (
                  <tr key={subject.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{subject.id}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{subject.nombre}</td>
                    <td className="px-5 py-3.5 text-slate-600">{subject.descripcion || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlers.onOpenEdit(subject)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="size-3.5" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handlers.onDelete(subject)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <SubjectFormModal
        open={isModalOpen}
        editing={editing}
        form={form}
        fieldErrors={fieldErrors}
        saving={saving}
        onClose={handlers.onCloseModal}
        onChange={handlers.onFormChange}
        onSubmit={handlers.onSubmit}
      />
    </div>
  );
}

export default SubjectManagement;
