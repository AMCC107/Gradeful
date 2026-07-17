import { Pencil, UserMinus, UserPlus, RefreshCw, X, Search } from 'lucide-react';
import { useUserManagement } from '../../controllers/hooks/useUserManagement';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20';

const inputErrorClass =
  'w-full rounded-xl border border-red-300 bg-red-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-400/20';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}

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

function UserFormModal({
  open,
  editingUser,
  form,
  fieldErrors,
  roles,
  saving,
  onClose,
  onChange,
  onSubmit,
}) {
  if (!open) return null;

  const isEdit = Boolean(editingUser);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="user-modal-title" className="text-lg font-semibold text-slate-900">
              {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isEdit
                ? 'Actualiza los datos del usuario. Deja la contraseña vacía para no cambiarla.'
                : 'Completa los datos para registrar un nuevo usuario.'}
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

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="user-nombre" className="mb-1.5 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="user-nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => onChange('nombre', e.target.value)}
              className={fieldErrors.nombre ? inputErrorClass : inputClass}
              placeholder="Nombre completo"
              aria-invalid={Boolean(fieldErrors.nombre)}
            />
            <FieldError message={fieldErrors.nombre} />
          </div>

          <div>
            <label htmlFor="user-correo" className="mb-1.5 block text-sm font-medium text-slate-700">
              Correo
            </label>
            <input
              id="user-correo"
              type="email"
              value={form.correo}
              onChange={(e) => onChange('correo', e.target.value)}
              className={fieldErrors.correo ? inputErrorClass : inputClass}
              placeholder="correo@ejemplo.com"
              aria-invalid={Boolean(fieldErrors.correo)}
            />
            <FieldError message={fieldErrors.correo} />
          </div>

          <div>
            <label htmlFor="user-role" className="mb-1.5 block text-sm font-medium text-slate-700">
              Rol
            </label>
            <select
              id="user-role"
              value={form.role_id}
              onChange={(e) => onChange('role_id', e.target.value)}
              className={fieldErrors.role_id ? inputErrorClass : inputClass}
              aria-invalid={Boolean(fieldErrors.role_id)}
            >
              <option value="">Selecciona un rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nombre}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.role_id} />
          </div>

          <div>
            <label htmlFor="user-password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Contraseña {isEdit && <span className="font-normal text-slate-400">(opcional)</span>}
            </label>
            <input
              id="user-password"
              type="password"
              value={form.contraseña}
              onChange={(e) => onChange('contraseña', e.target.value)}
              className={fieldErrors.contraseña ? inputErrorClass : inputClass}
              placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
              autoComplete="new-password"
              aria-invalid={Boolean(fieldErrors.contraseña)}
            />
            <FieldError message={fieldErrors.contraseña} />
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
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserManagement() {
  const {
    users,
    roles,
    loading,
    saving,
    error,
    success,
    isModalOpen,
    editingUser,
    form,
    fieldErrors,
    filters,
    handlers,
  } = useUserManagement();

  const hasActiveFilters = Boolean(filters.search || filters.role || filters.status);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-lg shadow-brand-600/20">
        <p className="mb-1 text-sm font-medium text-brand-100">Administración</p>
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <p className="mt-1 text-sm text-brand-200">
          Crea, edita y desactiva cuentas del sistema (soft delete).
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
            <h3 className="text-sm font-semibold text-slate-900">Usuarios registrados</h3>
            <p className="text-xs text-slate-500">
              {loading ? 'Cargando…' : `${users.length} usuario${users.length === 1 ? '' : 's'}`}
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
              <UserPlus className="size-4" />
              Nuevo usuario
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => handlers.onFilterChange('search', e.target.value)}
              placeholder="Buscar por nombre o correo…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              aria-label="Buscar usuarios"
            />
          </div>

          <div>
            <select
              value={filters.role}
              onChange={(e) => handlers.onFilterChange('role', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              aria-label="Filtrar por rol"
            >
              <option value="">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => handlers.onFilterChange('status', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            {hasActiveFilters && (
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
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Correo</th>
                <th className="px-5 py-3">Rol</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Cargando usuarios…
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    {hasActiveFilters
                      ? 'No hay usuarios que coincidan con los filtros.'
                      : 'No hay usuarios registrados. Crea el primero con «Nuevo usuario».'}
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{user.id}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{user.nombre}</td>
                    <td className="px-5 py-3.5 text-slate-600">{user.correo}</td>
                    <td className="px-5 py-3.5 text-slate-600">{user.role_nombre || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={[
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          user.is_active
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
                        ].join(' ')}
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlers.onOpenEdit(user)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="size-3.5" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handlers.onDeactivate(user)}
                          disabled={!user.is_active}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
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

      <UserFormModal
        open={isModalOpen}
        editingUser={editingUser}
        form={form}
        fieldErrors={fieldErrors}
        roles={roles}
        saving={saving}
        onClose={handlers.onCloseModal}
        onChange={handlers.onFormChange}
        onSubmit={handlers.onSubmit}
      />
    </div>
  );
}

export default UserManagement;
