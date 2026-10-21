import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Bookmark, Download, ShieldCheck, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculatePromptScore } from '../utils/promptBuilder';

interface PromptOutputCardProps {
  prompt: string;
  category: string;
  title: string;
  onSavePrompt?: (title: string, prompt: string, category: string) => void;
  isLineworkMode?: boolean;
}

export const PromptOutputCard: React.FC<PromptOutputCardProps> = ({
  prompt,
  category,
  title,
  onSavePrompt,
  isLineworkMode = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const { score, feedback } = calculatePromptScore(prompt);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#10b981', '#38bdf8', '#fbbf24'],
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    if (onSavePrompt) {
      onSavePrompt(title, prompt, category);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-prompt.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl sticky top-28 flex flex-col">
      {/* Top Banner */}
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
            Generated Studio Prompt
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {category.toUpperCase()}
          </span>
        </div>

        {/* Quality Score Indicator */}
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-300">
            Quality: {score}/100 HD
          </span>
        </div>
      </div>

      {/* Guide Note for Gemini */}
      <div className="bg-gradient-to-r from-sky-950/40 to-slate-900 px-5 py-3 border-b border-slate-800/80 text-xs text-sky-200/90 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          {isLineworkMode ? (
            <span>
              <strong>Revit/CAD Underlay Mode:</strong> Export your 2D plan or 3D view as PNG/PDF, open{' '}
              <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="underline font-semibold text-white">Gemini</a>, attach the image first, then paste this prompt.
            </span>
          ) : (
            <span>
              <strong>Gemini Pro Tip:</strong> Copy this prompt directly into{' '}
              <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="underline font-semibold text-white">Gemini</a>. The built-in negative guardrails and camera parameters guarantee crisp, distortion-free outputs.
            </span>
          )}
        </div>
      </div>

      {/* Code / Text Container */}
      <div className="p-5 flex-1 max-h-[460px] overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950/50 leading-relaxed whitespace-pre-wrap select-all selection:bg-emerald-500/30 selection:text-white">
        {prompt}
      </div>

      {/* Score Breakdown Pills */}
      <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
        {feedback.map((item, idx) => (
          <span
            key={idx}
            className={`px-2 py-0.5 rounded ${
              item.startsWith('✓')
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
            }`}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Save to your personal library"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
            <span>{saved ? 'Saved!' : 'Save'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Download prompt as .txt"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>.txt</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://gemini.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-medium border border-sky-500/30 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>Open Gemini</span>
          </a>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer transform active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Copy Prompt for Gemini</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
