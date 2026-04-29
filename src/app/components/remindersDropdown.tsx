"use client";

import { useState } from "react";
import { Bell, GraduationCap, ClipboardCheck, Clock, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useTasks } from "../../context/TaskContext";

export default function RemindersDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { tasks } = useTasks();

  const [alerts, setAlerts] = useState([
    { id: 1, title: '"Checkpoint 4: Review and Refine" Released', course: 'Spring 2026 CGT 37000-001 LEC', time: '6 hours ago', icon: <ClipboardCheck size={16}/>, color: 'text-blue-600' },
    { id: 2, title: 'Your grade is: 15 / 15, 100 %', course: 'Spring 2026 CGT 37000-001 LEC', time: '6 hours ago', icon: <GraduationCap size={16}/>, color: 'text-orange-500' },
    { id: 3, title: 'Due in 2 hrs', course: 'ENGL 20500-018 DIS', time: '2 hours ago', icon: <Clock size={16}/>, color: 'text-red-500' },
  ]);

  // Pull all incomplete High priority tasks from context
  const highPriorityTasks = tasks.filter(
    t => t.priority === "High" && !t.completed
  );

  const deleteNotif = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const totalCount = alerts.length + highPriorityTasks.length;

  // Format due date + time for display
  const formatDue = (date: string, time: string) => {
    if (!date) return "";
    const [y, m, d] = date.split("-");
    const dateStr = `${m}/${d}/${y}`;
    if (!time) return `Due ${dateStr}`;
    const [hRaw, min] = time.split(":");
    const h = parseInt(hRaw, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `Due ${dateStr} at ${h12}:${min} ${ampm}`;
  };

  return (
    <div className="relative inline-block">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-[var(--bg-avatar)] relative transition-colors">
        <Bell size={22} className="text-slate-400" />
        {totalCount > 0 && (
          <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--bg-header)]"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-header)] border border-[var(--border-color)] rounded-lg shadow-2xl z-50 overflow-hidden transition-colors duration-300">
            {/* Arrow */}
            <div className="absolute -top-1.5 right-3 w-3 h-3 bg-[var(--bg-header)] border-t border-l border-[var(--border-color)] rotate-45" />

            <div className="relative">
              <div className="px-4 py-3 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-main)]/50">
                <h3 className="text-sm font-bold text-[var(--text-strong)]">Reminders</h3>
                <button onClick={() => setAlerts([])} className="text-xs text-indigo-500 hover:underline">Clear all</button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">

                {/* ── High Priority Task Alerts ── */}
                {highPriorityTasks.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-red-50/50 border-b border-red-100">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                        ⚠ High Priority
                      </p>
                    </div>
                    {highPriorityTasks.map(task => (
                      <div key={`hp-${task.id}`} className="border-b border-[var(--border-color)] last:border-0">
                        <Link
                          href="/"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between p-4 hover:bg-red-50/30 transition-colors group"
                        >
                          <div className="flex gap-3">
                            <div className="text-red-500 mt-0.5 shrink-0">
                              <AlertTriangle size={16} />
                            </div>
                            <div className="text-left">
                              <p className="text-[13px] font-bold text-[var(--text-strong)] leading-tight">
                                {task.title}
                              </p>
                              {task.class && task.class !== "General" && (
                                <p className="text-[11px] text-slate-500 mt-1">{task.class}</p>
                              )}
                              <p className="text-[10px] text-red-400 mt-2 font-bold uppercase tracking-tighter">
                                {formatDue(task.dueDate, task.dueTime)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </>
                )}

                {/* ── Regular Alerts ── */}
                {alerts.length > 0 && (
                  <>
                    {highPriorityTasks.length > 0 && (
                      <div className="px-4 py-2 bg-[var(--bg-main)]/50 border-b border-[var(--border-color)]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Other Notifications
                        </p>
                      </div>
                    )}
                    {alerts.map(alert => (
                      <div key={alert.id} className="relative border-b border-[var(--border-color)] last:border-0">
                        <Link
                          href="/notifications"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between p-4 hover:bg-[var(--bg-avatar)] transition-colors group"
                        >
                          <div className="flex gap-3 pr-8">
                            <div className={`${alert.color} mt-0.5`}>{alert.icon}</div>
                            <div className="text-left">
                              <p className="text-[13px] font-bold text-[var(--text-strong)] leading-tight">{alert.title}</p>
                              <p className="text-[11px] text-slate-500 mt-1">{alert.course}</p>
                              <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-tighter">{alert.time}</p>
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={(e) => deleteNotif(alert.id, e)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all z-10"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {totalCount === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm italic">No new notifications</div>
                )}
              </div>

              <Link
                href="/reminders"
                onClick={() => setIsOpen(false)}
                className="block w-full py-3 text-[11px] font-bold text-center text-slate-500 hover:text-indigo-500 bg-[var(--bg-main)]/50 border-t border-[var(--border-color)] uppercase tracking-wider transition-colors"
              >
                View all updates
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}