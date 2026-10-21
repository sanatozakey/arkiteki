export type AppTab = 'quiz' | 'improver' | 'calculator' | 'saved';

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'identification' | 'situational';
  question: string;
  options?: string[]; // 4 choices (A, B, C, D)
  correctAnswer: number; // 0, 1, 2, 3
  explanation: string;
  category?: string;
  codeReference?: string; // e.g. "PD 1096 Sec. 704" or "BP 344 Rule II"
}

export interface FlashcardItem {
  id: string;
  front: string; // Term, Concept, or Question
  back: string; // Answer, Code Rule, or Formula
  category: string;
  hint?: string;
}

export interface QuizDeck {
  id: string;
  title: string;
  subject: string;
  description: string;
  badge: string;
  questionCount: number;
  questions: QuizQuestion[];
  flashcards: FlashcardItem[];
}

export interface UploadedFileItem {
  name: string;
  size: number;
  type: string;
  base64Data?: string;
  dataUrl?: string; // Data URL for image rendering & previews
  mimeType: string;
  textPreview?: string;
}

export interface PromptCritiqueResult {
  originalPrompt: string;
  enhancedPrompt: string;
  critiquePoints: {
    category: string;
    issue: string;
    solution: string;
  }[];
  philippineContextNotes: string[];
  qualityScore: number;
  detectedVisualFeatures?: string[];
}

export interface SavedPromptItem {
  id: string;
  title: string;
  category: string;
  prompt: string;
  timestamp: number;
  tags: string[];
}

export type GeminiModelId = 'gemini-3.8-flash' | 'gemini-2.0-flash' | 'gemini-3.5-flash-lite' | 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gemini-2.5-flash';

export interface InAppStudioResult {
  imageUrl?: string;
  imageSource?: 'gemini-image' | 'imagen-3' | null;
  conceptStatement: string;
  materialPalette: { material: string; application: string; rationale: string }[];
  environmentalAnalysis: {
    solarOrientation: string;
    windChanneling: string;
    stormWaterStrategy: string;
  };
  jurorDefenseTips: { question: string; suggestedAnswer: string }[];
  modelUsed: string;
  timestamp: number;
}

export type SDPMode = 'linework-render' | 'concept-masterplan';
export type PerspectiveMode = 'revit-viewport' | 'concept-render' | 'interior' | 'axonometric';

export interface SDPOptions {
  mode: SDPMode;
  projectTypology: string;
  renderStyle: string;
  climateBiome: string;
  lotShape: string;
  scaleAndSize: string;
  includeContours: boolean;
  contourInterval: string;
  includeVehicular: boolean;
  vehicularDetails: string[];
  includePedestrian: boolean;
  pedestrianDetails: string[];
  vegetationDensity: 'sparse' | 'balanced' | 'dense-lush';
  vegetationTypes: string[];
  includeWaterFeatures: boolean;
  waterFeatureType: string;
  sunAndShadows: string;
  includeNorthArrow: boolean;
  includeScaleBar: boolean;
  includePropertyLine: boolean;
  colorPalette: string;
  qualityLevel: string;
  aspectRatio: string;
  customNotes: string;
}

export interface PerspectiveOptions {
  mode: PerspectiveMode;
  projectTypology: string;
  architecturalStyle: string;
  cameraView: string;
  verticalsCorrection: boolean;
  timeOfDay: string;
  weatherAtmosphere: string;
  facadeMaterials: string[];
  landscapeContext: string;
  entourageScale: string;
  interiorStyle?: string;
  roomType?: string;
  axonometricCut?: string;
  renderingEngineLook: string;
  cameraLens: string;
  customDetails: string;
  aspectRatio: string;
}

export interface RevitCadOptions {
  softwareSource: 'Revit' | 'AutoCAD' | 'Rhino' | 'Sketchup';
  exportType: '2D Site Plan' | '3D Hidden Line Wireframe' | 'Shaded View' | 'Enscape Clay Render' | 'Floor Plan';
  targetStyle: string;
  geometryStrictness: 'Strict Geometry (Do Not Alter Linework)' | 'Allow Gentle AI Embellishment' | 'Conceptual Freedom';
  keyMaterialsToApply: string;
  lightingSetup: string;
  presentationBoardIntent: string;
}

export interface ConceptStatementOptions {
  projectTitle: string;
  typology: string;
  locationContext: string;
  coreInspirations: string;
  sustainabilityFeatures: string[];
  spatialPhilosophy: string;
  tone: 'Poetic & Phenomenological' | 'Modern & Analytical' | 'Sustainable & Biophilic' | 'Urban & Visionary';
}

export interface PromptPreset {
  id: string;
  title: string;
  subtitle: string;
  category: 'sdp' | 'perspective' | 'revit' | 'interior' | 'commercial' | 'cityhall';
  badge: string;
  description: string;
  prompt: string;
  tags: string[];
  recommendedRatio: string;
  useCase: string;
}
