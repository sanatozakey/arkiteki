import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  CheckCircle2, 
  Wind,
  Upload,
  Image as ImageIcon,
  FileText,
  X,
  Eye,
  Download,
  ShieldCheck,
  Layers,
  Lightbulb,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  enhanceArchitecturalPromptWithGemini, 
  generateInAppStudioResult,
  GEMINI_MODELS 
} from '../utils/geminiApi';
import { processUploadedFile } from '../utils/fileParser';
import type { PromptCritiqueResult, UploadedFileItem, InAppStudioResult, PromptHistoryItem } from '../types';

interface PromptImproverProps {
  apiKey: string;
  onSavePrompt?: (title: string, prompt: string, category: string) => void;
  onOpenConnectModal: () => void;
  currentModel: string;
  onModelUpdated: (newModel: string) => void;
  initialPrompt?: string;
}

type TargetPlatform = 'gemini' | 'midjourney' | 'dalle' | 'stablediffusion';

export const PromptImprover: React.FC<PromptImproverProps> = ({
  apiKey,
  onSavePrompt,
  onOpenConnectModal,
  currentModel,
  onModelUpdated,
  initialPrompt,
}) => {
  const [userInput, setUserInput] = useState(
    'modern city hall with stairs, grand public plaza, and tropical breezeway in the philippines'
  );
  const [attachedFile, setAttachedFile] = useState<UploadedFileItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingDirect, setIsGeneratingDirect] = useState(false);
  const [critiqueResult, setCritiqueResult] = useState<PromptCritiqueResult | null>(null);
  const [inAppResult, setInAppResult] = useState<InAppStudioResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [platform, setPlatform] = useState<TargetPlatform>('gemini');
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickStarters = [
    {
      label: '🏛️ City Hall / Civic Center',
      prompt: 'modern city hall with stairs, council hall, grand public plaza, and tropical breezeway in the philippines',
    },
    {
      label: '🏬 Commercial Mixed-Use',
      prompt: 'site development plan for a 2-storey commercial mall with parking, pedestrian arcade, and delivery dock in cebu',
    },
    {
      label: '🌴 Bahay na Bato Modern',
      prompt: 'tropical modern house with board-formed concrete, narra wood louvers, and deep roof overhangs during golden hour',
    },
    {
      label: '🏥 Community Disaster Center',
      prompt: '2-storey disaster-resilient community evacuation center with solar panels, rainwater harvesting, and 2.4m wide corridors',
    },
    {
      label: '📐 Architectural Tilt-Shift Shot',
      prompt: 'exterior eye-level two-point perspective shot with 24mm architectural tilt-shift lens and strictly plumb vertical mullions',
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const item = await processUploadedFile(file);
      setAttachedFile(item);
    } catch (err) {
      console.error('File parsing error', err);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      const item = await processUploadedFile(file);
      setAttachedFile(item);
    } catch (err) {
      console.error('Drop error', err);
    }
  };

  // Load initial prompt if passed from ProfileView history
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setUserInput(initialPrompt);
    }
  }, [initialPrompt]);

  // 1. Analyze & Enhance prompt
  const handleEnhance = async (promptToUse?: string) => {
    const text = promptToUse || userInput;
    if (!text.trim() && !attachedFile) return;

    setIsAnalyzing(true);
    setInAppResult(null);
    try {
      const result = await enhanceArchitecturalPromptWithGemini(
        text, 
        apiKey, 
        attachedFile || undefined,
        currentModel
      );
      setCritiqueResult(result);

      // Save to prompt history for Profile view
      try {
        const historyItem: PromptHistoryItem = {
          id: `ph-${Date.now()}`,
          originalInput: text,
          enhancedOutput: result.enhancedPrompt,
          category: 'Prompt Enhancement',
          timestamp: Date.now(),
        };
        const prev = JSON.parse(localStorage.getItem('arkiteki_prompt_history') || '[]');
        localStorage.setItem(
          'arkiteki_prompt_history',
          JSON.stringify([historyItem, ...prev.filter((p: any) => p.originalInput !== text)])
        );
      } catch (err) {
        console.warn('Failed to save to prompt history', err);
      }

      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#2C6E49', '#C85A32', '#3B7A57'],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Direct In-App Generation (Render image & Studio Presentation Board without leaving the app!)
  const handleDirectGenerate = async () => {
    if (!apiKey) {
      onOpenConnectModal();
      return;
    }

    const promptText = critiqueResult?.enhancedPrompt || userInput;
    if (!promptText.trim()) return;

    setIsGeneratingDirect(true);
    try {
      const result = await generateInAppStudioResult({
        apiKey,
        model: currentModel,
        prompt: promptText,
        fileItem: attachedFile || undefined,
      });

      setInAppResult(result);

      // Save to prompt history with rendered image
      try {
        const historyItem: PromptHistoryItem = {
          id: `ph-render-${Date.now()}`,
          originalInput: userInput,
          enhancedOutput: promptText,
          imageUrl: result.imageUrl,
          category: 'In-App 3D Render',
          timestamp: Date.now(),
        };
        const prev = JSON.parse(localStorage.getItem('arkiteki_prompt_history') || '[]');
        localStorage.setItem('arkiteki_prompt_history', JSON.stringify([historyItem, ...prev]));
      } catch (err) {
        console.warn('Failed to save render to prompt history', err);
      }

      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#2C6E49', '#C85A32', '#1B4332'],
      });
    } catch (err) {
      console.error('Direct in-app generation failed', err);
    } finally {
      setIsGeneratingDirect(false);
    }
  };

  // Format prompt for target platform
  const getFormattedPrompt = (rawPrompt: string, target: TargetPlatform): string => {
    switch (target) {
      case 'midjourney':
        return `${rawPrompt}\n\n--ar 16:9 --style raw --v 6.1 --no warped columns, curved vertical lines, perspective distortion, fisheye, distorted geometry`;
      case 'dalle':
        return `A professional architectural photograph of: ${userInput.trim() || 'an architectural building'}. Taken with an architectural 24mm tilt-shift lens from human eye-level (1.6m). All vertical columns and mullions are strictly straight and plumb. Warm late afternoon golden hour lighting, authentic board-formed concrete, tropical Philippine landscape. Editorial publication quality for ArchDaily.`;
      case 'stablediffusion':
        return `POSITIVE PROMPT:\n(masterpiece:1.2), (photorealistic:1.3), architectural rendering of ${userInput.trim() || 'tropical modern building'}, 24mm tilt shift lens, strictly plumb vertical columns, two-point perspective, late afternoon golden sunlight, V-Ray 6 render, 8k resolution, ArchDaily editorial\n\nNEGATIVE PROMPT:\n(warped columns:1.4), (converging vertical lines:1.3), (keystoning:1.3), deformed geometry, blurry textures, oversaturated, amateur photography`;
      case 'gemini':
      default:
        return rawPrompt;
    }
  };

  const currentDisplayPrompt = critiqueResult ? getFormattedPrompt(critiqueResult.enhancedPrompt, platform) : '';

  const handleCopy = () => {
    if (!currentDisplayPrompt) return;
    navigator.clipboard.writeText(currentDisplayPrompt);
    setCopied(true);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#2C6E49', '#3B7A57'],
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!currentDisplayPrompt || !onSavePrompt) return;
    onSavePrompt('Enhanced Studio Prompt', currentDisplayPrompt, 'Prompt Enhancer');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopyDossier = () => {
    if (!inAppResult) return;
    let md = `# ARCHITECTURAL PRESENTATION DOSSIER • ARKITEKI STUDIO\n`;
    md += `Model Engine: ${inAppResult.modelUsed}\n\n`;
    md += `## 1. DESIGN CONCEPT & SPATIAL PHILOSOPHY\n${inAppResult.conceptStatement}\n\n`;
    md += `## 2. MATERIAL SPECIFICATION SCHEDULE\n`;
    inAppResult.materialPalette.forEach((m) => {
      md += `- **${m.material}** (${m.application}): ${m.rationale}\n`;
    });
    md += `\n## 3. PHILIPPINE BIOCLIMATIC STRATEGY\n`;
    md += `- **Solar Orientation:** ${inAppResult.environmentalAnalysis.solarOrientation}\n`;
    md += `- **Wind Channeling:** ${inAppResult.environmentalAnalysis.windChanneling}\n`;
    md += `- **Stormwater Resilience:** ${inAppResult.environmentalAnalysis.stormWaterStrategy}\n\n`;
    md += `## 4. JUROR DEFENSE Q&A\n`;
    inAppResult.jurorDefenseTips.forEach((tip, idx) => {
      md += `### Question ${idx + 1}: ${tip.question}\n**Suggested Defense:** ${tip.suggestedAnswer}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedDossier(true);
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#2C6E49', '#C85A32'],
    });
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] font-mono font-bold tracking-wider px-3 py-1 rounded-full bg-[#2C6E49]/10 text-[#2C6E49] uppercase inline-block">
          Philippine Architecture Studio Prompt Improver
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
          Type Your Idea or Upload a Sketch, Render In-App
        </h2>
        <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
          Type your concept or upload sketches, 3D clay screenshots, site plans, and briefs. Arkiteki evaluates your design for Philippine climate (Amihan/Habagat), building laws, and renders results directly inside the web app.
        </p>
      </div>

      {/* Input Box & File Upload Card */}
      <div className="bg-white border border-[#E8E4DC] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#2C6E49]" />
            <span>1. What do you want to design or render?</span>
          </label>

          {/* Model indicator & Switcher */}
          <div className="flex items-center gap-2">
            {apiKey ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-[#1B4332] border border-emerald-200 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#2C6E49]" />
                <span className="font-semibold">{currentModel}</span>
              </div>
            ) : (
              <button
                onClick={onOpenConnectModal}
                className="text-[11px] text-stone-500 hover:text-[#2C6E49] underline cursor-pointer"
              >
                Connect Gemini for In-App AI Rendering
              </button>
            )}
          </div>
        </div>

        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g. Modern city hall with a grand ceremonial stairs, cantilevered council chamber, public plaza and tropical breezeway..."
          rows={3}
          className="w-full bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xl p-4 text-xs md:text-sm text-stone-800 focus:outline-none focus:border-[#2C6E49] placeholder:text-stone-400 leading-relaxed resize-none"
        />

        {/* 2. File / Image Attachment Zone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wide flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>2. Attach Reference Image or Design Brief (Optional)</span>
            </label>
            <span className="text-[11px] text-stone-400">
              Sketches, 3D Clay renders, Site Plans, PDFs, or Word briefs
            </span>
          </div>

          {!attachedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#2C6E49] bg-emerald-50/50'
                  : 'border-[#E8E4DC] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] hover:border-stone-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.docx,.doc,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 text-stone-600">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E4DC] flex items-center justify-center text-stone-500 shadow-xs">
                  <ImageIcon className="w-5 h-5 text-[#2C6E49]" />
                </div>
                <div className="text-xs font-semibold text-stone-800">
                  Click or drag and drop your drawing, sketch, or brief
                </div>
                <p className="text-[11px] text-stone-400 m-0">
                  Supports JPG, PNG, WEBP, PDF, DOCX, and TXT files (up to 20MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                {attachedFile.dataUrl && attachedFile.mimeType.startsWith('image/') ? (
                  <img
                    src={attachedFile.dataUrl}
                    alt={attachedFile.name}
                    className="w-16 h-16 object-cover rounded-xl border border-[#E8E4DC] bg-white flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E8E4DC] flex items-center justify-center flex-shrink-0 text-[#2C6E49]">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      {attachedFile.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-[#1B4332] font-semibold">
                      {attachedFile.mimeType.startsWith('image/') ? 'Image / Sketch' : 'Design Document'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 m-0">
                    {(attachedFile.size / 1024).toFixed(1)} KB • Ready for Gemini visual analysis
                  </p>
                  {attachedFile.textPreview && !attachedFile.mimeType.startsWith('image/') && (
                    <p className="text-[10px] text-stone-400 italic truncate max-w-md m-0">
                      Preview: {attachedFile.textPreview}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-200/50 transition cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] text-stone-400 font-medium">Philippine Studio Typology Starters:</span>
          <div className="flex flex-wrap gap-2">
            {quickStarters.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserInput(s.prompt);
                  handleEnhance(s.prompt);
                }}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE6] border border-[#E8E4DC] text-stone-600 hover:text-stone-900 transition cursor-pointer text-left truncate max-w-xs"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Improve Prompt & Direct In-App Generation */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0ECE1]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Model:</span>
            <select
              value={currentModel}
              onChange={(e) => onModelUpdated(e.target.value)}
              className="text-xs font-medium bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-[#2C6E49] cursor-pointer"
            >
              {GEMINI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.tag} {m.isPro ? '(Pro User)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleEnhance()}
              disabled={isAnalyzing || (!userInput.trim() && !attachedFile)}
              className="px-5 py-2.5 rounded-2xl bg-white border border-[#E8E4DC] hover:bg-stone-50 disabled:opacity-40 text-stone-700 font-semibold text-xs transition cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#2C6E49]" />
              <span>
                {isAnalyzing ? 'Critiquing Prompt...' : '1. Critique & Upgrade Prompt'}
              </span>
            </button>

            <button
              onClick={handleDirectGenerate}
              disabled={isGeneratingDirect || (!userInput.trim() && !attachedFile)}
              className="px-6 py-2.5 rounded-2xl bg-[#2C6E49] hover:bg-[#23583a] disabled:opacity-40 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-[#2C6E49]/20 flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>
                {isGeneratingDirect
                  ? `Rendering In-App with ${currentModel}...`
                  : '2. Render & Generate In-App'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* DIRECT IN-APP GENERATED RESULT (Images & Architectural Dossier) */}
      {inAppResult && (
        <div className="bg-white border-2 border-[#2C6E49]/30 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0ECE1] pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1B4332] uppercase">
                  Direct In-App Generation • {inAppResult.modelUsed}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {new Date(inAppResult.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-stone-900 m-0">
                Architectural Studio Render & Presentation Dossier
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDossier}
                className="px-4 py-2 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                {copiedDossier ? <Check className="w-3.5 h-3.5 text-[#2C6E49]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDossier ? 'Dossier Copied!' : 'Copy Presentation Board'}</span>
              </button>
            </div>
          </div>

          {/* Generated Image Showcase */}
          {inAppResult.imageUrl ? (
            <div className="space-y-2">
              <div className="relative group rounded-2xl overflow-hidden border border-[#E8E4DC] bg-stone-950 max-h-[460px] flex items-center justify-center">
                <img
                  src={inAppResult.imageUrl}
                  alt="Architectural Render"
                  className="w-full h-auto max-h-[460px] object-contain transition group-hover:scale-[1.01]"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-stone-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="p-1.5 text-white hover:text-emerald-400 rounded-lg hover:bg-white/10 transition cursor-pointer"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <a
                    href={inAppResult.imageUrl}
                    download={`arkiteki-render-${Date.now()}.png`}
                    className="p-1.5 text-white hover:text-emerald-400 rounded-lg hover:bg-white/10 transition flex items-center gap-1 text-xs"
                    title="Download Render Image"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </a>
                </div>
              </div>
              <span className="text-[11px] text-stone-400 font-mono block text-right">
                Generated via Gemini Image Engine • 24mm tilt-shift architectural alignment
              </span>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl flex items-center justify-between text-xs text-[#1B4332]">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2C6E49]" />
                <span>Presentation dossier synthesized directly in-app using <strong>{inAppResult.modelUsed}</strong>.</span>
              </span>
            </div>
          )}

          {/* 1. Design Concept Statement */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DC] space-y-2">
            <span className="text-xs font-bold text-[#2C6E49] uppercase font-mono tracking-wider block">
              1. Spatial Concept & Architectural Philosophy:
            </span>
            <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-serif m-0 italic">
              "{inAppResult.conceptStatement}"
            </p>
          </div>

          {/* 2. Material Specification Schedule */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase font-mono tracking-wider block">
              2. Material Palette & Specification Schedule:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inAppResult.materialPalette.map((mat, idx) => (
                <div key={idx} className="p-3.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{mat.material}</span>
                    <span className="text-[10px] text-[#C85A32] font-mono">{mat.application}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 m-0">
                    {mat.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Philippine Bioclimatic Strategy */}
          <div className="p-5 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl space-y-3 text-xs">
            <span className="text-xs font-bold text-[#2C6E49] uppercase font-mono tracking-wider flex items-center gap-2">
              <Wind className="w-4 h-4" />
              <span>3. Philippine Bioclimatic Strategy & Passive Comfort:</span>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <span className="font-bold text-stone-800 block text-[11px] mb-1">Solar Path (East-West):</span>
                <p className="text-stone-600 text-[11px] m-0">{inAppResult.environmentalAnalysis.solarOrientation}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <span className="font-bold text-stone-800 block text-[11px] mb-1">Amihan & Habagat Channels:</span>
                <p className="text-stone-600 text-[11px] m-0">{inAppResult.environmentalAnalysis.windChanneling}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <span className="font-bold text-stone-800 block text-[11px] mb-1">Monsoon Stormwater:</span>
                <p className="text-stone-600 text-[11px] m-0">{inAppResult.environmentalAnalysis.stormWaterStrategy}</p>
              </div>
            </div>
          </div>

          {/* 4. Juror Defense Tips */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase font-mono tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>4. Plate Defense & Juror Anticipated Q&A:</span>
            </span>
            <div className="space-y-2">
              {inAppResult.jurorDefenseTips.map((tip, idx) => (
                <div key={idx} className="p-4 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <span className="text-red-600">Q{idx + 1}:</span>
                    <span>"{tip.question}"</span>
                  </div>
                  <div className="text-stone-700 text-[11px] pl-5 border-l-2 border-[#2C6E49]">
                    <strong className="text-[#2C6E49]">Defense Strategy:</strong> {tip.suggestedAnswer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analysis & Enhanced Output Display */}
      {critiqueResult && (
        <div className="space-y-6">
          {/* Visual Analysis Badge if an image/file was attached */}
          {critiqueResult.detectedVisualFeatures && critiqueResult.detectedVisualFeatures.length > 0 && (
            <div className="bg-white border border-[#E8E4DC] rounded-3xl p-5 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#2C6E49]" />
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                  Architectural Features Detected from Upload:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {critiqueResult.detectedVisualFeatures.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-emerald-50 text-[#1B4332] border border-emerald-200/80 text-xs font-medium"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Philippine Architecture Critique Grid */}
          <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2C6E49]" />
                <span>Philippine Architectural Critique & Upgrades Applied</span>
              </h3>
              <span className="text-xs font-mono font-bold text-[#2C6E49] bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                Quality: {critiqueResult.qualityScore}/100 HD
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {critiqueResult.critiquePoints.map((point, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-[#E8E4DC] space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase block">
                    {point.category}
                  </span>
                  <p className="text-stone-500 text-[11px] m-0">
                    <strong className="text-stone-700">Issue:</strong> {point.issue}
                  </p>
                  <p className="text-stone-700 text-[11px] font-medium m-0 pt-1 border-t border-[#F0ECE1]">
                    <strong className="text-[#2C6E49]">Upgrade:</strong> {point.solution}
                  </p>
                </div>
              ))}
            </div>

            {/* Philippine Context Highlights */}
            {critiqueResult.philippineContextNotes.length > 0 && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl text-xs text-[#2C6E49] space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-xs">
                  <Wind className="w-3.5 h-3.5" />
                  <span>Philippine Climate & Code Considerations Injected:</span>
                </span>
                <ul className="list-disc list-inside text-[11px] text-stone-700 space-y-0.5 m-0 pt-0.5">
                  {critiqueResult.philippineContextNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Enhanced Prompt Card with Platform Switcher */}
          <div className="bg-white border border-[#E8E4DC] rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#E8E4DC] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#2C6E49] uppercase block">
                  Studio Presentation Ready
                </span>
                <h4 className="text-sm font-bold text-stone-900 m-0">
                  Enhanced Architectural Prompt
                </h4>
              </div>

              {/* Platform Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#E8E4DC]">
                <button
                  onClick={() => setPlatform('gemini')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    platform === 'gemini'
                      ? 'bg-[#2C6E49] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Gemini / 8K
                </button>
                <button
                  onClick={() => setPlatform('midjourney')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    platform === 'midjourney'
                      ? 'bg-[#2C6E49] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Midjourney v6.1
                </button>
                <button
                  onClick={() => setPlatform('dalle')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    platform === 'dalle'
                      ? 'bg-[#2C6E49] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  DALL-E 3
                </button>
                <button
                  onClick={() => setPlatform('stablediffusion')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    platform === 'stablediffusion'
                      ? 'bg-[#2C6E49] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Stable Diffusion
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 text-xs font-medium cursor-pointer hover:bg-stone-50"
                >
                  {saved ? 'Saved!' : 'Save'}
                </button>

                <button
                  onClick={handleCopy}
                  className="px-5 py-1.5 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Prompt'}</span>
                </button>
              </div>
            </div>

            {/* Prompt Text Block */}
            <div className="p-6 font-mono text-xs text-stone-800 bg-white leading-relaxed whitespace-pre-wrap select-all">
              {currentDisplayPrompt}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && inAppResult?.imageUrl && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-6xl max-h-screen p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={inAppResult.imageUrl}
              alt="Fullscreen Render"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain mx-auto shadow-2xl border border-white/10"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
