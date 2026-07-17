import { RefreshCw, Save, UserRound, X } from 'lucide-react';
import { useUserProfile } from '../../controllers/hooks/useUserProfile';

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

function UserProfile() {
  const { profile, form, loading, saving, error, success, handlers } = useUserProfile();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-lg shadow-brand-600/20">
        <p className="mb-1 text-sm font-medium text-brand-100">Cuenta</p>
        <h2 className="text-2xl font-bold">Mi Perfil</h2>
        <p className="mt-1 text-sm text-brand-200">
          Consulta y actualiza tu información personal.
        </p>
      </div>

      <FeedbackBanner
        error={error}
        success={success}
        onDismiss={handlers.onDismissFeedback}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <UserRound className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Información personal</h3>
              <p className="text-xs text-slate-500">
                {profile
                  ? `Rol: ${profile.role_nombre || '—'} · ID ${profile.id}`
                  : 'Cargando datos…'}
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

        <div className="p-5">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Cargando perfil…</p>
          ) : (
            <form onSubmit={handlers.onSubmit} className="mx-auto max-w-xl space-y-4">
              <div>
                <label htmlFor="profile-nombre" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  id="profile-nombre"
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => handlers.onFormChange('nombre', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label htmlFor="profile-correo" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Correo
                </label>
                <input
                  id="profile-correo"
                  type="email"
                  required
                  value={form.correo}
                  onChange={(e) => handlers.onFormChange('correo', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label htmlFor="profile-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nueva contraseña <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <input
                  id="profile-password"
                  type="password"
                  value={form.contraseña}
                  onChange={(e) => handlers.onFormChange('contraseña', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Dejar vacío para no cambiar"
                  autoComplete="new-password"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
                >
                  <Save className="size-4" />
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
