"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  AlertCircle, 
  CheckSquare, 
  Settings,
  Zap
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* HAMBURGER TOGGLE */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-6 z-30 p-2 rounded-md hover:bg-[var(--bg-avatar)] transition-colors text-slate-400"
      >
        <Menu size={24} />
      </button>

      {/* BACKDROP */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SLIDE-OUT DRAWER */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-[var(--bg-header)] border-r border-[var(--border-color)] shadow-2xl z-50 transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-72 flex flex-col transition-colors duration-300`}
      >
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
               <Zap size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-black tracking-tighter text-[var(--text-strong)]">
              TASK-PILOT
            </h1>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-[var(--bg-avatar)] rounded-md text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</p>
          
          <NavItem href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" close={() => setIsOpen(false)} />
          <NavItem href="/urgent" icon={<AlertCircle size={18} />} label="Urgent Tasks" close={() => setIsOpen(false)} />
          <NavItem href="/tasks" icon={<CheckSquare size={18} />} label="Tasks" close={() => setIsOpen(false)} />
          
          <div className="my-4 border-t border-[var(--border-color)]" />
          
          <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account</p>
          <NavItem href="/settings" icon={<Settings size={18} />} label="Settings" close={() => setIsOpen(false)} />
        </nav>

        {/* Sidebar Footer Removed - Clean empty space at bottom */}
      </aside>
    </>
  );
}

function NavItem({ href, icon, label, close }: { href: string; icon: React.ReactNode; label: string; close: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={close}
      className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-slate-400 rounded-lg hover:bg-[var(--bg-avatar)] hover:text-[var(--text-strong)] transition-all group"
    >
      <span className="group-hover:text-indigo-500 transition-colors">{icon}</span>
      {label}
    </Link>
  );
}