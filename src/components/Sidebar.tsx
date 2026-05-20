import React, { useState } from 'react';
import { Folder, FolderOpen, Plus, Trash2, FileText, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Sidebar: React.FC = () => {
  const { folders, currentFolder, setCurrentFolder, createFolder, deleteFolder } = useStore();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const rootFolders = folders.filter((f) => f.parent_id === null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createFolder(newName.trim(), null);
    setNewName('');
    setAdding(false);
  };

  return (
    <aside className="w-56 shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">DocStore</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {/* All Documents */}
        <button
          onClick={() => setCurrentFolder(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition mb-1 ${
            currentFolder === null ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="truncate">All Documents</span>
        </button>

        <div className="flex items-center justify-between px-3 py-1 mt-3 mb-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Folders</span>
          <button onClick={() => setAdding(true)} className="text-slate-500 hover:text-slate-300 transition">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {adding && (
          <form onSubmit={handleAdd} className="px-2 mb-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => { setAdding(false); setNewName(''); }}
              placeholder="Folder name…"
              className="w-full bg-slate-800 text-slate-200 text-sm px-3 py-1.5 rounded-lg outline-none border border-slate-600 focus:border-blue-500"
            />
          </form>
        )}

        {rootFolders.map((folder) => (
          <div key={folder.id} className="group relative">
            <button
              onClick={() => setCurrentFolder(folder.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                currentFolder === folder.id ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              {currentFolder === folder.id
                ? <FolderOpen className="w-4 h-4 shrink-0 text-blue-400" />
                : <Folder className="w-4 h-4 shrink-0" />}
              <span className="truncate flex-1 text-left">{folder.name}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50" />
            </button>
            <button
              onClick={() => deleteFolder(folder.id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex text-slate-500 hover:text-red-400 transition p-1"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {rootFolders.length === 0 && !adding && (
          <p className="text-xs text-slate-600 px-3 py-2">No folders yet</p>
        )}
      </nav>
    </aside>
  );
};
