'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Home, Plus, Users, Settings, Target, TrendingUp, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTone } from './ToneProvider';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const { tone } = useTone();
  const negative = tone === 'negative';

  const isActive = (path: string) => pathname === path;
  const isMoreActive = ['/investments', '/settings'].some(p => pathname === p);

  return (
    <div className={cn("flex flex-col h-screen text-white", negative ? "selection:bg-red-500/30" : "selection:bg-lime-300/30")}>
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto relative">
          {children}
        </div>
      </main>

      {/* More menu modal */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end justify-center sm:items-center" onClick={() => setShowMenu(false)}>
          <div className="glass-card w-full sm:w-80 rounded-t-3xl sm:rounded-3xl p-6 pb-24 sm:pb-6 animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold tracking-tight">More</h3>
              <button onClick={() => setShowMenu(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MenuButton icon={<Target strokeWidth={1.5} />} label="Budgets" href="/budgets" active={isActive('/budgets')} onClick={() => setShowMenu(false)} />
              <MenuButton icon={<TrendingUp strokeWidth={1.5} />} label="Investments" href="/investments" active={isActive('/investments')} onClick={() => setShowMenu(false)} />
              <MenuButton icon={<Settings strokeWidth={1.5} />} label="Settings" href="/settings" active={isActive('/settings')} onClick={() => setShowMenu(false)} />
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/5 transition-colors"
              >
                <LogOut size={20} strokeWidth={1.5} />
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav className={cn(
        "fixed bottom-0 w-full max-w-lg left-1/2 -translate-x-1/2 bg-slate-950/85 backdrop-blur-2xl border-t flex justify-around items-center h-14 px-6 pb-safe z-30",
        negative ? "border-red-500/30" : "border-lime-300/20"
      )}>
        <NavItem icon={<Home strokeWidth={1.5} />} label="Home" active={isActive('/')} href="/" />
        <NavItem icon={<Users strokeWidth={1.5} />} label="Debts" active={isActive('/debts')} href="/debts" />

        <div className="relative -top-4">
          <Link href="/add"
            className={cn(
              "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-90",
              isActive('/add')
                ? (negative
                  ? "bg-gradient-to-br from-red-500 to-red-400 text-white scale-110 shadow-xl shadow-red-900/28"
                  : "bg-gradient-to-br from-lime-400 to-lime-300 text-black scale-110 shadow-xl shadow-lime-900/30")
                : (negative
                  ? "bg-gradient-to-br from-red-500 to-red-400 text-white hover:scale-105 shadow-lg shadow-red-900/20"
                  : "bg-gradient-to-br from-lime-400 to-lime-300 text-black hover:scale-105 shadow-lg shadow-lime-900/20")
            )}
          >
            <Plus size={26} strokeWidth={2.5} />
          </Link>
        </div>

        <NavItem icon={<Target strokeWidth={1.5} />} label="Budgets" active={isActive('/budgets')} href="/budgets" />
        <button
          onClick={() => setShowMenu(true)}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-200",
            isMoreActive ? (negative ? "text-red-400" : "text-lime-300") : "text-white/40"
          )}
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center gap-[3px]">
            <span className="w-4 h-[2px] bg-current rounded-full"></span>
            <span className="w-3 h-[2px] bg-current rounded-full"></span>
            <span className="w-4 h-[2px] bg-current rounded-full"></span>
          </div>
          <span className="text-[11px] font-semibold tracking-wide">More</span>
        </button>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, href }: { icon: React.ReactNode; label: string; active: boolean; href: string }) => {
  const { tone } = useTone();
  const negative = tone === 'negative';
  return (
  <Link href={href}
    className={cn(
      "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-200",
      active ? (negative ? "text-red-400" : "text-lime-300") : "text-white/40"
    )}
  >
    <div className="w-6 h-6 flex items-center justify-center">
      {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 22 })}
    </div>
    <span className="text-[11px] font-semibold tracking-wide">{label}</span>
  </Link>
  );
};

const MenuButton = ({ icon, label, href, onClick, active }: { icon: React.ReactNode; label: string; href: string; onClick: () => void; active: boolean }) => {
  const { tone } = useTone();
  const negative = tone === 'negative';
  return (
  <Link href={href} onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-colors",
      active
        ? (negative ? "bg-red-500/25 text-red-300" : "bg-lime-300/20 text-lime-200")
        : (negative ? "text-white/70 hover:bg-red-500/12" : "text-white/70 hover:bg-lime-300/10")
    )}
  >
    {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 26 })}
    <span className="text-xs font-semibold">{label}</span>
  </Link>
  );
};
