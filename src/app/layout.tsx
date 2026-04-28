"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import Sidebar from './components/sidebar';
import RemindersDropdown from './components/remindersDropdown';
import ProfileDropdown from './components/profileDropdown';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState("Account");
  const pathname = usePathname();

  // Hide header/sidebar on auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Read user name from cookie on mount
  useEffect(() => {
    const match = document.cookie.match(/session_name=([^;]+)/);
    if (match) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserName(decodeURIComponent(match[1]));
    }
  }, [pathname]);

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

        {/* Only show sidebar when logged in */}
        {!isAuthPage && <Sidebar />}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Only show header when logged in */}
          {!isAuthPage && (
            <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between pl-16 pr-8 bg-[var(--bg-header)] transition-colors duration-300 z-10">
              
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Main</span>
                <span className="text-slate-200">/</span>
                <span className="text-[var(--text-strong)]">Task-Pilot</span>
              </div>

              <div className="flex items-center gap-4">
                <RemindersDropdown />

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
                      <p className="text-xs font-bold text-[var(--text-strong)] leading-none">{userName}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-medium mt-1">Account</p>
                    </div>
                  </div>

                  {isProfileOpen && (
                    <ProfileDropdown close={() => setIsProfileOpen(false)} />
                  )}
                </div>
              </div>
            </header>
          )}

          <main className="flex-1 overflow-y-auto bg-[var(--bg-main)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}