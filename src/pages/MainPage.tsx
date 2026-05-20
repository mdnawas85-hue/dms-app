import React, { useEffect, useRef, useState } from 'react';
import { Search, Upload, LogOut, Loader2, FolderOpen, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { Sidebar } from '../components/Sidebar';
import { DocumentCard } from '../components/DocumentCard';
import { PreviewModal } from '../components/PreviewModal';
import type { Document } from '../types';

export const MainPage: React.FC = () => {
  const {
    user, documents, folders, currentFolder, loading, uploading,
    searchQuery, fetchFolders, fetchDocuments, uploadFile,
    setSearchQuery, setCurrentFolder,
  } = useStore();

  const [preview, setPreview] = useState<Document | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFolders();
    fetchDocuments(null);
  }, []);

  const currentFolderName = currentFolder
    ? folders.find((f) => f.id === currentFolder)?.name ?? 'Folder'
    : 'All Documents';

  const filtered = searchQuery
    ? documents.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : documents;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => uploadFile(f, currentFolder));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center gap-4 shrink-0">
          <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition max-w-md">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents…"
              className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-slate-500 hidden md:block">{user?.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content area */}
        <main
          className="flex-1 overflow-y-auto p-6"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {dragging && (
            <div className="fixed inset-0 z-40 bg-blue-600/20 border-4 border-dashed border-blue-500 flex items-center justify-center pointer-events-none">
              <div className="bg-white rounded-2xl px-8 py-6 shadow-xl text-center">
                <Upload className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                <p className="text-lg font-semibold text-slate-800">Drop files to upload</p>
              </div>
            </div>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={() => setCurrentFolder(null)} className="text-sm text-slate-500 hover:text-blue-600 transition">
              All Documents
            </button>
            {currentFolder && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-medium text-slate-800">{currentFolderName}</span>
              </>
            )}
            <span className="ml-auto text-xs text-slate-400">{filtered.length} file{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Upload drop zone (empty state) */}
          {!loading && filtered.length === 0 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition"
            >
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">{searchQuery ? 'No results found' : 'No files yet'}</p>
              {!searchQuery && <p className="text-slate-400 text-sm mt-1">Click or drag files here to upload</p>}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 h-52 animate-pulse" />
              ))}
            </div>
          )}

          {/* Document grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onPreview={setPreview} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Preview modal */}
      {preview && <PreviewModal doc={preview} onClose={() => setPreview(null)} />}
    </div>
  );
};
