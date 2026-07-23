'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useFinance, type Transaction } from '@/hooks/useFinance';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { format, subDays, subMonths, isSameMonth, parseISO } from 'date-fns';
import { Pencil, Trash2, X, Search, TrendingUp, TrendingDown, Receipt, Sparkles, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from './Toast';

const CATEGORIES = ['Food', 'Travel', 'Entertainment', 'Bills', 'EMI', 'Shopping', 'Salary', 'Other'];
const GREEN_CHART_COLORS = ['#bef264', '#a3e635', '#84cc16', '#65a30d', '#4d7c0f', '#3f6212', '#d9f99d', '#ecfccb'];
const RED_CHART_COLORS = ['#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#fecdd3', '#ffe4e6'];
const TT: React.CSSProperties = { borderRadius: '10px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', fontSize: '12px', fontWeight: 600, padding: '6px 10px' };

export const Dashboard = () => {
  const { transactions, debts, budgets, investments, loading, editTransaction, deleteTransaction } = useFinance();
  const { toast, confirm } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [txPage, setTxPage] = useState(1);
  const TX_PER_PAGE = 15;
  const [insights, setInsights] = useState<{ emoji: string; title: string; body: string }[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('finance_ai_insights');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) setInsights(parsed);
    } catch {
      /* ignore */
    }
  }, []);

  const currentMonthTxs = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => { try { return isSameMonth(parseISO(t.date), now); } catch { return false; } });
  }, [transactions]);

  const { income, expense } = useMemo(() =>
    currentMonthTxs.reduce((a, t) => {
      if (t.type === 'Income') a.income += t.amount;
      if (t.type === 'Expense') a.expense += t.amount;
      return a;
    }, { income: 0, expense: 0 }),
  [currentMonthTxs]);

  const categoryData = useMemo(() => {
    const grouped = currentMonthTxs.filter(t => t.type === 'Expense').reduce((a, t) => {
      a[t.category] = (a[t.category] || 0) + t.amount; return a;
    }, {} as Record<string, number>);
    return Object.entries(grouped).map(([name, value]) => ({ name, value: Number(value) })).sort((a, b) => b.value - a.value);
  }, [currentMonthTxs]);

  const dailyData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));
    return days.map(d => ({
      name: format(parseISO(d), 'EEE'),
      amount: transactions.filter(t => typeof t.date === 'string' && t.date.startsWith(d) && t.type === 'Expense').reduce((s, t) => s + Number(t.amount) || 0, 0),
    }));
  }, [transactions]);

  const lastMonthExpense = useMemo(() => {
    const lm = subMonths(new Date(), 1);
    return transactions.filter(t => { try { return t.type === 'Expense' && isSameMonth(parseISO(t.date), lm); } catch { return false; } }).reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const expenseChange = lastMonthExpense > 0 ? ((expense - lastMonthExpense) / lastMonthExpense) * 100 : 0;
  const netBalance = income - expense;
  const isPositive = netBalance >= 0;
  const chartColors = isPositive ? GREEN_CHART_COLORS : RED_CHART_COLORS;
  const categoryColors: Record<string, string> = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c, i) => [c, chartColors[i]])),
    [chartColors]
  );

  const recentTxs = useMemo(() => {
    let f = [...currentMonthTxs];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      f = f.filter(t =>
        (t.description ?? '').toLowerCase().includes(q) ||
        (t.category ?? '').toLowerCase().includes(q) ||
        String(t.amount ?? '').includes(q));
    }
    if (filterCategory) f = f.filter(t => t.category === filterCategory);
    return f.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentMonthTxs, searchQuery, filterCategory]);

  const txTotalPages = Math.max(1, Math.ceil(recentTxs.length / TX_PER_PAGE));
  const paginatedTxs = recentTxs.slice((txPage - 1) * TX_PER_PAGE, txPage * TX_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setTxPage(1); }, [searchQuery, filterCategory]);

  const refreshInsights = useCallback(async () => {
    const groqKey = localStorage.getItem('groq_api_key') || '';
    if (transactions.length === 0 || !groqKey) return;
    setInsightsLoading(true);
    try {
      const summary = [`Month: ${format(new Date(), 'MMMM yyyy')}`, `Income: ₹${income}`, `Expenses: ₹${expense}`, `Last month expenses: ₹${lastMonthExpense}`,
        `Categories: ${categoryData.slice(0, 5).map(c => `${c.name}: ₹${c.value}`).join(', ')}`,
        `Debts owed to me: ₹${debts.filter(d => d.type === 'Lent' && d.status === 'Pending').reduce((s, d) => s + d.amount, 0)}`,
        `Debts I owe: ₹${debts.filter(d => d.type === 'Borrowed' && d.status === 'Pending').reduce((s, d) => s + d.amount, 0)}`,
        `Budgets: ${budgets.filter(b => b.month === format(new Date(), 'yyyy-MM')).map(b => `${b.category}: ₹${b.amount}`).join(', ') || 'None'}`,
        `Investments: ${investments.length > 0 ? `₹${investments.reduce((s, i) => s + i.currentValue, 0)} total` : 'None'}`].join('\n');
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, apiKey: groqKey }),
      });
      const result = await res.json();
      if (Array.isArray(result) && result.length > 0) { setInsights(result); localStorage.setItem('finance_ai_insights', JSON.stringify(result)); }
    } catch {} finally { setInsightsLoading(false); }
  }, [transactions, income, expense, lastMonthExpense, categoryData, debts, budgets, investments]);

  useEffect(() => { if (insights.length === 0 && transactions.length > 0 && typeof window !== 'undefined' && localStorage.getItem('groq_api_key')) refreshInsights(); }, [transactions.length]);

  const startEdit = (t: Transaction) => {
    const dateStr = typeof t.date === 'string' ? t.date.split('T')[0] : '';
    setEditingId(t._id);
    setEditForm({ amount: t.amount, type: t.type, category: t.category, description: t.description, date: dateStr });
  };
  const saveEdit = async () => { if (!editingId) return; await editTransaction(editingId, { amount: Number(editForm.amount), type: editForm.type, category: editForm.category, description: editForm.description, date: editForm.date ? new Date(editForm.date).toISOString() : undefined }); setEditingId(null); toast('Updated'); };
  const handleDelete = (id: string) => { confirm('Delete this transaction?', async () => { await deleteTransaction(id); toast('Deleted'); }); };

  if (loading) {
    return (
      <div className="px-5 pt-12 pb-4 space-y-5">
        <div className="h-8 w-32 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg animate-pulse" />
        <div className="h-40 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl animate-pulse" />
        <div className="h-48 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 pb-4 space-y-5 text-white">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">FlowFunds</h1>
        </div>
      </div>

      {/* Balance Card */}
      <div
        className={`p-4 rounded-[28px] border ${
          isPositive
            ? 'bg-gradient-to-br from-lime-300 to-lime-400 border-lime-200/70 shadow-[0_12px_30px_rgba(132,204,22,0.28)]'
            : 'bg-red-400 border-red-400 shadow-[0_12px_30px_rgba(239,68,68,0.28)]'
        }`}
      >
        <div className={`rounded-3xl p-4 border ${isPositive ? 'bg-lime-200/70 border-lime-100/80' : 'bg-red-500 border-red-500'}`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-black/60 uppercase tracking-wider">Total Balance</p>
          </div>
          <p className="text-4xl font-extrabold tracking-tight mt-2 text-black">₹{netBalance.toLocaleString()}</p>

        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 px-1">
          <div>
            <p className="text-[10px] font-semibold text-black/55 uppercase tracking-wider">Income</p>
            <p className="text-lg font-bold text-emerald-900 mt-0.5">₹{income.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-black/55 uppercase tracking-wider">Expense</p>
            <p className="text-lg font-bold text-rose-800 mt-0.5">₹{expense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Month-over-month */}
      {lastMonthExpense > 0 && (
        <div className="flex items-center gap-3 glass-card p-4 rounded-2xl">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${expenseChange <= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {expenseChange <= 0 ? <TrendingDown size={17} className="text-green-500" /> : <TrendingUp size={17} className="text-red-500" />}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight">{expenseChange <= 0 ? `${Math.abs(Math.round(expenseChange))}% less` : `${Math.round(expenseChange)}% more`} than last month</p>
            <p className="text-[11px] text-black/35 dark:text-white/35 mt-0.5">₹{lastMonthExpense.toLocaleString()} → ₹{expense.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {(insights.length > 0 || insightsLoading) && (
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40">AI Insights</span>
            </div>
            <button onClick={refreshInsights} disabled={insightsLoading} className="p-1.5 text-black/25 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors">
              <RefreshCw size={13} className={insightsLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          {insightsLoading && insights.length === 0 ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2.5">{insights.map((ins, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="text-base shrink-0">{ins.emoji}</span>
                <div><p className="text-[13px] font-semibold leading-tight">{ins.title}</p><p className="text-[11px] text-black/45 dark:text-white/45 leading-relaxed mt-0.5">{ins.body}</p></div>
              </div>
            ))}</div>
          )}
        </div>
      )}

      {/* Pie Chart */}
      {categoryData.length > 0 && (
        <div className="glass-card p-5 rounded-2xl">
          <h3 className="text-[13px] font-bold tracking-tight mb-4">Expenses by Category</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={72} paddingAngle={3} dataKey="value" stroke="none">
                {categoryData.map(e => <Cell key={e.name} fill={categoryColors[e.name] || '#888'} />)}
              </Pie><Tooltip formatter={(v) => `₹${v}`} contentStyle={TT} /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center text-[12px] font-medium text-black/70 dark:text-white/70">
                <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: categoryColors[c.name] || '#888' }} />
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar Chart */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="text-[13px] font-bold tracking-tight mb-4">Last 7 Days</h3>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#999' }} dy={8} />
              <Tooltip cursor={{ fill: '#0001' }} formatter={(v) => `₹${v}`} contentStyle={TT} />
              <Bar dataKey="amount" fill={isPositive ? '#84cc16' : '#f43f5e'} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-[13px] font-bold tracking-tight mb-3">This Month</h3>
        <div className="space-y-2.5 mb-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/25 dark:text-white/25" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..."
              className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-xl py-2.5 pl-10 pr-3 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 placeholder:text-black/25 dark:placeholder:text-white/25" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button onClick={() => setFilterCategory(null)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${!filterCategory ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-black/[0.04] dark:bg-white/[0.06] text-black/50 dark:text-white/50'}`}>All</button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilterCategory(filterCategory === c ? null : c)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${filterCategory === c ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-black/[0.04] dark:bg-white/[0.06] text-black/50 dark:text-white/50'}`}>{c}</button>
            ))}
          </div>
        </div>

        {recentTxs.length === 0 ? (
          <div className="py-10 text-center"><p className="text-[13px] text-black/30 dark:text-white/30 font-medium">No transactions yet</p></div>
        ) : (
          <div className="space-y-2">
            {paginatedTxs.map(t => (
              <div key={t._id} className="bg-slate-900/70 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                {editingId === t._id ? (
                  <div className="p-3.5 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={editForm.amount ?? ''} onChange={e => setEditForm(f => ({ ...f, amount: Number(e.target.value) }))}
                        className="bg-black/[0.04] dark:bg-white/[0.06] rounded-lg px-3 py-2 text-[13px] font-medium focus:outline-none" placeholder="Amount" />
                      <input type="date" value={editForm.date ?? ''} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                        className="bg-black/[0.04] dark:bg-white/[0.06] rounded-lg px-3 py-2 text-[13px] font-medium focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={editForm.type ?? 'Expense'} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                        className="bg-black/[0.04] dark:bg-white/[0.06] rounded-lg px-3 py-2 text-[13px] font-medium focus:outline-none appearance-none select-styled">
                        <option value="Expense">Expense</option><option value="Income">Income</option><option value="Transfer">Transfer</option>
                      </select>
                      <select value={editForm.category ?? 'Other'} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                        className="bg-black/[0.04] dark:bg-white/[0.06] rounded-lg px-3 py-2 text-[13px] font-medium focus:outline-none appearance-none select-styled">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <input type="text" value={editForm.description ?? ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-lg px-3 py-2 text-[13px] font-medium focus:outline-none" placeholder="Description" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-[12px] font-semibold text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">Cancel</button>
                      <button onClick={saveEdit} className="px-4 py-1.5 text-[12px] font-semibold bg-black dark:bg-white text-white dark:text-black rounded-lg">Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryColors[t.category] || '#888' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate">{t.description || t.category}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[11px] text-black/35 dark:text-white/35">{(() => { try { return format(parseISO(t.date), 'MMM d'); } catch { return ''; } })()}</p>
                        {t.receiptUrl && <a href={t.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500"><Receipt size={10} /></a>}
                      </div>
                    </div>
                    <span className={`text-[15px] font-bold tabular-nums shrink-0 ${t.type === 'Income' ? 'text-green-600 dark:text-green-400' : t.type === 'Expense' ? 'text-red-500 dark:text-red-400' : ''}`}>
                      {t.type === 'Income' ? '+' : t.type === 'Expense' ? '-' : ''}₹{(Number(t.amount) || 0).toLocaleString()}
                    </span>
                    <div className="flex shrink-0 -mr-1">
                      <button onClick={() => startEdit(t)} className="p-2 text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(t._id)} className="p-2 text-black/20 dark:text-white/20 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {txTotalPages > 1 && (
          <div className="flex items-center justify-between pt-3">
            <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage === 1}
              className="p-2 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] disabled:opacity-30 transition-opacity"><ChevronLeft size={16} /></button>
            <span className="text-[12px] font-semibold text-black/40 dark:text-white/40">{txPage} / {txTotalPages}</span>
            <button onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))} disabled={txPage === txTotalPages}
              className="p-2 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] disabled:opacity-30 transition-opacity"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

