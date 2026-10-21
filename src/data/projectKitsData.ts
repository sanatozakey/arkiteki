export interface ProjectKitData {
  id: string;
  name: string;
  badge: string;
  subtitle: string;
  overview: string;
  typicalPrograms: { zone: string; rooms: string[]; importance: string }[];
  keyZoningRules: string[];
  designConcepts: {
    title: string;
    tagline: string;
    metaphor: string;
    massing: string;
    facade: string;
    sdpPrompt: string;
    perspectivePrompt: string;
    chatBrainstormPrompt: string;
  }[];
  defenseQuestions: { question: string; answer: string; tag: string }[];
}

export const CITY_HALL_KIT: ProjectKitData = {
  id: 'city-hall',
  name: 'City Hall & Civic Center Hub',
  badge: 'Government & Civic Plate',
  subtitle: 'Complete architectural studio kit for Municipal Halls, City Capitols & Civic Centers',
  overview: 'City Halls require a delicate balance of monumental civic dignity, citizen-friendly public services, legislative transparency, and clear vehicular vs pedestrian separation for large crowds during flag ceremonies and public events.',
  typicalPrograms: [
    {
      zone: 'Ground Level: Citizen Public Realm (One-Stop Shop)',
      rooms: [
        'Central Public Transaction Atrium / Citizen Lounge',
        'Business Permits & Licensing Office (BPLO)',
        'City Treasury & Assessor Payment Counters',
        'Civil Registry & Social Welfare (CSWDO)',
        'Public Restrooms, Mother’s Room & PWD Priority Lounge',
      ],
      importance: 'High foot-traffic zone; must be immediately accessible from the main entrance plaza without requiring elevators or secure access passes.',
    },
    {
      zone: 'Second Level: Executive & Departmental Administration',
      rooms: [
        'City Planning & Development Coordinator (CPDC)',
        'City Engineering & Building Official (OBO)',
        'City Legal & Human Resource Management',
        'Health & Sanitation Administration',
        'Internal Conference Rooms & Staff Cafeteria',
      ],
      importance: 'Moderate traffic; administrative workspace with controlled public waiting areas.',
    },
    {
      zone: 'Third Level: Legislative Branch & Dignitary Suite',
      rooms: [
        'Sangguniang Panlungsod (City Council) Legislative Session Hall',
        'Elevated Public Gallery / Press Observation Balcony',
        'Offices of City Councilors & Committee Rooms',
        'Office of the City Mayor & Executive Conference Boardroom',
        'VIP Dignitary Reception Holding Lounge & Private Restroom',
      ],
      importance: 'High civic dignity; legislative session hall requires double-height ceiling volume and acoustic wall paneling. Executive suite requires private, secure VIP elevator/stair egress.',
    },
    {
      zone: 'Subterranean / Service Realm',
      rooms: [
        'Government Fleet & Official Vehicle Parking',
        'Building Management Systems (BMS), MEPF, Generator & Water Cistern',
        'Central Archives & Records Retention Vault',
        'Disaster Risk Reduction (CDRRMO) Emergency Operations Center',
      ],
      importance: 'Secure, protected utilities and command center with secondary emergency egress.',
    },
  ],
  keyZoningRules: [
    'Ceremonial Plaza: Must accommodate at least 500–1,000 citizens for weekly flag-raising ceremonies and public civic assemblies.',
    'VIP Motorcade vs Public Transit: Provide a dedicated, covered VIP drop-off for the Mayor and visiting dignitaries separate from the public bus/jeepney drop-off.',
    'Universal Barrier-Free Access (BP 344 / ADA): 1:12 ramp with tactile guiding blocks directly from the sidewalk to the main entrance portal.',
    'Transparency in Governance: Modern city hall designs emphasize extensive vision glass into the Legislative Chamber, symbolizing open democracy.',
  ],
  designConcepts: [
    {
      title: 'The Civic Lantern (Transparency in Governance)',
      tagline: 'Solid vernacular stone plinth supporting a radiant, luminous glass legislative volume',
      metaphor: 'A beacon of democratic integrity that glows at night, reminding citizens of openness in public service.',
      massing: 'A two-story solid architectural travertine podium containing high-volume public transactions, crowned by a crystalline, double-height glass pavilion cantilevering over the civic plaza to house the City Council Session Hall.',
      facade: 'Textured board-formed concrete and local volcanic stone on the base; floor-to-ceiling Low-E curtain wall with rhythmic vertical bronze solar fins on the upper civic volume.',
      sdpPrompt: `**Site Development Plan (SDP): Contemporary City Hall & Civic Center**
- **Projection**: Strictly 90-degree top-down orthographic overhead aerial plan view (true 2D plan, NO camera tilt, NO perspective horizon).
- **Program & Layout**: City Hall complex centered around a monumental 2,500 sqm paved ceremonial civic plaza featuring an elevated national flagpole court and interactive linear reflecting pool.
- **Vehicular Routing**: Peripheral vehicular circulation road separating public drop-off on the south entrance from the secure VIP mayoral motorcade porte-cochère on the private north wing. Surface parking with permeable turf pavers for 120 cars + 4 bus bays.
- **Pedestrian Realm**: Grand welcoming radial pedestrian promenade lined with indigenous shade palms (Royal Palms & Narra), granite paving modules with contrasting bands, and civic gathering terraces.
- **Graphic Style**: Clean architectural Photoshop presentation style, soft 45-degree ambient drop shadows cast by building masses and mature tree canopies, crisp boundary lines, 8k resolution.`,
      perspectivePrompt: `**Architectural Hero Perspective: Modern Civic City Hall**
- **Framing & View**: Eye-level two-point perspective shot from the grand ceremonial plaza at 1.6m horizon line on a 24mm tilt-shift lens.
- **CRITICAL**: Strictly vertical parallel lines. Zero converging perspective distortion; all columns and facade edges remain 100% plumb.
- **Architecture**: Monumental civic complex featuring a monolithic honed white travertine stone podium, topped by a luminous cantilevered glass legislative session hall with slender vertical dark bronze solar brise-soleil louvers. A prominent modern municipal seal subtly integrated into the entrance portico.
- **Atmosphere & Lighting**: Blue hour architectural twilight: deep navy blue sky contrasting with radiant 2700K warm interior lighting glowing from inside the transparent legislative chamber.
- **Entourage**: National flag fluttering gently in the breeze on a tall minimalist flagpole. Paved stone plaza with subtle wet reflection, populated by citizens and civil servants in natural motion blur walking toward the grand steps.
- **Quality**: ArchDaily / Dezeen publication standard, V-Ray 6 benchmark, razor-sharp 8k uncompressed clarity, NO AI warping or crooked walls.`,
      chatBrainstormPrompt: `I am an architecture student designing a City Hall and Civic Center for a progressive medium-sized city. Give me 5 unique architectural concept philosophies that incorporate democratic transparency, tropical passive cooling (amihan and habagat breezes), and civic monumentality. Also list the key space programming relationships between the Mayor's office, the Legislative session hall, and public transaction desks.`,
    },
    {
      title: 'The Terraced Hill (Civic Green Roof)',
      tagline: 'Stepped landscape terraces where citizens can walk on top of the government building',
      metaphor: 'Symbolizing that the people of the city literally stand above the government officials who serve them.',
      massing: 'The building gently rises from the civic park as a series of stepped, walkable green roof gardens and public amphitheaters, integrating landscape with government administration.',
      facade: 'Terraced concrete planters with trailing bougainvillea, deep recessed horizontal glass bands, and vertical timber louvers.',
      sdpPrompt: `**Site Development Plan (SDP): Terraced Biophilic Civic Center**
- **Projection**: 90-degree true top-down orthographic overhead plan view.
- **Layout**: Stepped building footprint interconnected with landscaped green roof terraces and central sunken amphitheater.
- **Landscape**: 60% permeable green space with native canopy trees, bioswales, and stone stepping pathways.
- **Graphic Aesthetic**: Minimalist monochrome linework with lush emerald green landscape accents and soft drop shadows.`,
      perspectivePrompt: `**Architectural Perspective: Terraced Eco-Civic City Hall**
- **Framing**: Two-point eye-level perspective looking up from the civic park, strictly vertical columns, tilt-shift lens.
- **Architecture**: Cascading green roof terraces with citizens enjoying public gardens directly on the building roof. Warm board-formed concrete and timber soffits.
- **Lighting**: Bright tropical morning sunlight (5500K) with crisp diagonal tree leaf shadows dancing across the concrete facade.
- **Quality**: Photorealistic 8K, V-Ray fidelity, physically based textures.`,
      chatBrainstormPrompt: `I want to design an eco-friendly biophilic City Hall with walkable green roof terraces. How do I solve structural load requirements, waterproofing, and public security while allowing citizens to access the rooftop park?`,
    },
  ],
  defenseQuestions: [
    {
      question: 'How does your City Hall design handle security and prevent unauthorized access to executive offices without feeling like a fortress?',
      answer: 'We implemented concentric security zoning. The Ground Floor is completely open and welcoming for daily citizen transactions (one-stop shop). Access to the upper administrative and Mayoral levels is strictly channeled through secure turnstiles and keycard-controlled elevator cores located behind the main information desk. This gives the public open access to civic services while providing airtight security for sensitive municipal operations.',
      tag: 'Security & Access',
    },
    {
      question: 'Where will large crowds gather during weekly flag ceremonies or civic demonstrations, and how is traffic managed?',
      answer: 'Our site plan reserves a 2,500 sqm dedicated civic ceremonial plaza in front of the building, capable of accommodating over 1,200 people safely away from vehicular roadways. During events, the peripheral access road can be temporarily closed via automatic bollards to create a completely contiguous pedestrian zone.',
      tag: 'Site & Crowd Flow',
    },
    {
      question: 'How did you address acoustic privacy in the Legislative Council Session Hall?',
      answer: 'The Session Hall is isolated as an independent acoustic pod within the upper volume, wrapped in double-stud insulated drywall partitions and perforated timber acoustic panels with NRC > 0.85. The public observation gallery is acoustically baffled to allow citizens to view debates without disturbing legislative proceedings.',
      tag: 'Acoustics & Space',
    },
  ],
};

export const COMMERCIAL_KIT: ProjectKitData = {
  id: 'commercial',
  name: 'Commercial Building & Mixed-Use Hub',
  badge: 'Commercial & Retail Plate',
  subtitle: 'Complete architectural studio kit for Retail Malls, Lifestyle Centers & Commercial Plazas',
  overview: 'Commercial projects demand maximum retail frontage, intuitive pedestrian sightlines, strategic anchor placement to eliminate dead zones, efficient loading dock logistics, and high-energy nighttime curb appeal.',
  typicalPrograms: [
    {
      zone: 'Ground Level: Active Street-Front & Anchor Retail',
      rooms: [
        'Main Anchor Tenant / Department Store or Supermarket',
        'High-Turnover Retail Boutiques & Flagship Showrooms',
        'Al Fresco Dining Cafes with Covered Street Frontage',
        'Grand Multi-Height Entrance Atrium & Event Stage',
        'Customer Service Concierge, PWD Access & Restrooms',
      ],
      importance: '100% active facade; floor-to-ceiling glass storefronts with transparent views to invite pedestrians inside.',
    },
    {
      zone: 'Upper Retail & Entertainment Levels',
      rooms: [
        'Specialty Retail Inline Shops & Fashion Boutiques',
        'Food Hall / Gourmet Dining Promenade',
        'Cinema Complex (Acoustically isolated high volumes)',
        'Family Entertainment Center / Arcade / Wellness Spa',
        'Rooftop Garden Terraces with Sky Dining Bars',
      ],
      importance: 'Circulation magnets; placing food court and cinema on upper floors draws pedestrian traffic past lower retail stores (the "magnet effect").',
    },
    {
      zone: 'Back-of-House (BOH) & Logistics',
      rooms: [
        'Enclosed Loading Dock & Freight Elevators (min 4.5m clearance)',
        'Waste Compactor, Recycling & Grease Trap Room',
        'Staff Security Monitoring, Cashier Vault & Lockers',
        'MEPF Plant: Chiller Plant, Substation & Transformer Vault',
      ],
      importance: 'Must be completely hidden from customer sightlines with independent service driveway access.',
    },
  ],
  keyZoningRules: [
    'Retail "Dumbbell" Circulation: Place major anchor tenants at opposite ends of the circulation spine to create continuous, energized pedestrian foot traffic across inline shops.',
    'Clear Delivery Logistics: Freight delivery trucks (12m container/wing vans) require dedicated turning radii (min 15m radius) and must never cross customer pedestrian paths.',
    'Parking Ratio (National Building Code): Standard commercial ratio is 1 car slot per 50 to 100 sqm of Gross Leasable Area (GLA), plus accessible slots within 30m of retail portals.',
    'Fire Egress & Travel Distance: Maximum travel distance to a fire exit enclosure is 45 meters (or 60 meters if fully sprinklered).',
  ],
  designConcepts: [
    {
      title: 'The Biophilic Canyon (Open-Air Retail Arcade)',
      tagline: 'Cascading landscaped retail terraces embracing a shaded, naturally ventilated breezeway',
      metaphor: 'A vibrant urban canyon where shopping merges with nature, fresh air, and lush vertical gardens.',
      massing: 'Two elongated commercial wings separated by a continuous central outdoor pedestrian canyon covered by a sculptural glass-and-timber canopy that channels prevailing breezes.',
      facade: 'High-transparency low-iron glass storefronts on the ground floor; upper levels clad in warm fluted terracotta panels and cascading hanging vines.',
      sdpPrompt: `**Site Development Plan (SDP): Mixed-Use Commercial Lifestyle Center**
- **Projection**: Strictly 90-degree top-down orthographic overhead aerial plan view (true 2D plan, NO angle, NO horizon line).
- **Layout & Program**: 12,000 sqm commercial complex featuring two retail blocks framing a central landscaped pedestrian shopping canyon with water fountains, outdoor timber cafe decks, and pop-up market kiosks.
- **Circulation & Logistics**:
  - Customer vehicular access with 3-lane entrance, valet drop-off roundabout, and ramp down to multi-level subterranean parking.
  - Completely separated service access on the rear perimeter with an enclosed 4-bay delivery loading dock and trash compaction facility.
- **Hardscape & Landscape**: High-contrast geometric paving patterns in granite and honed concrete; lush mature canopy trees with soft 45-degree ambient drop shadows; linear water features reflecting ambient light.
- **Graphic Standard**: Presentation-board Photoshop collage style, razor-sharp 8k resolution, crisp vector edges, clean graphic scale bar.`,
      perspectivePrompt: `**Architectural Hero Perspective: Commercial Street-Level Retail Promenade**
- **Framing**: Two-point eye-level street perspective shot at 1.6m height on a 24mm architectural tilt-shift lens.
- **CRITICAL**: Strictly vertical parallel lines. Zero converging perspective distortion; all columns, mullions, and building edges remain 100% plumb.
- **Architecture**: Contemporary mixed-use commercial complex featuring double-height frameless glass storefronts with warm interior illumination revealing retail merchandise. Upper levels feature dynamic cantilevered dining terraces clad in warm charred cedar and perforated bronze metal panels.
- **Lighting & Ambiance**: Golden hour / early dusk twilight: warm 2700K cafe pendant lights and boutique signage glow warmly against the cool evening sky.
- **Entourage**: Vibrant urban street scene with stylish pedestrians in motion blur carrying shopping bags and dining al fresco under canvas umbrellas. Clean textured concrete pavers with subtle reflections.
- **Quality**: ArchDaily / Retail Design World standard, V-Ray 6 realism, 8K ultra-sharp definition, NO distorted AI limbs or crooked walls.`,
      chatBrainstormPrompt: `I am an architecture student designing a modern commercial lifestyle center and shopping mall. How do I organize the sightlines, vertical escalators, and anchor stores to maximize foot traffic and eliminate dead retail corners? Also outline the delivery loading dock dimensions and truck clearance requirements.`,
    },
    {
      title: 'The Terraced Origami (Dynamic Commercial Facade)',
      tagline: 'Sculptural geometric folded metal panels that shift with daylight and integrate digital media',
      metaphor: 'A dynamic architectural origami skin that turns the building into a landmark civic and commercial sculpture.',
      massing: 'A bold, prismatic podium with faceted geometry, stepping back at upper levels to create rooftop dining pavilions overlooking the city.',
      facade: 'Faceted champagne-anodized aluminum panels with integrated LED reveals and floor-to-ceiling recessed glass volumes.',
      sdpPrompt: `**Site Development Plan (SDP): Modern Prismatic Commercial Mall**
- **Projection**: 90-degree true top-down orthographic overhead view.
- **Layout**: Prismatic building footprint with central glass skylight roof, expansive outdoor dining forecourt, and multi-lane vehicular drop-off.
- **Graphic Aesthetic**: Clean BIG-style diagrammatic masterplan with pastel zoning fills and crisp vector outlines.`,
      perspectivePrompt: `**Architectural Perspective: Prismatic Commercial Landmark**
- **Framing**: Dramatic two-point eye-level perspective looking up at the cantilevered origami entrance canopy, shift lens with perfectly straight verticals.
- **Lighting**: Dramatic dusk lighting with integrated warm facade lighting accents and glowing interior retail volumes.
- **Quality**: 8K photorealistic, V-Ray engine benchmark.`,
      chatBrainstormPrompt: `Give me 5 creative facade concepts for a multi-storey commercial building that provide solar shading from afternoon western sun while maintaining maximum glass transparency for retail store displays.`,
    },
  ],
  defenseQuestions: [
    {
      question: 'How do you prevent delivery trucks and garbage collection from ruining the customer experience and creating traffic jams?',
      answer: 'Our logistics are completely isolated from the customer realm. Delivery trucks enter via a dedicated service driveway on the secondary road and descend into a concealed subterranean loading dock with acoustic dampeners and air-curtains. Customers only interact with the pedestrianized front facade and customer drop-off on the primary avenue, ensuring zero conflict with heavy freight.',
      tag: 'Logistics & Loading',
    },
    {
      question: 'How does your retail circulation prevent "dead corners" where shops fail due to lack of foot traffic?',
      answer: 'We applied the classic "dumbbell" layout strategy. The supermarket anchor is positioned at one end and the cinema/food court at the opposite end. All inline boutique stores are positioned along this single, high-visibility continuous loop with clear sightlines across the central atrium, forcing pedestrian foot traffic to circulate past every tenant.',
      tag: 'Retail Economics & Sightlines',
    },
    {
      question: 'In case of fire, how do thousands of shoppers safely evacuate this multi-level commercial complex?',
      answer: 'Our floor plan incorporates pressurized, smokeproof fire exit stairwells spaced no more than 45 meters apart from any occupied retail point. Exit stairs discharge directly to the exterior public street at grade level without re-entering the retail atrium, ensuring safe, rapid evacuation fully compliant with life safety codes.',
      tag: 'Fire Safety & Egress',
    },
  ],
};
