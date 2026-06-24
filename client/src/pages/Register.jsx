import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    else if (formData.name.trim().length < 2) newErrors.name = 'El nombre debe tener al menos 2 caracteres';

    if (!formData.email) newErrors.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El email no es válido';

    if (!formData.password) newErrors.password = 'La contraseña es obligatoria';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirmá tu contraseña';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

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
      await register(formData.name, formData.email, formData.password);
      navigate('/exercises');
    } catch (err) {
      setServerError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `bg-gray-800 border rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors ${
      errors[field] ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-emerald-500'
    }`;

  return (
    <main
      className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80')" }}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl my-8">

        {/* Logo */}
        <Link to="/" className="block text-center mb-6">
          <span className="font-black text-2xl tracking-wide">
            LOKTA<span className="text-emerald-400">GYM</span>
          </span>
        </Link>

        <h2 className="text-xl font-bold mb-1 text-center">Crear cuenta</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Empezá tu entrenamiento hoy</p>

        {serverError && (
          <p className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 mb-4 text-sm">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm text-gray-400">Nombre completo</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Juan Pérez"
              className={inputClass('name')}
            />
            {errors.name && <p className="text-red-400 text-xs mt-0.5">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-400">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className={inputClass('email')}
            />
            {errors.email && <p className="text-red-400 text-xs mt-0.5">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-400">
              Contraseña <span className="text-gray-500">(mínimo 6 caracteres)</span>
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={inputClass('password')}
            />
            {errors.password && <p className="text-red-400 text-xs mt-0.5">{errors.password}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-sm text-gray-400">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={inputClass('confirmPassword')}
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-0.5">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold transition-colors mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando cuenta...
              </>
            ) : 'Crear cuenta'}
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
