"use client";

import { useState } from "react";
import { Plus, Circle, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

// 1. Ensure Interface matches exactly what you use
interface Task {
  id: number;
  title: string;
  class: string;
  description: string; // Added
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  dueDate: string;
}

export default function Home() {
  // 2. Initial state MUST include a description now or it will fail to compile
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: 1, 
      title: "Finish Heuristic Evaluation", 
      class: "Starbucks Redesign", 
      description: "Audit friction in checkout flow.", 
      priority: "High", 
      completed: false, 
      dueDate: "04/25" 
    },
  ]);

  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMin, setSelectedMin] = useState("00");

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth(selectedDate.getFullYear(), selectedDate.getMonth()) }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const addTask = () => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      title,
      class: className || "General",
      description, // 3. Pass the description here
      priority,
      completed: false,
      dueDate: `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}`,
    };
    setTasks([newTask, ...tasks]);
    setTitle("");
    setClassName("");
    setDescription("");
    setPriority("Medium");
  };

  const getPriorityColor = (p: string) => {
    if (p === "High") return "text-red-500 bg-red-50 border-red-100";
    if (p === "Medium") return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-emerald-500 bg-emerald-50 border-emerald-100";
  };

  return (
    <div className="flex h-full bg-[var(--bg-main)] transition-colors duration-300 relative overflow-hidden">
      
      {/* Main Checklist Column */}
      <section className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h2 className="text-4xl font-black tracking-tighter text-[var(--text-strong)]">Task Overview</h2>
          <p className="text-slate-500 font-medium text-sm">Manage your progress and daily tasks.</p>
        </header>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="group p-5 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-header)] shadow-sm flex flex-col hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))} className="text-indigo-500 transition-transform active:scale-90">
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} className="text-slate-200" />}
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold ${task.completed ? "line-through text-slate-300" : "text-[var(--text-strong)]"}`}>{task.title}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.class}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 italic">Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* 4. Display the description in the card if it exists */}
              {task.description && (
                <p className="mt-3 ml-11 text-xs text-slate-500 leading-relaxed max-w-2xl">{task.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --- RIGHT SIDEBAR --- */}
      <aside className="w-[360px] p-6 bg-[var(--bg-header)] border-l border-[var(--border-color)] flex flex-col h-full overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white"><Plus size={16} strokeWidth={3} /></div>
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-strong)]">Create Task</h3>
        </div>

        <div className="space-y-4 flex-1">
          <div className="space-y-3">
            <input 
              className="w-full text-lg font-bold bg-transparent border-b border-slate-100 outline-none focus:border-indigo-500 pb-1 text-[var(--text-strong)]" 
              placeholder="Task Title..." value={title} onChange={(e) => setTitle(e.target.value)}
            />
            <input 
              className="w-full text-xs font-semibold bg-transparent border-b border-slate-100 outline-none focus:border-indigo-500 pb-1 text-slate-500" 
              placeholder="Classification..." value={className} onChange={(e) => setClassName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Description</label>
            <textarea 
              className="w-full text-xs font-medium bg-[var(--bg-avatar)] border border-slate-100 rounded-xl p-3 outline-none focus:border-indigo-500 min-h-[70px] resize-none text-slate-600"
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Urgency Level</label>
            <div className="relative">
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className={`w-full p-2.5 rounded-xl border appearance-none font-bold text-[10px] uppercase tracking-widest outline-none cursor-pointer transition-all ${getPriorityColor(priority)}`}
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Target Time</label>
            <div className="flex gap-2">
              <select value={selectedHour} onChange={(e) => setSelectedHour(e.target.value)} className="flex-1 p-2 rounded-xl bg-[var(--bg-avatar)] border border-slate-100 text-xs font-bold">{Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}</select>
              <select value={selectedMin} onChange={(e) => setSelectedMin(e.target.value)} className="flex-1 p-2 rounded-xl bg-[var(--bg-avatar)] border border-slate-100 text-xs font-bold">{["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}</select>
            </div>
          </div>

          <div className="p-3 border border-slate-100 rounded-2xl bg-[var(--bg-avatar)]">
             {/* Calendar code remains the same as before */}
             <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">{selectedDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
              <div className="flex gap-1">
                <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="p-1 text-slate-400"><ChevronLeft size={12}/></button>
                <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="p-1 text-slate-400"><ChevronRight size={12}/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S','M','T','W','T','F','S'].map(day => <span key={day} className="text-[8px] font-black text-slate-300">{day}</span>)}
              {blanks.map(b => <span key={`b-${b}`} />)}
              {days.map(d => (
                <button key={d} onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d))} className={`py-1 text-[9px] font-bold rounded-md ${selectedDate.getDate() === d ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-white'}`}>{d}</button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={addTask} className="w-full mt-6 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2">
          <span>Create Task</span>
          <Plus size={14} strokeWidth={3} />
        </button>
      </aside>
    </div>
  );
}