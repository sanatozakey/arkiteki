import type { SDPOptions, PerspectiveOptions, RevitCadOptions, ConceptStatementOptions } from '../types';

export function buildSDPPrompt(options: SDPOptions): string {
  const isLinework = options.mode === 'linework-render';

  const sections: string[] = [];

  // Header & Role
  sections.push(`**Architectural Visualization Request: Site Development Plan (SDP)**`);
  sections.push(
    `**Role & Mandate:**\nAct as a master architectural landscape visualizer and urban masterplanner. Generate a presentation-ready, high-definition Site Development Plan (SDP) for a **${options.projectTypology}** project.`
  );

  // Mode Specific Directive
  if (isLinework) {
    sections.push(
      `**UNDERLAY DIRECTIVE (Strict CAD/Revit Linework Underlay):**\n` +
      `- The attached image is a 2D architectural site drawing exported from CAD/Revit.\n` +
      `- TREAT THIS DRAWING AS A STRICT GEOMETRIC MASK. Do NOT alter building footprints, property boundaries, road curves, or lot dimensions.\n` +
      `- Render textures and landscaping directly onto the provided linework while keeping all architectural edges crisp and orthogonal.`
    );
  } else {
    sections.push(
      `**PROJECTION & CAMERA RULES (Critical for Site Plans):**\n` +
      `- View: STRICTLY 90-degree top-down orthographic overhead aerial projection (true 2D plan view).\n` +
      `- NO perspective angle, NO diagonal bird's eye tilt, NO horizon line in the background.\n` +
      `- Lot Shape & Layout: ${options.lotShape || 'Regular urban parcel with defined property boundaries'}.\n` +
      `- Program Scale: ${options.scaleAndSize || 'Medium-scale masterplan with clear zoning hierarchy'}.`
    );
  }

  // Graphic Style
  sections.push(
    `**Graphic & Rendering Style:**\n` +
    `- Selected Aesthetic: **${options.renderStyle}**.\n` +
    `- Color Palette: ${options.colorPalette}.\n` +
    `- Texture Hierarchy: Crisp contrast between building masses, hardscaping, vehicular circulation, and lush landscaping.`
  );

  // Landscape & Biome
  sections.push(
    `**Landscape & Biome Context:**\n` +
    `- Climate Biome: **${options.climateBiome}**.\n` +
    `- Vegetation Density: **${options.vegetationDensity}**.\n` +
    `- Canopy Details: ${
      options.vegetationTypes.length > 0
        ? options.vegetationTypes.join('; ')
        : 'Layered shade tree canopies with translucent circular foliage and soft ambient drop shadows'
    }.`
  );

  // Vehicular & Pedestrian Circulation
  const circulationDetails: string[] = [];
  if (options.includeVehicular) {
    circulationDetails.push(
      `Vehicular Circulation: Smooth dark charcoal asphalt road surfaces with crisp white turn arrows, crosswalk pedestrian stripes, and organized parking bays (${
        options.vehicularDetails.length > 0 ? options.vehicularDetails.join(', ') : 'standard access lanes'
      }).`
    );
  }
  if (options.includePedestrian) {
    circulationDetails.push(
      `Pedestrian Network: Textured interlocking modular concrete pavers, pedestrian promenades, shaded outdoor seating nodes, and continuous accessible pathways (${
        options.pedestrianDetails.length > 0 ? options.pedestrianDetails.join(', ') : 'permeable paving tiles'
      }).`
    );
  }
  if (circulationDetails.length > 0) {
    sections.push(`**Circulation Systems:**\n${circulationDetails.map((c) => `- ${c}`).join('\n')}`);
  }

  // Water, Contours & Site Features
  const siteFeatures: string[] = [];
  if (options.includeWaterFeatures) {
    siteFeatures.push(`Water Bodies: ${options.waterFeatureType || 'Linear reflecting pools and natural bioswale drainage corridors with subtle water ripples'}.`);
  }
  if (options.includeContours) {
    siteFeatures.push(`Topography: Subtle architectural contour elevation lines (spaced at ${options.contourInterval || '1.0m intervals'}) reflecting natural terrain slopes.`);
  }
  if (options.sunAndShadows) {
    siteFeatures.push(`Sun & Shadows: Directional solar lighting casting soft, distinct 45-degree ambient drop shadows to communicate vertical building heights and tree canopies.`);
  }
  if (options.includeNorthArrow) {
    siteFeatures.push(`Architectural Entourage: Minimalist graphic North arrow symbol positioned in the upper corner.`);
  }
  if (options.includeScaleBar) {
    siteFeatures.push(`Scale Notation: Clean graphic scale bar indicator at bottom corner.`);
  }
  if (options.includePropertyLine) {
    siteFeatures.push(`Property Boundary: Subtle dashed red or bold black site boundary line defining property setback lines.`);
  }

  if (siteFeatures.length > 0) {
    sections.push(`**Technical Site Features:**\n${siteFeatures.map((f) => `- ${f}`).join('\n')}`);
  }

  // Custom Notes
  if (options.customNotes && options.customNotes.trim()) {
    sections.push(`**Special Studio Requirements & Project Details:**\n${options.customNotes.trim()}`);
  }

  // High Quality & Negative Guardrails
  sections.push(
    `**Quality Benchmark & Guardrails:**\n` +
    `- Quality: Architectural presentation board standard, 8k resolution, razor-sharp vector-like linework, uncompressed textures, ArchDaily / Landscape Architecture Magazine quality.\n` +
    `- Recommended Aspect Ratio: **${options.aspectRatio}**.\n` +
    `- **STRICT NEGATIVE PROMPT (Avoid):** NO tilted camera angles, NO 3D perspective distortion, NO curved horizon lines, NO blurry pixelated trees, NO nonsensical roads leading nowhere, NO melted building footprints, NO oversaturated fantasy colors.`
  );

  return sections.join('\n\n');
}

export function buildPerspectivePrompt(options: PerspectiveOptions): string {
  const sections: string[] = [];

  sections.push(`**Architectural Visualization Request: High-Definition Perspective**`);

  // Viewpoint & Framing
  sections.push(
    `**Camera Framing & Viewpoint (Studio Standard):**\n` +
    `- View Type: **${options.cameraView}**.\n` +
    `- Lens & Format: Shot on a **${options.cameraLens || '24mm architectural tilt-shift lens (Hasselblad H6D-100c format)'}**.\n` +
    `- Vertical Correction: **${
      options.verticalsCorrection
        ? 'STRICT TWO-POINT PERSPECTIVE. All vertical columns, facade edges, and walls MUST remain strictly parallel and plumb. Zero vertical convergence or keystoning distortion.'
        : 'Natural perspective framing'
    }`
  );

  // Subject & Architecture
  sections.push(
    `**Project Typology & Style:**\n` +
    `- Typology: **${options.projectTypology}**.\n` +
    `- Architectural Style: **${options.architecturalStyle}**.\n` +
    `- Materials & Textures: ${
      options.facadeMaterials.length > 0
        ? options.facadeMaterials.join(', ')
        : 'Board-formed exposed concrete, floor-to-ceiling Low-E glass, warm timber screening'
    }.`
  );

  // Atmosphere & Lighting
  sections.push(
    `**Atmosphere, Lighting & Mood:**\n` +
    `- Time of Day / Solar Setup: **${options.timeOfDay}**.\n` +
    `- Weather & Ambiance: **${options.weatherAtmosphere}**.\n` +
    `- Interior Illumination: Warm 2700K-3000K interior lighting softly visible through transparent floor-to-ceiling glazed facades, showcasing depth and interior volume.`
  );

  // Context & Entourage
  sections.push(
    `**Site Context & Scale Entourage:**\n` +
    `- Surrounding Environment: ${options.landscapeContext}.\n` +
    `- Entourage: ${options.entourageScale} (architectural human scale figures in natural motion blur, dressed in understated neutral tones, ensuring accurate sense of proportion).`
  );

  // Custom Details
  if (options.customDetails && options.customDetails.trim()) {
    sections.push(`**Specific Project Features & Design Elements:**\n${options.customDetails.trim()}`);
  }

  // Quality & Render Engine
  sections.push(
    `**Rendering Fidelity & Output Quality:**\n` +
    `- Render Engine Benchmark: **${options.renderingEngineLook}** (Physically Based Rendering, global illumination, raytraced reflections, accurate ambient occlusion).\n` +
    `- Image Quality: 8K ultra-sharp definition, uncompressed RAW photograph feel, micro-surface roughness visible on materials.\n` +
    `- Target Aspect Ratio: **${options.aspectRatio}**.\n` +
    `- **NEGATIVE PROMPT (Crucial Guardrails):** NO warped columns, NO sagging roofs, NO melted AI anatomy/hands, NO crooked verticals, NO plastic-looking fake greenery, NO exaggerated oversaturation.`
  );

  return sections.join('\n\n');
}

export function buildRevitCadPrompt(options: RevitCadOptions): string {
  return `**Multimodal Architecture Prompt: ${options.softwareSource} ${options.exportType} to Presentation Render**

**Uploaded Image Context:**
The attached file is an architectural ${options.exportType} exported directly from **${options.softwareSource}**.

**Geometric Rule:**
- **${options.geometryStrictness}**
- Retain the exact proportions, column spacing, openings, floor-to-floor heights, and perspective viewport angles established in the ${options.softwareSource} model.
- Do NOT alter structural geometries or invent structural members that conflict with the linework.

**Materials & Surface Finishes to Apply:**
${options.keyMaterialsToApply}

**Lighting & Presentation Atmosphere:**
- Lighting Setup: ${options.lightingSetup}
- Presentation Intent: ${options.presentationBoardIntent}
- Selected Aesthetic Style: ${options.targetStyle}

**Quality & Graphic Standards:**
- Architectural photography standard, V-Ray / Corona benchmark realism, 8K ultra-high resolution.
- Sharp crisp edges, true-to-scale entourage figures, realistic glass reflections and physical material roughness.
- Eliminate raw wireframe gridlines while retaining absolute geometric precision.`;
}

export function buildConceptStatement(options: ConceptStatementOptions): string {
  const sustainabilityText = options.sustainabilityFeatures.length > 0
    ? `The design integrates passive environmental strategies including ${options.sustainabilityFeatures.join(', ')}.`
    : '';

  return `### Design Concept: ${options.projectTitle || 'Architectural Synthesis'}
**Typology:** ${options.typology} | **Context:** ${options.locationContext} | **Tone:** ${options.tone}

**Concept Statement (For Presentation Board / Jury Defense):**
"Conceived as a dialogue between form, light, and context, **${options.projectTitle || 'the project'}** addresses the challenges of contemporary ${options.typology.toLowerCase()} through the lens of ${options.coreInspirations || 'contextual harmony and structural clarity'}. 

The spatial configuration is rooted in the philosophy of *${options.spatialPhilosophy || 'fluid boundary between indoor sanctuary and natural landscape'}*, orchestrating a programmatic journey where circulation transitions seamlessly between solid protective enclosures and light-filled communal volumes. ${sustainabilityText}

By celebrating honest materiality—grounded in raw physical presence and tempered by delicate daylight interventions—the architecture creates a timeless, dignified civic presence that elevates the human experience while honoring its environmental threshold."`;
}

export function calculatePromptScore(prompt: string): { score: number; feedback: string[] } {
  let score = 50;
  const feedback: string[] = [];

  if (prompt.includes('90-degree') || prompt.includes('Two-point') || prompt.includes('tilt-shift') || prompt.includes('orthographic')) {
    score += 12;
    feedback.push('✓ Explicit architectural camera projection included');
  } else {
    feedback.push('⚠ Add camera angle or orthographic projection rule');
  }

  if (prompt.includes('concrete') || prompt.includes('timber') || prompt.includes('glass') || prompt.includes('travertine') || prompt.includes('materials')) {
    score += 10;
    feedback.push('✓ Rich material and texture definitions');
  }

  if (prompt.includes('Golden hour') || prompt.includes('diffused') || prompt.includes('lighting') || prompt.includes('shadows')) {
    score += 10;
    feedback.push('✓ Natural lighting condition & solar angle defined');
  }

  if (prompt.includes('8k') || prompt.includes('Hasselblad') || prompt.includes('V-Ray') || prompt.includes('photorealistic')) {
    score += 10;
    feedback.push('✓ High-definition 8K rendering benchmark specified');
  }

  if (prompt.includes('NEGATIVE PROMPT') || prompt.includes('STRICT NEGATIVE')) {
    score += 8;
    feedback.push('✓ Negative guardrails prevent AI warping and distortion');
  }

  return {
    score: Math.min(100, score),
    feedback,
  };
}
