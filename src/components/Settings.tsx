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

  const inputCls = `flex-1 bg-white/[0.06] rounded-xl px-4 py-2.5 text-xs font-medium font-mono focus:outline-none focus:ring-2 ${negative ? 'focus:ring-red-500/35' : 'focus:ring-purple-400/40'} placeholder:text-white/30 text-white`;

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Settings & Preferences</h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">Manage AI keys, accounts, appearance, and data export</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Provider */}
        <section className="glass-card rounded-2xl border border-white/10 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">AI Provider Key</h3>
              <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/20 px-2 py-0.5 rounded-full">Groq Cloud</span>
            </div>
            <p className="text-sm font-semibold">Groq API Key (Llama 3.3 & Whisper)</p>
            <p className="text-xs text-white/40 mt-1">Get your free key at console.groq.com. Enables voice recognition and AI financial insights.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-white/30 shrink-0" />
              <input type={showKey ? 'text' : 'password'} value={groqKey} onChange={e => setGroqKey(e.target.value)}
                placeholder="gsk_..." className={inputCls} />
              <button onClick={() => setShowKey(!showKey)} className="p-2 text-white/40 hover:text-white">{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <button onClick={handleSaveKey} className={`w-full bg-gradient-to-r ${negative ? 'from-red-500 to-red-400' : 'from-[#5f259f] to-[#7c3aed] hover:from-[#501f86] hover:to-[#6d28d9]'} text-white py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-purple-950/20 hover:opacity-95 transition-all`}>Save Key</button>
          </div>
        </section>

        {/* Account */}
        <section className="glass-card rounded-2xl border border-white/10 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Signed In User</h3>
            <div className="flex items-center gap-3">
              {session?.user?.image && !avatarError ? (
                <img
                  src={session.user.image}
                  alt={session?.user?.name || 'User avatar'}
                  className="w-12 h-12 rounded-full object-cover border border-white/15"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={22} className="text-white/60" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{session?.user?.name || 'Connected User'}</p>
                <p className="text-xs text-white/40 truncate">{session?.user?.email || 'Signed in'}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${negative ? 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.65)]' : 'bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.65)]'}`} />
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-xl text-xs font-semibold flex justify-center items-center gap-2 text-red-400 transition-colors"
          >
            <LogOut size={15} />Sign Out of Account
          </button>
        </section>

        {/* Preferences */}
        <section className="glass-card rounded-2xl border border-white/10 p-6 space-y-3">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Display & Theme</h3>
          <div className="w-full py-2 flex items-center justify-between font-medium text-sm">
            <span className="flex items-center gap-3 text-white/80"><Moon size={18} />Appearance</span>
            <span className="text-xs text-purple-300 bg-purple-500/15 border border-purple-500/20 px-2.5 py-1 rounded-full">PhonePe Dark</span>
          </div>
        </section>

        {/* Export Data */}
        <section className="glass-card rounded-2xl border border-white/10 p-6 space-y-3">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Export Data</h3>
          <div className="divide-y divide-white/5">
            <button onClick={() => handleExport('csv')} className="w-full py-2.5 flex items-center justify-between font-medium text-xs text-white/80 hover:text-white transition-colors">
              <span className="flex items-center gap-2.5"><Download size={15} />Transactions</span>
              <span className="text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded">CSV</span>
            </button>
            <button onClick={() => handleExport('debts')} className="w-full py-2.5 flex items-center justify-between font-medium text-xs text-white/80 hover:text-white transition-colors">
              <span className="flex items-center gap-2.5"><Download size={15} />Debts</span>
              <span className="text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded">CSV</span>
            </button>
            <button onClick={() => handleExport('investments')} className="w-full py-2.5 flex items-center justify-between font-medium text-xs text-white/80 hover:text-white transition-colors">
              <span className="flex items-center gap-2.5"><Download size={15} />Investments</span>
              <span className="text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded">CSV</span>
            </button>
            <button onClick={() => handleExport('all')} className="w-full py-2.5 flex items-center justify-between font-semibold text-xs text-purple-300 hover:text-purple-200 transition-colors">
              <span className="flex items-center gap-2.5"><Download size={15} />Export All Datasets</span>
              <span className="text-[11px] text-purple-300 bg-purple-500/15 border border-purple-500/20 px-2 py-0.5 rounded">CSV</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
