import { useState } from 'react';
import Login from './components/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
    // Con react-router-dom: navigate('/dashboard')
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <section className="welcome">
      <h1>¡Bienvenido{user?.email ? `, ${user.email}` : ''}!</h1>
      <p>Has iniciado sesión correctamente.</p>
      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </section>
  );
}

export default App;
