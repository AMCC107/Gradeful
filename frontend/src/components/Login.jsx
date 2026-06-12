import { useState } from 'react';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message || 'No se pudo iniciar sesión. Inténtalo de nuevo.'
        );
      }

      if (data?.token) {

        localStorage.setItem('authToken', data.token);
      }

      setEmail('');
      setPassword('');

      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(data?.user ?? null);
      }
    } catch (err) {
      setError(
        err?.message || 'Error de red. Verifica tu conexión e inténtalo otra vez.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="login">
      <form className="login__form" onSubmit={handleLogin} noValidate>
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
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
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

export default Login;
