"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import {
  ArrowLeft,
  History,
  Search,
  Calendar,
  Clock,
  Tag,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function InventoryContent() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 0
  });

  const fetchLogs = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams({
        page,
        limit: pagination.limit,
        search
      }).toString();
      const res = await fetch(`/api/inventory?${queryString}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            page: data.pagination.page,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchLogs(1, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchLogs]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLogs(newPage, searchTerm);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <Header />

      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-sm font-medium">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Panel Principal</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <History size={24} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold m-0 text-white">Historial de Ingresos</h1>
        </div>
      </div>

      <div className="glass-card !max-w-none !p-0 overflow-hidden border-white/5 flex flex-col h-[75vh]">
        {/* Header con Buscador */}
        <div className="p-6 bg-slate-900/40 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar en todo el historial..."
              className="h-12 w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-white/5 shadow-sm">
              Encontrados: <span className="text-blue-400">{pagination.total}</span>
            </div>

            {/* Controles de Paginación Superior */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 rounded-lg transition-colors border border-white/5"
              >
                <ChevronLeft size={18} className="text-white" />
              </button>
              <span className="text-xs font-mono text-slate-300 min-w-[60px] text-center">
                {pagination.page} / {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 rounded-lg transition-colors border border-white/5"
              >
                <ChevronRight size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-sm font-medium animate-pulse">Consultando base de datos...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500 opacity-50">
              <History size={64} />
              <p className="text-xl">No se encontraron registros</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-900 z-10">
                <tr className="border-b border-white/5 shadow-sm">
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Código QR</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Datos Asociados</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Fecha</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-blue-500/30 group-hover:text-blue-500 transition-colors" />
                        <span className="font-mono text-sm text-blue-400/80 font-medium group-hover:text-blue-400 transition-colors">{log.code}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                          <User size={16} />
                        </div>
                        <span className="font-bold">{log.associated_data}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/30 rounded-lg text-xs text-slate-400 border border-white/5 font-medium">
                        <Calendar size={12} className="opacity-50" />
                        {formatDate(log.scanned_at)}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-mono font-bold">
                        <Clock size={12} className="opacity-50" />
                        {formatTime(log.scanned_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer con Paginación Inferior */}
        <div className="p-4 bg-slate-900/60 border-t border-white/5 flex items-center justify-center gap-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold text-white transition-all border border-white/5"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <div className="flex items-center gap-1">
            {/* Simple page numbers indicator */}
            <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest mr-2">Página</span>
            <span className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg text-sm font-black shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              {pagination.page}
            </span>
            <span className="mx-2 text-slate-700">de</span>
            <span className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-300 rounded-lg text-sm font-bold border border-white/5">
              {pagination.totalPages || 1}
            </span>
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold text-white transition-all border border-white/5"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </main>
  );
}

export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <InventoryContent />
    </ProtectedRoute>
  );
}
