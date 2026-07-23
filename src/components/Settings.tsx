'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Download, Moon, LogOut, User, Key, Eye, EyeOff } from 'lucide-react';
import { useToast } from './Toast';
import { useTheme } from './ThemeProvider';
import { useTone } from './ToneProvider';

export const Settings = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { isDark } = useTheme();
  const { tone } = useTone();
  const negative = tone === 'negative';
  const [avatarError, setAvatarError] = useState(false);
  const [groqKey, setGroqKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setGroqKey(localStorage.getItem('groq_api_key') || '');
  }, []);

  const handleSaveKey = () => {
    if (groqKey.trim()) localStorage.setItem('groq_api_key', groqKey.trim());
    else localStorage.removeItem('groq_api_key');
    toast('API key saved', 'success');
  };

  const handleExport = async (type: 'csv' | 'debts' | 'investments' | 'all') => {
    const filenames: Record<string, string> = { csv: 'transactions.csv', debts: 'debts.csv', investments: 'investments.csv', all: 'all-finance-data.csv' };
    try {
      const res = await fetch(`/api/export/${type}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filenames[type];
      a.click();
      URL.revokeObjectURL(url);
      toast('Exported successfully', 'success');
    } catch {
      toast('Export failed', 'error');
    }
  };

  const inputCls = `flex-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl px-4 py-2.5 text-[13px] font-medium font-mono focus:outline-none focus:ring-2 ${negative ? 'focus:ring-red-500/35' : 'focus:ring-lime-300/30'} placeholder:text-black/25 dark:placeholder:text-white/25`;

  return (
    <div className="px-5 pt-12 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-[12px] font-medium text-black/40 dark:text-white/40 mt-0.5">Preferences and data</p>
      </div>

      {/* AI Provider */}
      <section>
        <h3 className="text-[10px] font-bold text-black/35 dark:text-white/35 uppercase tracking-widest mb-2.5 ml-1">AI Provider</h3>
        <div className={`bg-white dark:bg-neutral-900 rounded-2xl border ${negative ? 'border-red-500/25' : 'border-lime-300/20'} shadow-sm p-4 space-y-4`}>
          <p className="text-[13px] font-semibold">Groq</p>
          <p className="text-[11px] text-black/40 dark:text-white/40">Free key: console.groq.com — Llama 3.3 + Whisper</p>
          <div className="flex items-center gap-2">
            <Key size={14} className="text-black/30 dark:text-white/30 shrink-0" />
            <input type={showKey ? 'text' : 'password'} value={groqKey} onChange={e => setGroqKey(e.target.value)}
              placeholder="Groq API key" className={inputCls} />
            <button onClick={() => setShowKey(!showKey)} className="p-2 text-black/30 dark:text-white/30">{showKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>
          <button onClick={handleSaveKey} className={`w-full bg-gradient-to-r ${negative ? 'from-red-500 to-red-400' : 'from-lime-400 to-lime-300'} ${negative ? 'text-white' : 'text-black'} py-2.5 rounded-xl text-[13px] font-semibold`}>Save Key</button>
        </div>
      </section>

      {/* Account */}
      <section>
        <h3 className="text-[10px] font-bold text-black/35 dark:text-white/35 uppercase tracking-widest mb-2.5 ml-1">Account</h3>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              {session?.user?.image && !avatarError ? (
                <img
                  src={session.user.image}
                  alt={session?.user?.name || 'User avatar'}
                  className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/15"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center">
                  <User size={18} className="text-black/40 dark:text-white/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[14px] truncate">Google Account</p>
                <p className="text-[11px] text-black/40 dark:text-white/40 truncate">Signed in securely</p>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${negative ? 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.65)]' : 'bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.65)]'}`} />
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full py-3 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl text-[13px] font-semibold flex justify-center items-center gap-2 text-red-500"
            >
              <LogOut size={15} />Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h3 className="text-[10px] font-bold text-black/35 dark:text-white/35 uppercase tracking-widest mb-2.5 ml-1">Preferences</h3>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden">
          <div className="w-full px-4 py-3.5 flex items-center justify-between font-medium text-[14px]">
            <span className="flex items-center gap-3"><Moon size={17} />Appearance</span>
            <span className="text-[12px] text-black/35 dark:text-white/35">{isDark ? 'Dark (locked)' : 'Dark (locked)'}</span>
          </div>
        </div>
      </section>

      {/* Data */}
      <section>
        <h3 className="text-[10px] font-bold text-black/35 dark:text-white/35 uppercase tracking-widest mb-2.5 ml-1">Export Data</h3>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden divide-y divide-black/[0.04] dark:divide-white/[0.06]">
          <button onClick={() => handleExport('csv')} className="w-full px-4 py-3.5 flex items-center justify-between font-medium text-[14px]">
            <span className="flex items-center gap-3"><Download size={17} />Transactions</span>
            <span className="text-[11px] text-black/35 dark:text-white/35">CSV</span>
          </button>
          <button onClick={() => handleExport('debts')} className="w-full px-4 py-3.5 flex items-center justify-between font-medium text-[14px]">
            <span className="flex items-center gap-3"><Download size={17} />Debts</span>
            <span className="text-[11px] text-black/35 dark:text-white/35">CSV</span>
          </button>
          <button onClick={() => handleExport('investments')} className="w-full px-4 py-3.5 flex items-center justify-between font-medium text-[14px]">
            <span className="flex items-center gap-3"><Download size={17} />Investments</span>
            <span className="text-[11px] text-black/35 dark:text-white/35">CSV</span>
          </button>
          <button onClick={() => handleExport('all')} className="w-full px-4 py-3.5 flex items-center justify-between font-semibold text-[14px]">
            <span className="flex items-center gap-3"><Download size={17} />All Data</span>
            <span className="text-[11px] text-black/35 dark:text-white/35">CSV</span>
          </button>
        </div>
      </section>
    </div>
  );
};
