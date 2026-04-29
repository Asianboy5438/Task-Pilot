"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
}

export default function CalendarPage() {
  const [tasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("task-pilot-storage");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const getTasksForDate = (dateStr: string) => tasks.filter(t => t.dueDate === dateStr);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-10">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-[var(--text-strong)]">Calendar Sync</h1>
        <div className="flex items-center gap-4 bg-[var(--bg-header)] p-2 px-4 rounded-xl border border-[var(--border-color)]">
          <button onClick={() => setCurrentMonth(m => m - 1)}><ChevronLeft/></button>
          <span className="font-bold text-sm uppercase">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}</span>
          <button onClick={() => setCurrentMonth(m => m + 1)}><ChevronRight/></button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-3">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayTasks = getTasksForDate(dateStr);

          return (
            <div key={dateStr} className="min-h-[120px] rounded-2xl p-3 border border-[var(--border-color)] bg-[var(--bg-header)]">
              <span className="text-xs font-black text-slate-300">{day}</span>
              <div className="mt-2 space-y-1">
                {dayTasks.map(t => (
                  <div key={t.id} className="text-[9px] p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-bold truncate">
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}