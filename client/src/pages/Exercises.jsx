import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MUSCLES = ['chest', 'back', 'shoulders', 'upper arms', 'lower arms', 'upper legs', 'lower legs', 'waist', 'cardio', 'neck'];
const EQUIPMENT = ['barbell', 'dumbbell', 'cable', 'machine', 'body weight', 'kettlebell', 'band', 'ez barbell'];

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [muscle, setMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [rehab, setRehab] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchExercises();
  }, [muscle, equipment, rehab, token]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const hasFilter = muscle || equipment || rehab;
      let url = '/api/exercises';
      if (hasFilter) {
        const params = new URLSearchParams();
        if (muscle) params.append('muscle', muscle);
        if (equipment) params.append('equipment', equipment);
        if (rehab) params.append('rehab', 'true');
        url = `/api/exercises/filter?${params.toString()}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudieron cargar los ejercicios');
      setExercises(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setMuscle('');
    setEquipment('');
    setRehab(false);
  };

  const hasActiveFilter = muscle || equipment || rehab;

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold mb-6">
        Catálogo de <span className="text-emerald-400">Ejercicios</span>
      </h2>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-xl p-4 mb-8 flex flex-wrap items-center gap-4">
        <select
          value={muscle}
          onChange={(e) => setMuscle(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 capitalize"
        >
          <option value="">Todos los músculos</option>
          {MUSCLES.map((m) => (
            <option key={m} value={m} className="capitalize">{m}</option>
          ))}
        </select>

        <select
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
        >
          <option value="">Todo el equipamiento</option>
          {EQUIPMENT.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={rehab}
            onChange={(e) => setRehab(e.target.checked)}
            className="accent-emerald-500 w-4 h-4"
          />
          Solo rehabilitación
        </label>

        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-400 hover:text-red-300 transition-colors ml-auto"
          >
            Limpiar filtros
          </button>
        )}

        <span className="text-gray-400 text-sm ml-auto">
          {loading ? 'Cargando...' : `${exercises.length} ejercicios`}
        </span>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-400 text-lg">Cargando ejercicios...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <div key={ex._id} className="bg-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:ring-1 hover:ring-emerald-500 transition-all">
              {ex.gifUrl && (
                <img src={ex.gifUrl} alt={ex.name} className="w-full h-48 object-cover rounded-lg bg-gray-700" />
              )}
              <div>
                <h3 className="font-semibold text-white capitalize">{ex.name}</h3>
                <p className="text-gray-400 text-sm capitalize">{ex.targetMuscle}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full capitalize">
                  {ex.equipment}
                </span>
                {ex.isRehabFriendly && (
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                    Rehabilitación
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
