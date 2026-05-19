'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles = null, requiredRole = null }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/');
      } else if (requiredRole && user.role !== requiredRole) {
        // backward-compat: if requiredRole is provided, enforce it
        router.push('/');
      }
    }
  }, [user, loading, requiredRole, allowedRoles, router]);

  if (loading) {
    return (
      <main className="container relative min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <p className="text-slate-400">Cargando...</p>
        </div>
      </main>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role)) || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return children;
}
