"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, ChevronDown } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface Task {
  id: number;
  text: string;
  class?: string;
  details?: string;
  date: string; // YYYY-MM-DD
  priority: "HIGH" | "MEDIUM" | "LOW";
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  LOW: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  
  // Form States
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskClass, setNewTaskClass] = useState("");
  const [newTaskDetails, setNewTaskDetails] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"HIGH"|"MEDIUM"|"LOW">("MEDIUM");

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const openModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  const addTask = () => {
    if (!newTaskText.trim() || !selectedDate) return;
    
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : Date.now();

    setTasks(prev => [...prev, {
      id: newId,
      text: newTaskText.trim(),
      class: newTaskClass.trim(),
      details: newTaskDetails.trim(),
      date: selectedDate,
      priority: newTaskPriority,
    }]);

    setNewTaskText("");
    setNewTaskClass("");
    setNewTaskDetails("");
    setNewTaskPriority("MEDIUM");
    setShowModal(false);
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getTasksForDate = (dateStr: string) =>
    tasks.filter(t => t.date === dateStr);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-6 transition-colors duration-300 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-strong)]">Calendar</h1>
            <p className="text-slate-500 mt-1 text-sm">Click any day to add an assignment.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--bg-avatar)] text-slate-400 hover:text-[var(--text-strong)] transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="text-lg font-bold text-[var(--text-strong)] w-44 text-center">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--bg-avatar)] text-slate-400 hover:text-[var(--text-strong)] transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const dayTasks = getTasksForDate(dateStr);
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                onClick={() => openModal(dateStr)}
                className={`min-h-[100px] rounded-xl p-2 border cursor-pointer transition-all group
                  ${isToday
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-[var(--border-color)] bg-[var(--bg-header)] hover:border-indigo-500/50 hover:bg-[var(--bg-avatar)]"
                  }`}
              >
                <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? "bg-indigo-600 text-white" : "text-slate-400 group-hover:text-[var(--text-strong)]"}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {/* Show only 2 tasks + count if > 3, otherwise show up to 3 */}
                  {dayTasks.length > 3 ? (
                    <>
                      {dayTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer hover:opacity-70 transition-opacity ${PRIORITY_COLORS[task.priority]}`}
                        >
                          {task.text}
                        </div>
                      ))}
                      <div className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5">
                        + {dayTasks.length - 2} more
                      </div>
                    </>
                  ) : (
                    dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer hover:opacity-70 transition-opacity ${PRIORITY_COLORS[task.priority]}`}
                      >
                        {task.text}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[var(--bg-header)] border border-[var(--border-color)] rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
            
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
            >
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

              <div className="relative">
                <textarea
                  value={newTaskDetails}
                  onChange={e => setNewTaskDetails(e.target.value)}
                  placeholder="Add task details..."
                  className="w-full h-32 p-4 rounded-2xl bg-transparent border border-slate-200 text-slate-600 placeholder-slate-300 outline-none resize-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Priority</h4>
                <div className="relative">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as "HIGH" | "MEDIUM" | "LOW")}
                    className={`w-full p-4 pr-10 rounded-2xl border font-bold text-sm uppercase tracking-widest outline-none appearance-none cursor-pointer transition-all
                      ${newTaskPriority === 'HIGH' ? 'border-red-200 text-red-500 bg-red-50/30' : 
                        newTaskPriority === 'MEDIUM' ? 'border-amber-200 text-amber-500 bg-amber-50/30' : 
                        'border-emerald-200 text-emerald-500 bg-emerald-50/30'}`}
                  >
                    <option value="HIGH" className="text-red-500 bg-white">High</option>
                    <option value="MEDIUM" className="text-amber-500 bg-white">Medium</option>
                    <option value="LOW" className="text-emerald-500 bg-white">Low</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>

              <button
                onClick={addTask}
                disabled={!newTaskText.trim()}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-indigo-100"
              >
                Add to Calendar
              </button>
              
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  Scheduled for: {selectedDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}