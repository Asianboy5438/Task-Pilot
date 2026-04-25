"use client";

import { LogOut, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

export default function ProfileDropdown({ close }: { close: () => void }) {
  return (
    <>
      {/* Invisible backdrop to close when clicking outside */}
      <div className="fixed inset-0 z-40" onClick={close} />
      
      <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-header)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-2 space-y-1">
          
          <Link 
            href="/login" 
            onClick={close}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-[var(--bg-avatar)] hover:text-[var(--text-strong)] rounded-lg transition-all"
          >
            <LogIn size={18} />
            Sign In
          </Link>

          <Link 
            href="/signup" 
            onClick={close}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-[var(--bg-avatar)] hover:text-[var(--text-strong)] rounded-lg transition-all"
          >
            <UserPlus size={18} />
            Create Account
          </Link>

          <div className="my-1 border-t border-[var(--border-color)]" />

          <button 
            onClick={() => {
              console.log("Logging out...");
              close();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut size={18} />
            Log Out
          </button>
          
        </div>
      </div>
    </>
  );
}