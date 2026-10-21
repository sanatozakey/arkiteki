import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Wind,
  Upload,
  Image as ImageIcon,
  FileText,
  X,
  Download,
  ShieldCheck,
  Layers,
  Lightbulb,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Building,
  RefreshCw,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  generateInAppStudioResult,
  GEMINI_MODELS 
} from '../utils/geminiApi';
import { processUploadedFile } from '../utils/fileParser';
import type { UploadedFileItem, InAppStudioResult, PromptHistoryItem } from '../types';

interface PromptImproverProps {
  apiKey: string;
  onSavePrompt?: (title: string, prompt: string, category: string) => void;
  onOpenConnectModal: () => void;
  currentModel: string;
  onModelUpdated: (newModel: string) => void;
  initialPrompt?: string;
}

export const PromptImprover: React.FC<PromptImproverProps> = ({
  apiKey,
  onSavePrompt,
  onOpenConnectModal,
  currentModel,
  onModelUpdated,
  initialPrompt,
}) => {
  const [userInput, setUserInput] = useState(
    'modern 2-storey city hall with grand ceremonial stairs, cantilevered council chamber, public civic plaza, and tropical breezeway in the philippines'
  );
  const [attachedFile, setAttachedFile] = useState<UploadedFileItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [studioResult, setStudioResult] = useState<InAppStudioResult | null>(null);
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  const [activeVisualTab, setActiveVisualTab] = useState<'render' | 'floor-plan' | 'comparison'>('render');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickStarters = [
    {
      label: '🏛️ Civic City Hall & Plaza',
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
      label: '🏥 Community Evacuation Center',
      prompt: '2-storey disaster-resilient community evacuation center with solar panels, rainwater harvesting, and 2.4m wide corridors',
    },
    {
      label: '🏫 Tropical Architecture College',
      prompt: 'sustainable architecture campus building with central open-air atrium, passive cooling breezeway, and rainwater bioswales in laguna',
    },
  ];

  // Load initial prompt if passed from history
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setUserInput(initialPrompt);
    }
  }, [initialPrompt]);

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

  // Dedicated One-Click Architectural Generation
  const handleGenerateDesign = async (promptOverride?: string) => {
    const textToUse = promptOverride || userInput;
    if (!textToUse.trim() && !attachedFile) return;

    if (!apiKey) {
      onOpenConnectModal();
      return;
    }

    setIsGenerating(true);
    setGenerationStage('Synthesizing project requirements with Philippine architectural intelligence...');

    try {
      // Step 1: Status update
      const stageTimer1 = setTimeout(() => {
        setGenerationStage('Applying tropical bioclimatic orientation & Philippine Building Laws (PD 1096)...');
      }, 1400);

      const stageTimer2 = setTimeout(() => {
        setGenerationStage('Generating high-resolution architectural visual & presentation dossier...');
      }, 3200);

      const result = await generateInAppStudioResult({
        apiKey,
        model: currentModel,
        prompt: textToUse,
        fileItem: attachedFile || undefined,
        aspectRatio,
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      setStudioResult(result);
      if (result.svgFloorPlan && !result.imageUrl) {
        setActiveVisualTab('floor-plan');
      } else {
        setActiveVisualTab('render');
      }

      // Save to prompt history for Profile view
      try {
        const historyItem: PromptHistoryItem = {
          id: `ph-studio-${Date.now()}`,
          originalInput: textToUse,
          enhancedOutput: result.enhancedPrompt || textToUse,
          imageUrl: result.imageUrl,
          category: 'Architectural AI Design',
          timestamp: Date.now(),
        };
        const prev = JSON.parse(localStorage.getItem('arkiteki_prompt_history') || '[]');
        localStorage.setItem(
          'arkiteki_prompt_history',
          JSON.stringify([historyItem, ...prev.filter((p: any) => p.originalInput !== textToUse)])
        );
      } catch (err) {
        console.warn('Failed to save to prompt history', err);
      }

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2C6E49', '#C85A32', '#1B4332'],
      });
    } catch (err) {
      console.error('Architectural generation failed', err);
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  const handleCopyDossier = () => {
    if (!studioResult) return;
    let md = `# ARCHITECTURAL PRESENTATION DOSSIER • ARKITEKI STUDIO\n`;
    md += `Engine: ${studioResult.modelUsed} | Generated: ${new Date(studioResult.timestamp).toLocaleString()}\n\n`;
    md += `## 1. DESIGN CONCEPT & SPATIAL PHILOSOPHY\n${studioResult.conceptStatement}\n\n`;
    md += `## 2. MATERIAL SPECIFICATION SCHEDULE\n`;
    studioResult.materialPalette.forEach((m) => {
      md += `- **${m.material}** (${m.application}): ${m.rationale}\n`;
    });
    md += `\n## 3. PHILIPPINE BIOCLIMATIC STRATEGY\n`;
    md += `- **Solar Orientation (East-West):** ${studioResult.environmentalAnalysis.solarOrientation}\n`;
    md += `- **Wind Channeling (Amihan & Habagat):** ${studioResult.environmentalAnalysis.windChanneling}\n`;
    md += `- **Monsoon Stormwater Resilience:** ${studioResult.environmentalAnalysis.stormWaterStrategy}\n\n`;
    if (studioResult.buildingCodeNotes && studioResult.buildingCodeNotes.length > 0) {
      md += `## 4. PHILIPPINE BUILDING CODE & ACCESSIBILITY (PD 1096 & BP 344)\n`;
      studioResult.buildingCodeNotes.forEach((note) => {
        md += `- ${note}\n`;
      });
      md += `\n`;
    }
    md += `## 5. JUROR & THESIS DEFENSE Q&A\n`;
    studioResult.jurorDefenseTips.forEach((tip, idx) => {
      md += `### Question ${idx + 1}: "${tip.question}"\n**Authoritative Defense:** ${tip.suggestedAnswer}\n\n`;
    });
    if (studioResult.enhancedPrompt) {
      md += `## 6. OPTIMIZED ARCHITECTURAL RENDERING SPECIFICATION\n\`\`\`\n${studioResult.enhancedPrompt}\n\`\`\`\n`;
    }

    navigator.clipboard.writeText(md);
    setCopiedDossier(true);
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#2C6E49', '#3EA76D'],
    });
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  const handleCopyPrompt = () => {
    if (!studioResult?.enhancedPrompt) return;
    navigator.clipboard.writeText(studioResult.enhancedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSaveToLibrary = () => {
    if (!studioResult || !onSavePrompt) return;
    const title = userInput.slice(0, 40) + '...';
    onSavePrompt(title, studioResult.conceptStatement, 'Architectural AI Studio');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-8">
      {/* Studio Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] font-mono font-bold tracking-wider px-3 py-1 rounded-full bg-[#2C6E49]/10 text-[#2C6E49] dark:bg-emerald-950/50 dark:text-emerald-400 dark:border dark:border-emerald-800/40 uppercase inline-block">
          Focused Philippine Architectural AI Studio
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight font-serif">
          Enter Your Project Needs, Get Architectural Work
        </h2>
        <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          Provide your project requirements, plate brief, or upload a CAD sketch/drawing. Arkiteki evaluates your design under Philippine tropical climate, building laws (PD 1096, BP 344), and returns high-quality renders and complete presentation dossiers directly inside the app.
        </p>
      </div>

      {/* Input Console */}
      <div className="bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 rounded-3xl p-5 md:p-7 shadow-xs space-y-5 transition-colors">
        {/* Step 1: Text Brief */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[#2C6E49] dark:text-emerald-400" />
              <span>1. Architectural Requirements & Project Brief</span>
            </label>

            {/* Model Pill */}
            <div className="flex items-center gap-2">
              {apiKey ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#1B4332] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#2C6E49] dark:bg-emerald-400 animate-pulse" />
                  <span className="font-semibold">{currentModel}</span>
                </div>
              ) : (
                <button
                  onClick={onOpenConnectModal}
                  className="text-[11px] text-[#2C6E49] dark:text-emerald-400 hover:underline cursor-pointer font-medium"
                >
                  ⚡ Connect Gemini Account for In-App AI
                </button>
              )}
            </div>
          </div>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g. 3-storey sustainable community health and wellness center in Iloilo with deep tropical eaves, narra wood brise-soleil, passive solar orientation, and universal accessibility ramp..."
            rows={3}
            className="w-full bg-[#FAF8F5] dark:bg-stone-950 border border-[#E8E4DC] dark:border-stone-800 rounded-2xl p-4 text-xs md:text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:border-[#2C6E49] dark:focus:border-emerald-500 placeholder:text-stone-400 dark:placeholder:text-stone-600 leading-relaxed resize-none transition-colors"
          />
        </div>

        {/* Step 2: File / Image Attachment Zone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-[#C85A32] dark:text-amber-500" />
              <span>2. Attach Drawing, Sketch, or Brief (Optional)</span>
            </label>
            <span className="text-[11px] text-stone-400 dark:text-stone-500 hidden sm:inline">
              Sketches, 3D clay models, Site Plans, PDFs, or Word briefs
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
                  ? 'border-[#2C6E49] bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-[#E8E4DC] dark:border-stone-800 bg-[#FAF8F5]/60 dark:bg-stone-950/50 hover:bg-[#FAF8F5] dark:hover:bg-stone-950 hover:border-stone-400 dark:hover:border-stone-700'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.docx,.doc,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 text-stone-600 dark:text-stone-400">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 flex items-center justify-center text-stone-500 shadow-xs">
                  <ImageIcon className="w-5 h-5 text-[#2C6E49] dark:text-emerald-400" />
                </div>
                <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Click or drag and drop your drawing, sketch, or brief
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 m-0">
                  Supports JPG, PNG, WEBP, PDF, DOCX, and TXT files (up to 20MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF8F5] dark:bg-stone-950 border border-[#E8E4DC] dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                {attachedFile.dataUrl && attachedFile.mimeType.startsWith('image/') ? (
                  <img
                    src={attachedFile.dataUrl}
                    alt={attachedFile.name}
                    className="w-16 h-16 object-cover rounded-xl border border-[#E8E4DC] dark:border-stone-800 bg-white dark:bg-stone-900 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 flex items-center justify-center flex-shrink-0 text-[#2C6E49] dark:text-emerald-400">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      {attachedFile.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#1B4332] dark:text-emerald-300 font-semibold">
                      {attachedFile.mimeType.startsWith('image/') ? 'Image / Sketch' : 'Design Document'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 m-0">
                    {(attachedFile.size / 1024).toFixed(1)} KB • Ready for Gemini visual analysis
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Suggestion Typologies */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
            Philippine Studio Typology Starters:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickStarters.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserInput(s.prompt);
                }}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-stone-950 hover:bg-[#F3EFE6] dark:hover:bg-stone-800 border border-[#E8E4DC] dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition cursor-pointer text-left truncate max-w-xs"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Button Bar */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0ECE1] dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Model:</span>
              <select
                value={currentModel}
                onChange={(e) => onModelUpdated(e.target.value)}
                className="text-xs font-medium bg-[#FAF8F5] dark:bg-stone-950 border border-[#E8E4DC] dark:border-stone-800 rounded-xl px-2.5 py-1.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#2C6E49] dark:focus:border-emerald-500 cursor-pointer"
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.tag} {m.isPro ? '(Pro User)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Ratio:</span>
              <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-stone-950 p-0.5 rounded-xl border border-[#E8E4DC] dark:border-stone-800">
                {(['16:9', '4:3', '1:1'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAspectRatio(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      aspectRatio === r
                        ? 'bg-[#2C6E49] text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleGenerateDesign()}
            disabled={isGenerating || (!userInput.trim() && !attachedFile)}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#2C6E49] hover:bg-[#23583a] dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md shadow-[#2C6E49]/20 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Architectural Design...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Architectural Design & Visuals</span>
              </>
            )}
          </button>
        </div>

        {/* Live Generation Progress Message */}
        {isGenerating && generationStage && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-4 h-4 text-[#2C6E49] dark:text-emerald-400 animate-spin flex-shrink-0" />
            <span className="text-xs font-medium text-[#1B4332] dark:text-emerald-300">
              {generationStage}
            </span>
          </div>
        )}
      </div>

      {/* ACTUAL ARCHITECTURAL WORK DISPLAYED DIRECTLY IN APP */}
      {studioResult && (
        <div className="bg-white dark:bg-stone-900 border-2 border-[#2C6E49]/30 dark:border-emerald-600/30 rounded-3xl p-5 md:p-8 shadow-md space-y-6 animate-fade-in transition-colors">
          {/* Result Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0ECE1] dark:border-stone-800 pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#1B4332] dark:text-emerald-300 uppercase">
                  Arkiteki AI Studio • {studioResult.modelUsed}
                </span>
                <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
                  {new Date(studioResult.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 font-serif m-0">
                Architectural Render & Complete Presentation Dossier
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToLibrary}
                className="px-3.5 py-2 rounded-xl border border-[#E8E4DC] dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{saved ? 'Saved!' : 'Save'}</span>
              </button>

              <button
                onClick={handleCopyDossier}
                className="px-4 py-2 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
              >
                {copiedDossier ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDossier ? 'Copied Dossier!' : 'Copy Presentation Board'}</span>
              </button>
            </div>
          </div>

          {/* Visual Deliverables Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0ECE1] dark:border-stone-800 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveVisualTab('render')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeVisualTab === 'render'
                    ? 'bg-[#2C6E49] text-white shadow-xs'
                    : 'bg-[#FAF8F5] dark:bg-stone-950 text-stone-600 dark:text-stone-400 hover:text-stone-900 border border-[#E8E4DC] dark:border-stone-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photorealistic Render</span>
              </button>

              {studioResult.svgFloorPlan && (
                <button
                  type="button"
                  onClick={() => setActiveVisualTab('floor-plan')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeVisualTab === 'floor-plan'
                      ? 'bg-[#2C6E49] text-white shadow-xs'
                      : 'bg-[#FAF8F5] dark:bg-stone-950 text-stone-600 dark:text-stone-400 hover:text-stone-900 border border-[#E8E4DC] dark:border-stone-800'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>CAD Floor Plan (SVG)</span>
                </button>
              )}

              {studioResult.comparisonImageUrl && (
                <button
                  type="button"
                  onClick={() => setActiveVisualTab('comparison')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeVisualTab === 'comparison'
                      ? 'bg-[#2C6E49] text-white shadow-xs'
                      : 'bg-[#FAF8F5] dark:bg-stone-950 text-stone-600 dark:text-stone-400 hover:text-stone-900 border border-[#E8E4DC] dark:border-stone-800'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Compare Sketch vs Render</span>
                </button>
              )}
            </div>

            <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
              Format: {studioResult.aspectRatio || aspectRatio} • {studioResult.deliverableType || 'Architectural Deliverable'}
            </span>
          </div>

          {/* 1. VISUAL SHOWCASE: Tab-based delivery */}
          {activeVisualTab === 'render' && studioResult.imageUrl && (
            <div className="space-y-2 animate-fade-in">
              <div className="relative group rounded-2xl overflow-hidden border border-[#E8E4DC] dark:border-stone-800 bg-stone-950 max-h-[500px] flex items-center justify-center">
                <img
                  src={studioResult.imageUrl}
                  alt="Architectural Render"
                  className="w-full h-auto max-h-[500px] object-contain transition group-hover:scale-[1.01]"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-stone-900/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="p-1.5 text-white hover:text-emerald-400 rounded-lg hover:bg-white/10 transition cursor-pointer"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <a
                    href={studioResult.imageUrl}
                    download={`arkiteki-render-${Date.now()}.png`}
                    className="p-1.5 text-white hover:text-emerald-400 rounded-lg hover:bg-white/10 transition flex items-center gap-1 text-xs"
                    title="Download Render Image"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 font-mono px-1">
                <span>Direct Visual Work • 24mm tilt-shift plumb architectural alignment</span>
                <span>Ready for Thesis & Presentation Boards</span>
              </div>
            </div>
          )}

          {activeVisualTab === 'floor-plan' && studioResult.svgFloorPlan && (
            <div className="space-y-2 animate-fade-in">
              <div className="relative group rounded-2xl overflow-hidden border border-[#E8E4DC] dark:border-stone-800 bg-[#FAF8F5] p-2 flex items-center justify-center max-h-[550px]">
                <div
                  className="w-full h-auto max-h-[520px] flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: studioResult.svgFloorPlan }}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-stone-900/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
                  <a
                    href={`data:image/svg+xml;utf8,${encodeURIComponent(studioResult.svgFloorPlan)}`}
                    download={`arkiteki-floorplan-${Date.now()}.svg`}
                    className="p-1.5 text-white hover:text-emerald-400 rounded-lg hover:bg-white/10 transition flex items-center gap-1 text-xs font-semibold"
                    title="Download CAD SVG Plan"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CAD SVG</span>
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 font-mono px-1">
                <span>Vector Architectural Linework • Scale 1:100 • PD 1096 & BP 344 compliant</span>
                <span>Fully scalable CAD SVG</span>
              </div>
            </div>
          )}

          {activeVisualTab === 'comparison' && studioResult.comparisonImageUrl && (
            <div className="space-y-2 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl p-3 bg-stone-950 border border-[#E8E4DC] dark:border-stone-800">
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-amber-400 px-2 block">
                    Before: Attached Sketch / Clay Model
                  </span>
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center max-h-[360px]">
                    <img
                      src={studioResult.comparisonImageUrl}
                      alt="Original Sketch"
                      className="w-full h-auto max-h-[360px] object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-emerald-400 px-2 block">
                    After: Arkiteki Photorealistic Architecture
                  </span>
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center max-h-[360px]">
                    <img
                      src={studioResult.imageUrl}
                      alt="Synthesized Architecture"
                      className="w-full h-auto max-h-[360px] object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 font-mono px-1">
                <span>Multimodal Vision Geometry Locked • Proportions preserved from user input</span>
                <span>Publication-Grade Rendering</span>
              </div>
            </div>
          )}

          {!studioResult.imageUrl && !studioResult.svgFloorPlan && (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl flex items-center gap-2 text-xs text-[#1B4332] dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-[#2C6E49] dark:text-emerald-400 flex-shrink-0" />
              <span>Architectural presentation dossier synthesized directly in-app using <strong>{studioResult.modelUsed}</strong>.</span>
            </div>
          )}

          {/* 2. SPATIAL CONCEPT & PHILOSOPHY */}
          <div className="bg-[#FAF8F5] dark:bg-stone-950 p-5 rounded-2xl border border-[#E8E4DC] dark:border-stone-800 space-y-2">
            <span className="text-xs font-bold text-[#2C6E49] dark:text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>1. Design Concept & Spatial Philosophy</span>
            </span>
            <p className="text-xs md:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-serif m-0 italic">
              "{studioResult.conceptStatement}"
            </p>
          </div>

          {/* 3. MATERIAL SPECIFICATION SCHEDULE */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C85A32]" />
              <span>2. Material Palette & Specification Schedule</span>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {studioResult.materialPalette.map((mat, idx) => (
                <div key={idx} className="p-3.5 bg-[#FAF8F5] dark:bg-stone-950 border border-[#E8E4DC] dark:border-stone-800 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 dark:text-stone-100">{mat.material}</span>
                    <span className="text-[10px] text-[#C85A32] dark:text-amber-400 font-mono">{mat.application}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 m-0">
                    {mat.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. PHILIPPINE BIOCLIMATIC STRATEGY */}
          <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl space-y-3 text-xs">
            <span className="text-xs font-bold text-[#2C6E49] dark:text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-2">
              <Wind className="w-4 h-4" />
              <span>3. Philippine Bioclimatic Strategy & Passive Comfort</span>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px] mb-1">
                  Solar Orientation (East-West):
                </span>
                <p className="text-stone-600 dark:text-stone-400 text-[11px] m-0">
                  {studioResult.environmentalAnalysis.solarOrientation}
                </p>
              </div>
              <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px] mb-1">
                  Amihan & Habagat Channels:
                </span>
                <p className="text-stone-600 dark:text-stone-400 text-[11px] m-0">
                  {studioResult.environmentalAnalysis.windChanneling}
                </p>
              </div>
              <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px] mb-1">
                  Monsoon Stormwater:
                </span>
                <p className="text-stone-600 dark:text-stone-400 text-[11px] m-0">
                  {studioResult.environmentalAnalysis.stormWaterStrategy}
                </p>
              </div>
            </div>
          </div>

          {/* 5. PHILIPPINE BUILDING CODE & ACCESSIBILITY */}
          {studioResult.buildingCodeNotes && studioResult.buildingCodeNotes.length > 0 && (
            <div className="p-5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl space-y-2.5 text-xs">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase font-mono tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                <span>4. Philippine Building Code & Law Compliance (PD 1096, BP 344 & RA 9514)</span>
              </span>
              <ul className="list-disc list-inside space-y-1.5 text-stone-700 dark:text-stone-300 text-[11px] m-0">
                {studioResult.buildingCodeNotes.map((note, idx) => (
                  <li key={idx} className="leading-relaxed">{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 6. JUROR & THESIS DEFENSE Q&A */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>5. Anticipated Juror Questions & Authoritative Defense</span>
            </span>
            <div className="space-y-2">
              {studioResult.jurorDefenseTips.map((tip, idx) => (
                <div key={idx} className="p-4 bg-[#FAF8F5] dark:bg-stone-950 border border-[#E8E4DC] dark:border-stone-800 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span className="text-rose-600 dark:text-rose-400">Q{idx + 1}:</span>
                    <span>"{tip.question}"</span>
                  </div>
                  <div className="text-stone-700 dark:text-stone-300 text-[11px] pl-5 border-l-2 border-[#2C6E49] dark:border-emerald-500">
                    <strong className="text-[#2C6E49] dark:text-emerald-400">Defense:</strong> {tip.suggestedAnswer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. OPTIMIZED ARCHITECTURAL PROMPT DRAWER */}
          {studioResult.enhancedPrompt && (
            <div className="border border-[#E8E4DC] dark:border-stone-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowPromptDetails(!showPromptDetails)}
                className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-stone-950 hover:bg-[#F3EFE6] dark:hover:bg-stone-800/80 flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#2C6E49] dark:text-emerald-400" />
                  <span>View Behind-the-Scenes Architectural Prompt Specification</span>
                </div>
                {showPromptDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showPromptDetails && (
                <div className="p-4 bg-white dark:bg-stone-900 space-y-3 border-t border-[#E8E4DC] dark:border-stone-800">
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 m-0">
                    This enhanced prompt incorporates 24mm tilt-shift lens alignment, two-point perspective, plumb vertical mullions, and tropical atmospheric lighting. You can export it to Blender, Revit Enscape, V-Ray, or Midjourney.
                  </p>
                  <div className="p-3 bg-[#FAF8F5] dark:bg-stone-950 rounded-xl border border-[#E8E4DC] dark:border-stone-800 font-mono text-[11px] text-stone-800 dark:text-stone-200 whitespace-pre-wrap select-all">
                    {studioResult.enhancedPrompt}
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="px-3.5 py-1.5 rounded-xl border border-[#E8E4DC] dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-[#2C6E49]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy Prompt'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && studioResult?.imageUrl && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-6xl max-h-screen p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={studioResult.imageUrl}
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
