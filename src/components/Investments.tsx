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
  const INV_PER_PAGE = 10;

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

  return (
    <div className="px-5 pt-12 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Investments</h1>
        <p className="text-[12px] font-medium text-black/40 dark:text-white/40 mt-0.5">Track your portfolio</p>
      </div>

      {investments.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <p className="text-[10px] font-semibold text-black/35 dark:text-white/35 uppercase tracking-wider">Portfolio Value</p>
          <p className="text-3xl font-bold tracking-tight mt-1">₹{port.tc.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {port.ret >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
            <span className={`text-[12px] font-bold ${port.ret >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
              {port.ret >= 0 ? '+' : ''}₹{port.ret.toLocaleString()} ({port.pct >= 0 ? '+' : ''}{port.pct.toFixed(1)}%)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
            <div><p className="text-[10px] font-semibold text-black/35 dark:text-white/35 uppercase tracking-wider">Invested</p><p className="text-[15px] font-bold mt-0.5">₹{port.ti.toLocaleString()}</p></div>
            <div><p className="text-[10px] font-semibold text-black/35 dark:text-white/35 uppercase tracking-wider">Returns</p><p className={`text-[15px] font-bold mt-0.5 ${port.ret >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{port.ret >= 0 ? '+' : ''}₹{port.ret.toLocaleString()}</p></div>
          </div>
        </div>
      )}

      <button onClick={() => setShowAdd(!showAdd)} className="w-full bg-black/[0.04] dark:bg-white/[0.06] py-3 rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold">
        {showAdd ? <X size={16} /> : <Plus size={16} />}{showAdd ? 'Cancel' : 'Add Investment'}
      </button>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
          <input type="text" placeholder="Investment name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none placeholder:text-black/25 dark:placeholder:text-white/25" required />
          <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none appearance-none select-styled">
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" placeholder="Amount invested (₹)" value={investedAmount} onChange={e => setInvestedAmount(e.target.value)} className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none placeholder:text-black/25 dark:placeholder:text-white/25" required />
          <input type="number" placeholder="Current value (₹) — optional" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none placeholder:text-black/25 dark:placeholder:text-white/25" />
          <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-semibold text-[14px]">Save</button>
        </form>
      )}

      <div className="space-y-3">
        {investments.length === 0 && !showAdd && <div className="py-10 text-center"><p className="text-[13px] text-black/30 dark:text-white/30">No investments tracked yet</p></div>}
        {(() => {
          const totalInvPages = Math.max(1, Math.ceil(investments.length / INV_PER_PAGE));
          const paginatedInv = investments.slice((invPage - 1) * INV_PER_PAGE, invPage * INV_PER_PAGE);
          return (<>
        {paginatedInv.map(inv => {
          const ret = inv.currentValue - inv.investedAmount;
          const pct = inv.investedAmount > 0 ? (ret / inv.investedAmount) * 100 : 0;
          return (
            <div key={inv._id} className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <h4 className="font-bold text-[14px] truncate">{inv.name}</h4>
                  <p className="text-[11px] text-black/35 dark:text-white/35 mt-0.5">{inv.type} · {(() => { try { return format(new Date(inv.dateAdded), 'MMM yyyy'); } catch { return ''; } })()}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  {editingId === inv._id ? (
                    <div className="flex items-center gap-1.5">
                      <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-24 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-right focus:outline-none" autoFocus />
                      <button onClick={handleUpdate} className="p-1.5 text-green-500"><Check size={14} /></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 text-black/30 dark:text-white/30"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div>
                        <p className="text-[15px] font-bold">₹{inv.currentValue.toLocaleString()}</p>
                        <p className={`text-[11px] font-semibold ${ret >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{ret >= 0 ? '+' : ''}{pct.toFixed(1)}%</p>
                      </div>
                      <button onClick={() => { setEditingId(inv._id); setEditValue(String(inv.currentValue)); }} className="p-1.5 text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white"><Pencil size={12} /></button>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06] flex justify-between items-center text-[11px] text-black/35 dark:text-white/35">
                <span>Invested: ₹{inv.investedAmount.toLocaleString()}</span>
                <button onClick={() => confirm('Delete this investment?', async () => { await deleteInvestment(inv._id); toast('Deleted'); })} className="p-1 text-black/15 dark:text-white/15 hover:text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>
          );
        })}
        {totalInvPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setInvPage(p => Math.max(1, p - 1))} disabled={invPage === 1}
              className="p-2 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] disabled:opacity-30 transition-opacity"><ChevronLeft size={16} /></button>
            <span className="text-[12px] font-semibold text-black/40 dark:text-white/40">{invPage} / {totalInvPages}</span>
            <button onClick={() => setInvPage(p => Math.min(totalInvPages, p + 1))} disabled={invPage === totalInvPages}
              className="p-2 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] disabled:opacity-30 transition-opacity"><ChevronRight size={16} /></button>
          </div>
        )}
        </>);
        })()}
      </div>
    </div>
  );
};
