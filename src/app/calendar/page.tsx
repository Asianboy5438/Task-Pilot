"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ChevronDown } from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import type { Task } from "../../context/TaskContext";

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const PRIORITY_MAP = {
  HIGH:   { display: "High"   as Task["priority"], color: "bg-red-500/20 text-red-400 border-red-500/30" },
  MEDIUM: { display: "Medium" as Task["priority"], color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  LOW:    { display: "Low"    as Task["priority"], color: "bg-green-500/20 text-green-400 border-green-500/30" },
} as const;

type CalPriority = "HIGH" | "MEDIUM" | "LOW";
type ViewMode = "month" | "week" | "day";

function formatTime(timeStr: string) {
  if (!timeStr) return "";
  const [hRaw, min] = timeStr.split(":");
  const h = parseInt(hRaw, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${min} ${ampm}`;
}

function toDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

// Sort tasks by time (no time = end of day)
function sortByTime(a: Task, b: Task) {
  const ta = a.dueTime || "23:59";
  const tb = b.dueTime || "23:59";
  return ta.localeCompare(tb);
}

function priorityColor(p: string) {
  if (p === "High")   return "bg-red-500/20 text-red-400 border-red-500/30";
  if (p === "Medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-green-500/20 text-green-400 border-green-500/30";
}

// Get the Sunday that starts the week containing `date`
function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export default function CalendarPage() {
  const { tasks, addTask, deleteTask } = useTasks();

  const today = new Date();
  const todayStr = toDateStr(today);

  const [view, setView] = useState<ViewMode>("month");
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [dayDate, setDayDate] = useState(today);

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  // Form state
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskClass, setNewTaskClass] = useState("");
  const [newTaskDetails, setNewTaskDetails] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<CalPriority>("MEDIUM");

  // ── Navigation ────────────────────────────────────────────────
  const goBack = () => {
    if (view === "month") {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
      else setCurrentMonth(m => m - 1);
    } else if (view === "week") {
      setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
    } else {
      setDayDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
    }
  };

  const goForward = () => {
    if (view === "month") {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
      else setCurrentMonth(m => m + 1);
    } else if (view === "week") {
      setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
    } else {
      setDayDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
    }
  };

  const navLabel = () => {
    if (view === "month") return `${MONTHS[currentMonth]} ${currentYear}`;
    if (view === "week") {
      const end = new Date(weekStart); end.setDate(end.getDate() + 6);
      return `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${weekStart.getMonth() !== end.getMonth() ? MONTHS[end.getMonth()] + " " : ""}${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${MONTHS[dayDate.getMonth()]} ${dayDate.getDate()}, ${dayDate.getFullYear()}`;
  };

  // ── Modal ─────────────────────────────────────────────────────
  const openModal = (dateStr: string) => { setSelectedDate(dateStr); setShowModal(true); };

  const closeModal = () => {
    setShowModal(false);
    setNewTaskText(""); setNewTaskClass(""); setNewTaskDetails("");
    setNewTaskTime(""); setNewTaskPriority("MEDIUM");
  };

  const handleAdd = () => {
    if (!newTaskText.trim() || !selectedDate) return;
    addTask({
      title: newTaskText.trim(),
      class: newTaskClass.trim() || "General",
      description: newTaskDetails.trim(),
      priority: PRIORITY_MAP[newTaskPriority].display,
      completed: false,
      dueDate: selectedDate,
      dueTime: newTaskTime || "",
    });
    closeModal();
  };

  const getTasksForDate = (dateStr: string) =>
    tasks.filter(t => t.dueDate === dateStr).sort(sortByTime);

  // ── Month view ────────────────────────────────────────────────
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // ── Week view — 7 days starting from weekStart ────────────────
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // ── Task pill shared component ────────────────────────────────
  const TaskPill = ({ task, compact = false }: { task: Task; compact?: boolean }) => (
    <div
      onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
      title="Click to delete"
      className={`font-semibold rounded border truncate cursor-pointer hover:opacity-60 transition-opacity ${priorityColor(task.priority)} ${compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"}`}
    >
      {task.dueTime && <span className="opacity-70 mr-1">{formatTime(task.dueTime)}</span>}
      {task.title}
      {!compact && task.class && task.class !== "General" && (
        <span className="ml-1 opacity-50 text-[10px]">· {task.class}</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-6 transition-colors duration-300 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-strong)]">Calendar</h1>
            <p className="text-slate-500 mt-1 text-sm">Click any day to add an assignment.</p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2 bg-[var(--bg-header)] border border-[var(--border-color)] rounded-xl p-1">
            {(["month", "week", "day"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  view === v
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-[var(--text-strong)]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Nav row */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={goBack} className="p-2 rounded-lg hover:bg-[var(--bg-avatar)] text-slate-400 hover:text-[var(--text-strong)] transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-bold text-[var(--text-strong)] min-w-[240px] text-center">
            {navLabel()}
          </span>
          <button onClick={goForward} className="p-2 rounded-lg hover:bg-[var(--bg-avatar)] text-slate-400 hover:text-[var(--text-strong)] transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* ── MONTH VIEW ── */}
        {view === "month" && (
          <>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayTasks = getTasksForDate(dateStr);
                const isToday = dateStr === todayStr;
                return (
                  <div
                    key={dateStr}
                    onClick={() => openModal(dateStr)}
                    className={`min-h-[100px] rounded-xl p-2 border cursor-pointer transition-all group
                      ${isToday ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--border-color)] bg-[var(--bg-header)] hover:border-indigo-500/50 hover:bg-[var(--bg-avatar)]"}`}
                  >
                    <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? "bg-indigo-600 text-white" : "text-slate-400 group-hover:text-[var(--text-strong)]"}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, dayTasks.length > 3 ? 2 : 3).map(task => (
                        <TaskPill key={task.id} task={task} compact />
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[9px] font-bold text-slate-400 px-1.5">+ {dayTasks.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── WEEK VIEW ── */}
        {view === "week" && (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(date => {
              const dateStr = toDateStr(date);
              const dayTasks = getTasksForDate(dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div key={dateStr} className="flex flex-col">
                  {/* Day header */}
                  <div
                    className={`text-center py-2 mb-2 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors
                      ${isToday ? "bg-indigo-600 text-white" : "bg-[var(--bg-header)] border border-[var(--border-color)] text-slate-400 hover:border-indigo-400"}`}
                    onClick={() => openModal(dateStr)}
                  >
                    <div>{WEEKDAYS[date.getDay()]}</div>
                    <div className={`text-lg font-black ${isToday ? "text-white" : "text-[var(--text-strong)]"}`}>{date.getDate()}</div>
                  </div>
                  {/* Tasks for the day, sorted by time */}
                  <div
                    onClick={() => openModal(dateStr)}
                    className="flex-1 min-h-[300px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-header)] hover:border-indigo-500/50 cursor-pointer p-2 space-y-1.5 transition-colors"
                  >
                    {dayTasks.map(task => (
                      <TaskPill key={task.id} task={task} compact />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── DAY VIEW ── */}
        {view === "day" && (() => {
          const dateStr = toDateStr(dayDate);
          const dayTasks = getTasksForDate(dateStr);
          const isToday = dateStr === todayStr;
          return (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-header)] overflow-hidden">
              {/* Day banner */}
              <div className={`px-6 py-4 flex items-center justify-between ${isToday ? "bg-indigo-600" : "bg-[var(--bg-avatar)]"}`}>
                <div>
                  <div className={`text-xs font-bold uppercase tracking-widest ${isToday ? "text-indigo-200" : "text-slate-400"}`}>
                    {WEEKDAYS[dayDate.getDay()]}
                  </div>
                  <div className={`text-2xl font-black ${isToday ? "text-white" : "text-[var(--text-strong)]"}`}>
                    {MONTHS[dayDate.getMonth()]} {dayDate.getDate()}, {dayDate.getFullYear()}
                  </div>
                </div>
                <button
                  onClick={() => openModal(dateStr)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${isToday ? "bg-white/20 text-white hover:bg-white/30" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                >
                  + Add Task
                </button>
              </div>

              {/* Task list sorted by time */}
              <div className="p-6 space-y-3">
                {dayTasks.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="font-bold text-sm">No tasks for this day</p>
                    <p className="text-xs mt-1">Click "Add Task" to schedule something</p>
                  </div>
                ) : (
                  dayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border ${priorityColor(task.priority)} ${task.completed ? "opacity-50" : ""}`}
                    >
                      {/* Time column */}
                      <div className="w-16 shrink-0 text-right">
                        <span className="text-xs font-black">
                          {task.dueTime ? formatTime(task.dueTime) : "—"}
                        </span>
                      </div>
                      {/* Divider */}
                      <div className="w-px self-stretch bg-current opacity-20" />
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${task.completed ? "line-through" : ""}`}>{task.title}</p>
                        {task.class && task.class !== "General" && (
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-0.5">{task.class}</p>
                        )}
                        {task.description && (
                          <p className="text-xs opacity-70 mt-1">{task.description}</p>
                        )}
                      </div>
                      {/* Delete */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="shrink-0 opacity-40 hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })()}

      </div>

      {/* ── Add Task Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[var(--bg-header)] border border-[var(--border-color)] rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={closeModal} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors">
              <X size={20} />
            </button>

            <div className="space-y-6 pt-2">
              <div className="border-b border-slate-100 pb-1">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  placeholder="Task Title..."
                  className="w-full text-3xl font-black bg-transparent text-[var(--text-strong)] placeholder-slate-300 outline-none"
                  autoFocus
                />
              </div>

              <div className="border-b border-slate-100 pb-1">
                <input
                  type="text"
                  value={newTaskClass}
                  onChange={e => setNewTaskClass(e.target.value)}
                  placeholder="Class (e.g. CGT 390)"
                  className="w-full text-lg font-medium bg-transparent text-slate-500 placeholder-slate-300 outline-none"
                />
              </div>

              <textarea
                value={newTaskDetails}
                onChange={e => setNewTaskDetails(e.target.value)}
                placeholder="Add task details..."
                className="w-full h-28 p-4 rounded-2xl bg-transparent border border-slate-200 text-slate-600 placeholder-slate-300 outline-none resize-none focus:border-indigo-400 transition-colors"
              />

              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Due Time <span className="normal-case font-medium">(optional)</span>
                </h4>
                <input
                  type="time"
                  value={newTaskTime}
                  onChange={e => setNewTaskTime(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-transparent font-bold text-sm text-slate-600 outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Priority</h4>
                <div className="relative">
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as CalPriority)}
                    className={`w-full p-4 pr-10 rounded-2xl border font-bold text-sm uppercase tracking-widest outline-none appearance-none cursor-pointer transition-all
                      ${newTaskPriority === "HIGH"   ? "border-red-200 text-red-500 bg-red-50/30" :
                        newTaskPriority === "MEDIUM" ? "border-amber-200 text-amber-500 bg-amber-50/30" :
                                                       "border-emerald-200 text-emerald-500 bg-emerald-50/30"}`}
                  >
                    <option value="HIGH"   className="text-red-500 bg-white">High</option>
                    <option value="MEDIUM" className="text-amber-500 bg-white">Medium</option>
                    <option value="LOW"    className="text-emerald-500 bg-white">Low</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!newTaskText.trim()}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-indigo-100"
              >
                Add to Calendar
              </button>

              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  Scheduled for: {formatDisplayDate(selectedDate)}
                  {newTaskTime ? ` at ${formatTime(newTaskTime)}` : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}