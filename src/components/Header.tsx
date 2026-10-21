import React from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  Wand2, 
  Calculator, 
  Bookmark, 
  Key,
  CheckCircle2,
  Cpu,
  User,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import type { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  savedCount: number;
  onOpenSaved: () => void;
  apiKey: string;
  onOpenConnectModal: () => void;
  currentModel: string;
  onModelUpdated: (newModel: string) => void;
  user: any;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenSaved,
  apiKey,
  onOpenConnectModal,
  currentModel,
  onModelUpdated,
  user,
  onOpenAuthModal,
  onSignOut,
  theme = 'light',
  onToggleTheme,
}) => {
  // Studio profile tab is removed here because it's directly accessible via the top-right button
  const tabs: { id: AppTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { 
      id: 'quiz', 
      label: 'Exam Quizzes & Uploads', 
      icon: <GraduationCap className="w-4 h-4 text-[#2C6E49] dark:text-emerald-400" />,
      badge: 'Licensure Prep'
    },
    { 
      id: 'improver', 
      label: 'Arkiteki AI Studio', 
      icon: <Wand2 className="w-4 h-4 text-[#C85A32] dark:text-amber-500" />,
      badge: 'AI Generator'
    },
    { 
      id: 'calculator', 
      label: 'Arki Dimension Calculator', 
      icon: <Calculator className="w-4 h-4 text-stone-600 dark:text-stone-400" />,
      badge: 'PD 1096 & BP 344'
    },
  ];

  return (
    <header className="border-b border-[#E8E4DC] dark:border-stone-800 bg-[#FAF8F5]/90 dark:bg-stone-900/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#2C6E49]/15 dark:bg-emerald-950/60 border border-[#2C6E49]/25 dark:border-emerald-800/40 flex items-center justify-center text-[#2C6E49] dark:text-emerald-400 shadow-sm flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 m-0 p-0 font-serif">
                Arkiteki
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#EAE5D9] dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                PH Architecture Studio
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 m-0 hidden sm:block">
              Exam Quizzes & Flashcards • Architectural AI Generator • PD 1096 Building Laws
            </p>
          </div>
        </div>

        {/* Right Tools & Gemini Account Connection */}
        <div className="flex items-center gap-2">
          {/* Gemini Direct Login & Model Picker */}
          {apiKey ? (
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-stone-800 border border-[#E8E4DC] dark:border-stone-700 shadow-xs">
              <button
                onClick={onOpenConnectModal}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#1B4332] dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition cursor-pointer"
                title="Manage Gemini API Key & Connection"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2C6E49] dark:text-emerald-400" />
                <span className="hidden md:inline">Connected</span>
              </button>

              <div className="h-4 w-px bg-[#E8E4DC] dark:bg-stone-700" />

              <div className="flex items-center gap-1 pr-1">
                <Cpu className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                <select
                  value={currentModel}
                  onChange={(e) => onModelUpdated(e.target.value)}
                  className="text-xs font-semibold bg-[#FAF8F5] dark:bg-stone-900 hover:bg-[#F3EFE6] dark:hover:bg-stone-800 border border-[#E8E4DC] dark:border-stone-700 rounded-xl px-2 py-0.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#2C6E49] cursor-pointer"
                  title="Select Gemini Model Tier (Pro vs Flash)"
                >
                  <option value="gemini-3.8-flash">⚡ 3.8 Flash</option>
                  <option value="gemini-2.0-flash">⚡ 2.0 Flash</option>
                  <option value="gemini-3.5-flash-lite">⚡ 3.5 Lite</option>
                  <option value="gemini-1.5-pro">🧠 1.5 Pro</option>
                </select>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenConnectModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E8E4DC] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500 transition cursor-pointer shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
              <span className="hidden sm:inline">Connect Gemini</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-[#E8E4DC] dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition cursor-pointer shadow-xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark/light mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" />
              )}
            </button>
          )}

          {/* Saved Items Button */}
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-[#E8E4DC] dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 text-xs font-medium hover:border-stone-400 transition cursor-pointer shadow-xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#C85A32]" />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#C85A32] text-white text-[10px] font-bold flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* User Account / Gemini Studio Account */}
          {user ? (
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-stone-800 border border-[#E8E4DC] dark:border-stone-700 shadow-xs">
              <button 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#1B4332] dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition cursor-pointer"
                title={`Studio Profile: ${user.user_metadata?.fullName || user.email}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#2C6E49] text-white flex items-center justify-center text-[10px] font-bold">
                  {(user.user_metadata?.fullName || user.email || 'A')[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {user.user_metadata?.fullName || user.email?.split('@')[0]}
                </span>
              </button>

              <div className="h-4 w-px bg-[#E8E4DC] dark:bg-stone-700" />

              <button
                onClick={onSignOut}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : apiKey ? (
            /* Gemini API Key connected acts as user account */
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 p-1 px-2.5 py-1 rounded-2xl bg-white dark:bg-stone-800 border border-[#E8E4DC] dark:border-stone-700 hover:border-[#2C6E49] shadow-xs text-xs font-semibold text-[#1B4332] dark:text-emerald-300 transition cursor-pointer"
              title="Open Studio Profile & Reviewer History"
            >
              <div className="w-5 h-5 rounded-full bg-[#2C6E49]/15 text-[#2C6E49] dark:bg-emerald-950/60 dark:text-emerald-400 border border-[#2C6E49]/30 flex items-center justify-center text-xs">
                🏛️
              </div>
              <span className="hidden sm:inline">Studio Profile</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E8E4DC] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 hover:text-stone-900 transition cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-[#2C6E49] dark:text-emerald-400" />
              <span className="hidden sm:inline">Sign In / Join</span>
            </button>
          )}
        </div>
      </div>

      {/* Clean Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex space-x-2 overflow-x-auto py-1 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-[#E8E4DC] dark:border-stone-700 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive
                        ? 'bg-[#2C6E49]/10 text-[#2C6E49] dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-stone-200/60 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
