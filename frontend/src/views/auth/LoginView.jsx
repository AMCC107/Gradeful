import './LoginView.css';

function LoginView({
  email,
  password,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <section className="login">
      <form className="login__form" onSubmit={onSubmit} noValidate>
        <header className="login__header">
          <h1 className="login__title">Iniciar sesión</h1>
          <p className="login__subtitle">Bienvenido de vuelta a Gradeful</p>
        </header>

        <div className="login__field">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="login__field">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
          />
        </div>

        {error && (
          <p className="login__error" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="login__submit"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </section>
  );
}

export default LoginView;
