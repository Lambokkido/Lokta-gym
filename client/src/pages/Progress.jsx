import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Progress() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs', { headers: authHeaders });
        if (!res.ok) throw new Error('No se pudo cargar el historial');
        setLogs(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/logs/${id}`, { method: 'DELETE', headers: authHeaders });
      setLogs((prev) => prev.filter((l) => l._id !== id));
    } catch {
      setError('No se pudo eliminar el registro');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-gray-400">Cargando historial...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold mb-2">
        Mi <span className="text-emerald-400">Progreso</span>
      </h2>
      <p className="text-gray-400 mb-8">
        {logs.length === 0
          ? 'Todavía no registraste ningún entrenamiento.'
          : `${logs.length} entrenamientos registrados`}
      </p>

      {error && (
        <p className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 mb-6 text-sm">
          {error}
        </p>
      )}

      {/* Estadística rápida */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-5 text-center">
            <p className="text-4xl font-black text-emerald-400">{logs.length}</p>
            <p className="text-gray-400 text-sm mt-1">Entrenamientos totales</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 text-center">
            <p className="text-4xl font-black text-emerald-400">
              {new Set(logs.map((l) => l.routine?._id)).size}
            </p>
            <p className="text-gray-400 text-sm mt-1">Rutinas distintas</p>
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="flex flex-col gap-4">
        {logs.map((log) => (
          <div key={log._id} className="bg-gray-800 rounded-xl px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white">{log.routine?.name ?? 'Rutina eliminada'}</p>
              <p className="text-gray-400 text-sm capitalize">{formatDate(log.createdAt)}</p>
              {log.notes && <p className="text-gray-500 text-sm mt-1 italic">"{log.notes}"</p>}
            </div>
            <button
              onClick={() => handleDelete(log._id)}
              className="text-red-400 hover:text-white hover:bg-red-500 border border-red-500/40 px-3 py-1 rounded-lg text-sm transition-colors shrink-0"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
