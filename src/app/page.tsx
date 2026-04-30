"use client";

import { useState, useEffect, useMemo } from "react";
import { Circle, CheckCircle2, ChevronDown, Trash2, Edit3, X, Search, Loader2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  class?: string;
  notes?: string;
  description?: string;
  priority: "HIGH" | "MEDIUM" | "LOW" | "High" | "Medium" | "Low";
  isComplete?: boolean;
  completed?: boolean;
  dueDate: string;
  dueTime?: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter State
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Completed">("All");

  // Load tasks from DB on mount
  useEffect(() => {
    fetch("/api/tasks")
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTasks(data);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
      });
  }, []);

  // Normalize priority for display (DB stores HIGH/MEDIUM/LOW, UI uses High/Medium/Low)
  const normalizePriority = (p: string) => {
    if (p === "HIGH") return "High";
    if (p === "MEDIUM") return "Medium";
    if (p === "LOW") return "Low";
    return p;
  };

  const isCompleted = (task: Task) => task.isComplete || task.completed || false;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const q = search.toLowerCase();
      const taskClass = task.class || "";
      const taskDesc = task.notes || task.description || "";
      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        taskClass.toLowerCase().includes(q) ||
        taskDesc.toLowerCase().includes(q);

      const taskPriority = normalizePriority(task.priority);
      const matchesPriority = filterPriority === "All" || taskPriority === filterPriority;

      const completed = isCompleted(task);
      const matchesStatus =
        filterStatus === "All" ||
        (filterStatus === "Active" && !completed) ||
        (filterStatus === "Completed" && completed);

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, search, filterPriority, filterStatus]);

  const hasActiveFilters = search || filterPriority !== "All" || filterStatus !== "All";

  const clearFilters = () => {
    setSearch("");
    setFilterPriority("All");
    setFilterStatus("All");
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    // Convert display priority to DB enum
    const dbPriority = priority.toUpperCase() as "HIGH" | "MEDIUM" | "LOW";

    if (editingId) {
      await fetch(`/api/tasks/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes: description,
          priority: dbPriority,
          dueDate: selectedDate,
        }),
      });
      setTasks(prev => prev.map(t =>
        t.id === editingId
          ? { ...t, title, class: className || "General", notes: description, priority: dbPriority, dueDate: selectedDate, dueTime: selectedTime }
          : t
      ));
      setEditingId(null);
    } else {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes: description,
          priority: dbPriority,
          dueDate: selectedDate || new Date().toISOString().split("T")[0],
        }),
      });
      if (res.ok) {
        const newTask = await res.json();
        // Attach UI-only fields locally
        setTasks(prev => [{ ...newTask, class: className || "General", dueTime: selectedTime }, ...prev]);
      }
    }
    resetForm();
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const current = isCompleted(task);
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isComplete: !current }),
    });
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, isComplete: !current, completed: !current } : t
    ));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setClassName(task.class || "");
    setDescription(task.notes || task.description || "");
    setPriority(normalizePriority(task.priority) as "High" | "Medium" | "Low");
    setSelectedDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    setSelectedTime(task.dueTime || "");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.id !== id));
    if (editingId === id) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setClassName("");
    setDescription("");
    setPriority("Medium");
    setSelectedDate("");
    setSelectedTime("");
  };

  const getPriorityColor = (p: string) => {
    const norm = normalizePriority(p);
    if (norm === "High") return "text-red-500 bg-red-50 border-red-100";
    if (norm === "Medium") return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-emerald-500 bg-emerald-50 border-emerald-100";
  };

  const getPriorityFilterColor = (p: "All" | "High" | "Medium" | "Low") => {
    if (p === "High") return "bg-red-500 text-white border-red-500";
    if (p === "Medium") return "bg-amber-500 text-white border-amber-500";
    if (p === "Low") return "bg-emerald-500 text-white border-emerald-500";
    return "bg-indigo-600 text-white border-indigo-600";
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = dateStr.split("T")[0];
    const [y, m, day] = d.split("-");
    return `${m}/${day}/${y}`;
  };

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hRaw, min] = timeStr.split(":");
    const h = parseInt(hRaw, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${min} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--bg-main)]">
        <Loader2 size={28} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[var(--bg-main)] transition-colors duration-300">
      <section className="flex-1 p-10 overflow-y-auto">
        <h2 className="text-4xl font-black tracking-tighter text-[var(--text-strong)] mb-8">
          Task Overview
        </h2>

        {/* ── Filter Bar ── */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks, classes, details..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--bg-header)] border border-[var(--border-color)] rounded-xl text-sm font-medium text-[var(--text-strong)] placeholder-slate-400 outline-none focus:border-indigo-400 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Priority:</span>
            {(["All", "High", "Medium", "Low"] as const).map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                  filterPriority === p
                    ? getPriorityFilterColor(p)
                    : "border-[var(--border-color)] text-slate-400 hover:border-slate-400 bg-[var(--bg-header)]"
                }`}
              >
                {p}
              </button>
            ))}

            <div className="w-px h-4 bg-slate-200 mx-1" />

            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Status:</span>
            {(["All", "Active", "Completed"] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                  filterStatus === s
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-[var(--border-color)] text-slate-400 hover:border-slate-400 bg-[var(--bg-header)]"
                }`}
              >
                {s}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 border border-[var(--border-color)] hover:border-red-200 bg-[var(--bg-header)] transition-all"
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <p className="text-[11px] text-slate-400 font-medium">
              Showing {filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* ── Task List ── */}
        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">{tasks.length === 0 ? "📋" : "🔍"}</div>
              <p className="font-bold text-sm">
                {tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-3 text-xs text-indigo-500 hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className={`group p-5 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-header)] flex items-center justify-between hover:border-indigo-300 transition-all ${
                  isCompleted(task) ? "opacity-60 grayscale-[0.5]" : ""
                }`}
              >
                <div className="flex items-center gap-5">
                  <button onClick={() => toggleComplete(task.id)}>
                    {isCompleted(task) ? (
                      <CheckCircle2 size={26} className="text-emerald-500" />
                    ) : (
                      <Circle size={26} className="text-slate-200" />
                    )}
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold text-[var(--text-strong)] ${isCompleted(task) ? "line-through opacity-50" : ""}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-3 mt-1 text-[10px]">
                      {task.class && (
                        <span className="font-black text-slate-400 uppercase">{task.class}</span>
                      )}
                      <span className={`px-2 py-0.5 rounded border uppercase ${getPriorityColor(task.priority)}`}>
                        {normalizePriority(task.priority)}
                      </span>
                      <span className="text-slate-400 italic">
                        Due: {formatDisplayDate(task.dueDate)}
                        {task.dueTime ? ` at ${formatDisplayTime(task.dueTime)}` : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(task)} className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Sidebar Form ── */}
      <aside className="w-[360px] p-8 bg-[var(--bg-header)] border-l border-[var(--border-color)] space-y-6 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">
            {editingId ? "Edit Task" : "New Task"}
          </h3>
          {editingId && (
            <button onClick={resetForm} className="text-slate-400 hover:text-red-500">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="space-y-4 flex-1">
          <input
            className="w-full text-2xl font-black bg-transparent border-b border-slate-100 outline-none pb-2 text-[var(--text-strong)]"
            placeholder="Task Title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            className="w-full text-xs font-bold bg-transparent border-b border-slate-100 outline-none pb-2"
            placeholder="Class (e.g. CGT 390)"
            value={className}
            onChange={e => setClassName(e.target.value)}
          />
          <textarea
            className="w-full text-xs font-medium bg-[var(--bg-avatar)] border rounded-xl p-4 min-h-[100px] outline-none"
            placeholder="Add task details..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div className="relative">
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as "High" | "Medium" | "Low")}
              className={`w-full p-3.5 rounded-xl border font-bold text-[10px] uppercase appearance-none outline-none ${getPriorityColor(priority)}`}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Due Date & Time
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 p-3 bg-[var(--bg-avatar)] rounded-xl font-bold text-xs outline-none"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
              <input
                type="time"
                className="w-[110px] p-3 bg-[var(--bg-avatar)] rounded-xl font-bold text-xs outline-none"
                value={selectedTime}
                onChange={e => setSelectedTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className={`w-full py-5 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-lg ${
            editingId
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
          }`}
        >
          {editingId ? "UPDATE TASK ✓" : "CREATE TASK +"}
        </button>
      </aside>
    </div>
  );
}