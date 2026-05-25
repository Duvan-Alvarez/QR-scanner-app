"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CheckCircle, Database, History, RefreshCcw, ShieldCheck, XCircle } from 'lucide-react';
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
  const successTimerRef = useRef(null);
  const scannerBlocked = scanResult?.type === 'error';

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setScanCount(data.total);
      })
      .catch((err) => console.error('Error loading stats:', err));
  }, []);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleScan = async (decodedText) => {
    if (isLoading || scannerBlocked) return;

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
        // Continuous scan: show brief feedback and keep the scanner available.
        setScanResult({ type: 'success', data });
        setSuccessFeedback(true);
        if (data.total_scans !== undefined) {
          setScanCount(data.total_scans);
        }
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        successTimerRef.current = setTimeout(() => {
          setSuccessFeedback(false);
          setScanResult((current) => current?.type === 'success' ? null : current);
        }, 1200);
      } else {
        // Error: stop scanning and show the alert screen.
        setScanResult({ type: 'error', data });
      }
    } catch (error) {
      console.error('Error in verification:', error);
      setScanResult({
        type: 'error',
        data: { message: 'Error de conexion con el servidor.' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    setSuccessFeedback(false);
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
          Escanea el codigo QR para verificar la autenticidad y acceder a los datos registrados.
        </p>

        <div className="flex flex-col items-center mb-4 animate-in fade-in zoom-in duration-500">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500/60 mb-1">Total Ingresos</div>
          <div className="text-5xl font-black text-white tabular-nums bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            {scanCount.toString().padStart(3, '0')}
          </div>
        </div>

        <div className="glass-card">
          {!isLoading && !scannerBlocked && (
            <div className="relative">
              <QRScanner onScan={handleScan} active={!scannerBlocked} />

              {successFeedback && scanResult?.type === 'success' && (
                <div className="pointer-events-none absolute inset-x-4 top-4 z-30 rounded-xl border border-emerald-400/50 bg-emerald-950/95 p-4 shadow-[0_0_30px_rgba(16,185,129,0.25)] animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle size={28} className="text-emerald-400 shrink-0" />
                    <div className="min-w-0 text-left">
                      <h2 className="text-lg font-bold text-white leading-tight">Acceso Aprobado</h2>
                      <p className="text-sm text-emerald-100 truncate">{scanResult.data.data}</p>
                      <div className="flex items-center gap-1 text-emerald-300/80 text-xs font-medium mt-1">
                        <History size={12} />
                        <span>Ingresos de este codigo: <strong>{scanResult.data.individual_scans}</strong></span>
                      </div>
                    </div>
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

          {scannerBlocked && (
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <XCircle size={48} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>

              <div className="alert alert-error w-full mt-4">
                <span className="uppercase text-xs font-bold tracking-wider opacity-80">Razon</span>
                <span className="alert-data text-center">{scanResult.data.message}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full justify-center">
                <button
                  onClick={resetScanner}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg font-medium"
                >
                  <RefreshCcw size={18} />
                  Seguir escaneando
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
