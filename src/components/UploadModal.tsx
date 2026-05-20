import React, { useState } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';

interface FileMeta {
  file: File;
  name: string;
}

interface Props {
  files: File[];
  folderId: string | null;
  onClose: () => void;
}

const CATEGORIES = ['Contract', 'Invoice', 'Report', 'Policy', 'HR Document', 'Technical', 'Other'];

export const UploadModal: React.FC<Props> = ({ files, folderId, onClose }) => {
  const { uploadFile, uploading } = useStore();
  const [fileMetas, setFileMetas] = useState<FileMeta[]>(
    files.map((f) => ({ file: f, name: f.name }))
  );
  const [docId, setDocId] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
    const meta = {
      docId: docId || undefined,
      description: description || undefined,
      category: category || undefined,
      tags: tags.length ? tags : undefined,
      expiryDate: expiryDate || undefined,
    };
    for (const { file, name } of fileMetas) {
      await uploadFile(file, folderId, name, meta);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">Upload Documents</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* File names */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Files ({fileMetas.length})
            </label>
            {fileMetas.map((fm, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                <input
                  value={fm.name}
                  onChange={(e) =>
                    setFileMetas((prev) =>
                      prev.map((m, j) => (j === i ? { ...m, name: e.target.value } : m))
                    )
                  }
                  className="flex-1 text-sm bg-transparent outline-none text-slate-700"
                />
              </div>
            ))}
          </div>

          {/* Document ID */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              Document ID
            </label>
            <input
              type="text"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              placeholder="e.g. DOC-2026-001"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document..."
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white transition"
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              Tags
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. urgent, 2026, approved"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
            <p className="text-xs text-slate-400 mt-1">Separate tags with commas</p>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload {fileMetas.length} file{fileMetas.length !== 1 ? 's' : ''}
          </button>
        </form>
      </div>
    </div>
  );
};
