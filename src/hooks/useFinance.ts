'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Transaction {
  _id: string;
  date: string;
  amount: number;
  currency: string;
  type: string;
  category: string;
  description: string;
  notes: string;
  tags: string;
  receiptUrl: string;
}

export interface Debt {
  _id: string;
  person: string;
  amount: number;
  type: 'Lent' | 'Borrowed';
  dueDate: string;
  status: 'Pending' | 'Settled';
  notes: string;
}

export interface Budget {
  _id: string;
  category: string;
  amount: number;
  month: string;
}

export interface Investment {
  _id: string;
  name: string;
  type: string;
  investedAmount: number;
  currentValue: number;
  dateAdded: string;
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

function normalizeTransaction(raw: Record<string, unknown>): Transaction {
  const d = raw.date;
  const date =
    typeof d === 'string' ? d : d instanceof Date ? d.toISOString() : '';
  return {
    _id: String(raw._id ?? ''),
    date,
    amount: Number(raw.amount) || 0,
    currency: String(raw.currency ?? 'INR'),
    type: String(raw.type ?? 'Expense'),
    category: String(raw.category ?? 'Other'),
    description: String(raw.description ?? ''),
    notes: String(raw.notes ?? ''),
    tags: String(raw.tags ?? ''),
    receiptUrl: String(raw.receiptUrl ?? ''),
  };
}

function normalizeDebt(raw: Record<string, unknown>): Debt {
  return {
    _id: String(raw._id ?? ''),
    person: String(raw.person ?? ''),
    amount: Number(raw.amount) || 0,
    type: raw.type === 'Borrowed' ? 'Borrowed' : 'Lent',
    dueDate: typeof raw.dueDate === 'string' ? raw.dueDate : '',
    status: raw.status === 'Settled' ? 'Settled' : 'Pending',
    notes: String(raw.notes ?? ''),
  };
}

function normalizeBudget(raw: Record<string, unknown>): Budget {
  return {
    _id: String(raw._id ?? ''),
    category: String(raw.category ?? 'Other'),
    amount: Number(raw.amount) || 0,
    month: String(raw.month ?? ''),
  };
}

function normalizeInvestment(raw: Record<string, unknown>): Investment {
  const d = raw.dateAdded;
  const dateAdded =
    typeof d === 'string' ? d : d instanceof Date ? d.toISOString() : '';
  return {
    _id: String(raw._id ?? ''),
    name: String(raw.name ?? ''),
    type: String(raw.type ?? ''),
    investedAmount: Number(raw.investedAmount) || 0,
    currentValue: Number(raw.currentValue) || 0,
    dateAdded,
  };
}

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const notifyToneRefresh = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flowfunds:transactions-changed'));
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [txs, ds, bs, invs] = await Promise.all([
        api<Record<string, unknown>[]>('/api/transactions'),
        api<Record<string, unknown>[]>('/api/debts'),
        api<Record<string, unknown>[]>('/api/budgets'),
        api<Record<string, unknown>[]>('/api/investments'),
      ]);
      setTransactions(txs.map(normalizeTransaction));
      setDebts(ds.map(normalizeDebt));
      setBudgets(bs.map(normalizeBudget));
      setInvestments(invs.map(normalizeInvestment));
      notifyToneRefresh();
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // --- Transactions ---
  const addTransaction = async (data: Omit<Transaction, '_id'>) => {
    const created = await api<Record<string, unknown>>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const t = normalizeTransaction(created);
    setTransactions(prev => [t, ...prev]);
    notifyToneRefresh();
    return t;
  };

  const editTransaction = async (id: string, updates: Partial<Omit<Transaction, '_id'>>) => {
    const updated = await api<Record<string, unknown>>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    const t = normalizeTransaction(updated);
    setTransactions(prev => prev.map(x => x._id === id ? t : x));
    notifyToneRefresh();
  };

  const deleteTransaction = async (id: string) => {
    await api(`/api/transactions/${id}`, { method: 'DELETE' });
    setTransactions(prev => prev.filter(t => t._id !== id));
    notifyToneRefresh();
  };

  // --- Debts ---
  const addDebt = async (data: Omit<Debt, '_id'>) => {
    const created = await api<Record<string, unknown>>('/api/debts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setDebts(prev => [normalizeDebt(created), ...prev]);
  };

  const editDebt = async (id: string, updates: Partial<Omit<Debt, '_id'>>) => {
    const updated = await api<Record<string, unknown>>(`/api/debts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    const d = normalizeDebt(updated);
    setDebts(prev => prev.map(x => x._id === id ? d : x));
  };

  const deleteDebt = async (id: string) => {
    await api(`/api/debts/${id}`, { method: 'DELETE' });
    setDebts(prev => prev.filter(d => d._id !== id));
  };

  const settleDebt = async (id: string) => {
    await editDebt(id, { status: 'Settled' });
  };

  // --- Budgets ---
  const addBudget = async (data: Omit<Budget, '_id'>) => {
    const created = await api<Record<string, unknown>>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const b = normalizeBudget(created);
    setBudgets(prev => {
      const idx = prev.findIndex(x => x.category === data.category && x.month === data.month);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = b;
        return next;
      }
      return [...prev, b];
    });
  };

  const deleteBudget = async (id: string) => {
    await api(`/api/budgets/${id}`, { method: 'DELETE' });
    setBudgets(prev => prev.filter(b => b._id !== id));
  };

  // --- Investments ---
  const addInvestment = async (data: Omit<Investment, '_id'>) => {
    const created = await api<Record<string, unknown>>('/api/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setInvestments(prev => [normalizeInvestment(created), ...prev]);
  };

  const deleteInvestment = async (id: string) => {
    await api(`/api/investments/${id}`, { method: 'DELETE' });
    setInvestments(prev => prev.filter(i => i._id !== id));
  };

  const updateInvestmentValue = async (id: string, newValue: number) => {
    const updated = await api<Record<string, unknown>>(`/api/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ currentValue: newValue }),
    });
    const inv = normalizeInvestment(updated);
    setInvestments(prev => prev.map(i => i._id === id ? inv : i));
  };

  return {
    transactions, debts, budgets, investments, loading,
    addTransaction, editTransaction, deleteTransaction,
    addDebt, editDebt, deleteDebt, settleDebt,
    addBudget, deleteBudget,
    addInvestment, deleteInvestment, updateInvestmentValue,
    refetch: fetchAll,
  };
}
