"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';

const QRScanner = dynamic(() => import('@/components/QRScanner'), { ssr: false });
import {
  ArrowLeft,
  Plus,
  Trash2,
  Database,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  History,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function AdminContent() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState({ code: '', associated_data: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0
  });

  useEffect(() => {
    fetchCodes();
  }, [pagination.page]);

  const handleAutoScan = (scannedCode) => {
    setNewCode(prev => ({ ...prev, code: scannedCode }));
    setStatus({ type: 'success', message: '¡Código capturado del escáner!' });
    document.getElementById('associated_data_input')?.focus();
  };

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      }).toString();
      const res = await fetch(`/api/codes?${queryString}`);
      const data = await res.json();
      if (data.success) {
        setCodes(data.codes);
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCode),
      });
      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', message: 'Código agregado correctamente' });
        setNewCode({ code: '', associated_data: '' });
        fetchCodes();
      } else {
        setStatus({ type: 'error', message: data.message || 'Error al agregar' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error de conexión' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este código?')) return;

    try {
      const res = await fetch(`/api/codes?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        fetchCodes();
        setStatus({ type: 'success', message: 'Código eliminado' });
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Header />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Database size={24} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold m-0 text-white">Gestión de Códigos</h1>
        </div>
        <div className="flex items-center gap-4">
                <a
                  href="/api/export"
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95 border border-emerald-400/20"
                >
                  <History size={16} />
                  Reporte Excel
                </a>
                <a
                  href="/admin/users"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/30 hover:bg-slate-800/80 text-slate-500 hover:text-slate-200 rounded-lg border border-slate-700/30 transition-all text-xs font-medium backdrop-blur-sm"
                >
                  Usuarios
                </a>
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-sm font-medium">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Panel Principal</span>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-8">
        {/* Formulario */}
        <section>
          <div className="glass-card !p-6 !m-0 !max-w-none">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-400" />
              Nuevo Código
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Código QR (Escáner USB)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    required
                    value={newCode.code}
                    onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm shadow-inner"
                    placeholder="Escanea aquí..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Datos Asociados
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    id="associated_data_input"
                    type="text"
                    required
                    value={newCode.associated_data}
                    onChange={(e) => setNewCode({ ...newCode, associated_data: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm shadow-inner"
                    placeholder="Ej: Nombre de usuario"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                Agregar Código
              </button>

              {status.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                  {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {status.message}
                </div>
              )}

              {/* Ayuda Escáner */}
              <div className="mt-6 p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Auto-Captura</h3>
                <QRScanner onScan={handleAutoScan} />
              </div>
            </form>
          </div>
        </section>

        {/* Lista */}
        <section>
          <div className="glass-card !p-0 !m-0 !max-w-none overflow-hidden flex flex-col h-[650px] shadow-2xl border-white/10">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Database size={18} className="text-blue-400" />
                Registrados
                <span className="ml-2 text-xs text-slate-500 font-mono">({pagination.total})</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-colors border border-white/5"
                >
                  <ChevronLeft size={16} className="text-white" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 w-12 text-center">
                  {pagination.page}/{pagination.totalPages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-colors border border-white/5"
                >
                  <ChevronRight size={16} className="text-white" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                  <p className="text-xs font-medium">Cargando lista...</p>
                </div>
              ) : codes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 opacity-30">
                  <AlertCircle size={48} strokeWidth={1} />
                  <p className="text-sm">No hay códigos registrados.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {codes.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-white/[0.03] transition-colors group flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-blue-400 font-bold truncate text-sm">{item.code}</div>
                          <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 shadow-sm">
                            {item.scan_count || 0}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1.5">
                          <FileText size={10} className="opacity-50" />
                          {item.associated_data}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all shadow-sm active:scale-90"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer de Paginación más visual */}
            <div className="p-4 bg-slate-900/60 border-t border-white/5 flex items-center justify-center gap-4">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
              >
                Anterior
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all ${pagination.page === pageNum
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
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

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminContent />
    </ProtectedRoute>
  );
}
