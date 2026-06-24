import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Routines() {
  const { token } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const res = await fetch('/api/routines', { headers: authHeaders });
      if (!res.ok) throw new Error('No se pudieron cargar las rutinas');
      const data = await res.json();
      setRoutines(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/routines', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error('No se pudo crear la rutina');
      const created = await res.json();
      setRoutines((prev) => [...prev, created]);
      setNewName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/routines/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('No se pudo eliminar la rutina');
      setRoutines((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRename = async (id, currentName) => {
    const name = window.prompt('Nuevo nombre:', currentName);
    if (!name || name.trim() === currentName) return;
    try {
      const res = await fetch(`/api/routines/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar la rutina');
      const updated = await res.json();
      setRoutines((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-gray-400 text-lg">Cargando rutinas...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold mb-8">
        Mis <span className="text-emerald-400">Rutinas</span>
      </h2>

      {error && (
        <p className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 mb-6 text-sm">
          {error}
        </p>
      )}

      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Nombre de la nueva rutina"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
        >
          {creating ? 'Creando...' : 'Crear'}
        </button>
      </form>

      {routines.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No tenés rutinas todavía.</p>
          <p className="text-sm mt-1">¡Creá una arriba para empezar!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {routines.map((routine) => (
            <div
              key={routine._id}
              className="bg-gray-800 rounded-xl px-6 py-4 flex items-center justify-between"
            >
              <Link to={`/routines/${routine._id}`} className="flex-1 hover:text-emerald-400 transition-colors">
                <h3 className="font-semibold">{routine.name}</h3>
                <p className="text-gray-400 text-sm">
                  {routine.exercises.length} ejercicio{routine.exercises.length !== 1 ? 's' : ''} — Ver detalle →
                </p>
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRename(routine._id, routine.name)}
                  className="text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Renombrar
                </button>
                <button
                  onClick={() => handleDelete(routine._id)}
                  className="text-sm text-red-400 hover:text-white hover:bg-red-500 border border-red-500/40 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
