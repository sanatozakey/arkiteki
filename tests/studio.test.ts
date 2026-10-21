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

  describe('Architectural Perspective Visual Rendering', () => {
    it('generates high-fidelity architectural perspective SVG with 24mm tilt-shift alignment and authentic materials', async () => {
      const { generateArchitecturalPerspectiveSvg } = await import('../src/utils/geminiApi');
      const svg = generateArchitecturalPerspectiveSvg('Modern Community Civic Center', '16:9');

      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 1200 675"');
      expect(svg).toContain('ARKITEKI ARCHITECTURAL VISUALIZATION');
      expect(svg).toContain('24mm TILT-SHIFT PERSPECTIVE');
      expect(svg).toContain('MODERN COMMUNITY CIVIC CENTER');
      expect(svg).toContain('concretePlanks');
      expect(svg).toContain('timberSlats');
      expect(svg).toContain('glassGrad');
      expect(svg).toContain('BP 344 Universal Accessibility Entry Ramp');
      expect(svg).toContain('</svg>');
    });

    it('adapts viewBox dimensions to requested aspect ratios (16:9, 4:3, 1:1)', async () => {
      const { generateArchitecturalPerspectiveSvg } = await import('../src/utils/geminiApi');
      
      const svg16_9 = generateArchitecturalPerspectiveSvg('Test Plate', '16:9');
      expect(svg16_9).toContain('viewBox="0 0 1200 675"');

      const svg4_3 = generateArchitecturalPerspectiveSvg('Test Plate', '4:3');
      expect(svg4_3).toContain('viewBox="0 0 1200 900"');

      const svg1_1 = generateArchitecturalPerspectiveSvg('Test Plate', '1:1');
      expect(svg1_1).toContain('viewBox="0 0 1200 1200"');
    });

    it('generateInAppImage returns a valid visual deliverable with imageUrl and source', async () => {
      const { generateInAppImage } = await import('../src/utils/geminiApi');
      const res = await generateInAppImage({
        apiKey: 'dummy_key',
        prompt: 'Tropical Civic Center with deep eaves and wood louvers',
        aspectRatio: '16:9',
      });

      expect(res).not.toBeNull();
      expect(res?.imageUrl).toBeDefined();
      expect(res?.imageUrl).toMatch(/^data:image\//);
      expect(res?.source).toBeDefined();
    });
  });
});
