import { Pencil, Plus, RefreshCw, X, Shield } from 'lucide-react';
import { useRoleManagement } from '../../controllers/hooks/useRoleManagement';

function FeedbackBanner({ error, success, onDismiss }) {
  if (!error && !success) return null;

  const isError = Boolean(error);
  return (
    <div
      className={[
        'flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm',
        isError
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700',
      ].join(' ')}
      role="status"
    >
      <p>{error || success}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100"
        aria-label="Cerrar aviso"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function RoleFormModal({
  open,
  editingRole,
  form,
  permissions,
  saving,
  onClose,
  onChange,
  onTogglePermission,
  onSubmit,
}) {
  if (!open) return null;

  const isEdit = Boolean(editingRole);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="role-modal-title" className="text-lg font-semibold text-slate-900">
              {isEdit ? 'Editar rol' : 'Nuevo rol'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Define el nombre y asigna permisos de forma dinámica.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="role-nombre" className="mb-1.5 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="role-nombre"
              type="text"
              required
              value={form.nombre}
              onChange={(e) => onChange('nombre', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
              placeholder="Ej. Coordinador académico"
            />
          </div>

          <div>
            <label htmlFor="role-desc" className="mb-1.5 block text-sm font-medium text-slate-700">
              Descripción
            </label>
            <textarea
              id="role-desc"
              rows={2}
              value={form.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
              placeholder="Breve descripción del rol"
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">Permisos</legend>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              {permissions.length === 0 && (
                <p className="text-sm text-slate-500">No hay permisos disponibles.</p>
              )}
              {permissions.map((permission) => {
                const checked = form.permissionIds.includes(permission.id);
                return (
                  <label
                    key={permission.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onTogglePermission(permission.id)}
                      className="mt-0.5 size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800">
                        {permission.nombre}
                      </span>
                      {permission.descripcion && (
                        <span className="block text-xs text-slate-500">{permission.descripcion}</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

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
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleManagement() {
  const {
    roles,
    permissions,
    loading,
    saving,
    error,
    success,
    isModalOpen,
    editingRole,
    form,
    handlers,
  } = useRoleManagement();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-lg shadow-brand-600/20">
        <p className="mb-1 text-sm font-medium text-brand-100">Administración</p>
        <h2 className="text-2xl font-bold">Gestión de Roles</h2>
        <p className="mt-1 text-sm text-brand-200">
          Administra roles y asigna permisos de forma dinámica (RBAC).
        </p>
      </div>

      <FeedbackBanner
        error={error}
        success={success}
        onDismiss={handlers.onDismissFeedback}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Roles del sistema</h3>
            <p className="text-xs text-slate-500">
              {loading ? 'Cargando…' : `${roles.length} rol${roles.length === 1 ? '' : 'es'}`}
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              <Plus className="size-4" />
              Nuevo rol
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Rol</th>
                <th className="px-5 py-3">Descripción</th>
                <th className="px-5 py-3">Permisos</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    Cargando roles…
                  </td>
                </tr>
              )}

              {!loading && roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    No hay roles registrados.
                  </td>
                </tr>
              )}

              {!loading &&
                roles.map((role) => (
                  <tr
                    key={role.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{role.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <Shield className="size-4 text-brand-600" />
                        {role.nombre}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {role.descripcion || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(role.permissions || []).length === 0 && (
                          <span className="text-xs text-slate-400">Sin permisos</span>
                        )}
                        {(role.permissions || []).slice(0, 4).map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 ring-1 ring-brand-100"
                          >
                            {p.nombre}
                          </span>
                        ))}
                        {(role.permissions || []).length > 4 && (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            +{role.permissions.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handlers.onOpenEdit(role)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="size-3.5" />
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <RoleFormModal
        open={isModalOpen}
        editingRole={editingRole}
        form={form}
        permissions={permissions}
        saving={saving}
        onClose={handlers.onCloseModal}
        onChange={handlers.onFormChange}
        onTogglePermission={handlers.onTogglePermission}
        onSubmit={handlers.onSubmit}
      />
    </div>
  );
}

export default RoleManagement;
