import { createClient } from '@supabase/supabase-js';

// Read from Vite environment variables (e.g. .env.local or Render dashboard environment settings)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if real Supabase credentials are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref')
);

// Create Supabase client (or safe fallback client)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  school?: string;
  targetExamYear?: string;
}

export interface QuizHistoryRecord {
  id: string;
  user_id: string;
  deck_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at: string;
}

// ==================== AUTHENTICATION HELPERS ====================

export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    const localUser = localStorage.getItem('arkiteki_demo_user');
    return localUser ? JSON.parse(localUser) : null;
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function signUpWithEmail(
  email: string, 
  pass: string, 
  profileData?: { fullName?: string; school?: string; targetExamYear?: string }
) {
  if (!isSupabaseConfigured) {
    // Local demo auth simulation for preview before connecting real Supabase
    const mockUser = {
      id: `usr-${Date.now()}`,
      email,
      user_metadata: profileData || {},
    };
    localStorage.setItem('arkiteki_demo_user', JSON.stringify(mockUser));
    return { data: { user: mockUser }, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: profileData,
    },
  });

  return { data, error };
}

export async function signInWithEmail(email: string, pass: string) {
  if (!isSupabaseConfigured) {
    // Local demo auth simulation
    const mockUser = {
      id: `usr-demo-${Date.now()}`,
      email,
      user_metadata: { fullName: email.split('@')[0], school: 'Architecture School' },
    };
    localStorage.setItem('arkiteki_demo_user', JSON.stringify(mockUser));
    return { data: { user: mockUser }, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  return { data, error };
}

export async function signOutUser() {
  if (!isSupabaseConfigured) {
    localStorage.removeItem('arkiteki_demo_user');
    return { error: null };
  }
  return await supabase.auth.signOut();
}

// ==================== DATABASE SYNC HELPERS ====================

export async function syncSavedPromptToSupabase(userId: string, promptItem: {
  title: string;
  prompt: string;
  category: string;
  tags?: string[];
}) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.from('saved_prompts').insert([
    {
      user_id: userId,
      title: promptItem.title,
      prompt: promptItem.prompt,
      category: promptItem.category,
      tags: promptItem.tags || [],
    },
  ]);

  if (error) console.error('Failed to sync prompt to Supabase', error);
  return data;
}

export async function saveQuizScoreToSupabase(userId: string, record: {
  deckTitle: string;
  score: number;
  totalQuestions: number;
}) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.from('quiz_history').insert([
    {
      user_id: userId,
      deck_title: record.deckTitle,
      score: record.score,
      total_questions: record.totalQuestions,
      percentage: Math.round((record.score / record.totalQuestions) * 100),
    },
  ]);

  if (error) console.error('Failed to save score to Supabase', error);
  return data;
}

export async function uploadReviewMaterialToSupabase(userId: string, file: File): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('review-materials')
    .upload(filePath, file);

  if (error) {
    console.error('Failed to upload file to Supabase storage', error);
    return null;
  }

  const { data } = supabase.storage
    .from('review-materials')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
