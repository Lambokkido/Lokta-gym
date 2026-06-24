import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CoachDashboard() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [routineName, setRoutineName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', { headers: authHeaders });
        if (!res.ok) throw new Error('No se pudieron cargar los usuarios');
        const data = await res.json();
        setUsers(data.filter((u) => u.role === 'user'));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUser || !routineName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/routines', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: routineName.trim(), userId: selectedUser }),
      });
      if (!res.ok) throw new Error('No se pudo crear la rutina');
      setRoutineName('');
      setSelectedUser(null);
      setSuccessMsg('Rutina asignada correctamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-gray-400">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold mb-2">
        Dashboard de <span className="text-emerald-400">Coach</span>
      </h2>
      <p className="text-gray-400 mb-8">Asigná rutinas a tus alumnos.</p>

      {error && (
        <p className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 mb-6 text-sm">
          {error}
        </p>
      )}
      {successMsg && (
        <p className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg px-4 py-2 mb-6 text-sm">
          {successMsg}
        </p>
      )}

      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-5">Crear rutina para un alumno</h3>
        <form onSubmit={handleAssign} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Alumno</label>
            <select
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
              className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Seleccioná un alumno</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Nombre de la rutina</label>
            <input
              type="text"
              placeholder="Ej: Push Day - Principiante"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              required
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition-colors mt-2"
          >
            {creating ? 'Asignando...' : 'Asignar rutina'}
          </button>
        </form>
      </div>

      {/* Lista de alumnos */}
      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-4">Alumnos ({users.length})</h3>
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div key={u._id} className="bg-gray-800 rounded-xl px-5 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-gray-400 text-sm">{u.email}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${
                u.activeMembership
                  ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10'
                  : 'text-gray-500 border-gray-600'
              }`}>
                {u.activeMembership ? 'Membresía activa' : 'Sin membresía'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
