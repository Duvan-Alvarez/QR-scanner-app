"use client";

import { useEffect, useRef } from 'react';
import { ScanLine, Keyboard } from 'lucide-react';

export default function QRScanner({ onScan, active = true }) {
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    if (!active) {
      bufferRef.current = "";
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const handleKeyDown = (e) => {
      // Ignore functional keys except Enter
      if (e.key.length > 1 && e.key !== 'Enter') return;

      const now = Date.now();
      
      // USB scanners are extremely fast. 
      // If the time between keys is too long, we might want to clear the buffer
      // to avoid accidental manual typing interference, but let's keep it simple first.
      
      if (e.key === 'Enter') {
        if (bufferRef.current.length > 0) {
          processScan(bufferRef.current);
          bufferRef.current = "";
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        return;
      }

      bufferRef.current += e.key;
      lastKeyTimeRef.current = now;

      // Auto-scan after a short delay of no activity (e.g., 50ms)
      // This handles scanners that don't send an Enter key.
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (bufferRef.current.length > 0) {
          processScan(bufferRef.current);
          bufferRef.current = "";
        }
      }, 50);
    };

    const processScan = (data) => {
      // Play a simple beep sound for feedback
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        audio.play().catch(() => {});
      } catch (e) {}
      
      onScan(data);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onScan, active]);

  return (
    <div className="flex flex-col items-center w-full py-12">
      <div className="relative w-48 h-48 flex items-center justify-center bg-slate-800/50 rounded-3xl border-2 border-dashed border-blue-500/30 overflow-hidden mb-8 group transition-all hover:border-blue-500/50">
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="z-10 flex flex-col items-center gap-3">
          <ScanLine size={64} className="text-blue-500 animate-pulse" />
          <Keyboard size={24} className="text-slate-500" />
        </div>
        
        {/* Scanning line animation */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_2px_rgba(59,130,246,0.5)] z-20 animate-[scan_2s_ease-in-out_infinite]"></div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Escáner USB Activo</h3>
        <p className="text-slate-400 max-w-xs mx-auto">
          Pase el código por el lector. La aplicación detectará automáticamente el ingreso.
        </p>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}</style>
    </div>
  );
}
