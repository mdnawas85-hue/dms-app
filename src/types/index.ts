export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_by: string;
  created_at: string;
}

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  folder_id: string | null;
  uploaded_by: string;
  uploader_email?: string;
  doc_id?: string;
  description?: string;
  category?: string;
  tags?: string[];
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadMeta {
  docId?: string;
  description?: string;
  category?: string;
  tags?: string[];
  expiryDate?: string;
}
