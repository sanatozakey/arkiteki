export const SDP_TYPOLOGIES = [
  'Residential Subdivision & Clubhouse',
  'Mixed-Use Commercial & Retail Plaza',
  'Institutional University Campus',
  'Tropical Eco-Tourism Beach Resort',
  'Civic Cultural Center & Museum Park',
  'High-Rise Residential Podium & Public Realm',
  'Healthcare & Wellness Retreat Center',
  'Urban Transit-Oriented Development (TOD)',
  'Industrial Tech Park & Innovation Hub',
  'Community Library & Botanical Gardens',
];

export const SDP_RENDER_STYLES = [
  {
    id: 'photoshop-board',
    name: 'Photoshop Architectural Board Style',
    desc: 'The gold standard for studio critiques: crisp CAD outlines, photorealistic textures for asphalt/grass, rich tree canopy shadows at 45°, and delicate pastel zoning.',
    badge: 'Critic Favorite',
    previewColor: 'from-emerald-900 to-teal-950',
  },
  {
    id: 'big-diagrammatic',
    name: 'BIG (Bjarke Ingels) Diagrammatic',
    desc: 'Crisp minimalist white paper background, subtle soft-colored zoning washes, bold graphic movement vectors, and stylized entourage.',
    badge: 'Concept & Thesis',
    previewColor: 'from-amber-950 to-stone-900',
  },
  {
    id: 'drone-photorealistic',
    name: 'HD Aerial Drone Orthomosaic',
    desc: 'Ultra-realistic high-altitude 90-degree satellite/drone look with natural sunlight, accurate asphalt weathering, real grass textures, and depth.',
    badge: 'Hyper-Realistic',
    previewColor: 'from-blue-950 to-indigo-950',
  },
  {
    id: 'watercolor-masterplan',
    name: 'Artistic Watercolor & Ink Masterplan',
    desc: 'Soft architectural watercolor washes, fine 0.2mm pen outlines, organic texture transitions, and a warm hand-rendered artistic presence.',
    badge: 'Artistic & Evocative',
    previewColor: 'from-rose-950 to-slate-900',
  },
  {
    id: 'minimalist-emerald',
    name: 'Monochrome CAD Line with Emerald Landscape',
    desc: 'High-contrast architectural black-and-white linework with striking monochromatic architectural masses and lush, vivid emerald green landscape accents.',
    badge: 'Clean & Contemporary',
    previewColor: 'from-zinc-900 to-emerald-950',
  },
];

export const SDP_CLIMATE_BIOMES = [
  'Tropical Southeast Asian (Lush rainforest, Frangipani, Coconut palms, Monsoon swales)',
  'Temperate Woodland (Mature Oak, Maple, seasonal flowering trees, green turf lawns)',
  'Mediterranean / Coastal (Olive trees, Bougainvillea, stone pavers, saline-tolerant flora)',
  'Arid / Desert Xeriscaping (Agave, Cacti, decomposed granite gravel, drought-tolerant flora)',
  'Dense Urban Hardscape (Porous pavers, tree grates, linear bioswales, pocket parklets)',
];

export const SDP_VEHICULAR_ITEMS = [
  'Two-way asphalt access roads with white lane markings',
  'Porte-cochère / main building drop-off roundabout',
  'Surface parking stalls with permeable grass-pavers',
  'Dedicated barrier-free / PWD accessible parking slots',
  'Service loading dock & waste management egress',
  'Protected bicycle lanes with emerald green surface coating',
];

export const SDP_PEDESTRIAN_ITEMS = [
  'Interlocking concrete paving blocks with varied bond patterns',
  'Covered pedestrian walkways connecting key building portals',
  'Central gathering plaza with integrated seating steps & planters',
  'Tactile ground surface indicators (TGSI) for accessibility',
  'Stepping stone garden paths meandering through lush landscape',
  'Outdoor cafe seating with umbrellas and timber decking',
];

export const SDP_VEGETATION_CHOICES = [
  'Large shade canopy trees (e.g. Acacia, Rain Tree, Narra) with translucent canopy drop shadows',
  'Layered understory shrub beds with flowering accents and ornamental grasses',
  'Accent palm clusters framing main architectural vistas and entry points',
  'Extensive green turf lawns and bioretention swales with river pebbles',
  'Rooftop gardens and podium green terraces visible from overhead',
];

export const SDP_WATER_FEATURES = [
  'Retention / detention pond integrated into natural site contours',
  'Linear reflecting water pool mirroring building facade',
  'Interactive architectural splash fountain in the main plaza',
  'Naturalized bioswale corridor with river rocks and aquatic reeds',
  'Infinity edge resort swimming lagoon with timber pool deck',
];

export const PERSPECTIVE_CAMERAS = [
  {
    name: 'Two-Point Eye-Level (1.6m Horizon)',
    desc: 'Strictly orthogonal vertical lines (tilt-shift lens). Zero perspective keystoning. Crucial for professional architectural presentation boards.',
    tag: 'Studio Standard',
  },
  {
    name: 'Aerial Drone 45° Bird’s-Eye View',
    desc: 'Elevated oblique vantage showcasing roof geometry, relationship to site, circulation, and surrounding context.',
    tag: 'Context & Massing',
  },
  {
    name: 'Worm’s-Eye Dramatic Perspective',
    desc: 'Low-angle looking upward from street or plaza, exaggerating verticality, cantilevers, and monumental structural expression.',
    tag: 'Hero Shot',
  },
  {
    name: 'Interior One-Point Perspective',
    desc: 'Centered focal point looking straight through double-height atrium, framing light penetration, materiality, and spatial depth.',
    tag: 'Interior Volume',
  },
  {
    name: 'Cutaway Axonometric / Section Perspective',
    desc: 'Technical 3D architectural cut showcasing internal room programs, circulation cores, and spatial transitions simultaneously.',
    tag: 'Technical Plate',
  },
];

export const LIGHTING_ATMOSPHERES = [
  {
    name: 'Golden Hour (Late Afternoon Sunset)',
    desc: 'Warm 3200K raking sun rays, dramatic elongated cast shadows, amber highlights grazing textured facades, and peaceful mood.',
  },
  {
    name: 'Blue Hour Twilight (Dusk Architectural Photography)',
    desc: 'Deep indigo ambient evening sky contrasting with luminous 2700K warm interior glowing lighting through full-height glazing.',
  },
  {
    name: 'Overcast Soft Nordic Daylight',
    desc: 'Diffused, even, shadowless daylight mimicking overcast architectural photography (Iwan Baan / Hufton+Crow style). Highlights pure form.',
  },
  {
    name: 'Tropical Morning Sunlight with Crisp Shadows',
    desc: 'High clarity, bright crisp 5500K daylight casting sharp diagonal tree leaf shadows across concrete planes and water reflections.',
  },
  {
    name: 'Post-Rain Atmospheric Reflections',
    desc: 'Wet asphalt and paver reflections, soft misty air, subtle moisture sheen on concrete, and moody cinematic ambiance.',
  },
];

export const ARCHITECTURAL_MATERIALS = [
  'Off-form board-formed exposed concrete with tie-rod holes',
  'Charred Japanese cedar wood (Shou Sugi Ban / Yakisugi)',
  'Weathering Corten steel panels with rich rust patina',
  'Floor-to-ceiling Low-E acoustic double glazing with slim dark bronze mullions',
  'Honed silver travertine stone cladding with open joints',
  'Perforated aluminum solar brise-soleil / parametric screening',
  'Warm fluted glass panels and textured cast glass blocks',
  'Polished concrete floor with exposed fine river pebble aggregate',
  'Exposed matte-black structural steel I-beams and columns',
  'Locally sourced natural volcanic / slate stone ashlar masonry',
];

export const ARCHITECTURAL_STYLES = [
  'Contemporary Tropical Modernism (Deep overhangs, louvers, cross-ventilation)',
  'Biophilic Warm Brutalism (Textured raw concrete embraced by hanging vines)',
  'Japanese Contemporary Wabi-Sabi (Timber, stone, serenity, negative space)',
  'Nordic Scandinavian Minimalism (Light pine, zinc, vast glass, clean lines)',
  'Parametric Organic Fluid Architecture (Smooth double-curved fluid surfaces)',
  'Industrial Adaptive Reuse (Exposed brick, steel trusses, clerestory windows)',
  'Mid-Century Modern Pavilion (Flat roof, glass curtain, floating planes)',
];

export const ENCOURAGEMENT_NOTES = [
  "You've got this, Nekol! Your designs are always so thoughtful and creative. Take a deep breath and keep going! 🌟",
  "Late nights in architecture school are tough, but every line you draw is building your future as an amazing architect. Proud of you! 💖",
  "Don't worry about the jury panel! Your concept is strong, your drawings are crisp, and you're going to ace this presentation! ✨",
  "Remember to drink some water, stretch your back, and rest your eyes for 5 minutes. You're doing incredible work! ☕",
  "Revit crashed? Don't panic! Grab a coffee, take a breath, and let Gemini do the heavy lifting on your render prompts! 🏛️",
  "Your sense of space, light, and materiality is exceptional. Trust your design intuition! 🌸",
];

export const CRIT_DEFENSE_QUESTIONS = [
  {
    category: 'Site Development & Urban Planning',
    question: 'How did you determine your building footprint orientation relative to the solar path and prevailing winds?',
    modelAnswer: 'The primary masses are oriented along the East-West axis to minimize direct solar heat gain on the broad facades. Large openings face North-South for glare-free natural daylighting, while building gaps channel prevailing northeast monsoon (Amihan) and southwest monsoon (Habagat) winds through the public breezeways for passive cooling.',
  },
  {
    category: 'Circulation & Safety',
    question: 'Can you walk us through your vehicular versus pedestrian conflict resolution in your site plan?',
    modelAnswer: 'We implemented a strict peripheral vehicular ring road that routes service, deliveries, and resident parking to the outer edges. The inner central spine is 100% pedestrianized with raised tabletop crossings and tactile paving, eliminating vehicular-pedestrian intersection points at the core plaza.',
  },
  {
    category: 'Sustainability & Stormwater',
    question: 'What is your strategy for site runoff and permeable vs impermeable surface ratio?',
    modelAnswer: 'Our site achieves an 65% permeable surface ratio. We incorporated interconnected bioretention swales along the natural contour gradients that filter rainwater into a detention pond before discharging to the municipal drainage, reducing peak runoff by over 40%.',
  },
  {
    category: 'Structure & Materiality',
    question: 'Why choose exposed board-formed concrete and timber screening in this specific location?',
    modelAnswer: 'Exposed concrete provides high thermal mass to buffer ambient daytime heat, while local timber louvers serve as external passive shading devices that cut solar heat gain by 35% while framing selective views without compromising natural ventilation.',
  },
  {
    category: 'Building Code & Accessibility (PWD / ADA)',
    question: 'Are all key amenity levels and site entrances fully compliant with universal accessibility?',
    modelAnswer: 'Yes, every primary building entrance features a 1:12 slope ramp with continuous dual-height handrails and non-slip textured stone finish. Tactile warning pavers are integrated at all curb drop-offs, and dedicated 3.8m wide PWD parking stalls are positioned within 30m of the main elevator lobby.',
  },
];
