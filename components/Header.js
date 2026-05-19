'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LogOut, User, Shield } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <header className="absolute top-6 right-6 flex items-center gap-4">
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/30 rounded-lg border border-slate-700/30 backdrop-blur-sm">
        <div className="p-1.5 bg-blue-500/20 rounded-lg">
          {user.role === 'admin' ? (
            <Shield size={16} className="text-blue-400" />
          ) : (
            <User size={16} className="text-blue-400" />
          )}
        </div>
        <div className="flex flex-col text-xs">
          <span className="text-slate-400">@{user.username}</span>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
          </span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-lg border border-red-600/20 transition-all text-xs font-medium"
      >
        <LogOut size={14} />
        Salir
      </button>
    </header>
  );
}
