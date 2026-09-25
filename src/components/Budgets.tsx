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
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Monthly Budgets</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">Track target limits and category spending for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5f259f] to-[#7c3aed] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:from-[#501f86] hover:to-[#6d28d9] transition-all active:scale-95 shadow-md shadow-purple-950/20 w-fit"
        >
          {showAdd ? <X size={15} /> : <Plus size={15} />}{showAdd ? 'Cancel' : 'Set Category Budget'}
        </button>
      </div>

      {/* Top Summaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Total Monthly Budget */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-purple-500/15 border border-purple-500/20 rounded-lg flex items-center justify-center">
              <Wallet size={16} className="text-purple-300" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">Overall Monthly Budget</span>
          </div>
          {editingMonthly ? (
            <div className="flex gap-2">
              <input type="number" value={monthlyLimit} onChange={e => setMonthlyLimit(e.target.value)} placeholder="Total limit (₹)" autoFocus
                className="flex-1 bg-white/[0.06] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none placeholder:text-white/30 text-white" />
              <button onClick={handleSaveMonthly} className="px-4 py-2.5 bg-gradient-to-r from-[#5f259f] to-[#7c3aed] text-white rounded-xl text-xs font-semibold">Save</button>
              <button
                onClick={() => {
                  setMonthlyLimit(localStorage.getItem('monthly_budget') || '');
                  setEditingMonthly(false);
                }}
                className="px-3 py-2.5 text-xs font-semibold text-white/50 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : savedMonthly > 0 ? (
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">₹{totalSpentAll.toLocaleString()}</p>
                  <p className="text-xs text-white/40 mt-0.5">of ₹{savedMonthly.toLocaleString()} total target limit</p>
                </div>
                <button onClick={() => { setMonthlyLimit(String(savedMonthly)); setEditingMonthly(true); }} className="text-xs font-semibold text-purple-300 hover:text-purple-200 transition-colors">Edit</button>
              </div>
              <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${totalSpentAll > savedMonthly ? 'bg-red-500' : totalSpentAll > savedMonthly * 0.8 ? 'bg-amber-500' : 'bg-gradient-to-r from-[#5f259f] to-[#8b5cf6]'}`}
                  style={{ width: `${Math.min((totalSpentAll / savedMonthly) * 100, 100)}%` }} />
              </div>
              {totalSpentAll > savedMonthly && <p className="text-xs text-red-400 font-semibold mt-1.5">₹{(totalSpentAll - savedMonthly).toLocaleString()} over budget</p>}
            </div>
          ) : (
            <button onClick={() => setEditingMonthly(true)} className="w-full py-4 border border-dashed border-white/15 rounded-xl text-xs font-medium text-white/40 hover:text-white hover:border-white/30 transition-all">
              + Set an overall monthly spending limit
            </button>
          )}
        </div>

        {/* Category Budget Aggregation */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Total Allocated Budgets</p>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">₹{totalSpent.toLocaleString()}</p>
              </div>
              <p className="text-xs font-medium text-white/40">Allocated: ₹{totalBudget.toLocaleString()}</p>
            </div>
            <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${totalSpent > totalBudget ? 'bg-red-500' : totalSpent > totalBudget * 0.8 ? 'bg-amber-500' : 'bg-gradient-to-r from-[#5f259f] to-[#8b5cf6]'}`}
                style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }} />
            </div>
          </div>
          <p className="text-xs text-white/40 mt-3">{currentBudgets.length} active category budget rules</p>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 max-w-2xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} type="button" onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${category === c ? 'bg-gradient-to-r from-[#5f259f] to-[#7c3aed] text-white shadow-sm' : 'bg-white/[0.06] text-white/50 hover:text-white'}`}>
                {c}
              </button>
            ))}
          </div>
          <input type="number" placeholder="Monthly limit for category (₹)" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full bg-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium focus:outline-none placeholder:text-white/30 text-white" required />
          <button type="submit" className="w-full bg-gradient-to-r from-[#5f259f] to-[#7c3aed] hover:from-[#501f86] hover:to-[#6d28d9] text-white py-3 rounded-xl font-semibold text-sm shadow-md shadow-purple-950/30 transition-all">Save Category Budget</button>
        </form>
      )}

      {currentBudgets.length === 0 && !showAdd ? (
        <div className="py-12 text-center glass-card rounded-2xl p-6">
          <p className="text-sm text-white/35 font-medium">No category budgets set yet for this month</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentBudgets.map(b => {
            const spent = spentByCategory[b.category] || 0;
            const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
            const over = spent > b.amount;
            const warn = pct > 80 && !over;
            return (
              <div key={b._id} className="glass-card p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">{b.category}</h4>
                        <button onClick={() => confirm('Delete this budget?', async () => { await deleteBudget(b._id); toast('Deleted'); })} className="p-1 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                      <p className="text-xs text-white/40 mt-1">₹{spent.toLocaleString()} <span className="text-white/25">/ ₹{b.amount.toLocaleString()}</span></p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${over ? 'bg-red-500/20 text-red-400 border border-red-500/30' : warn ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
                      {over ? 'Over Budget' : `${Math.round(pct)}%`}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-gradient-to-r from-[#5f259f] to-[#8b5cf6]'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  {over && <p className="text-xs text-red-400 font-semibold mt-1.5">₹{(spent - b.amount).toLocaleString()} exceeded</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
