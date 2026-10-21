import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuizStudio } from './components/QuizStudio';
import { PromptImprover } from './components/PromptImprover';
import { DimensionCalculator } from './components/DimensionCalculator';
import { GeminiAuthModal } from './components/GeminiAuthModal';
import { SavedPromptsModal } from './components/SavedPromptsModal';
import { AuthModal } from './components/AuthModal';
import { ProfileView } from './components/ProfileView';
import { getStoredGeminiKey, getStoredGeminiModel, setStoredGeminiModel } from './utils/geminiApi';
import { getCurrentUser, signOutUser, syncSavedPromptToSupabase } from './utils/supabaseClient';
import type { AppTab, SavedPromptItem, QuizDeck } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('quiz');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>(() => getStoredGeminiKey());
  const [selectedModel, setSelectedModel] = useState<string>(() => getStoredGeminiModel());
  
  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('arkiteki_theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('arkiteki_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Theme storage error', e);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Check active Supabase or demo session on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch (e) {
        console.warn('Session load', e);
      }
    }
    loadUser();
  }, []);

  const [targetStudioDeck, setTargetStudioDeck] = useState<QuizDeck | null>(null);
  const [targetStudioPrompt, setTargetStudioPrompt] = useState<string>('');

  // LocalStorage for saved items
  const [savedPrompts, setSavedPrompts] = useState<SavedPromptItem[]>(() => {
    try {
      const stored = localStorage.getItem('arkiteki_saved_items') || localStorage.getItem('draft_drill_saved_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('arkiteki_saved_items', JSON.stringify(savedPrompts));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [savedPrompts]);

  const handleModelUpdated = (newModel: string) => {
    setSelectedModel(newModel);
    setStoredGeminiModel(newModel);
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
  };

  const handleSavePrompt = async (title: string, prompt: string, category: string) => {
    const newItem: SavedPromptItem = {
      id: `saved-${Date.now()}`,
      title,
      prompt,
      category,
      timestamp: Date.now(),
      tags: [category],
    };
    setSavedPrompts(prev => [newItem, ...prev]);

    // Cloud sync to Supabase if signed in
    if (user?.id) {
      await syncSavedPromptToSupabase(user.id, {
        title,
        prompt,
        category,
        tags: [category],
      });
    }
  };

  const handleDeleteSavedPrompt = (id: string) => {
    setSavedPrompts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#121417] text-stone-800 dark:text-stone-200 flex flex-col font-sans selection:bg-[#2C6E49]/15 selection:text-[#1B4332] transition-colors">
      {/* Subtle warm drafting grid pattern */}
      <div className="fixed inset-0 drafting-grid pointer-events-none z-0 opacity-60" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedCount={savedPrompts.length}
          onOpenSaved={() => setIsSavedModalOpen(true)}
          apiKey={apiKey}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
          currentModel={selectedModel}
          onModelUpdated={handleModelUpdated}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1 pb-16">
          {activeTab === 'quiz' && (
            <QuizStudio 
              apiKey={apiKey} 
              onOpenConnectModal={() => setIsConnectModalOpen(true)} 
              user={user}
              currentModel={selectedModel}
              initialDeck={targetStudioDeck}
            />
          )}

          {activeTab === 'improver' && (
            <PromptImprover 
              apiKey={apiKey}
              onSavePrompt={handleSavePrompt}
              onOpenConnectModal={() => setIsConnectModalOpen(true)}
              currentModel={selectedModel}
              onModelUpdated={handleModelUpdated}
              initialPrompt={targetStudioPrompt}
            />
          )}

          {activeTab === 'calculator' && (
            <DimensionCalculator />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              user={user}
              apiKey={apiKey}
              currentModel={selectedModel}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onLoadPromptToStudio={(promptText) => {
                setTargetStudioPrompt(promptText);
                setActiveTab('improver');
              }}
              onLoadDeckToQuiz={(deck) => {
                setTargetStudioDeck(deck);
                setActiveTab('quiz');
              }}
              onOpenConnectModal={() => setIsConnectModalOpen(true)}
              onModelUpdated={handleModelUpdated}
            />
          )}
        </main>

        {/* Soft, calm architectural footer */}
        <footer className="border-t border-[#E8E4DC] dark:border-stone-800 bg-[#FAF8F5]/80 dark:bg-stone-900/80 py-6 px-4 text-center text-xs text-stone-500 dark:text-stone-400 transition-colors">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800 dark:text-stone-200 font-serif text-sm">Arkiteki</span>
              <span>•</span>
              <span>Philippine Architecture Studio & Licensure Exam Companion</span>
            </div>

            <div className="flex items-center gap-4 text-stone-500 dark:text-stone-400">
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
              >
                {apiKey ? `Connected to ${selectedModel}` : 'Connect Gemini API'}
              </button>
              <button
                onClick={() => setIsSavedModalOpen(true)}
                className="hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
              >
                Saved Library
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <GeminiAuthModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        currentKey={apiKey}
        onKeyUpdated={(newKey) => setApiKey(newKey)}
        currentModel={selectedModel}
        onModelUpdated={handleModelUpdated}
      />

      <SavedPromptsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedPrompts={savedPrompts}
        onDeletePrompt={handleDeleteSavedPrompt}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)}
      />
    </div>
  );
};

export default App;
