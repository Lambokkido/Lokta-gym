import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El email no es válido';
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/exercises');
    } catch (err) {
      setServerError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80')" }}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">

        {/* Logo */}
        <Link to="/" className="block text-center mb-6">
          <span className="font-black text-2xl tracking-wide">
            LOKTA<span className="text-emerald-400">GYM</span>
          </span>
        </Link>

        <h2 className="text-xl font-bold mb-1 text-center">Iniciar sesión</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Bienvenido de vuelta</p>

        {serverError && (
          <p className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 mb-4 text-sm">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-400">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className={`bg-gray-800 border rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-emerald-500'
              }`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-0.5">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-400">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              className={`bg-gray-800 border rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors ${
                errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-emerald-500'
              }`}
            />
            {errors.password && <p className="text-red-400 text-xs mt-0.5">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold transition-colors mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Ingresando...
              </>
            ) : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}
