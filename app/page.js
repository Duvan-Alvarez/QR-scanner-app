"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CheckCircle, XCircle, RefreshCcw, ShieldCheck, Database, History, Home as HomeIcon } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth-context';

// Import scanner dynamically to avoid SSR issues with browser APIs
const QRScanner = dynamic(() => import('@/components/QRScanner'), { ssr: false });

function HomeContent() {
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setScanCount(data.total);
      })
      .catch(err => console.error('Error loading stats:', err));
  }, []);

  const handleScan = async (decodedText) => {
    setIsLoading(true);
    setScanResult(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: decodedText }),
      });

      const data = await response.json();

      if (data.success) {
        // Continuous scan: just show feedback and don't stop the scanner
        setScanResult({ type: 'success', data: data });
        setSuccessFeedback(true);
        if (data.total_scans !== undefined) {
          setScanCount(data.total_scans);
        }
        setTimeout(() => setSuccessFeedback(false), 2000);
      } else {
        // Error: stop scanning and show the alert screen
        setScanResult({ type: 'error', data: data });
      }
    } catch (error) {
      console.error('Error in verification:', error);
      setScanResult({
        type: 'error',
        data: { message: 'Error de conexión con el servidor.' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
  };

  return (
    <main className="container relative">
      <Header />

      <div className="main-content">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <ShieldCheck size={40} className="text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl m-0">Validar QR</h1>
        </div>

        <div className="absolute top-6 left-6 flex gap-3">
          <Link
            href="/inventory"
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 hover:bg-slate-800/80 text-slate-500 hover:text-slate-200 rounded-lg border border-slate-700/30 transition-all text-xs font-medium backdrop-blur-sm"
          >
            <History size={14} />
            Inventario
          </Link>
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 hover:bg-slate-800/80 text-slate-500 hover:text-slate-200 rounded-lg border border-slate-700/30 transition-all text-xs font-medium backdrop-blur-sm"
            >
              <Database size={14} />
              Administrar
            </Link>
          )}
        </div>

        <p className="max-w-md text-slate-400 text-lg mb-4">
          Escanea el código QR para verificar la autenticidad y acceder a los datos registrados.
        </p>

        {/* Counter Display */}
        <div className="flex flex-col items-center mb-4 animate-in fade-in zoom-in duration-500">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500/60 mb-1">Total Ingresos</div>
          <div className="text-5xl font-black text-white tabular-nums bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            {scanCount.toString().padStart(3, '0')}
          </div>
        </div>

        <div className="glass-card">
          {!isLoading && (
            <div className="relative">
              <QRScanner onScan={handleScan} />

              {scanResult && scanResult.type === 'success' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 z-30 rounded-xl animate-in fade-in zoom-in duration-300">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <CheckCircle size={48} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">¡Acceso Aprobado!</h2>

                    <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
                      <div className="alert alert-success !flex-col !gap-4">
                        <div className="flex flex-col items-center">
                          <span className="uppercase text-[10px] font-bold tracking-widest opacity-60 mb-1">Datos Asociados</span>
                          <span className="alert-data text-2xl text-center font-bold">{scanResult.data.data}</span>
                        </div>

                        <div className="w-full h-px bg-emerald-500/20"></div>

                        <div className="flex items-center justify-center gap-2 text-emerald-400/80 text-xs font-medium">
                          <History size={12} />
                          <span>Ingresos totales de este código: <strong className="text-emerald-400">{scanResult.data.individual_scans}</strong></span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={resetScanner}
                      className="mt-8 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-700"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-slate-300 font-medium animate-pulse">Verificando en la base de datos...</p>
            </div>
          )}

          {scanResult && scanResult.type === 'error' && (
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <XCircle size={48} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>

              <div className="alert alert-error w-full mt-4">
                <span className="uppercase text-xs font-bold tracking-wider opacity-80">Razón</span>
                <span className="alert-data text-center">{scanResult.data.message}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full justify-center">
                <button
                  onClick={resetScanner}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg font-medium"
                >
                  <RefreshCcw size={18} />
                  Intentar de nuevo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
