import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Document } from '../types';

interface Props {
  doc: Document;
  onClose: () => void;
}

export const PreviewModal: React.FC<Props> = ({ doc, onClose }) => {
  const { getFileUrl } = useStore();
  const url = getFileUrl(doc.file_path);
  const isImage = doc.file_type.startsWith('image/');
  const isPdf = doc.file_type.includes('pdf');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="font-medium text-slate-800 truncate">{doc.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download={doc.name}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview body */}
        <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-4 min-h-0">
          {isImage && (
            <img src={url} alt={doc.name} className="max-w-full max-h-full rounded-lg shadow-md object-contain" />
          )}
          {isPdf && (
            <iframe src={url} title={doc.name} className="w-full h-full min-h-[60vh] rounded-lg" />
          )}
          {!isImage && !isPdf && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">Preview not available for this file type.</p>
              <a
                href={url}
                download={doc.name}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Download className="w-4 h-4" /> Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
