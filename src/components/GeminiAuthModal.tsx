import React, { useState } from 'react';
import { Sparkles, Key, Check, ExternalLink, ShieldCheck, AlertCircle, X, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { callGeminiApi, setStoredGeminiKey, setStoredGeminiModel, GEMINI_MODELS } from '../utils/geminiApi';

interface GeminiAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onKeyUpdated: (newKey: string) => void;
  currentModel: string;
  onModelUpdated: (newModel: string) => void;
}

export const GeminiAuthModal: React.FC<GeminiAuthModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onKeyUpdated,
  currentModel,
  onModelUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(currentKey);
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setStoredGeminiKey('');
      onKeyUpdated('');
      setTestResult(null);
      onClose();
      return;
    }

    setTesting(true);
    setTestResult(null);
    setErrorMessage('');

    try {
      // Test lightweight call to Gemini with chosen model
      await callGeminiApi({
        apiKey: trimmed,
        model: selectedModel,
        prompt: 'Say: Gemini Connection Verified for Arkiteki Studio.',
      });

      setStoredGeminiKey(trimmed);
      onKeyUpdated(trimmed);
      setStoredGeminiModel(selectedModel);
      onModelUpdated(selectedModel);
      setTestResult('success');
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#2C6E49', '#3B7A57', '#C85A32'],
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setTestResult('error');
      setErrorMessage(err.message || 'Invalid Gemini API Key or model error.');
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    setApiKeyInput('');
    setStoredGeminiKey('');
    onKeyUpdated('');
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#E8E4DC] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-stone-800 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2C6E49]/10 text-[#2C6E49] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 m-0">
                Connect Google Gemini Account
              </h3>
              <p className="text-[11px] text-stone-500 m-0">
                Direct in-app rendering, architectural evaluation & auto-quizzes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explain how to get free key */}
        <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E4DC] text-xs space-y-2 text-stone-600 leading-relaxed">
          <p className="m-0 font-medium text-stone-800">
            <strong>How to connect:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-600 m-0">
            <li>Log in to your Google Account on Google AI Studio.</li>
            <li>Click <strong>"Create API Key"</strong> (free for personal use).</li>
            <li>Paste your key below and choose your preferred model tier.</li>
          </ol>
          <div className="pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[#2C6E49] hover:underline font-semibold inline-flex items-center gap-1 text-[11px]"
            >
              <span>Open Google AI Studio Key Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 block">
            Google Gemini API Key
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#2C6E49] font-mono"
            />
          </div>
          <p className="text-[10px] text-stone-400 flex items-center gap-1 m-0 pt-0.5">
            <ShieldCheck className="w-3 h-3 text-[#2C6E49]" />
            <span>Stored in your browser's private localStorage. Never sent to any third party.</span>
          </p>
        </div>

        {/* Model Selection (Pro vs Flash vs Next-Gen) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#2C6E49]" />
              <span>Choose Gemini Model Tier:</span>
            </label>
            <span className="text-[10px] text-stone-400 font-mono">
              Switch anytime
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GEMINI_MODELS.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'border-[#2C6E49] bg-emerald-50/70 text-[#1B4332]'
                      : 'border-[#E8E4DC] bg-[#FAF8F5] text-stone-700 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">{m.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold whitespace-nowrap ${
                        m.isPro
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-emerald-100 text-[#1B4332]'
                      }`}
                    >
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 m-0 leading-snug line-clamp-2">
                    {m.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status result */}
        {testResult === 'success' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Connected successfully with {selectedModel}!</span>
          </div>
        )}

        {testResult === 'error' && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F0ECE1]">
          {currentKey ? (
            <button
              onClick={handleDisconnect}
              className="text-xs text-rose-600 hover:underline cursor-pointer"
            >
              Disconnect Key
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-medium hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndTest}
              disabled={testing || !apiKeyInput.trim()}
              className="px-5 py-2 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] disabled:opacity-40 text-white font-semibold text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {testing ? <span>Connecting & Verifying...</span> : <span>Save & Connect</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
