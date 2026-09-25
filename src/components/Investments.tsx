'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { Plus, X, TrendingUp, TrendingDown, Pencil, Check, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from './Toast';
import { format } from 'date-fns';

const TYPES = ['Stocks', 'Mutual Funds', 'FD', 'Gold', 'Crypto', 'PPF', 'Real Estate', 'Other'];

export const Investments = () => {
  const { investments, addInvestment, updateInvestmentValue, deleteInvestment } = useFinance();
  const { toast, confirm } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Mutual Funds');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [invPage, setInvPage] = useState(1);
  const INV_PER_PAGE = 12;

  const port = useMemo(() => {
    const ti = investments.reduce((s, i) => s + i.investedAmount, 0);
    const tc = investments.reduce((s, i) => s + i.currentValue, 0);
    const ret = tc - ti;
    return { ti, tc, ret, pct: ti > 0 ? (ret / ti) * 100 : 0 };
  }, [investments]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name || !investedAmount) return;
    const inv = Number(investedAmount);
    await addInvestment({ name, type, investedAmount: inv, currentValue: Number(currentValue) || inv, dateAdded: new Date().toISOString() });
    toast(`Added: ${name}`);
    setName(''); setInvestedAmount(''); setCurrentValue(''); setShowAdd(false);
  };

  const handleUpdate = async () => {
    if (!editingId || !editValue) return;
    await updateInvestmentValue(editingId, Number(editValue));
    setEditingId(null); setEditValue(''); toast('Updated');
  };

  const inputCls = "w-full bg-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium focus:outline-none placeholder:text-white/30";

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Investments & Portfolio</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">Track your assets, market value, and returns</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-95 shadow-sm w-fit"
        >
          {showAdd ? <X size={15} /> : <Plus size={15} />}{showAdd ? 'Cancel' : 'Add Investment'}
        </button>
      </div>

      {investments.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Total Portfolio Value</p>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5">₹{port.tc.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Total Invested</p>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-1.5 text-white/80">₹{port.ti.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Total Returns</p>
              <div className="flex items-center gap-2 mt-1.5">
                {port.ret >= 0 ? <TrendingUp size={20} className="text-green-400" /> : <TrendingDown size={20} className="text-red-400" />}
                <p className={`text-2xl sm:text-3xl font-extrabold ${port.ret >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {port.ret >= 0 ? '+' : ''}₹{port.ret.toLocaleString()} ({port.pct >= 0 ? '+' : ''}{port.pct.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Investment name (e.g. Nifty 50 Index)" value={name} onChange={e => setName(e.target.value)} className={inputCls} required />
            <select value={type} onChange={e => setType(e.target.value)} className={`${inputCls} appearance-none select-styled`}>
              {TYPES.map(t => <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="number" placeholder="Amount invested (₹)" value={investedAmount} onChange={e => setInvestedAmount(e.target.value)} className={inputCls} required />
            <input type="number" placeholder="Current value (₹) — optional" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className={inputCls} />
          </div>
          <button type="submit" className="w-full bg-white text-black py-3 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors">Save Investment</button>
        </form>
      )}

      {investments.length === 0 && !showAdd ? (
        <div className="py-12 text-center glass-card rounded-2xl p-6">
          <p className="text-sm text-white/35 font-medium">No investments tracked yet</p>
        </div>
      ) : (
        <div>
          {(() => {
            const totalInvPages = Math.max(1, Math.ceil(investments.length / INV_PER_PAGE));
            const paginatedInv = investments.slice((invPage - 1) * INV_PER_PAGE, invPage * INV_PER_PAGE);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedInv.map(inv => {
                    const ret = inv.currentValue - inv.investedAmount;
                    const pct = inv.investedAmount > 0 ? (ret / inv.investedAmount) * 100 : 0;
                    return (
                      <div key={inv._id} className="glass-card p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm truncate">{inv.name}</h4>
                            <p className="text-xs text-white/40 mt-1">{inv.type} · {(() => { try { return format(new Date(inv.dateAdded), 'MMM yyyy'); } catch { return ''; } })()}</p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            {editingId === inv._id ? (
                              <div className="flex items-center gap-1.5">
                                <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-24 bg-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-bold text-right focus:outline-none" autoFocus />
                                <button onClick={handleUpdate} className="p-1.5 text-green-400 hover:text-green-300"><Check size={14} /></button>
                                <button onClick={() => setEditingId(null)} className="p-1.5 text-white/40 hover:text-white"><X size={14} /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <div>
                                  <p className="text-base font-bold">₹{inv.currentValue.toLocaleString()}</p>
                                  <p className={`text-xs font-semibold ${ret >= 0 ? 'text-green-400' : 'text-red-400'}`}>{ret >= 0 ? '+' : ''}{pct.toFixed(1)}%</p>
                                </div>
                                <button onClick={() => { setEditingId(inv._id); setEditValue(String(inv.currentValue)); }} className="p-1.5 text-white/30 hover:text-white transition-colors"><Pencil size={13} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-white/40">
                          <span>Invested: ₹{inv.investedAmount.toLocaleString()}</span>
                          <button onClick={() => confirm('Delete this investment?', async () => { await deleteInvestment(inv._id); toast('Deleted'); })} className="p-1 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalInvPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button onClick={() => setInvPage(p => Math.max(1, p - 1))} disabled={invPage === 1}
                      className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
                    <span className="text-xs font-semibold text-white/50">{invPage} of {totalInvPages}</span>
                    <button onClick={() => setInvPage(p => Math.min(totalInvPages, p + 1))} disabled={invPage === totalInvPages}
                      className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
