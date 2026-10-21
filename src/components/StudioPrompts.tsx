import React, { useState } from 'react';
import { PromptOutputCard } from './PromptOutputCard';

interface StudioPromptsProps {
  onSavePrompt?: (title: string, prompt: string, category: string) => void;
}

export const StudioPrompts: React.FC<StudioPromptsProps> = ({ onSavePrompt }) => {
  const [promptCategory, setPromptCategory] = useState<'sdp' | 'perspective' | 'cityhall' | 'commercial' | 'revit'>('cityhall');

  // Simple state
  const [typology, setTypology] = useState('City Hall & Civic Center');
  const [aesthetic, setAesthetic] = useState('Photoshop Presentation Board Style');
  const [timeOfDay, setTimeOfDay] = useState('Golden Hour / Sunset (3200K)');

  // Dynamically generated clean prompt based on selection
  let currentTitle = '';
  let generatedPrompt = '';
  let isLinework = false;

  if (promptCategory === 'cityhall') {
    currentTitle = 'City Hall & Civic Center Suite';
    generatedPrompt = `**Architectural Visualization Request: Modern City Hall & Civic Center**

**Project Program & Concept:**
- Typology: City Hall and Civic Administration Center.
- Concept: Transparency in Governance (solid travertine stone podium containing citizen services, crowned by a crystalline, double-height glass legislative session hall facing a ceremonial public plaza).

**Camera & Perspective Framing:**
- Strictly eye-level two-point perspective shot on a 24mm architectural tilt-shift lens (Hasselblad H6D-100c format).
- **CRITICAL**: Strictly vertical parallel lines. Zero converging vertical distortion; all columns, mullions, and walls remain 100% plumb.

**Materiality & Lighting:**
- Facade: Honed white travertine stone, off-form architectural concrete, floor-to-ceiling Low-E glass with dark bronze vertical solar fins.
- Lighting: ${timeOfDay}. Warm 2700K interior illumination glowing through the transparent council chamber.
- Entourage: Paved stone plaza with national flagpole, citizens walking toward the grand entrance steps, lush tropical landscaping.

**Fidelity Standard:**
- Architectural photography standard, V-Ray 6 benchmark, uncompressed 8k RAW clarity.
- **Negative Prompt Guardrails**: No tilted camera angles, no crooked walls, no distorted human anatomy, no blurry textures.`;
  } else if (promptCategory === 'commercial') {
    currentTitle = 'Commercial Building & Retail Plaza';
    generatedPrompt = `**Architectural Visualization Request: Contemporary Commercial Lifestyle Center**

**Project Program & Concept:**
- Typology: Mixed-Use Commercial Complex & Retail Plaza.
- Concept: Biophilic Urban Canyon (active street-level retail storefronts with cascading landscaped dining balconies and outdoor promenades).

**Camera & Viewpoint:**
- Eye-level two-point street perspective shot from 1.6m height on a 24mm tilt-shift lens.
- Perfectly vertical columns and building lines (no keystone distortion).

**Materiality & Street Life:**
- Ground Floor: High-transparency double-height glass storefronts showcasing warm retail merchandise and welcoming entrances.
- Upper Levels: Terracotta louvers, charred timber (Shou Sugi Ban) cladding, and cantilevered cafe terraces.
- Atmosphere: ${timeOfDay}. Cafe string lights, warm boutique signage glow, stylish pedestrians dining and shopping al fresco.

**Quality:**
- ArchDaily publication standard, 8k resolution, photorealistic global illumination, uncompressed textures.
- **Negative Prompt**: No curved horizons, no melting building masses, no floating objects.`;
  } else if (promptCategory === 'sdp') {
    currentTitle = 'Site Development Plan (SDP) Master';
    generatedPrompt = `**Architectural Presentation Request: Site Development Plan (SDP)**

**Projection & Camera Rules (Critical):**
- Strictly 90-degree top-down orthographic overhead aerial plan view (true 2D plan, NO camera tilt, NO perspective horizon).
- Keep all building geometries, property boundary setback lines, and access roads strictly orthogonal and dimensionally crisp.

**Program & Layout:**
- Typology: ${typology}.
- Clear spatial zoning between building footprints, vehicular circulation, and pedestrian plazas.

**Architectural Layers & Textures:**
- Selected Aesthetic: ${aesthetic}.
- Hardscaping: Textured modular concrete paving blocks; dark charcoal asphalt roads with crisp white painted crosswalks, turn arrows, and parking bays.
- Landscape Architecture: Layered shade tree canopies viewed from above with semi-translucent foliage casting soft 45-degree ambient drop shadows toward the northeast.
- Water & Drainage: Integrated linear reflecting pools and bioswales lined with smooth river stones.
- Annotations: Minimalist graphic North arrow indicator and graphic scale bar.

**Quality Benchmark:**
- 8k ultra-sharp vector-level linework, ArchDaily / Landscape Architecture Magazine presentation quality.
- **Negative Guardrails**: NO perspective angle, NO tilted horizon, NO blurry pixelated trees, NO nonsensical roads.`;
  } else if (promptCategory === 'perspective') {
    currentTitle = 'Perspectives Pro: Hero 2-Point Render';
    generatedPrompt = `**Architectural Perspective Request: High-Definition Hero View**

**Framing & Composition:**
- View: Two-point eye-level perspective shot at 1.6m horizon line on a 24mm architectural tilt-shift lens.
- **CRITICAL**: Strictly parallel vertical lines. Zero keystoning; all structural columns and walls remain strictly vertical.

**Subject & Materiality:**
- Typology: ${typology}.
- Materials: Board-formed exposed concrete with tie-rod seams, warm natural oak timber slats, floor-to-ceiling double-glazed Low-E glass curtain walls.
- Atmosphere & Lighting: ${timeOfDay}. Long diagonal cast shadows grazing facade textures; warm 2700K interior lighting softly visible through glazing.
- Entourage: Architectural scale human figures walking naturally with subtle motion blur, dressed in understated neutral tones.

**Quality Benchmark:**
- 8K uncompressed RAW clarity, V-Ray 6 and Octane Render realism, physically accurate global illumination.
- **Negative Guardrails**: No warped columns, no sagging roofs, no distorted hands/limbs, no oversaturated colors.`;
  } else {
    currentTitle = 'Revit / CAD Linework to Render';
    isLinework = true;
    generatedPrompt = `**Directive: Multimodal Architectural Linework to Presentation Render**

**Input Reference:**
The attached file is a 3D architectural hidden-line or 2D drawing exported from Autodesk Revit / AutoCAD.

**Geometric Mandate:**
- Treat the attached drawing as a STRICT geometric blueprint. Do NOT alter building proportions, window mullions, roof pitch, column grid, or perspective angle.
- Replace bare linework with photorealistic architectural materials:
  - Solid Facades: Tactile board-formed off-white concrete.
  - Glazing: Reflective Low-E double glazing with dark bronze anodized aluminum frames.
  - Balconies: Minimalist glass balustrades with warm timber soffits.
  - Ground: Textured concrete pavers, manicured ornamental grass, and subtle architectural lighting bollards.

**Lighting & Presentation Quality:**
- Lighting: ${timeOfDay}.
- ArchDaily editorial photography standard, 8k ultra-high resolution, sharp edges, physical material roughness.`;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-mono font-bold tracking-wider px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 uppercase inline-block mb-3">
          Architecture Studio Prompt Maker
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
          Site Plans & 3D Perspectives
        </h2>
        <p className="text-sm text-slate-400">
          Clean, studio-grade prompts with built-in tilt-shift camera rules and negative guardrails to ensure HD, critique-ready renders in Gemini.
        </p>

        {/* Category Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {[
            { id: 'cityhall', label: '🏛️ City Hall / Civic Center', badge: 'Popular' },
            { id: 'commercial', label: '🛍️ Commercial & Retail', badge: 'Popular' },
            { id: 'sdp', label: '📐 Site Plan (SDP 90°)' },
            { id: 'perspective', label: '📸 Hero 2-Point Perspective' },
            { id: 'revit', label: '⚡ Revit/CAD Linework to Render' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setPromptCategory(cat.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                promptCategory === cat.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Simple, clean controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Quick Adjustments
            </h3>

            {promptCategory !== 'cityhall' && promptCategory !== 'commercial' && (
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Project Typology</label>
                <input
                  type="text"
                  value={typology}
                  onChange={(e) => setTypology(e.target.value)}
                  placeholder="e.g. Mixed-Use Commercial Complex"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Lighting & Time of Day</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Golden Hour / Late Afternoon Sunset (3200K warm raking light)">Golden Hour / Sunset (3200K)</option>
                <option value="Blue Hour Twilight with warm 2700K interior illumination">Blue Hour Twilight with Warm Interior Glow</option>
                <option value="Bright diffused Nordic overcast daylight (soft ambient shadows)">Soft Nordic Overcast Daylight</option>
                <option value="Bright tropical morning sunlight with crisp diagonal shadows">Tropical Morning Sunlight (5500K)</option>
              </select>
            </div>

            {promptCategory === 'sdp' && (
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Presentation Graphic Style</label>
                <select
                  value={aesthetic}
                  onChange={(e) => setAesthetic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="Photoshop Architectural Board Style (clean textures, 45-degree tree shadows)">Photoshop Collage Board Style</option>
                  <option value="BIG (Bjarke Ingels) Diagrammatic Style with pastel zoning and vector outlines">BIG Diagrammatic Style</option>
                  <option value="HD Aerial Drone Orthomosaic (photorealistic physical development)">HD Aerial Drone Orthomosaic</option>
                  <option value="Monochrome CAD Linework with Emerald Greenery Accents">Monochrome CAD with Emerald Greenery</option>
                </select>
              </div>
            )}

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-850 text-xs text-slate-400 leading-relaxed">
              <span className="text-sky-400 font-bold block mb-1">Architecture School Secret:</span>
              AI image generators often warp building verticals. This prompt automatically enforces a <strong>24mm tilt-shift lens rule</strong> so columns stay 100% vertical and clean for your critique board!
            </div>
          </div>
        </div>

        {/* Right: Output Card (7 cols) */}
        <div className="lg:col-span-7">
          <PromptOutputCard
            prompt={generatedPrompt}
            category={promptCategory.toUpperCase()}
            title={currentTitle}
            onSavePrompt={onSavePrompt}
            isLineworkMode={isLinework}
          />
        </div>
      </div>
    </div>
  );
};
