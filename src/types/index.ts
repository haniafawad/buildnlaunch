export interface User {
  id: string;
  email: string;
  topic?: string;
  audience?: string;
  product_title?: string;
  brand_handle: string;
  onboarding_complete: boolean;
  first_name?: string;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  content_type_index: number;
  format_type_index: number;
  launch_tracker: boolean[];
  ready_checklist: boolean[];
  pdf_outline_approved: boolean;
  pdf_downloaded: boolean;
  first_content_posted: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedContent {
  id: string;
  user_id: string;
  content_type: string;
  format: string;
  text_overlay: string;
  caption: string;
  hashtags: string;
  created_at: string;
}

export interface PDFOutline {
  id: string;
  user_id: string;
  outline: OutlineSection[];
  created_at: string;
}

export interface OutlineSection {
  title: string;
  description: string;
  bullets: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
