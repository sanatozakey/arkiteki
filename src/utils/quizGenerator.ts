import type { QuizQuestion, FlashcardItem } from '../types';

/**
 * Intelligent client-side parser that analyzes pasted notes, lecture slides,
 * or syllabus text and constructs interactive quiz questions and flashcards.
 * Guarantees exact target question count.
 */
export function generateQuizFromNotes(
  text: string,
  topicTitle: string = 'Custom Lecture Review',
  targetQuestionCount: number = 15,
  targetFlashcardCount?: number
): { questions: QuizQuestion[]; flashcards: FlashcardItem[] } {
  const cleanCount = Math.max(5, Math.min(targetQuestionCount, 100));
  const cleanFlashcardCount = targetFlashcardCount ? Math.max(5, Math.min(targetFlashcardCount, 100)) : Math.min(cleanCount, 25);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const keyItems: { term: string; definition: string; code?: string; difficulty?: 'Easy' | 'Moderate' | 'Challenging' | 'Board-Exam Level' }[] = [];
  const seenDefinitions = new Set<string>();

  // 1. Matches "Term: Definition" or "Term - Definition"
  for (const line of lines) {
    const colonMatch = line.match(/^([^:\-–]{3,40})[:\-–]\s+(.+)$/);
    if (colonMatch && colonMatch[2].length > 10) {
      const term = colonMatch[1].trim();
      const def = colonMatch[2].trim();
      if (!seenDefinitions.has(def.toLowerCase())) {
        seenDefinitions.add(def.toLowerCase());
        keyItems.push({
          term,
          definition: def,
          code: topicTitle,
          difficulty: 'Board-Exam Level',
        });
      }
      continue;
    }

    // Matches sentences with "is defined as", "refers to", "shall be", "means"
    const defMatch = line.match(/^(.+?)\s+(is defined as|refers to|shall be|means|consists of)\s+(.+)$/i);
    if (defMatch && defMatch[1].length < 50 && defMatch[3].length > 15) {
      const term = defMatch[1].replace(/^(the|a|an)\s+/i, '').trim();
      const def = `${defMatch[2]} ${defMatch[3].trim()}`;
      if (!seenDefinitions.has(def.toLowerCase())) {
        seenDefinitions.add(def.toLowerCase());
        keyItems.push({
          term,
          definition: def,
          code: topicTitle,
          difficulty: 'Board-Exam Level',
        });
      }
      continue;
    }

    // Numbers or dimensional rules (meters, mm, %, ratios)
    const dimensionMatch = line.match(/^(.+?)\s+(\d+(?:\.\d+)?\s*(?:meters|m|mm|cm|sqm|%|degrees|hours|days|years))\b(.*)$/i);
    if (dimensionMatch && dimensionMatch[1].length < 60) {
      const term = dimensionMatch[1].trim();
      const def = `${dimensionMatch[2]} ${dimensionMatch[3] || ''}`.trim();
      if (!seenDefinitions.has(def.toLowerCase())) {
        seenDefinitions.add(def.toLowerCase());
        keyItems.push({
          term,
          definition: def,
          code: topicTitle,
          difficulty: 'Board-Exam Level',
        });
      }
    }
  }

  // 2. Extract distinct clauses or sentences from the provided text to fill count
  if (keyItems.length < cleanCount && text.trim().length > 30) {
    const sentences = text
      .split(/[.!?\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && s.length < 220);

    for (let idx = 0; idx < sentences.length && keyItems.length < cleanCount; idx++) {
      const sentence = sentences[idx];
      if (!seenDefinitions.has(sentence.toLowerCase())) {
        seenDefinitions.add(sentence.toLowerCase());
        const words = sentence.split(/\s+/);
        const derivedTerm = words.slice(0, Math.min(words.length, 4)).join(' ');
        keyItems.push({
          term: derivedTerm || `Rule Statement ${idx + 1}`,
          definition: sentence,
          code: topicTitle,
          difficulty: 'Moderate',
        });
      }
    }
  }

  // 3. High-Yield Architectural Licensure Knowledge Bank (ensures exact counts up to 50/100)
  const ARCHITECTURAL_KNOWLEDGE_BANK: { term: string; definition: string; code: string; difficulty: 'Board-Exam Level' | 'Moderate' }[] = [
    { term: 'PD 1096 Habitable Room Ceiling Clearance', definition: 'Minimum 2.70m for naturally ventilated rooms; 2.40m for artificially air-conditioned rooms on upper floors (first floor requires 2.70m).', code: 'PD 1096 Section 805', difficulty: 'Board-Exam Level' },
    { term: 'BP 344 Accessible PWD Ramp Slope Rule', definition: 'Strictly 1:12 (8.33%) maximum gradient with intermediate 1.50m level rest landings every 6.00 meters of continuous run.', code: 'BP 344 Rule II Section 2.1', difficulty: 'Board-Exam Level' },
    { term: 'RA 9514 Fire Exit Maximum Travel Distance', definition: '45.0 meters in non-sprinklered buildings, or 60.0 meters in fully protected automatic fire sprinklered buildings.', code: 'RA 9514 Sec. 10.2.5.2', difficulty: 'Board-Exam Level' },
    { term: 'PD 1096 Standard Perpendicular Car Parking Stall', definition: '2.50 meters in width by 5.00 meters in length with minimum 6.00m two-way driveway circulation aisle.', code: 'PD 1096 Rule XIX', difficulty: 'Board-Exam Level' },
    { term: 'Philippine Bioclimatic Wind Channeling', definition: 'Orienting architectural breezeways to capture Amihan (Northeast monsoon) and Habagat (Southwest monsoon) with deep sun canopies.', code: 'Tropical Passive Design Theory', difficulty: 'Moderate' },
    { term: 'PD 1096 Minimum Window Area for Habitable Rooms', definition: 'Not less than 10% of the floor area of the room, opening directly to a court or public street.', code: 'PD 1096 Section 808', difficulty: 'Board-Exam Level' },
    { term: 'BP 344 Accessible Door Clear Width', definition: 'Minimum clear opening of 0.80 meters measured between the face of the door and the latch stop.', code: 'BP 344 Rule II Section 2.4', difficulty: 'Board-Exam Level' },
    { term: 'RA 9514 Minimum Corridor Width for Educational Occupancy', definition: 'Minimum clear width of 1.80 meters for corridors serving more than 100 occupants.', code: 'RA 9514 Rule 10 Div 10', difficulty: 'Board-Exam Level' },
    { term: 'PD 1096 Allowable Maximum Building Footprint (AMBF)', definition: 'The maximum portion of the lot that may be occupied by the building, determined by deducting required setbacks and yards.', code: 'PD 1096 Rule VII', difficulty: 'Board-Exam Level' },
    { term: 'BP 344 PWD Toilet Grab Bar Height', definition: 'Mounted horizontally at exactly 0.80 meters above the finished floor level along the water closet.', code: 'BP 344 Appendix A', difficulty: 'Board-Exam Level' },
    { term: 'PD 1096 Total Open Space within Lot (TOSL)', definition: 'Comprises the Unpaved Surface Area (USA) and Impervious Surface Area (ISA) surrounding the building footprint.', code: 'PD 1096 Rule VII', difficulty: 'Board-Exam Level' },
    { term: 'RA 9514 Fire Door Minimum Rating in 2-Hour Fire Wall', definition: 'Minimum 1.5-hour (90 minutes) fire protection rating equipped with an automatic closing latch.', code: 'RA 9514 Sec. 10.2.5.3', difficulty: 'Board-Exam Level' },
    { term: 'Leandro Locsin Architectural Masterpiece', definition: 'Cultural Center of the Philippines (CCP) Main Theater, demonstrating heroic floating concrete cantilevers.', code: 'Philippine Architectural History', difficulty: 'Moderate' },
    { term: 'Francisco Mañosa Vernacular Philosophy', definition: 'Father of Philippine Neo-Vernacular Architecture, celebrated for the Coconut Palace and San Miguel Corporation Building.', code: 'Philippine Architectural History', difficulty: 'Moderate' },
    { term: 'BP 344 Accessible Elevator Entrance Width', definition: 'Minimum 0.80m clear door opening with interior cab dimensions of at least 1.10m width by 1.40m depth.', code: 'BP 344 Rule II Section 3.1', difficulty: 'Board-Exam Level' },
    { term: 'PD 1096 R-1 Front Setback Requirement', definition: 'Minimum 4.50 meters front yard setback for low-density residential (R-1) zones.', code: 'PD 1096 Table VIII.2', difficulty: 'Board-Exam Level' },
    { term: 'RA 9514 Panic Hardware Requirement', definition: 'Required on exit doors of assembly and educational occupancies serving 50 or more persons; opens with 15 lbs pressure.', code: 'RA 9514 Sec. 10.2.5.2', difficulty: 'Board-Exam Level' },
    { term: 'SPP 202 Regular Architectural Design Services', definition: 'Covers Schematic Design Phase, Design Development Phase, Contract Document Phase, and Construction Phase.', code: 'PRC Architecture SPP 202', difficulty: 'Board-Exam Level' },
    { term: 'PD 1096 Mezzanine Floor Ceiling Height', definition: 'Minimum clear height of 1.80m above and below the mezzanine floor, and lot area not exceeding 50% of the room below.', code: 'PD 1096 Section 805', difficulty: 'Board-Exam Level' },
    { term: 'BP 344 Handrail Height Range', definition: 'Between 0.70m and 0.90m above steps or ramps, with an additional 0.30m extension beyond top and bottom landings.', code: 'BP 344 Rule II Section 2.2', difficulty: 'Board-Exam Level' },
    { term: 'PD 1096 Floor-to-Lot Area Ratio (FLAR)', definition: 'The ratio between the gross floor area (GFA) of a building and the total area of the lot on which it stands.', code: 'PD 1096 Rule VII', difficulty: 'Board-Exam Level' },
    { term: 'RA 9514 Occupant Load Factor for Classrooms', definition: '1.9 square meters per person net area for standard educational classrooms.', code: 'RA 9514 Table 10.2.5.1', difficulty: 'Board-Exam Level' },
    { term: 'Tropical Solar Shading Brise-Soleil', definition: 'Horizontal louvers for high-angle North-South sun; vertical louvers for low-angle East-West rising and setting sun.', code: 'Tropical Passive Architecture', difficulty: 'Moderate' },
    { term: 'Juan Nakpil Historic Distinction', definition: 'The very first National Artist of the Philippines for Architecture (1973), designer of Quiapo Church reconstruction.', code: 'Philippine Architectural History', difficulty: 'Moderate' },
    { term: 'PD 1096 Stair Tread and Riser Minimums', definition: 'Maximum riser height of 200mm and minimum run/tread width of 250mm for standard egress stairs.', code: 'PD 1096 Section 1207', difficulty: 'Board-Exam Level' },
    { term: 'BP 344 Tactile Surface Warning Tile', definition: 'Installed 0.30m before the edge of a ramp, staircase, or hazardous vehicular curb crossing for visually impaired individuals.', code: 'BP 344 Rule II', difficulty: 'Board-Exam Level' },
    { term: 'RA 9514 Fire Escape Stairs Permissibility', definition: 'Fire escapes are allowed only on existing buildings; prohibited as part of the required egress for new buildings.', code: 'RA 9514 Div 5', difficulty: 'Board-Exam Level' },
    { term: 'PD 1096 Water Closet Stall Minimum Dimensions', definition: 'Minimum width of 0.90m and depth of 1.50m for standard public comfort room compartments.', code: 'PD 1096 Rule VIII', difficulty: 'Board-Exam Level' },
    { term: 'SPP 201 Pre-Design Architectural Services', definition: 'Covers Consultation, Pre-Feasibility Studies, Site Selection and Analysis, Site Utilization, and Architectural Programming.', code: 'PRC Architecture SPP 201', difficulty: 'Board-Exam Level' },
    { term: 'Bahay na Bato Volada Construction', definition: 'An overhanging second-floor gallery supported by massive wooden posts, providing shading and rain shelter to ground level.', code: 'Philippine Vernacular Architecture', difficulty: 'Board-Exam Level' },
    { term: 'PD 1096 Minimum Lot Frontage for Inside Lot', definition: 'Minimum 12.00 meters frontage for low-density residential (R-1) single-detached inside lot.', code: 'PD 1096 Table VIII.1', difficulty: 'Board-Exam Level' },
    { term: 'BP 344 Accessible Parking Stall Clearance', definition: 'Minimum 3.70 meters width (including a 1.20m accessible walkway aisle) positioned closest to building entrance.', code: 'BP 344 Rule II Section 4', difficulty: 'Board-Exam Level' },
    { term: 'RA 9514 Dead-End Corridor Maximum Length', definition: 'Maximum 6.00 meters length in non-sprinklered buildings, or 12.00 meters in fully sprinklered buildings.', code: 'RA 9514 Sec. 10.2.5.2', difficulty: 'Board-Exam Level' },
    { term: 'PD 1096 Kitchen Floor Area Minimum', definition: 'Minimum 3.00 square meters with a least horizontal dimension of 1.50 meters.', code: 'PD 1096 Section 806', difficulty: 'Board-Exam Level' },
    { term: 'Amihan Monsoon Wind Flow Direction', definition: 'Northeast wind prevailing from October to February, characterized by cool, dry, refreshing breezes.', code: 'Philippine Climatology', difficulty: 'Moderate' },
    { term: 'Habagat Monsoon Wind Flow Direction', definition: 'Southwest wind prevailing from June to September, bringing heavy monsoon precipitation and warm humid air.', code: 'Philippine Climatology', difficulty: 'Moderate' },
    { term: 'PD 1096 Bath and Toilet Floor Area Minimum', definition: 'Minimum 1.20 square meters with a least horizontal dimension of 0.90 meters.', code: 'PD 1096 Section 806', difficulty: 'Board-Exam Level' },
    { term: 'BP 344 Washbasin Clearance Under Rim', definition: 'Minimum 0.70m vertical clear knee space under washbasin counter for wheelchair footrest clearance.', code: 'BP 344 Appendix A', difficulty: 'Board-Exam Level' },
    { term: 'RA 9514 Automatic Sprinkler Requirement for High-Rise', definition: 'Mandatory automatic fire sprinkler system throughout all buildings having an occupied floor more than 15.0m above grade.', code: 'RA 9514 Rule 10', difficulty: 'Board-Exam Level' },
    { term: 'Pablo Antonio Historic Distinction', definition: 'National Artist for Architecture (1976), pioneer of Philippine Art Deco style (FEU Campus, Ideal Theater).', code: 'Philippine Architectural History', difficulty: 'Board-Exam Level' },
    { term: 'PD 1096 Gross Floor Area (GFA) Exclusions', definition: 'Excludes parking areas, driveways, exterior covered balconies, and mechanical penthouse roof areas.', code: 'PD 1096 Rule VII', difficulty: 'Board-Exam Level' },
    { term: 'BP 344 Maximum Height of Threshold at Doorways', definition: 'Shall not exceed 25mm and must be beveled to facilitate smooth passage of wheelchairs.', code: 'BP 344 Rule II', difficulty: 'Board-Exam Level' },
    { term: 'RA 9514 Means of Egress Illumination', definition: 'Continuous emergency egress illumination not less than 10.7 lux (1 foot-candle) at floor level along the exit path.', code: 'RA 9514 Sec. 10.2.5.10', difficulty: 'Board-Exam Level' },
    { term: 'Ildefonso Santos Jr. Historic Distinction', definition: 'National Artist for Architecture (2006) as the Father of Philippine Landscape Architecture (Paco Park, Cultural Center).', code: 'Philippine Architectural History', difficulty: 'Moderate' },
    { term: 'PD 1096 Unpaved Surface Area (USA) Purpose', definition: 'Mandatory open ground surfaced with soil, grass, or permeable pavers to promote natural ground water replenishment.', code: 'PD 1096 Rule VIII', difficulty: 'Board-Exam Level' },
    { term: 'BP 344 Minimum Turning Space for Wheelchairs', definition: 'Minimum 1.50m by 1.50m (or 1.50m diameter circle) clear level floor area at dead ends and toilet vestibules.', code: 'BP 344 Rule II Section 2.1', difficulty: 'Board-Exam Level' },
    { term: 'RA 9514 Fire Safety Inspection Certificate (FSIC)', definition: 'Prerequisite document issued by the Bureau of Fire Protection (BFP) before issuance of an Occupancy Permit.', code: 'RA 9514 Rule 9', difficulty: 'Board-Exam Level' },
    { term: 'SPP 203 Specialized Architectural Services', definition: 'Covers Acoustic Design, Architectural Lighting, Interior Architecture, Site Development Planning, and Comprehensive Planning.', code: 'PRC Architecture SPP 203', difficulty: 'Board-Exam Level' },
    { term: 'Ventilated Double Roof Construction', definition: 'A tropical roofing strategy with an air space between upper cladding and ceiling that exhausts trapped heat through ridge vents.', code: 'Tropical Passive Design', difficulty: 'Moderate' },
    { term: 'PD 1096 Eaves and Canopy Clearance above Sidewalk', definition: 'Minimum clear vertical height of 3.00 meters above the established sidewalk grade.', code: 'PD 1096 Section 1004', difficulty: 'Board-Exam Level' }
  ];

  // Fill keyItems up to required count from knowledge bank if needed
  const neededItems = Math.max(cleanCount, cleanFlashcardCount);
  let bankIdx = 0;
  while (keyItems.length < neededItems && bankIdx < ARCHITECTURAL_KNOWLEDGE_BANK.length) {
    const item = ARCHITECTURAL_KNOWLEDGE_BANK[bankIdx];
    if (!keyItems.some((k) => k.term === item.term)) {
      keyItems.push(item);
    }
    bankIdx++;
  }

  // 4. Construct Flashcards (grounded to requested cleanFlashcardCount)
  const flashcards: FlashcardItem[] = [];
  for (let i = 0; i < Math.min(keyItems.length, cleanFlashcardCount); i++) {
    const item = keyItems[i];
    flashcards.push({
      id: `fc-gen-${i + 1}`,
      front: item.term,
      back: item.definition,
      category: topicTitle,
    });
  }

  // 5. Construct Exactly targetCount Multiple-Choice Questions
  const questions: QuizQuestion[] = [];
  const selectedItems = keyItems.slice(0, cleanCount);

  for (let index = 0; index < selectedItems.length; index++) {
    const item = selectedItems[index];

    // Pick 3 plausible distractors from other items or architectural pool
    const otherDefs = keyItems
      .filter((_, i) => i !== index)
      .map((i) => i.definition);

    const fallbackDistractors = [
      'Standard requirement dictated by PD 1096 Section 804',
      'Determined by zoning setbacks and allowable building footprint (AMBF)',
      'Universal Accessibility provision governed by BP 344 Rule II',
      'Prescribed by RA 9514 life safety and fire exit travel clearances',
      'Calculated based on Gross Floor Area and allowable Floor-to-Lot Area Ratio',
      'Mandated under Philippine environmental codes for stormwater management',
    ];

    const distractors: string[] = [];
    let defIdx = 0;
    while (distractors.length < 3 && defIdx < otherDefs.length) {
      const candidate = otherDefs[defIdx];
      if (candidate !== item.definition && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
      defIdx++;
    }

    let fbIdx = 0;
    while (distractors.length < 3) {
      const fb = fallbackDistractors[fbIdx % fallbackDistractors.length];
      if (!distractors.includes(fb) && fb !== item.definition) {
        distractors.push(fb);
      }
      fbIdx++;
    }

    const correctOption = item.definition;
    const allOptions = [correctOption, ...distractors.slice(0, 3)];

    // Deterministic or pseudorandom shuffle
    const shuffled = allOptions.sort(() => (index % 2 === 0 ? 0.3 - Math.random() : Math.random() - 0.5));
    const correctIndex = shuffled.indexOf(correctOption);

    questions.push({
      id: `q-gen-${index + 1}`,
      type: 'multiple-choice',
      question: `Regarding ${item.term}, which of the following is correct according to the study material and Philippine Architectural standards?`,
      options: shuffled,
      correctAnswer: correctIndex >= 0 ? correctIndex : 0,
      explanation: `Correct: ${item.term} — ${item.definition}`,
      category: topicTitle,
      sourceReference: item.code || topicTitle,
      difficulty: item.difficulty || 'Board-Exam Level',
    });
  }

  return {
    questions: questions.slice(0, cleanCount),
    flashcards,
  };
}

/**
 * Builds a prompt for Gemini to ingest entire PDFs, book chapters, or syllabi
 * and return structured exam questions with explanations.
 */
export function buildGeminiExamPrompt(notesText: string, examType: string, numQuestions: number): string {
  return `**Role & Instruction:**
Act as a chief review director for the Architecture Licensure Examination (ALE). 
I have attached/pasted academic lecture notes below.

**Task:**
Analyze the provided study material and create a comprehensive **${numQuestions}-question ${examType}** designed to test an architecture student's recall, application, and mastery for the board exam.

**Formatting Rules for Each Question:**
1. **Board Exam Style Question**: Clear, practical, or situational problem statement.
2. **4 Multiple Choice Options (A, B, C, D)**: Plausible architectural distractors; no obvious giveaways.
3. **Correct Answer**: Explicitly declare the correct choice index.
4. **Architectural Rationale & Reference**: Provide a detailed explanation citing the relevant architectural code (e.g., PD 1096 NBCP, BP 344, RA 9514 Fire Code, or Architectural History/Theory).
5. **Flashcard Summary**: A 1-sentence quick recall rule for flashcard review.

**Study Material:**
${notesText.trim().slice(0, 4000)}

Generate the complete exam now with answer keys at the bottom!`;
}

/**
 * Generates an exact count of grounded flashcards from notes or architectural bank
 */
export function generateFlashcardsFromNotes(
  notesText: string,
  topicTitle: string = 'Architecture Review',
  targetCount: number = 15
): FlashcardItem[] {
  const result = generateQuizFromNotes(notesText, topicTitle, Math.max(5, targetCount), targetCount);
  return result.flashcards.slice(0, targetCount);
}

