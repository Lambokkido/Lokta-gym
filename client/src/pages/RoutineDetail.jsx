import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoutineDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [routine, setRoutine] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completedMsg, setCompletedMsg] = useState('');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routineRes, exercisesRes] = await Promise.all([
          fetch(`/api/routines/${id}`, { headers: authHeaders }),
          fetch(`/api/exercises`, { headers: authHeaders }),
        ]);

        if (!routineRes.ok) throw new Error('Rutina no encontrada');
        if (!exercisesRes.ok) throw new Error('Error al cargar ejercicios');

        setRoutine(await routineRes.json());
        setAllExercises(await exercisesRes.json());
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const exerciseIds = routine?.exercises.map((e) => e._id) ?? [];

  const handleAdd = async (exercise) => {
    const updated = [...exerciseIds, exercise._id];
    try {
      const res = await fetch(`/api/routines/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ exercises: updated }),
      });
      if (!res.ok) throw new Error('No se pudo agregar el ejercicio');
      const data = await res.json();
      setRoutine(data);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleRemove = async (exerciseId) => {
    const updated = exerciseIds.filter((eid) => eid !== exerciseId);
    try {
      const res = await fetch(`/api/routines/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ exercises: updated }),
      });
      if (!res.ok) throw new Error('No se pudo eliminar el ejercicio');
      const data = await res.json();
      setRoutine(data);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ routineId: id }),
      });
      if (!res.ok) throw new Error('No se pudo registrar');
      setCompletedMsg('¡Entrenamiento registrado!');
      setTimeout(() => setCompletedMsg(''), 3000);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCompleting(false);
    }
  };

  const filteredExercises = allExercises.filter(
    (ex) =>
      !exerciseIds.includes(ex._id) &&
      (ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.targetMuscle.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-gray-400">Cargando rutina...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-red-400">{loadError}</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/routines')} className="text-gray-400 hover:text-white transition-colors">
            ← Volver
          </button>
          <h2 className="text-3xl font-bold">
            <span className="text-emerald-400">{routine.name}</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {completedMsg && (
            <span className="text-emerald-400 text-sm font-medium">{completedMsg}</span>
          )}
          <button
            onClick={handleComplete}
            disabled={completing || routine.exercises.length === 0}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
          >
            {completing ? 'Registrando...' : '✓ Completar rutina'}
          </button>
        </div>
      </div>

      {actionError && (
        <p className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 mb-6 text-sm">
          {actionError}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Ejercicios en la rutina */}
        <section>
          <h3 className="text-lg font-semibold mb-4">
            Ejercicios en esta rutina{' '}
            <span className="text-gray-400 font-normal text-sm">({routine.exercises.length})</span>
          </h3>

          {routine.exercises.length === 0 ? (
            <p className="text-gray-500 text-sm">Todavía no hay ejercicios. ¡Agregá uno desde la derecha!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {routine.exercises.map((ex) => (
                <div key={ex._id} className="bg-gray-800 rounded-xl flex items-center gap-4 p-3">
                  {ex.gifUrl && (
                    <img src={ex.gifUrl} alt={ex.name} className="w-14 h-14 object-cover rounded-lg bg-gray-700" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium capitalize truncate">{ex.name}</p>
                    <p className="text-gray-400 text-sm capitalize">{ex.targetMuscle}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(ex._id)}
                    className="text-red-400 hover:text-white hover:bg-red-500 border border-red-500/40 px-3 py-1 rounded-lg text-sm transition-colors shrink-0"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Buscador para agregar ejercicios */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Agregar ejercicios</h3>
          <input
            type="text"
            placeholder="Buscar por nombre o músculo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 mb-4"
          />

          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {filteredExercises.slice(0, 30).map((ex) => (
              <div key={ex._id} className="bg-gray-800 rounded-xl flex items-center gap-4 p-3">
                {ex.gifUrl && (
                  <img src={ex.gifUrl} alt={ex.name} className="w-14 h-14 object-cover rounded-lg bg-gray-700" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium capitalize truncate">{ex.name}</p>
                  <p className="text-gray-400 text-sm capitalize">{ex.targetMuscle}</p>
                </div>
                <button
                  onClick={() => handleAdd(ex)}
                  className="text-emerald-400 hover:text-white hover:bg-emerald-500 border border-emerald-500/40 px-3 py-1 rounded-lg text-sm transition-colors shrink-0"
                >
                  + Agregar
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
