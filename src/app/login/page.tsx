'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Key, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    setKeySaved(!!localStorage.getItem('groq_api_key'));
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('groq_api_key', apiKey.trim());
    setKeySaved(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen px-6 text-center text-white">
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-1">FlowFunds</h1>
        <p className="text-[13px] text-white/65 mb-8">Track income, expenses, and goals with confidence.</p>
        <div className="w-16 h-16 bg-gradient-to-br from-[#5f259f] to-[#7c3aed] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-950/40">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Sign In</h2>
        <p className="text-[13px] text-white/60 mb-8 max-w-[280px] leading-relaxed">Sign in to sync securely across devices.</p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/', prompt: 'select_account' })}
          className="w-full max-w-sm bg-gradient-to-r from-[#5f259f] to-[#7c3aed] hover:from-[#501f86] hover:to-[#6d28d9] text-white py-3.5 rounded-xl font-semibold text-[15px] transition-all active:scale-[0.98] shadow-md shadow-purple-950/30"
        >
          Sign in with Google
        </button>

        <div className="w-full max-w-sm flex items-center my-4">
          <div className="flex-1 border-t border-white/10" />
          <span className="px-3 text-[11px] text-white/40 uppercase tracking-wider font-semibold">or</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        <button
          onClick={() => signIn('demo-login', { callbackUrl: '/' })}
          className="w-full max-w-sm bg-white/10 hover:bg-white/15 text-white py-3.5 rounded-xl font-semibold text-[14px] transition-all active:scale-[0.98] border border-white/10"
        >
          Continue with Demo Account
        </button>

        <div className="w-full max-w-sm mt-8 space-y-3 text-left">
          <p className="text-[11px] text-white/50 text-center">Optional AI key: console.groq.com</p>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
              <Key className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Paste Groq API key"
              className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-[13px] font-medium font-mono focus:outline-none focus:ring-2 focus:ring-purple-400/40 placeholder:text-white/35"
            />
            <button onClick={() => setShowKey(!showKey)} className="p-2 text-white/50">
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button onClick={handleSaveKey} disabled={!apiKey.trim()} className="w-full bg-[#5f259f]/30 hover:bg-[#5f259f]/50 border border-purple-500/20 text-purple-200 py-2.5 rounded-xl font-semibold text-[13px] disabled:opacity-25 transition-opacity">
            {keySaved ? 'API Key Saved' : 'Save API Key'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-auto pt-8 pb-4 text-center space-y-2">
      <div className="flex items-center justify-center gap-3 text-[11px] text-white/45">
        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
      </div>
      <p className="text-[10px] text-white/35">© {new Date().getFullYear()} FlowFunds</p>
    </div>
  );
}
