export enum View {
  DASHBOARD = 'DASHBOARD',
  SHORTS_GENERATOR = 'SHORTS_GENERATOR', // Audio Studio
  POST_TEMPLATES = 'POST_TEMPLATES', // 100+ Posts To Copy
  VIRAL_GENERATOR = 'VIRAL_GENERATOR', // James VIRAL Posts
  VIRAL_SEARCH = 'VIRAL_SEARCH', // New: Find Viral Content
  STUDIO_JAMES = 'STUDIO_JAMES', // Studio James Viral Posts
  VIDEO_MAKER = 'VIDEO_MAKER', // AI Viral Video Maker
  IMAGE_GENERATOR = 'IMAGE_GENERATOR', // Create New Image
  SAVED_POSTS = 'SAVED_POSTS',
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
  content: string; // Text content or Base64 data
  preview?: string; // Thumbnail or preview content
  title: string; // Prompt or short description
  createdAt: number;
}

export enum AIModel {
  TEXT = 'gemini-2.5-flash',
  IMAGE_EDIT = 'gemini-2.5-flash-image',
  IMAGE_GEN = 'imagen-4.0-generate-001',
  TTS = 'gemini-2.5-flash-preview-tts',
  VIDEO = 'veo-3.1-fast-generate-preview'
}