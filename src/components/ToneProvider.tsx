'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Tone = 'positive' | 'negative';

const ToneContext = createContext<{ tone: Tone }>({ tone: 'positive' });

export const useTone = () => useContext(ToneContext);

export const ToneProvider = ({ children }: { children: React.ReactNode }) => {
  const [tone, setTone] = useState<Tone>('positive');

  useEffect(() => {
    let cancelled = false;

    const fetchTone = async () => {
      try {
        const res = await fetch('/api/transactions');
        if (!res.ok) {
          if (!cancelled) setTone('positive');
          return;
        }
        const txs: Array<{ amount?: unknown; type?: string }> = await res.json();
        const net = txs.reduce((acc, t) => {
          const amt = Number(t.amount) || 0;
          if (t.type === 'Income') return acc + amt;
          if (t.type === 'Expense') return acc - amt;
          return acc;
        }, 0);
        if (!cancelled) setTone(net < 0 ? 'negative' : 'positive');
      } catch {
        if (!cancelled) setTone('positive');
      }
    };

    fetchTone();
    const id = window.setInterval(fetchTone, 6000);
    const onChange = () => { fetchTone(); };
    window.addEventListener('flowfunds:transactions-changed', onChange);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener('flowfunds:transactions-changed', onChange);
    };
  }, []);

  const value = useMemo(() => ({ tone }), [tone]);
  return <ToneContext.Provider value={value}>{children}</ToneContext.Provider>;
};

