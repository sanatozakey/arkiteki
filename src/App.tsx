import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuizStudio } from './components/QuizStudio';
import { PromptImprover } from './components/PromptImprover';
import { DimensionCalculator } from './components/DimensionCalculator';
import { GeminiAuthModal } from './components/GeminiAuthModal';
import { SavedPromptsModal } from './components/SavedPromptsModal';
import { AuthModal } from './components/AuthModal';
import { getStoredGeminiKey, getStoredGeminiModel, setStoredGeminiModel } from './utils/geminiApi';
import { getCurrentUser, signOutUser, syncSavedPromptToSupabase } from './utils/supabaseClient';
import type { AppTab, SavedPromptItem } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('quiz');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>(() => getStoredGeminiKey());
  const [selectedModel, setSelectedModel] = useState<string>(() => getStoredGeminiModel());
  
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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col font-sans selection:bg-[#2C6E49]/15 selection:text-[#1B4332]">
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
        />

        <main className="flex-1 pb-16">
          {activeTab === 'quiz' && (
            <QuizStudio 
              apiKey={apiKey} 
              onOpenConnectModal={() => setIsConnectModalOpen(true)} 
              user={user}
              currentModel={selectedModel}
            />
          )}

          {activeTab === 'improver' && (
            <PromptImprover 
              apiKey={apiKey}
              onSavePrompt={handleSavePrompt}
              onOpenConnectModal={() => setIsConnectModalOpen(true)}
              currentModel={selectedModel}
              onModelUpdated={handleModelUpdated}
            />
          )}

          {activeTab === 'calculator' && (
            <DimensionCalculator />
          )}
        </main>

        {/* Soft, calm architectural footer */}
        <footer className="border-t border-[#E8E4DC] bg-[#FAF8F5]/80 py-6 px-4 text-center text-xs text-stone-500">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800 font-serif text-sm">Arkiteki</span>
              <span>•</span>
              <span>Philippine Architecture Studio & Licensure Exam Companion</span>
            </div>

            <div className="flex items-center gap-4 text-stone-500">
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="hover:text-stone-800 transition cursor-pointer"
              >
                {apiKey ? `Connected to ${selectedModel}` : 'Connect Gemini API'}
              </button>
              <button
                onClick={() => setIsSavedModalOpen(true)}
                className="hover:text-stone-800 transition cursor-pointer"
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
