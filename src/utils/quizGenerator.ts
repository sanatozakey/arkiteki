import type { QuizQuestion, FlashcardItem } from '../types';

/**
 * Intelligent client-side parser that analyzes pasted notes, lecture slides,
 * or syllabus text and constructs interactive quiz questions and flashcards.
 */
export function generateQuizFromNotes(
  text: string,
  topicTitle: string = 'Custom Lecture Review',
  targetQuestionCount: number = 15
): { questions: QuizQuestion[]; flashcards: FlashcardItem[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const questions: QuizQuestion[] = [];
  const flashcards: FlashcardItem[] = [];

  // Extract key concept sentences (definitions, numbers, ratios, or colon statements)
  const keyItems: { term: string; definition: string; code?: string }[] = [];

  for (const line of lines) {
    // Matches "Term: Definition" or "Term - Definition"
    const colonMatch = line.match(/^([^:\-–]{3,40})[:\-–]\s+(.+)$/);
    if (colonMatch && colonMatch[2].length > 10) {
      keyItems.push({
        term: colonMatch[1].trim(),
        definition: colonMatch[2].trim(),
      });
      continue;
    }

    // Matches sentences with "is defined as", "refers to", "shall be", "means"
    const defMatch = line.match(/^(.+?)\s+(is defined as|refers to|shall be|means|consists of)\s+(.+)$/i);
    if (defMatch && defMatch[1].length < 50 && defMatch[3].length > 15) {
      keyItems.push({
        term: defMatch[1].replace(/^(the|a|an)\s+/i, '').trim(),
        definition: `${defMatch[2]} ${defMatch[3].trim()}`,
      });
      continue;
    }

    // Numbers or dimensional rules
    const dimensionMatch = line.match(/^(.+?)\s+(\d+(?:\.\d+)?\s*(?:meters|m|mm|cm|sqm|%|degrees|hours|days|years))\b(.*)$/i);
    if (dimensionMatch && dimensionMatch[1].length < 60) {
      keyItems.push({
        term: dimensionMatch[1].trim(),
        definition: `${dimensionMatch[2]} ${dimensionMatch[3] || ''}`.trim(),
      });
    }
  }

  // If few specific matches found, chunk sentences into questions
  if (keyItems.length < targetQuestionCount) {
    const sentences = text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25 && s.length < 180);

    sentences.forEach((sentence, idx) => {
      const words = sentence.split(' ');
      if (words.length > 6) {
        keyItems.push({
          term: `Rule Note ${idx + 1}`,
          definition: sentence,
        });
      }
    });
  }

  // Comprehensive High-Yield Philippine ALE Licensure Knowledge Bank (ensures 15, 25, or 50 questions)
  const PHILIPPINE_ALE_BANK: { term: string; definition: string; code: string }[] = [
    { term: 'PD 1096 Habitable Room Ceiling Clearance', definition: 'Minimum 2.70m for naturally ventilated rooms; 2.40m for artificially air-conditioned rooms on upper floors (first floor requires 2.70m).', code: 'PD 1096 Section 805' },
    { term: 'BP 344 Accessible PWD Ramp Slope Rule', definition: 'Strictly 1:12 (8.33%) maximum gradient with intermediate 1.50m level rest landings every 6.00 meters of continuous run.', code: 'BP 344 Rule II Section 2.1' },
    { term: 'RA 9514 Fire Exit Maximum Travel Distance', definition: '45.0 meters in non-sprinklered buildings, or 60.0 meters in fully protected automatic fire sprinklered buildings.', code: 'RA 9514 Sec. 10.2.5.2' },
    { term: 'PD 1096 Standard Perpendicular Car Parking Stall', definition: '2.50 meters in width by 5.00 meters in length with minimum 6.00m two-way driveway circulation aisle.', code: 'PD 1096 Rule XIX' },
    { term: 'Philippine Bioclimatic Wind Channeling', definition: 'Orienting architectural breezeways to capture Amihan (Northeast monsoon) and Habagat (Southwest monsoon) with deep sun canopies.', code: 'Tropical Passive Design Theory' },
    { term: 'PD 1096 Minimum Window Area for Habitable Rooms', definition: 'Not less than 10% of the floor area of the room, opening directly to a court or public street.', code: 'PD 1096 Section 808' },
    { term: 'BP 344 Accessible Door Clear Width', definition: 'Minimum clear opening of 0.80 meters measured between the face of the door and the latch stop.', code: 'BP 344 Rule II Section 2.4' },
    { term: 'RA 9514 Minimum Corridor Width for Educational Occupancy', definition: 'Minimum clear width of 1.80 meters for corridors serving more than 100 occupants.', code: 'RA 9514 Rule 10 Div 10' },
    { term: 'PD 1096 Allowable Maximum Building Footprint (AMBF)', definition: 'The maximum portion of the lot that may be occupied by the building, determined by deducting required setbacks and yards.', code: 'PD 1096 Rule VII' },
    { term: 'BP 344 PWD Toilet Grab Bar Height', definition: 'Mounted horizontally at exactly 0.80 meters above the finished floor level along the water closet.', code: 'BP 344 Appendix A' },
    { term: 'PD 1096 Total Open Space within Lot (TOSL)', definition: 'Comprises the Unpaved Surface Area (USA) and Impervious Surface Area (ISA) surrounding the building footprint.', code: 'PD 1096 Rule VII' },
    { term: 'RA 9514 Fire Door Minimum Rating in 2-Hour Fire Wall', definition: 'Minimum 1.5-hour (90 minutes) fire protection rating equipped with an automatic closing latch.', code: 'RA 9514 Sec. 10.2.5.3' },
    { term: 'Leandro Locsin Architectural Masterpiece', definition: 'Cultural Center of the Philippines (CCP) Main Theater, demonstrating heroic floating concrete cantilevers.', code: 'Philippine Architectural History' },
    { term: 'Francisco Mañosa Vernacular Philosophy', definition: 'Father of Philippine Neo-Vernacular Architecture, celebrated for the Coconut Palace and San Miguel Corporation Building.', code: 'Philippine Architectural History' },
    { term: 'BP 344 Accessible Elevator Entrance Width', definition: 'Minimum 0.80m clear door opening with interior cab dimensions of at least 1.10m width by 1.40m depth.', code: 'BP 344 Rule II Section 3.1' },
    { term: 'PD 1096 R-1 Front Setback Requirement', definition: 'Minimum 4.50 meters front yard setback for low-density residential (R-1) zones.', code: 'PD 1096 Table VIII.2' },
    { term: 'RA 9514 Panic Hardware Requirement', definition: 'Required on exit doors of assembly and educational occupancies serving 50 or more persons; opens with 15 lbs pressure.', code: 'RA 9514 Sec. 10.2.5.2' },
    { term: 'SPP 202 Regular Architectural Design Services', definition: 'Covers Schematic Design Phase, Design Development Phase, Contract Document Phase, and Construction Phase.', code: 'PRC Architecture SPP 202' },
    { term: 'PD 1096 Mezzanine Floor Ceiling Height', definition: 'Minimum clear height of 1.80m above and below the mezzanine floor, and lot area not exceeding 50% of the room below.', code: 'PD 1096 Section 805' },
    { term: 'BP 344 Handrail Height Range', definition: 'Between 0.70m and 0.90m above steps or ramps, with an additional 0.30m extension beyond top and bottom landings.', code: 'BP 344 Rule II Section 2.2' },
    { term: 'PD 1096 Floor-to-Lot Area Ratio (FLAR)', definition: 'The ratio between the gross floor area (GFA) of a building and the total area of the lot on which it stands.', code: 'PD 1096 Rule VII' },
    { term: 'RA 9514 Occupant Load Factor for Classrooms', definition: '1.9 square meters per person net area for standard educational classrooms.', code: 'RA 9514 Table 10.2.5.1' },
    { term: 'Tropical Solar Shading Brise-Soleil', definition: 'Horizontal louvers for high-angle North-South sun; vertical louvers for low-angle East-West rising and setting sun.', code: 'Tropical Passive Architecture' },
    { term: 'Juan Nakpil Historic Distinction', definition: 'The very first National Artist of the Philippines for Architecture (1973), designer of Quiapo Church reconstruction.', code: 'Philippine Architectural History' },
    { term: 'PD 1096 Stair Tread and Riser Minimums', definition: 'Maximum riser height of 200mm and minimum run/tread width of 250mm for standard egress stairs.', code: 'PD 1096 Section 1207' },
    { term: 'BP 344 Tactile Surface Warning Tile', definition: 'Installed 0.30m before the edge of a ramp, staircase, or hazardous vehicular curb crossing for visually impaired individuals.', code: 'BP 344 Rule II' },
    { term: 'RA 9514 Fire Escape Stairs Permissibility', definition: 'Fire escapes are allowed only on existing buildings; prohibited as part of the required egress for new buildings.', code: 'RA 9514 Div 5' },
    { term: 'PD 1096 Water Closet Stall Minimum Dimensions', definition: 'Minimum width of 0.90m and depth of 1.50m for standard public comfort room compartments.', code: 'PD 1096 Rule VIII' },
    { term: 'SPP 201 Pre-Design Architectural Services', definition: 'Covers Consultation, Pre-Feasibility Studies, Site Selection and Analysis, Site Utilization, and Architectural Programming.', code: 'PRC Architecture SPP 201' },
    { term: 'Bahay na Bato Volada Construction', definition: 'An overhanging second-floor gallery supported by massive wooden posts, providing shading and rain shelter to ground level.', code: 'Philippine Vernacular Architecture' },
    { term: 'PD 1096 Minimum Lot Frontage for Inside Lot', definition: 'Minimum 12.00 meters frontage for low-density residential (R-1) single-detached inside lot.', code: 'PD 1096 Table VIII.1' },
    { term: 'BP 344 Accessible Parking Stall Clearance', definition: 'Minimum 3.70 meters width (including a 1.20m accessible walkway aisle) positioned closest to building entrance.', code: 'BP 344 Rule II Section 4' },
    { term: 'RA 9514 Dead-End Corridor Maximum Length', definition: 'Maximum 6.00 meters length in non-sprinklered buildings, or 12.00 meters in fully sprinklered buildings.', code: 'RA 9514 Sec. 10.2.5.2' },
    { term: 'PD 1096 Kitchen Floor Area Minimum', definition: 'Minimum 3.00 square meters with a least horizontal dimension of 1.50 meters.', code: 'PD 1096 Section 806' },
    { term: 'Amihan Monsoon Wind Flow Direction', definition: 'Northeast wind prevailing from October to February, characterized by cool, dry, refreshing breezes.', code: 'Philippine Climatology' },
    { term: 'Habagat Monsoon Wind Flow Direction', definition: 'Southwest wind prevailing from June to September, bringing heavy monsoon precipitation and warm humid air.', code: 'Philippine Climatology' },
    { term: 'PD 1096 Bath and Toilet Floor Area Minimum', definition: 'Minimum 1.20 square meters with a least horizontal dimension of 0.90 meters.', code: 'PD 1096 Section 806' },
    { term: 'BP 344 Washbasin Clearance Under Rim', definition: 'Minimum 0.75m vertical clear knee space under washbasin counter for wheelchair footrest clearance.', code: 'BP 344 Appendix A' },
    { term: 'RA 9514 Automatic Sprinkler Requirement for High-Rise', definition: 'Mandatory automatic fire sprinkler system throughout all buildings having an occupied floor more than 15.0m above grade.', code: 'RA 9514 Rule 10' },
    { term: 'Pablo Antonio Historic Distinction', definition: 'National Artist for Architecture (1976), pioneer of Philippine Art Deco style (FEU Campus, Ideal Theater).', code: 'Philippine Architectural History' },
    { term: 'PD 1096 Gross Floor Area (GFA) Exclusions', definition: 'Excludes parking areas, driveways, exterior covered balconies, and mechanical penthouse roof areas.', code: 'PD 1096 Rule VII' },
    { term: 'BP 344 Maximum Height of Threshold at Doorways', definition: 'Shall not exceed 25mm and must be beveled to facilitate smooth passage of wheelchairs.', code: 'BP 344 Rule II' },
    { term: 'RA 9514 Means of Egress Illumination', definition: 'Continuous emergency egress illumination not less than 10.7 lux (1 foot-candle) at floor level along the exit path.', code: 'RA 9514 Sec. 10.2.5.10' },
    { term: 'Ildefonso Santos Jr. Historic Distinction', definition: 'National Artist for Architecture (2006) as the Father of Philippine Landscape Architecture (Paco Park, Cultural Center).', code: 'Philippine Architectural History' },
    { term: 'PD 1096 Unpaved Surface Area (USA) Purpose', definition: 'Mandatory open ground surfaced with soil, grass, or permeable pavers to promote natural ground water replenishment.', code: 'PD 1096 Rule VIII' },
    { term: 'BP 344 Minimum Turning Space for Wheelchairs', definition: 'Minimum 1.50m by 1.50m (or 1.50m diameter circle) clear level floor area at dead ends and toilet vestibules.', code: 'BP 344 Rule II Section 2.1' },
    { term: 'RA 9514 Fire Safety Inspection Certificate (FSIC)', definition: 'Prerequisite document issued by the Bureau of Fire Protection (BFP) before issuance of an Occupancy Permit.', code: 'RA 9514 Rule 9' },
    { term: 'SPP 203 Specialized Architectural Services', definition: 'Covers Acoustic Design, Architectural Lighting, Interior Architecture, Site Development Planning, and Comprehensive Planning.', code: 'PRC Architecture SPP 203' },
    { term: 'Ventilated Double Roof Construction', definition: 'A tropical roofing strategy with an air space between upper cladding and ceiling that exhausts trapped heat through ridge vents.', code: 'Tropical Passive Design' },
    { term: 'PD 1096 Eaves and Canopy Clearance above Sidewalk', definition: 'Minimum clear vertical height of 3.00 meters above the established sidewalk grade.', code: 'PD 1096 Section 1004' }
  ];

  // Fill keyItems from knowledge bank up to targetQuestionCount
  let bankIndex = 0;
  while (keyItems.length < targetQuestionCount && bankIndex < PHILIPPINE_ALE_BANK.length) {
    const item = PHILIPPINE_ALE_BANK[bankIndex];
    if (!keyItems.some(k => k.term === item.term)) {
      keyItems.push(item);
    }
    bankIndex++;
  }

  // Build flashcards (up to 20)
  keyItems.slice(0, Math.min(keyItems.length, 25)).forEach((item, index) => {
    flashcards.push({
      id: `fc-gen-${index}`,
      front: item.term,
      back: item.definition,
      category: topicTitle,
    });
  });

  // Build Multiple Choice Questions up to targetQuestionCount
  keyItems.slice(0, targetQuestionCount).forEach((item, index) => {
    // Generate believable distractors from other items or architectural terms
    const otherDefs = keyItems
      .filter((_, i) => i !== index)
      .map((i) => i.definition)
      .slice(0, 3);

    // Fallback architectural distractors if notes are short
    const fallbackDistractors = [
      'Standard requirement dictated by PD 1096 Section 804',
      'Determined by zoning setbacks and allowable building footprint (AMBF)',
      'Universal Accessibility provision governed by BP 344 Rule II',
      'Prescribed by RA 9514 life safety and fire exit travel clearances',
      'Calculated based on Gross Floor Area and allowable Floor-to-Lot Area Ratio',
    ];

    while (otherDefs.length < 3) {
      otherDefs.push(fallbackDistractors[otherDefs.length % fallbackDistractors.length]);
    }

    const correctOption = item.definition;
    const allOptions = [correctOption, ...otherDefs.slice(0, 3)];
    // Shuffle options
    const shuffled = allOptions.sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(correctOption);

    questions.push({
      id: `q-gen-${index}`,
      type: 'multiple-choice',
      question: `Regarding ${item.term}, which of the following is correct according to the study material and Philippine Architectural Laws?`,
      options: shuffled,
      correctAnswer: correctIndex,
      explanation: `Correct: ${item.term} — ${item.definition}`,
      category: topicTitle,
      codeReference: item.code || `Philippine Licensure Reference on "${topicTitle}"`,
    });
  });

  return { questions, flashcards };
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
3. **Correct Answer**: Explicitly declare the correct choice.
4. **Architectural Rationale & Reference**: Provide a detailed explanation citing the relevant architectural code (e.g., PD 1096 NBCP, BP 344, RA 9514 Fire Code, or Architectural History/Theory).
5. **Flashcard Summary**: A 1-sentence quick recall rule for flashcard review.

**Study Material:**
${notesText.trim().slice(0, 4000)}

Generate the complete exam now with answer keys at the bottom!`;
}
