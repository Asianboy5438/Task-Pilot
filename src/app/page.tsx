"use client";

import { useState, useEffect } from "react";
import { Circle, ChevronDown } from "lucide-react";

interface Task {
  id: number;
  title: string;
  class: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  dueDate: string;
}

export default function Home() {
  // Lazy initialization: This function runs ONLY on the first render
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("task-pilot-storage");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [selectedDate, setSelectedDate] = useState("");

  // Sync tasks to localStorage whenever the tasks array changes
  useEffect(() => {
    localStorage.setItem("task-pilot-storage", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!title.trim()) return;
    
    const newTask: Task = {
      id: Date.now(),
      title,
      class: className || "General",
      description,
      priority,
      completed: false,
      dueDate: selectedDate || new Date().toISOString().split('T')[0],
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
    setClassName("");
    setDescription("");
  };

  const getPriorityColor = (p: Task["priority"]) => {
    if (p === "High") return "text-red-500 bg-red-50 border-red-100";
    if (p === "Medium") return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-emerald-500 bg-emerald-50 border-emerald-100";
  };

  return (
    <div className="flex h-full bg-[var(--bg-main)] transition-colors duration-300">
      <section className="flex-1 p-10 overflow-y-auto">
        <h2 className="text-4xl font-black tracking-tighter text-[var(--text-strong)] mb-10">Task Overview</h2>
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="p-5 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-header)] flex items-center gap-5">
              <Circle size={24} className="text-slate-200" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[var(--text-strong)]">{task.title}</span>
                <div className="flex items-center gap-3 mt-1 text-[10px]">
                  <span className="font-black text-slate-400 uppercase">{task.class}</span>
                  <span className={`px-2 py-0.5 rounded border uppercase ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                  <span className="text-slate-400 italic">Due: {task.dueDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="w-[360px] p-8 bg-[var(--bg-header)] border-l border-[var(--border-color)] space-y-6">
        <input 
          className="w-full text-2xl font-black bg-transparent border-b border-slate-100 outline-none pb-2" 
          placeholder="Task Title..." 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <div className="relative">
          <select 
            value={priority} 
            // FIXED: Removed any, used strict cast
            onChange={(e) => setPriority(e.target.value as Task["priority"])} 
            className={`w-full p-3.5 rounded-xl border font-bold text-[10px] uppercase appearance-none ${getPriorityColor(priority)}`}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
        </div>
        <input 
          type="date" 
          className="w-full p-3 bg-[var(--bg-avatar)] rounded-xl font-bold text-xs" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)} 
        />
        <button 
          onClick={addTask} 
          className="w-full py-5 bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl"
        >
          CREATE TASK +
        </button>
      </aside>
    </div>
  );
}