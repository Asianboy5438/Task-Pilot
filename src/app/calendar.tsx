"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface Task {
  id: number;
  text: string;
  date: string; // YYYY-MM-DD
  priority: "HIGH" | "MEDIUM" | "LOW";
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  LOW: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"HIGH"|"MEDIUM"|"LOW">("MEDIUM");

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const openModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  const addTask = () => {
    if (!newTaskText.trim() || !selectedDate) return;
    setTasks(prev => [...prev, {
      id: Date.now(),
      text: newTaskText.trim(),
      date: selectedDate,
      priority: newTaskPriority,
    }]);
    setNewTaskText("");
    setNewTaskPriority("MEDIUM");
    setShowModal(false);
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getTasksForDate = (dateStr: string) =>
    tasks.filter(t => t.date === dateStr);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  // Build grid cells (empty + day cells)
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-strong)]">Calendar</h1>
            <p className="text-slate-500 mt-1 text-sm">Click any day to add an assignment.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-[var(--bg-avatar)] text-slate-400 hover:text-[var(--text-strong)] transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-lg font-bold text-[var(--text-strong)] w-44 text-center">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-[var(--bg-avatar)] text-slate-400 hover:text-[var(--text-strong)] transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;

            const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const dayTasks = getTasksForDate(dateStr);
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                onClick={() => openModal(dateStr)}
                className={`min-h-[100px] rounded-xl p-2 border cursor-pointer transition-all group
                  ${isToday
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-[var(--border-color)] bg-[var(--bg-header)] hover:border-indigo-500/50 hover:bg-[var(--bg-avatar)]"
                  }`}
              >
                {/* Day number */}
                <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? "bg-indigo-600 text-white" : "text-slate-400 group-hover:text-[var(--text-strong)]"}`}>
                  {day}
                </div>

                {/* Tasks */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer hover:opacity-70 transition-opacity ${PRIORITY_COLORS[task.priority]}`}
                      title={`${task.text} (click to delete)`}
                    >
                      {task.text}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-slate-500 pl-1">+{dayTasks.length - 3} more</div>
                  )}
                </div>

                {/* Add hint */}
                {dayTasks.length === 0 && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center mt-2">
                    <Plus size={12} className="text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[var(--bg-header)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-[var(--text-strong)]">Add Assignment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">{selectedDate}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTask()}
                  placeholder="e.g. CGT 390 Checkpoint 3"
                  className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-strong)] placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(["HIGH","MEDIUM","LOW"] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all
                        ${newTaskPriority === p
                          ? PRIORITY_COLORS[p] + " scale-105"
                          : "border-[var(--border-color)] text-slate-500 hover:border-slate-500"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={addTask}
                disabled={!newTaskText.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors"
              >
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}