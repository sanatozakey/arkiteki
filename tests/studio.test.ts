import { describe, it, expect } from 'vitest';
import { 
  classifyArchitecturalIntent, 
  generateArchitecturalFloorPlanSvg,
  generateLocalEnhancedPrompt,
  generateLocalCritique
} from '../src/utils/geminiApi';

describe('Task 2: Focused Architectural AI Studio System', () => {
  describe('Architectural Intent Classification', () => {
    it('identifies exterior render requests', () => {
      const intent = classifyArchitecturalIntent(
        'modern 2-storey city hall exterior with ceremonial stairs and tropical landscaping',
        false
      );
      expect(intent).toBe('exterior-render');
    });

    it('identifies interior render requests', () => {
      const intent = classifyArchitecturalIntent(
        'warm residential living room interior with timber louvers and cove lighting',
        false
      );
      expect(intent).toBe('interior-render');
    });

    it('identifies floor plan requests', () => {
      const intent = classifyArchitecturalIntent(
        'architectural floor plan layout for a community health center with zoning and setbacks',
        false
      );
      expect(intent).toBe('floor-plan');
    });

    it('identifies elevation and section requests', () => {
      const intent = classifyArchitecturalIntent(
        'front facade elevation and building cross-section with brise-soleil',
        false
      );
      expect(intent).toBe('elevation-section');
    });

    it('identifies sketch-redesign when an image/sketch is attached', () => {
      const intent = classifyArchitecturalIntent(
        'render this concept into a photorealistic modern building',
        true
      );
      expect(intent).toBe('sketch-redesign');
    });
  });

  describe('CAD Architectural Floor Plan Linework (SVG)', () => {
    it('generates valid vector SVG with dimensions, north arrow, and room spaces', () => {
      const svg = generateArchitecturalFloorPlanSvg('Community Clinic');
      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 1200 800"');
      expect(svg).toContain('COMMUNITY CLINIC');
      expect(svg).toContain('CIVIC ATRIUM');
      expect(svg).toContain('BP 344');
      expect(svg).toContain('AMIHAN');
      expect(svg).toContain('HABAGAT');
      expect(svg).toContain('</svg>');
    });
  });

  describe('Philippine Bioclimatic Architectural Intelligence', () => {
    it('injects 24mm tilt-shift plumb architectural rules and negative AI guardrails', () => {
      const prompt = generateLocalEnhancedPrompt('sustainable tropical resort in palawan');
      expect(prompt).toContain('tilt-shift');
      expect(prompt).toContain('STRICT CONSTRAINT');
      expect(prompt).toContain('strictly parallel and plumb');
      expect(prompt).toContain('Zero vertical convergence');
      expect(prompt).toContain('NEGATIVE PROMPT');
      expect(prompt).toContain('No warped columns');
    });

    it('incorporates Amihan and Habagat wind ventilation and tropical solar strategies', () => {
      const critiques = generateLocalCritique('modern villa');
      const critiqueCategories = critiques.map((c) => c.category);
      expect(critiqueCategories).toContain('Camera & Horizon Control');
      expect(critiqueCategories).toContain('Philippine Tropical Context');
      expect(critiqueCategories).toContain('Render Engine & Guardrails');
    });
  });

  describe('Photorealistic Architectural Rendering Pipeline & Fallback Prevention', () => {
    it('strictly validates real raster images and rejects SVGs or cartoon vectors', async () => {
      const { validateGeneratedImage } = await import('../src/utils/geminiApi');

      // Valid minimal PNG data URL
      const validPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      expect(validateGeneratedImage(validPng).isValid).toBe(true);

      // Valid minimal JPEG data URL
      const validJpeg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
      expect(validateGeneratedImage(validJpeg).isValid).toBe(true);

      // Rejects SVG vector illustrations
      const svgIllustration = 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100"><rect width="100" height="100"/></svg>';
      expect(validateGeneratedImage(svgIllustration).isValid).toBe(false);

      // Rejects invalid strings
      expect(validateGeneratedImage(undefined).isValid).toBe(false);
      expect(validateGeneratedImage('').isValid).toBe(false);
      expect(validateGeneratedImage('https://example.com/render.png').isValid).toBe(true);
    });

    it('exposes the official Gemini Image Generation models (Nano Banana, 3 Pro, 3.1 Flash)', async () => {
      const { 
        IMAGE_GENERATION_MODELS, 
        ARCHITECTURAL_CAMERA_VIEWS, 
        ARCHITECTURAL_VISUAL_STYLES,
        CAMERA_VIEW_KEYS,
        VISUAL_STYLE_KEYS
      } = await import('../src/utils/geminiApi');

      const modelIds = IMAGE_GENERATION_MODELS.map((m) => m.id);
      expect(modelIds).toContain('gemini-nano-banana-2.1');
      expect(modelIds).toContain('gemini-3-pro-image');
      expect(modelIds).toContain('gemini-3.1-flash-image');

      expect(CAMERA_VIEW_KEYS).toContain('hero-perspective');
      expect(CAMERA_VIEW_KEYS).toContain('front-elevation');
      expect(CAMERA_VIEW_KEYS).toContain('aerial-drone');
      expect(CAMERA_VIEW_KEYS).toContain('eye-level-plaza');
      expect(CAMERA_VIEW_KEYS).toContain('facade-detail');

      expect(ARCHITECTURAL_CAMERA_VIEWS['hero-perspective'].label).toBeDefined();
      expect(ARCHITECTURAL_CAMERA_VIEWS['front-elevation'].promptModifier).toContain('elevation');

      expect(VISUAL_STYLE_KEYS).toContain('photography');
      expect(VISUAL_STYLE_KEYS).toContain('vray-cgi');
      expect(ARCHITECTURAL_VISUAL_STYLES['vray-cgi'].label).toBeDefined();
    });

    it('generateInAppImage does NOT return synthetic SVG fallbacks when API fails', async () => {
      const { generateInAppImage } = await import('../src/utils/geminiApi');
      const res = await generateInAppImage({
        apiKey: 'dummy_key',
        prompt: 'Tropical Civic Center with deep eaves and wood louvers',
        aspectRatio: '16:9',
      });

      // Must NOT return an imageUrl with an SVG cartoon fallback
      expect(res.imageUrl).toBeNull();
      // Must report honest actionable error
      expect(res.error).toBeDefined();
      expect(res.error).toContain('API key not valid');
    });

    it('synthesizeArchitecturalSpecification constructs photorealistic prompt with 24mm tilt-shift and bioclimatics', async () => {
      const { synthesizeArchitecturalSpecification } = await import('../src/utils/geminiApi');
      const spec = await synthesizeArchitecturalSpecification({
        apiKey: 'dummy_key',
        reasoningModel: 'gemini-3.8-flash',
        prompt: 'modern 2-storey city hall in Sorsogon with whale shark canopy, timber louvers, and public plaza',
        aspectRatio: '16:9',
        resolution: '2K',
        visualStyle: 'photography',
        viewType: 'hero-perspective',
      });

      expect(spec.conceptStatement).toBeDefined();
      expect(spec.materialPalette.length).toBeGreaterThan(0);
      expect(spec.environmentalAnalysis.solarOrientation).toBeDefined();
      expect(spec.photorealisticPrompt).toContain('24mm tilt-shift');
      expect(spec.photorealisticPrompt).toContain('plumb and straight');
      expect(spec.architecturalSpec.negativeConstraints).toContain('cartoon');
    });
  });
});

