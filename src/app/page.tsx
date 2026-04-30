"use client";

import { useState, useEffect } from "react";
import { Circle, CheckCircle2, ChevronDown, Trash2, Edit3, X, Loader2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  notes: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  isComplete: boolean;
  dueDate: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [selectedDate, setSelectedDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load tasks from DB on mount
  useEffect(() => {
    fetch("/api/tasks")
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setTasks(data);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    if (editingId) {
      await fetch(`/api/tasks/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, notes: description, priority, dueDate: selectedDate }),
      });
      setTasks(prev => prev.map(t =>
        t.id === editingId
          ? { ...t, title, notes: description, priority, dueDate: selectedDate }
          : t
      ));
      setEditingId(null);
    } else {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, notes: description, priority, dueDate: selectedDate }),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [newTask, ...prev]);
      }
    }
    resetForm();
  };

  const toggleComplete = async (id: string, current: boolean) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isComplete: !current }),
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isComplete: !t.isComplete } : t));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setClassName("");
    setDescription(task.notes || "");
    setPriority(task.priority);
    setSelectedDate(task.dueDate ? task.dueDate.split("T")[0] : "");
  };

  const deleteTask = async (id: string) => {
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
    setPriority("MEDIUM");
    setSelectedDate("");
  };

  const getPriorityColor = (p: string) => {
    if (p === "HIGH") return "text-red-500 bg-red-50 border-red-100";
    if (p === "MEDIUM") return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-emerald-500 bg-emerald-50 border-emerald-100";
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
        <h2 className="text-4xl font-black tracking-tighter text-[var(--text-strong)] mb-10">
          Task Overview
        </h2>

        <div className="grid gap-4">
          {tasks.length === 0 && (
            <p className="text-slate-500 italic text-sm">No tasks yet — add one to get started!</p>
          )}
          {tasks.map(task => (
            <div
              key={task.id}
              className={`group p-5 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-header)] flex items-center justify-between hover:border-indigo-300 transition-all ${
                task.isComplete ? "opacity-60 grayscale-[0.5]" : ""
              }`}
            >
              <div className="flex items-center gap-5">
                <button onClick={() => toggleComplete(task.id, task.isComplete)}>
                  {task.isComplete ? (
                    <CheckCircle2 size={26} className="text-emerald-500" />
                  ) : (
                    <Circle size={26} className="text-slate-200" />
                  )}
                </button>
                <div className="flex flex-col">
                  <span className={`text-lg font-bold text-[var(--text-strong)] ${task.isComplete ? "line-through opacity-50" : ""}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-3 mt-1 text-[10px]">
                    <span className={`px-2 py-0.5 rounded border uppercase ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-slate-400 italic">
                      Due: {task.dueDate ? task.dueDate.split("T")[0] : "—"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(task)} className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => deleteTask(task.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
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
              onChange={e => setPriority(e.target.value as "HIGH" | "MEDIUM" | "LOW")}
              className={`w-full p-3.5 rounded-xl border font-bold text-[10px] uppercase appearance-none outline-none ${getPriorityColor(priority)}`}
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Due Date</label>
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
            editingId ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
          }`}
        >
          {editingId ? "UPDATE TASK ✓" : "CREATE TASK +"}
        </button>
      </aside>
    </div>
  );
}