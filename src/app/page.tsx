"use client";

import { useState } from "react";
import { Plus, Circle, CheckCircle2, Pencil, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Task {
  id: number;
  title: string;
  class: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  dueDate: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Finish Heuristic Evaluation", class: "Starbucks Redesign", priority: "High", completed: false, dueDate: "04/25" },
    { id: 2, title: "Update Portfolio Layout", class: "Web Programming", priority: "Medium", completed: false, dueDate: "04/28" },
  ]);

  // --- Task Input States ---
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  
  // --- Calendar & Time States ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMin, setSelectedMin] = useState("00");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Calendar Logic
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
      priority,
      completed: false,
      dueDate: `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}`,
    };
    setTasks([newTask, ...tasks]);
    setTitle("");
    setClassName("");
    setPriority("Medium");
  };

  const getPriorityColor = (p: string) => {
    if (p === "High") return "text-red-500 bg-red-50 border-red-100";
    if (p === "Medium") return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-emerald-500 bg-emerald-50 border-emerald-100";
  };

  return (
    <div className="flex h-full bg-[var(--bg-main)] transition-colors duration-300 relative">
      
      {/* Main Checklist Column */}
      <section className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h2 className="text-4xl font-black tracking-tighter text-[var(--text-strong)]">Task Overview</h2>
          <p className="text-slate-500 font-medium">Manage your progress and daily mandates.</p>
        </header>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="group p-5 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-header)] shadow-sm flex items-center justify-between hover:border-indigo-300 transition-all">
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
          ))}
        </div>
      </section>

      {/* --- RIGHT SIDEBAR: TASK CONFIGURATION --- */}
      <aside className="w-[400px] p-8 bg-[var(--bg-header)] border-l border-[var(--border-color)] flex flex-col overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-indigo-600 rounded-lg text-white"><Plus size={18} strokeWidth={3} /></div>
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-strong)]">New Mandate</h3>
        </div>

        <div className="space-y-6 flex-1">
          {/* Inputs */}
          <div className="space-y-4">
            <input 
              className="w-full text-xl font-bold bg-transparent border-b border-slate-100 outline-none focus:border-indigo-500 pb-2" 
              placeholder="Task Title..." value={title} onChange={(e) => setTitle(e.target.value)}
            />
            <input 
              className="w-full text-sm font-semibold bg-transparent border-b border-slate-100 outline-none focus:border-indigo-500 pb-2 text-slate-500" 
              placeholder="Classification..." value={className} onChange={(e) => setClassName(e.target.value)}
            />
          </div>

          {/* Time Selection Dropdowns */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Time Configuration</label>
            <div className="flex gap-2">
              <select 
                value={selectedHour} 
                onChange={(e) => setSelectedHour(e.target.value)}
                className="flex-1 p-3 rounded-xl bg-[var(--bg-avatar)] border border-slate-100 font-bold text-[var(--text-strong)] outline-none appearance-none text-center cursor-pointer"
              >
                {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="flex items-center font-black text-slate-300">:</span>
              <select 
                value={selectedMin} 
                onChange={(e) => setSelectedMin(e.target.value)}
                className="flex-1 p-3 rounded-xl bg-[var(--bg-avatar)] border border-slate-100 font-bold text-[var(--text-strong)] outline-none appearance-none text-center cursor-pointer"
              >
                {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Calendar Picker */}
          <div className="p-5 border border-slate-100 rounded-2xl bg-[var(--bg-avatar)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600">
                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="p-1 hover:bg-white rounded-md text-slate-400"><ChevronLeft size={16}/></button>
                <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="p-1 hover:bg-white rounded-md text-slate-400"><ChevronRight size={16}/></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S','M','T','W','T','F','S'].map(day => <span key={day} className="text-[9px] font-black text-slate-300">{day}</span>)}
              {blanks.map(b => <span key={`b-${b}`} />)}
              {days.map(d => (
                <button 
                  key={d} 
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d))}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all ${selectedDate.getDate() === d ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white text-slate-500'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Level</label>
            <div className="flex border border-slate-100 rounded-xl overflow-hidden p-1 gap-1">
              {(["High", "Medium", "Low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${priority === p ? getPriorityColor(p) + " border shadow-sm" : "text-slate-400 hover:bg-slate-50 border-transparent border"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={addTask}
          className="w-full mt-8 py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
        >
          <span>Create Task</span>
          <Plus size={18} strokeWidth={3} />
        </button>
      </aside>
    </div>
  );
}