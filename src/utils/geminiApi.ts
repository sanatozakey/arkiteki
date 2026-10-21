import type { 
  QuizQuestion, 
  FlashcardItem, 
  UploadedFileItem, 
  PromptCritiqueResult,
  InAppStudioResult,
  DetectedDocumentMetadata,
  ArchitecturalDeliverableType,
  ArchitecturalVisualStyle,
  ArchitecturalCameraView,
  ImageResolution,
  ImageGenerationModelId,
  ArchitecturalDesignSpecification,
  AdditionalArchitecturalView
} from '../types';
import { analyzeTextContentLocally } from './fileParser';
import { generateQuizFromNotes, generateFlashcardsFromNotes } from './quizGenerator';

const STORAGE_KEY = 'arkiteki_gemini_api_key';
const MODEL_STORAGE_KEY = 'arkiteki_gemini_model';
const IMAGE_MODEL_STORAGE_KEY = 'arkiteki_gemini_image_model';
const VISUAL_STYLE_STORAGE_KEY = 'arkiteki_visual_style';
const VIEW_TYPE_STORAGE_KEY = 'arkiteki_view_type';
const RESOLUTION_STORAGE_KEY = 'arkiteki_resolution';

export interface GeminiModelOption {
  id: string;
  name: string;
  badge: string;
  tag: string;
  description: string;
  isPro?: boolean;
}

export const REASONING_MODELS: GeminiModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Recommended • Intelligence & Speed',
    tag: '⚡ 3.8 Flash',
    description: 'Google’s most intelligent flash reasoning model. Superior architectural synthesis, building code analysis (PD 1096, BP 344), and presentation board extraction.',
  },
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    badge: 'Pro User • Deep Reasoning',
    tag: '🧠 4 Argon',
    description: 'Flagship deep reasoning model for complex architectural matrices, building laws (PD 1096, BP 344), and thesis defense.',
    isPro: true,
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    badge: 'Lightweight & Rapid',
    tag: '⚡ 3.5 Lite',
    description: 'Cost-efficient rapid model optimized for high-speed quiz questions, flashcards, and quick topic identification.',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    badge: 'Fast & Stable',
    tag: '⚡ 2.0 Flash',
    description: 'High-speed multimodal vision & prompt refinement for everyday studio plates.',
  },
];

export const GEMINI_MODELS = REASONING_MODELS;

export interface ImageModelOption {
  id: ImageGenerationModelId;
  name: string;
  badge: string;
  tag: string;
  description: string;
  supportedResolutions: ImageResolution[];
  supportsReferenceImage: boolean;
}

export const IMAGE_GENERATION_MODELS: ImageModelOption[] = [
  {
    id: 'gemini-nano-banana-2.1',
    name: 'Gemini Nano Banana 2.1',
    badge: 'Recommended • High Photorealism',
    tag: '🍌 Nano Banana 2.1',
    description: 'Google’s primary native image generation & sketch-to-render model. Delivers superior architectural texture rendering, physical material realism, and reference conditioning across 1K, 2K, and 4K resolutions.',
    supportedResolutions: ['1K', '2K', '4K'],
    supportsReferenceImage: true,
  },
  {
    id: 'gemini-3-pro-image',
    name: 'Gemini 3 Pro Image',
    badge: 'Flagship • Precision CGI',
    tag: '✨ 3 Pro Image',
    description: 'Flagship image generation model for the most intricate architectural plates, ray-traced glass reflections, complex massing, and global lighting accuracy.',
    supportedResolutions: ['1K', '2K', '4K'],
    supportsReferenceImage: true,
  },
  {
    id: 'gemini-3.1-flash-image',
    name: 'Gemini 3.1 Flash Image',
    badge: 'Fast & Efficient',
    tag: '⚡ 3.1 Flash Image',
    description: 'High-speed image generation model balancing prompt responsiveness with solid architectural fidelity.',
    supportedResolutions: ['1K', '2K'],
    supportsReferenceImage: true,
  },
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Gemini 3.1 Flash Lite Image',
    badge: 'Ultra Fast',
    tag: '⚡ 3.1 Lite Image',
    description: 'Ultra-fast draft image model for rapid conceptual ideation.',
    supportedResolutions: ['1K'],
    supportsReferenceImage: false,
  },
];

export const ARCHITECTURAL_VISUAL_STYLES: Record<
  ArchitecturalVisualStyle,
  { label: string; description: string; promptModifier: string }
> = {
  photography: {
    label: 'Photorealistic Architectural Photography',
    description: 'Professional architectural camera, tilt-shift lens, natural light, ArchDaily editorial publication standard',
    promptModifier:
      'Ultra-photorealistic architectural photograph, shot on professional camera with tilt-shift lens, strictly plumb vertical lines, natural atmospheric daylight, editorial architectural publication quality for ArchDaily and Architectural Digest.',
  },
  'vray-cgi': {
    label: 'High-End CGI (V-Ray / Corona Renderer)',
    description: 'Physically based rendering (PBR), ray-traced glass reflections, ambient occlusion, global illumination',
    promptModifier:
      'Physically based architectural CGI render produced in Chaos V-Ray and Corona Renderer, ray-traced glass reflections, accurate ambient occlusion, micro-surface imperfections, global illumination, high-end architectural visualization firm quality.',
  },
  'golden-hour': {
    label: 'Golden Hour Sunlight',
    description: 'Warm late-afternoon sunlight, rich directional shadows, warm interior glow',
    promptModifier:
      'Warm late-afternoon golden hour sunlight, low sun angle casting long soft directional shadows, warm ambient highlights, warm interior lighting softly glowing through transparent fenestration.',
  },
  'dusk-bluehour': {
    label: 'Dramatic Dusk / Blue Hour',
    description: 'Deep cobalt twilight sky, warmly illuminated interior spaces, exterior architectural accent lighting',
    promptModifier:
      'Dramatic twilight blue hour architectural lighting, deep rich cobalt blue sky, warmly illuminated interior spaces, subtle architectural accent lighting highlighting exterior facade textures and reflective surfaces.',
  },
  overcast: {
    label: 'Bright Overcast Daylight',
    description: 'Diffused soft lighting, balanced material exposure, natural ambient illumination',
    promptModifier:
      'Bright overcast daylight, soft diffused atmospheric illumination with zero harsh glare, perfectly balanced exposure revealing subtle material textures and surrounding environment.',
  },
};

export const ARCHITECTURAL_CAMERA_VIEWS: Record<
  ArchitecturalCameraView,
  { label: string; description: string; promptModifier: string }
> = {
  'hero-perspective': {
    label: 'Hero Two-Point Perspective',
    description: 'Eye-level architectural perspective with plumb verticals and balanced framing',
    promptModifier:
      'Eye-level pedestrian two-point architectural perspective (1.6m camera height), tilt-shift lens alignment, zero vertical convergence, strictly parallel and plumb vertical lines, balanced composition capturing primary facade and entrance.',
  },
  'front-elevation': {
    label: 'Front Elevation Perspective',
    description: 'Orthogonal front perspective emphasizing facade rhythm and structural composition',
    promptModifier:
      'Orthogonal front elevation architectural perspective, balanced facade rhythm, clearly articulated structural bay modules, fenestration grid, and primary entrance hierarchy.',
  },
  'aerial-drone': {
    label: 'Three-Quarter Aerial View',
    description: 'Elevated 45-degree perspective showing building massing, roof form, and context',
    promptModifier:
      'Elevated three-quarter aerial drone architectural perspective (45-degree angle), showcasing overall building massing, roof geometry, site circulation, and contextual site integration.',
  },
  'eye-level-plaza': {
    label: 'Pedestrian Street / Plaza View',
    description: 'Ground-level perspective capturing building approach and human scale',
    promptModifier:
      'Pedestrian eye-level perspective from ground level, capturing the primary building approach, human scale entourage, and seamless ground plane integration.',
  },
  'facade-detail': {
    label: 'Architectural Facade & Material Detail',
    description: 'Close-up vignette focusing on envelope materials, joinery, and tectonic depth',
    promptModifier:
      'Close-up architectural detail shot of the exterior envelope, focusing on authentic material textures, architectural joinery, shadow depth, tectonic articulation, and craftsmanship.',
  },
};

export const CAMERA_VIEW_KEYS: ArchitecturalCameraView[] = [
  'hero-perspective',
  'front-elevation',
  'aerial-drone',
  'eye-level-plaza',
  'facade-detail',
];

export const VISUAL_STYLE_KEYS: ArchitecturalVisualStyle[] = [
  'photography',
  'vray-cgi',
  'golden-hour',
  'dusk-bluehour',
  'overcast',
];

export const IMAGE_RESOLUTIONS: { id: ImageResolution; label: string; width: number; height: number }[] = [
  { id: '2K', label: '2K High-Definition (2048px)', width: 2048, height: 1152 },
  { id: '1K', label: '1K Standard (1024px)', width: 1024, height: 576 },
  { id: '4K', label: '4K Ultra-Sharp (4096px)', width: 4096, height: 2304 },
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
    if (!stored || stored.includes('2.5') || stored.includes('1.5-pro')) {
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

export function getStoredImageModel(): ImageGenerationModelId {
  try {
    const val = localStorage.getItem(IMAGE_MODEL_STORAGE_KEY);
    if (val && IMAGE_GENERATION_MODELS.some((m) => m.id === val)) {
      return val as ImageGenerationModelId;
    }
    return 'gemini-nano-banana-2.1';
  } catch {
    return 'gemini-nano-banana-2.1';
  }
}

export function setStoredImageModel(modelId: ImageGenerationModelId): void {
  try {
    localStorage.setItem(IMAGE_MODEL_STORAGE_KEY, modelId);
  } catch (e) {
    console.error('Failed to save image model', e);
  }
}

export function getStoredVisualStyle(): ArchitecturalVisualStyle {
  try {
    const val = localStorage.getItem(VISUAL_STYLE_STORAGE_KEY);
    if (val && val in ARCHITECTURAL_VISUAL_STYLES) return val as ArchitecturalVisualStyle;
    return 'photography';
  } catch {
    return 'photography';
  }
}

export function setStoredVisualStyle(style: ArchitecturalVisualStyle): void {
  try {
    localStorage.setItem(VISUAL_STYLE_STORAGE_KEY, style);
  } catch (e) {
    console.warn('Failed to save visual style', e);
  }
}

export function getStoredCameraView(): ArchitecturalCameraView {
  try {
    const val = localStorage.getItem(VIEW_TYPE_STORAGE_KEY);
    if (val && val in ARCHITECTURAL_CAMERA_VIEWS) return val as ArchitecturalCameraView;
    return 'hero-perspective';
  } catch {
    return 'hero-perspective';
  }
}

export function setStoredCameraView(view: ArchitecturalCameraView): void {
  try {
    localStorage.setItem(VIEW_TYPE_STORAGE_KEY, view);
  } catch (e) {
    console.warn('Failed to save camera view', e);
  }
}

export function getStoredResolution(): ImageResolution {
  try {
    const val = localStorage.getItem(RESOLUTION_STORAGE_KEY);
    if (val === '1K' || val === '2K' || val === '4K') return val;
    return '2K';
  } catch {
    return '2K';
  }
}

export function setStoredResolution(res: ImageResolution): void {
  try {
    localStorage.setItem(RESOLUTION_STORAGE_KEY, res);
  } catch (e) {
    console.warn('Failed to save resolution', e);
  }
}

/**
 * Call Google Gemini API directly using the user's connected API Key.
 * Supports multimodal inputs (PDFs, images, audio, video) and automatic deprecation fallback.
 */
export async function callGeminiApi({
  apiKey,
  prompt,
  fileItem,
  systemInstruction,
  model,
  responseSchema,
  temperature = 0.4,
  maxOutputTokens = 8192,
}: {
  apiKey: string;
  prompt: string;
  fileItem?: UploadedFileItem;
  systemInstruction?: string;
  model?: string;
  responseSchema?: any;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const chosenModel = model || getStoredGeminiModel() || 'gemini-3.8-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${apiKey}`;

  const parts: any[] = [];

  // Pass supported binary files (PDF, image, audio) as inlineData
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

  // Include extracted text if available (especially for DOCX or pre-extracted PDF text)
  let fullPrompt = prompt;
  if (fileItem && fileItem.rawText && fileItem.mimeType !== 'text/plain') {
    fullPrompt = `${prompt}\n\n[Extracted Document Content for "${fileItem.name}"]:\n${fileItem.rawText.slice(0, 30000)}`;
  } else if (fileItem && !isSupportedMime && fileItem.textPreview) {
    fullPrompt = `${prompt}\n\n[Reference Material Attached: "${fileItem.name}"]:\n${fileItem.textPreview}`;
  }

  parts.push({ text: fullPrompt });

  const generationConfig: any = {
    temperature,
    maxOutputTokens,
  };

  if (responseSchema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = responseSchema;
  }

  const requestBody: any = {
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    generationConfig,
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

    // Auto-fallback: if the requested model is deprecated, restricted, or not found,
    // seamlessly fall back to 'gemini-3.8-flash' or 'gemini-2.0-flash'!
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
        responseSchema,
        temperature,
        maxOutputTokens,
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
 * Automatic Subject & Topic Detection using Gemini AI
 * Extracts real subject, secondary topics, key terms, and difficulty from document content.
 */
export async function detectTopicsWithGemini({
  apiKey,
  fileItem,
  rawText,
  model = 'gemini-3.8-flash',
}: {
  apiKey: string;
  fileItem?: UploadedFileItem;
  rawText?: string;
  model?: string;
}): Promise<DetectedDocumentMetadata> {
  const contentSnippet = (fileItem?.rawText || rawText || fileItem?.textPreview || '').slice(0, 15000);

  const prompt = `Analyze the provided architectural or educational document material.
Determine its exact subject and core contents based strictly on the text provided.

Do NOT guess Philippine Building Laws unless the text is specifically about Philippine Building Laws.
If the text is about architectural history, identify the exact movement, architects, or buildings.
If the text is about structural design, identify the structural principles.
If the text is about a specific project brief, identify the typology and site requirements.

Respond ONLY with a valid JSON object matching this schema:
{
  "title": "A precise, informative document title (e.g. 'PD 1096 Rule VII & VIII Reviewer' or 'Baroque Architecture in Europe')",
  "primarySubject": "The primary academic subject (e.g. 'Building Laws & Regulations' or 'Architectural History')",
  "secondaryTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
  "keyTermsAndConcepts": ["Term 1", "Term 2", "Term 3", "Term 4", "Term 5"],
  "estimatedDifficulty": "Easy" | "Moderate" | "Challenging" | "Board-Exam Level",
  "summary": "A concise 2-sentence summary of what this document covers.",
  "sourceConfidence": 0.95
}`;

  try {
    const rawResponse = await callGeminiApi({
      apiKey,
      model,
      prompt,
      fileItem,
      systemInstruction: 'You are an academic curriculum director and architectural board exam examiner. You extract high-precision topic classifications from study material without hallucinations.',
      temperature: 0.2,
    });

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.title && parsed.primarySubject) {
        return {
          title: parsed.title,
          primarySubject: parsed.primarySubject,
          secondaryTopics: Array.isArray(parsed.secondaryTopics) ? parsed.secondaryTopics : ['Core Principles', 'Definitions', 'Applications'],
          keyTermsAndConcepts: Array.isArray(parsed.keyTermsAndConcepts) ? parsed.keyTermsAndConcepts : ['Principle 1', 'Principle 2'],
          estimatedDifficulty: parsed.estimatedDifficulty || 'Board-Exam Level',
          summary: parsed.summary || 'Uploaded architectural reference material.',
          sourceConfidence: parsed.sourceConfidence || 0.95,
        };
      }
    }
  } catch (err) {
    console.warn('Gemini topic detection failed, using local analyzer:', err);
  }

  // Fallback to local heuristic analyzer
  return analyzeTextContentLocally(contentSnippet, fileItem?.name || 'Uploaded Document');
}

/**
 * Strict Question Count Enforcement & 100% Grounded Quiz Generation
 * Guarantees exactly 15, 25, 50, or custom requested questions.
 */
export async function generateQuizWithGemini({
  apiKey,
  notesText,
  fileItem,
  topicTitle = 'Architecture Review',
  model,
  questionCount = 15,
  detectedMetadata,
}: {
  apiKey: string;
  notesText?: string;
  fileItem?: UploadedFileItem;
  topicTitle?: string;
  model?: string;
  questionCount?: number;
  detectedMetadata?: DetectedDocumentMetadata;
}): Promise<{ questions: QuizQuestion[]; flashcards: FlashcardItem[] }> {
  const chosenModel = model || getStoredGeminiModel();
  const targetCount = Math.max(5, Math.min(questionCount, 100)); // Clamp between 5 and 100
  const numFlashcards = Math.min(targetCount, 25);

  const fullSourceContent = fileItem?.rawText || notesText || '';
  const effectiveSubject = detectedMetadata?.primarySubject || topicTitle;

  const prompt = `CRITICAL INSTRUCTION — 100% SOURCE GROUNDING & STRICT COUNT ENFORCEMENT:
You are an expert exam reviewer. You are analyzing an architectural lesson/document titled "${detectedMetadata?.title || topicTitle}".
Primary Subject: ${effectiveSubject}.

MANDATORY REQUIREMENTS:
1. STRICT COUNT: You MUST generate EXACTLY ${targetCount} multiple-choice questions. Not ${targetCount - 1}, not ${targetCount + 1}. Exactly ${targetCount}.
2. 100% SOURCE GROUNDED: Every question, distractor, and flashcard MUST BE DIRECTLY AND EXCLUSIVELY EXTRACTED FROM THE ATTACHED STUDY MATERIAL OR EXTRACTED TEXT.
   - Do NOT inject generic building laws (e.g. PD 1096, BP 344) UNLESS this uploaded lesson is explicitly about those laws!
   - If the material is about Architectural History, test ONLY the specific buildings, architects, dates, or eras mentioned.
   - If the material is about Structural Design or Materials, test ONLY those structural formulas, loads, and material properties.
   - If the material is about Building Utilities/Plumbing/HVAC, test ONLY those systems.
3. STRUCTURE:
   - Each question must have 4 distinct options (A, B, C, D).
   - "correctAnswer" must be an integer index (0, 1, 2, or 3) pointing to the single correct option.
   - "explanation" must cite or quote the specific sentence or principle from the source material that proves the answer.
   - "sourceReference" must specify the page number, section heading, or article if available.
   - "difficulty" should be "Easy", "Moderate", "Challenging", or "Board-Exam Level".
4. FLASHCARDS: Generate ${numFlashcards} key recall flashcards directly from the material.

Respond strictly as a valid JSON object with NO markdown backticks:
{
  "questions": [
    {
      "id": "q-1",
      "type": "multiple-choice",
      "question": "Question text testing a concept directly from the provided material?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation citing the specific sentence or principle in the uploaded lesson.",
      "sourceReference": "Section heading or page citation",
      "category": "${effectiveSubject}",
      "difficulty": "Board-Exam Level"
    }
  ],
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Specific term, concept, or formula from the lesson",
      "back": "Exact definition or rule from the lesson",
      "category": "${effectiveSubject}"
    }
  ]
}`;

  const promptToSend = fullSourceContent 
    ? `${prompt}\n\n[UPLOADED LESSON / STUDY MATERIAL - EXTRACT QUESTIONS ONLY FROM THIS]:\n${fullSourceContent.slice(0, 35000)}`
    : prompt;

  const textResponse = await callGeminiApi({
    apiKey,
    model: chosenModel,
    prompt: promptToSend,
    fileItem,
    systemInstruction: 'You are an academic architectural examiner. Your absolute mandate is 100% adherence to the user\'s uploaded document. Generate the exact requested question count. Never invent facts or hallucinate external topics.',
    temperature: 0.3,
    maxOutputTokens: 8192,
  });

  const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse quiz JSON from Gemini response.');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  let rawQuestions: any[] = Array.isArray(parsed.questions) ? parsed.questions : [];
  let flashcards: FlashcardItem[] = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];

  // Validate and clean each question
  const validQuestions: QuizQuestion[] = [];
  const seenQuestionTexts = new Set<string>();

  for (let i = 0; i < rawQuestions.length; i++) {
    const q = rawQuestions[i];
    if (
      q &&
      typeof q.question === 'string' &&
      q.question.trim().length > 10 &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 &&
      q.correctAnswer <= 3
    ) {
      const normalizedQ = q.question.trim().toLowerCase();
      if (!seenQuestionTexts.has(normalizedQ)) {
        seenQuestionTexts.add(normalizedQ);
        validQuestions.push({
          id: `q-${validQuestions.length + 1}`,
          type: 'multiple-choice',
          question: q.question.trim(),
          options: q.options.map((opt: any) => String(opt).trim()),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || `Correct answer verified from ${effectiveSubject}.`,
          category: q.category || effectiveSubject,
          sourceReference: q.sourceReference || detectedMetadata?.title || effectiveSubject,
          difficulty: q.difficulty || 'Board-Exam Level',
        });
      }
    }
  }

  // --- Strict Count Enforcement Loop ---
  // If Gemini returned too many questions: slice to exact target count
  if (validQuestions.length >= targetCount) {
    return {
      questions: validQuestions.slice(0, targetCount),
      flashcards: flashcards.slice(0, numFlashcards),
    };
  }

  // If Gemini returned fewer questions than requested: generate missing questions
  const missingCount = targetCount - validQuestions.length;
  console.warn(`Gemini returned ${validQuestions.length} of ${targetCount} requested questions. Recovering ${missingCount} missing questions...`);

  if (missingCount > 0 && fullSourceContent.length > 50) {
    try {
      const existingTopics = validQuestions.map((q) => q.question.slice(0, 40)).join(' | ');
      const recoveryPrompt = `We need ${missingCount} ADDITIONAL distinct multiple-choice questions from the uploaded material to reach the user's requested exam count of ${targetCount}.
Material Subject: ${effectiveSubject}.
The following questions have already been generated; do NOT repeat them:
[${existingTopics}]

Generate exactly ${missingCount} NEW multiple-choice questions grounded in uncovered sections of the text.
Respond strictly in JSON matching { "questions": [...] }`;

      const recoveryResponse = await callGeminiApi({
        apiKey,
        model: chosenModel,
        prompt: `${recoveryPrompt}\n\n[STUDY MATERIAL]:\n${fullSourceContent.slice(0, 30000)}`,
        fileItem,
        temperature: 0.4,
      });

      const recoveryMatch = recoveryResponse.match(/\{[\s\S]*\}/);
      if (recoveryMatch) {
        const recoveryParsed = JSON.parse(recoveryMatch[0]);
        if (Array.isArray(recoveryParsed.questions)) {
          for (const rq of recoveryParsed.questions) {
            if (validQuestions.length >= targetCount) break;
            if (
              rq &&
              typeof rq.question === 'string' &&
              Array.isArray(rq.options) &&
              rq.options.length === 4
            ) {
              const normQ = rq.question.trim().toLowerCase();
              if (!seenQuestionTexts.has(normQ)) {
                seenQuestionTexts.add(normQ);
                validQuestions.push({
                  id: `q-${validQuestions.length + 1}`,
                  type: 'multiple-choice',
                  question: rq.question.trim(),
                  options: rq.options.map((opt: any) => String(opt).trim()),
                  correctAnswer: typeof rq.correctAnswer === 'number' ? rq.correctAnswer : 0,
                  explanation: rq.explanation || `Derived from lesson material on ${effectiveSubject}.`,
                  category: rq.category || effectiveSubject,
                  sourceReference: rq.sourceReference || effectiveSubject,
                  difficulty: rq.difficulty || 'Board-Exam Level',
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Recovery pass failed, falling back to local synthesis:', err);
    }
  }

  // If still missing questions, synthesize from source text using grounded local generator
  if (validQuestions.length < targetCount) {
    const remainingNeeded = targetCount - validQuestions.length;
    const localFiller = generateQuizFromNotes(fullSourceContent, effectiveSubject, remainingNeeded * 2);
    for (const fq of localFiller.questions) {
      if (validQuestions.length >= targetCount) break;
      const normQ = fq.question.trim().toLowerCase();
      if (!seenQuestionTexts.has(normQ)) {
        seenQuestionTexts.add(normQ);
        validQuestions.push({
          ...fq,
          id: `q-${validQuestions.length + 1}`,
        });
      }
    }
  }

  // Ensure flashcards meet count
  if (flashcards.length === 0) {
    const localResult = generateQuizFromNotes(fullSourceContent, effectiveSubject, numFlashcards);
    flashcards = localResult.flashcards;
  }

  return {
    questions: validQuestions.slice(0, targetCount),
    flashcards: flashcards.slice(0, numFlashcards),
  };
}

/**
 * Strict Flashcard Count Enforcement & 100% Grounded Flashcard Generation
 * Guarantees exactly 15, 25, 50, or custom requested flashcards.
 */
export async function generateFlashcardsWithGemini({
  apiKey,
  notesText,
  fileItem,
  topicTitle = 'Architecture Review',
  model,
  flashcardCount = 15,
  detectedMetadata,
}: {
  apiKey: string;
  notesText?: string;
  fileItem?: UploadedFileItem;
  topicTitle?: string;
  model?: string;
  flashcardCount?: number;
  detectedMetadata?: DetectedDocumentMetadata;
}): Promise<FlashcardItem[]> {
  const chosenModel = model || getStoredGeminiModel();
  const targetCount = Math.max(5, Math.min(flashcardCount, 100)); // Clamp between 5 and 100

  const fullSourceContent = fileItem?.rawText || notesText || '';
  const effectiveSubject = detectedMetadata?.primarySubject || topicTitle;

  const prompt = `CRITICAL INSTRUCTION — 100% SOURCE GROUNDING & STRICT COUNT ENFORCEMENT:
You are an expert Philippine Architecture Licensure Examination reviewer. You are analyzing study material titled "${detectedMetadata?.title || topicTitle}".
Primary Subject: ${effectiveSubject}.

MANDATORY REQUIREMENTS:
1. STRICT COUNT: You MUST generate EXACTLY ${targetCount} high-yield study flashcards. Not ${targetCount - 1}, not ${targetCount + 1}. Exactly ${targetCount}.
2. 100% SOURCE GROUNDED: Every flashcard front and back MUST BE DIRECTLY AND EXCLUSIVELY EXTRACTED FROM THE ATTACHED STUDY MATERIAL OR EXTRACTED TEXT.
   - If the material is about BP 344, focus on exact accessibility dimensions, slopes, clearances, and fixtures.
   - If the material is about PD 1096, focus on setbacks, AMBF, TOSL, ceiling heights, parking dimensions, and zoning.
   - If the material is about Architectural History, focus on National Artists, buildings, dates, movements, and vernacular features.
   - If the document is about another specific topic, test ONLY that document's concepts and terms.
3. STRUCTURE:
   - "front": A concise key term, concept, dimensional question, or regulatory provision (e.g. "BP 344 Maximum Accessible Ramp Slope").
   - "back": The exact specification, answer, numerical requirement, formula, or building code rule (e.g. "1:12 (8.33%) maximum gradient with 1.50m level rest landings every 6.00 meters").
   - "category": The section heading, code article, or subject (e.g. "${effectiveSubject}").

Respond strictly as a valid JSON object with NO markdown backticks:
{
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Specific term, dimension, or architectural rule",
      "back": "Exact definition, numerical requirement, or formula",
      "category": "${effectiveSubject}"
    }
  ]
}`;

  const promptToSend = fullSourceContent
    ? `${prompt}\n\n[UPLOADED LESSON / STUDY MATERIAL - EXTRACT FLASHCARDS ONLY FROM THIS]:\n${fullSourceContent.slice(0, 35000)}`
    : prompt;

  let parsedCards: FlashcardItem[] = [];

  try {
    const textResponse = await callGeminiApi({
      apiKey,
      model: chosenModel,
      prompt: promptToSend,
      fileItem,
      systemInstruction: 'You are an academic architectural examiner. Generate the exact requested count of recall flashcards grounded 100% in the uploaded study material.',
      temperature: 0.3,
      maxOutputTokens: 8192,
    });

    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.flashcards)) {
        const seenFronts = new Set<string>();
        for (const item of parsed.flashcards) {
          if (item && item.front && item.back) {
            const norm = String(item.front).trim().toLowerCase();
            if (!seenFronts.has(norm)) {
              seenFronts.add(norm);
              parsedCards.push({
                id: `fc-${parsedCards.length + 1}`,
                front: String(item.front).trim(),
                back: String(item.back).trim(),
                category: item.category || effectiveSubject,
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Gemini flashcard generation error, using fallback:', err);
  }

  // If we have enough cards, return exactly targetCount
  if (parsedCards.length >= targetCount) {
    return parsedCards.slice(0, targetCount);
  }

  // If missing cards, supplement with local grounded synthesizer
  const localCards = generateFlashcardsFromNotes(fullSourceContent, effectiveSubject, targetCount);
  const seenFronts = new Set(parsedCards.map((c) => c.front.trim().toLowerCase()));

  for (const card of localCards) {
    if (parsedCards.length >= targetCount) break;
    const norm = card.front.trim().toLowerCase();
    if (!seenFronts.has(norm)) {
      seenFronts.add(norm);
      parsedCards.push({
        ...card,
        id: `fc-${parsedCards.length + 1}`,
      });
    }
  }

  return parsedCards.slice(0, targetCount);
}


/**
 * Classifies the architectural intent of the user request
 */
export function classifyArchitecturalIntent(
  userPrompt: string,
  hasAttachedImage: boolean
): ArchitecturalDeliverableType {
  const lower = userPrompt.toLowerCase();

  if (hasAttachedImage) {
    if (lower.includes('render') || lower.includes('photo') || lower.includes('facade') || lower.includes('sketch')) {
      return 'sketch-redesign';
    }
  }

  if (
    lower.includes('floor plan') ||
    lower.includes('floorplan') ||
    lower.includes('site plan') ||
    lower.includes('layout') ||
    lower.includes('zoning') ||
    lower.includes('spatial organization')
  ) {
    return 'floor-plan';
  }

  if (
    lower.includes('interior') ||
    lower.includes('living room') ||
    lower.includes('lobby') ||
    lower.includes('atrium') ||
    lower.includes('bedroom') ||
    lower.includes('indoor')
  ) {
    return 'interior-render';
  }

  if (
    lower.includes('elevation') ||
    lower.includes('section') ||
    lower.includes('facade detail') ||
    lower.includes('cross-section')
  ) {
    return 'elevation-section';
  }

  if (
    lower.includes('board') ||
    lower.includes('presentation') ||
    lower.includes('dossier') ||
    lower.includes('thesis') ||
    lower.includes('plate')
  ) {
    return 'presentation-board';
  }

  return 'exterior-render';
}

/**
 * Generates an architectural CAD-style SVG linework plan with dimensions,
 * room names, north arrow, scale bar, and legend.
 */
export function generateArchitecturalFloorPlanSvg(title: string): string {
  const cleanTitle = title.slice(0, 35) || 'ARCHITECTURAL CONCEPT PLAN';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%" style="background:#FAF8F5; font-family:'Courier New', monospace;">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2DDD5" stroke-width="0.5"/>
    </pattern>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2C6E49" />
    </marker>
  </defs>

  <!-- Background Grid -->
  <rect width="1200" height="800" fill="url(#grid)" />

  <!-- Drawing Title Block -->
  <rect x="50" y="40" width="1100" height="60" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="1.5" />
  <text x="70" y="75" font-size="18" font-weight="bold" fill="#1A1A1A" letter-spacing="2">ARKITEKI ARCHITECTURAL STUDIO • ${cleanTitle.toUpperCase()}</text>
  <text x="70" y="92" font-size="11" fill="#666666">SCALE 1:100 • ORIENTATION: NORTH-SOUTH AXIS • COMPLIANT WITH PD 1096 &amp; BP 344</text>
  <text x="1000" y="75" font-size="14" font-weight="bold" fill="#2C6E49">SHEET A-101</text>

  <!-- North Arrow & Wind Symbols -->
  <g transform="translate(1080, 160)">
    <circle cx="0" cy="0" r="28" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="1.5" />
    <polygon points="0,-24 7,-4 0,0 -7,-4" fill="#2C6E49" />
    <polygon points="0,0 7,4 0,24 -7,4" fill="#EAE5D9" stroke="#1A1A1A" stroke-width="0.5" />
    <text x="-4" y="-28" font-size="12" font-weight="bold" fill="#1A1A1A">N</text>
    <text x="-25" y="45" font-size="9" fill="#2C6E49" font-weight="bold">AMIHAN ↗</text>
    <text x="-25" y="58" font-size="9" fill="#C85A32" font-weight="bold">↙ HABAGAT</text>
  </g>

  <!-- Property Boundary / Setbacks -->
  <rect x="100" y="130" width="940" height="600" fill="none" stroke="#999999" stroke-width="1" stroke-dasharray="8,6" />
  <text x="110" y="150" font-size="10" fill="#888888">PROPERTY BOUNDARY / 4.5m FRONT SETBACK (PD 1096)</text>

  <!-- Building Walls (Outer Envelope) -->
  <rect x="180" y="190" width="780" height="480" fill="#F4EFE6" stroke="#1A1A1A" stroke-width="3" />

  <!-- Room 1: Public Civic Atrium & Breezeway -->
  <rect x="200" y="210" width="340" height="260" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="2" />
  <text x="280" y="320" font-size="14" font-weight="bold" fill="#1A1A1A">CIVIC ATRIUM</text>
  <text x="290" y="340" font-size="11" fill="#666666">DOUBLE HEIGHT</text>
  <text x="275" y="358" font-size="10" fill="#2C6E49">A = 88.4 SQ.M</text>

  <!-- Room 2: Multi-Purpose Council Chamber -->
  <rect x="560" y="210" width="380" height="260" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="2" />
  <text x="680" y="320" font-size="14" font-weight="bold" fill="#1A1A1A">COUNCIL CHAMBER</text>
  <text x="710" y="340" font-size="11" fill="#666666">CAP. 120 PAX</text>
  <text x="700" y="358" font-size="10" fill="#2C6E49">A = 98.8 SQ.M</text>

  <!-- Room 3: Administrative Services & Records -->
  <rect x="200" y="490" width="450" height="160" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="2" />
  <text x="350" y="565" font-size="13" font-weight="bold" fill="#1A1A1A">ADMINISTRATIVE OFFICES</text>
  <text x="400" y="585" font-size="10" fill="#2C6E49">A = 72.0 SQ.M</text>

  <!-- Room 4: Accessible PWD Comfort Rooms & Service Core -->
  <rect x="670" y="490" width="270" height="160" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="2" />
  <text x="730" y="565" font-size="13" font-weight="bold" fill="#1A1A1A">PWD TOILET &amp; CORE</text>
  <text x="750" y="585" font-size="10" fill="#C85A32">BP 344 COMPLIANT</text>

  <!-- BP 344 Accessible Ramp (1:12 Gradient) -->
  <g transform="translate(180, 675)">
    <rect x="0" y="0" width="300" height="35" fill="#E2DDD5" stroke="#1A1A1A" stroke-width="1.5" />
    <line x1="15" y1="17" x2="285" y2="17" stroke="#2C6E49" stroke-width="2" marker-end="url(#arrow)" />
    <text x="40" y="22" font-size="10" font-weight="bold" fill="#1A1A1A">PWD ACCESS RAMP (SLOPE 1:12, W = 1.50m)</text>
  </g>

  <!-- Dimension Strings -->
  <line x1="200" y1="180" x2="540" y2="180" stroke="#1A1A1A" stroke-width="1" />
  <line x1="200" y1="175" x2="200" y2="185" stroke="#1A1A1A" stroke-width="1" />
  <line x1="540" y1="175" x2="540" y2="185" stroke="#1A1A1A" stroke-width="1" />
  <text x="345" y="174" font-size="10" fill="#1A1A1A">8.50 m</text>

  <line x1="560" y1="180" x2="940" y2="180" stroke="#1A1A1A" stroke-width="1" />
  <line x1="560" y1="175" x2="560" y2="185" stroke="#1A1A1A" stroke-width="1" />
  <line x1="940" y1="175" x2="940" y2="185" stroke="#1A1A1A" stroke-width="1" />
  <text x="725" y="174" font-size="10" fill="#1A1A1A">9.50 m</text>

  <!-- Scale Bar -->
  <g transform="translate(100, 755)">
    <rect x="0" y="0" width="50" height="6" fill="#1A1A1A" />
    <rect x="50" y="0" width="50" height="6" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="0.5" />
    <rect x="100" y="0" width="50" height="6" fill="#1A1A1A" />
    <rect x="150" y="0" width="50" height="6" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="0.5" />
    <text x="0" y="18" font-size="9" fill="#1A1A1A">0</text>
    <text x="45" y="18" font-size="9" fill="#1A1A1A">1m</text>
    <text x="95" y="18" font-size="9" fill="#1A1A1A">2m</text>
    <text x="145" y="18" font-size="9" fill="#1A1A1A">3m</text>
    <text x="195" y="18" font-size="9" fill="#1A1A1A">4m</text>
  </g>
</svg>`;
}

/**
 * Procedural architectural perspective visual renderer.
 * Produces crisp, beautiful tropical modern architecture with 2-point perspective,
 * cantilevered roof eaves, teak brise-soleil slats, glazed glass reflections,
 * board-formed concrete textures, and lush tropical entourage.
 */
export function generateArchitecturalPerspectiveSvg(
  prompt: string,
  aspectRatio: '16:9' | '4:3' | '1:1' = '16:9'
): string {
  const width = 1200;
  const height = aspectRatio === '1:1' ? 1200 : aspectRatio === '4:3' ? 900 : 675;
  const cleanTitle = prompt.slice(0, 45).replace(/[<>&"']/g, '') || 'MODERN PHILIPPINE ARCHITECTURE';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="font-family:'Segoe UI', system-ui, sans-serif;">
  <defs>
    <!-- Sky & Atmosphere Gradients -->
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2B4C6F" />
      <stop offset="35%" stop-color="#6E8EAF" />
      <stop offset="65%" stop-color="#DFBD99" />
      <stop offset="90%" stop-color="#E8A87C" />
      <stop offset="100%" stop-color="#FAF4EB" />
    </linearGradient>

    <!-- Golden Sun Glare -->
    <radialGradient id="sunGlow" cx="80%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#FFF6D6" stop-opacity="0.9" />
      <stop offset="30%" stop-color="#FFD180" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#FFD180" stop-opacity="0" />
    </radialGradient>

    <!-- Glass Facade Reflections -->
    <linearGradient id="glassGrad" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#4E7082" stop-opacity="0.85" />
      <stop offset="45%" stop-color="#A5C1D2" stop-opacity="0.75" />
      <stop offset="70%" stop-color="#E6C8A0" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#243846" stop-opacity="0.9" />
    </linearGradient>

    <!-- Board-Formed Concrete Material -->
    <pattern id="concretePlanks" width="100" height="18" patternUnits="userSpaceOnUse">
      <rect width="100" height="18" fill="#DDD8CE" />
      <line x1="0" y1="18" x2="100" y2="18" stroke="#B8B2A6" stroke-width="0.75" />
      <circle cx="20" cy="9" r="1.5" fill="#A8A296" opacity="0.6" />
      <circle cx="75" cy="9" r="1.5" fill="#A8A296" opacity="0.6" />
    </pattern>

    <!-- Teak Brise-Soleil Timber Slats -->
    <pattern id="timberSlats" width="14" height="40" patternUnits="userSpaceOnUse">
      <rect width="8" height="40" fill="#B35428" />
      <rect x="8" width="6" height="40" fill="#8A3C17" opacity="0.3" />
    </pattern>
  </defs>

  <!-- Sky -->
  <rect width="${width}" height="${height}" fill="url(#skyGrad)" />
  <rect width="${width}" height="${height}" fill="url(#sunGlow)" />

  <!-- Distant Mountain / Horizon Silhouette -->
  <path d="M 0 ${height * 0.58} Q 280 ${height * 0.52} 550 ${height * 0.56} T ${width} ${height * 0.54} L ${width} ${height} L 0 ${height} Z" fill="#9CAEB8" opacity="0.45" />

  <!-- Ground Plane (Permeable pavers & manicured lawn) -->
  <rect y="${height * 0.62}" width="${width}" height="${height * 0.38}" fill="#3B533E" />
  <polygon points="0,${height} ${width},${height} ${width},${height * 0.72} 0,${height * 0.66}" fill="#4E6852" />
  <polygon points="120,${height} ${width * 0.8},${height} ${width * 0.68},${height * 0.65} 240,${height * 0.65}" fill="#CFCCC4" />

  <!-- Main Architecture: Podium (Board-formed concrete) -->
  <polygon points="180,${height * 0.68} 740,${height * 0.68} 740,${height * 0.35} 180,${height * 0.38}" fill="url(#concretePlanks)" stroke="#1A1A1A" stroke-width="2" />

  <!-- Double-Height Glazed Curtain Wall (Reflective Low-E Glass) -->
  <polygon points="260,${height * 0.65} 680,${height * 0.65} 680,${height * 0.38} 260,${height * 0.40}" fill="url(#glassGrad)" stroke="#1A1A1A" stroke-width="2" />

  <!-- Vertical Aluminum Mullions & Interior Glow -->
  <line x1="330" y1="${height * 0.65}" x2="330" y2="${height * 0.39}" stroke="#1A1A1A" stroke-width="3" />
  <line x1="400" y1="${height * 0.65}" x2="400" y2="${height * 0.39}" stroke="#1A1A1A" stroke-width="3" />
  <line x1="470" y1="${height * 0.65}" x2="470" y2="${height * 0.38}" stroke="#1A1A1A" stroke-width="3" />
  <line x1="540" y1="${height * 0.65}" x2="540" y2="${height * 0.38}" stroke="#1A1A1A" stroke-width="3" />
  <line x1="610" y1="${height * 0.65}" x2="610" y2="${height * 0.38}" stroke="#1A1A1A" stroke-width="3" />

  <!-- Upper Cantilevered Volume (Modern Teak Brise-Soleil Screen) -->
  <polygon points="220,${height * 0.42} 820,${height * 0.38} 820,${height * 0.20} 220,${height * 0.22}" fill="url(#timberSlats)" stroke="#1A1A1A" stroke-width="2" />

  <!-- Deep Floating Tropical Eaves (Heroic Cantilever) -->
  <polygon points="160,${height * 0.22} 880,${height * 0.17} 870,${height * 0.14} 150,${height * 0.19}" fill="#2C2825" stroke="#1A1A1A" stroke-width="2" />
  <!-- Eave Underside Warm Teak Soffit -->
  <polygon points="160,${height * 0.22} 880,${height * 0.17} 820,${height * 0.20} 220,${height * 0.22}" fill="#C85A32" opacity="0.8" />

  <!-- BP 344 Universal Accessibility Entry Ramp (1:12 Gradient) -->
  <polygon points="240,${height * 0.76} 460,${height * 0.66} 500,${height * 0.66} 280,${height * 0.77}" fill="#ECE8E1" stroke="#1A1A1A" stroke-width="1.5" />
  <line x1="240" y1="${height * 0.74}" x2="460" y2="${height * 0.64}" stroke="#2C6E49" stroke-width="3" />

  <!-- Foreground Reflecting Pool / Water Feature -->
  <polygon points="40,${height} 480,${height} 430,${height * 0.82} 100,${height * 0.82}" fill="#2A4B5A" opacity="0.75" />
  <polygon points="60,${height * 0.98} 460,${height * 0.98} 420,${height * 0.84} 120,${height * 0.84}" fill="#78A6B8" opacity="0.4" />

  <!-- Tropical Landscaping Entourage (Palms, Monstera, & Frangipani) -->
  <g fill="#1B3820" opacity="0.95">
    <!-- Left Tropical Tree -->
    <path d="M 60 ${height * 0.75} C 40 ${height * 0.50} 80 ${height * 0.35} 120 ${height * 0.25} C 160 ${height * 0.35} 190 ${height * 0.50} 140 ${height * 0.75} Z" />
    <path d="M 120 ${height * 0.25} C 70 ${height * 0.20} 30 ${height * 0.30} 10 ${height * 0.40} C 50 ${height * 0.30} 90 ${height * 0.25} 120 ${height * 0.25} Z" fill="#244B2A" />
    <path d="M 120 ${height * 0.25} C 170 ${height * 0.20} 210 ${height * 0.30} 230 ${height * 0.40} C 190 ${height * 0.30} 150 ${height * 0.25} 120 ${height * 0.25} Z" fill="#244B2A" />
    <rect x="96" y="${height * 0.65}" width="10" height="${height * 0.18}" fill="#3E2723" />

    <!-- Right Exotic Frangipani / Ravenala Silhouettes -->
    <path d="M 880 ${height * 0.72} C 860 ${height * 0.55} 910 ${height * 0.42} 960 ${height * 0.32} C 1010 ${height * 0.42} 1060 ${height * 0.55} 1020 ${height * 0.72} Z" fill="#203E26" />
    <path d="M 1000 ${height * 0.75} C 980 ${height * 0.60} 1040 ${height * 0.48} 1090 ${height * 0.38} C 1140 ${height * 0.48} 1180 ${height * 0.60} 1140 ${height * 0.75} Z" fill="#17311C" />
  </g>

  <!-- Architectural Scale Entourage (Human Scale 1.70m) -->
  <g fill="#1A1A1A">
    <!-- Figure 1 -->
    <circle cx="560" cy="${height * 0.64 - 28}" r="4.5" />
    <polygon points="556,${height * 0.64 - 23} 564,${height * 0.64 - 23} 563,${height * 0.64} 557,${height * 0.64}" />
    <!-- Figure 2 -->
    <circle cx="575" cy="${height * 0.64 - 27}" r="4" />
    <polygon points="572,${height * 0.64 - 22} 578,${height * 0.64 - 22} 577,${height * 0.64} 573,${height * 0.64}" />
  </g>

  <!-- Title Watermark & Quality Verification Block -->
  <g transform="translate(35, ${height - 50})">
    <rect width="440" height="34" rx="8" fill="#1A1A1A" opacity="0.85" />
    <text x="16" y="16" font-size="11" font-weight="bold" fill="#FFFFFF" letter-spacing="1">ARKITEKI ARCHITECTURAL VISUALIZATION</text>
    <text x="16" y="27" font-size="9" fill="#2C6E49" font-weight="bold">24mm TILT-SHIFT PERSPECTIVE • ${cleanTitle.toUpperCase()}</text>
  </g>
</svg>`;
}

/**
 * Automated Image Quality Validation:
 * Validates that the returned asset is a real, decodable raster image (PNG/JPEG/WEBP)
 * and strictly rejects synthetic vector SVGs, placeholders, or truncated data.
 */
export function validateGeneratedImage(imageUrl?: string | null): { isValid: boolean; error?: string } {
  if (!imageUrl) {
    return { isValid: false, error: 'No image asset returned from generation engine.' };
  }
  if (imageUrl.startsWith('data:image/svg+xml')) {
    return { isValid: false, error: 'Synthetic vector SVG detected. Arkiteki requires authentic photorealistic raster images.' };
  }
  if (
    !imageUrl.startsWith('data:image/png;base64,') &&
    !imageUrl.startsWith('data:image/jpeg;base64,') &&
    !imageUrl.startsWith('data:image/webp;base64,') &&
    !imageUrl.startsWith('https://') &&
    !imageUrl.startsWith('http://')
  ) {
    return { isValid: false, error: 'Unrecognized image MIME format. Expected PNG, JPEG, or WEBP.' };
  }
  if (imageUrl.startsWith('data:image/')) {
    const commaIndex = imageUrl.indexOf(',');
    const b64Data = commaIndex >= 0 ? imageUrl.slice(commaIndex + 1) : '';
    if (b64Data.length < 50) {
      return { isValid: false, error: 'Image asset data is truncated or incomplete.' };
    }
  }
  return { isValid: true };
}

/**
 * Direct In-App Image Rendering:
 * Generates an authentic photorealistic architectural render plate
 * using Google's native Gemini image generation models (Gemini Nano Banana 2.1, Gemini 3 Pro Image).
 * Strictly guarantees NO synthetic SVG or cartoon placeholder fallback.
 */
export async function generateInAppImage({
  apiKey,
  prompt,
  imageModel = getStoredImageModel(),
  aspectRatio = '16:9',
  resolution = '2K',
  visualStyle = 'photography',
  viewType = 'hero-perspective',
  fileItem,
}: {
  apiKey: string;
  prompt: string;
  imageModel?: ImageGenerationModelId;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  resolution?: ImageResolution;
  visualStyle?: ArchitecturalVisualStyle;
  viewType?: ArchitecturalCameraView;
  fileItem?: UploadedFileItem;
}): Promise<{
  imageUrl: string | null;
  source: string | null;
  error?: string;
  failedModel?: string;
}> {
  const chosenStyle = ARCHITECTURAL_VISUAL_STYLES[visualStyle] || ARCHITECTURAL_VISUAL_STYLES.photography;
  const chosenView = ARCHITECTURAL_CAMERA_VIEWS[viewType] || ARCHITECTURAL_CAMERA_VIEWS['hero-perspective'];

  // Check if prompt already specifies camera / perspective to avoid duplicate or conflicting camera directives
  const hasSpecificCamera =
    prompt.toLowerCase().includes('lens') ||
    prompt.toLowerCase().includes('perspective') ||
    prompt.toLowerCase().includes('tilt-shift') ||
    prompt.toLowerCase().includes('worm');
  const cameraDirective = hasSpecificCamera ? '' : `${chosenView.promptModifier} `;

  // Check if prompt already specifies atmospheric lighting
  const hasSpecificLighting =
    prompt.toLowerCase().includes('lighting') ||
    prompt.toLowerCase().includes('golden hour') ||
    prompt.toLowerCase().includes('downpour') ||
    prompt.toLowerCase().includes('nighttime') ||
    prompt.toLowerCase().includes('blue hour');
  const styleDirective = hasSpecificLighting ? '' : `${chosenStyle.promptModifier} `;

  // Construct rigorous positive prompt adhering to Section 2 of Photorealism Standard
  const fullImagePrompt = `${cameraDirective}${styleDirective}${prompt}. Physically based materials (PBR) with authentic tactile micro-surface roughness, accurate ray-traced reflections, realistic contact shadows, natural indirect bounced illumination, ambient occlusion, subtle depth of field. Compositional standard: ArchDaily, Dezeen, and Architectural Digest editorial publication quality. Negative constraints: no cartoon, no flat vector illustration, no 3D CAD clay model, no wireframe, no low poly, no oversaturated plastic colors, no watermarks, no text overlay, no AI hallucinations, no warped columns, no distorted geometry.`;

  // Candidate models to attempt
  const candidateModels: ImageGenerationModelId[] = [
    imageModel,
    'gemini-nano-banana-2.1',
    'gemini-3-pro-image',
    'gemini-3.1-flash-image',
  ].filter((m, i, a) => a.indexOf(m) === i) as ImageGenerationModelId[];

  let lastError = '';

  for (const targetModel of candidateModels) {
    try {
      // Approach A: Google Interactions API (Native endpoint for Gemini Nano Banana 2.1 & Gemini 3 Pro Image)
      const inputParts: any[] = [];
      if (fileItem?.base64Data && fileItem.mimeType.startsWith('image/')) {
        inputParts.push({
          type: 'image',
          data: fileItem.base64Data,
          mime_type: fileItem.mimeType,
        });
        inputParts.push({
          type: 'text',
          text: `Using this uploaded architectural design reference/board as geometric and conceptual context, generate a finished, photorealistic architectural visualization plate: ${fullImagePrompt}`,
        });
      } else {
        inputParts.push({
          type: 'text',
          text: fullImagePrompt,
        });
      }

      const interactionsUrl = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`;
      const interactionsRes = await fetch(interactionsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          model: targetModel,
          input: inputParts,
          response_format: {
            type: 'image',
            aspect_ratio: aspectRatio,
            image_size: resolution,
          },
        }),
      });

      if (interactionsRes.ok) {
        const data = await interactionsRes.json();
        let imageBase64: string | undefined;
        let mimeType = 'image/png';

        if (data.output_image?.data) {
          imageBase64 = data.output_image.data;
          mimeType = data.output_image.mime_type || mimeType;
        } else if (Array.isArray(data.steps)) {
          for (const step of data.steps) {
            if (Array.isArray(step.content)) {
              for (const item of step.content) {
                if (item.type === 'image' && item.data) {
                  imageBase64 = item.data;
                  mimeType = item.mime_type || mimeType;
                  break;
                }
              }
            }
            if (imageBase64) break;
          }
        } else if (Array.isArray(data.outputs)) {
          const o = data.outputs.find((x: any) => x.type === 'image' || x.data);
          if (o?.data) {
            imageBase64 = o.data;
            mimeType = o.mime_type || mimeType;
          }
        }

        if (imageBase64) {
          const dataUrl = `data:${mimeType};base64,${imageBase64}`;
          const validation = validateGeneratedImage(dataUrl);
          if (validation.isValid) {
            return {
              imageUrl: dataUrl,
              source: targetModel,
            };
          }
        }
      } else {
        const errJson = await interactionsRes.json().catch(() => ({}));
        const msg = errJson.error?.message || `HTTP ${interactionsRes.status} ${interactionsRes.statusText}`;
        lastError = `${targetModel} Interactions error: ${msg}`;
        console.warn(`Interactions attempt on ${targetModel} returned:`, msg);
      }
    } catch (err: any) {
      lastError = err?.message || String(err);
      console.warn(`Interactions call exception on ${targetModel}:`, err);
    }

    // Approach B: Google Gemini generateContent with responseModalities: ["IMAGE"]
    try {
      const contentParts: any[] = [];
      if (fileItem?.base64Data && fileItem.mimeType.startsWith('image/')) {
        contentParts.push({
          inline_data: {
            mime_type: fileItem.mimeType,
            data: fileItem.base64Data,
          },
        });
      }
      contentParts.push({ text: fullImagePrompt });

      const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
      const genRes = await fetch(genUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: contentParts }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageConfig: {
              aspectRatio,
            },
          },
        }),
      });

      if (genRes.ok) {
        const genData = await genRes.json();
        const parts = genData.candidates?.[0]?.content?.parts || [];
        for (const p of parts) {
          const inline = p.inlineData || p.inline_data;
          if (inline?.data) {
            const mime = inline.mimeType || inline.mime_type || 'image/png';
            const dataUrl = `data:${mime};base64,${inline.data}`;
            const validation = validateGeneratedImage(dataUrl);
            if (validation.isValid) {
              return {
                imageUrl: dataUrl,
                source: targetModel,
              };
            }
          }
        }
      } else {
        const genErrJson = await genRes.json().catch(() => ({}));
        const genMsg = genErrJson.error?.message || `HTTP ${genRes.status}`;
        lastError = `${targetModel} generateContent error: ${genMsg}`;
      }
    } catch (err: any) {
      lastError = err?.message || String(err);
    }
  }

  // STRICT RULE: Never substitute a cartoon SVG or placeholder for a failed image render!
  console.error('All architectural image generation models failed:', lastError);
  return {
    imageUrl: null,
    source: null,
    error: lastError || 'Image generation engine did not return a valid raster plate. Please verify your Gemini API key and quota.',
    failedModel: imageModel,
  };
}

/**
/**
 * Detected Architectural Context for intelligent dynamic synthesis
 */
export interface DetectedArchitecturalContext {
  styleName: string;
  styleCategory:
    | 'cyberpunk'
    | 'neo-brutalist'
    | 'brutalist'
    | 'minimalist'
    | 'parametric'
    | 'industrial'
    | 'scandinavian'
    | 'gothic'
    | 'classical'
    | 'art-deco'
    | 'mid-century'
    | 'mediterranean'
    | 'philippine-vernacular'
    | 'tropical-modern'
    | 'contemporary';
  typologyName: string;
  typologyCategory:
    | 'arena'
    | 'civic'
    | 'residential'
    | 'cultural'
    | 'commercial'
    | 'educational'
    | 'healthcare'
    | 'hospitality'
    | 'religious'
    | 'general';
  detectedMaterials: string[];
  detectedAtmosphere: string[];
  detectedCamera: string[];
  isTropicalOrPhilippine: boolean;
  locationHint: string;
}

export function detectArchitecturalContext(rawPrompt: string, fileItem?: UploadedFileItem): DetectedArchitecturalContext {
  const combined = `${rawPrompt} ${fileItem?.name || ''} ${fileItem?.textPreview || ''}`.toLowerCase();

  const isTropicalOrPhilippine = Boolean(
    combined.includes('philippine') ||
    combined.includes('philippines') ||
    combined.includes('manila') ||
    combined.includes('cebu') ||
    combined.includes('davao') ||
    combined.includes('iloilo') ||
    combined.includes('bicol') ||
    combined.includes('sorsogon') ||
    combined.includes('palawan') ||
    combined.includes('laguna') ||
    combined.includes('batangas') ||
    combined.includes('pd 1096') ||
    combined.includes('bp 344') ||
    combined.includes('amihan') ||
    combined.includes('habagat') ||
    combined.includes('bahay na bato') ||
    combined.includes('bahay kubo') ||
    combined.includes('balay banwa') ||
    combined.includes('tropical')
  );

  let styleCategory: DetectedArchitecturalContext['styleCategory'] = 'contemporary';
  let styleName = 'Contemporary Architecture';

  if (combined.includes('cyberpunk') || combined.includes('blade runner') || combined.includes('neo-tokyo') || combined.includes('sci-fi')) {
    if (combined.includes('brutalis') || combined.includes('neo-brutalis')) {
      styleCategory = 'neo-brutalist';
      styleName = 'Neo-Brutalist Cyberpunk';
    } else {
      styleCategory = 'cyberpunk';
      styleName = 'High-Tech Cyberpunk';
    }
  } else if (combined.includes('neo-brutalis')) {
    styleCategory = 'neo-brutalist';
    styleName = 'Neo-Brutalist';
  } else if (combined.includes('brutalis') || combined.includes('beton brut') || combined.includes('raw concrete') || combined.includes('monolithic concrete')) {
    styleCategory = 'brutalist';
    styleName = 'Brutalist Monolithic';
  } else if (combined.includes('wabi-sabi') || combined.includes('wabi sabi') || combined.includes('japandi')) {
    styleCategory = 'minimalist';
    styleName = 'Wabi-Sabi Minimalist';
  } else if (combined.includes('minimalis') || combined.includes('zen') || combined.includes('pure volume') || combined.includes('bauhaus')) {
    styleCategory = 'minimalist';
    styleName = 'Refined Minimalist';
  } else if (combined.includes('parametric') || combined.includes('zaha') || combined.includes('curvilinear') || combined.includes('deconstructivi')) {
    styleCategory = 'parametric';
    styleName = 'Parametric & Computational Fluid';
  } else if (combined.includes('industrial') || combined.includes('warehouse') || combined.includes('loft') || combined.includes('corten')) {
    styleCategory = 'industrial';
    styleName = 'Industrial & Adaptive Modern';
  } else if (combined.includes('scandinavian') || combined.includes('nordic') || combined.includes('alpine') || combined.includes('chalet') || combined.includes('sauna')) {
    styleCategory = 'scandinavian';
    styleName = 'Nordic & Scandinavian Timber';
  } else if (combined.includes('gothic') || combined.includes('neo-gothic')) {
    styleCategory = 'gothic';
    styleName = 'Gothic Architectural';
  } else if (combined.includes('classical') || combined.includes('neoclassical') || combined.includes('greek revival') || combined.includes('palladian') || combined.includes('baroque')) {
    styleCategory = 'classical';
    styleName = 'Classical & Neoclassical';
  } else if (combined.includes('art deco') || combined.includes('streamline moderne')) {
    styleCategory = 'art-deco';
    styleName = 'Art Deco';
  } else if (combined.includes('mid-century') || combined.includes('desert modern') || combined.includes('palm springs')) {
    styleCategory = 'mid-century';
    styleName = 'Mid-Century Desert Modern';
  } else if (combined.includes('mediterranean') || combined.includes('spanish colonial') || combined.includes('hacienda') || combined.includes('adobe') || combined.includes('pueblo')) {
    styleCategory = 'mediterranean';
    styleName = 'Mediterranean Modern';
  } else if (combined.includes('bahay na bato') || combined.includes('bahay kubo') || combined.includes('ivatan') || combined.includes('torogan') || combined.includes('maranao')) {
    styleCategory = 'philippine-vernacular';
    styleName = 'Philippine Vernacular Modern';
  } else if (isTropicalOrPhilippine) {
    styleCategory = 'tropical-modern';
    styleName = 'Modern Tropical Bioclimatic';
  }

  // Detect Typology
  let typologyCategory: DetectedArchitecturalContext['typologyCategory'] = 'general';
  let typologyName = 'Architectural Complex';

  if (combined.includes('arena') || combined.includes('stadium') || combined.includes('coliseum') || combined.includes('sports complex')) {
    typologyCategory = 'arena';
    typologyName = 'Sports & Entertainment Arena';
  } else if (combined.includes('city hall') || combined.includes('municipal hall') || combined.includes('civic center') || combined.includes('capitol') || combined.includes('courthouse') || combined.includes('banwa')) {
    typologyCategory = 'civic';
    typologyName = 'Civic Municipal Hall';
  } else if (combined.includes('house') || combined.includes('villa') || combined.includes('residence') || combined.includes('mansion') || combined.includes('dwelling') || combined.includes('cabin') || combined.includes('apartment') || combined.includes('condo')) {
    typologyCategory = 'residential';
    typologyName = 'Residential Architecture';
  } else if (combined.includes('museum') || combined.includes('gallery') || combined.includes('pavilion') || combined.includes('theater') || combined.includes('auditorium') || combined.includes('library') || combined.includes('cultural center')) {
    typologyCategory = 'cultural';
    typologyName = 'Cultural & Exhibition Center';
  } else if (combined.includes('mall') || combined.includes('retail') || combined.includes('commercial') || combined.includes('office tower') || combined.includes('corporate') || combined.includes('skyscraper') || combined.includes('mixed-use')) {
    typologyCategory = 'commercial';
    typologyName = 'Commercial & Mixed-Use Complex';
  } else if (combined.includes('school') || combined.includes('university') || combined.includes('college') || combined.includes('campus') || combined.includes('academy')) {
    typologyCategory = 'educational';
    typologyName = 'Educational & Campus Facility';
  } else if (combined.includes('hospital') || combined.includes('clinic') || combined.includes('health center') || combined.includes('medical') || combined.includes('evacuation center')) {
    typologyCategory = 'healthcare';
    typologyName = 'Healthcare & Community Resilience Facility';
  } else if (combined.includes('hotel') || combined.includes('resort') || combined.includes('ecolodge') || combined.includes('hostel')) {
    typologyCategory = 'hospitality';
    typologyName = 'Hospitality & Resort Destination';
  } else if (combined.includes('church') || combined.includes('cathedral') || combined.includes('chapel') || combined.includes('mosque') || combined.includes('temple') || combined.includes('sanctuary')) {
    typologyCategory = 'religious';
    typologyName = 'Sacred & Religious Architecture';
  }

  // Detect Materials
  const detectedMaterials: string[] = [];
  const materialKeywords = [
    { word: 'obsidian', label: 'Matte-Black Obsidian Stone Slabs' },
    { word: 'charcoal concrete', label: 'Dark Charcoal Architectural Concrete' },
    { word: 'concrete', label: 'Board-Formed Architectural Concrete' },
    { word: 'corten', label: 'Weathered Corten Steel' },
    { word: 'weathered steel', label: 'Weathered Corten Steel' },
    { word: 'steel', label: 'Structural Steel Beams' },
    { word: 'zinc', label: 'Standing-Seam Titanium-Zinc' },
    { word: 'titanium', label: 'Titanium Composite Envelope' },
    { word: 'teak', label: 'Seasoned Teak Timber Louvers' },
    { word: 'narra', label: 'Philippine Narra Hardwood' },
    { word: 'bamboo', label: 'Engineered Structural Bamboo' },
    { word: 'larch', label: 'Siberian Larch Timber Cladding' },
    { word: 'pine', label: 'Kiln-Dried Pale Pine' },
    { word: 'wood', label: 'Warm Architectural Timber Slats' },
    { word: 'timber', label: 'Architectural Timber Glulam' },
    { word: 'travertine', label: 'Honed Travertine Stone' },
    { word: 'limestone', label: 'Cut Limestone Masonry' },
    { word: 'granite', label: 'Flame-Finished Flamed Granite' },
    { word: 'marble', label: 'Polished Architectural Marble' },
    { word: 'rammed earth', label: 'Compacted Rammed Earth' },
    { word: 'adobe', label: 'Monolithic Adobe Stucco' },
    { word: 'terracotta', label: 'Extruded Terracotta Rainscreen' },
    { word: 'brick', label: 'Wirecut Kiln-Fired Brick' },
    { word: 'microcement', label: 'Seamless Architectural Microcement' },
    { word: 'low-e glass', label: 'High-Performance Low-E Glazing' },
    { word: 'electrochromic', label: 'Anti-Glare Electrochromic Solar Glass' },
    { word: 'fluted glass', label: 'Translucent Fluted Cast Glass' },
    { word: 'glass', label: 'Floor-to-Ceiling Low-Iron Glass' },
    { word: 'neon', label: 'Integrated Neon Crimson & Cyan LED Conduits' },
    { word: 'aluminum', label: 'Anodized Architectural Aluminum' },
    { word: 'carbon fiber', label: 'High-Tensile Carbon Fiber Shell' },
    { word: 'brass', label: 'Patinated Architectural Brass' },
  ];

  for (const item of materialKeywords) {
    if (combined.includes(item.word) && !detectedMaterials.includes(item.label)) {
      detectedMaterials.push(item.label);
    }
  }

  // Detect Atmosphere & Lighting
  const detectedAtmosphere: string[] = [];
  if (combined.includes('downpour') || combined.includes('rain')) detectedAtmosphere.push('Atmospheric torrential downpour with rain droplets grazing the envelope');
  if (combined.includes('neon') || combined.includes('cyan') || combined.includes('crimson')) detectedAtmosphere.push('Vibrant neon crimson and electric cyan directional illumination');
  if (combined.includes('fog') || combined.includes('mist') || combined.includes('haze') || combined.includes('volumetric')) detectedAtmosphere.push('Volumetric atmospheric fog and layered depth');
  if (combined.includes('night') || combined.includes('nocturnal')) detectedAtmosphere.push('Nocturnal darkness with dramatic high-contrast architectural uplighting');
  if (combined.includes('golden hour') || combined.includes('sunset')) detectedAtmosphere.push('Warm late-afternoon golden hour sunlight (3200K) with long soft shadows');
  if (combined.includes('blue hour') || combined.includes('dusk') || combined.includes('twilight')) detectedAtmosphere.push('Dusk twilight blue-hour with cobalt sky and glowing interior warmth');
  if (combined.includes('overcast') || combined.includes('diffuse')) detectedAtmosphere.push('Soft diffuse overcast sky with gentle ambient occlusion shadows');

  // Detect Camera
  const detectedCamera: string[] = [];
  if (combined.includes('14mm') || combined.includes("worm's-eye") || combined.includes("worm's eye") || combined.includes('low-angle')) {
    detectedCamera.push("14mm ultra-wide lens from an extreme low worm's-eye angle looking dramatically up");
  } else if (combined.includes('aerial') || combined.includes('drone') || combined.includes("bird's-eye")) {
    detectedCamera.push('Elevated 45-degree oblique drone perspective showing full roofscape and site perimeter');
  } else if (combined.includes('elevation')) {
    detectedCamera.push('Direct frontal orthographic elevation with plumb vertical alignment');
  } else {
    detectedCamera.push('24mm tilt-shift lens from human eye-level (1.6m) with zero keystoning');
  }

  // Location hint
  let locationHint = 'Contemporary Urban Context';
  if (combined.includes('sorsogon')) locationHint = 'Sorsogon City, Bicol, Philippines';
  else if (combined.includes('iloilo')) locationHint = 'Iloilo City, Panay, Philippines';
  else if (combined.includes('cebu')) locationHint = 'Cebu City, Central Visayas, Philippines';
  else if (combined.includes('davao')) locationHint = 'Davao City, Mindanao, Philippines';
  else if (combined.includes('palawan')) locationHint = 'Palawan Coastal Biosphere, Philippines';
  else if (combined.includes('manila')) locationHint = 'Metro Manila Urban Fabric, Philippines';
  else if (isTropicalOrPhilippine) locationHint = 'Tropical Climate Zone, Philippines';
  else if (styleCategory === 'cyberpunk' || styleCategory === 'neo-brutalist') locationHint = 'Dense Futuristic Metropolis';
  else if (styleCategory === 'scandinavian') locationHint = 'Nordic Alpine Landscape';
  else if (styleCategory === 'mid-century') locationHint = 'Desert Modern Topography';

  return {
    styleName,
    styleCategory,
    typologyName,
    typologyCategory,
    detectedMaterials,
    detectedAtmosphere,
    detectedCamera,
    isTropicalOrPhilippine,
    locationHint,
  };
}

/**
 * Intelligent dynamic architectural specification synthesizer.
 * Analyzes the user's brief, typology, aesthetic style, materials, and camera requirements
 * to construct a fully authentic architectural dossier and photorealistic render prompt.
 * ZERO HOMOGENIZATION: Does NOT force tropical elements on non-tropical designs.
 */
export function synthesizeDynamicArchitecturalSpec({
  prompt,
  fileItem,
  visualStyle = 'photography',
  viewType = 'hero-perspective',
  aspectRatio = '16:9',
}: {
  prompt: string;
  fileItem?: UploadedFileItem;
  visualStyle?: ArchitecturalVisualStyle;
  viewType?: ArchitecturalCameraView;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}): {
  conceptStatement: string;
  materialPalette: { material: string; application: string; rationale: string }[];
  environmentalAnalysis: { solarOrientation: string; windChanneling: string; stormWaterStrategy: string };
  buildingCodeNotes: string[];
  jurorDefenseTips: { question: string; suggestedAnswer: string }[];
  architecturalSpec: ArchitecturalDesignSpecification;
  photorealisticPrompt: string;
  enhancedPrompt: string;
} {
  const ctx = detectArchitecturalContext(prompt, fileItem);
  const lower = prompt.toLowerCase();

  // Concept statement
  let conceptStatement = `This ${ctx.styleName} proposal translates the functional requirements of a ${ctx.typologyName} into a commanding architectural presence. The design balances bold tectonic clarity with nuanced contextual articulation, establishing a distinct spatial identity.`;
  if (ctx.styleCategory === 'cyberpunk' || ctx.styleCategory === 'neo-brutalist') {
    conceptStatement = `The ${ctx.styleName} ${ctx.typologyName} redefines monumental scale through an imposing dialogue of monolithic dark massing and vibrant directional light conduits. The structure channels spectator and occupant circulation through high-capacity concourses engineered for severe weather resilience and high-impact nighttime visibility.`;
  } else if (ctx.styleCategory === 'brutalist') {
    conceptStatement = `Celebrated through the honest weight of unadorned structural mass, this ${ctx.styleName} design articulates sculptural concrete cantilevers, deep shadow reveals, and rhythmic structural apertures, establishing an enduring monument to civic and programmatic permanency.`;
  } else if (ctx.styleCategory === 'minimalist') {
    conceptStatement = `Conceived as a study in spatial serenity and material restraint, this ${ctx.styleName} proposal eliminates ornamental excess in favor of refined proportions, continuous shadow reveals, and a seamless transition between interior living volumes and outdoor nature.`;
  } else if (ctx.styleCategory === 'scandinavian') {
    conceptStatement = `Rooted in Nordic timbercraft and climatic honesty, this ${ctx.styleName} design synthesizes natural timber cladding, steep snow-shedding roof planes, and panoramic high-performance glazing that harmonizes with the surrounding landscape.`;
  } else if (ctx.styleCategory === 'parametric') {
    conceptStatement = `Employing fluid computational geometry and continuous aerodynamic envelopes, this ${ctx.styleName} structure demonstrates structural biomimicry, optimizing daylight penetration and structural loads through algorithmic facade articulation.`;
  } else if (ctx.isTropicalOrPhilippine) {
    conceptStatement = `Harmonizing contemporary tectonic clarity with vernacular Philippine bioclimatic principles, this ${ctx.styleName} design integrates deep 3.0m cantilevered roof overhangs, lifted pilotis for continuous cross-ventilation, and warm timber brise-soleil screening.`;
  }

  // Material palette
  let materialPalette: { material: string; application: string; rationale: string }[] = [];
  if (ctx.styleCategory === 'cyberpunk' || ctx.styleCategory === 'neo-brutalist') {
    materialPalette = [
      {
        material: ctx.detectedMaterials.find(m => m.includes('Obsidian')) || 'Matte-Black Obsidian Stone Slabs',
        application: 'Primary exterior rainscreen facade panels',
        rationale: 'High-density weather-resistant cladding with light-absorbing matte finish preventing unwanted specular glare.',
      },
      {
        material: ctx.detectedMaterials.find(m => m.includes('Charcoal')) || 'Dark Charcoal Architectural Concrete',
        application: 'Structural shear walls and monolithic foundation pylons',
        rationale: 'High compressive load capacity providing brutalist textural permanence and seismic stability.',
      },
      {
        material: ctx.detectedMaterials.find(m => m.includes('Neon') || m.includes('LED')) || 'Integrated Neon Crimson & Cyan LED Conduits',
        application: 'Recessed reveals along facade joints and circulation portals',
        rationale: 'Waterproof exterior illumination providing high-impact wayfinding and iconic nighttime silhouette.',
      },
      {
        material: ctx.detectedMaterials.find(m => m.includes('Glass') || m.includes('Electrochromic')) || 'Anti-Glare Electrochromic Solar Glazing',
        application: 'Main concourse curtain walls and sky-tier viewing portals',
        rationale: 'Electronically tunable visual light transmittance for heat gain rejection and specular storm reflections.',
      },
    ];
  } else if (ctx.styleCategory === 'brutalist') {
    materialPalette = [
      { material: 'Monolithic Board-Formed Beton Brut', application: 'Exterior structural bearing walls and cantilevers', rationale: 'Exposes authentic grain of timber formwork; high thermal mass buffers thermal fluctuations.' },
      { material: 'Bush-Hammered Aggregate Concrete', application: 'Ground-level plinth and stepped podium', rationale: 'Textural tactile contrast anchoring the building securely to the earth.' },
      { material: 'Dark Anodized Architectural Aluminum', application: 'Deeply recessed window mullions and copings', rationale: 'Corrosion-resistant framing with matte finish accentuating deep shadow reveals.' },
      { material: 'Low-Iron Clear Acoustic Glazing', application: 'Recessed facade fenestrations', rationale: 'Maintains daylight clarity without color tinting, shielded from direct sun by concrete reveals.' },
    ];
  } else if (ctx.styleCategory === 'minimalist') {
    materialPalette = [
      { material: 'Seamless Architectural Microcement', application: 'Continuous exterior wall planes and soffits', rationale: 'Monolithic joint-free finish reflecting ambient light with subtle mineral texture.' },
      { material: 'Ultra-Clear Low-E Insulated Glazing', application: 'Floor-to-ceiling frameless pocket sliding glass walls', rationale: 'Blurs boundaries between inside and outside while maintaining strict U-value thermal efficiency.' },
      { material: 'Honed Basalt or Limestone Pavers', application: 'Terrace and interior floor transitions', rationale: 'Consistent natural stone materiality running from interior living to exterior courtyard.' },
      { material: 'Brushed Dark Stainless Steel', application: 'Concealed window tracks and minimalist hardware', rationale: 'Ultra-thin profiles ensuring maximum visual transparency.' },
    ];
  } else if (ctx.styleCategory === 'scandinavian') {
    materialPalette = [
      { material: 'Kiln-Dried Siberian Larch Timber Siding', application: 'Exterior rainscreen cladding and soffits', rationale: 'Naturally weather-resistant resin-rich timber that patinas into a silvery tone over time.' },
      { material: 'Matte Charcoal Standing-Seam Zinc', application: 'Steeply pitched gable roof and vertical accents', rationale: 'Zero-maintenance material capable of self-healing minor scratches and shedding snow.' },
      { material: 'White-Washed Brick Masonry', application: 'Interior structural chimney core and base walls', rationale: 'Provides radiant thermal mass heating during cold sub-zero nights.' },
      { material: 'Triple-Glazed Argon Low-E Wood Windows', application: 'Panoramic landscape aperture frames', rationale: 'Provides maximum thermal barrier against sub-zero winter temperatures.' },
    ];
  } else if (ctx.isTropicalOrPhilippine) {
    materialPalette = [
      { material: 'Board-Formed Architectural Concrete', application: 'Structural cores and shear walls', rationale: 'High thermal mass dampens midday tropical heat; withstands typhoons and seismic forces.' },
      { material: 'Seasoned Teak / Narra Timber Brise-Soleil', application: 'Upper facade operable louvers', rationale: 'Filters high-angle solar glare while permitting continuous cross-ventilation breezes.' },
      { material: 'Double-Glazed Low-E Solar Acoustic Glass', application: 'Public concourse curtain walls', rationale: 'Maximizes natural daylighting without excessive Solar Heat Gain Coefficient.' },
      { material: 'Permeable Travertine Stone Pavers', application: 'Civic pedestrian plaza', rationale: 'Prevents urban heat island effect and promotes rapid stormwater aquifer infiltration.' },
    ];
  } else {
    materialPalette = [
      { material: 'Architectural UHPC Panels', application: 'Primary exterior rainscreen envelope', rationale: 'High-strength, lightweight panels engineered for durability and precise joint alignments.' },
      { material: 'High-Performance Insulated Solar Glazing', application: 'Curtain walls and perimeter fenestrations', rationale: 'Balances natural daylight penetration with optimal solar heat gain coefficients.' },
      { material: 'Dark Anodized Structural Aluminum', application: 'Facade mullions, louvers, and copings', rationale: 'Durable, corrosion-resistant framing with crisp modern architectural profiles.' },
      { material: 'Honed Architectural Stone Pavers', application: 'Entrance concourse and landscape plazas', rationale: 'High slip resistance and enduring aesthetic quality under heavy pedestrian circulation.' },
    ];
  }

  // Environmental analysis
  let environmentalAnalysis = {
    solarOrientation: 'Envelope articulation tuned to solar path, utilizing passive shading to mitigate peak cooling loads.',
    windChanneling: 'Building massing configured to promote natural convective airflow and minimize pedestrian-level wind turbulence.',
    stormWaterStrategy: 'Sustainable urban drainage integrating retention basins, permeable paving, and channeled runoff control.',
  };
  if (ctx.styleCategory === 'cyberpunk' || ctx.styleCategory === 'neo-brutalist') {
    environmentalAnalysis = {
      solarOrientation: 'Electrochromic dynamic glass and micro-perforated exterior panels mitigate urban heat island reflections onto surrounding transit arteries.',
      windChanneling: 'Aerodynamic angular massing deflects high-velocity urban street canyon winds around pedestrian entry portals.',
      stormWaterStrategy: 'High-capacity siphonic drainage channels and subterranean detention cisterns engineered for catastrophic cloudburst downpours.',
    };
  } else if (ctx.styleCategory === 'scandinavian') {
    environmentalAnalysis = {
      solarOrientation: 'Southern aperture maximization captures low-angle winter sunlight for passive solar thermal heating.',
      windChanneling: 'Tapered windward roof slope deflects prevailing sub-zero winter winds over the sheltered building envelope.',
      stormWaterStrategy: 'Steep roof pitches ensure rapid snow shedding into freeze-protected concealed meltwater gutters.',
    };
  } else if (ctx.isTropicalOrPhilippine) {
    environmentalAnalysis = {
      solarOrientation: 'Longitudinal East-West building axis limits direct solar radiation; deep 3.0m eaves shade vertical glazing.',
      windChanneling: 'Lifted ground-floor pilotis channel prevailing Amihan (Northeast) and Habagat (Southwest) monsoons through open breezeways.',
      stormWaterStrategy: 'Cantilevered roof overhangs shed torrential monsoon rains into integrated bioretention swales and cisterns.',
    };
  }

  // Building code notes
  let buildingCodeNotes: string[] = [];
  if (ctx.isTropicalOrPhilippine) {
    buildingCodeNotes = [
      'PD 1096 Sec. 704 & 708: Complies with allowable Total Open Space within Lot (TOSL) and required setback clearances.',
      'BP 344 Rule II: Full universal accessibility ramp gradients (1:12), tactile paving, and entrance clearances.',
      'RA 9514 (Fire Code): Dual remote smoke-proof enclosed egress stair towers with positive pressure ventilation.',
    ];
  } else if (ctx.typologyCategory === 'arena') {
    buildingCodeNotes = [
      'Life Safety & Assembly Egress (IBC Chapter 10 / NFPA 101): High-throughput egress portals sized for rapid arena evacuation with minimum 1.2m clear width per 250 occupants.',
      'Structural & Seismic Resilience (ASCE 7): Long-span structural steel diagrid with mass-tuned dampers mitigating dynamic spectator harmonic resonance.',
      'Universal Accessibility (ADA / Universal Design): Seamless barrier-free sightlines across all seating tiers with tactile guidance paths.',
    ];
  } else {
    buildingCodeNotes = [
      'Building Height & Zoning Envelope: Conforms to local floor-area ratio (FAR) limitations, sky-exposure planes, and required setback envelopes.',
      'Universal Accessibility: Level zero-step thresholds across all main entrances, universal accessible restrooms, and tactile guidance.',
      'Life Safety & Fire Protection: 2-hour fire-rated structural assemblies with pressurized dual exit enclosures and automated sprinkler integration.',
    ];
  }

  // Juror defense tips
  let jurorDefenseTips: { question: string; suggestedAnswer: string }[] = [];
  if (ctx.typologyCategory === 'arena' || ctx.styleCategory === 'cyberpunk' || ctx.styleCategory === 'neo-brutalist') {
    jurorDefenseTips = [
      {
        question: 'How does your massive monolithic facade prevent oppressive street-level scale for pedestrians?',
        suggestedAnswer: 'By carving human-scale pedestrian colonnades into the ground plane and illuminating circulation reveals with warm directional lighting, the building feels permeable and welcoming at eye level while retaining monumental civic presence above.',
      },
      {
        question: 'How do you mitigate acoustic reverberation and crowd noise in an enclosed venue of this scale?',
        suggestedAnswer: 'Acoustic baffle panels integrated behind perforated interior wall claddings absorb mid-to-high frequencies, while sound-dampening ceiling clouds prevent flutter echoes and keep speech intelligibility high.',
      },
    ];
  } else if (ctx.isTropicalOrPhilippine) {
    jurorDefenseTips = [
      {
        question: 'How did you justify your ramp length under BP 344?',
        suggestedAnswer: 'We maintained a strict 1:12 slope with 1.5m level rest landings every 6.0m of run, ensuring full universal accessibility without impeding pedestrian flow.',
      },
      {
        question: 'How does your design address excessive heat gain in glass curtain walls?',
        suggestedAnswer: 'Major glazing faces strictly North, shielded by deep horizontal overhangs and Low-E solar coatings to prevent heat entrapment while maximizing natural daylight.',
      },
    ];
  } else {
    jurorDefenseTips = [
      {
        question: 'How does the material palette balance aesthetic vision with lifecycle maintenance?',
        suggestedAnswer: 'Primary surfaces utilize self-weathering, high-durability materials with factory-applied protective silane treatments, significantly lowering long-term maintenance costs.',
      },
      {
        question: 'How does the building envelope perform under extreme weather events?',
        suggestedAnswer: 'The multi-layer pressure-equalized rainscreen system separates weather protection from thermal insulation, preventing water infiltration while ensuring continuous envelope breathability.',
      },
    ];
  }

  // Construct Photorealistic Prompt
  // 1. Camera & View sentence
  let cameraDir = 'Captured with an architectural 24mm tilt-shift lens from human eye-level (1.6m). Vertical columns, mullions, and wall edges are strictly plumb and straight with zero keystoning convergence.';
  if (lower.includes('14mm') || lower.includes("worm's-eye") || lower.includes("worm's eye") || lower.includes('low-angle')) {
    cameraDir = "Captured with a 14mm ultra-wide architectural lens from an extreme low worm's-eye angle looking dramatically up at the towering facade. Vertical architectural lines remain strictly plumb with heroic upward scale and zero keystoning distortion.";
  } else if (viewType === 'aerial-drone' || lower.includes('drone') || lower.includes('aerial')) {
    cameraDir = 'Captured with a high-resolution drone camera at an elevated 45-degree oblique architectural perspective showing roofscape, perimeter geometry, and urban integration.';
  } else if (viewType === 'front-elevation' || lower.includes('elevation')) {
    cameraDir = 'Captured in a perfectly symmetrical direct front elevation projection, orthographic alignment, zero perspective convergence.';
  } else if (viewType === 'facade-detail' || lower.includes('detail') || lower.includes('close-up')) {
    cameraDir = 'Close-up macro architectural detail shot focusing on tectonic facade joints, material textures, and precise connection details.';
  }

  // 2. Atmosphere & Lighting sentence
  let lightingDir = 'Warm late-afternoon golden hour sunlight at 5:00 PM casting soft, elongated 45-degree diagonal shadows across facade planes with warm interior illumination visibly glowing through transparent glazing.';
  if (lower.includes('neon') || lower.includes('downpour') || lower.includes('cyberpunk') || lower.includes('rain')) {
    lightingDir = 'Atmospheric nighttime downpour with fine rain droplets grazing the surface, subtle volumetric atmospheric mist, and vibrant neon crimson and electric cyan directional accents reflecting dynamically off wet reflective ground concourse.';
  } else if (visualStyle === 'dusk-bluehour' || lower.includes('blue hour') || lower.includes('dusk') || lower.includes('night')) {
    lightingDir = 'Dramatic dusk twilight blue-hour illumination with deep cobalt sky, glowing interior light pools, and precise exterior architectural uplighting.';
  } else if (visualStyle === 'overcast' || lower.includes('overcast') || lower.includes('diffuse')) {
    lightingDir = 'Soft diffuse overcast daylight with gentle ambient occlusion shadows, highlighting subtle material textural variations without harsh glare.';
  }

  // 3. Materials summary
  const matSummary = materialPalette.map(m => m.material).join(', ');

  // 4. Landscape / Entourage
  let siteAndLandscape = 'Permeable landscaped pedestrian plaza, native shade trees, integrated linear bioswales, and human scale figures.';
  if (ctx.styleCategory === 'cyberpunk' || ctx.styleCategory === 'neo-brutalist') {
    siteAndLandscape = 'Slick wet reflective dark asphalt, brushed dark steel bollards, subterranean drainage grates, and pedestrian skywalks with subtle atmospheric mist.';
  } else if (ctx.styleCategory === 'brutalist') {
    siteAndLandscape = 'Monolithic geometric concrete steps, crushed dark aggregate gravel plaza, architectural reflecting pool, and minimalist architectural accents.';
  } else if (ctx.styleCategory === 'scandinavian') {
    siteAndLandscape = 'Native evergreen pine woodland, natural granite bedrock outcroppings, wild alpine grasses, and a timber boardwalk.';
  } else if (ctx.styleCategory === 'minimalist') {
    siteAndLandscape = 'Raked gravel courtyard, solitary sculptural pine, honed stone stepping paths, and a quiet reflecting water basin.';
  } else if (ctx.isTropicalOrPhilippine) {
    siteAndLandscape = 'Permeable travertine civic plaza, native Narra shade trees, mature coconut palms (Cocos nucifera), rain garden bioswales, and lush tropical foliage.';
  }

  // 5. Build full photorealistic prompt
  const cleanLandscape = siteAndLandscape.replace(/\.+$/, '');
  const photorealisticPrompt = `Photorealistic architectural photograph of a ${ctx.styleName} ${ctx.typologyName}. ${cameraDir} The building showcases expressive form and massing featuring ${matSummary}. ${lightingDir} Setting and landscape: ${cleanLandscape}. Masterpiece architectural visualization plate (${aspectRatio} format), ArchDaily and Dezeen editorial publication standard, 8k resolution, physically based rendering (PBR), shot on Hasselblad H6D-100c with pristine textural clarity and razor-sharp focus throughout.`;

  const architecturalSpec: ArchitecturalDesignSpecification = {
    projectType: `${ctx.styleName} ${ctx.typologyName}`,
    buildingLocation: ctx.locationHint,
    climateAndBiome: ctx.isTropicalOrPhilippine ? 'Tropical wet monsoon' : (ctx.styleCategory === 'scandinavian' ? 'Sub-zero alpine' : 'Urban temperate climate zone'),
    floorsAndScale: ctx.typologyCategory === 'arena' ? 'Monumental 4-tier assembly scale' : '2-3 storeys with expansive double-height concourse',
    formAndMassing: `${ctx.styleName} volumetric composition with articulated structural bays and expressive cantilevered volumes`,
    facadeComposition: `Multi-layer facade engineered with ${materialPalette[0]?.material || 'cladding'} and ${materialPalette[1]?.material || 'structural framing'}`,
    roofDesign: ctx.isTropicalOrPhilippine ? 'Deep cantilevered 3.0m eaves with concealed rainwater gutters' : 'Sculptural architectural roof envelope with integrated drainage channels',
    fenestrationAndGlazing: materialPalette[3]?.material || 'Low-E solar control insulated curtain wall glazing',
    materialSchedule: matSummary,
    siteAndLandscape,
    lightingAndAtmosphere: lightingDir,
    cameraComposition: cameraDir,
    preservedReferenceElements: [ctx.styleName, ctx.typologyName],
    refinedDesignElements: materialPalette.map(m => m.material),
    photorealisticPrompt,
    negativeConstraints: 'cartoon, flat vector illustration, low poly, 3D CAD clay model, wireframe, plastic materials, watermarks, deformed geometry',
  };

  return {
    conceptStatement,
    materialPalette,
    environmentalAnalysis,
    buildingCodeNotes,
    jurorDefenseTips,
    architecturalSpec,
    photorealisticPrompt,
    enhancedPrompt: photorealisticPrompt,
  };
}

/**
 * Stage 1: Gemini Deep Multimodal Architectural Analysis & Specification Synthesis
 * Analyzes the user brief and any attached presentation boards, site plans, sketches, or PDFs.
 * Extracts the central building concept, roof structure, massing, facade, materials, and climate context,
 * and synthesizes the presentation dossier + the hyper-detailed photorealistic rendering prompt.
 * ZERO HOMOGENIZATION: Strictly adheres to the user's specific architectural style and materials.
 */
export async function synthesizeArchitecturalSpecification({
  apiKey,
  reasoningModel = getStoredGeminiModel(),
  prompt,
  fileItem,
  visualStyle = 'photography',
  viewType = 'hero-perspective',
  aspectRatio = '16:9',
}: {
  apiKey: string;
  reasoningModel?: string;
  prompt: string;
  fileItem?: UploadedFileItem;
  visualStyle?: ArchitecturalVisualStyle;
  viewType?: ArchitecturalCameraView;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}): Promise<{
  conceptStatement: string;
  materialPalette: { material: string; application: string; rationale: string }[];
  environmentalAnalysis: { solarOrientation: string; windChanneling: string; stormWaterStrategy: string };
  buildingCodeNotes: string[];
  jurorDefenseTips: { question: string; suggestedAnswer: string }[];
  architecturalSpec: ArchitecturalDesignSpecification;
  photorealisticPrompt: string;
  enhancedPrompt: string;
}> {
  const chosenModel = reasoningModel || getStoredGeminiModel() || 'gemini-3.8-flash';
  const dynamicFallback = synthesizeDynamicArchitecturalSpec({
    prompt,
    fileItem,
    visualStyle,
    viewType,
    aspectRatio,
  });

  const systemInstruction = `You are a world-class Architectural Visualization Director and PRC Board of Architecture design examiner.
You specialize in translating briefs, sketches, and reference boards into publication-grade architectural designs and hyper-detailed photorealistic rendering specifications suitable for ArchDaily publication or V-Ray/Unreal Engine 5 architectural CGI.

CRITICAL ARCHITECTURAL DIRECTIVE — STYLE FIDELITY (ZERO HOMOGENIZATION):
1. Strictly adopt and respect the specific architectural style requested by the user or shown on the reference board (e.g. Cyberpunk, Brutalist, Neo-Brutalist, Minimalist, Deconstructivist, Gothic, Classical, Scandinavian, Industrial, Parametric, Art Deco, Tropical Modern, Vernacular).
2. NEVER force every building into a tropical modern style or civic municipal hall. If the user asks for a Cyberpunk Arena, a Brutalist Library, an Alpine Chalet, or a Minimalist Desert House, design THAT specific architecture with its distinctive materiality, lighting, and environmental response.
3. If and only if the user specifies a Philippine or tropical context (e.g. Sorsogon, Bicol, Manila, Cebu, PD 1096, BP 344, tropical, Amihan/Habagat), incorporate Philippine bioclimatic principles. For other international or sci-fi contexts, provide the corresponding structural, life-safety, and environmental response for that typology.
4. The synthesized "photorealisticPrompt" MUST explicitly capture the user's requested style, exact materials, atmospheric mood, lighting, and camera perspective with uncompromising fidelity.`;

  const instruction = `The designer is proposing an architectural project:
"${prompt}"

Deliverable Request: Photorealistic Architectural Visualization Plate (${aspectRatio}, visual style: ${visualStyle}, camera view: ${viewType})
Attached Reference Material: ${fileItem ? `"${fileItem.name}" (${fileItem.mimeType})` : 'None'}

MULTIMODAL INSTRUCTION FOR ARCHITECTURAL BRIEFS & REFERENCE BOARDS:
1. If an image or presentation board is attached, carefully analyze its ACTUAL visual and programmatic content:
   - Identify the specific project typology, style, massing geometry, structural system, and any text labels.
   - Preserve identifying spatial, volumetric, or cultural design motifs shown in the reference.
   - Elevate the tectonic clarity, material realism, and atmospheric rendering fidelity into a finished, publication-grade proposal.
2. If no board is attached, synthesize the project directly from the user's brief with extreme fidelity to their chosen style, materials, and typology.
3. Synthesize a comprehensive JSON response matching this EXACT schema:
{
  "conceptStatement": "3-4 sentence powerful architectural philosophy articulating the building identity, spatial narrative, tectonic expression, and contextual responsiveness.",
  "materialPalette": [
    { "material": "Material Name (e.g. Matte-Black Obsidian / Board-Formed Concrete / Siberian Larch)", "application": "Exact location on building", "rationale": "Structural, climatic, or aesthetic rationale" },
    { "material": "Material Name", "application": "Exact location", "rationale": "Rationale" },
    { "material": "Material Name", "application": "Exact location", "rationale": "Rationale" },
    { "material": "Material Name", "application": "Exact location", "rationale": "Rationale" }
  ],
  "environmentalAnalysis": {
    "solarOrientation": "Technical solar shading or thermal envelope strategy tailored to the project's climate.",
    "windChanneling": "Aerodynamic wind management, passive ventilation, or urban windbreak strategy.",
    "stormWaterStrategy": "Stormwater management, drainage resilience, or snow/rain protection strategy."
  },
  "buildingCodeNotes": [
    "Applicable building code / life safety / egress / universal accessibility note appropriate for this typology.",
    "Structural or zoning standard note.",
    "Fire separation or emergency accessibility note."
  ],
  "jurorDefenseTips": [
    { "question": "Tough question a university professor or panel juror will ask about this specific design?", "suggestedAnswer": "Strong, technically sound architectural defense." },
    { "question": "Tough structural, material, or environmental question?", "suggestedAnswer": "Convincing defense." }
  ],
  "architecturalSpec": {
    "projectType": "Typology of the project",
    "buildingLocation": "Project location or climate zone",
    "climateAndBiome": "Climate conditions and environmental context",
    "floorsAndScale": "Number of storeys and physical scale",
    "formAndMassing": "Sculptural volumetric massing description",
    "facadeComposition": "Detailed facade rhythm, envelope articulation, and screening",
    "roofDesign": "Roof form, eaves, materials, and drainage profile",
    "fenestrationAndGlazing": "Glazing type, framing, solar performance, and aperture rhythm",
    "materialSchedule": "Primary physical materials, surface finishes, and colors",
    "siteAndLandscape": "Plaza, landscape entourage, paving, and vegetation matching the style and biome",
    "lightingAndAtmosphere": "Lighting conditions, time of day, atmosphere, and shadow quality",
    "cameraComposition": "Lens focal length, viewpoint angle, horizon line, and plumb verticals",
    "preservedReferenceElements": ["Key elements preserved from brief or reference"],
    "refinedDesignElements": ["Enhanced tectonic elements, materials, and details"]
  },
  "photorealisticPrompt": "Complete, self-contained, publication-grade architectural visualization prompt ready for Canon EOS R5 / V-Ray rendering describing the building in exhaustive physical detail adhering to the user's requested style, materials, camera, and lighting.",
  "negativeConstraints": "cartoon, flat illustration, vector graphics, 3D CAD clay model, wireframe, low poly, oversaturated plastic colors, watermarks, text overlay"
}`;

  try {
    const text = await callGeminiApi({
      apiKey,
      model: chosenModel,
      prompt: instruction,
      fileItem,
      systemInstruction,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        conceptStatement: parsed.conceptStatement || dynamicFallback.conceptStatement,
        materialPalette: Array.isArray(parsed.materialPalette) && parsed.materialPalette.length > 0 ? parsed.materialPalette : dynamicFallback.materialPalette,
        environmentalAnalysis: parsed.environmentalAnalysis || dynamicFallback.environmentalAnalysis,
        buildingCodeNotes: Array.isArray(parsed.buildingCodeNotes) && parsed.buildingCodeNotes.length > 0 ? parsed.buildingCodeNotes : dynamicFallback.buildingCodeNotes,
        jurorDefenseTips: Array.isArray(parsed.jurorDefenseTips) && parsed.jurorDefenseTips.length > 0 ? parsed.jurorDefenseTips : dynamicFallback.jurorDefenseTips,
        architecturalSpec: parsed.architecturalSpec || dynamicFallback.architecturalSpec,
        photorealisticPrompt: parsed.photorealisticPrompt || dynamicFallback.photorealisticPrompt,
        enhancedPrompt: parsed.photorealisticPrompt || dynamicFallback.enhancedPrompt,
      };
    }
  } catch (err) {
    console.warn('Gemini architectural analysis error, using dynamic architectural intelligence:', err);
  }

  // Use dynamic architectural synthesis fallback matching the user's actual brief
  return dynamicFallback;
}

/**
 * Generates an additional viewpoint (e.g. Front Elevation, Aerial Drone, Facade Detail)
 * of the exact same architectural design using the Stage 1 architectural specification.
 */
export async function generateAdditionalArchitecturalView({
  apiKey,
  imageModel = getStoredImageModel(),
  architecturalSpec,
  targetView,
  visualStyle = 'photography',
  aspectRatio = '16:9',
  resolution = '2K',
  fileItem,
}: {
  apiKey: string;
  imageModel?: ImageGenerationModelId;
  architecturalSpec: ArchitecturalDesignSpecification;
  targetView: ArchitecturalCameraView;
  visualStyle?: ArchitecturalVisualStyle;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  resolution?: ImageResolution;
  fileItem?: UploadedFileItem;
}): Promise<AdditionalArchitecturalView> {
  const viewConfig = ARCHITECTURAL_CAMERA_VIEWS[targetView];
  const viewPrompt = `${viewConfig.promptModifier} Focusing on the ${architecturalSpec.projectType} in ${architecturalSpec.buildingLocation}. Form: ${architecturalSpec.formAndMassing}. Facade: ${architecturalSpec.facadeComposition}. Roof: ${architecturalSpec.roofDesign}. Materials: ${architecturalSpec.materialSchedule}. Landscape: ${architecturalSpec.siteAndLandscape}.`;

  const imgRes = await generateInAppImage({
    apiKey,
    prompt: viewPrompt,
    imageModel,
    aspectRatio,
    resolution,
    visualStyle,
    viewType: targetView,
    fileItem,
  });

  if (!imgRes.imageUrl) {
    throw new Error(imgRes.error || `Failed to render ${viewConfig.label}.`);
  }

  return {
    id: `view-${targetView}-${Date.now()}`,
    viewType: targetView,
    viewLabel: viewConfig.label,
    imageUrl: imgRes.imageUrl,
    timestamp: Date.now(),
    imageModelUsed: imageModel,
    resolution,
    visualStyle,
    promptUsed: viewPrompt,
  };
}

/**
 * Direct In-App Studio Output:
 * Coordinates Stage 1 (Gemini Multimodal Architectural Specification Synthesis)
 * and Stage 2 (Photorealistic Image Model Rendering).
 * Delivers both the true raster image and the presentation dossier.
 */
export async function generateInAppStudioResult({
  apiKey,
  reasoningModel = getStoredGeminiModel(),
  imageModel = getStoredImageModel(),
  prompt,
  fileItem,
  aspectRatio = '16:9',
  resolution = '2K',
  visualStyle = 'photography',
  viewType = 'hero-perspective',
}: {
  apiKey: string;
  reasoningModel?: string;
  imageModel?: ImageGenerationModelId;
  prompt: string;
  fileItem?: UploadedFileItem;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  resolution?: ImageResolution;
  visualStyle?: ArchitecturalVisualStyle;
  viewType?: ArchitecturalCameraView;
}): Promise<InAppStudioResult> {
  const chosenReasoningModel = reasoningModel || getStoredGeminiModel() || 'gemini-3.8-flash';
  const chosenImageModel = imageModel || getStoredImageModel() || 'gemini-nano-banana-2.1';
  const hasImage = Boolean(fileItem && fileItem.mimeType.startsWith('image/'));
  const deliverableType = classifyArchitecturalIntent(prompt, hasImage);

  // If deliverable is a floor plan, generate CAD linework plan for CAD tab
  let svgFloorPlan: string | undefined;
  if (deliverableType === 'floor-plan' || prompt.toLowerCase().includes('plan')) {
    svgFloorPlan = generateArchitecturalFloorPlanSvg(prompt);
  }

  // Stage 1: Multimodal Architectural Analysis & Specification Synthesis
  const stage1 = await synthesizeArchitecturalSpecification({
    apiKey,
    reasoningModel: chosenReasoningModel,
    prompt,
    fileItem,
    visualStyle,
    viewType,
    aspectRatio,
  });

  // Stage 2: Photorealistic Image Generation using the Synthesized Specification
  let imageOutput: { imageUrl: string | null; source: string | null; error?: string; failedModel?: string } = {
    imageUrl: null,
    source: null,
  };

  if (deliverableType !== 'floor-plan') {
    imageOutput = await generateInAppImage({
      apiKey,
      prompt: stage1.photorealisticPrompt,
      imageModel: chosenImageModel,
      aspectRatio,
      resolution,
      visualStyle,
      viewType,
      fileItem,
    });
  }

  return {
    imageUrl: imageOutput.imageUrl || undefined,
    imageSource: imageOutput.source,
    imageModelUsed: chosenImageModel,
    reasoningModelUsed: chosenReasoningModel,
    visualStyle,
    viewType,
    resolution,
    deliverableType,
    aspectRatio,
    svgFloorPlan,
    comparisonImageUrl: fileItem?.dataUrl,
    conceptStatement: stage1.conceptStatement,
    materialPalette: stage1.materialPalette,
    environmentalAnalysis: stage1.environmentalAnalysis,
    jurorDefenseTips: stage1.jurorDefenseTips,
    buildingCodeNotes: stage1.buildingCodeNotes,
    architecturalSpec: stage1.architecturalSpec,
    photorealisticPrompt: stage1.photorealisticPrompt,
    enhancedPrompt: stage1.enhancedPrompt,
    renderError: imageOutput.error,
    additionalViews: [],
    modelUsed: `${chosenReasoningModel} + ${chosenImageModel}`,
    timestamp: Date.now(),
  };
}

/**
 * Analyzes rough architectural prompt and optional attached sketch/brief,
 * returning structured critique & improved version with style fidelity, building code, and camera rules.
 * ZERO HOMOGENIZATION: Does NOT force tropical modern or Philippine context on non-tropical designs.
 */
export async function enhanceArchitecturalPromptWithGemini(
  userPrompt: string,
  apiKey?: string,
  fileItem?: UploadedFileItem,
  model?: string
): Promise<PromptCritiqueResult> {
  const chosenModel = model || getStoredGeminiModel();
  const ctx = detectArchitecturalContext(userPrompt, fileItem);

  const systemInstruction = `You are a world-class Architectural Visualization Director and Design Professor.
Your role is to critique an architecture student's prompt and any attached drawings/briefs, transforming them into an ArchDaily-grade, 8K presentation visual prompt.

CORE ARCHITECTURAL RULES — STYLE FIDELITY (ZERO HOMOGENIZATION):
1. Respect the user's chosen architectural style, typology, materials, and atmospheric mood (e.g. Cyberpunk, Brutalist, Minimalist, Deconstructivist, Gothic, Scandinavian, Industrial, Parametric, Tropical Modern, Vernacular).
2. NEVER force every building into a tropical modern style or civic hall with coconut palms and teak slats. If the student specifies a Cyberpunk Arena with obsidian, dark concrete, and neon, critique and enhance THAT specific style and materiality.
3. If and only if the student specifies Philippine context, tropical climate, or local board exam typologies (PD 1096 / BP 344), emphasize Philippine bioclimatic passive cooling (Amihan/Habagat, deep eaves, sunshading). For other styles, provide the corresponding structural, climatic, and environmental response.
4. Camera rules: Strict architectural photography rules (24mm tilt-shift lens or user-specified lens) with strictly vertical columns and mullions (zero keystoning / vertical convergence).
5. Crisp physical materiality (PBR roughness, authentic textures, real-world construction joints).
6. Quality standards: ArchDaily / V-Ray 6 / Octane Render benchmark, 8K resolution, explicit negative guardrails against AI distortion.`;

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
    { "category": "Environmental & Passive Strategy", "issue": "What was missing", "solution": "How to fix it" },
    { "category": "Materiality & Lighting", "issue": "What was missing", "solution": "How to fix it" }
  ],
  "philippineContextNotes": [
    "Contextual tip on orientation, materiality, or climate response appropriate for this design"
  ],
  "detectedVisualFeatures": [
    "Feature detected from prompt or attached image"
  ],
  "enhancedPrompt": "The full, rich, studio-grade prompt ready to paste into Gemini for 8K rendering adhering faithfully to the student's chosen style and materials.",
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

      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          originalPrompt: userPrompt,
          enhancedPrompt: parsed.enhancedPrompt || generateLocalEnhancedPrompt(userPrompt, fileItem),
          critiquePoints: parsed.critiquePoints || generateLocalCritique(userPrompt, fileItem),
          philippineContextNotes: parsed.philippineContextNotes || (ctx.isTropicalOrPhilippine ? [
            'Orient major openings North-South to minimize direct solar heat gain in Philippine tropical sun.',
            'Incorporate Amihan (Northeast) & Habagat (Southwest) breezeways for natural ventilation.',
          ] : [
            'Envelope massing responds directly to solar exposure and microclimate airflow.',
            'Material specifications ensure high thermal performance and lifecycle endurance.',
          ]),
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
    philippineContextNotes: ctx.isTropicalOrPhilippine ? [
      'Philippine Tropical Sun: Major glazing oriented North-South; deep 2.5m overhangs prevent high heat gain.',
      'Prevailing Winds: Architectural breezeways positioned to channel Amihan (cool Northeast wind) and Habagat.',
      'Philippine Building Code: Retain mandatory front setbacks (PD 1096) and 1:12 PWD access ramps (BP 344).',
    ] : [
      'Thermal Envelope: High-performance envelope assemblies mitigate localized urban microclimate heating.',
      'Structural Life Safety: Assembly egress portals and structural load paths engineered for severe loading.',
    ],
    detectedVisualFeatures: fileItem
      ? [
          `Reference file attached: ${fileItem.name}`,
          'Volumetric massing proportions locked to prevent AI distortion',
          ctx.isTropicalOrPhilippine ? 'Bioclimatic tropical passive strategies applied' : 'Structural articulation and materiality locked',
        ]
      : undefined,
    qualityScore: 94,
  };
}

export function generateLocalCritique(raw: string, fileItem?: UploadedFileItem) {
  const points = [];
  const lower = raw.toLowerCase();
  const ctx = detectArchitecturalContext(raw, fileItem);

  if (fileItem && fileItem.mimeType.startsWith('image/')) {
    points.push({
      category: 'Visual Sketch & Massing Translation',
      issue: 'Standard AI models often distort hand-drawn linework and alter original building proportions.',
      solution: `Locked volumetric geometry and roofline proportions based on attached reference (${fileItem.name}).`,
    });
  }

  const mentionsCamera = lower.includes('lens') || lower.includes('camera') || lower.includes('perspective') || lower.includes('angle') || lower.includes("worm's-eye") || lower.includes('14mm') || lower.includes('24mm');
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
      solution: 'Locked eye-level 1.6m horizon line with plumb vertical mullions and zero keystoning distortion.',
    });
  }

  if (ctx.styleCategory === 'cyberpunk' || ctx.styleCategory === 'neo-brutalist') {
    points.push({
      category: 'Atmospheric Lighting & Specular Balance',
      issue: 'High-contrast nocturnal scenes often suffer from blown-out specular highlights or crushed facade shadows in standard AI renders.',
      solution: 'Balanced dynamic range (HDR) with diffuse rain reflections, matte obsidian surface absorption, and directional neon accent reveals.',
    });
  } else if (ctx.styleCategory === 'brutalist') {
    points.push({
      category: 'Tectonic Massing & Surface Relief',
      issue: 'Monolithic concrete requires expressive textural shuttering joints to prevent looking like a flat CG mass.',
      solution: 'Specified board-formed wood-grain relief, formwork tie-rod indents, and deep fenestration shadow reveals.',
    });
  } else {
    // Tropical or general architecture
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
  const ctx = detectArchitecturalContext(raw, fileItem);
  const lower = raw.toLowerCase();
  const fileNote = fileItem
    ? `\n- Visual Reference Translation: Faithfully preserve and elevate the architectural volumes, proportions, and spatial geometry seen in attached file "${fileItem.name}".`
    : '';

  // Determine setting & architectural language based on detected style
  let settingDesc = 'Contemporary architectural context with high-performance envelope and sustainable site integration.';
  let languageDesc = 'Articulated geometric volumes, horizontal screening, cantilevered floor plates, and transparent public concourses.';
  let materialsDesc = 'Architectural concrete, high-performance Low-E insulated glazing, and natural stone paving.';
  let entourageDesc = 'Landscaped pedestrian plaza, native shade trees, integrated linear bioswales, and human scale figures in natural motion blur.';

  if (ctx.styleCategory === 'cyberpunk' || ctx.styleCategory === 'neo-brutalist') {
    settingDesc = 'Dense futuristic urban metropolis with dramatic verticality, cybernetic transit conduits, and severe weather resilience.';
    languageDesc = 'Monolithic Neo-Brutalist massing with faceted obsidian rainscreen plates, deep structural shear volumes, and integrated linear LED luminaires.';
    materialsDesc = 'Matte-black obsidian stone panels, raw dark charcoal architectural concrete, anti-glare electrochromic glazing, and brushed dark alloy mullions.';
    entourageDesc = 'Slick wet reflective dark asphalt, subterranean drainage grates, subtle atmospheric mist, and urban pedestrians in contemporary dark attire.';
  } else if (ctx.styleCategory === 'brutalist') {
    settingDesc = 'Monumental civic / institutional urban setting celebrating permanent structural mass.';
    languageDesc = 'Monolithic board-formed beton brut concrete, rhythmic structural cantilevers, deep recessed fenestration reveals, and expressive waffle-slab soffits.';
    materialsDesc = 'Raw board-formed concrete with authentic wood-grain relief and tie-rod holes, dark anodized aluminum, fluted cast glass, and textured aggregate paving.';
    entourageDesc = 'Architectural reflecting pool, geometric granite steps, crushed gravel plinth, and solitary sculptural pine or birch tree.';
  } else if (ctx.styleCategory === 'scandinavian') {
    settingDesc = 'Nordic lakeside or alpine woodland terrain with pristine natural daylight.';
    languageDesc = 'Clean-lined timber post-and-beam construction, steeply pitched standing-seam gable roof, and panoramic thermal glazing framing the landscape.';
    materialsDesc = 'Kiln-dried light Siberian larch timber cladding, white-washed brick masonry, matte charcoal zinc roofing, and triple-glazed wood-aluminum frames.';
    entourageDesc = 'Natural pine woodland, granite stone outcroppings, native grasses, and a timber boardwalk.';
  } else if (ctx.styleCategory === 'minimalist') {
    settingDesc = 'Contemplative architectural sanctuary emphasizing spatial purity and natural light modulation.';
    languageDesc = 'Crisp geometric volumes, frameless floor-to-ceiling glazing, seamless shadow-reveal transitions, and quiet indoor-outdoor thresholds.';
    materialsDesc = 'Seamless bone-white or charcoal microcement, acoustic low-iron glass, honed limestone pavers, and brushed stainless steel profiles.';
    entourageDesc = 'Still water reflecting basin, raked gravel courtyard, single sculptural Japanese maple, and museum-grade indirect uplighting.';
  } else if (ctx.isTropicalOrPhilippine) {
    settingDesc = 'Philippine tropical modern context with integrated passive environmental strategies.';
    languageDesc = 'Clean contemporary lines, deep cantilevered roof eaves for monsoon rain protection, vertical timber solar brise-soleil screening, and floor-to-ceiling double-glazed Low-E glass.';
    materialsDesc = 'Off-form board-formed concrete with tie-rod seams, warm Philippine teak/cedar timber slats, honed travertine pavers, and clear reflective glass.';
    entourageDesc = 'Indigenous tropical landscaping (Narra shade trees, Royal Palms, Frangipani/Calachuchi, Monstera Deliciosa), linear reflecting water pool, and 2 to 3 minimalist human scale figures in natural motion blur wearing neutral clothing.';
  }

  // Camera viewpoint & lens
  let cameraViewpoint = 'Eye-level two-point perspective shot from human height (1.6m horizon line).';
  let cameraLens = 'Shot on an architectural 24mm tilt-shift lens (Hasselblad H6D-100c format).';
  if (lower.includes('14mm') || lower.includes("worm's-eye") || lower.includes("worm's eye") || lower.includes('low-angle')) {
    cameraViewpoint = "Extreme low-angle worm's-eye perspective looking dramatically up at the towering facade with heroic scale.";
    cameraLens = 'Shot on an ultra-wide 14mm architectural lens with zero keystoning distortion.';
  } else if (lower.includes('aerial') || lower.includes('drone') || lower.includes("bird's-eye")) {
    cameraViewpoint = 'Elevated 45-degree oblique drone perspective showing full roofscape and site perimeter.';
    cameraLens = 'Medium-format aerial camera with sharp edge-to-edge resolution.';
  } else if (lower.includes('elevation')) {
    cameraViewpoint = 'Direct frontal orthographic elevation projection aligned parallel to primary facade.';
    cameraLens = '50mm architectural tilt-shift lens with zero perspective convergence.';
  }

  // Lighting & atmosphere
  let lightingAtmosphere = 'Golden hour late-afternoon sunlight (3200K) casting soft, elongated 45-degree diagonal shadows across textured facade planes, with luminous warm 2700K interior cove lighting visibly glowing through transparent glass.';
  if (lower.includes('neon') || lower.includes('downpour') || lower.includes('cyberpunk') || lower.includes('rain')) {
    lightingAtmosphere = 'Atmospheric nighttime torrential downpour with fine rain droplets grazing the surfaces, volumetric atmospheric mist, and vibrant neon crimson and electric cyan directional accents reflecting across wet reflective asphalt and stone concourses.';
  } else if (lower.includes('blue hour') || lower.includes('dusk') || lower.includes('night')) {
    lightingAtmosphere = 'Dramatic dusk twilight blue-hour illumination with deep cobalt sky, glowing interior architectural light pools, and precise exterior uplighting.';
  } else if (lower.includes('overcast') || lower.includes('diffuse')) {
    lightingAtmosphere = 'Soft diffuse overcast daylight with gentle ambient occlusion shadows, highlighting subtle material textural variations without harsh glare.';
  }

  return `**Architectural Visualization Directive: High-Definition Presentation Render**

**Subject & Architectural Concept:**
${cleaned}${fileNote}
- Setting: ${settingDesc}
- Architectural Language: ${languageDesc}

**Camera & Perspective Framing (Studio Critical):**
- Viewpoint: ${cameraViewpoint}
- Lens: ${cameraLens}
- **STRICT CONSTRAINT**: All vertical columns, mullions, and wall edges MUST remain strictly parallel and plumb. Zero vertical convergence or perspective keystoning distortion.

**Lighting & Atmosphere:**
- ${lightingAtmosphere}

**Materiality & Entourage:**
- Materials: ${materialsDesc}
- Entourage: ${entourageDesc}

**Output Fidelity & Guardrails:**
- Quality: ArchDaily / Dezeen editorial photography, V-Ray 6 and Octane Render benchmark, razor-sharp 8k resolution, physically based rendering (PBR).
- **NEGATIVE PROMPT (Strict Guardrails):** No warped columns, no curved vertical lines, no sagging roofs, no deformed hands/anatomy, no blurry pixelated textures, no oversaturated plastic colors, no cartoon illustrations.`;
}
