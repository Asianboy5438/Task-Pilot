"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus, Folder, FileText, Trash2, ChevronRight,
  Bold, Italic, Underline, Pen, Eraser, X, FolderPlus
} from "lucide-react";

interface Note {
  id: number;
  title: string;
  content: string;
  folderId: number | null;
  createdAt: string;
  drawing?: string;
}

interface NoteFolder {
  id: number;
  name: string;
}

export default function NotesPage() {
  const [folders, setFolders] = useState<NoteFolder[]>([
    { id: 1, name: "CGT 390" },
    { id: 2, name: "Personal" },
  ]);
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, title: "Project Ideas", content: "Brainstorm for Task-Pilot features...", folderId: 1, createdAt: "2026-04-01" },
    { id: 2, title: "Meeting Notes", content: "Discussed checkpoint progress...", folderId: 1, createdAt: "2026-04-05" },
    { id: 3, title: "Todo", content: "Buy groceries, call mom...", folderId: null, createdAt: "2026-04-10" },
  ]);

  const [selectedFolderId, setSelectedFolderId] = useState<number | "all" | null>("all");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [penColor, setPenColor] = useState("#6366f1");
  const [penSize, setPenSize] = useState(3);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteFolderId, setNewNoteFolderId] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Load note into editor
  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
    }
  }, [selectedNote?.id]);

  // Load drawing onto canvas when switching notes
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (selectedNote?.drawing) {
      const img = new Image();
      img.src = selectedNote.drawing;
      img.onload = () => ctx.drawImage(img, 0, 0);
    }
  }, [selectedNote?.id, isDrawing]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    const pos = getPos(e);

    if (isErasing) {
      ctx.clearRect(pos.x - 10, pos.y - 10, 20, 20);
    } else {
      ctx.beginPath();
      ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const stopDraw = () => {
    drawing.current = false;
    if (canvasRef.current && selectedNote) {
      const dataUrl = canvasRef.current.toDataURL();
      saveDrawing(dataUrl);
    }
  };

  const saveDrawing = (dataUrl: string) => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, drawing: dataUrl };
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? updated : n));
    setSelectedNote(updated);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveDrawing("");
  };

  const saveNote = () => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, title: editTitle, content: editContent };
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? updated : n));
    setSelectedNote(updated);
  };

  const createNote = () => {
    if (!newNoteTitle.trim()) return;
    const newNote: Note = {
      id: Date.now(),
      title: newNoteTitle.trim(),
      content: "",
      folderId: newNoteFolderId,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote);
    setShowNewNoteModal(false);
    setNewNoteTitle("");
    setNewNoteFolderId(null);
    setIsDrawing(false);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: NoteFolder = { id: Date.now(), name: newFolderName.trim() };
    setFolders(prev => [...prev, newFolder]);
    setShowNewFolderModal(false);
    setNewFolderName("");
  };

  const deleteNote = (id: number) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const deleteFolder = (id: number) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setNotes(prev => prev.map(n => n.folderId === id ? { ...n, folderId: null } : n));
    if (selectedFolderId === id) setSelectedFolderId("all");
  };

  const visibleNotes = notes.filter(n =>
    selectedFolderId === "all" ? true : n.folderId === selectedFolderId
  );

  const COLORS = ["#6366f1", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#ffffff", "#000000"];

  return (
    <div className="flex h-full bg-[var(--bg-main)] transition-colors duration-300 overflow-hidden">

      {/* ── LEFT PANEL: Folders + Note List ── */}
      <div className="w-64 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-header)] shrink-0">

        {/* Folders */}
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Folders</p>
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="p-1 hover:bg-[var(--bg-avatar)] rounded-md text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <FolderPlus size={15} />
            </button>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => setSelectedFolderId("all")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedFolderId === "all"
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-slate-400 hover:bg-[var(--bg-avatar)] hover:text-[var(--text-strong)]"
              }`}
            >
              <FileText size={14} />
              All Notes
              <span className="ml-auto text-[10px] text-slate-500">{notes.length}</span>
            </button>

            {folders.map(folder => (
              <div key={folder.id} className="group flex items-center">
                <button
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedFolderId === folder.id
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-slate-400 hover:bg-[var(--bg-avatar)] hover:text-[var(--text-strong)]"
                  }`}
                >
                  <Folder size={14} />
                  {folder.name}
                  <span className="ml-auto text-[10px] text-slate-500">
                    {notes.filter(n => n.folderId === folder.id).length}
                  </span>
                </button>
                <button
                  onClick={() => deleteFolder(folder.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 mr-1 text-slate-500 hover:text-red-400 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</p>
            <button
              onClick={() => setShowNewNoteModal(true)}
              className="p-1 hover:bg-[var(--bg-avatar)] rounded-md text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="space-y-1">
            {visibleNotes.length === 0 && (
              <p className="text-xs text-slate-500 italic px-3 py-4 text-center">No notes yet</p>
            )}
            {visibleNotes.map(note => (
              <div key={note.id} className="group relative">
                <button
                  onClick={() => { setSelectedNote(note); setIsDrawing(false); }}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                    selectedNote?.id === note.id
                      ? "bg-indigo-500/10 border border-indigo-500/20"
                      : "hover:bg-[var(--bg-avatar)] border border-transparent"
                  }`}
                >
                  <p className={`text-xs font-bold truncate ${
                    selectedNote?.id === note.id ? "text-indigo-400" : "text-[var(--text-strong)]"
                  }`}>
                    {note.title}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{note.content || "Empty note"}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{note.createdAt}</p>
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Editor ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNote ? (
          <>
            {/* Editor Toolbar */}
            <div className="h-14 border-b border-[var(--border-color)] flex items-center px-6 gap-3 bg-[var(--bg-header)] shrink-0">
              <ChevronRight size={14} className="text-slate-600" />

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-[var(--bg-main)] rounded-lg p-1 border border-[var(--border-color)]">
                <button
                  onClick={() => setIsDrawing(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    !isDrawing ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-[var(--text-strong)]"
                  }`}
                >
                  <Bold size={12} /> Write
                </button>
                <button
                  onClick={() => setIsDrawing(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    isDrawing ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-[var(--text-strong)]"
                  }`}
                >
                  <Pen size={12} /> Draw
                </button>
              </div>

              {/* Text formatting (write mode only) */}
              {!isDrawing && (
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-[var(--bg-avatar)] rounded-lg text-slate-400 hover:text-[var(--text-strong)] transition-colors">
                    <Bold size={15} />
                  </button>
                  <button className="p-2 hover:bg-[var(--bg-avatar)] rounded-lg text-slate-400 hover:text-[var(--text-strong)] transition-colors">
                    <Italic size={15} />
                  </button>
                  <button className="p-2 hover:bg-[var(--bg-avatar)] rounded-lg text-slate-400 hover:text-[var(--text-strong)] transition-colors">
                    <Underline size={15} />
                  </button>
                </div>
              )}

              {/* Drawing tools (draw mode only) */}
              {isDrawing && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => { setPenColor(c); setIsErasing(false); }}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${
                          penColor === c && !isErasing ? "border-white scale-125" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Size</span>
                    <input
                      type="range" min={1} max={20} value={penSize}
                      onChange={e => setPenSize(Number(e.target.value))}
                      className="w-20 accent-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => setIsErasing(!isErasing)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isErasing ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:bg-[var(--bg-avatar)]"
                    }`}
                  >
                    <Eraser size={13} /> Eraser
                  </button>
                  <button
                    onClick={clearCanvas}
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Save button */}
              {!isDrawing && (
                <button
                  onClick={saveNote}
                  className="ml-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Save
                </button>
              )}
            </div>

            {/* Note Title */}
            <div className="px-10 pt-8 pb-4 bg-[var(--bg-main)] shrink-0">
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onBlur={saveNote}
                className="w-full text-3xl font-black bg-transparent outline-none text-[var(--text-strong)] placeholder-slate-600"
                placeholder="Untitled Note"
              />
              <p className="text-xs text-slate-500 mt-1">
                {folders.find(f => f.id === selectedNote.folderId)?.name ?? "Unfiled"} · {selectedNote.createdAt}
              </p>
            </div>

            {/* Write or Draw Mode */}
            <div className="flex-1 overflow-hidden relative">
              {!isDrawing ? (
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  onBlur={saveNote}
                  placeholder="Start typing your note..."
                  className="w-full h-full px-10 py-4 bg-[var(--bg-main)] text-[var(--text-strong)] text-sm leading-relaxed resize-none outline-none placeholder-slate-600"
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={800}
                  className="w-full h-full cursor-crosshair bg-[var(--bg-main)]"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                />
              )}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-black text-[var(--text-strong)] mb-2">No note selected</h3>
            <p className="text-sm text-slate-500 mb-6">Pick a note from the list or create a new one</p>
            <button
              onClick={() => setShowNewNoteModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <Plus size={16} /> New Note
            </button>
          </div>
        )}
      </div>

      {/* ── NEW NOTE MODAL ── */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[var(--bg-header)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-[var(--text-strong)]">New Note</h3>
              <button onClick={() => setShowNewNoteModal(false)} className="text-slate-400 hover:text-red-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Title</label>
                <input
                  autoFocus
                  value={newNoteTitle}
                  onChange={e => setNewNoteTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createNote()}
                  placeholder="Note title..."
                  className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-strong)] placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Folder (optional)</label>
                <select
                  value={newNoteFolderId ?? ""}
                  onChange={e => setNewNoteFolderId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-strong)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="">Unfiled</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={createNote}
                disabled={!newNoteTitle.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW FOLDER MODAL ── */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[var(--bg-header)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-[var(--text-strong)]">New Folder</h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-slate-400 hover:text-red-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Folder Name</label>
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createFolder()}
                  placeholder="e.g. CGT 390"
                  className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-strong)] placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}