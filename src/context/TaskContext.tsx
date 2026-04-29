"use client";

import { createContext, useContext, useRef, useState } from "react";

export interface Task {
  id: number;
  title: string;
  class: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  dueDate: string;   // YYYY-MM-DD
  dueTime: string;   // HH:MM (24hr), empty string if none
}

interface TaskContextValue {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: number, updates: Partial<Omit<Task, "id">>) => void;
  deleteTask: (id: number) => void;
  toggleComplete: (id: number) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

function loadInitialTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("task-pilot-storage");
    return saved ? (JSON.parse(saved) as Task[]) : [];
  } catch {
    return [];
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(loadInitialTasks);
  const mountedRef = useRef(false);

  // Persist to localStorage on every change, skipping the initial mount read
  const persist = (next: Task[]) => {
    if (!mountedRef.current) { mountedRef.current = true; }
    localStorage.setItem("task-pilot-storage", JSON.stringify(next));
  };

  const addTask = (task: Omit<Task, "id">) => {
    setTasks(prev => {
      const newId = prev.length > 0 ? Math.max(...prev.map(t => t.id)) + 1 : 1;
      const next = [{ ...task, id: newId }, ...prev];
      persist(next);
      return next;
    });
  };

  const updateTask = (id: number, updates: Partial<Omit<Task, "id">>) => {
    setTasks(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...updates } : t));
      persist(next);
      return next;
    });
  };

  const deleteTask = (id: number) => {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id);
      persist(next);
      return next;
    });
  };

  const toggleComplete = (id: number) => {
    setTasks(prev => {
      const next = prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      persist(next);
      return next;
    });
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleComplete }}>
      {children}
    </TaskContext.Provider>
  );
}

// Custom hook — throws if used outside the provider
export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used inside <TaskProvider>");
  return ctx;
}