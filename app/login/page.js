'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AlertCircle, Loader2, Lock, LogIn, ShieldCheck, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(username, password);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.message);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <main className="container relative min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <p className="text-slate-400">Verificando sesion...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container relative min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-card">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
              <ShieldCheck size={32} className="text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold m-0">QR Scanner</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="h-12 w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contrasena"
                  className="h-12 w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                  disabled={submitting}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl flex items-center gap-3 text-sm bg-red-500/10 text-red-400 border border-red-500/20 animate-in fade-in">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !username || !password}
              className="h-12 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 mt-6"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              Ingresar
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center">Sistema de validacion QR</p>
          </div>
        </div>
      </div>
    </main>
  );
}
