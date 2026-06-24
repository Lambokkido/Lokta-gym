import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/exercises');
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h2>

        {error && (
          <p className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 mb-4 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm text-gray-400">Nombre</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-400">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-400">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-semibold transition-colors mt-2"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
