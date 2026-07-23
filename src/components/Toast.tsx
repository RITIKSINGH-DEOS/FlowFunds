'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType; }
interface ToastContextType { toast: (message: string, type?: ToastType) => void; confirm: (message: string, onConfirm: () => void) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);
export const useToast = () => { const c = useContext(ToastContext); if (!c) throw new Error('useToast must be within ToastProvider'); return c; };

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const confirm = useCallback((message: string, onConfirm: () => void) => setConfirmState({ message, onConfirm }), []);

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toasts */}
      <div className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-2.5 px-5 pointer-events-none">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />)}
      </div>

      {/* Confirm */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-sm px-5 pb-6 sm:pb-0">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-black/[0.06] dark:border-white/[0.08]">
            <p className="font-semibold text-[15px] text-center mb-5">{confirmState.message}</p>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirmState(null)} className="flex-1 py-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] font-semibold text-[13px]">Cancel</button>
              <button onClick={() => { confirmState.onConfirm(); setConfirmState(null); }} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-[13px]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200/60 dark:border-emerald-800/40', icon: 'text-emerald-500' },
  error: { bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200/60 dark:border-red-800/40', icon: 'text-red-500' },
  info: { bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-200/60 dark:border-blue-800/40', icon: 'text-blue-500' },
};

const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => { setIsExiting(true); setTimeout(onDismiss, 200); }, 2800);
    return () => clearTimeout(timerRef.current);
  }, [onDismiss]);

  const handleDismiss = () => { clearTimeout(timerRef.current); setIsExiting(true); setTimeout(onDismiss, 200); };

  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
  const style = TOAST_STYLES[toast.type];

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm ${style.bg} rounded-2xl px-4 py-3 shadow-lg shadow-black/5 dark:shadow-black/20 border ${style.border} flex items-center gap-3 toast-enter ${isExiting ? 'toast-exit' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={`${style.icon} shrink-0`} />
      </div>
      <p className="text-[13px] font-semibold flex-1 leading-snug">{toast.message}</p>
      <button onClick={handleDismiss} className="p-1.5 text-black/20 dark:text-white/20 hover:text-black/40 dark:hover:text-white/40 shrink-0 rounded-full transition-colors"><X size={14} /></button>
    </div>
  );
};
