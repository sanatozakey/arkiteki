import type { 
  QuizQuestion, 
  FlashcardItem, 
  UploadedFileItem, 
  PromptCritiqueResult,
  InAppStudioResult 
} from '../types';

const STORAGE_KEY = 'arkiteki_gemini_api_key';
const MODEL_STORAGE_KEY = 'arkiteki_gemini_model';

export interface GeminiModelOption {
  id: string;
  name: string;
  badge: string;
  tag: string;
  description: string;
  isPro?: boolean;
}

export const GEMINI_MODELS: GeminiModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Recommended • Latest',
    tag: '⚡ 3.8 Flash',
    description: 'Google’s most intelligent flash model. Superior architectural synthesis, code analysis, and multimodal understanding.',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    badge: 'Fast & Stable',
    tag: '⚡ 2.0 Flash',
    description: 'High-speed multimodal vision & prompt refinement for everyday studio plates.',
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    badge: 'Lightweight & Efficient',
    tag: '⚡ 3.5 Lite',
    description: 'Cost-efficient rapid model optimized for quick flashcard generation and translations.',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    badge: 'Pro User • Deep Reasoning',
    tag: '🧠 1.5 Pro',
    description: 'Deep reasoning model for Philippine building codes (PD 1096, BP 344) and juror defense.',
    isPro: true,
  },
];

export function getStoredGeminiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || localStorage.getItem('draft_drill_gemini_api_key') || '';
  } catch {
    return '';
  }
}

export function setStoredGeminiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('draft_drill_gemini_api_key');
    }
  } catch (e) {
    console.error('Failed to save Gemini key', e);
  }
}

export function getStoredGeminiModel(): string {
  try {
    const stored = localStorage.getItem(MODEL_STORAGE_KEY);
    // Automatically migrate from any restricted 2.5 or legacy models to gemini-3.8-flash
    if (!stored || stored.includes('2.5') || stored.includes('3-pro')) {
      localStorage.setItem(MODEL_STORAGE_KEY, 'gemini-3.8-flash');
      return 'gemini-3.8-flash';
    }
    return stored;
  } catch {
    return 'gemini-3.8-flash';
  }
}

export function setStoredGeminiModel(modelId: string): void {
  try {
    localStorage.setItem(MODEL_STORAGE_KEY, modelId);
  } catch (e) {
    console.error('Failed to save Gemini model', e);
  }
}

/**
 * Call Google Gemini API directly using the user's connected API Key.
 */
export async function callGeminiApi({
  apiKey,
  prompt,
  fileItem,
  systemInstruction,
  model,
}: {
  apiKey: string;
  prompt: string;
  fileItem?: UploadedFileItem;
  systemInstruction?: string;
  model?: string;
}): Promise<string> {
  const chosenModel = model || getStoredGeminiModel() || 'gemini-3.8-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${apiKey}`;

  const parts: any[] = [];

  // If a file (PDF, Image, etc.) is uploaded, pass as inlineData if MIME type is supported by Gemini
  const isSupportedMime =
    fileItem &&
    (fileItem.mimeType.startsWith('image/') ||
      fileItem.mimeType === 'application/pdf' ||
      fileItem.mimeType.startsWith('text/') ||
      fileItem.mimeType.startsWith('audio/') ||
      fileItem.mimeType.startsWith('video/'));

  if (fileItem && fileItem.base64Data && isSupportedMime) {
    parts.push({
      inlineData: {
        mimeType: fileItem.mimeType,
        data: fileItem.base64Data,
      },
    });
  }

  // Text prompt + extracted text if unsupported binary or docx
  let fullPrompt = prompt;
  if (fileItem && !isSupportedMime && fileItem.textPreview) {
    fullPrompt = `${prompt}\n\n[Reference Material Attached: "${fileItem.name}"]:\n${fileItem.textPreview}`;
  }

  parts.push({ text: fullPrompt });

  const requestBody: any = {
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 3500,
    },
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message = errorJson.error?.message || `HTTP ${response.status} ${response.statusText}`;

    // Auto-fallback: if the requested model is no longer available to new users, restricted, or not found,
    // seamlessly fall back to 'gemini-2.0-flash' or 'gemini-1.5-flash'!
    if (
      message.includes('is no longer available to new users') ||
      message.includes('models/gemini-2.5') ||
      message.includes('not found') ||
      message.includes('404')
    ) {
      const fallbackTarget = chosenModel !== 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'gemini-2.0-flash';
      console.warn(`Model ${chosenModel} unavailable (${message}). Auto-switching to ${fallbackTarget}...`);
      setStoredGeminiModel(fallbackTarget);
      return callGeminiApi({
        apiKey,
        prompt,
        fileItem,
        systemInstruction,
        model: fallbackTarget,
      });
    }

    throw new Error(`Gemini API Error: ${message}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const textOutput = candidate?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('No response text generated by Gemini.');
  }

  return textOutput;
}

/**
 * Analyzes rough architectural prompt and optional attached sketch/brief,
 * returning structured critique & improved version with Philippine climate, building code, and camera rules.
 */
export async function enhanceArchitecturalPromptWithGemini(
  userPrompt: string,
  apiKey?: string,
  fileItem?: UploadedFileItem,
  model?: string
): Promise<PromptCritiqueResult> {
  const chosenModel = model || getStoredGeminiModel();

  const systemInstruction = `You are an expert Philippine architectural visualizer and design professor.
Your role is to critique a student's prompt and any attached drawings/briefs, transforming them into an ArchDaily-grade, 8K presentation visual prompt.
You MUST consider the Philippine context:
- Solar orientation & tropical passive cooling (Amihan northeast monsoon, Habagat southwest monsoon, deep eaves, brise-soleil).
- Camera rules: 2-point perspective, 24mm tilt-shift lens with STRICTLY vertical building columns (zero keystoning).
- Philippine National Building Code (PD 1096) and BP 344 accessibility.
- Crisp materiality (exposed board-formed concrete, warm timber louvers, Low-E glass, permeable pavers).
- Quality standards: V-Ray 6 benchmark, 8K resolution, negative guardrails against AI distortion.`;

  let fileAttachmentContext = '';
  if (fileItem) {
    if (fileItem.mimeType.startsWith('image/')) {
      fileAttachmentContext = `The student has attached an architectural drawing, sketch, or 3D clay screenshot: "${fileItem.name}".
Examine the image carefully:
1. Identify the massing form, volume, cantilevered slabs, fenestration rhythm, or topography shown.
2. In the "detectedVisualFeatures" JSON array, summarize 2 to 4 prominent architectural features you see in the drawing.
3. In "enhancedPrompt", lock down and elevate the geometry shown in this image into a photorealistic presentation render.`;
    } else {
      fileAttachmentContext = `The student has attached a design document / project brief: "${fileItem.name}".
${fileItem.textPreview ? `Document preview: ${fileItem.textPreview}` : ''}
Extract key programmatic requirements, site constraints, and zoning from this document into the enhanced prompt.`;
    }
  }

  const instructionPrompt = `Here is an architecture student's prompt:
"${userPrompt}"

${fileAttachmentContext}

Analyze this request using model "${chosenModel}" and respond ONLY in valid JSON matching this schema:
{
  "critiquePoints": [
    { "category": "Camera & Perspective", "issue": "What was missing", "solution": "How to fix it" },
    { "category": "Philippine Climate & Passive Design", "issue": "What was missing", "solution": "How to fix it" },
    { "category": "Materiality & Lighting", "issue": "What was missing", "solution": "How to fix it" }
  ],
  "philippineContextNotes": [
    "Tip on Amihan/Habagat or PD 1096",
    "Tip on tropical sun shading or local materials"
  ],
  "detectedVisualFeatures": [
    "Feature detected from prompt or attached image"
  ],
  "enhancedPrompt": "The full, rich, studio-grade prompt ready to paste into Gemini for 8K rendering.",
  "qualityScore": 96
}`;

  if (apiKey) {
    try {
      const rawResponse = await callGeminiApi({
        apiKey,
        model: chosenModel,
        prompt: instructionPrompt,
        fileItem,
        systemInstruction,
      });

      // Extract JSON
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          originalPrompt: userPrompt,
          enhancedPrompt: parsed.enhancedPrompt || generateLocalEnhancedPrompt(userPrompt, fileItem),
          critiquePoints: parsed.critiquePoints || generateLocalCritique(userPrompt, fileItem),
          philippineContextNotes: parsed.philippineContextNotes || [
            'Orient major openings North-South to minimize direct solar heat gain in Philippine tropical sun.',
            'Incorporate Amihan (Northeast) & Habagat (Southwest) breezeways for natural ventilation.',
          ],
          detectedVisualFeatures: parsed.detectedVisualFeatures || (fileItem ? [`Attached ${fileItem.name} analyzed for massing & spatial intent`] : undefined),
          qualityScore: parsed.qualityScore || 95,
        };
      }
    } catch (e) {
      console.warn('Gemini online enhancement failed, falling back to local engine', e);
    }
  }

  // Fallback local architectural prompt enhancement engine
  return {
    originalPrompt: userPrompt,
    enhancedPrompt: generateLocalEnhancedPrompt(userPrompt, fileItem),
    critiquePoints: generateLocalCritique(userPrompt, fileItem),
    philippineContextNotes: [
      'Philippine Tropical Sun: Major glazing oriented North-South; deep 2.5m overhangs prevent high heat gain.',
      'Prevailing Winds: Architectural breezeways positioned to channel Amihan (cool Northeast wind) and Habagat.',
      'Philippine Building Code: Retain mandatory front setbacks (PD 1096) and 1:12 PWD access ramps (BP 344).',
    ],
    detectedVisualFeatures: fileItem
      ? [
          `Reference file attached: ${fileItem.name}`,
          'Volumetric massing proportions locked to prevent AI distortion',
          'Bioclimatic tropical passive strategies applied',
        ]
      : undefined,
    qualityScore: 94,
  };
}

export function generateLocalCritique(raw: string, fileItem?: UploadedFileItem) {
  const points = [];
  const lower = raw.toLowerCase();

  if (fileItem && fileItem.mimeType.startsWith('image/')) {
    points.push({
      category: 'Visual Sketch & Massing Translation',
      issue: 'Standard AI models often distort hand-drawn linework and alter original building proportions.',
      solution: `Locked volumetric geometry and roofline proportions based on attached reference (${fileItem.name}).`,
    });
  }

  const mentionsCamera = lower.includes('lens') || lower.includes('camera') || lower.includes('perspective') || lower.includes('angle');
  if (!mentionsCamera) {
    points.push({
      category: 'Camera & Horizon Control',
      issue: 'Raw prompt lacks architectural camera lens and vertical correction tags, causing AI to generate tilted, warped columns.',
      solution: 'Injected 24mm tilt-shift lens rule with strictly parallel vertical columns (zero keystoning).',
    });
  } else {
    points.push({
      category: 'Camera & Horizon Control',
      issue: 'Camera perspective specified, but lacks strict 2-point perspective zero-keystoning architectural guardrails.',
      solution: 'Locked eye-level 1.6m horizon line with plumb vertical mullions.',
    });
  }

  const mentionsClimate = lower.includes('tropical') || lower.includes('sun') || lower.includes('wind') || lower.includes('overhang') || lower.includes('eaves');
  if (!mentionsClimate) {
    points.push({
      category: 'Philippine Tropical Context',
      issue: 'No solar orientation or passive ventilation specified for Philippine climate conditions.',
      solution: 'Added deep cantilevered roof eaves, vertical timber louvers, and cross-ventilation breezeways for tropical comfort.',
    });
  } else {
    points.push({
      category: 'Philippine Tropical Context',
      issue: 'Tropical elements mentioned, but needs technical passive cooling specifications for board defense.',
      solution: 'Integrated Amihan/Habagat wind capture channels and solar heat-gain prevention overhangs.',
    });
  }

  points.push({
    category: 'Render Engine & Guardrails',
    issue: 'Missing physical shader properties and negative prompt tokens to prevent distorted AI geometry.',
    solution: 'Added V-Ray 6 physically based roughness, 8k uncompressed RAW clarity, and explicit negative guardrails.',
  });

  return points;
}

export function generateLocalEnhancedPrompt(raw: string, fileItem?: UploadedFileItem): string {
  const cleaned = raw.trim() || 'Modern architectural building in tropical setting';
  const fileNote = fileItem
    ? `\n- Visual Reference Translation: Faithfully preserve and elevate the architectural volumes, proportions, and spatial geometry seen in attached file "${fileItem.name}".`
    : '';

  return `**Architectural Visualization Directive: High-Definition Presentation Render**

**Subject & Architectural Concept:**
${cleaned}${fileNote}
- Setting: Philippine tropical modern context with integrated passive environmental strategies.
- Architectural Language: Clean contemporary lines, deep cantilevered roof eaves for monsoon rain protection, vertical timber solar brise-soleil screening, and floor-to-ceiling double-glazed Low-E glass.

**Camera & Perspective Framing (Studio Critical):**
- Viewpoint: Eye-level two-point perspective shot from human height (1.6m horizon line).
- Lens: Shot on an architectural 24mm tilt-shift lens (Hasselblad H6D-100c format).
- **STRICT CONSTRAINT**: All vertical columns, mullions, and wall edges MUST remain strictly parallel and plumb. Zero vertical convergence or perspective keystoning distortion.

**Tropical Lighting & Atmosphere:**
- Golden hour tropical late-afternoon sunlight (3200K) casting soft, elongated 45-degree diagonal shadows that graze textured concrete facade planes.
- Luminous warm 2700K interior cove lighting visibly glowing through the transparent glass, revealing interior volume depth.

**Materiality & Entourage:**
- Materials: Off-form board-formed concrete with tie-rod seams, warm Philippine teak/cedar timber slats, honed travertine pavers, and clear reflective glass.
- Entourage: Indigenous tropical landscaping (Frangipani/Calachuchi, Royal Palms, Monstera Deliciosa), linear reflecting water pool, and 2 to 3 minimalist human scale figures in natural motion blur wearing neutral clothing.

**Output Fidelity & Guardrails:**
- Quality: ArchDaily / Dezeen editorial photography, V-Ray 6 and Octane Render benchmark, razor-sharp 8k resolution, physically based rendering (PBR).
- **NEGATIVE PROMPT (Strict Guardrails):** No warped columns, no curved vertical lines, no sagging roofs, no deformed hands/anatomy, no blurry pixelated textures, no oversaturated fantasy lighting.`;
}

/**
 * Direct In-App Image Rendering:
 * Generates high quality architectural render visual using Imagen 3 / Gemini
 */
export async function generateInAppImage({
  apiKey,
  prompt,
}: {
  apiKey: string;
  prompt: string;
}): Promise<{ imageUrl: string; source: 'gemini-image' | 'imagen-3' } | null> {
  const cleanPrompt = prompt.slice(0, 1000);

  // Strategy 1: Imagen 3 Generate 002
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: cleanPrompt }],
          parameters: { sampleCount: 1, aspectRatio: '16:9' },
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const b64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        return {
          imageUrl: `data:image/png;base64,${b64}`,
          source: 'imagen-3',
        };
      }
    }
  } catch (e) {
    console.warn('Imagen 3.0 predict failed, trying fast generate', e);
  }

  // Strategy 2: Imagen 3 Fast Generate
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: cleanPrompt }],
          parameters: { sampleCount: 1, aspectRatio: '16:9' },
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const b64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        return {
          imageUrl: `data:image/png;base64,${b64}`,
          source: 'imagen-3',
        };
      }
    }
  } catch (e) {
    console.warn('Imagen fast predict failed', e);
  }

  // Strategy 3: Gemini High-Fidelity Architectural SVG Render Visual
  try {
    const svgPrompt = `You are a master architectural renderer and drafting visualizer.
Generate a breathtaking, publication-grade architectural SVG presentation visual (viewBox="0 0 1200 675" for 16:9 widescreen) of:
"${cleanPrompt}"

Visual Rules:
- Include sophisticated architectural gradients for the sky (warm golden hour dusk or crisp daylight).
- Render building massing, cantilevered balconies, tropical wooden brise-soleil louvers, clear glass mullions, and ground floor pilotis.
- Add lush tropical landscaping silhouettes (palms, monstera, frangipani) and reflecting pool.
- Use warm architectural color palettes (board-formed concrete grey, warm cedar timber #C85A32, deep tropical green #2C6E49).
- Return ONLY the clean <svg ... </svg> code without markdown backticks or commentary.`;

    const svgText = await callGeminiApi({
      apiKey,
      model: 'gemini-3.8-flash',
      prompt: svgPrompt,
    });

    const svgMatch = svgText.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      const encodedSvg = encodeURIComponent(svgMatch[0]);
      return {
        imageUrl: `data:image/svg+xml;utf8,${encodedSvg}`,
        source: 'gemini-image',
      };
    }
  } catch (err) {
    console.warn('Architectural SVG generation fallback', err);
  }

  return null;
}

/**
 * Direct In-App Studio Output:
 * Generates the render image and the complete architectural presentation dossier
 * so the student never needs to leave the web app or open another tab!
 */
export async function generateInAppStudioResult({
  apiKey,
  model = getStoredGeminiModel(),
  prompt,
  fileItem,
}: {
  apiKey: string;
  model?: string;
  prompt: string;
  fileItem?: UploadedFileItem;
}): Promise<InAppStudioResult> {
  const chosenModel = model || getStoredGeminiModel() || 'gemini-3.8-flash';

  // Run image generation and presentation dossier concurrently
  const [imageResult, dossierResult] = await Promise.allSettled([
    generateInAppImage({ apiKey, prompt }),
    (async () => {
      const systemInstruction = `You are a distinguished Philippine Architectural Visualization Director and PRC Board Examiner.
Generate an exhaustive, presentation-grade architectural dossier for a design plate, formatted strictly as valid JSON.`;

      const instruction = `The student wants to directly render and generate the full presentation board dossier for this design:
"${prompt}"

Analyze this architectural concept and respond ONLY in valid JSON matching this schema:
{
  "enhancedPrompt": "Pristine, publication-grade professional architectural rendering prompt describing this exact design with 24mm architectural tilt-shift lens, strictly plumb vertical columns, two-point perspective, authentic materiality (board-formed concrete, tropical wood louvers), and warm golden hour sunlight.",
  "conceptStatement": "A compelling 3-4 sentence design philosophy outlining the spatial narrative, vernacular/modern balance, and civic presence.",
  "materialPalette": [
    { "material": "Material name", "application": "Where it is placed on the building", "rationale": "Why chosen for Philippine climate or structure" },
    { "material": "Material name", "application": "Where it is placed", "rationale": "Climate/code benefit" },
    { "material": "Material name", "application": "Where it is placed", "rationale": "Climate/code benefit" },
    { "material": "Material name", "application": "Where it is placed", "rationale": "Climate/code benefit" }
  ],
  "environmentalAnalysis": {
    "solarOrientation": "Technical solar strategy for the Philippine tropical sun (East-West axis, solar overhangs).",
    "windChanneling": "Aerodynamic strategy channeling Amihan (Northeast) & Habagat (Southwest) monsoons.",
    "stormWaterStrategy": "Monsoon rainwater retention, permeable pavers, and flood resilience measures."
  },
  "buildingCodeNotes": [
    "Specific PD 1096 National Building Code compliance note (setbacks, firewall, TOSL, or parking ratio)",
    "BP 344 Accessibility Law compliance note (ramps, tactile paving, corridor clearances)",
    "RA 9514 Fire Code egress / stair pressurization note"
  ],
  "jurorDefenseTips": [
    { "question": "Tough question a university professor or juror will ask during defense?", "suggestedAnswer": "Strong, code-backed defense citing PD 1096 or BP 344." },
    { "question": "Second tough question about structural or site planning?", "suggestedAnswer": "Convincing architectural defense." }
  ]
}`;

      const text = await callGeminiApi({
        apiKey,
        model: chosenModel,
        prompt: instruction,
        fileItem,
        systemInstruction,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse dossier response');
    })(),
  ]);

  const imgData = imageResult.status === 'fulfilled' ? imageResult.value : null;
  const dossier = dossierResult.status === 'fulfilled' ? dossierResult.value : null;

  return {
    imageUrl: imgData?.imageUrl,
    imageSource: imgData?.source || null,
    conceptStatement:
      dossier?.conceptStatement ||
      'This architectural proposal integrates contemporary tectonic clarity with vernacular Philippine bioclimatic principles, prioritizing natural passive cooling, structural honesty, and community accessibility.',
    materialPalette: dossier?.materialPalette || [
      {
        material: 'Off-Form Board-Formed Concrete',
        application: 'Main structural core, podium, and shear walls',
        rationale: 'High thermal mass dampens tropical heat; resilient against typhoons and earthquakes.',
      },
      {
        material: 'Operable Narra / Teak Brise-Soleil',
        application: 'Upper facade screening & deep window reveals',
        rationale: 'Filters high-angle sun glare while permitting continuous Amihan breeze cross-ventilation.',
      },
      {
        material: 'Low-E Insulated Double Glazing',
        application: 'North-facing curtain wall and public atrium',
        rationale: 'Maximizes daylight penetration without high Solar Heat Gain Coefficient (SHGC).',
      },
      {
        material: 'Permeable Travertine & Turf Pavers',
        application: 'Civic pedestrian plaza & parking driveway',
        rationale: 'Prevents heat island effect and complies with PD 1096 USA (Unpaved Surface Area) minimums.',
      },
    ],
    environmentalAnalysis: dossier?.environmentalAnalysis || {
      solarOrientation: 'Longitudinal East-West building axis limits direct solar radiation on broad facade planes.',
      windChanneling: 'Raised ground-floor pilotis and double-height breezeways capture Amihan and Habagat winds.',
      stormWaterStrategy: 'Deep 2.5m cantilevered eaves shed monsoon rains into bioswales and retention cisterns.',
    },
    jurorDefenseTips: dossier?.jurorDefenseTips || [
      {
        question: 'How did you justify your ramp length under BP 344?',
        suggestedAnswer: 'We maintained a strict 1:12 slope with 1.5m level rest landings every 6.0m of run, ensuring full universal accessibility.',
      },
      {
        question: 'How does your design address excessive heat gain in glass atriums?',
        suggestedAnswer: 'Major glazing faces strictly North, shielded by deep horizontal overhangs and Low-E solar coatings to prevent heat entrapment.',
      },
    ],
    buildingCodeNotes: dossier?.buildingCodeNotes || [
      'PD 1096 Sec. 704 & 708: Building conforms to maximum allowable Total Open Space within Lot (TOSL) with 4.5m front setback and 2.0m rear yard clearance.',
      'BP 344 Rule II: Inclusive access provided with 1:12 ramp gradients, 1.5m turning clearances, and dropped curb ramps along pedestrian desire lines.',
      'RA 9514 Fire Code: 2 remote smoke-proof enclosed fire escape stairwells pressurized against smoke infiltration.'
    ],
    enhancedPrompt: dossier?.enhancedPrompt || `Professional architectural photograph of ${prompt.trim()}. Captured with a 24mm architectural tilt-shift lens from human eye-level (1.6m). Vertical columns and mullions are strictly plumb and straight. Warm late afternoon golden hour lighting, authentic board-formed concrete, tropical Philippine landscape. Editorial publication quality for ArchDaily.`,
    modelUsed: chosenModel,
    timestamp: Date.now(),
  };
}

/**
 * Turns uploaded file or study notes into structured ALE review quiz using Gemini API
 */
export async function generateQuizWithGemini({
  apiKey,
  notesText,
  fileItem,
  topicTitle = 'Architecture Review',
  model,
  questionCount = 15,
}: {
  apiKey: string;
  notesText?: string;
  fileItem?: UploadedFileItem;
  topicTitle?: string;
  model?: string;
  questionCount?: number;
}): Promise<{ questions: QuizQuestion[]; flashcards: FlashcardItem[] }> {
  const chosenModel = model || getStoredGeminiModel();
  const numFlashcards = Math.min(questionCount, 15);

  const fullSourceContent = fileItem?.rawText || notesText || '';

  const prompt = `CRITICAL INSTRUCTION — 100% SOURCE GROUNDING & CONTENT RELEVANCE:
You are an expert exam reviewer. You are analyzing an architectural lesson/document titled "${topicTitle}".

MANDATORY REQUIREMENT:
Every single question, distractor, and flashcard MUST BE DIRECTLY AND EXCLUSIVELY EXTRACTED FROM THIS ATTACHED STUDY MATERIAL OR TEXT.
- Do NOT inject generic building laws (e.g. PD 1096, BP 344) UNLESS this uploaded lesson is explicitly about those laws!
- If the uploaded material is about Architectural History, test ONLY the specific buildings, architects, dates, or eras mentioned.
- If the uploaded material is about Structural Design or Materials, test ONLY those structural formulas, loads, and material properties.
- If the uploaded material is about Building Utilities/Plumbing/HVAC, test ONLY those systems.
- Every question must test a concrete concept, formula, rule, definition, or example present in this lesson.
- In the "explanation" field, quote or cite the exact sentence or concept from this uploaded material that proves the answer.

Generate exactly ${questionCount} multiple-choice questions (with 4 choices A-D, where 1 is correct) and ${numFlashcards} key recall flashcards.

Respond strictly as valid JSON with NO markdown backticks:
{
  "questions": [
    {
      "id": "q-1",
      "type": "multiple-choice",
      "question": "Question text testing a concept directly from the provided material?",
      "options": ["Correct answer", "Distractor 1", "Distractor 2", "Distractor 3"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation citing the specific sentence or principle in the uploaded lesson.",
      "codeReference": "Source citation / section title from uploaded notes",
      "category": "${topicTitle}"
    }
  ],
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Specific term, concept, or formula from the lesson",
      "back": "Exact definition or rule from the lesson",
      "category": "${topicTitle}"
    }
  ]
}`;

  const promptToSend = fullSourceContent 
    ? `${prompt}\n\n[UPLOADED LESSON / STUDY MATERIAL - EXTRACT QUESTIONS ONLY FROM THIS]:\n${fullSourceContent.slice(0, 20000)}`
    : prompt;

  const textResponse = await callGeminiApi({
    apiKey,
    model: chosenModel,
    prompt: promptToSend,
    fileItem,
    systemInstruction: 'You are an academic architectural examiner. Your absolute mandate is 100% adherence to the user\'s uploaded document. Never generate questions on external topics not mentioned in the upload.',
  });

  const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse quiz JSON from Gemini response.');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    questions: parsed.questions || [],
    flashcards: parsed.flashcards || [],
  };
}
