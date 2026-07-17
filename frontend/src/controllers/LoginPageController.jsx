import { useLoginController } from './hooks/useLoginController';
import LoginView from '../views/auth/LoginView';

function LoginPageController() {
  const { form, handlers, showDemoButtons } = useLoginController();

  return (
    <div className="relative">
      <LoginView
        email={form.email}
        password={form.password}
        isLoading={form.isLoading}
        error={form.error}
        onEmailChange={handlers.onEmailChange}
        onPasswordChange={handlers.onPasswordChange}
        onSubmit={handlers.onSubmit}
      />

      {showDemoButtons && (
        <div className="fixed bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          <button
            type="button"
            onClick={handlers.onDemoStudent}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-brand-500 hover:text-brand-600"
          >
            Demo Estudiante (Rol 3)
          </button>
          <button
            type="button"
            onClick={handlers.onDemoPadre}
            className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-medium text-emerald-600 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700"
          >
            Demo Padre (Rol 2)
          </button>
          <button
            type="button"
            onClick={handlers.onDemoAdmin}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-brand-500 hover:text-brand-600"
          >
            Demo Director (Rol 1)
          </button>
          <button
            type="button"
            onClick={handlers.onDemoTeacher}
            className="rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-medium text-amber-700 shadow-sm transition hover:border-amber-500 hover:text-amber-800"
          >
            Demo Profesor (Rol 4)
          </button>
        </div>
      )}
    </div>
  );
}

export default LoginPageController;
