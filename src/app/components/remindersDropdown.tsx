"use client";

import { useState } from "react";
import { Bell, X, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { useTasks } from "../../context/TaskContext";

export default function RemindersDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { tasks } = useTasks();

  // Build smart reminders from tasks
  const now = new Date();
  const _todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Helper: get a Date object from a task's dueDate + dueTime
  const getDueDateTime = (dueDate: string, dueTime: string) => {
    if (!dueDate) return null;
    const [y, m, d] = dueDate.split("-").map(Number);
    if (dueTime) {
      const [h, min] = dueTime.split(":").map(Number);
      return new Date(y, m - 1, d, h, min);
    }
    // No time — treat as end of day
    return new Date(y, m - 1, d, 23, 59);
  };

  const formatDue = (dueDate: string, dueTime: string) => {
    if (!dueDate) return "";
    const due = getDueDateTime(dueDate, dueTime);
    if (!due) return "";
    const diffMs = due.getTime() - now.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffMs < 0) return "Overdue";
    if (diffHrs < 1) return "Due in less than an hour";
    if (diffHrs < 24) return `Due in ${Math.round(diffHrs)} hour${Math.round(diffHrs) !== 1 ? "s" : ""}`;
    if (diffDays < 2) return "Due tomorrow";
    if (diffDays <= 7) return `Due in ${Math.floor(diffDays)} days`;

    const [y, m, d] = dueDate.split("-");
    const dateStr = `${m}/${d}/${y}`;
    if (!dueTime) return `Due ${dateStr}`;
    const [hRaw, min] = dueTime.split(":");
    const h = parseInt(hRaw, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `Due ${dateStr} at ${h12}:${min} ${ampm}`;
  };

  const incomplete = tasks.filter(t => !t.completed && t.dueDate);

  // HIGH priority — always show
  const highPriority = incomplete
    .filter(t => t.priority === "High")
    .sort((a, b) => {
      const da = getDueDateTime(a.dueDate, a.dueTime)?.getTime() ?? Infinity;
      const db = getDueDateTime(b.dueDate, b.dueTime)?.getTime() ?? Infinity;
      return da - db;
    });

  // APPROACHING — Medium/Low tasks due within 48 hours
  const approaching = incomplete
    .filter(t => {
      if (t.priority === "High") return false; // already shown above
      const due = getDueDateTime(t.dueDate, t.dueTime);
      if (!due) return false;
      const diffHrs = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHrs >= 0 && diffHrs <= 48;
    })
    .sort((a, b) => {
      const da = getDueDateTime(a.dueDate, a.dueTime)?.getTime() ?? Infinity;
      const db = getDueDateTime(b.dueDate, b.dueTime)?.getTime() ?? Infinity;
      return da - db;
    });

  // OVERDUE — any priority, past due, not completed
  const overdue = incomplete.filter(t => {
    const due = getDueDateTime(t.dueDate, t.dueTime);
    return due && due.getTime() < now.getTime();
  });

  const totalCount = highPriority.length + approaching.length + overdue.length;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-[var(--bg-avatar)] relative transition-colors"
      >
        <Bell size={22} className="text-slate-400" />
        {totalCount > 0 && (
          <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--bg-header)]" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-header)] border border-[var(--border-color)] rounded-lg shadow-2xl z-50 overflow-hidden transition-colors duration-300">
            <div className="absolute -top-1.5 right-3 w-3 h-3 bg-[var(--bg-header)] border-t border-l border-[var(--border-color)] rotate-45" />

            <div className="relative">
              <div className="px-4 py-3 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-main)]/50">
                <h3 className="text-sm font-bold text-[var(--text-strong)]">Reminders</h3>
                {totalCount > 0 && (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {totalCount} alert{totalCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="max-h-[420px] overflow-y-auto">

                {/* Overdue */}
                {overdue.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-red-500/10 border-b border-red-200/30">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">🔴 Overdue</p>
                    </div>
                    {overdue.map(task => (
                      <div key={`od-${task.id}`} className="border-b border-[var(--border-color)] last:border-0">
                        <Link href="/" onClick={() => setIsOpen(false)}
                          className="flex gap-3 p-4 hover:bg-red-50/20 transition-colors"
                        >
                          <X size={16} className="text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[13px] font-bold text-[var(--text-strong)] leading-tight">{task.title}</p>
                            {task.class && task.class !== "General" && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{task.class}</p>
                            )}
                            <p className="text-[10px] text-red-500 mt-1.5 font-black uppercase tracking-tighter">Overdue</p>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </>
                )}

                {/* High Priority */}
                {highPriority.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-orange-500/10 border-b border-orange-200/30">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">⚠ High Priority</p>
                    </div>
                    {highPriority.map(task => (
                      <div key={`hp-${task.id}`} className="border-b border-[var(--border-color)] last:border-0">
                        <Link href="/" onClick={() => setIsOpen(false)}
                          className="flex gap-3 p-4 hover:bg-orange-50/20 transition-colors"
                        >
                          <AlertTriangle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[13px] font-bold text-[var(--text-strong)] leading-tight">{task.title}</p>
                            {task.class && task.class !== "General" && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{task.class}</p>
                            )}
                            <p className="text-[10px] text-orange-400 mt-1.5 font-black uppercase tracking-tighter">
                              {formatDue(task.dueDate, task.dueTime)}
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </>
                )}

                {/* Approaching (due within 48hrs, not high priority) */}
                {approaching.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-200/30">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">🕐 Due Soon</p>
                    </div>
                    {approaching.map(task => (
                      <div key={`ap-${task.id}`} className="border-b border-[var(--border-color)] last:border-0">
                        <Link href="/" onClick={() => setIsOpen(false)}
                          className="flex gap-3 p-4 hover:bg-amber-50/20 transition-colors"
                        >
                          <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[13px] font-bold text-[var(--text-strong)] leading-tight">{task.title}</p>
                            {task.class && task.class !== "General" && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{task.class}</p>
                            )}
                            <p className="text-[10px] text-amber-500 mt-1.5 font-black uppercase tracking-tighter">
                              {formatDue(task.dueDate, task.dueTime)}
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </>
                )}

                {totalCount === 0 && (
                  <div className="p-10 text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-sm font-bold text-slate-400">All caught up!</p>
                    <p className="text-xs text-slate-400 mt-1">No urgent tasks right now</p>
                  </div>
                )}
              </div>

              <Link
                href="/calendar"
                onClick={() => setIsOpen(false)}
                className="block w-full py-3 text-[11px] font-bold text-center text-slate-500 hover:text-indigo-500 bg-[var(--bg-main)]/50 border-t border-[var(--border-color)] uppercase tracking-wider transition-colors"
              >
                View Calendar →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}