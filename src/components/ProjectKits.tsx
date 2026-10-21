import React, { useState } from 'react';
import { 
  Building, 
  ShoppingBag, 
  Layers, 
  FileText, 
  GraduationCap, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Compass, 
  Building2, 
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CITY_HALL_KIT, COMMERCIAL_KIT } from '../data/projectKitsData';
import type { ProjectKitData } from '../data/projectKitsData';

interface ProjectKitsProps {
  onSavePrompt?: (title: string, prompt: string, category: string) => void;
}

export const ProjectKits: React.FC<ProjectKitsProps> = () => {
  const [activeKitId, setActiveKitId] = useState<'city-hall' | 'commercial'>('city-hall');
  const [activeSubTab, setActiveSubTab] = useState<'concepts' | 'program' | 'defense' | 'zoning'>('concepts');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentKit: ProjectKitData = activeKitId === 'city-hall' ? CITY_HALL_KIT : COMMERCIAL_KIT;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    confetti({
      particleCount: 30,
      spread: 55,
      origin: { y: 0.8 },
      colors: ['#38bdf8', '#10b981', '#f59e0b'],
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight m-0">
              City Hall & Commercial Building Project Kits
            </h2>
            <p className="text-sm text-slate-400 m-0">
              Specialized architectural studio blueprints, SDP prompts, space programming matrices, and defense answers tailored to Nekol's current plates.
            </p>
          </div>
        </div>
      </div>

      {/* Main Kit Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setActiveKitId('city-hall')}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
            activeKitId === 'city-hall'
              ? 'border-sky-500 bg-sky-950/25 ring-1 ring-sky-500 shadow-lg shadow-sky-500/5'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold uppercase">
                Plate 01 Special
              </span>
              <h3 className="text-base font-bold text-white mt-1">City Hall & Civic Center Kit</h3>
              <p className="text-xs text-slate-400">Municipal Hall, Council Chambers & Civic Plaza</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 ${activeKitId === 'city-hall' ? 'text-sky-400' : 'text-slate-600'}`} />
        </button>

        <button
          onClick={() => setActiveKitId('commercial')}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
            activeKitId === 'commercial'
              ? 'border-emerald-500 bg-emerald-950/25 ring-1 ring-emerald-500 shadow-lg shadow-emerald-500/5'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                Plate 02 Special
              </span>
              <h3 className="text-base font-bold text-white mt-1">Commercial Building & Mall Kit</h3>
              <p className="text-xs text-slate-400">Retail Lifestyle Mall, Mixed-Use & Plaza</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 ${activeKitId === 'commercial' ? 'text-emerald-400' : 'text-slate-600'}`} />
        </button>
      </div>

      {/* Kit Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {currentKit.badge}
            </span>
            <h3 className="text-base font-bold text-white">{currentKit.name}</h3>
          </div>
          <a
            href="https://gemini.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Open Gemini Web App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          {currentKit.overview}
        </p>

        {/* Sub-tab navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab('concepts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'concepts'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Design Concepts & Prompts</span>
          </button>

          <button
            onClick={() => setActiveSubTab('program')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'program'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'bg-slate-950 text-slate-400 border border-slate-855 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Space Programming Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubTab('defense')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'defense'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'bg-slate-950 text-slate-400 border border-slate-855 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Jury Crit & Defense Answers</span>
          </button>

          <button
            onClick={() => setActiveSubTab('zoning')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'zoning'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'bg-slate-950 text-slate-400 border border-slate-855 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Code & Zoning Rules</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: DESIGN CONCEPTS & PROMPTS */}
      {activeSubTab === 'concepts' && (
        <div className="space-y-8">
          {currentKit.designConcepts.map((concept, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300">
                    CONCEPT {index + 1}
                  </span>
                  <h3 className="text-base font-bold text-white">{concept.title}</h3>
                </div>
                <p className="text-xs text-sky-200/90 italic font-medium">"{concept.tagline}"</p>
              </div>

              {/* Architectural details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block mb-1">
                    Design Metaphor:
                  </span>
                  <p className="text-slate-300 leading-relaxed m-0">{concept.metaphor}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold block mb-1">
                    Massing Strategy:
                  </span>
                  <p className="text-slate-300 leading-relaxed m-0">{concept.massing}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold block mb-1">
                    Facade Materiality:
                  </span>
                  <p className="text-slate-300 leading-relaxed m-0">{concept.facade}</p>
                </div>
              </div>

              {/* Ready-to-use Prompt Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                {/* SDP Prompt */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ready-to-Use Site Development Plan (SDP) Prompt</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">90° Orthographic</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 max-h-44 overflow-y-auto leading-relaxed whitespace-pre-wrap mb-3">
                      {concept.sdpPrompt}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(concept.sdpPrompt, `sdp-${index}`)}
                    className="w-full py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === `sdp-${index}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === `sdp-${index}` ? 'Copied SDP Prompt!' : 'Copy SDP Prompt for Gemini'}</span>
                  </button>
                </div>

                {/* Perspective Prompt */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Hero Perspective (2-Point Tilt-Shift) Prompt</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">8K V-Ray Benchmark</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 max-h-44 overflow-y-auto leading-relaxed whitespace-pre-wrap mb-3">
                      {concept.perspectivePrompt}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(concept.perspectivePrompt, `persp-${index}`)}
                    className="w-full py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === `persp-${index}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === `persp-${index}` ? 'Copied Perspective Prompt!' : 'Copy Perspective Prompt for Gemini'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: SPACE PROGRAMMING MATRIX */}
      {activeSubTab === 'program' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-2">
              Typical Architectural Space Programming & Vertical Zoning
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Use this layout matrix to plan room layouts in AutoCAD/Revit and prepare your bubble diagrams.
            </p>

            <div className="space-y-4">
              {currentKit.typicalPrograms.map((prog, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wide">
                      {prog.zone}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {prog.rooms.map((room, rIdx) => (
                      <span
                        key={rIdx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 font-mono"
                      >
                        {room}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 m-0">
                    <strong className="text-amber-400 font-semibold not-italic">Design Rule: </strong>
                    {prog.importance}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: JURY CRIT & DEFENSE ANSWERS */}
      {activeSubTab === 'defense' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-2">
              Tough Panel Critique Questions & Winning Answers ({currentKit.name})
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Memorize these technical answers before facing your architecture professors and defense panel!
            </p>

            <div className="space-y-4">
              {currentKit.defenseQuestions.map((q, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 uppercase font-semibold">
                      {q.tag}
                    </span>
                    <button
                      onClick={() => handleCopy(q.answer, `defense-ans-${idx}`)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `defense-ans-${idx}` ? (
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
                  <h4 className="text-xs font-bold text-white leading-snug">
                    "{q.question}"
                  </h4>
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400 block mb-1">Defense Rationale:</strong>
                    {q.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CODE & ZONING RULES */}
      {activeSubTab === 'zoning' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-2">
              Key Building Code & Zoning Rules ({currentKit.name})
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Essential architectural parameters for setbacks, parking computations, and circulation flow:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentKit.keyZoningRules.map((rule, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed m-0">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
