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
  LogOut
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
}) => {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { 
      id: 'quiz', 
      label: 'Exam Quizzes & Uploads', 
      icon: <GraduationCap className="w-4 h-4 text-[#2C6E49]" />,
      badge: 'Licensure Prep'
    },
    { 
      id: 'improver', 
      label: 'Prompt Improver & In-App 3D', 
      icon: <Wand2 className="w-4 h-4 text-[#C85A32]" />,
      badge: 'Direct Render'
    },
    { 
      id: 'calculator', 
      label: 'Arki Dimension Calculator', 
      icon: <Calculator className="w-4 h-4 text-stone-600" />,
      badge: 'PD 1096 & BP 344'
    },
  ];

  return (
    <header className="border-b border-[#E8E4DC] bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#2C6E49]/15 border border-[#2C6E49]/25 flex items-center justify-center text-[#2C6E49] shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight text-stone-900 m-0 p-0 font-serif">
                Arkiteki
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#EAE5D9] text-stone-700 font-semibold">
                PH Architecture Studio
              </span>
            </div>
            <p className="text-[11px] text-stone-500 m-0">
              Exam Quizzes & Flashcards • Multimodal Prompt Improver • PD 1096 Building Laws
            </p>
          </div>
        </div>

        {/* Right Tools & Gemini Account Connection */}
        <div className="flex items-center gap-2.5">
          {/* Gemini Direct Login & Model Picker */}
          {apiKey ? (
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E8E4DC] shadow-xs">
              <button
                onClick={onOpenConnectModal}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#1B4332] hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                title="Manage Gemini API Key & Connection"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2C6E49]" />
                <span className="hidden sm:inline">Connected</span>
              </button>

              <div className="h-4 w-px bg-[#E8E4DC]" />

              <div className="flex items-center gap-1 pr-1">
                <Cpu className="w-3 h-3 text-stone-400" />
                <select
                  value={currentModel}
                  onChange={(e) => onModelUpdated(e.target.value)}
                  className="text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F3EFE6] border border-[#E8E4DC] rounded-xl px-2 py-0.5 text-stone-800 focus:outline-none focus:border-[#2C6E49] cursor-pointer"
                  title="Select Gemini Model Tier (Pro vs Flash)"
                >
                  <option value="gemini-2.5-flash">⚡ 2.5 Flash</option>
                  <option value="gemini-2.5-pro">🧠 2.5 Pro (Pro User)</option>
                  <option value="gemini-3-pro-preview">🚀 3 Pro Preview</option>
                  <option value="gemini-2.0-flash">⚡ 2.0 Flash</option>
                </select>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenConnectModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E8E4DC] bg-white text-stone-600 hover:border-stone-400 transition cursor-pointer shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-stone-400" />
              <span>Connect Gemini Account</span>
            </button>
          )}

          <button
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DC] text-stone-600 hover:text-stone-900 text-xs font-medium hover:border-stone-400 transition cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#C85A32] text-white text-[10px] font-bold flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* User Account / Supabase Auth Button */}
          {user ? (
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E8E4DC] shadow-xs">
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#1B4332] rounded-xl"
                title={`Signed in as ${user.email} (${user.user_metadata?.school || 'Student'})`}
              >
                <div className="w-5 h-5 rounded-full bg-[#2C6E49] text-white flex items-center justify-center text-[10px] font-bold">
                  {(user.user_metadata?.fullName || user.email || 'A')[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {user.user_metadata?.fullName || user.email?.split('@')[0]}
                </span>
              </div>

              <div className="h-4 w-px bg-[#E8E4DC]" />

              <button
                onClick={onSignOut}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E8E4DC] bg-white text-stone-700 hover:border-stone-400 hover:text-stone-900 transition cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-[#2C6E49]" />
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
                    ? 'bg-white text-stone-900 border border-[#E8E4DC] shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive
                        ? 'bg-[#2C6E49]/10 text-[#2C6E49]'
                        : 'bg-stone-200/60 text-stone-500'
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
