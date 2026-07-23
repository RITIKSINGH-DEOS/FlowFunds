'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFinance } from '@/hooks/useFinance';
import { Mic, Send, Loader2, ChevronDown, ChevronUp, Camera, X, Users, Plus, Trash2 } from 'lucide-react';
import { useToast } from './Toast';
import { format } from 'date-fns';
import { useTone } from './ToneProvider';

export const AddTransaction = () => {
  const router = useRouter();
  const { addTransaction, addDebt } = useFinance();
  const { toast } = useToast();
  const { tone } = useTone();
  const negative = tone === 'negative';
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Expense');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [splitPeople, setSplitPeople] = useState<{ name: string; amount: string }[]>([]);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');

  const done = (msg: string) => { toast(msg, 'success'); router.push('/'); };

  const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; setReceiptFile(f); setReceiptPreview(URL.createObjectURL(f)); };
  const clearReceipt = () => { setReceiptFile(null); if (receiptPreview) URL.revokeObjectURL(receiptPreview); setReceiptPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const uploadReceipt = async (): Promise<string> => {
    if (!receiptFile) return '';
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', receiptFile);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      return data.url || '';
    } catch { return ''; } finally { setIsUploading(false); }
  };

  const addSplitPerson = () => setSplitPeople(p => [...p, { name: '', amount: '' }]);
  const removeSplitPerson = (i: number) => setSplitPeople(p => p.filter((_, j) => j !== i));
  const updateSplitPerson = (i: number, field: 'name' | 'amount', v: string) => setSplitPeople(p => p.map((x, j) => j === i ? { ...x, [field]: v } : x));

  const getMyShare = (): number => {
    const total = Number(amount) || 0;
    if (!showSplit || splitPeople.length === 0) return total;
    if (splitMethod === 'equal') return Math.round(total / (splitPeople.length + 1));
    return total - splitPeople.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  };
  const getSplitAmounts = () => {
    const total = Number(amount) || 0;
    if (splitMethod === 'equal') { const pp = Math.round(total / (splitPeople.length + 1)); return splitPeople.filter(p => p.name.trim()).map(p => ({ name: p.name.trim(), amount: pp })); }
    return splitPeople.filter(p => p.name.trim() && Number(p.amount) > 0).map(p => ({ name: p.name.trim(), amount: Number(p.amount) }));
  };

  const getGroqKey = () => localStorage.getItem('groq_api_key') || '';

  const handleTextSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault(); if (!text.trim()) return;
    const groqKey = getGroqKey();
    if (!groqKey) { toast("Add your Groq API key in Settings first.", 'error'); return; }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, apiKey: groqKey }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      await saveParsedData(await res.json());
    }
    catch (err: any) { toast(err?.message || "Couldn't understand. Try manual entry.", 'error'); }
    finally { setIsProcessing(false); setText(''); }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!amount) return;
    setIsProcessing(true);
    try {
      const receiptUrl = await uploadReceipt();
      const myShare = getMyShare();
      await addTransaction({ date: new Date(date).toISOString(), amount: myShare, currency: 'INR', type, category, description: showSplit ? `${description} (split ${splitPeople.length + 1} ways)` : description, notes: showSplit ? `Total: ₹${amount}` : '', tags: '', receiptUrl });
      if (showSplit) { for (const s of getSplitAmounts()) { await addDebt({ person: s.name, amount: s.amount, type: 'Lent', status: 'Pending', dueDate: '', notes: `Split: ${description || category}` }); } }
      done(showSplit ? `Split ₹${amount} — your share ₹${myShare}` : `Added ₹${amount} ${type}`);
    } catch { toast('Failed to save', 'error'); } finally { setIsProcessing(false); }
  };

  const toggleRecording = async () => {
    if (isProcessing) return;

    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      return;
    }

    const groqKey = getGroqKey();
    if (!groqKey) { toast("Add your Groq API key in Settings first.", 'error'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr; audioChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const actualType = mr.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: actualType });
        const reader = new FileReader(); reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          setIsProcessing(true);
          try {
            const res = await fetch('/api/ai/parse-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: (reader.result as string).split(',')[1], mimeType: actualType, apiKey: getGroqKey() }),
            });
            if (!res.ok) throw new Error('Audio parsing failed');
            await saveParsedData(await res.json());
          }
          catch { toast("Couldn't understand audio.", 'error'); } finally { setIsProcessing(false); }
        };
      };
      mr.start(); setIsRecording(true);
    } catch { toast("Microphone access denied", 'error'); }
  };

  const saveParsedData = async (data: any) => {
    const items = Array.isArray(data) ? data : [data];
    const valid = items.filter((p: any) => p.amount && p.recordType);
    if (valid.length === 0) throw new Error("Incomplete data");

    for (const p of valid) {
      if (p.recordType === 'debt') {
        await addDebt({ person: p.person || 'Unknown', amount: p.amount, type: p.type as 'Lent' | 'Borrowed', status: 'Pending', dueDate: '', notes: '' });
      } else {
        let txDate: string; try { txDate = p.date ? new Date(p.date).toISOString() : new Date().toISOString(); } catch { txDate = new Date().toISOString(); }
        await addTransaction({ date: txDate, amount: p.amount, currency: p.currency || 'INR', type: p.type, category: p.category || 'Other', description: p.description || '', notes: '', tags: '', receiptUrl: '' });
      }
    }

    if (valid.length === 1) {
      const p = valid[0];
      done(p.recordType === 'debt' ? `${p.type === 'Lent' ? 'Lent to' : 'Borrowed from'} ${p.person || 'Unknown'} — ₹${p.amount}` : `₹${p.amount} ${p.type}`);
    } else {
      done(`Added ${valid.length} entries`);
    }
  };

  const inputCls = `w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none focus:ring-2 ${negative ? 'focus:ring-red-500/35' : 'focus:ring-lime-300/30'} placeholder:text-black/25 dark:placeholder:text-white/25`;

  return (
    <div className="px-5 pt-12 pb-4 h-full flex flex-col overflow-y-auto">
      <h2 className="text-2xl font-bold tracking-tight mb-6">New Entry</h2>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        {/* Mic button */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {isRecording && <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />}
          <button onClick={toggleRecording} disabled={isProcessing}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${isRecording ? 'bg-red-500 text-white scale-105' : (negative ? 'bg-gradient-to-br from-red-500 to-red-400 text-white active:scale-90' : 'bg-gradient-to-br from-lime-400 to-lime-300 text-black active:scale-90')} ${isProcessing ? 'opacity-40' : ''}`}>
            {isProcessing ? <Loader2 className="animate-spin" size={28} /> : isRecording ? <div className="w-6 h-6 bg-white rounded-sm" /> : <Mic size={28} strokeWidth={1.5} />}
          </button>
        </div>
        <p className="text-[13px] text-black/40 dark:text-white/40 text-center font-medium max-w-[260px] leading-relaxed">
          {isProcessing ? "Processing..." : isRecording ? "Tap to stop recording" : "Tap to speak — \"chai 200\" or \"gave Rahul 500\""}
        </p>

        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center gap-4"><div className="flex-1 h-px bg-black/[0.08] dark:bg-white/[0.08]" /><span className="text-[11px] font-semibold uppercase tracking-wider text-black/30 dark:text-white/30">OR</span><div className="flex-1 h-px bg-black/[0.08] dark:bg-white/[0.08]" /></div>

          {/* Text input */}
          <form onSubmit={handleTextSubmit} className="relative">
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type natural language..." disabled={isProcessing || isRecording}
              className={`w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl py-3.5 pl-4 pr-12 text-[14px] font-medium focus:outline-none focus:ring-2 ${negative ? 'focus:ring-red-500/35' : 'focus:ring-lime-300/30'} disabled:opacity-40 placeholder:text-black/30 dark:placeholder:text-white/30`} />
            <button type="submit" disabled={!text.trim() || isProcessing} className={`absolute right-2 top-2 bottom-2 bg-gradient-to-r ${negative ? 'from-red-500 to-red-400 text-white' : 'from-lime-400 to-lime-300 text-black'} px-3 rounded-xl disabled:opacity-20 transition-opacity`}><Send size={16} /></button>
          </form>

          {/* Manual toggle */}
          <button onClick={() => setShowManual(!showManual)} className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-black/40 dark:text-white/40 py-2">
            {showManual ? <ChevronUp size={15} /> : <ChevronDown size={15} />}Manual Entry
          </button>

          {showManual && (
            <form onSubmit={handleManualSubmit} className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
              <div className="flex gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl">
                {['Expense', 'Income', 'Transfer'].map(t => (
                  <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all ${type === t ? (negative ? 'bg-red-500 text-white shadow-sm' : 'bg-lime-300 text-black shadow-sm') : 'text-black/40 dark:text-white/40'}`}>{t}</button>
                ))}
              </div>
              <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} required />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
              <select value={category} onChange={e => setCategory(e.target.value)} className={`${inputCls} appearance-none select-styled`}>
                {['Food', 'Travel', 'Entertainment', 'Bills', 'EMI', 'Shopping', 'Salary', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className={inputCls} />

              {/* Receipt */}
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleReceiptSelect} className="hidden" />
              {receiptPreview ? (
                <div className="relative">
                  <img src={receiptPreview} alt="Receipt" className="w-full h-32 object-cover rounded-xl" />
                  <button type="button" onClick={clearReceipt} className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full"><X size={12} /></button>
                  {isUploading && <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center"><Loader2 className="animate-spin text-white" size={20} /></div>}
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-3 border border-dashed border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 text-[12px] font-medium text-black/35 dark:text-white/35">
                  <Camera size={15} />Attach Receipt
                </button>
              )}

              {/* Split */}
              {type === 'Expense' && (
                <div>
                  <button type="button" onClick={() => { setShowSplit(!showSplit); if (!showSplit && splitPeople.length === 0) addSplitPerson(); }}
                    className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-all ${showSplit ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-black/[0.04] dark:bg-white/[0.06] text-black/40 dark:text-white/40'}`}>
                    <Users size={14} />{showSplit ? 'Splitting this' : 'Split with others'}
                  </button>
                  {showSplit && (
                    <div className="mt-3 space-y-3">
                      <div className="flex gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg">
                        <button type="button" onClick={() => setSplitMethod('equal')} className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold ${splitMethod === 'equal' ? (negative ? 'bg-red-500 text-white shadow-sm' : 'bg-lime-300 text-black shadow-sm') : 'text-black/40 dark:text-white/40'}`}>Equal</button>
                        <button type="button" onClick={() => setSplitMethod('custom')} className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold ${splitMethod === 'custom' ? (negative ? 'bg-red-500 text-white shadow-sm' : 'bg-lime-300 text-black shadow-sm') : 'text-black/40 dark:text-white/40'}`}>Custom</button>
                      </div>
                      {splitPeople.map((p, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input type="text" placeholder="Name" value={p.name} onChange={e => updateSplitPerson(i, 'name', e.target.value)} className="flex-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] font-medium focus:outline-none placeholder:text-black/25 dark:placeholder:text-white/25" />
                          {splitMethod === 'custom' && <input type="number" placeholder="₹" value={p.amount} onChange={e => updateSplitPerson(i, 'amount', e.target.value)} className="w-20 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg px-3 py-2.5 text-[13px] font-medium focus:outline-none" />}
                          <button type="button" onClick={() => removeSplitPerson(i)} className="p-1.5 text-black/25 dark:text-white/25 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <button type="button" onClick={addSplitPerson} className="w-full py-2 border border-dashed border-black/10 dark:border-white/10 rounded-lg text-[11px] font-semibold text-black/30 dark:text-white/30 flex items-center justify-center gap-1"><Plus size={12} />Add Person</button>
                      {amount && splitPeople.some(p => p.name.trim()) && (
                        <div className="bg-blue-500/[0.05] p-3.5 rounded-xl space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-black/35 dark:text-white/35">Split Summary</p>
                          <div className="flex justify-between text-[13px]"><span className="font-medium">Your share</span><span className="font-bold">₹{getMyShare().toLocaleString()}</span></div>
                          {getSplitAmounts().map((s, i) => <div key={i} className="flex justify-between text-[12px]"><span className="text-black/50 dark:text-white/50">{s.name} owes</span><span className="font-semibold text-green-600 dark:text-green-400">₹{s.amount.toLocaleString()}</span></div>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button type="submit" disabled={isProcessing || isUploading} className={`w-full bg-gradient-to-r ${negative ? 'from-red-500 to-red-400 text-white' : 'from-lime-400 to-lime-300 text-black'} py-3.5 rounded-xl font-semibold text-[14px] disabled:opacity-30`}>
                {isProcessing || isUploading ? 'Saving...' : showSplit && splitPeople.length > 0 ? `Split — ₹${getMyShare().toLocaleString()} your share` : 'Save'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
