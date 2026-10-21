import type { PromptPreset } from '../types';

export const PRESET_PROMPTS: PromptPreset[] = [
  {
    id: 'preset-sdp-photoshop',
    title: 'Site Development Plan: Photoshop Presentation Board',
    subtitle: 'High-detail 90° orthographic site plan with textured pavers, tree drop shadows & asphalt markings',
    category: 'sdp',
    badge: 'Critic Favorite',
    description: 'Perfect for presentation boards and studio critiques. Delivers a clean architectural Photoshop-rendered masterplan look without perspective distortion.',
    recommendedRatio: '16:9 or 4:3',
    useCase: 'Final Studio Plate / Thesis Site Plan Sheet',
    tags: ['Site Plan', 'Photoshop Style', 'Masterplan', 'Orthographic', 'Presentation'],
    prompt: `**Role & Architectural Intent:**
Act as a master architectural illustrator and landscape architect. Render a high-definition, award-winning architectural presentation Site Development Plan (SDP) in a clean Photoshop collage rendering style.

**View & Projection:**
- Strictly 90-degree top-down orthographic overhead aerial projection (true plan view, NOT angled perspective, NO horizon line, NO camera tilt).
- Keep all building geometries, property boundary lines, and access roads strictly orthogonal and dimensionally crisp.

**Site Typology & Program:**
- Typology: Mixed-Use Commercial and Residential Plaza.
- Clear delineation between building footprints (dark slate/graphite tone with crisp white roof terrace details), vehicular roads, and pedestrian circulation.

**Architectural Layers & Textures:**
1. Hardscaping: Interlocking modular concrete paving tiles with subtle tone shifts; smooth dark charcoal asphalt roads with crisp white painted crosswalks, turn arrows, and designated parking stalls.
2. Softscaping & Landscape: Dense tropical canopy trees viewed from above with semi-translucent circular foliage textures, each casting a soft 45-degree ambient drop shadow toward the northeast. Manicured lawn turf with subtle grain, perennial flower bed borders, and low ornamental hedge bands.
3. Water & Drainage: Linear reflecting pool with translucent turquoise water and subtle light caustics, alongside a landscaped bioswale edged with smooth river pebbles.
4. Entourage & Scale: Scaled outdoor cafe dining sets with patio umbrellas, minimalist bench seating nodes, and subtle human scale silhouettes cast on paving.

**Graphic Presentation Standards:**
- Architectural presentation quality, high contrast, clean muted Scandinavian palette with rich emerald greens and warm sand accents.
- Include a crisp minimalist North arrow graphic indicator and subtle linear contour lines at regular intervals.
- High-resolution, razor-sharp 8k linework, vector-like edge sharpness, no blurry textures, no AI artifacts, no warped geometries.`,
  },
  {
    id: 'preset-sdp-cad-underlay',
    title: 'AutoCAD / Revit Linework to Rendered SDP (Img2Img)',
    subtitle: 'Upload your CAD/Revit export to Gemini and transform it into a rendered presentation plan',
    category: 'sdp',
    badge: 'CAD to Render',
    description: 'Use this prompt when attaching an exported PDF or PNG from AutoCAD or Revit. It instructs Gemini to treat your lines as a strict geometric master mask.',
    recommendedRatio: 'Match Uploaded Image',
    useCase: 'When you already drafted the site in CAD/Revit and need it colorized for presentation',
    tags: ['CAD Underlay', 'Revit Linework', 'Multimodal', 'Colorization', 'Strict Geometry'],
    prompt: `**Task: Architectural Linework Colorization & Landscape Masterplan Rendering**

**Attached Image Directive:**
Use the attached 2D architectural site plan drawing as the STRICT and ABSOLUTE geometric blueprint. Do NOT alter, displace, warp, or reinvent the building footprints, property boundaries, road alignments, or lot dimensions. Every boundary in the attached drawing must remain 100% faithful to the CAD linework.

**Rendering Style & Execution:**
Transform the attached black-and-white 2D CAD linework into a master architectural presentation site plan in a modern Photoshop collage style:
- **Building Footprints**: Render with deep charcoal / warm off-white flat roof finishes, subtle mechanical penthouses, and green roof garden accents.
- **Vehicular Circulation**: Fill roadways with smooth matte asphalt texture, adding crisp white paint markings (arrows, crosswalks, striped parking slots).
- **Pedestrian Realm**: Apply warm honed travertine and interlocking concrete paver textures to all plazas and pathways with subtle ambient occlusion along building edges.
- **Landscape Architecture**: Fill landscape zones with lush, layered architectural tree canopies (top-down view) casting realistic 45-degree soft ambient shadows. Add shrub beds, turf grass textures, and ornamental planters.
- **Atmospheric Quality**: High-contrast, clean architectural magazine aesthetic, 8K ultra-definition, vector-level line fidelity, professional graphic hierarchy.`,
  },
  {
    id: 'preset-perspective-golden-hour',
    title: 'Tropical Modern Pavilion: Two-Point Golden Hour',
    subtitle: '2-Point eye-level perspective with strictly vertical lines, warm sunlight & lush biophilic concrete',
    category: 'perspective',
    badge: 'Eye-Level Hero',
    description: 'The definitive architectural hero perspective. Perfect for the main perspective sheet on your studio presentation board.',
    recommendedRatio: '16:9',
    useCase: 'Primary Exterior Perspective Plate',
    tags: ['Exterior', 'Golden Hour', 'Two-Point', 'Tilt-Shift', 'Board-Formed Concrete'],
    prompt: `**Architectural Visualization Brief: Hero Exterior Perspective**

**Subject & Typology:**
A multi-level Contemporary Tropical Modern Pavilion featuring dramatic cantilevers, exposed board-formed raw concrete walls with visible tie-rod holes, floor-to-ceiling recessed glass curtain walls, and horizontal warm charred cedar (Shou Sugi Ban) timber louvers.

**Camera & Composition:**
- Viewpoint: Eye-level two-point perspective shot from an approximate height of 1.6 meters.
- Lens & Framing: Shot on a 24mm architectural tilt-shift lens (Hasselblad H6D-100c format).
- **CRITICAL**: Strictly vertical parallel lines. Zero converging vertical keystoning; all building walls and columns remain perfectly plumb and vertical.
- Rule of thirds composition placing the main cantilevered entrance terrace at a dynamic focal point.

**Atmosphere & Lighting:**
- Golden hour lighting: Low late-afternoon sun positioned at 35 degrees, casting warm 3200K amber rays that graze the tactile concrete facade textures.
- Long dramatic diagonal cast shadows stretching across the polished concrete forecourt.
- Warm 2700K interior cove lighting visibly glowing through the transparent glass, revealing timber ceilings and double-height spatial depth.

**Environment & Entourage:**
- Biophilic landscaping with lush Monstera Deliciosa, mature frangipani trees, weeping bamboo, and hanging trailing vines cascading from upper balconies.
- A shallow linear reflecting pool at the base with subtle ripples and crystal-clear water reflections.
- 2 to 3 minimalist architectural human scale figures walking naturally with subtle motion blur, dressed in understated neutral clothing.

**Render Quality & Engine Benchmark:**
- Architectural photography, V-Ray 6 and Octane Render realism, razor-sharp focus throughout, photorealistic material roughness maps, physically based rendering (PBR), uncompressed 8k RAW clarity.
- **Negative Prompt Guardrails**: No distorted vertical lines, no curved horizons, no blurry surfaces, no weird deformed hands or faces, no fantastical AI floating geometry.`,
  },
  {
    id: 'preset-revit-clay-to-render',
    title: 'Revit 3D Hidden-Line / Clay to Photorealistic Render',
    subtitle: 'Take a plain Revit 3D viewport screenshot and prompt Gemini to render it with realistic materials',
    category: 'revit',
    badge: 'Revit Workflow',
    description: 'Export a 3D hidden-line or shaded view from Revit, paste this prompt in Gemini with the attachment, and watch it turn into a photorealistic architectural render.',
    recommendedRatio: 'Match Revit Viewport',
    useCase: 'Fast rendering for design progress critiques without waiting for hours in Lumion or Enscape',
    tags: ['Revit Viewport', 'Clay Render', 'Multimodal', 'Material Mapping', 'Fast Workflow'],
    prompt: `**Directive for Multimodal Architectural Visualization:**

**Input Reference:**
The uploaded image is a 3D architectural hidden-line / clay model exported directly from Autodesk Revit.

**STRICT Architectural Constraints:**
- Preserve the exact building geometry, volumetric proportions, roof pitch, window openings, column grid, and perspective angle seen in the image.
- Do NOT add random structural masses or change the architectural form.

**Material & Texture Application:**
- **Solid Wall Volumes**: Apply tactile board-formed off-white architectural concrete with realistic formwork seams.
- **Glazed Elements**: Convert white window wireframes into reflective double-glazed Low-E glass panels with dark bronze anodized aluminum mullions; show subtle internal reflections and glowing warm interior illumination.
- **Ceiling & Soffits**: Clad exterior roof overhangs with warm natural white oak timber slats.
- **Balconies & Railings**: Render with minimalist frameless structural glass balustrades with stainless steel top caps.
- **Surrounding Ground**: Replace the blank ground plane with smooth poured concrete pavers, manicured ornamental grass beds, and architectural landscape lighting bollards.

**Lighting & Atmosphere:**
- Bright diffused Nordic overcast daylight with soft, natural ambient occlusion under cantilevers and roof eaves.
- Subtle sky with soft white clouds, avoiding dramatic distractions.
- Publication-grade architectural photography, ArchDaily / Dezeen editorial quality, sharp 8k textures, physically accurate global illumination.`,
  },
  {
    id: 'preset-interior-one-point',
    title: 'Double-Height Atrium: Interior One-Point Perspective',
    subtitle: 'Balanced central perspective framing natural daylight penetration, timber louvers & spatial volume',
    category: 'interior',
    badge: 'Interior Volume',
    description: 'Showcases spatial hierarchy, natural lighting, and interior materiality for community centers, libraries, and residential atriums.',
    recommendedRatio: '4:3 or 16:9',
    useCase: 'Interior Perspective Plate / Spatial Study',
    tags: ['Interior', 'One-Point', 'Double-Height', 'Daylight', 'Timber Louvers'],
    prompt: `**Interior Architectural Visualization: Double-Height Central Atrium**

**View & Framing:**
- One-point central perspective looking down the main circulation spine toward a floor-to-ceiling glass wall framing an outdoor bamboo courtyard.
- Horizon line set at human eye level (1.55m). Strict one-point perspective with vanishing point centered; vertical walls and columns are strictly parallel.

**Spatial Features & Program:**
- Monumental double-height volume featuring a sculpted open-tread steel and oak cantilevered staircase with glass balustrade.
- Rhythmic vertical timber acoustic battens lining the high atrium walls.
- Polished microcement flooring with subtle reflection of ambient daylight.
- Sunken conversation seating lounge with warm neutral linen upholstery and integrated minimalist book shelving.

**Lighting & Chiaroscuro:**
- Diffused morning sunlight streaming through high-level clerestory skylights, creating subtle god rays / atmospheric light shafts through the volume.
- Recessed architectural linear magnetic track lighting providing subtle warm 3000K accent grazing along textured concrete feature walls.

**Details & Realism:**
- Architectural scale figures engaging naturally with the space (one person walking on the mezzanine, two seated in the sunken lounge).
- Potted Ficus Lyrata and trailing indoor foliage on upper balconies.
- Photorealistic architectural photography, shot on Hasselblad H6D-100c with 28mm wide lens, pin-sharp details, high dynamic range (HDR), zero lens distortion.`,
  },
  {
    id: 'preset-axonometric-exploded',
    title: 'Exploded Axonometric Diagram (BIG / UNStudio Style)',
    subtitle: 'Isometric exploded view showing structural layers, spatial program & environmental circulation',
    category: 'revit',
    badge: 'Thesis Diagram',
    description: 'Diagrammatic exploded axonometric showing structural slabs, envelope facade, interior program, and passive ventilation airflows.',
    recommendedRatio: '3:4 or 1:1',
    useCase: 'Concept & Technical Presentation Board Sheet',
    tags: ['Axonometric', 'Exploded View', 'Diagrammatic', 'BIG Style', 'Environmental Analysis'],
    prompt: `**Architectural Concept Diagram: Exploded 3D Axonometric**

**Projection & Geometry:**
- True 30-degree / 60-degree isometric axonometric projection (parallel projection, zero perspective vanishing points, uniform scale).
- Clean white paper background with soft ambient drop shadows under the floating components.

**Exploded Layering Hierarchy:**
The building is vertically exploded into 4 distinct floating architectural layers:
1. **Top Layer**: Green roof system with photovoltaic solar panels, skylights, and intensive green turf.
2. **Second Layer**: Lightweight timber glulam roof trusses and perforated solar shading louvers.
3. **Third Layer**: High-transparency glazed floor plate highlighting interior spatial partitions, furniture clusters, and structural core.
4. **Bottom Layer**: Reinforced concrete podium foundation rooted in site topography with subterranean parking and rainwater collection cistern.

**Graphic Style & Annotations:**
- Bjarke Ingels Group (BIG) diagrammatic aesthetic: crisp vector outlines, pastel-toned color coding for functional zones (e.g., pale peach for residential, soft sage for public realm, muted slate for circulation).
- Semi-translucent colored airflow arrows illustrating passive stack effect ventilation and solar sun angle vectors.
- Sharp architectural linework, high resolution, minimalist museum graphic standard.`,
  },
];
