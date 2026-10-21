import React, { useState } from 'react';
import { Heart, Coffee, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ENCOURAGEMENT_NOTES } from '../data/architecturalTerms';

interface EncouragementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EncouragementModal: React.FC<EncouragementModalProps> = ({ isOpen, onClose }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  if (!isOpen) return null;

  const handleNextLoveNote = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#f59e0b', '#38bdf8'],
    });
    setQuoteIndex((prev) => (prev + 1) % ENCOURAGEMENT_NOTES.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white m-0">Nekol's Studio Fuel & Encouragement</h3>
                <p className="text-[11px] text-rose-300/80 m-0">From your #1 biggest fan & future architect's hype person 💖</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 text-sm rounded-lg hover:bg-slate-850 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Love Note Card */}
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl mb-4 relative shadow-inner">
            <p className="text-sm text-rose-100 font-medium leading-relaxed italic m-0">
              "{ENCOURAGEMENT_NOTES[quoteIndex]}"
            </p>
          </div>

          {/* Arki Studio Survival Tips */}
          <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3.5 mb-5 space-y-2 text-xs text-slate-300">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5" />
              <span>Studio Plate Crunch Reminders:</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Save your DWG / RVT file (Ctrl+S)!</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Drink a glass of cold water 💧</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Rest your eyes for 60 seconds 👀</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>You are going to ace this defense! 🏆</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handleNextLoveNote}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Send Another Sparkle ✨</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium cursor-pointer"
            >
              Back to Drafting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
