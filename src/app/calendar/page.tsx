"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-500/20 text-red-400 border-red-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Low: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  useEffect(() => {
    const saved = localStorage.getItem("task-pilot-storage");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  const getTasksForDate = (dateStr: string) => tasks.filter(t => t.dueDate === dateStr);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 text-[var(--text-strong)]">
          <h1 className="text-4xl font-black tracking-tighter">Calendar</h1>
          <div className="flex items-center gap-4 bg-[var(--bg-header)] p-2 px-4 rounded-xl border border-[var(--border-color)]">
             <button onClick={() => setCurrentMonth(m => m - 1)}><ChevronLeft/></button>
             <span className="font-bold text-sm w-32 text-center">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}</span>
             <button onClick={() => setCurrentMonth(m => m + 1)}><ChevronRight/></button>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-3">
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} />;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayTasks = getTasksForDate(dateStr);

            return (
              <div key={dateStr} className="min-h-[140px] rounded-2xl p-3 border border-[var(--border-color)] bg-[var(--bg-header)]">
                <span className="text-xs font-black text-slate-300">{day}</span>
                <div className="mt-2 space-y-1">
                  {dayTasks.map(task => (
                    <div key={task.id} className={`text-[9px] p-2 rounded-lg border truncate font-bold ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium}`}>
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}