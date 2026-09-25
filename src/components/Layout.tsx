'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Home, Plus, Users, Settings, Target, TrendingUp, X, LogOut, Sparkles } from 'lucide-react';
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
    <div className={cn("min-h-screen flex flex-col bg-[#070b12] text-white", negative ? "selection:bg-red-500/30" : "selection:bg-lime-300/30")}>
      {/* Desktop Top Navigation Bar */}
      <header className="hidden md:flex items-center justify-between px-6 lg:px-12 h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity">
            <span className={cn(
              "w-3.5 h-3.5 rounded-full transition-shadow",
              negative
                ? "bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.85)]"
                : "bg-lime-400 shadow-[0_0_14px_rgba(163,230,53,0.85)]"
            )} />
            <span className="bg-gradient-to-r from-white via-white/95 to-white/70 bg-clip-text text-transparent">FlowFunds</span>
          </Link>
          <nav className="flex items-center gap-1">
            <DesktopNavLink href="/" active={isActive('/')} label="Home" icon={<Home size={16} />} negative={negative} />
            <DesktopNavLink href="/debts" active={isActive('/debts')} label="Debts" icon={<Users size={16} />} negative={negative} />
            <DesktopNavLink href="/budgets" active={isActive('/budgets')} label="Budgets" icon={<Target size={16} />} negative={negative} />
            <DesktopNavLink href="/investments" active={isActive('/investments')} label="Investments" icon={<TrendingUp size={16} />} negative={negative} />
            <DesktopNavLink href="/settings" active={isActive('/settings')} label="Settings" icon={<Settings size={16} />} negative={negative} />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/add"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all active:scale-95 shadow-md",
              negative
                ? "bg-gradient-to-r from-red-500 to-red-400 text-white hover:from-red-400 hover:to-red-300 shadow-red-950/30"
                : "bg-gradient-to-r from-lime-400 to-lime-300 text-black hover:from-lime-300 hover:to-lime-200 shadow-lime-950/20"
            )}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Transaction</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-12">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 relative">
          {children}
        </div>
      </main>

      {/* Mobile More menu modal */}
      {showMenu && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end justify-center" onClick={() => setShowMenu(false)}>
          <div className="glass-card w-full rounded-t-3xl p-6 pb-24 animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
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

      {/* Bottom navigation (Mobile only) */}
      <nav className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 w-full bg-slate-950/85 backdrop-blur-2xl border-t flex justify-around items-center h-14 px-6 pb-safe z-30",
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

const DesktopNavLink = ({
  href,
  active,
  label,
  icon,
  negative,
}: {
  href: string;
  active: boolean;
  label: string;
  icon: React.ReactNode;
  negative: boolean;
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150",
        active
          ? negative
            ? "bg-red-500/20 text-red-300 shadow-sm"
            : "bg-lime-300/15 text-lime-300 shadow-sm"
          : "text-white/60 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
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
