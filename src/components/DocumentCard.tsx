import React, { useState } from 'react';
import { FileText, Image, Film, FileArchive, MoreVertical, Pencil, Trash2, FolderInput, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import type { Document } from '../types';

const FileIcon: React.FC<{ type: string; className?: string }> = ({ type, className = 'w-8 h-8' }) => {
  if (type.startsWith('image/')) return <Image className={`${className} text-green-500`} />;
  if (type.startsWith('video/')) return <Film className={`${className} text-purple-500`} />;
  if (type.includes('pdf')) return <FileText className={`${className} text-red-500`} />;
  if (type.includes('zip') || type.includes('rar')) return <FileArchive className={`${className} text-yellow-500`} />;
  return <FileText className={`${className} text-blue-500`} />;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  doc: Document;
  onPreview: (doc: Document) => void;
}

export const DocumentCard: React.FC<Props> = ({ doc, onPreview }) => {
  const { renameDocument, deleteDocument, moveDocument, folders, getFileUrl } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(doc.name);
  const [moving, setMoving] = useState(false);

  const url = getFileUrl(doc.file_path);
  const isImage = doc.file_type.startsWith('image/');

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) await renameDocument(doc.id, newName.trim());
    setRenaming(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition overflow-hidden group">
      {/* Preview area */}
      <div
        className="h-36 bg-slate-50 flex items-center justify-center cursor-pointer relative overflow-hidden"
        onClick={() => onPreview(doc)}
      >
        {isImage ? (
          <img src={url} alt={doc.name} className="w-full h-full object-cover" />
        ) : (
          <FileIcon type={doc.file_type} className="w-12 h-12 opacity-60" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {renaming ? (
              <form onSubmit={handleRename}>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => setRenaming(false)}
                  className="w-full text-sm border border-blue-400 rounded px-1.5 py-0.5 outline-none"
                />
              </form>
            ) : (
              <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
            )}
            <p className="text-xs text-slate-400 mt-0.5">{formatBytes(doc.file_size)} · {format(new Date(doc.created_at), 'MMM d, yyyy')}</p>
            {doc.doc_id && <p className="text-xs text-slate-400 font-mono">#{doc.doc_id}</p>}
            {doc.category && (
              <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md">{doc.category}</span>
            )}
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {doc.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">{tag}</span>
                ))}
              </div>
            )}
            {doc.expiry_date && (
              <p className="text-xs text-amber-500 mt-0.5">Expires {format(new Date(doc.expiry_date), 'MMM d, yyyy')}</p>
            )}
          </div>

          {/* Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-7 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 w-40" onMouseLeave={() => setMenuOpen(false)}>
                <button onClick={() => { onPreview(doc); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <a href={url} download={doc.name} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button onClick={() => { setRenaming(true); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <Pencil className="w-3.5 h-3.5" /> Rename
                </button>
                <button onClick={() => { setMoving(true); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <FolderInput className="w-3.5 h-3.5" /> Move
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => { deleteDocument(doc.id, doc.file_path); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Move selector */}
        {moving && (
          <div className="mt-2">
            <select
              autoFocus
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5"
              onChange={(e) => { moveDocument(doc.id, e.target.value || null); setMoving(false); }}
              onBlur={() => setMoving(false)}
              defaultValue={doc.folder_id ?? ''}
            >
              <option value="">Root (no folder)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
