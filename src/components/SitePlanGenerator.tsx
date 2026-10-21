import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Layers, 
  Trees, 
  Car, 
  Footprints, 
  Droplet, 
  CheckCircle2
} from 'lucide-react';
import type { SDPOptions } from '../types';
import { 
  SDP_TYPOLOGIES, 
  SDP_RENDER_STYLES, 
  SDP_CLIMATE_BIOMES, 
  SDP_VEHICULAR_ITEMS, 
  SDP_PEDESTRIAN_ITEMS, 
  SDP_VEGETATION_CHOICES,
  SDP_WATER_FEATURES 
} from '../data/architecturalTerms';
import { buildSDPPrompt } from '../utils/promptBuilder';
import { PromptOutputCard } from './PromptOutputCard';

interface SitePlanGeneratorProps {
  onSavePrompt: (title: string, prompt: string, category: string) => void;
}

export const SitePlanGenerator: React.FC<SitePlanGeneratorProps> = ({ onSavePrompt }) => {
  const [options, setOptions] = useState<SDPOptions>({
    mode: 'linework-render',
    projectTypology: SDP_TYPOLOGIES[0],
    renderStyle: SDP_RENDER_STYLES[0].name,
    climateBiome: SDP_CLIMATE_BIOMES[0],
    lotShape: 'Rectangular 4,500 sqm corner lot with two road frontages',
    scaleAndSize: '1:500 architectural presentation scale',
    includeContours: true,
    contourInterval: '1.0 meter intervals',
    includeVehicular: true,
    vehicularDetails: [SDP_VEHICULAR_ITEMS[0], SDP_VEHICULAR_ITEMS[1], SDP_VEHICULAR_ITEMS[2]],
    includePedestrian: true,
    pedestrianDetails: [SDP_PEDESTRIAN_ITEMS[0], SDP_PEDESTRIAN_ITEMS[1], SDP_PEDESTRIAN_ITEMS[2]],
    vegetationDensity: 'dense-lush',
    vegetationTypes: [SDP_VEGETATION_CHOICES[0], SDP_VEGETATION_CHOICES[1]],
    includeWaterFeatures: true,
    waterFeatureType: SDP_WATER_FEATURES[0],
    sunAndShadows: 'Soft 45-degree isometric drop shadows cast toward Northeast',
    includeNorthArrow: true,
    includeScaleBar: true,
    includePropertyLine: true,
    colorPalette: 'Muted architectural tones: charcoal roofs, warm beige paving, vibrant emerald landscaping',
    qualityLevel: '8K Presentation Board Masterplan',
    aspectRatio: '16:9 Landscape',
    customNotes: '',
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  useEffect(() => {
    setGeneratedPrompt(buildSDPPrompt(options));
  }, [options]);

  const toggleVehicular = (item: string) => {
    setOptions(prev => {
      const exists = prev.vehicularDetails.includes(item);
      return {
        ...prev,
        vehicularDetails: exists
          ? prev.vehicularDetails.filter(i => i !== item)
          : [...prev.vehicularDetails, item],
      };
    });
  };

  const togglePedestrian = (item: string) => {
    setOptions(prev => {
      const exists = prev.pedestrianDetails.includes(item);
      return {
        ...prev,
        pedestrianDetails: exists
          ? prev.pedestrianDetails.filter(i => i !== item)
          : [...prev.pedestrianDetails, item],
      };
    });
  };

  const toggleVegetation = (item: string) => {
    setOptions(prev => {
      const exists = prev.vegetationTypes.includes(item);
      return {
        ...prev,
        vegetationTypes: exists
          ? prev.vegetationTypes.filter(i => i !== item)
          : [...prev.vegetationTypes, item],
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Module Title Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight m-0">
              Site Development Plan (SDP) Master
            </h2>
            <p className="text-sm text-slate-400 m-0">
              Generate crisp, 90° orthographic site plans with accurate zoning, landscape entourage, and zero AI perspective distortion.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Mode Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
              1. Choose Your Workflow Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOptions(prev => ({ ...prev, mode: 'linework-render' }))}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  options.mode === 'linework-render'
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-500/5'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-white">Revit / CAD Linework Underlay</span>
                    {options.mode === 'linework-render' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Upload your exported CAD/Revit 2D plan to Gemini. Keeps building footprints and lot boundaries 100% strictly intact!
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 w-fit">
                  Multimodal / Img2Img
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOptions(prev => ({ ...prev, mode: 'concept-masterplan' }))}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  options.mode === 'concept-masterplan'
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-500/5'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-white">Conceptual Masterplan Ideation</span>
                    {options.mode === 'concept-masterplan' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Generate fresh site planning concepts, landscape zoning, and circulation schemes before drafting in CAD.
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 w-fit">
                  Pure Text Prompt
                </span>
              </button>
            </div>
          </div>

          {/* Graphic Style Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                2. Presentation Graphic Style
              </label>
              <span className="text-xs text-emerald-400 font-mono">Selected: {options.renderStyle}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SDP_RENDER_STYLES.map((style) => {
                const isSelected = options.renderStyle === style.name;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setOptions(prev => ({ ...prev, renderStyle: style.name }))}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/25 ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{style.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {style.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {style.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Typology & Site Scope */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              3. Project Typology & Site Context
            </label>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Project Typology</label>
              <select
                value={options.projectTypology}
                onChange={(e) => setOptions(prev => ({ ...prev, projectTypology: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {SDP_TYPOLOGIES.map((typ) => (
                  <option key={typ} value={typ} className="bg-slate-950 text-white">
                    {typ}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Climate & Landscape Biome</label>
                <select
                  value={options.climateBiome}
                  onChange={(e) => setOptions(prev => ({ ...prev, climateBiome: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {SDP_CLIMATE_BIOMES.map((biome) => (
                    <option key={biome} value={biome} className="bg-slate-950 text-white">
                      {biome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Lot Dimensions / Size Description</label>
                <input
                  type="text"
                  value={options.lotShape}
                  onChange={(e) => setOptions(prev => ({ ...prev, lotShape: e.target.value }))}
                  placeholder="e.g. 5,000 sqm trapezoidal corner lot with 20m setback"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Vehicular & Pedestrian Circulation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-emerald-400" />
                <span>4. Vehicular Circulation & Access</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeVehicular}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeVehicular: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {options.includeVehicular && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {SDP_VEHICULAR_ITEMS.map((item) => {
                  const checked = options.vehicularDetails.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleVehicular(item)}
                      className={`px-3 py-2 rounded-lg text-left text-xs border transition cursor-pointer flex items-center gap-2 ${
                        checked
                          ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                        checked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {checked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{item}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Footprints className="w-3.5 h-3.5 text-sky-400" />
                  <span>Pedestrian Realm & Plazas</span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includePedestrian}
                    onChange={(e) => setOptions(prev => ({ ...prev, includePedestrian: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {options.includePedestrian && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SDP_PEDESTRIAN_ITEMS.map((item) => {
                    const checked = options.pedestrianDetails.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => togglePedestrian(item)}
                        className={`px-3 py-2 rounded-lg text-left text-xs border transition cursor-pointer flex items-center gap-2 ${
                          checked
                            ? 'border-sky-500/50 bg-sky-950/20 text-sky-200'
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                          checked ? 'bg-sky-500 border-sky-500 text-slate-950' : 'border-slate-700'
                        }`}>
                          {checked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Landscape, Vegetation & Water */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Trees className="w-3.5 h-3.5 text-emerald-400" />
              <span>5. Landscape Canopy & Environmental Elements</span>
            </label>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Vegetation Density</span>
                <span className="text-xs font-mono text-emerald-400 capitalize">{options.vegetationDensity.replace('-', ' ')}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['sparse', 'balanced', 'dense-lush'] as const).map((density) => (
                  <button
                    key={density}
                    type="button"
                    onClick={() => setOptions(prev => ({ ...prev, vegetationDensity: density }))}
                    className={`py-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer capitalize ${
                      options.vegetationDensity === density
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {density.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">Canopy & Vegetation Types</label>
              <div className="space-y-1.5">
                {SDP_VEGETATION_CHOICES.map((choice) => {
                  const checked = options.vegetationTypes.includes(choice);
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => toggleVegetation(choice)}
                      className={`w-full px-3 py-2 rounded-lg text-left text-xs border transition cursor-pointer flex items-center gap-2.5 ${
                        checked
                          ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                        checked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {checked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{choice}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-sky-400" />
                    <span>Water Feature</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={options.includeWaterFeatures}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeWaterFeatures: e.target.checked }))}
                    className="rounded border-slate-700 text-sky-500 cursor-pointer"
                  />
                </div>
                {options.includeWaterFeatures && (
                  <select
                    value={options.waterFeatureType}
                    onChange={(e) => setOptions(prev => ({ ...prev, waterFeatureType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {SDP_WATER_FEATURES.map((wf) => (
                      <option key={wf} value={wf} className="bg-slate-950 text-white">
                        {wf}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Contour Elevation Lines</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={options.includeContours}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeContours: e.target.checked }))}
                    className="rounded border-slate-700 text-amber-500 cursor-pointer"
                  />
                </div>
                {options.includeContours && (
                  <input
                    type="text"
                    value={options.contourInterval}
                    onChange={(e) => setOptions(prev => ({ ...prev, contourInterval: e.target.value }))}
                    placeholder="e.g. 1.0 meter intervals"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Technical Drawing Embellishments & Aspect Ratio */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              6. Technical Notations & Aspect Ratio
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={options.includeNorthArrow}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeNorthArrow: e.target.checked }))}
                  className="rounded border-slate-700 text-emerald-500"
                />
                <span>North Arrow</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={options.includeScaleBar}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeScaleBar: e.target.checked }))}
                  className="rounded border-slate-700 text-emerald-500"
                />
                <span>Graphic Scale Bar</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={options.includePropertyLine}
                  onChange={(e) => setOptions(prev => ({ ...prev, includePropertyLine: e.target.checked }))}
                  className="rounded border-slate-700 text-emerald-500"
                />
                <span>Boundary Setbacks</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Target Presentation Aspect Ratio</label>
                <select
                  value={options.aspectRatio}
                  onChange={(e) => setOptions(prev => ({ ...prev, aspectRatio: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="16:9 Landscape">16:9 Landscape (Standard Digital Board)</option>
                  <option value="4:3 Traditional">4:3 Traditional (Architectural Sheet)</option>
                  <option value="3:4 Portrait">3:4 Portrait (Vertical A1/A0 Board)</option>
                  <option value="1:1 Square">1:1 Square (Vignette)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Color Palette / Board Tone</label>
                <input
                  type="text"
                  value={options.colorPalette}
                  onChange={(e) => setOptions(prev => ({ ...prev, colorPalette: e.target.value }))}
                  placeholder="e.g. Muted charcoal, warm stone, lush emerald"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                Special Studio Notes / Unique Site Features (Optional)
              </label>
              <textarea
                value={options.customNotes}
                onChange={(e) => setOptions(prev => ({ ...prev, customNotes: e.target.value }))}
                placeholder="e.g. Central amphitheater stepped into the hillside; cantilevered clubhouse over looking the detention swale; preservation of old mango trees on northwest corner."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 resize-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Prompt Output (5 cols) */}
        <div className="lg:col-span-5">
          <PromptOutputCard
            prompt={generatedPrompt}
            category="Site Plan (SDP)"
            title={`${options.projectTypology} - ${options.renderStyle}`}
            onSavePrompt={onSavePrompt}
            isLineworkMode={options.mode === 'linework-render'}
          />
        </div>
      </div>
    </div>
  );
};
