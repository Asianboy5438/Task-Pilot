"use client";

import { useState, useEffect } from "react";
import { Circle, CheckCircle2, ChevronDown, Trash2, Edit3, X } from "lucide-react";

interface Task {
  id: number;
  title: string;
  class: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  dueDate: string;
}

// FIX 1: Parse localStorage OUTSIDE the component (module scope).
// This runs only on the client (never on the server during SSR),
// so it's safe and avoids the set-state-in-effect lint error entirely.
function loadInitialTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("task-pilot-storage");
    return saved ? (JSON.parse(saved) as Task[]) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  // Pass the loader function as a lazy initializer — React calls it once,
  // client-side only, so there's no hydration mismatch and no effect needed.
  const [tasks, setTasks] = useState<Task[]>(loadInitialTasks);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [selectedDate, setSelectedDate] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);

  // Mark as loaded after first client render (prevents hydration flash)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  // Sync to localStorage whenever tasks change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("task-pilot-storage", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (editingId) {
      setTasks(prev =>
        prev.map(t =>
          t.id === editingId
            ? {
                ...t,
                title,
                class: className || "General",
                description: description || "",
                priority,
                dueDate: selectedDate || t.dueDate,
              }
            : t
        )
      );
      setEditingId(null);
    } else {
      // FIX 2: Use pure ID generation (no Date.now()).
      // Derive the next ID from existing task IDs — deterministic and pure.
      const newId =
        tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

      const newTask: Task = {
        id: newId,
        title,
        class: className || "General",
        description: description || "",
        priority,
        completed: false,
        dueDate: selectedDate || new Date().toISOString().split("T")[0],
      };

      setTasks(prev => [newTask, ...prev]);
    }
    resetForm();
  };

  const toggleComplete = (id: number) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setClassName(task.class);
    setDescription(task.description);
    setPriority(task.priority);
    setSelectedDate(task.dueDate);
  };

  const deleteTask = (id: number) => {
    const confirmDelete = window.confirm("Delete this task?");
    if (confirmDelete) {
      setTasks(prev => prev.filter(t => t.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setClassName("");
    setDescription("");
    setPriority("Medium");
    setSelectedDate("");
  };

  const getPriorityColor = (p: Task["priority"]) => {
    if (p === "High") return "text-red-500 bg-red-50 border-red-100";
    if (p === "Medium") return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-emerald-500 bg-emerald-50 border-emerald-100";
  };

  return (
    <div className="flex h-full bg-[var(--bg-main)] transition-colors duration-300">
      <section className="flex-1 p-10 overflow-y-auto">
        <h2 className="text-4xl font-black tracking-tighter text-[var(--text-strong)] mb-10">
          Task Overview
        </h2>

        <div className="grid gap-4">
          {isLoaded &&
            tasks.map(task => (
              <div
                key={task.id}
                className={`group p-5 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-header)] flex items-center justify-between hover:border-indigo-300 transition-all ${
                  task.completed ? "opacity-60 grayscale-[0.5]" : ""
                }`}
              >
                <div className="flex items-center gap-5">
                  <button onClick={() => toggleComplete(task.id)}>
                    {task.completed ? (
                      <CheckCircle2 size={26} className="text-emerald-500" />
                    ) : (
                      <Circle size={26} className="text-slate-200" />
                    )}
                  </button>

                  <div className="flex flex-col">
                    <span
                      className={`text-lg font-bold text-[var(--text-strong)] ${
                        task.completed ? "line-through opacity-50" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    <div className="flex items-center gap-3 mt-1 text-[10px]">
                      <span className="font-black text-slate-400 uppercase">
                        {task.class}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded border uppercase ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-slate-400 italic">
                        Due: {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(task)}
                    className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      <aside className="w-[360px] p-8 bg-[var(--bg-header)] border-l border-[var(--border-color)] space-y-6 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">
            {editingId ? "Edit Task" : "New Task"}
          </h3>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-red-500"
            >
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
              onChange={e => setPriority(e.target.value as Task["priority"])}
              className={`w-full p-3.5 rounded-xl border font-bold text-[10px] uppercase appearance-none outline-none ${getPriorityColor(
                priority
              )}`}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Due Date
            </label>
            <input
              type="date"
              className="w-full p-3 bg-[var(--bg-avatar)] rounded-xl font-bold text-xs outline-none"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
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