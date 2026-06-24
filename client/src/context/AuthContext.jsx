import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Proveedor global de autenticación — envuelve toda la app en main.jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Al montar, recupera la sesión guardada en localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('lokta_token');
    const storedUser = localStorage.getItem('lokta_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Llama al endpoint de login, guarda el token y el usuario en estado y localStorage
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('lokta_token', data.token);
    localStorage.setItem('lokta_user', JSON.stringify(data.user));
  };

  // Llama al endpoint de registro y autentica automáticamente al nuevo usuario
  const register = async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('lokta_token', data.token);
    localStorage.setItem('lokta_user', JSON.stringify(data.user));
  };

  // Limpia el estado y localStorage al cerrar sesión
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lokta_token');
    localStorage.removeItem('lokta_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de conveniencia para consumir el contexto en cualquier componente
export const useAuth = () => useContext(AuthContext);
