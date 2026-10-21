import React, { useState } from 'react';
import { Layers, Copy, Check, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRESET_PROMPTS } from '../data/presets';
import type { PromptPreset } from '../types';

interface PresetGalleryProps {
  onSelectPresetPrompt?: (preset: PromptPreset) => void;
}

export const PresetGallery: React.FC<PresetGalleryProps> = () => {
  const [selectedPreset, setSelectedPreset] = useState<PromptPreset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredPresets = PRESET_PROMPTS.filter((p) => {
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  const handleCopy = (preset: PromptPreset) => {
    navigator.clipboard.writeText(preset.prompt);
    setCopiedId(preset.id);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#c084fc', '#38bdf8', '#10b981'],
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight m-0">
              One-Click Studio Plate Presets
            </h2>
            <p className="text-sm text-slate-400 m-0">
              Instant battle-tested prompt recipes designed specifically for architecture school submission boards.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'all', label: 'All Studio Plates' },
          { id: 'sdp', label: 'Site Plans (SDP)' },
          { id: 'perspective', label: 'Perspectives' },
          { id: 'revit', label: 'Revit & Diagrams' },
          { id: 'interior', label: 'Interior Volumes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterCategory === tab.id
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                  {preset.badge}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Ratio: {preset.recommendedRatio}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                {preset.title}
              </h3>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                {preset.subtitle}
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs text-slate-300 mb-4 line-clamp-3 font-mono leading-relaxed">
                {preset.prompt}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {preset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedPreset(preset)}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Read Full Details
              </button>

              <button
                onClick={() => handleCopy(preset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                {copiedId === preset.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy for Gemini</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preset Modal Detail */}
      {selectedPreset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase font-bold">
                  {selectedPreset.badge}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedPreset.title}</h3>
                <p className="text-xs text-slate-400">{selectedPreset.useCase}</p>
              </div>
              <button
                onClick={() => setSelectedPreset(null)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {selectedPreset.prompt}
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://gemini.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>Open Gemini in new tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 text-xs cursor-pointer hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={() => handleCopy(selectedPreset)}
                  className="px-4 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
