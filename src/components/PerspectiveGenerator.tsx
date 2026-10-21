import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Camera, 
  Sun, 
  CheckCircle2, 
  Palette
} from 'lucide-react';
import type { PerspectiveOptions } from '../types';
import { 
  PERSPECTIVE_CAMERAS, 
  LIGHTING_ATMOSPHERES, 
  ARCHITECTURAL_MATERIALS, 
  ARCHITECTURAL_STYLES,
  SDP_TYPOLOGIES 
} from '../data/architecturalTerms';
import { buildPerspectivePrompt } from '../utils/promptBuilder';
import { PromptOutputCard } from './PromptOutputCard';

interface PerspectiveGeneratorProps {
  onSavePrompt: (title: string, prompt: string, category: string) => void;
}

export const PerspectiveGenerator: React.FC<PerspectiveGeneratorProps> = ({ onSavePrompt }) => {
  const [options, setOptions] = useState<PerspectiveOptions>({
    mode: 'concept-render',
    projectTypology: SDP_TYPOLOGIES[0],
    architecturalStyle: ARCHITECTURAL_STYLES[0],
    cameraView: PERSPECTIVE_CAMERAS[0].name,
    verticalsCorrection: true,
    timeOfDay: LIGHTING_ATMOSPHERES[0].name,
    weatherAtmosphere: 'Clear serene sky with soft ambient atmosphere',
    facadeMaterials: [ARCHITECTURAL_MATERIALS[0], ARCHITECTURAL_MATERIALS[1], ARCHITECTURAL_MATERIALS[3]],
    landscapeContext: 'Lush tropical landscaping with mature canopy trees, reflecting water pool, and clean concrete entry plaza',
    entourageScale: 'Architectural scale human figures walking naturally with subtle motion blur, dressed in minimalist neutral tones',
    renderingEngineLook: 'V-Ray 6 & Corona Renderer physically accurate global illumination',
    cameraLens: '24mm architectural tilt-shift lens (Hasselblad H6D-100c format)',
    customDetails: '',
    aspectRatio: '16:9 Landscape',
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  useEffect(() => {
    setGeneratedPrompt(buildPerspectivePrompt(options));
  }, [options]);

  const toggleMaterial = (mat: string) => {
    setOptions(prev => {
      const exists = prev.facadeMaterials.includes(mat);
      return {
        ...prev,
        facadeMaterials: exists
          ? prev.facadeMaterials.filter(m => m !== mat)
          : [...prev.facadeMaterials, mat],
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Module Title Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight m-0">
              Perspectives Pro & Architectural Visualizer
            </h2>
            <p className="text-sm text-slate-400 m-0">
              Create breathtaking 8K perspectives with strict tilt-shift vertical correction, authentic physical materiality, and cinematic lighting.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Camera View & Framing */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span>1. Camera Projection & Viewpoint</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Strict Verticals (Shift Lens):</span>
                <input
                  type="checkbox"
                  checked={options.verticalsCorrection}
                  onChange={(e) => setOptions(prev => ({ ...prev, verticalsCorrection: e.target.checked }))}
                  className="rounded border-slate-700 text-sky-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PERSPECTIVE_CAMERAS.map((cam) => {
                const isSelected = options.cameraView === cam.name;
                return (
                  <button
                    key={cam.name}
                    type="button"
                    onClick={() => setOptions(prev => ({ ...prev, cameraView: cam.name }))}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/25 ring-1 ring-sky-500'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{cam.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-sky-300 font-mono">
                          {cam.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {cam.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typology & Architectural Style */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              2. Typology & Architectural Style
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Project Typology</label>
                <select
                  value={options.projectTypology}
                  onChange={(e) => setOptions(prev => ({ ...prev, projectTypology: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {SDP_TYPOLOGIES.map((typ) => (
                    <option key={typ} value={typ} className="bg-slate-950 text-white">
                      {typ}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Architectural Style / Language</label>
                <select
                  value={options.architecturalStyle}
                  onChange={(e) => setOptions(prev => ({ ...prev, architecturalStyle: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {ARCHITECTURAL_STYLES.map((style) => (
                    <option key={style} value={style} className="bg-slate-950 text-white">
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Facade Materials & Finishes (Multi-select) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Material Palette & Textures</span>
              </label>
              <span className="text-xs text-amber-400 font-mono">
                {options.facadeMaterials.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ARCHITECTURAL_MATERIALS.map((mat) => {
                const checked = options.facadeMaterials.includes(mat);
                return (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => toggleMaterial(mat)}
                    className={`px-3 py-2 rounded-lg text-left text-xs border transition cursor-pointer flex items-center gap-2.5 ${
                      checked
                        ? 'border-amber-500/50 bg-amber-950/20 text-amber-200'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                      checked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700'
                    }`}>
                      {checked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs truncate">{mat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time of Day & Lighting Ambiance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>4. Lighting Atmosphere & Solar Setup</span>
            </label>

            <div className="space-y-2">
              {LIGHTING_ATMOSPHERES.map((atm) => {
                const isSelected = options.timeOfDay === atm.name;
                return (
                  <button
                    key={atm.name}
                    type="button"
                    onClick={() => setOptions(prev => ({ ...prev, timeOfDay: atm.name }))}
                    className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-700'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block mb-0.5">{atm.name}</span>
                      <p className="text-[11px] text-slate-400 leading-normal">{atm.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Entourage, Context & Specific Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              5. Scale Entourage & Output Framing
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Target Presentation Aspect Ratio</label>
                <select
                  value={options.aspectRatio}
                  onChange={(e) => setOptions(prev => ({ ...prev, aspectRatio: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="16:9 Landscape">16:9 Landscape (Hero Banner)</option>
                  <option value="4:3 Traditional">4:3 Standard Plate</option>
                  <option value="3:4 Portrait">3:4 Portrait (Vertical Board)</option>
                  <option value="1:1 Square">1:1 Detail Vignette</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Render Engine Benchmark</label>
                <select
                  value={options.renderingEngineLook}
                  onChange={(e) => setOptions(prev => ({ ...prev, renderingEngineLook: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="V-Ray 6 & Corona Renderer physically accurate global illumination">V-Ray 6 / Corona Physically Based</option>
                  <option value="ArchDaily Architectural Photography Shot on Hasselblad H6D">ArchDaily Editorial Photography</option>
                  <option value="Lumion 2024 Raytracing & Atmospheric Bloom">Lumion Raytracing Ambiance</option>
                  <option value="Enscape Real-Time Soft Shadows & Ambient Occlusion">Enscape Clean Clay / Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Custom Architectural Details (e.g., cantilevers, infinity pool, green roof, skylights)
              </label>
              <textarea
                value={options.customDetails}
                onChange={(e) => setOptions(prev => ({ ...prev, customDetails: e.target.value }))}
                placeholder="e.g. 6-meter cantilevered terrace shading the glass pavilion below; suspended sculptural steel spiral staircase visible through curtain wall."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500 placeholder:text-slate-600 resize-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Prompt Output (5 cols) */}
        <div className="lg:col-span-5">
          <PromptOutputCard
            prompt={generatedPrompt}
            category="Perspective"
            title={`${options.projectTypology} - ${options.cameraView}`}
            onSavePrompt={onSavePrompt}
          />
        </div>
      </div>
    </div>
  );
};
