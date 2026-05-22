'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Plus, Power, Key, Loader2 } from 'lucide-react';

function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', role: 'scanner' });
  const [status, setStatus] = useState({ type: '', message: '' });

  const fetchUsers = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers({ showLoading: false });
  }, [fetchUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: data.message });
        setForm({ username: '', password: '', role: 'scanner' });
        fetchUsers();
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch (e) {
      setStatus({ type: 'error', message: 'Error de conexión' });
    }
  };

  const handleToggleActive = async (username, isActive) => {
    const action = isActive ? 'inactivar' : 'activar';
    if (!confirm(`${action === 'activar' ? 'Activar' : 'Inactivar'} usuario ${username}?`)) return;
    try {
      const res = await fetch(`/api/users?username=${encodeURIComponent(username)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !isActive })
      });
      const data = await res.json();
      if (data.success) fetchUsers();
    } catch (e) { console.error(e); }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Header />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Crear / Actualizar Usuario</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Usuario</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full p-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Contraseña</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full p-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Rol</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full p-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white">
                <option value="scanner">scanner (solo escanear)</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2">
              <Plus /> Guardar
            </button>

            {status.message && (
              <div className={`p-3 rounded mt-2 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {status.message}
              </div>
            )}
          </form>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Usuarios</h2>
          {loading ? (
            <div className="flex items-center gap-2"><Loader2 className="animate-spin"/> Cargando...</div>
          ) : (
            <div className="divide-y divide-white/5">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-mono text-white font-bold">{u.username}</div>
                    <div className="text-xs text-slate-400">{u.role} • {u.active ? 'Activo' : 'Inactivo'} • {new Date(u.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        const p = prompt('Nueva contraseña para ' + u.username);
                        if (!p) return;
                        try {
                          const res = await fetch('/api/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: u.username, password: p, role: u.role, active: u.active })
                          });
                          const data = await res.json();
                          if (data.success) {
                            fetchUsers();
                          } else {
                            console.error('Error updating password:', data.message);
                          }
                        } catch (error) {
                          console.error('Error updating password:', error);
                        }
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Key />
                    </button>
                    <button onClick={() => handleToggleActive(u.username, u.active)} className={`p-2 rounded-lg bg-slate-800 hover:bg-slate-700 ${u.active ? 'text-yellow-300' : 'text-emerald-300'}`} title={u.active ? 'Inactivar' : 'Activar'}>
                      <Power />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <UsersAdmin />
    </ProtectedRoute>
  );
}
