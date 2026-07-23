'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { Plus, X, Trash2, Wallet } from 'lucide-react';
import { useToast } from './Toast';
import { format, isSameMonth, parseISO } from 'date-fns';

const CATEGORIES = ['Food', 'Travel', 'Entertainment', 'Bills', 'EMI', 'Shopping', 'Salary', 'Other'];

export const Budgets = () => {
  const { budgets, transactions, addBudget, deleteBudget } = useFinance();
  const { toast, confirm } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [editingMonthly, setEditingMonthly] = useState(false);
  const currentMonth = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    setMonthlyLimit(localStorage.getItem('monthly_budget') || '');
  }, []);

  const currentBudgets = useMemo(() => budgets.filter(b => b.month === currentMonth), [budgets, currentMonth]);

  const spentByCategory = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => { try { return t.type === 'Expense' && isSameMonth(parseISO(t.date), now); } catch { return false; } })
      .reduce((a, t) => { a[t.category] = (a[t.category] || 0) + t.amount; return a; }, {} as Record<string, number>);
  }, [transactions]);

  const totalSpentAll = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => { try { return t.type === 'Expense' && isSameMonth(parseISO(t.date), now); } catch { return false; } })
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); if (!amount) return;
    await addBudget({ category, amount: Number(amount), month: currentMonth });
    toast(`Budget: ₹${amount} for ${category}`);
    setAmount(''); setShowAdd(false);
  };

  const handleSaveMonthly = () => {
    if (monthlyLimit.trim()) localStorage.setItem('monthly_budget', monthlyLimit.trim());
    else localStorage.removeItem('monthly_budget');
    setEditingMonthly(false);
    toast('Monthly budget saved', 'success');
  };

  const totalBudget = currentBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = currentBudgets.reduce((s, b) => s + (spentByCategory[b.category] || 0), 0);
  const savedMonthly = Number(monthlyLimit.trim() || '0');

  return (
    <div className="px-5 pt-12 pb-4 space-y-5">
      <div>
        <p className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-widest">{format(new Date(), 'MMMM yyyy')}</p>
        <h1 className="text-2xl font-bold tracking-tight mt-0.5">Budgets</h1>
      </div>

      {/* Total Monthly Budget */}
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg flex items-center justify-center">
            <Wallet size={16} className="text-black/50 dark:text-white/50" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Monthly Budget</span>
        </div>
        {editingMonthly ? (
          <div className="flex gap-2">
            <input type="number" value={monthlyLimit} onChange={e => setMonthlyLimit(e.target.value)} placeholder="Total limit (₹)" autoFocus
              className="flex-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl px-4 py-2.5 text-[14px] font-medium focus:outline-none placeholder:text-black/25 dark:placeholder:text-white/25" />
            <button onClick={handleSaveMonthly} className="px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[13px] font-semibold">Save</button>
            <button
              onClick={() => {
                setMonthlyLimit(localStorage.getItem('monthly_budget') || '');
                setEditingMonthly(false);
              }}
              className="px-3 py-2.5 text-[13px] font-semibold text-black/40 dark:text-white/40"
            >
              Cancel
            </button>
          </div>
        ) : savedMonthly > 0 ? (
          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-2xl font-bold tracking-tight">₹{totalSpentAll.toLocaleString()}</p>
                <p className="text-[12px] text-black/40 dark:text-white/40 mt-0.5">of ₹{savedMonthly.toLocaleString()} total budget</p>
              </div>
              <button onClick={() => { setMonthlyLimit(String(savedMonthly)); setEditingMonthly(true); }} className="text-[12px] font-semibold text-black/35 dark:text-white/35 hover:text-black dark:hover:text-white transition-colors">Edit</button>
            </div>
            <div className="w-full h-2.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${totalSpentAll > savedMonthly ? 'bg-red-500' : totalSpentAll > savedMonthly * 0.8 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min((totalSpentAll / savedMonthly) * 100, 100)}%` }} />
            </div>
            {totalSpentAll > savedMonthly && <p className="text-[11px] text-red-500 font-semibold mt-1.5">₹{(totalSpentAll - savedMonthly).toLocaleString()} over budget</p>}
          </div>
        ) : (
          <button onClick={() => setEditingMonthly(true)} className="w-full py-3 border border-dashed border-black/10 dark:border-white/10 rounded-xl text-[13px] font-medium text-black/35 dark:text-white/35">
            Set a total monthly limit
          </button>
        )}
      </div>

      {currentBudgets.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-[10px] font-semibold text-black/35 dark:text-white/35 uppercase tracking-wider">Category Budgets</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">₹{totalSpent.toLocaleString()}</p>
            </div>
            <p className="text-[12px] font-medium text-black/40 dark:text-white/40">of ₹{totalBudget.toLocaleString()}</p>
          </div>
          <div className="w-full h-2 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${totalSpent > totalBudget ? 'bg-red-500' : totalSpent > totalBudget * 0.8 ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }} />
          </div>
        </div>
      )}

      <button onClick={() => setShowAdd(!showAdd)} className="w-full bg-black/[0.04] dark:bg-white/[0.06] py-3 rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold">
        {showAdd ? <X size={16} /> : <Plus size={16} />}{showAdd ? 'Cancel' : 'Set Category Budget'}
      </button>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} type="button" onClick={() => setCategory(c)}
                className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all ${category === c ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-black/[0.04] dark:bg-white/[0.06] text-black/50 dark:text-white/50'}`}>
                {c}
              </button>
            ))}
          </div>
          <input type="number" placeholder="Monthly limit (₹)" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none placeholder:text-black/25 dark:placeholder:text-white/25" required />
          <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-semibold text-[14px]">Save</button>
        </form>
      )}

      <div className="space-y-3">
        {currentBudgets.length === 0 && !showAdd && <div className="py-10 text-center"><p className="text-[13px] text-black/30 dark:text-white/30">No category budgets set</p></div>}
        {currentBudgets.map(b => {
          const spent = spentByCategory[b.category] || 0;
          const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
          const over = spent > b.amount;
          const warn = pct > 80 && !over;
          return (
            <div key={b._id} className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[14px]">{b.category}</h4>
                    <button onClick={() => confirm('Delete this budget?', async () => { await deleteBudget(b._id); toast('Deleted'); })} className="p-1 text-black/15 dark:text-white/15 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                  <p className="text-[12px] text-black/40 dark:text-white/40 mt-0.5">₹{spent.toLocaleString()} <span className="text-black/25 dark:text-white/25">/ ₹{b.amount.toLocaleString()}</span></p>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${over ? 'bg-red-500/10 text-red-500' : warn ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                  {over ? 'Over' : `${Math.round(pct)}%`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              {over && <p className="text-[11px] text-red-500 font-semibold mt-1.5">₹{(spent - b.amount).toLocaleString()} over</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
