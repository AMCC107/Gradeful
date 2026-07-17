import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROLES, getHomePathByRole, isPathAllowedForRole } from '../../models/roles.model';
import { saveSession, DEMO_USERS } from '../../models/auth.model';
import { loginWithCredentials } from '../../services/auth.service';

export function useLoginController() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectAfterAuth = (user) => {
    const role = user?.role ?? ROLES.STUDENT;
    const from = location.state?.from;
    const home = getHomePathByRole(role);
    const destination = from && isPathAllowedForRole(from, role) ? from : home;
    navigate(destination, { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      const { token, user } = await loginWithCredentials(email, password);
      saveSession({ token, user: user ? { ...user, role: user.role ?? ROLES.STUDENT } : null });
      setEmail('');
      setPassword('');
      redirectAfterAuth(user);
    } catch (err) {
      setError(err?.message || 'Error de red. Verifica tu conexión e inténtalo otra vez.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async (demoUser) => {
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      const { token, user } = await loginWithCredentials(demoUser.email, demoUser.password);
      saveSession({
        token,
        user: user
          ? { ...demoUser, ...user, role: user.role ?? demoUser.role }
          : demoUser,
      });
      redirectAfterAuth(user ?? demoUser);
    } catch (err) {
      const isNetwork =
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError') ||
        err?.name === 'TypeError';

      if (isNetwork) {
        saveSession({ token: 'demo-token', user: demoUser });
        navigate(getHomePathByRole(demoUser.role), { replace: true });
        setError('Backend no disponible. Entraste en modo demo local.');
      } else {
        setError(err?.message || 'No se pudo iniciar la sesión demo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form: { email, password, isLoading, error },
    handlers: {
      onEmailChange: setEmail,
      onPasswordChange: setPassword,
      onSubmit: handleSubmit,
      onDemoStudent: () => handleDemoAccess(DEMO_USERS.student),
      onDemoPadre: () => handleDemoAccess(DEMO_USERS.padre),
      onDemoAdmin: () => handleDemoAccess(DEMO_USERS.admin),
    },
    showDemoButtons: import.meta.env.DEV,
  };
}
