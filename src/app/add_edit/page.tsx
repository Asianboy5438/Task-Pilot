"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react"; // Using icons for a cleaner look

export default function AddEditPage() {
  // 1. Task List State
  const [tasks, setTasks] = useState([
    { id: 1, title: "Finish Data Visualization Homework", class: "Data Viz", completed: false },
    { id: 2, title: "Study for Purdue Polytechnic Exam", class: "CIT 202", completed: true },
  ]);

  // 2. Form Input States
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [min, setMin] = useState("");

  // 3. Handlers
  const addTask = () => {
    if (!title.trim()) return;
    const newTask = {
      id: Date.now(),
      title,
      class: className || "General",
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    // Reset fields
    setTitle("");
    setClassName("");
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="flex h-full bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      {/* Main Task Column */}
      <section className="flex-1 p-8 border-r border-[var(--border-color)] overflow-y-auto">
        <h2 className="text-2xl font-black tracking-tighter mb-6 text-[var(--text-strong)]">ADD/EDIT</h2>
        
        {/* Task List */}
        <div className="space-y-3 mb-10">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 p-4 bg-[var(--bg-header)] border border-[var(--border-color)] rounded-xl shadow-sm group">
              <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={() => toggleTask(task.id)} 
                className="w-5 h-5 accent-indigo-600 cursor-pointer" 
              />
              <div className="flex-1">
                <p className={task.completed ? "line-through text-slate-500" : "font-semibold text-[var(--text-strong)]"}>
                  {task.title}
                </p>
                <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">{task.class}</p>
              </div>
              
              {/* Actions visible on hover */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors">
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area from your sketch */}
        <div className="p-6 bg-[var(--bg-header)] border-2 border-dashed border-[var(--border-color)] rounded-2xl relative">
          <input 
            className="w-full text-lg font-bold mb-1 outline-none p-2 bg-transparent placeholder:text-slate-500 text-[var(--text-strong)]" 
            placeholder="Add Title..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input 
            className="w-full text-sm text-slate-400 mb-6 outline-none p-2 bg-transparent font-medium" 
            placeholder="Class..." 
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-1">Month <input type="text" value={month} onChange={(e) => setMonth(e.target.value)} className="w-8 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="04" /></div>
            <div className="flex items-center gap-1">Day <input type="text" value={day} onChange={(e) => setDay(e.target.value)} className="w-8 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="24" /></div>
            <span className="text-lg text-slate-300">:</span>
            <div className="flex items-center gap-1">Hour <input type="text" value={hour} onChange={(e) => setHour(e.target.value)} className="w-8 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="18" /></div>
            <div className="flex items-center gap-1">Min <input type="text" value={min} onChange={(e) => setMin(e.target.value)} className="w-8 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="00" /></div>
          </div>

          {/* Add Button positioned like the sketch */}
          <button 
            onClick={addTask}
            className="absolute -bottom-5 -left-5 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      </section>

      {/* AI Suggestions Sidebar */}
      <aside className="w-80 p-6 bg-[var(--bg-header)] flex flex-col transition-colors duration-300">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-indigo-500 text-lg">✨</span>
          <h3 className="font-black text-xs uppercase tracking-widest text-[var(--text-strong)]">AI Suggestions</h3>
        </div>
        <div className="flex-1 bg-[var(--bg-avatar)] border border-[var(--border-color)] rounded-xl p-4 text-sm text-slate-400 leading-relaxed shadow-inner">
          It looks like you have a <strong>Data Viz</strong> assignment due soon. 
          I suggest starting with the chart layouts today to save time for testing.
        </div>
        <div className="mt-4 flex gap-2">
          <input className="flex-1 p-3 text-sm bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl outline-none focus:border-indigo-500 transition-colors" placeholder="Ask AI..." />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md hover:bg-indigo-700 transition-colors">SEND</button>
        </div>
      </aside>
    </div>
  );
}