import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  user: 'text-gray-400 border-gray-600',
  coach: 'text-blue-400 border-blue-500/50',
  admin: 'text-emerald-400 border-emerald-500/50',
};

export default function AdminPanel() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', { headers: authHeaders });
        if (!res.ok) throw new Error('No se pudieron cargar los usuarios');
        setUsers(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('No se pudo cambiar el rol');
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMembershipToggle = async (userId, current) => {
    try {
      const res = await fetch(`/api/users/${userId}/membership`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ activeMembership: !current }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar la membresía');
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-gray-400">Cargando usuarios...</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold mb-2">
        Panel de <span className="text-emerald-400">Administración</span>
      </h2>
      <p className="text-gray-400 mb-8">{users.length} usuarios registrados</p>

      {error && (
        <p className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 mb-6 text-sm">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <div key={u._id} className="bg-gray-800 rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white">{u.name}</p>
              <p className="text-gray-400 text-sm">{u.email}</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Membresía */}
              <button
                onClick={() => handleMembershipToggle(u._id, u.activeMembership)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  u.activeMembership
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50'
                    : 'bg-gray-700 text-gray-400 border-gray-600 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50'
                }`}
              >
                {u.activeMembership ? '✓ Membresía activa' : 'Sin membresía'}
              </button>

              {/* Rol */}
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                className={`bg-gray-700 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors ${ROLE_COLORS[u.role]}`}
              >
                <option value="user">Usuario</option>
                <option value="coach">Coach</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
