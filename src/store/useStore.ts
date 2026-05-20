import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Folder, Document } from '../types';
import type { User } from '@supabase/supabase-js';

interface State {
  user: User | null;
  folders: Folder[];
  documents: Document[];
  currentFolder: string | null;
  loading: boolean;
  uploading: boolean;
  searchQuery: string;

  setUser: (user: User | null) => void;
  setCurrentFolder: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  fetchFolders: () => Promise<void>;
  fetchDocuments: (folderId: string | null) => Promise<void>;
  createFolder: (name: string, parentId: string | null) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  uploadFile: (file: File, folderId: string | null) => Promise<void>;
  renameDocument: (id: string, name: string) => Promise<void>;
  moveDocument: (id: string, folderId: string | null) => Promise<void>;
  deleteDocument: (id: string, filePath: string) => Promise<void>;
  getFileUrl: (filePath: string) => string;
}

export const useStore = create<State>((set, get) => ({
  user: null,
  folders: [],
  documents: [],
  currentFolder: null,
  loading: false,
  uploading: false,
  searchQuery: '',

  setUser: (user) => set({ user }),
  setCurrentFolder: (id) => {
    set({ currentFolder: id, searchQuery: '' });
    get().fetchDocuments(id);
  },
  setSearchQuery: (q) => set({ searchQuery: q }),

  fetchFolders: async () => {
    const { data } = await supabase.from('folders').select('*').order('name');
    if (data) set({ folders: data });
  },

  fetchDocuments: async (folderId) => {
    set({ loading: true });
    let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (folderId === null) {
      query = query.is('folder_id', null);
    } else {
      query = query.eq('folder_id', folderId);
    }
    const { data } = await query;
    set({ documents: data ?? [], loading: false });
  },

  createFolder: async (name, parentId) => {
    const { user } = get();
    if (!user) return;
    await supabase.from('folders').insert({ name, parent_id: parentId, created_by: user.id });
    await get().fetchFolders();
  },

  deleteFolder: async (id) => {
    await supabase.from('folders').delete().eq('id', id);
    await get().fetchFolders();
  },

  uploadFile: async (file, folderId) => {
    const { user } = get();
    if (!user) return;
    set({ uploading: true });
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('documents').upload(path, file);
      if (upErr) throw upErr;
      await supabase.from('documents').insert({
        name: file.name,
        file_path: path,
        file_type: file.type || ext || 'unknown',
        file_size: file.size,
        folder_id: folderId,
        uploaded_by: user.id,
        uploader_email: user.email,
      });
      await get().fetchDocuments(folderId);
    } finally {
      set({ uploading: false });
    }
  },

  renameDocument: async (id, name) => {
    await supabase.from('documents').update({ name, updated_at: new Date().toISOString() }).eq('id', id);
    const { currentFolder } = get();
    await get().fetchDocuments(currentFolder);
  },

  moveDocument: async (id, folderId) => {
    await supabase.from('documents').update({ folder_id: folderId, updated_at: new Date().toISOString() }).eq('id', id);
    const { currentFolder } = get();
    await get().fetchDocuments(currentFolder);
  },

  deleteDocument: async (id, filePath) => {
    await supabase.storage.from('documents').remove([filePath]);
    await supabase.from('documents').delete().eq('id', id);
    const { currentFolder } = get();
    await get().fetchDocuments(currentFolder);
  },

  getFileUrl: (filePath) => {
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    return data.publicUrl;
  },
}));
