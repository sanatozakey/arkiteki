import { describe, it, expect } from 'vitest';
import { generateQuizFromNotes } from '../src/utils/quizGenerator';
import { analyzeTextContentLocally } from '../src/utils/fileParser';
import { ALE_REVIEW_DECKS } from '../src/data/quizDecks';

describe('Task 1: Lesson Quizzes & Flashcards System', () => {
  describe('Strict Question Count Enforcement', () => {
    it('generates exactly 15 questions when 15 is requested', () => {
      const sampleNotes = 'Batas Pambansa Blg 344 prescribes 1:12 maximum ramp slope. Handrails must be 0.70m and 0.90m. Minimum door clearance is 0.80m. Turning space is 1.50m. Threshold height is 25mm.';
      const result = generateQuizFromNotes(sampleNotes, 'BP 344 Accessibility', 15);
      expect(result.questions).toHaveLength(15);
    });

    it('generates exactly 25 questions when 25 is requested', () => {
      const sampleNotes = 'PD 1096 National Building Code: R-1 front setback is 4.50m. Ceiling clearance is 2.40m with artificial ventilation. Parking slot is 2.50m x 5.00m. Habitable room floor area minimum is 6.00 sq.m.';
      const result = generateQuizFromNotes(sampleNotes, 'PD 1096 Building Code', 25);
      expect(result.questions).toHaveLength(25);
    });

    it('generates exactly 50 questions when 50 is requested', () => {
      const sampleNotes = 'History of Architecture: Leandro Locsin designed the Cultural Center of the Philippines. Francisco Mañosa pioneered the Coconut Palace. Juan Nakpil is the first National Artist. Mies van der Rohe coined less is more.';
      const result = generateQuizFromNotes(sampleNotes, 'Architectural History', 50);
      expect(result.questions).toHaveLength(50);
    });

    it('generates exactly custom question counts (e.g. 18 and 32)', () => {
      const text = 'Architectural Professional Practice and Building Laws in the Philippines.';
      const result18 = generateQuizFromNotes(text, 'Custom Review', 18);
      expect(result18.questions).toHaveLength(18);

      const result32 = generateQuizFromNotes(text, 'Custom Review', 32);
      expect(result32.questions).toHaveLength(32);
    });

    it('enforces min 5 and max 100 on custom count', () => {
      const text = 'Architectural Licensure Review notes.';
      const underMin = generateQuizFromNotes(text, 'Review', 2);
      expect(underMin.questions.length).toBeGreaterThanOrEqual(5);

      const overMax = generateQuizFromNotes(text, 'Review', 150);
      expect(overMax.questions.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Quiz Question Quality & Structure', () => {
    it('produces questions with exactly 4 options, a valid correct answer index, and explanation', () => {
      const sampleNotes = 'Ceiling clearance for habitable rooms with natural ventilation is 2.70 meters under PD 1096 Section 805.';
      const result = generateQuizFromNotes(sampleNotes, 'PD 1096 Review', 15);

      result.questions.forEach((q, idx) => {
        expect(q.id).toBeDefined();
        expect(q.question).toBeTypeOf('string');
        expect(q.question.length).toBeGreaterThan(10);
        expect(q.options).toBeInstanceOf(Array);
        expect(q.options).toHaveLength(4);
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswer).toBeLessThanOrEqual(3);
        expect(q.explanation).toBeTypeOf('string');
        expect(q.explanation.length).toBeGreaterThan(5);
      });
    });

    it('generates key recall flashcards matching the source material', () => {
      const sampleNotes = 'BP 344 Wheelchair Ramp: 1:12 maximum slope. Accessible doorway: 0.80m clear opening.';
      const result = generateQuizFromNotes(sampleNotes, 'BP 344 Accessibility', 15);

      expect(result.flashcards.length).toBeGreaterThan(0);
      result.flashcards.forEach((fc) => {
        expect(fc.id).toBeDefined();
        expect(fc.front).toBeTypeOf('string');
        expect(fc.back).toBeTypeOf('string');
        expect(fc.category).toBe('BP 344 Accessibility');
      });
    });
  });

  describe('Automatic Topic & Content Detection', () => {
    it('automatically identifies BP 344 Accessibility Law from document content', () => {
      const docText = 'This reviewer discusses Batas Pambansa Blg. 344, focusing on accessible ramps with 1:12 slope, tactile paving, dropped curbs, and PWD toilet compartments.';
      const metadata = analyzeTextContentLocally(docText, 'random-notes.pdf');

      expect(metadata.primarySubject).toContain('Accessibility Law (BP 344)');
      expect(metadata.secondaryTopics.length).toBeGreaterThan(0);
      expect(metadata.keyTermsAndConcepts).toContain('1:12 Slope');
    });

    it('automatically identifies PD 1096 National Building Code from document content', () => {
      const docText = 'Comprehensive reviewer on Presidential Decree 1096 National Building Code, including Allowable Maximum Building Footprint (AMBF), TOSL, and USA.';
      const metadata = analyzeTextContentLocally(docText, 'reviewer_module.docx');

      expect(metadata.primarySubject).toContain('Building Laws');
      expect(metadata.title).toContain('PD 1096');
      expect(metadata.keyTermsAndConcepts).toContain('AMBF');
    });

    it('automatically identifies Architectural History from document content', () => {
      const docText = 'History of Architecture covering Leandro Locsin, Francisco Mañosa, Bahay na Bato volada, and the classical Doric, Ionic, and Corinthian orders.';
      const metadata = analyzeTextContentLocally(docText, 'lecture.txt');

      expect(metadata.primarySubject).toContain('Architectural History');
      expect(metadata.keyTermsAndConcepts).toContain('Leandro Locsin');
    });
  });

  describe('Preloaded Topics Verification', () => {
    it('has verified preloaded decks for PD 1096, BP 344, and History of Architecture with at least 15 verified questions', () => {
      expect(ALE_REVIEW_DECKS).toHaveLength(3);

      const nbcpDeck = ALE_REVIEW_DECKS.find((d) => d.id === 'deck-nbcp');
      expect(nbcpDeck).toBeDefined();
      expect(nbcpDeck!.questions.length).toBeGreaterThanOrEqual(15);

      const bp344Deck = ALE_REVIEW_DECKS.find((d) => d.id === 'deck-bp344');
      expect(bp344Deck).toBeDefined();
      expect(bp344Deck!.questions.length).toBeGreaterThanOrEqual(15);

      const historyDeck = ALE_REVIEW_DECKS.find((d) => d.id === 'deck-history');
      expect(historyDeck).toBeDefined();
      expect(historyDeck!.questions.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe('200MB File Upload Limit & Validation', () => {
    it('rejects files exceeding 200MB with a clear 200MB limit error', async () => {
      const { processUploadedFile } = await import('../src/utils/fileParser');
      // Create a mock File object with size > 200MB (209,715,200 bytes)
      const oversizedFile = {
        name: 'Review of Related Literature.pdf',
        size: 200 * 1024 * 1024 + 1, // 209,715,201 bytes
        type: 'application/pdf',
      } as unknown as File;

      await expect(processUploadedFile(oversizedFile)).rejects.toThrow(
        'File "Review of Related Literature.pdf" exceeds the maximum upload limit of 200MB.'
      );
    });

    it('accepts files within the 200MB limit', async () => {
      const { processUploadedFile } = await import('../src/utils/fileParser');
      // Create a mock text File object within 200MB
      const mockBlob = new Blob(['PD 1096 Building Code Notes - AMBF and Setbacks'], { type: 'text/plain' });
      const validFile = new File([mockBlob], 'Building_Code_Notes.txt', { type: 'text/plain' });

      const result = await processUploadedFile(validFile);
      expect(result.name).toBe('Building_Code_Notes.txt');
      expect(result.size).toBeLessThanOrEqual(200 * 1024 * 1024);
      expect(result.rawText).toContain('PD 1096');
    });
  });

  describe('Independent Flashcard Generation & Strict Count Controls', () => {
    it('generates exactly 15 flashcards when 15 is requested', async () => {
      const { generateFlashcardsFromNotes } = await import('../src/utils/quizGenerator');
      const text = 'Batas Pambansa Blg 344: 1:12 slope, 0.80m doors, 1.50m turning space.';
      const cards = generateFlashcardsFromNotes(text, 'BP 344', 15);
      expect(cards).toHaveLength(15);
    });

    it('generates exactly 25 flashcards when 25 is requested', async () => {
      const { generateFlashcardsFromNotes } = await import('../src/utils/quizGenerator');
      const text = 'PD 1096 National Building Code: R-1 setbacks, TOSL, USA, AMBF.';
      const cards = generateFlashcardsFromNotes(text, 'PD 1096', 25);
      expect(cards).toHaveLength(25);
    });

    it('generates exactly 50 flashcards when 50 is requested', async () => {
      const { generateFlashcardsFromNotes } = await import('../src/utils/quizGenerator');
      const text = 'History of Architecture: Leandro Locsin, Francisco Mañosa, Juan Nakpil.';
      const cards = generateFlashcardsFromNotes(text, 'Architecture History', 50);
      expect(cards).toHaveLength(50);
    });

    it('generates exact custom flashcard counts (e.g. 18 cards)', async () => {
      const { generateFlashcardsFromNotes } = await import('../src/utils/quizGenerator');
      const text = 'Architectural Licensure Review notes.';
      const cards = generateFlashcardsFromNotes(text, 'Review', 18);
      expect(cards).toHaveLength(18);
    });
  });

  describe('Subtle Completion Sound Notification', () => {
    it('persists and retrieves sound notification preference in localStorage', async () => {
      const { isSoundNotificationEnabled, setSoundNotificationEnabled } = await import('../src/utils/soundNotification');
      
      setSoundNotificationEnabled(false);
      expect(isSoundNotificationEnabled()).toBe(false);

      setSoundNotificationEnabled(true);
      expect(isSoundNotificationEnabled()).toBe(true);
    });

    it('safely attempts to play completion chime without throwing in testing environment', async () => {
      const { playCompletionChime } = await import('../src/utils/soundNotification');
      expect(() => playCompletionChime()).not.toThrow();
    });
  });
});
