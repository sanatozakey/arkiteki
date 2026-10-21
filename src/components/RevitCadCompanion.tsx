import React, { useState } from 'react';
import { 
  Terminal, 
  Layers, 
  FileText, 
  GraduationCap, 
  Sparkles, 
  Copy, 
  Check, 
  Code2, 
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { RevitCadOptions, ConceptStatementOptions } from '../types';
import { CRIT_DEFENSE_QUESTIONS } from '../data/architecturalTerms';
import { buildRevitCadPrompt, buildConceptStatement } from '../utils/promptBuilder';
import { PromptOutputCard } from './PromptOutputCard';

interface RevitCadCompanionProps {
  onSavePrompt: (title: string, prompt: string, category: string) => void;
}

export const RevitCadCompanion: React.FC<RevitCadCompanionProps> = ({ onSavePrompt }) => {
  const [activeSection, setActiveSection] = useState<'linework' | 'concept' | 'defense' | 'shortcuts'>('linework');

  // Linework to Render state
  const [revitOptions, setRevitOptions] = useState<RevitCadOptions>({
    softwareSource: 'Revit',
    exportType: '3D Hidden Line Wireframe',
    targetStyle: 'Photorealistic ArchDaily Editorial Architecture with Lush Greenery',
    geometryStrictness: 'Strict Geometry (Do Not Alter Linework)',
    keyMaterialsToApply: '- Solid Wall Facades: Board-formed exposed concrete with delicate tie-rod holes\n- Glazing: Floor-to-ceiling double-glazed reflective Low-E glass with bronze mullions\n- Overhangs & Soffits: Warm white oak timber slats\n- Ground Plane: Smooth poured concrete pavers with green turf borders',
    lightingSetup: 'Soft overcast Nordic morning daylight with warm 2700K interior lighting glowing from inside',
    presentationBoardIntent: 'Final thesis defense presentation board hero perspective',
  });

  // Concept statement state
  const [conceptOptions, setConceptOptions] = useState<ConceptStatementOptions>({
    projectTitle: 'The Verdant Threshold',
    typology: 'Community Library & Botanical Learning Pavilion',
    locationContext: 'Suburban hillside parcel bordering an urban park',
    coreInspirations: 'The protective canopy of mature heritage banyan trees and fluid indoor-outdoor thresholds',
    sustainabilityFeatures: ['Passive stack cross-ventilation', 'Rainwater retention bioswales', 'Deep timber overhangs for solar shading', 'Permeable grass-paver circulation'],
    spatialPhilosophy: 'Democratizing public knowledge through open, light-filled communal volumes that dissolve the barrier between architecture and landscape',
    tone: 'Poetic & Phenomenological',
  });

  // Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleQuickCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#38bdf8', '#10b981'],
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generatedRevitPrompt = buildRevitCadPrompt(revitOptions);
  const generatedConceptStatement = buildConceptStatement(conceptOptions);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight m-0">
              Revit & AutoCAD Studio Companion
            </h2>
            <p className="text-sm text-slate-400 m-0">
              Transform Revit/CAD models into renders, generate jury-grade concept statements, and ace your plate defense.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSection('linework')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSection === 'linework'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Revit/CAD Viewport to Render</span>
        </button>

        <button
          onClick={() => setActiveSection('concept')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSection === 'concept'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Concept Statement & Board Narrative</span>
        </button>

        <button
          onClick={() => setActiveSection('defense')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSection === 'defense'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Plate Defense & Jury Prep</span>
        </button>

        <button
          onClick={() => setActiveSection('shortcuts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSection === 'shortcuts'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>AutoCAD & Revit Fixes</span>
        </button>
      </div>

      {/* SECTION 1: LINEWORK TO RENDER */}
      {activeSection === 'linework' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* Step-by-step tutorial card */}
            <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/20 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>How to Render Revit or AutoCAD in Gemini in 3 Minutes:</span>
              </h3>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                <li>
                  <strong>In Revit / AutoCAD:</strong> Open your 3D view or 2D plan. Turn visual style to <em>Hidden Line</em> or <em>Shaded</em> with shadows ON.
                </li>
                <li>
                  <strong>Export Image:</strong> In Revit: <code>File &gt; Export &gt; Images & Animations &gt; Image</code> (Set to 300 DPI, ~3500px wide). In AutoCAD: Plot to PDF or PNG (monochrome).
                </li>
                <li>
                  <strong>Open Gemini:</strong> Go to <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="text-amber-300 underline font-semibold">gemini.google.com</a>, attach your exported image, and paste the prompt generated below!
                </li>
              </ol>
            </div>

            {/* Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Source Software & Export Settings
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Drafting Software</label>
                  <select
                    value={revitOptions.softwareSource}
                    onChange={(e) => setRevitOptions(prev => ({ ...prev, softwareSource: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Revit">Autodesk Revit</option>
                    <option value="AutoCAD">Autodesk AutoCAD</option>
                    <option value="Rhino">Rhino 3D</option>
                    <option value="Sketchup">Sketchup</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Export Type</label>
                  <select
                    value={revitOptions.exportType}
                    onChange={(e) => setRevitOptions(prev => ({ ...prev, exportType: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 cursor-pointer"
                  >
                    <option value="3D Hidden Line Wireframe">3D Hidden Line Wireframe</option>
                    <option value="2D Site Plan">2D Site Plan / SDP</option>
                    <option value="Shaded View">Shaded View with Shadows</option>
                    <option value="Enscape Clay Render">Enscape Clay Render</option>
                    <option value="Floor Plan">2D Floor Plan Presentation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Geometry Rule</label>
                <select
                  value={revitOptions.geometryStrictness}
                  onChange={(e) => setRevitOptions(prev => ({ ...prev, geometryStrictness: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 cursor-pointer"
                >
                  <option value="Strict Geometry (Do Not Alter Linework)">Strict Geometry (Keep 100% Faithful to Model Linework)</option>
                  <option value="Allow Gentle AI Embellishment">Gentle Embellishment (Add landscape entourage & subtle roof textures)</option>
                  <option value="Conceptual Freedom">Conceptual Freedom (Use linework as broad massing inspiration)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Key Materials to Map onto Model</label>
                <textarea
                  value={revitOptions.keyMaterialsToApply}
                  onChange={(e) => setRevitOptions(prev => ({ ...prev, keyMaterialsToApply: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 font-mono resize-none"
                  placeholder="- Concrete walls&#10;- Glass facade&#10;- Timber deck"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Lighting Setup</label>
                <input
                  type="text"
                  value={revitOptions.lightingSetup}
                  onChange={(e) => setRevitOptions(prev => ({ ...prev, lightingSetup: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <PromptOutputCard
              prompt={generatedRevitPrompt}
              category="Revit Linework"
              title={`${revitOptions.softwareSource} ${revitOptions.exportType} to Render`}
              onSavePrompt={onSavePrompt}
              isLineworkMode={true}
            />
          </div>
        </div>
      )}

      {/* SECTION 2: CONCEPT STATEMENT GENERATOR */}
      {activeSection === 'concept' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Project Information for Board Narrative
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Project Title</label>
                  <input
                    type="text"
                    value={conceptOptions.projectTitle}
                    onChange={(e) => setConceptOptions(prev => ({ ...prev, projectTitle: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                    placeholder="e.g. The Verdant Threshold"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Typology</label>
                  <input
                    type="text"
                    value={conceptOptions.typology}
                    onChange={(e) => setConceptOptions(prev => ({ ...prev, typology: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                    placeholder="e.g. Mixed-Use Waterfront Hub"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Site Location & Context</label>
                <input
                  type="text"
                  value={conceptOptions.locationContext}
                  onChange={(e) => setConceptOptions(prev => ({ ...prev, locationContext: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                  placeholder="e.g. Urban riverfront facing historical heritage district"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Design Inspirations / Metaphor</label>
                <textarea
                  value={conceptOptions.coreInspirations}
                  onChange={(e) => setConceptOptions(prev => ({ ...prev, coreInspirations: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 resize-none font-mono"
                  placeholder="e.g. The layered bark of native trees, passive cooling breezes, community connectivity"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Spatial Philosophy</label>
                <textarea
                  value={conceptOptions.spatialPhilosophy}
                  onChange={(e) => setConceptOptions(prev => ({ ...prev, spatialPhilosophy: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 resize-none font-mono"
                  placeholder="e.g. Dissolving the threshold between indoor study sanctuary and outdoor botanical public garden"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Narrative Tone</label>
                <select
                  value={conceptOptions.tone}
                  onChange={(e) => setConceptOptions(prev => ({ ...prev, tone: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 cursor-pointer"
                >
                  <option value="Poetic & Phenomenological">Poetic & Phenomenological (Rich spatial descriptions, light & shadow)</option>
                  <option value="Modern & Analytical">Modern & Analytical (Focus on urban flow, programmatic zoning)</option>
                  <option value="Sustainable & Biophilic">Sustainable & Biophilic (Eco-centric, carbon reduction, microclimate)</option>
                  <option value="Urban & Visionary">Urban & Visionary (Civic impact, public realm activation)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <PromptOutputCard
              prompt={generatedConceptStatement}
              category="Concept Statement"
              title={`Concept: ${conceptOptions.projectTitle}`}
              onSavePrompt={onSavePrompt}
            />
          </div>
        </div>
      )}

      {/* SECTION 3: JURY CRIT & DEFENSE SIMULATOR */}
      {activeSection === 'defense' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white m-0">
                  Studio Defense & Jury Panel Simulator
                </h3>
                <p className="text-xs text-slate-400 m-0">
                  High-scoring architectural defense answers to common professor & panelist critique questions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CRIT_DEFENSE_QUESTIONS.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 uppercase">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-2 mb-2 leading-snug">
                      "{item.question}"
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      <strong className="text-emerald-400 block mb-1">Defense Strategy / Model Answer:</strong>
                      {item.modelAnswer}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-900 flex justify-end">
                    <button
                      onClick={() => handleQuickCopy(item.modelAnswer, `crit-${index}`)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === `crit-${index}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied Answer</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: AUTOCAD & REVIT FIXES */}
      {activeSection === 'shortcuts' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-400" />
              <span>AutoCAD & Revit Emergency Fixes (Ask Gemini)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              When software glitches or crashes threaten your deadline, copy these tailored problem-solver prompts into Gemini!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 'dwg-lag',
                  title: 'Fix Laggy / Giant AutoCAD DWG File',
                  problem: 'DWG file is 100MB+ and freezing your laptop before submission.',
                  prompt: 'Act as an AutoCAD master technician. My DWG file is extremely laggy and large. Give me the exact sequence of AutoCAD commands (including PURGE, -PURGE Regapps, AUDIT, OVERKILL, and WBLOCK) to clean and reduce file size by 80% without deleting my project geometry.',
                },
                {
                  id: 'revit-walls',
                  title: 'Revit Walls Won’t Join or Clean Up',
                  problem: 'Wall intersections show ugly lines and overlapping materials.',
                  prompt: 'Act as a Revit BIM manager. My exterior and interior walls in Revit are not joining cleanly at corners and show visible overlap lines in plan view. Explain step-by-step how to resolve this using Wall Joins (Disallow Join vs Allow Join), Cut Geometry, and Wall Layer Function Priorities (1 to 5).',
                },
                {
                  id: 'dynamo-topo',
                  title: 'Dynamo Script: CAD Contours to Revit Toposurface',
                  problem: 'Importing AutoCAD 2D contour lines into Revit topography.',
                  prompt: 'Write a step-by-step guide and Dynamo script logic to convert 2D AutoCAD contour polyline elevations into an accurate 3D Toposurface/Toposolid in Revit, automatically assigning correct elevation Z-values.',
                },
                {
                  id: 'revit-render-dpi',
                  title: 'High-Res Presentation Export Settings',
                  problem: 'Exported image is blurry when printed on 20x30 inch board.',
                  prompt: 'What are the exact export settings in Revit (Image Export dialog) and AutoCAD (Plotter / CTB settings) to produce a razor-sharp 300 DPI image suitable for a 20x30 inch (A1) architectural presentation board?',
                },
              ].map((fix) => (
                <div key={fix.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 mb-1">{fix.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-3">{fix.problem}</p>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 mb-4 whitespace-pre-wrap">
                      {fix.prompt}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                    <a
                      href="https://gemini.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <span>Open Gemini</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => handleQuickCopy(fix.prompt, fix.id)}
                      className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === fix.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === fix.id ? 'Copied!' : 'Copy Prompt'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
