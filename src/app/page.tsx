"use client";

import { useState, useEffect } from "react";
import { Plus, Circle, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

// This interface MUST match the one in calendar/page.tsx exactly
interface Task {
  id: number;
  title: string;
  class: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  dueDate: string; // We will use YYYY-MM-DD for easy calendar matching
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load tasks from localStorage when the app starts
  useEffect(() => {
    const saved = localStorage.getItem("task-pilot-storage");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  const addTask = () => {
    if (!title.trim()) return;
    
    // Format the date to YYYY-MM-DD so the calendar can find it easily
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    const newTask: Task = {
      id: Date.now(),
      title,
      class: className || "General",
      description,
      priority,
      completed: false,
      dueDate: formattedDate,
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    
    // Save to localStorage so the Calendar page can access it
    localStorage.setItem("task-pilot-storage", JSON.stringify(updatedTasks));

    // Reset inputs
    setTitle("");
    setClassName("");
    setDescription("");
  };

  const getPriorityColor = (p: string) => {
    if (p === "High") return "text-red-500 bg-red-50 border-red-100";
    if (p === "Medium") return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-emerald-500 bg-emerald-50 border-emerald-100";
  };

  return (
    <div className="flex h-full bg-[var(--bg-main)] transition-colors duration-300 relative overflow-hidden">
      <section className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h2 className="text-4xl font-black tracking-tighter text-[var(--text-strong)]">Task Overview</h2>
          <p className="text-slate-500 font-medium text-sm">Manage your progress and daily mandates.</p>
        </header>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="group p-5 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-header)] shadow-sm flex flex-col hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="text-indigo-500">
                    <Circle size={24} className="text-slate-200" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-[var(--text-strong)]">{task.title}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.class}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 italic">Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="w-[360px] p-8 bg-[var(--bg-header)] border-l border-[var(--border-color)] flex flex-col h-full overflow-y-auto no-scrollbar">
        <div className="space-y-6 flex-1">
          <input 
            className="w-full text-2xl font-black bg-transparent border-b border-slate-100 outline-none pb-2 text-[var(--text-strong)]" 
            placeholder="Task Title..." 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
          
          <textarea 
            className="w-full text-xs font-medium bg-[var(--bg-avatar)] border rounded-xl p-4 min-h-[100px] outline-none" 
            placeholder="Add task details..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />

          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as any)} 
            className={`w-full p-3.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest outline-none ${getPriorityColor(priority)}`}
          >
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Simple Date Picker for Demo */}
          <div className="p-4 border border-slate-100 rounded-2xl bg-[var(--bg-avatar)]">
             <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Target Date</p>
             <input 
                type="date" 
                className="w-full bg-transparent font-bold text-xs" 
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
             />
          </div>
        </div>

        <button 
          onClick={addTask} 
          className="w-full mt-8 py-5 bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.25em] rounded-2xl hover:bg-indigo-700 transition-all"
        >
          CREATE TASK +
        </button>
      </aside>
    </div>
  );
}