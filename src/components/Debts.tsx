'use client';

import React, { useState } from 'react';
import { useFinance, type Debt } from '@/hooks/useFinance';
import { CheckCircle, Clock, MessageCircle, UserPlus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from './Toast';
import { format, parseISO, isPast } from 'date-fns';

export const Debts = () => {
  const { debts, addDebt, settleDebt, editDebt, deleteDebt } = useFinance();
  const { toast, confirm } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Lent' | 'Borrowed'>('Lent');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Debt>>({});
  const [pendingPage, setPendingPage] = useState(1);
  const [settledPage, setSettledPage] = useState(1);
  const DEBTS_PER_PAGE = 10;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); if (!person || !amount) return;
    await addDebt({ person, amount: Number(amount), type, dueDate, status: 'Pending', notes: '' });
    toast(`${type === 'Lent' ? 'Lent to' : 'Borrowed from'} ${person}`);
    setPerson(''); setAmount(''); setDueDate(''); setShowAdd(false);
  };

  const startEdit = (d: Debt) => { setEditingId(d._id); setEditForm({ person: d.person, amount: d.amount, type: d.type, dueDate: d.dueDate }); };
  const saveEdit = async () => { if (!editingId) return; await editDebt(editingId, { person: editForm.person, amount: editForm.amount !== undefined ? Number(editForm.amount) : undefined, type: editForm.type, dueDate: editForm.dueDate }); setEditingId(null); toast('Updated'); };
  const handleDelete = (id: string) => { confirm('Delete this debt?', async () => { await deleteDebt(id); toast('Deleted'); }); };

  const pending = debts.filter(d => d.status === 'Pending');
  const settled = debts.filter(d => d.status === 'Settled');
  const totalLent = pending.filter(d => d.type === 'Lent').reduce((s, d) => s + d.amount, 0);
  const totalBorrowed = pending.filter(d => d.type === 'Borrowed').reduce((s, d) => s + d.amount, 0);

  const sendReminder = (d: Debt) => { window.open(`https://wa.me/?text=${encodeURIComponent(`Hey ${d.person}, quick reminder about the ₹${d.amount} you owe me. Let me know when you can settle it!`)}`, '_blank'); };

  const inputCls = "w-full bg-white/[0.06] rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-purple-400/40 placeholder:text-white/25 text-white";

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Debts & IOUs</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">Track money you lent and money you borrowed</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5f259f] to-[#7c3aed] hover:from-[#501f86] hover:to-[#6d28d9] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-purple-950/20 w-fit"
        >
          {showAdd ? <X size={15} /> : <UserPlus size={15} />}{showAdd ? 'Cancel' : 'Add New Debt'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Total You Are Owed (Lent)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-green-400 mt-1.5">₹{totalLent.toLocaleString()}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Total You Owe (Borrowed)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-400 mt-1.5">₹{totalBorrowed.toLocaleString()}</p>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 max-w-2xl mx-auto">
          <div className="flex gap-1 p-1 bg-white/[0.06] rounded-xl">
            {(['Lent', 'Borrowed'] as const).map(t => (
              <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${type === t ? 'bg-gradient-to-r from-[#5f259f] to-[#7c3aed] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}>
                {t === 'Lent' ? 'I Lent' : 'I Borrowed'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Person name" value={person} onChange={e => setPerson(e.target.value)} className={inputCls} required />
            <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} required />
          </div>
          <div><label className="text-xs font-medium text-white/50 ml-1">Due date (optional)</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`${inputCls} mt-1`} /></div>
          <button type="submit" className="w-full bg-gradient-to-r from-[#5f259f] to-[#7c3aed] hover:from-[#501f86] hover:to-[#6d28d9] text-white py-3 rounded-xl font-semibold text-sm shadow-md shadow-purple-950/30 transition-all">Save Debt Record</button>
        </form>
      )}

      {pending.length > 0 && (() => {
        const totalPendingPages = Math.max(1, Math.ceil(pending.length / DEBTS_PER_PAGE));
        const paginatedPending = pending.slice((pendingPage - 1) * DEBTS_PER_PAGE, pendingPage * DEBTS_PER_PAGE);
        return (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Pending ({pending.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedPending.map(d => {
            const overdue = d.dueDate && isPast(parseISO(d.dueDate));
            if (editingId === d._id) return (
              <div key={d._id} className="glass-card p-4 rounded-2xl border border-white/10 shadow-sm space-y-3">
                <div className="flex gap-1 p-1 bg-white/[0.06] rounded-lg">
                  {(['Lent', 'Borrowed'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setEditForm(f => ({ ...f, type: t }))} className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold ${editForm.type === t ? 'bg-gradient-to-r from-[#5f259f] to-[#7c3aed] text-white shadow-sm' : 'text-white/40'}`}>{t === 'Lent' ? 'Lent' : 'Borrowed'}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={editForm.person ?? ''} onChange={e => setEditForm(f => ({ ...f, person: e.target.value }))} className="bg-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] font-medium focus:outline-none text-white placeholder:text-white/25" placeholder="Person" />
                  <input type="number" value={editForm.amount ?? ''} onChange={e => setEditForm(f => ({ ...f, amount: Number(e.target.value) }))} className="bg-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] font-medium focus:outline-none text-white placeholder:text-white/25" placeholder="Amount" />
                </div>
                <input type="date" value={editForm.dueDate ?? ''} onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] font-medium focus:outline-none text-white" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-[12px] font-semibold text-white/40 hover:text-white">Cancel</button>
                  <button onClick={saveEdit} className="px-4 py-1.5 text-[12px] font-semibold bg-gradient-to-r from-[#5f259f] to-[#7c3aed] text-white rounded-lg">Save</button>
                </div>
              </div>
            );
            return (
              <div key={d._id} className="glass-card p-4 rounded-2xl border border-white/10 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h4 className="font-bold text-[15px]">{d.person}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[11px] font-semibold ${d.type === 'Lent' ? 'text-green-400' : 'text-red-400'}`}>{d.type === 'Lent' ? 'Owes you' : 'You owe'}</span>
                      <span className="text-[11px] text-white/25">·</span>
                      <Clock size={11} className={overdue ? 'text-red-400' : 'text-white/25'} />
                      <span className={`text-[11px] ${overdue ? 'text-red-400 font-semibold' : 'text-white/35'}`}>{d.dueDate ? format(parseISO(d.dueDate), 'MMM d') : 'No date'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[17px] font-bold">₹{d.amount.toLocaleString()}</span>
                    <button onClick={() => startEdit(d)} className="p-1.5 text-white/30 hover:text-white"><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(d._id)} className="p-1.5 text-white/30 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                  <button onClick={async () => { await settleDebt(d._id); toast(`Settled with ${d.person}`); }}
                    className="flex-1 bg-white/[0.06] hover:bg-white/10 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white transition-colors">
                    <CheckCircle size={14} />Settle
                  </button>
                  {d.type === 'Lent' && (
                    <button onClick={() => sendReminder(d)} className="flex-1 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/20 text-purple-300 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-colors">
                      <MessageCircle size={14} />Remind
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          </div>
          {totalPendingPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setPendingPage(p => Math.max(1, p - 1))} disabled={pendingPage === 1}
                className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/10 disabled:opacity-30 transition-opacity"><ChevronLeft size={16} /></button>
              <span className="text-[12px] font-semibold text-white/40">{pendingPage} / {totalPendingPages}</span>
              <button onClick={() => setPendingPage(p => Math.min(totalPendingPages, p + 1))} disabled={pendingPage === totalPendingPages}
                className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/10 disabled:opacity-30 transition-opacity"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
        );
      })()}

      {settled.length > 0 && (() => {
        const totalSettledPages = Math.max(1, Math.ceil(settled.length / DEBTS_PER_PAGE));
        const paginatedSettled = settled.slice((settledPage - 1) * DEBTS_PER_PAGE, settledPage * DEBTS_PER_PAGE);
        return (
        <div className="space-y-3 opacity-60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Settled ({settled.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paginatedSettled.map(d => (
            <div key={d._id} className="glass-card px-4 py-3 rounded-xl border border-white/5 flex justify-between items-center">
              <div><p className="text-[13px] font-semibold line-through text-white/70">{d.person}</p><p className="text-[10px] text-white/35">{d.type}</p></div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-white/40">₹{d.amount.toLocaleString()}</span>
                <button onClick={() => handleDelete(d._id)} className="p-1 text-white/20 hover:text-red-400"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          </div>
          {totalSettledPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setSettledPage(p => Math.max(1, p - 1))} disabled={settledPage === 1}
                className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/10 disabled:opacity-30 transition-opacity"><ChevronLeft size={16} /></button>
              <span className="text-[12px] font-semibold text-white/40">{settledPage} / {totalSettledPages}</span>
              <button onClick={() => setSettledPage(p => Math.min(totalSettledPages, p + 1))} disabled={settledPage === totalSettledPages}
                className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/10 disabled:opacity-30 transition-opacity"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
        );
      })()}

      {debts.length === 0 && !showAdd && <div className="py-10 text-center glass-card rounded-2xl"><p className="text-[13px] text-white/30">No debts yet</p></div>}
    </div>
  );
};
