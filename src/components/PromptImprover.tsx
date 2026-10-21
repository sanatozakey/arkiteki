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
  Compass,
  Camera,
  Palette,
  AlertCircle,
  Plus,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  generateInAppStudioResult,
  generateInAppImage,
  generateAdditionalArchitecturalView,
  REASONING_MODELS,
  IMAGE_GENERATION_MODELS,
  ARCHITECTURAL_VISUAL_STYLES,
  ARCHITECTURAL_CAMERA_VIEWS,
  CAMERA_VIEW_KEYS,
  VISUAL_STYLE_KEYS,
  getStoredImageModel,
  setStoredImageModel,
  getStoredVisualStyle,
  setStoredVisualStyle,
  getStoredCameraView,
  setStoredCameraView,
  getStoredResolution,
  setStoredResolution,
} from '../utils/geminiApi';
import { playCompletionChime } from '../utils/soundNotification';
import { processUploadedFile } from '../utils/fileParser';
import type { 
  UploadedFileItem, 
  InAppStudioResult, 
  PromptHistoryItem,
  ImageGenerationModelId,
  ArchitecturalVisualStyle,
  ArchitecturalCameraView,
  ImageResolution
} from '../types';

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
  const [isRetryingImage, setIsRetryingImage] = useState(false);
  const [imageStatus, setImageStatus] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle');
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

  // Advanced Architectural Visualization Engine States
  const [selectedImageModel, setSelectedImageModel] = useState<ImageGenerationModelId>(() => getStoredImageModel());
  const [selectedVisualStyle, setSelectedVisualStyle] = useState<ArchitecturalVisualStyle>(() => getStoredVisualStyle());
  const [selectedCameraView, setSelectedCameraView] = useState<ArchitecturalCameraView>(() => getStoredCameraView());
  const [selectedResolution, setSelectedResolution] = useState<ImageResolution>(() => getStoredResolution());
  const [selectedActiveViewIndex, setSelectedActiveViewIndex] = useState<number>(0);
  const [isRenderingAdditionalView, setIsRenderingAdditionalView] = useState<boolean>(false);
  const [additionalViewError, setAdditionalViewError] = useState<string>('');
  const [showEngineSettings, setShowEngineSettings] = useState<boolean>(true);

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
    setImageStatus('generating');
    setSelectedActiveViewIndex(0);
    setAdditionalViewError('');
    setGenerationStage('Stage 1: Gemini Architectural Analysis — Extracting concept, massing, materials, and tropical orientation...');

    try {
      const stageTimer1 = setTimeout(() => {
        setGenerationStage(
          `Stage 2: Photorealistic Synthesis — Rendering with ${
            IMAGE_GENERATION_MODELS.find((m) => m.id === selectedImageModel)?.name || selectedImageModel
          } (${selectedResolution})...`
        );
      }, 2400);

      const result = await generateInAppStudioResult({
        apiKey,
        reasoningModel: currentModel,
        imageModel: selectedImageModel,
        prompt: textToUse,
        fileItem: attachedFile || undefined,
        aspectRatio,
        resolution: selectedResolution,
        visualStyle: selectedVisualStyle,
        viewType: selectedCameraView,
      });

      clearTimeout(stageTimer1);

      setStudioResult(result);
      if (result.imageUrl) {
        setImageStatus('completed');
      } else if (result.svgFloorPlan) {
        setImageStatus('completed');
      } else {
        setImageStatus('failed');
      }

      if (result.svgFloorPlan && !result.imageUrl) {
        setActiveVisualTab('floor-plan');
      } else {
        setActiveVisualTab('render');
      }

      // Play completion audio notification
      playCompletionChime();

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
    } catch (err: any) {
      console.error('Architectural generation failed', err);
      setImageStatus('failed');
      setStudioResult((prev) => (prev ? { ...prev, renderError: err?.message || String(err) } : null));
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  // Dedicated handler to retry/re-render photorealistic visual plate
  const handleRetryImageRender = async () => {
    if (!studioResult || !apiKey) return;
    setIsRetryingImage(true);
    setImageStatus('generating');
    try {
      const promptToRender = studioResult.photorealisticPrompt || studioResult.enhancedPrompt || userInput;
      const imgRes = await generateInAppImage({
        apiKey,
        prompt: promptToRender,
        imageModel: selectedImageModel,
        aspectRatio,
        resolution: selectedResolution,
        visualStyle: selectedVisualStyle,
        viewType: selectedCameraView,
        fileItem: attachedFile || undefined,
      });

      if (imgRes?.imageUrl) {
        setStudioResult((prev) =>
          prev
            ? {
                ...prev,
                imageUrl: imgRes.imageUrl!,
                imageSource: imgRes.source,
                imageModelUsed: selectedImageModel,
                renderError: undefined,
              }
            : null
        );
        setImageStatus('completed');
        setSelectedActiveViewIndex(0);
        playCompletionChime();
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2C6E49', '#C85A32', '#1B4332'],
        });
      } else {
        setStudioResult((prev) => (prev ? { ...prev, renderError: imgRes.error } : null));
        setImageStatus('failed');
      }
    } catch (err: any) {
      console.error('Retry render failed:', err);
      setStudioResult((prev) => (prev ? { ...prev, renderError: err?.message || String(err) } : null));
      setImageStatus('failed');
    } finally {
      setIsRetryingImage(false);
    }
  };

  // Dedicated handler to generate an additional perspective view of the same design
  const handleGenerateAdditionalView = async (targetView: ArchitecturalCameraView) => {
    if (!studioResult || !apiKey) return;
    if (!studioResult.architecturalSpec) return;

    setIsRenderingAdditionalView(true);
    setAdditionalViewError('');
    try {
      const newView = await generateAdditionalArchitecturalView({
        apiKey,
        imageModel: selectedImageModel,
        architecturalSpec: studioResult.architecturalSpec,
        targetView,
        visualStyle: selectedVisualStyle,
        aspectRatio,
        resolution: selectedResolution,
        fileItem: attachedFile || undefined,
      });

      setStudioResult((prev) => {
        if (!prev) return null;
        const currentViews = prev.additionalViews || [];
        const nextViews = [...currentViews.filter((v) => v.viewType !== targetView), newView];
        return {
          ...prev,
          additionalViews: nextViews,
        };
      });

      setTimeout(() => {
        setStudioResult((fresh) => {
          if (fresh?.additionalViews) {
            setSelectedActiveViewIndex(fresh.additionalViews.length);
          }
          return fresh;
        });
      }, 50);

      playCompletionChime();
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#2C6E49', '#FAF8F5'],
      });
    } catch (err: any) {
      console.error('Additional view generation failed:', err);
      setAdditionalViewError(err?.message || `Failed to render ${targetView}`);
    } finally {
      setIsRenderingAdditionalView(false);
    }
  };

  const handleDownloadActiveImage = (url: string, filenameLabel: string) => {
    const link = document.createElement('a');
    link.href = url;
    const cleanName = filenameLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `arkiteki-${cleanName}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Compute all available perspective views (Hero + Additional Perspectives)
  const allViews: Array<{
    id: string;
    viewType: ArchitecturalCameraView;
    imageUrl: string;
    imageModelUsed?: string;
    resolution?: ImageResolution;
    visualStyle?: ArchitecturalVisualStyle;
    timestamp: number;
    promptUsed?: string;
  }> = [];

  if (studioResult?.imageUrl) {
    allViews.push({
      id: 'hero-view',
      viewType: studioResult.viewType || selectedCameraView,
      imageUrl: studioResult.imageUrl,
      imageModelUsed: studioResult.imageModelUsed || selectedImageModel,
      resolution: studioResult.resolution || selectedResolution,
      visualStyle: studioResult.visualStyle || selectedVisualStyle,
      timestamp: studioResult.timestamp,
      promptUsed: studioResult.photorealisticPrompt || studioResult.enhancedPrompt,
    });
  }

  if (studioResult?.additionalViews && studioResult.additionalViews.length > 0) {
    studioResult.additionalViews.forEach((v) => {
      allViews.push({
        id: v.id,
        viewType: v.viewType,
        imageUrl: v.imageUrl,
        imageModelUsed: v.imageModelUsed,
        resolution: v.resolution,
        visualStyle: v.visualStyle,
        timestamp: v.timestamp,
        promptUsed: v.promptUsed,
      });
    });
  }

  const activeView = allViews[selectedActiveViewIndex] || allViews[0] || null;

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
                  Supports JPG, PNG, WEBP, PDF, DOCX, and TXT files (up to 200MB)
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

        {/* Studio Dual-Engine Configuration & Architectural Controls */}
        <div className="pt-4 border-t border-[#F0ECE1] dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowEngineSettings(!showEngineSettings)}
              className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200 hover:text-[#2C6E49] dark:hover:text-emerald-400 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#2C6E49] dark:text-emerald-400" />
              <span>Studio Dual-Engine & Camera Settings</span>
              {showEngineSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500 hidden sm:inline">
              Reasoning: {currentModel} • Image: {selectedImageModel} • {selectedResolution}
            </span>
          </div>

          {showEngineSettings && (
            <div className="bg-[#FAF8F5] dark:bg-stone-950 border border-[#E8E4DC] dark:border-stone-800 rounded-2xl p-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* 1. Reasoning Model */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Building className="w-3 h-3 text-[#2C6E49] dark:text-emerald-400" />
                    <span>Architectural Reasoning Model</span>
                  </label>
                  <select
                    value={currentModel}
                    onChange={(e) => onModelUpdated(e.target.value)}
                    className="w-full text-xs font-medium bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 rounded-xl px-2.5 py-2 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#2C6E49] dark:focus:border-emerald-500 cursor-pointer"
                  >
                    {REASONING_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.isPro ? '★' : ''} ({m.badge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Image Engine */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3 text-[#C85A32] dark:text-amber-500" />
                    <span>Photorealistic Image Engine</span>
                  </label>
                  <select
                    value={selectedImageModel}
                    onChange={(e) => {
                      const val = e.target.value as ImageGenerationModelId;
                      setSelectedImageModel(val);
                      setStoredImageModel(val);
                    }}
                    className="w-full text-xs font-medium bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 rounded-xl px-2.5 py-2 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#2C6E49] dark:focus:border-emerald-500 cursor-pointer"
                  >
                    {IMAGE_GENERATION_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.badge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Visual Style */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Palette className="w-3 h-3 text-[#2C6E49] dark:text-emerald-400" />
                    <span>Visual Style & Lighting</span>
                  </label>
                  <select
                    value={selectedVisualStyle}
                    onChange={(e) => {
                      const val = e.target.value as ArchitecturalVisualStyle;
                      setSelectedVisualStyle(val);
                      setStoredVisualStyle(val);
                    }}
                    className="w-full text-xs font-medium bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 rounded-xl px-2.5 py-2 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#2C6E49] dark:focus:border-emerald-500 cursor-pointer"
                  >
                    {VISUAL_STYLE_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {ARCHITECTURAL_VISUAL_STYLES[key]?.label || key}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Camera Perspective View */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Camera className="w-3 h-3 text-[#C85A32] dark:text-amber-500" />
                    <span>Initial Perspective View</span>
                  </label>
                  <select
                    value={selectedCameraView}
                    onChange={(e) => {
                      const val = e.target.value as ArchitecturalCameraView;
                      setSelectedCameraView(val);
                      setStoredCameraView(val);
                    }}
                    className="w-full text-xs font-medium bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 rounded-xl px-2.5 py-2 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#2C6E49] dark:focus:border-emerald-500 cursor-pointer"
                  >
                    {CAMERA_VIEW_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {ARCHITECTURAL_CAMERA_VIEWS[key]?.label || key}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Render Resolution */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Maximize2 className="w-3 h-3 text-[#2C6E49] dark:text-emerald-400" />
                    <span>Render Resolution</span>
                  </label>
                  <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-[#E8E4DC] dark:border-stone-800">
                    {(['1K', '2K', '4K'] as const).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => {
                          setSelectedResolution(res);
                          setStoredResolution(res);
                        }}
                        className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                          selectedResolution === res
                            ? 'bg-[#2C6E49] text-white shadow-xs'
                            : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Aspect Ratio */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-[#C85A32] dark:text-amber-500" />
                    <span>Aspect Ratio</span>
                  </label>
                  <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-[#E8E4DC] dark:border-stone-800">
                    {(['16:9', '4:3', '1:1'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setAspectRatio(r)}
                        className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
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
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2C6E49] dark:bg-emerald-400" />
              <span>Two-Stage Pipeline: Architectural Analysis → Multimodal Photorealistic Render</span>
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
          {activeVisualTab === 'render' && (
            <div className="space-y-4 animate-fade-in">
              {/* Multi-View Perspective Tabs & Gallery Strip */}
              {allViews.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FAF8F5] dark:bg-stone-950 p-2.5 rounded-2xl border border-[#E8E4DC] dark:border-stone-800">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase font-mono px-2">
                      Views:
                    </span>
                    {allViews.map((v, idx) => (
                      <button
                        key={v.id || idx}
                        type="button"
                        onClick={() => setSelectedActiveViewIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          selectedActiveViewIndex === idx
                            ? 'bg-[#2C6E49] text-white shadow-xs'
                            : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-stone-900 border border-[#E8E4DC] dark:border-stone-800'
                        }`}
                      >
                        <Camera className="w-3 h-3" />
                        <span>{ARCHITECTURAL_CAMERA_VIEWS[v.viewType]?.label || v.viewType}</span>
                        {idx === 0 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-white">
                            Hero
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Add Perspective View Buttons */}
                  {studioResult.architecturalSpec && (
                    <div className="flex flex-wrap items-center gap-1">
                      {CAMERA_VIEW_KEYS.filter(
                        (target) => !allViews.some((av) => av.viewType === target)
                      ).map((target) => (
                        <button
                          key={target}
                          type="button"
                          onClick={() => handleGenerateAdditionalView(target)}
                          disabled={isRenderingAdditionalView}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-[#1B4332] dark:text-emerald-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                          title={`Render ${ARCHITECTURAL_CAMERA_VIEWS[target]?.label || target} of this exact building`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{ARCHITECTURAL_CAMERA_VIEWS[target]?.label || target}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* In-Progress Additional View Notification */}
              {isRenderingAdditionalView && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-[#1B4332] dark:text-emerald-300 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2C6E49] dark:text-emerald-400" />
                  <span>
                    Rendering additional perspective view with {selectedImageModel} ({selectedResolution})...
                  </span>
                </div>
              )}

              {/* Additional View Error Notice */}
              {additionalViewError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{additionalViewError}</span>
                </div>
              )}

              {/* Primary Active Image Display */}
              {activeView ? (
                <div className="relative group rounded-2xl overflow-hidden border border-[#E8E4DC] dark:border-stone-800 bg-stone-950 max-h-[560px] flex items-center justify-center">
                  <img
                    src={activeView.imageUrl}
                    alt={activeView.viewType}
                    className="w-full h-auto max-h-[560px] object-contain transition group-hover:scale-[1.005]"
                  />

                  {/* Top-Left View & Model Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white border border-white/10 uppercase tracking-wide">
                      {ARCHITECTURAL_CAMERA_VIEWS[activeView.viewType]?.label || activeView.viewType}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-[#2C6E49]/85 backdrop-blur-md text-white border border-white/10">
                      {activeView.imageModelUsed || selectedImageModel}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-stone-300 border border-white/10">
                      {activeView.resolution || studioResult.resolution || selectedResolution}
                    </span>
                  </div>

                  {/* Bottom-Right Controls */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-stone-900/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
                    <button
                      onClick={() => setLightboxOpen(true)}
                      className="p-1.5 text-white hover:text-emerald-400 rounded-lg hover:bg-white/10 transition cursor-pointer"
                      title="Fullscreen Lightbox"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadActiveImage(activeView.imageUrl, activeView.viewType)}
                      className="p-1.5 text-white hover:text-emerald-400 rounded-lg hover:bg-white/10 transition flex items-center gap-1 text-xs cursor-pointer"
                      title="Download Render Image"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </button>
                  </div>
                </div>
              ) : isRetryingImage ? (
                <div className="h-64 rounded-2xl border-2 border-dashed border-[#2C6E49]/40 bg-emerald-50/30 dark:bg-emerald-950/20 flex flex-col items-center justify-center gap-2.5 p-6 text-center animate-pulse">
                  <RefreshCw className="w-6 h-6 text-[#2C6E49] dark:text-emerald-400 animate-spin" />
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Synthesizing photorealistic architectural perspective with {selectedImageModel} ({selectedResolution})...
                  </span>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100 m-0">
                      Photorealistic Render Engine Notice
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-400 m-0 leading-relaxed">
                      {studioResult.renderError || imageStatus === 'failed'
                        ? 'The image engine did not return a raster render. Arkiteki does NOT produce cartoon SVGs or fake vector drawings.'
                        : 'The architectural presentation dossier is prepared. Click below to render the photorealistic visual plate.'}
                    </p>
                    {studioResult.renderError && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800/60 font-mono text-[11px] text-amber-900 dark:text-amber-200 text-left overflow-x-auto max-h-24">
                        {studioResult.renderError}
                      </div>
                    )}
                  </div>

                  {/* Engine Selection for Retry */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <select
                      value={selectedImageModel}
                      onChange={(e) => {
                        const val = e.target.value as ImageGenerationModelId;
                        setSelectedImageModel(val);
                        setStoredImageModel(val);
                      }}
                      className="text-xs font-medium bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-800 rounded-xl px-3 py-2 text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
                    >
                      {IMAGE_GENERATION_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.badge})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleRetryImageRender}
                      className="px-5 py-2.5 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Retry Photorealistic Render</span>
                    </button>
                  </div>
                </div>
              )}

              {activeView && (
                <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 font-mono px-1 gap-2">
                  <span>Direct Visual Work • 24mm tilt-shift plumb architectural alignment</span>
                  <span>Authentic Raster Render • Ready for Thesis & Juror Presentation</span>
                </div>
              )}
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
      {lightboxOpen && activeView?.imageUrl && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-6xl max-h-screen p-2 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between mb-3 text-white px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#2C6E49] text-white">
                  {ARCHITECTURAL_CAMERA_VIEWS[activeView.viewType]?.label || activeView.viewType}
                </span>
                <span className="text-xs text-stone-300 font-mono hidden sm:inline">
                  {activeView.imageModelUsed || selectedImageModel} • {activeView.resolution || selectedResolution}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadActiveImage(activeView.imageUrl, activeView.viewType)}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Download High-Res Render"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                  title="Close Lightbox"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <img
              src={activeView.imageUrl}
              alt={activeView.viewType}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain mx-auto shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
};
