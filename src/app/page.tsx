"use client";

import { useState } from "react";
import { Plus, Circle, CheckCircle2, Pencil, Trash2, Sparkles, Send, X } from "lucide-react";

interface Task {
  id: number;
  title: string;
  class: string;
  completed: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Finish Heuristic Evaluation", class: "Starbucks Redesign", completed: false },
    { id: 2, title: "Update Portfolio Layout", class: "Web Programming", completed: false },
  ]);

  // --- State for Add Form ---
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");

  // --- State for Edit Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const addTask = () => {
    if (!title.trim()) return;
    const newTask = {
      id: Date.now(),
      title,
      class: className || "General",
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setTitle("");
    setClassName("");
  };

  const openEditModal = (task: Task) => {
    setEditingTask({ ...task });
    setIsModalOpen(true);
  };

  const saveEdit = () => {
    if (!editingTask || !editingTask.title.trim()) return;
    setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="flex h-full bg-[var(--bg-main)] transition-colors duration-300 relative">
      
      {/* --- EDIT MODAL OVERLAY --- */}
      {isModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--bg-header)] w-full max-w-md p-8 rounded-3xl border border-[var(--border-color)] shadow-2xl scale-in-center transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black tracking-tighter text-[var(--text-strong)]">Edit Mandate</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Task Title</label>
                <input 
                  className="w-full p-4 bg-[var(--bg-avatar)] border border-[var(--border-color)] rounded-xl outline-none focus:border-indigo-500 font-bold text-[var(--text-strong)]"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Class / Category</label>
                <input 
                  className="w-full p-4 bg-[var(--bg-avatar)] border border-[var(--border-color)] rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-500"
                  value={editingTask.class}
                  onChange={(e) => setEditingTask({...editingTask, class: e.target.value})}
                />
              </div>

              {/* Date/Time Mockup in Modal */}
              <div className="flex items-center gap-3 pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Due:</span>
                <input type="text" className="w-10 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="04" />
                <input type="text" className="w-10 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="25" />
                <span>:</span>
                <input type="text" className="w-10 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="12" />
                <input type="text" className="w-10 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="00" />
              </div>
            </div>

            <div className="flex gap-3 mt-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={saveEdit}
                className="flex-1 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Dashboard Content --- */}
      <section className="flex-1 p-8 overflow-y-auto border-r border-[var(--border-color)]">
        <header className="mb-10">
          <h2 className="text-3xl font-black tracking-tighter text-[var(--text-strong)]">Task Overview</h2>
          <p className="text-slate-500">Welcome back! Here’s what’s on your plate today.</p>
        </header>

        <div className="grid gap-3 mb-12">
          {tasks.map((task) => (
            <div key={task.id} className="group p-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-header)] shadow-sm flex items-center justify-between hover:border-indigo-400 transition-all">
              <div className="flex items-center gap-4">
                <button onClick={() => toggleTask(task.id)} className="text-indigo-500">
                  {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} className="text-slate-300" />}
                </button>
                <div className="flex flex-col text-left">
                  <span className={`font-semibold ${task.completed ? "line-through text-slate-400" : "text-[var(--text-strong)]"}`}>{task.title}</span>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{task.class}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil size={16}/></button>
                <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* Static Add Form Area */}
        <div className="p-8 bg-[var(--bg-header)] border-2 border-dashed border-[var(--border-color)] rounded-3xl relative">
          <input 
            className="w-full text-xl font-bold mb-1 outline-none bg-transparent placeholder:text-slate-400 text-[var(--text-strong)]" 
            placeholder="Add Title..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <input 
            className="w-full text-sm text-slate-400 mb-8 outline-none bg-transparent font-medium" 
            placeholder="Class..." 
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span className="text-slate-400 font-black">Due:</span>
            <div className="flex items-center gap-2">Month <input type="text" className="w-8 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="04" /></div>
            <div className="flex items-center gap-2">Day <input type="text" className="w-8 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="25" /></div>
            <span className="text-xl text-slate-300">:</span>
            <div className="flex items-center gap-2">Hour <input type="text" className="w-8 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="12" /></div>
            <div className="flex items-center gap-2">Min <input type="text" className="w-8 border-b border-[var(--border-color)] bg-transparent text-center text-[var(--text-strong)] outline-none" placeholder="00" /></div>
          </div>

          <button 
            onClick={addTask}
            className="absolute bottom-6 right-8 flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
          >
            <span>Add Task</span>
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </section>

      {/* AI Sidebar */}
      <aside className="w-80 p-8 bg-[var(--bg-header)] hidden xl:flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles size={18} className="text-indigo-500" />
          <h3 className="font-black text-xs uppercase tracking-widest text-[var(--text-strong)]">AI Pilot</h3>
        </div>
        <div className="flex-1 bg-[var(--bg-avatar)] border border-[var(--border-color)] rounded-2xl p-5 text-sm text-slate-500 leading-relaxed shadow-inner">
          <p>Task management is cleaner with the new modal view.</p>
          <p className="mt-4">Focused editing helps you maintain your **Starbucks Redesign** flow without losing your place.</p>
        </div>
        <div className="mt-6 flex gap-2">
          <input className="flex-1 p-3 text-xs bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl outline-none" placeholder="Ask AI Pilot..." />
          <button className="bg-indigo-600 p-3 text-white rounded-xl hover:bg-indigo-700 transition-colors"><Send size={16} /></button>
        </div>
      </aside>
    </div>
  );
}