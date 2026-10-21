import type { QuizQuestion, FlashcardItem } from '../types';

/**
 * Intelligent client-side parser that analyzes pasted notes, lecture slides,
 * or syllabus text and constructs interactive quiz questions and flashcards.
 */
export function generateQuizFromNotes(
  text: string,
  topicTitle: string = 'Custom Lecture Review'
): { questions: QuizQuestion[]; flashcards: FlashcardItem[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const questions: QuizQuestion[] = [];
  const flashcards: FlashcardItem[] = [];

  // Extract key concept sentences (definitions, numbers, ratios, or colon statements)
  const keyItems: { term: string; definition: string }[] = [];

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
  if (keyItems.length < 3) {
    const sentences = text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25 && s.length < 180);

    sentences.slice(0, 8).forEach((sentence, idx) => {
      const words = sentence.split(' ');
      if (words.length > 6) {
        keyItems.push({
          term: `Key Architectural Rule ${idx + 1}`,
          definition: sentence,
        });
      }
    });
  }

  // Guaranteed fallback for Philippine ALE licensure exam prep (e.g. if uploaded binary without OCR or brief input)
  if (keyItems.length < 3) {
    keyItems.push(
      {
        term: 'PD 1096 Habitable Room Ceiling Clearance',
        definition: 'Minimum ceiling height of 2.70m for naturally ventilated rooms, and 2.40m for artificially air-conditioned rooms on upper floors.',
      },
      {
        term: 'BP 344 Accessible PWD Ramp Slope Rule',
        definition: 'Strictly 1:12 (8.33%) maximum slope with intermediate 1.50m level rest landings every 6.00 meters of continuous run.',
      },
      {
        term: 'RA 9514 Fire Exit Maximum Travel Distance',
        definition: '45.0 meters in non-sprinklered buildings, or 60.0 meters in fully protected automatic fire sprinklered buildings.',
      },
      {
        term: 'PD 1096 Standard Perpendicular Car Parking Stall',
        definition: '2.50 meters in width by 5.00 meters in length with minimum 6.00m two-way driveway circulation aisle.',
      },
      {
        term: 'Philippine Bioclimatic Wind Channeling',
        definition: 'Orienting architectural breezeways to capture Amihan (Northeast monsoon) and Habagat (Southwest monsoon) with deep sun canopies.',
      }
    );
  }

  // Build flashcards
  keyItems.slice(0, 12).forEach((item, index) => {
    flashcards.push({
      id: `fc-gen-${index}`,
      front: item.term,
      back: item.definition,
      category: topicTitle,
    });
  });

  // Build Multiple Choice Questions
  keyItems.slice(0, 8).forEach((item, index) => {
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
      question: `Regarding ${item.term}, which of the following is correct according to the study material?`,
      options: shuffled,
      correctAnswer: correctIndex,
      explanation: `Correct: ${item.term} — ${item.definition}`,
      category: topicTitle,
      codeReference: `Extracted from lecture notes on "${topicTitle}"`,
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
