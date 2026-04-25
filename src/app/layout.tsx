"use client";

import { useState } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from './components/sidebar';
import RemindersDropdown from './components/remindersDropdown';
import ProfileDropdown from './components/profileDropdown'; // Ensure you created this file

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  if (savedTheme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="h-full flex overflow-hidden bg-[var(--bg-main)] transition-colors duration-300">
        {/* Left Side: Sidebar */}
        <Sidebar />

        {/* Right Side: Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* TOP NAV BAR */}
          <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between pl-16 pr-8 bg-[var(--bg-header)] transition-colors duration-300 z-10">
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Main</span>
              <span className="text-slate-200">/</span>
              <span className="text-[var(--text-strong)]">Task-Pilot</span>
            </div>
            
            {/* Right-aligned Actions */}
            <div className="flex items-center gap-4">
              <RemindersDropdown />
              
              {/* Profile Section with Toggle Logic */}
              <div className="relative">
                <div 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-4 border-l border-[var(--border-color)] group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-avatar)] border border-[var(--border-color)] flex items-center justify-center shrink-0 overflow-hidden transition-colors shadow-sm group-hover:border-indigo-500">
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      className="w-5 h-5 text-slate-400 mt-1" 
                      strokeWidth="1.5"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-[var(--text-strong)] leading-none">Alvin Kang</p>
                    <p className="text-[9px] text-slate-400 uppercase font-medium mt-1">Account</p>
                  </div>
                </div>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <ProfileDropdown close={() => setIsProfileOpen(false)} />
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-[var(--bg-main)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}