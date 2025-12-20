
export enum View {
  DASHBOARD = 'DASHBOARD',
  MASTERCLASS = 'MASTERCLASS', // Strategic Blueprint
  SHORTS_GENERATOR = 'SHORTS_GENERATOR', 
  POST_TEMPLATES = 'POST_TEMPLATES', 
  VIRAL_GENERATOR = 'VIRAL_GENERATOR', 
  VIRAL_SEARCH = 'VIRAL_SEARCH', 
  VIDEO_REPURPOSER = 'VIDEO_REPURPOSER', 
  STUDIO_JAMES = 'STUDIO_JAMES', 
  VIDEO_MAKER = 'VIDEO_MAKER', 
  FREE_VIDEO_GENERATOR = 'FREE_VIDEO_GENERATOR', 
  IMAGE_GENERATOR = 'IMAGE_GENERATOR', 
  AUTHORITY_GENERATOR = 'AUTHORITY_GENERATOR', 
  FACE_FUSION = 'FACE_FUSION', 
  SAVED_POSTS = 'SAVED_POSTS',
  SCHEDULER = 'SCHEDULER', 
  ADMIN = 'ADMIN', 
  ACCOUNT = 'ACCOUNT',
  SETTINGS = 'SETTINGS'
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'Blog' | 'Facebook' | 'X' | 'Instagram' | 'TikTok';
  status: 'Draft' | 'Scheduled' | 'Published';
  date: string;
  engagement?: string;
}

export interface SavedItem {
  id: string;
  type: 'Post' | 'Image' | 'Video' | 'Audio';
  content: string; 
  preview?: string; 
  title: string; 
  createdAt: number;
}

export enum AIModel {
  TEXT = 'gemini-3-flash-preview',
  IMAGE_EDIT = 'gemini-2.5-flash-image',
  IMAGE_GEN = 'imagen-4.0-generate-001',
  TTS = 'gemini-2.5-flash-preview-tts',
  VIDEO = 'veo-3.1-fast-generate-preview'
}
