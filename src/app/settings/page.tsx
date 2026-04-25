"use client";

import { useState, useEffect } from "react";
import { Moon, Sun} from "lucide-react";

export default function SettingsPage() {
  // 1. Initialize state as null to avoid "hydration" flickering
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  // 2. Load the saved theme when the component first mounts
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDarkMode(isDark);
  }, []);

  // 3. Save to localStorage whenever the user toggles the switch
  useEffect(() => {
    if (isDarkMode === null) return; // Wait until initial load is done

    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Prevent rendering the toggle until we know the theme (prevents "light flash")
  if (isDarkMode === null) return null;

  return (
    <div className="min-h-screen p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-strong)]">Settings</h1>
          <p className="text-slate-500 mt-2">Manage your account preferences and application theme.</p>
        </header>

        <div className="space-y-8">
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Appearance</h2>
            <div className={`p-6 rounded-2xl border transition-all ${isDarkMode ? "bg-slate-800/50 border-slate-700 shadow-xl" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isDarkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                    {isDarkMode ? <Moon size={22} /> : <Sun size={22} />}
                  </div>
                  <div>
                    <p className={`font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Dark Mode</p>
                    <p className="text-sm text-slate-500">Currently using the {isDarkMode ? "dark" : "light"} theme.</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${isDarkMode ? "bg-indigo-600" : "bg-slate-200"}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform transform ${isDarkMode ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Account sections follow similar pattern... */}
        </div>
      </div>
    </div>
  );
}