import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-0 flex items-center justify-between h-16">

      {/* Logo */}
      <Link to="/" className="flex items-center shrink-0">
        <span className="font-black text-xl tracking-wide">
          LOKTA<span className="text-emerald-400">GYM</span>
        </span>
      </Link>

      {/* Links centrales */}
      {user && (
        <div className="flex items-center gap-8">
          <Link to="/exercises" className="text-gray-300 hover:text-emerald-400 font-medium tracking-wide text-sm uppercase transition-colors">
            Ejercicios
          </Link>
          <Link to="/routines" className="text-gray-300 hover:text-emerald-400 font-medium tracking-wide text-sm uppercase transition-colors">
            Mis Rutinas
          </Link>
          <Link to="/progress" className="text-gray-300 hover:text-emerald-400 font-medium tracking-wide text-sm uppercase transition-colors">
            Progreso
          </Link>
          {(user.role === 'coach' || user.role === 'admin') && (
            <Link to="/coach" className="text-blue-400 hover:text-blue-300 font-medium tracking-wide text-sm uppercase transition-colors">
              Coach
            </Link>
          )}
          {user.role === 'admin' && (
            <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 font-medium tracking-wide text-sm uppercase transition-colors">
              Admin
            </Link>
          )}
        </div>
      )}

      {/* Derecha */}
      <div className="flex items-center gap-4 shrink-0">
        {user ? (
          <>
            <span className="text-gray-400 text-sm hidden md:block">
              Hola, <span className="text-white font-medium">{user.name.split(' ')[0]}</span>
            </span>
            <button
              onClick={handleLogout}
              className="border border-gray-600 hover:border-emerald-400 hover:text-emerald-400 text-gray-300 px-4 py-1.5 text-sm font-medium tracking-wide uppercase transition-colors"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-emerald-400 text-sm font-medium uppercase tracking-wide transition-colors">
              Iniciar sesión
            </Link>
            <Link to="/register" className="border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-gray-900 px-5 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors rounded-full">
              Registrarse
            </Link>
          </>
        )}
      </div>

    </nav>
  );
}
