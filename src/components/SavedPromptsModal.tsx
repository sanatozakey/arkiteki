import React, { useState } from 'react';
import { Bookmark, Copy, Check, Trash2, ExternalLink, Search, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SavedPromptItem } from '../types';

interface SavedPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPrompts: SavedPromptItem[];
  onDeletePrompt: (id: string) => void;
}

export const SavedPromptsModal: React.FC<SavedPromptsModalProps> = ({
  isOpen,
  onClose,
  savedPrompts,
  onDeletePrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = savedPrompts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#2C6E49', '#C85A32'],
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8E4DC] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-stone-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2C6E49]/10 text-[#2C6E49] flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-[#2C6E49]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 m-0">Saved Studio & Review Library</h3>
              <p className="text-[11px] text-stone-500 m-0">{savedPrompts.length} items stored in browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved prompts by keywords..."
            className="w-full bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl pl-10 pr-4 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#2C6E49]"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              {savedPrompts.length === 0
                ? 'No saved items yet. Click "Save" on any enhanced prompt to store it here.'
                : 'No items match your search query.'}
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xl p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#E8E4DC] text-[#2C6E49] font-bold">
                      {item.category.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 mb-1.5">{item.title}</h4>
                  <div className="bg-white p-3 rounded-xl border border-[#E8E4DC] text-xs font-mono text-stone-700 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {item.prompt}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8E4DC] text-xs">
                  <button
                    onClick={() => onDeletePrompt(item.id)}
                    className="text-stone-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href="https://gemini.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2C6E49] hover:underline flex items-center gap-1 text-xs font-medium"
                    >
                      <span>Gemini</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleCopy(item.id, item.prompt)}
                      className="px-3 py-1.5 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#F0ECE1] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 text-xs text-stone-600 hover:bg-stone-50 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
