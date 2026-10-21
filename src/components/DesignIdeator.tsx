import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DesignIdeatorProps {
  onSavePrompt?: (title: string, prompt: string, category: string) => void;
}

export const DesignIdeator: React.FC<DesignIdeatorProps> = () => {
  const [typology, setTypology] = useState('City Hall & Civic Center');
  const [siteContext, setSiteContext] = useState('Prominent urban corner lot with heavy pedestrian flow');
  const [climateVibe, setClimateVibe] = useState('Tropical Modern with passive cooling & natural breezeways');
  const [designPhilosophy, setDesignPhilosophy] = useState('Democratic transparency with civic dignity & public gardens');
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#10b981', '#38bdf8'],
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamically constructed ideas based on choices
  const isCityHall = typology.includes('City Hall') || typology.includes('Civic');
  const isCommercial = typology.includes('Commercial') || typology.includes('Mall') || typology.includes('Retail');

  const generatedIdeas = [
    {
      id: 'idea-1',
      title: isCityHall 
        ? 'The Civic Lantern (Transparency in Governance)' 
        : isCommercial 
        ? 'The Biophilic Retail Canyon' 
        : 'The Interlocking Monolith',
      tagline: isCityHall
        ? 'Solid vernacular stone podium supporting a crystalline, glowing legislative chamber'
        : isCommercial
        ? 'Two retail wings framing a shaded, open-air pedestrian canyon with cascading gardens'
        : 'Interlocking structural masses creating fluid indoor-outdoor public thresholds',
      metaphor: isCityHall
        ? 'A beacon of democratic integrity that glows at night, reminding citizens of openness in public office.'
        : isCommercial
        ? 'A natural mountain canyon where commerce, fresh air, and lush greenery coexist.'
        : 'A protective canopy inspired by the sheltering branches of native trees.',
      massingGuide: isCityHall
        ? 'Model a 2-storey solid stone base (containing citizen services). Place a double-height cantilevered glass box on the 3rd floor facing the civic plaza (the City Council Session Hall).'
        : isCommercial
        ? 'Model two parallel 3-storey curved building masses separated by a 12-meter wide central breezeway, topped with a sculptural parametric timber-and-glass canopy.'
        : 'Sculpt two offset rectilinear volumes with an open double-height glass atrium bridging them.',
      geminiVisualPrompt: `**Architectural Concept Visualization from Scratch: ${typology}**
- **Typology**: ${typology} | **Site Context**: ${siteContext}
- **Architectural Concept**: ${isCityHall ? 'The Civic Lantern' : 'The Biophilic Canyon'} - ${designPhilosophy}
- **Camera & View**: Eye-level two-point perspective shot on a 24mm architectural tilt-shift lens (Hasselblad H6D-100c format). Strictly vertical parallel lines, zero perspective keystoning.
- **Form & Materials**: Grounded architectural stone and board-formed concrete base; floor-to-ceiling Low-E glass curtain walls with warm vertical bronze solar louvers; lush native landscaping with mature shade trees and reflecting water pools.
- **Lighting**: Golden hour late-afternoon sunlight casting long diagonal shadows, with warm 2700K interior lighting softly illuminating interior volumes.
- **Quality**: ArchDaily editorial standard, 8k resolution, photorealistic V-Ray 6 benchmark, uncompressed RAW clarity.
- **Negative Prompt**: No crooked walls, no distorted verticals, no melted anatomy, no blurry textures.`,
      geminiChatPrompt: `Act as a senior architectural design critic and thesis advisor. I am starting a project from scratch for a ${typology} located on a ${siteContext}. 

My concept is "${isCityHall ? 'The Civic Lantern' : 'The Biophilic Canyon'}" based on the philosophy of ${designPhilosophy}.

Help me with:
1. 3 distinct massing and form-finding strategies I can model in Revit/AutoCAD.
2. The optimal space programming and circulation diagram (how to separate public vs administrative vs service zones).
3. 5 passive environmental strategies to combat solar heat gain while preserving natural daylight.`,
    },
    {
      id: 'idea-2',
      title: isCityHall
        ? 'The Terraced Civic Hill (People Above Government)'
        : isCommercial
        ? 'The Terraced Origami Marketplace'
        : 'The Sculpted Courtyard Pavilion',
      tagline: isCityHall
        ? 'Cascading walkable green roof gardens where citizens can walk on top of the civic building'
        : isCommercial
        ? 'Prismatic folded metal facade with stepping outdoor dining balconies and skyline views'
        : 'A series of inward-looking courtyards that capture prevailing winds and natural daylight',
      metaphor: isCityHall
        ? 'Symbolizing that the sovereign people literally stand above the public officials who serve them.'
        : isCommercial
        ? 'An architectural origami sculpture that shifts in appearance as sunlight and pedestrians move past.'
        : 'An oasis of serenity in the middle of a dense urban fabric.',
      massingGuide: isCityHall
        ? 'Create stepped floor plates that taper upward like a stepped pyramid or terraced hillside, connecting ground-level public plazas directly to rooftop public amphitheaters.'
        : isCommercial
        ? 'Model a bold, faceted geometric podium with cantilevered balconies that step back at each level to create outdoor dining terraces.'
        : 'Carve out two deep central vertical courtyards through a solid cubic envelope to create breezeways.',
      geminiVisualPrompt: `**Architectural Concept Visualization from Scratch: ${typology}**
- **Typology**: ${typology} | **Concept Style**: Terraced Biophilic Architecture
- **Camera**: Two-point perspective with perfectly vertical building columns, 1.6m eye-level horizon line.
- **Form & Materials**: Stepped building massing with lush rooftop gardens, trailing vines, warm timber ceiling soffits, and floor-to-ceiling glass openings.
- **Atmosphere**: Bright tropical morning daylight with crisp diagonal shadows across concrete textures.
- **Quality**: 8K, V-Ray physically based rendering, architectural presentation grade.`,
      geminiChatPrompt: `I am developing an architectural concept for a ${typology} where the building is designed as a series of walkable landscaped terraces and green roofs. What are the structural column grid spacing, waterproofing strategies, and public egress requirements I need to explain to my jury panel?`,
    },
    {
      id: 'idea-3',
      title: 'The Porous Pavilion (Passive Tropical Resilience)',
      tagline: 'Deep cantilevered roof overhangs, vertical timber louvers, and cross-ventilated breezeways',
      metaphor: 'An architectural sponge that filters sunlight, breathes with the wind, and shields against torrential rains.',
      massingGuide: 'Elevate the ground floor on pilotis/columns to create a covered, open-air public ground plane. Use deep 3-meter roof cantilevers to shade glass walls.',
      geminiVisualPrompt: `**Architectural Concept Visualization: Tropical Sustainable ${typology}**
- **Camera**: 2-point perspective, strictly vertical tilt-shift lens, eye-level framing.
- **Architecture**: Elevated ground floor on raw concrete pilotis, deep horizontal roof cantilevers, vertical timber brise-soleil screening, reflecting water pool underneath.
- **Ambiance**: Overcast soft Nordic daylight highlighting pure architectural form and materiality.
- **Quality**: 8K photorealistic, zero AI artifacts, clean architectural photography.`,
      geminiChatPrompt: `Explain how to design an energy-efficient ${typology} using passive solar shading and the Bernoulli effect for cross-ventilation in a tropical climate. Give me the technical terminology to use in my architecture plate description.`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight m-0">
              Design Ideator & Concept Incubator (From Scratch)
            </h2>
            <p className="text-sm text-slate-400 m-0">
              Starting a project with a blank slate? Generate strong architectural concepts, form-finding massing strategies, and Gemini brainstorming prompts in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Input Generator Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Define Your Project Starting Points
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Project Typology</label>
            <select
              value={typology}
              onChange={(e) => setTypology(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="City Hall & Civic Center">City Hall & Civic Center (Municipal Hall)</option>
              <option value="Commercial Complex & Lifestyle Mall">Commercial Complex & Lifestyle Mall</option>
              <option value="Mixed-Use Retail & Office Tower">Mixed-Use Retail & Office Tower</option>
              <option value="Community Library & Cultural Hub">Community Library & Cultural Hub</option>
              <option value="Tropical Eco-Resort & Pavilion">Tropical Eco-Resort & Pavilion</option>
              <option value="High-Density Residential Podium">High-Density Residential Podium</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Site Context & Lot Condition</label>
            <input
              type="text"
              value={siteContext}
              onChange={(e) => setSiteContext(e.target.value)}
              placeholder="e.g. Sloping hillside corner lot with 2 road frontages"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Climate & Environment</label>
            <input
              type="text"
              value={climateVibe}
              onChange={(e) => setClimateVibe(e.target.value)}
              placeholder="e.g. Tropical modern with passive cross-ventilation"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Design Philosophy / Core Vibe</label>
            <input
              type="text"
              value={designPhilosophy}
              onChange={(e) => setDesignPhilosophy(e.target.value)}
              placeholder="e.g. Democratic transparency, biophilic terraces"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Generated Ideas Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generated Concept Directions for {typology}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">3 Tailored Strategies</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {generatedIdeas.map((idea, index) => (
            <div
              key={idea.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    CONCEPT 0{index + 1}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-1">{idea.title}</h4>
                <p className="text-xs text-amber-200/90 font-medium mb-3 italic">
                  "{idea.tagline}"
                </p>

                {/* Architectural Metaphor */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 mb-3 space-y-1">
                  <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 block">
                    Design Metaphor:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed m-0">
                    {idea.metaphor}
                  </p>
                </div>

                {/* Massing & Modeling Guide */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 mb-4 space-y-1">
                  <span className="text-[10px] font-mono font-semibold uppercase text-emerald-400 block">
                    Revit / CAD Massing Guide:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed m-0">
                    {idea.massingGuide}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => handleCopy(idea.geminiVisualPrompt, `${idea.id}-visual`)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  {copiedId === `${idea.id}-visual` ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Visual Prompt!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Gemini Visual Prompt</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopy(idea.geminiChatPrompt, `${idea.id}-chat`)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  {copiedId === `${idea.id}-chat` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400">Copied Chat Prompt!</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copy Gemini Brainstorm Prompt</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <a
                    href="https://gemini.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-sky-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Paste in Gemini Web App</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Gemini Ideation Prompts */}
      <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>Ask Gemini to Brainstorm from Scratch (Step-by-Step Recipes)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Copy these proven prompts into Gemini to brainstorm space zoning, bubble diagrams, and thesis critique defenses:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'recipe-bubble',
              title: '1. Bubble Diagram & Spatial Adjacencies',
              desc: 'Ask Gemini to map functional relationships between public, private, and service zones.',
              prompt: `Act as a senior architectural planner. I am designing a ${typology}. Generate a detailed space programming adjacency matrix and bubble diagram description. Categorize all rooms into: 1. Public Zone (high foot-traffic), 2. Administrative / Private Zone (secure access), and 3. Service / MEPF Logistics Zone (loading dock, plant rooms). Explain which spaces must be adjacent and which must be separated.`,
            },
            {
              id: 'recipe-massing',
              title: '2. Form-Finding & Massing Concepts',
              desc: 'Ask Gemini for 5 bold sculptural building shapes suited for your lot condition.',
              prompt: `Act as a design professor at Harvard GSD. I am working on the massing study for a ${typology} on a ${siteContext}. Propose 5 bold, avant-garde architectural massing concepts (e.g. subtractive carving, cantilevered bridge, folded origami, or terraced landscape). For each, give a poetic design title, physical modeling steps in Revit, and how it responds to sun and wind.`,
            },
            {
              id: 'recipe-defense',
              title: '3. Pre-Emptive Jury Defense Attack',
              desc: 'Ask Gemini to roast and interrogate your design before your actual professor does!',
              prompt: `Act as a notoriously tough, cynical architecture thesis jury panelist. Grill my ${typology} design project. Ask me 6 sharp, technical questions targeting: 1. Parking and traffic bottlenecks, 2. Universal accessibility (PWD) compliance, 3. Fire egress travel distances, 4. Solar heat gain on west-facing facades, 5. Structural load spans, and 6. Construction feasibility. Include winning model answers for each.`,
            },
          ].map((recipe) => (
            <div key={recipe.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white mb-1">{recipe.title}</h4>
                <p className="text-[11px] text-slate-400 mb-3">{recipe.desc}</p>
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed mb-4 max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {recipe.prompt}
                </div>
              </div>
              <button
                onClick={() => handleCopy(recipe.prompt, recipe.id)}
                className="w-full px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === recipe.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === recipe.id ? 'Copied Prompt!' : 'Copy Prompt'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
