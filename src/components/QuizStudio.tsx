import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Layers, 
  Copy, 
  Check, 
  ArrowRight, 
  Upload, 
  FileCheck, 
  AlertCircle,
  Download,
  X,
  Trash2,
  BookOpen,
  Volume2,
  VolumeX,
  Shuffle,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ALE_REVIEW_DECKS } from '../data/quizDecks';
import { generateQuizFromNotes, generateFlashcardsFromNotes, buildGeminiExamPrompt } from '../utils/quizGenerator';
import { processUploadedFile } from '../utils/fileParser';
import { generateQuizWithGemini, generateFlashcardsWithGemini, detectTopicsWithGemini } from '../utils/geminiApi';
import { saveQuizScoreToSupabase } from '../utils/supabaseClient';
import { generateQuizPdf, generateFlashcardsPdf } from '../utils/pdfGenerator';
import { playCompletionChime, isSoundNotificationEnabled, setSoundNotificationEnabled } from '../utils/soundNotification';
import type { QuizQuestion, FlashcardItem, QuizDeck, UploadedFileItem, QuizAttemptRecord } from '../types';

interface QuizStudioProps {
  apiKey: string;
  onOpenConnectModal: () => void;
  user?: any;
  currentModel?: string;
  initialDeck?: QuizDeck | null;
}

export const QuizStudio: React.FC<QuizStudioProps> = ({ 
  apiKey, 
  onOpenConnectModal,
  user,
  currentModel,
  initialDeck,
}) => {
  const [activeMode, setActiveMode] = useState<'decks' | 'custom' | 'flashcards'>('decks');

  // Active decks state (persists custom uploaded decks + default decks)
  const [allDecks, setAllDecks] = useState<QuizDeck[]>(() => {
    try {
      const stored = localStorage.getItem('arkiteki_custom_decks');
      if (stored) {
        const customDecks: QuizDeck[] = JSON.parse(stored);
        if (Array.isArray(customDecks) && customDecks.length > 0) {
          return [...customDecks, ...ALE_REVIEW_DECKS];
        }
      }
    } catch (e) {
      console.warn('Failed to load custom decks from localStorage', e);
    }
    return ALE_REVIEW_DECKS;
  });

  const [selectedDeck, setSelectedDeck] = useState<QuizDeck>(() => {
    try {
      const stored = localStorage.getItem('arkiteki_custom_decks');
      if (stored) {
        const customDecks: QuizDeck[] = JSON.parse(stored);
        if (Array.isArray(customDecks) && customDecks.length > 0) {
          return customDecks[0];
        }
      }
    } catch {
      // fallback
    }
    return ALE_REVIEW_DECKS[0];
  });

  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>(() => selectedDeck.questions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Configurable question count: 15, 25, 50, or custom
  const [questionCountType, setQuestionCountType] = useState<15 | 25 | 50 | 'custom'>(15);
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(20);

  const getEffectiveQuestionCount = (): number => {
    if (questionCountType === 'custom') {
      const val = Number(customQuestionCount);
      if (isNaN(val) || val < 1) return 15;
      return Math.min(Math.max(val, 5), 100);
    }
    return questionCountType;
  };

  // Removes a custom uploaded topic deck from state & localStorage
  const handleRemoveCustomDeck = (deckId: string) => {
    if (!window.confirm('Are you sure you want to remove this uploaded topic deck?')) {
      return;
    }
    setAllDecks((prev) => {
      const updated = prev.filter((d) => d.id !== deckId);
      const customOnly = updated.filter((d) => d.isCustom);
      try {
        localStorage.setItem('arkiteki_custom_decks', JSON.stringify(customOnly));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    if (selectedDeck.id === deckId) {
      handleSelectDeck(ALE_REVIEW_DECKS[0]);
    }
  };

  // Expands deck questions up to targetCount without contaminating custom uploaded decks
  const buildQuestionsForDeck = (deck: QuizDeck, targetCount: number): QuizQuestion[] => {
    // If user uploaded this deck, keep questions strictly from their upload!
    if (deck.isCustom) {
      return deck.questions.slice(0, targetCount);
    }
    if (deck.questions.length >= targetCount) {
      return deck.questions.slice(0, targetCount);
    }
    const sourceText = `${deck.title}. ${deck.subject}. ${deck.description}`;
    const { questions: filler } = generateQuizFromNotes(sourceText, deck.title, targetCount);
    const existingQuestions = new Set(deck.questions.map((q) => q.question));
    const merged = [...deck.questions];

    for (const q of filler) {
      if (merged.length >= targetCount) break;
      if (!existingQuestions.has(q.question)) {
        merged.push(q);
        existingQuestions.add(q.question);
      }
    }
    return merged.slice(0, targetCount);
  };

  // Flashcards state with independent count controls
  const [flashcardCountType, setFlashcardCountType] = useState<15 | 25 | 50 | 'custom'>(15);
  const [customFlashcardCount, setCustomFlashcardCount] = useState<number>(15);
  const [currentFlashcards, setCurrentFlashcards] = useState<FlashcardItem[]>(() => ALE_REVIEW_DECKS[0].flashcards);
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isSoundNotificationEnabled());

  const getEffectiveFlashcardCount = (): number => {
    if (flashcardCountType === 'custom') {
      const val = Number(customFlashcardCount);
      if (isNaN(val) || val < 1) return 15;
      return Math.min(Math.max(val, 5), 100);
    }
    return flashcardCountType;
  };

  const buildFlashcardsForDeck = (deck: QuizDeck, targetCount: number): FlashcardItem[] => {
    if (deck.flashcards.length >= targetCount) {
      return deck.flashcards.slice(0, targetCount);
    }
    const sourceText = `${deck.title}. ${deck.subject}. ${deck.description}`;
    const filler = generateFlashcardsFromNotes(sourceText, deck.title, targetCount);
    const existingFronts = new Set(deck.flashcards.map((f) => f.front.toLowerCase()));
    const merged = [...deck.flashcards];

    for (const card of filler) {
      if (merged.length >= targetCount) break;
      if (!existingFronts.has(card.front.toLowerCase())) {
        merged.push(card);
        existingFronts.add(card.front.toLowerCase());
      }
    }
    return merged.slice(0, targetCount);
  };

  const handleFlashcardCountSelectionChange = (newCount: 15 | 25 | 50 | 'custom', customVal?: number) => {
    setFlashcardCountType(newCount);
    if (customVal !== undefined) {
      setCustomFlashcardCount(customVal);
    }
    const count = newCount === 'custom' ? (customVal ?? customFlashcardCount) : newCount;
    const updated = buildFlashcardsForDeck(selectedDeck, count);
    setCurrentFlashcards(updated);
    setFlashcardIndex(0);
    setIsFlipped(false);
  };

  const handleGenerateFlashcards = async () => {
    const targetCount = getEffectiveFlashcardCount();
    setIsGeneratingFlashcards(true);
    setFlashcardIndex(0);
    setIsFlipped(false);

    try {
      let cards: FlashcardItem[] = [];
      const sourceText = pastedNotes.trim() || uploadedFile?.rawText || uploadedFile?.textPreview || `${selectedDeck.title}. ${selectedDeck.subject}. ${selectedDeck.description}`;

      if (apiKey) {
        cards = await generateFlashcardsWithGemini({
          apiKey,
          notesText: pastedNotes || undefined,
          fileItem: uploadedFile || undefined,
          topicTitle: selectedDeck.title,
          model: currentModel,
          flashcardCount: targetCount,
          detectedMetadata: uploadedFile?.detectedMetadata,
        });
      }

      if (!cards || cards.length === 0) {
        cards = generateFlashcardsFromNotes(sourceText, selectedDeck.title, targetCount);
      }

      setCurrentFlashcards(cards);
      playCompletionChime();
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2C6E49', '#C85A32', '#1B4332'],
      });
    } catch (err) {
      console.warn('Flashcard generation error, using local fallback:', err);
      const fallbackCards = buildFlashcardsForDeck(selectedDeck, targetCount);
      setCurrentFlashcards(fallbackCards);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleShuffleFlashcards = () => {
    setCurrentFlashcards((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
    setFlashcardIndex(0);
    setIsFlipped(false);
  };

  const handleDownloadFlashcards = () => {
    generateFlashcardsPdf(selectedDeck, currentFlashcards);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#2C6E49', '#FAF8F5'],
    });
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundNotificationEnabled(next);
    if (next) {
      playCompletionChime();
    }
  };

  // File upload & notes state
  const [uploadedFile, setUploadedFile] = useState<UploadedFileItem | null>(null);
  const [pastedNotes, setPastedNotes] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('Philippine Building Laws');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [exported, setExported] = useState<boolean>(false);

  // Load initial deck if passed from ProfileView (Retake quiz)
  useEffect(() => {
    if (initialDeck) {
      handleSelectDeck(initialDeck);
      setActiveMode('decks');
    }
  }, [initialDeck]);

  // Start or reset quiz
  const handleSelectDeck = (deck: QuizDeck, overrideCount?: number) => {
    const targetCount = overrideCount ?? getEffectiveQuestionCount();
    setSelectedDeck(deck);
    const questionsToUse = buildQuestionsForDeck(deck, targetCount);
    setCurrentQuestions(questionsToUse);
    const flashcardsToUse = buildFlashcardsForDeck(deck, getEffectiveFlashcardCount());
    setCurrentFlashcards(flashcardsToUse);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setFlashcardIndex(0);
    setIsFlipped(false);
  };

  const handleCountSelectionChange = (newCount: 15 | 25 | 50 | 'custom', customVal?: number) => {
    setQuestionCountType(newCount);
    if (customVal !== undefined) {
      setCustomQuestionCount(customVal);
    }
    const count = newCount === 'custom' ? (customVal ?? customQuestionCount) : newCount;
    // If not answered yet or quiz finished, immediately regenerate active deck items to match count
    if (currentQuestionIndex === 0 && !isAnswerSubmitted) {
      const updated = buildQuestionsForDeck(selectedDeck, count);
      setCurrentQuestions(updated);
    }
  };

  // Answer selection
  const handleOptionClick = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
    setIsAnswerSubmitted(true);

    const currentQ = currentQuestions[currentQuestionIndex];
    if (index === currentQ.correctAnswer) {
      setScore(prev => prev + 1);
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#2C6E49', '#3B7A57'],
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#2C6E49', '#C85A32', '#EAE5D9'],
      });

      // Save quiz attempt locally so it immediately shows on Profile page
      const attemptRecord: QuizAttemptRecord = {
        id: `qa-${Date.now()}`,
        deckId: selectedDeck.id,
        deckTitle: selectedDeck.title,
        score,
        totalQuestions: currentQuestions.length,
        percentage: Math.round((score / currentQuestions.length) * 100),
        passed: (score / currentQuestions.length) >= 0.70,
        timestamp: Date.now(),
      };
      try {
        const prev = JSON.parse(localStorage.getItem('arkiteki_quiz_history') || '[]');
        localStorage.setItem('arkiteki_quiz_history', JSON.stringify([attemptRecord, ...prev]));
      } catch (e) {
        console.warn('Failed to save to local quiz history', e);
      }

      // Automatically sync score to Supabase if logged in
      if (user?.id) {
        saveQuizScoreToSupabase(user.id, {
          deckTitle: selectedDeck.title,
          score,
          totalQuestions: currentQuestions.length,
        });
      }
    }
  };

  const handleRestartQuiz = () => {
    const questionsToUse = buildQuestionsForDeck(selectedDeck, getEffectiveQuestionCount());
    setCurrentQuestions(questionsToUse);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  // Handle file upload (loads file & derives topic, ready for generation)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setErrorMessage('');
    setGenerationStage('Reading and processing uploaded file...');

    try {
      const processed = await processUploadedFile(file);
      setUploadedFile(processed);

      // Automatic topic detection with Gemini if apiKey available
      if (apiKey && (processed.rawText || processed.base64Data)) {
        try {
          setGenerationStage('Identifying document subject, topics, and key concepts with Gemini AI...');
          const meta = await detectTopicsWithGemini({
            apiKey,
            fileItem: processed,
            rawText: processed.rawText,
            model: currentModel,
          });
          processed.detectedMetadata = meta;
          setCustomTopic(meta.primarySubject || meta.title);
        } catch (e) {
          console.warn('Gemini topic detection fallback to local:', e);
          if (processed.detectedMetadata) {
            setCustomTopic(processed.detectedMetadata.primarySubject || processed.detectedMetadata.title);
          }
        }
      } else if (processed.detectedMetadata) {
        setCustomTopic(processed.detectedMetadata.primarySubject || processed.detectedMetadata.title);
      } else {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setCustomTopic(cleanName);
      }

      // If text extracted, populate preview
      if (processed.textPreview && !pastedNotes) {
        setPastedNotes(processed.textPreview);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read file.');
    } finally {
      setIsProcessingFile(false);
      setGenerationStage('');
    }
  };

  // Turn custom notes or file into interactive quiz (Strict Count & 100% Grounded)
  const handleGenerateFromNotes = async () => {
    if (!pastedNotes.trim() && !uploadedFile && !customTopic.trim()) {
      setErrorMessage('Please upload a file or paste study notes first.');
      return;
    }

    const targetCount = getEffectiveQuestionCount();
    setIsProcessingFile(true);
    setErrorMessage('');
    setGenerationStage(`Analyzing architectural study materials for a strict ${targetCount}-question exam...`);

    try {
      let questions: QuizQuestion[] = [];
      let flashcards: FlashcardItem[] = [];
      let badgeLabel = 'Gemini AI';

      if (apiKey) {
        try {
          setGenerationStage(`Generating exactly ${targetCount} Philippine Board Exam questions with Gemini AI...`);
          const generated = await generateQuizWithGemini({
            apiKey,
            notesText: pastedNotes || undefined,
            fileItem: uploadedFile || undefined,
            topicTitle: customTopic || 'Philippine Architecture Review',
            model: currentModel,
            questionCount: targetCount,
            detectedMetadata: uploadedFile?.detectedMetadata,
          });

          if (generated.questions && generated.questions.length > 0) {
            questions = generated.questions;
            flashcards = generated.flashcards;
          }
        } catch (geminiError: any) {
          console.warn('Gemini online generation error, falling back to local engine:', geminiError);
          setErrorMessage(
            `Gemini note: ${geminiError.message || 'AI request timed out'}. Seamlessly activated Philippine Licensure Quiz Engine!`
          );
        }
      }

      // If Gemini wasn't used or returned no items, use client-side licensure generator
      if (questions.length === 0) {
        setGenerationStage(`Synthesizing exactly ${targetCount} questions with Philippine Licensure Knowledge Base...`);
        const sourceText = pastedNotes.trim() || uploadedFile?.rawText || uploadedFile?.textPreview || customTopic;
        const result = generateQuizFromNotes(sourceText, customTopic || 'Custom Review Notes', targetCount);
        questions = result.questions;
        flashcards = result.flashcards;
        badgeLabel = apiKey ? 'Local Engine' : 'Offline Mode';
      }

      const cleanTitle = customTopic.trim() || uploadedFile?.detectedMetadata?.title || (uploadedFile ? uploadedFile.name.replace(/\.[^/.]+$/, '') : 'Custom Review Notes');

      const newDeck: QuizDeck = {
        id: `deck-custom-${Date.now()}`,
        title: cleanTitle,
        subject: uploadedFile?.detectedMetadata?.primarySubject || 'Uploaded Lesson',
        badge: badgeLabel,
        description: `Custom reviewer created from ${uploadedFile ? uploadedFile.name : 'study notes'}.`,
        questionCount: questions.length,
        questions,
        flashcards,
        isCustom: true,
        detectedMetadata: uploadedFile?.detectedMetadata,
      };

      // Add to decks list and persist custom decks
      setAllDecks((prev) => {
        const updated = [newDeck, ...prev];
        const customOnly = updated.filter((d) => d.isCustom);
        try {
          localStorage.setItem('arkiteki_custom_decks', JSON.stringify(customOnly));
        } catch (e) {
          console.warn('Failed to save custom decks to localStorage', e);
        }
        return updated;
      });
      handleSelectDeck(newDeck, targetCount);
      setActiveMode('decks');

      // Celebration confetti
      confetti({
        particleCount: 55,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2C6E49', '#C85A32', '#FAF8F5'],
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Quiz generation failed.');
    } finally {
      setIsProcessingFile(false);
      setGenerationStage('');
    }
  };

  // Copy Gemini prompt for deep exam generation
  const handleCopyGeminiExamPrompt = () => {
    const prompt = buildGeminiExamPrompt(
      pastedNotes || 'Philippine Building Laws (PD 1096, BP 344, RA 9514) review notes',
      'Philippine Architecture Licensure Examination (ALE) Multiple Choice Quiz',
      15
    );
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    confetti({
      particleCount: 20,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#2C6E49', '#C85A32'],
    });
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleExportReviewer = () => {
    let md = `# ${selectedDeck.title} • Licensure Exam Reviewer Sheet\n`;
    md += `Subject: ${selectedDeck.subject}\n`;
    md += `Description: ${selectedDeck.description}\n\n`;

    currentQuestions.forEach((q, idx) => {
      md += `### ${idx + 1}. ${q.question}\n\n`;
      if (q.options) {
        q.options.forEach((opt, oIdx) => {
          const isCorrect = oIdx === q.correctAnswer;
          md += `- [${isCorrect ? 'x' : ' '}] ${String.fromCharCode(65 + oIdx)}. ${opt}${isCorrect ? '  <-- CORRECT ANSWER' : ''}\n`;
        });
      }
      if (q.codeReference) {
        md += `\n**Building Law Reference:** ${q.codeReference}\n`;
      }
      md += `**Rationale / Explanation:** ${q.explanation}\n\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setExported(true);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#2C6E49', '#C85A32'],
    });
    setTimeout(() => setExported(false), 2500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) return;

      if (activeMode === 'decks') {
        if (!isAnswerSubmitted) {
          if (e.key === '1' || e.key.toLowerCase() === 'a') handleOptionClick(0);
          else if (e.key === '2' || e.key.toLowerCase() === 'b') handleOptionClick(1);
          else if (e.key === '3' || e.key.toLowerCase() === 'c') handleOptionClick(2);
          else if (e.key === '4' || e.key.toLowerCase() === 'd') handleOptionClick(3);
        } else {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNextQuestion();
          }
        }
      } else if (activeMode === 'flashcards') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setIsFlipped(prev => !prev);
        } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
          setIsFlipped(false);
          setFlashcardIndex(prev => (prev + 1) % currentFlashcards.length);
        } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
          setIsFlipped(false);
          setFlashcardIndex(prev => Math.max(0, prev - 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, isAnswerSubmitted, currentQuestionIndex, flashcardIndex, currentQuestions, currentFlashcards]);

  const currentQ = currentQuestions[currentQuestionIndex];
  const currentCard = currentFlashcards[flashcardIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] font-mono font-bold tracking-wider px-3 py-1 rounded-full bg-[#2C6E49]/10 text-[#2C6E49] uppercase inline-block">
          Philippine Architecture Licensure Exam (ALE)
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight font-serif">
          Lesson Quizzes & Flashcards
        </h2>
        <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          Upload any PDF, Word document, image, or notes to generate board-exam multiple choice questions and flashcards.
        </p>

        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 w-fit mx-auto mt-4 shadow-xs">
          <button
            onClick={() => setActiveMode('decks')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeMode === 'decks'
                ? 'bg-[#2C6E49] text-white font-bold shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Interactive Quiz ({currentQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveMode('flashcards')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeMode === 'flashcards'
                ? 'bg-[#2C6E49] text-white font-bold shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Flashcards ({currentFlashcards.length})</span>
          </button>

          <button
            onClick={() => setActiveMode('custom')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeMode === 'custom'
                ? 'bg-[#2C6E49] text-white font-bold shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File / Paste Notes</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center border-l border-[#E8E4DC] dark:border-stone-800 pl-3 ${
              soundEnabled
                ? 'text-[#2C6E49] dark:text-emerald-400 hover:bg-[#2C6E49]/10'
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
            title={soundEnabled ? 'Completion chime enabled (Click to mute)' : 'Completion chime muted (Click to enable)'}
            aria-label={soundEnabled ? 'Mute sound notification' : 'Enable sound notification'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MODE 1: INTERACTIVE QUIZ */}
      {activeMode === 'decks' && (
        <div className="space-y-4">
          {/* Question Count Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] dark:bg-stone-950 p-3 rounded-2xl border border-[#E8E4DC] dark:border-stone-800 text-xs transition-colors">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Exam Question Count:</span>
              <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-[#E8E4DC] dark:border-stone-800">
                {([15, 25, 50] as const).map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleCountSelectionChange(count)}
                    className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer text-xs ${
                      questionCountType === count
                        ? 'bg-[#2C6E49] text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handleCountSelectionChange('custom')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer text-xs ${
                    questionCountType === 'custom'
                      ? 'bg-[#2C6E49] text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {questionCountType === 'custom' && (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-stone-500 dark:text-stone-400 text-xs">Items:</span>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={customQuestionCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 15;
                    handleCountSelectionChange('custom', val);
                  }}
                  className="w-16 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-[#E8E4DC] dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#2C6E49]"
                />
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">(5 - 100 items)</span>
              </div>
            )}

            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
              Exam Length: <strong className="text-[#2C6E49] dark:text-emerald-400 font-bold">{currentQuestions.length} Questions</strong>
            </div>
          </div>

          {/* Deck Selector & PDF Export Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-[#E8E4DC] dark:border-stone-800 shadow-xs transition-colors">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs text-stone-400 dark:text-stone-500 font-mono px-2">Topic:</span>
              {allDecks.map((d) => (
                <div key={d.id} className="relative inline-flex items-center">
                  <button
                    onClick={() => handleSelectDeck(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      selectedDeck.id === d.id
                        ? 'bg-[#2C6E49]/15 text-[#2C6E49] dark:text-emerald-400 border border-[#2C6E49]/30 font-bold'
                        : 'bg-[#FAF8F5] dark:bg-stone-950 text-stone-600 dark:text-stone-400 border border-[#E8E4DC] dark:border-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    <span>{d.title}</span>
                    {d.isCustom && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustomDeck(d.id);
                        }}
                        className="p-0.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950/50 hover:text-rose-600 text-stone-400 transition cursor-pointer ml-1"
                        title="Remove this uploaded topic"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Export Sheet & PDF Download Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const exportDeck: QuizDeck = {
                    ...selectedDeck,
                    questions: currentQuestions,
                    questionCount: currentQuestions.length,
                  };
                  generateQuizPdf(exportDeck);
                }}
                title="Download Official Philippine Architecture Licensure Exam PDF with Answer Key"
                className="text-xs text-stone-700 dark:text-stone-300 hover:text-[#1B4332] dark:hover:text-emerald-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4DC] dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-[#2C6E49]/30 cursor-pointer transition font-semibold"
              >
                <Download className="w-3.5 h-3.5 text-[#2C6E49] dark:text-emerald-400" />
                <span>Exam PDF</span>
              </button>

              <button
                onClick={() => {
                  generateFlashcardsPdf(selectedDeck);
                }}
                title="Download Printable Study Flashcards PDF"
                className="text-xs text-stone-700 dark:text-stone-300 hover:text-[#C85A32] dark:hover:text-amber-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4DC] dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-950 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-[#C85A32]/30 cursor-pointer transition font-semibold"
              >
                <Download className="w-3.5 h-3.5 text-[#C85A32] dark:text-amber-500" />
                <span>Flashcards PDF</span>
              </button>

              <button
                onClick={handleExportReviewer}
                title="Copy reviewer to clipboard"
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E8E4DC] dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition font-medium"
              >
                {exported ? <Check className="w-3.5 h-3.5 text-[#2C6E49]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{exported ? 'Copied' : 'Markdown'}</span>
              </button>

              {selectedDeck.isCustom && (
                <button
                  onClick={() => handleRemoveCustomDeck(selectedDeck.id)}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 cursor-pointer transition font-semibold"
                  title="Remove this uploaded topic"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete Topic</span>
                </button>
              )}

              <button
                onClick={handleRestartQuiz}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-stone-50 cursor-pointer"
                title="Restart quiz"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Active Question Card */}
          {!quizFinished && currentQ ? (
            <div className="bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 transition-colors">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#F0ECE1] dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-stone-950 text-[#2C6E49] dark:text-emerald-400 border border-[#E8E4DC] dark:border-stone-800">
                    Question {currentQuestionIndex + 1} of {currentQuestions.length}
                  </span>
                  {currentQ.category && (
                    <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                      • {currentQ.category}
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                  Score: <strong className="text-[#2C6E49] dark:text-emerald-400 font-bold">{score}</strong> / {currentQuestionIndex + (isAnswerSubmitted ? 1 : 0)}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base md:text-lg font-semibold text-stone-900 dark:text-stone-100 leading-relaxed m-0 font-serif">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options?.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctAnswer;

                  let style = 'border-[#E8E4DC] dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-950 hover:border-stone-400 dark:hover:border-stone-700 text-stone-800 dark:text-stone-200';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      style = 'border-[#2C6E49] bg-emerald-50 dark:bg-emerald-950/40 text-[#1B4332] dark:text-emerald-300 ring-1 ring-[#2C6E49]';
                    } else if (isSelected && !isCorrect) {
                      style = 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 ring-1 ring-rose-400';
                    } else {
                      style = 'border-[#E8E4DC] dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-950 text-stone-400 dark:text-stone-600 opacity-60';
                    }
                  }

                  const letter = String.fromCharCode(65 + idx);

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => handleOptionClick(idx)}
                      className={`w-full p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-4 ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                          isAnswerSubmitted && isCorrect
                            ? 'bg-[#2C6E49] text-white'
                            : isAnswerSubmitted && isSelected && !isCorrect
                            ? 'bg-rose-500 text-white'
                            : 'bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 text-stone-600 dark:text-stone-300'
                        }`}>
                          {letter}
                        </span>
                        <span className="text-xs md:text-sm font-medium leading-normal">
                          {option}
                        </span>
                      </div>

                      {isAnswerSubmitted && (
                        <div>
                          {isCorrect && <CheckCircle2 className="w-5 h-5 text-[#2C6E49] dark:text-emerald-400 shrink-0" />}
                          {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswerSubmitted && (
                <div className="pt-4 border-t border-[#F0ECE1] space-y-4">
                  <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E4DC] text-xs text-stone-700 leading-relaxed space-y-1">
                    <span className="text-[11px] font-mono font-bold text-[#2C6E49] uppercase block">
                      Philippine Licensure Rationale:
                    </span>
                    <p className="m-0 text-stone-700">{currentQ.explanation}</p>
                    {currentQ.codeReference && (
                      <span className="text-[10px] font-mono text-stone-400 block pt-1">
                        Code Reference: {currentQ.codeReference}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-2xl bg-[#2C6E49] hover:bg-[#23583a] text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-[#2C6E49]/20 transition"
                    >
                      <span>{currentQuestionIndex + 1 === currentQuestions.length ? 'View Board Exam Rating' : 'Next Question'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Score Summary */
            <div className="bg-white border border-[#E8E4DC] rounded-3xl p-8 text-center max-w-lg mx-auto shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#2C6E49]/10 text-[#2C6E49] flex items-center justify-center mx-auto text-2xl font-bold">
                🏛️
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-[#2C6E49] uppercase tracking-wider block mb-1">
                  Licensure Simulation Results
                </span>
                <h3 className="text-2xl font-bold text-stone-900 mb-1">
                  {Math.round((score / currentQuestions.length) * 100)}% Board Rating
                </h3>
                <p className="text-xs text-stone-500 m-0">
                  {score} of {currentQuestions.length} correct in {selectedDeck.title}
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DC] text-xs text-stone-700 leading-relaxed">
                {score >= currentQuestions.length * 0.75 ? (
                  <span className="text-[#2C6E49] font-medium">
                    ✨ Passing Score! Great mastery of Philippine building codes and architectural standards.
                  </span>
                ) : (
                  <span className="text-stone-600">
                    📖 Review the flashcards below to lock in the dimensions before taking the quiz again!
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestartQuiz}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Retake Quiz
                </button>

                <button
                  onClick={() => setActiveMode('flashcards')}
                  className="px-5 py-2 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] text-white text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Study Flashcards
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: FLASHCARDS */}
      {activeMode === 'flashcards' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Topic Switcher Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider block">
              Active Topic:
            </span>
            <div className="flex flex-wrap gap-2">
              {allDecks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => handleSelectDeck(deck)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                    selectedDeck.id === deck.id
                      ? 'bg-[#2C6E49] text-white border-[#2C6E49] shadow-xs'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-[#E8E4DC] dark:border-stone-800 hover:border-stone-400'
                  }`}
                >
                  <span>{deck.title}</span>
                  {deck.isCustom && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">Custom</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Controls Bar: Count Selection + Generation + Download */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] dark:bg-stone-950 p-3.5 rounded-2xl border border-[#E8E4DC] dark:border-stone-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Cards:</span>
              <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-[#E8E4DC] dark:border-stone-800">
                {([15, 25, 50] as const).map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleFlashcardCountSelectionChange(count)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer text-xs ${
                      flashcardCountType === count
                        ? 'bg-[#2C6E49] text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50'
                    }`}
                  >
                    {count}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleFlashcardCountSelectionChange('custom')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer text-xs ${
                    flashcardCountType === 'custom'
                      ? 'bg-[#2C6E49] text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50'
                  }`}
                >
                  Custom
                </button>
              </div>

              {flashcardCountType === 'custom' && (
                <div className="flex items-center gap-1.5 ml-1 animate-fade-in">
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={customFlashcardCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 15;
                      handleFlashcardCountSelectionChange('custom', val);
                    }}
                    className="w-16 px-2 py-1 text-xs font-mono font-bold rounded-lg border border-[#E8E4DC] dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#2C6E49]"
                  />
                  <span className="text-[11px] text-stone-400 font-mono">cards</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateFlashcards}
                disabled={isGeneratingFlashcards}
                className="px-3.5 py-1.5 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
                title="Generate fresh flashcards with Gemini AI"
              >
                {isGeneratingFlashcards ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Cards</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShuffleFlashcards}
                className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition cursor-pointer"
                title="Shuffle flashcards"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDownloadFlashcards}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
                title="Download printable Flashcards PDF"
              >
                <Download className="w-3.5 h-3.5 text-[#2C6E49] dark:text-emerald-400" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>

          {/* Progress bar and counter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-medium text-stone-700 dark:text-stone-300">{selectedDeck.title}</span>
              <span className="font-mono text-xs font-semibold text-[#2C6E49] dark:text-emerald-400">
                Card {flashcardIndex + 1} of {currentFlashcards.length}
              </span>
            </div>
            <div className="w-full bg-[#E8E4DC] dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#2C6E49] dark:bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((flashcardIndex + 1) / Math.max(1, currentFlashcards.length)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[260px] bg-white dark:bg-stone-900 border-2 border-[#E8E4DC] dark:border-stone-800 hover:border-[#2C6E49]/60 dark:hover:border-emerald-500/60 rounded-3xl p-7 flex flex-col justify-between items-center text-center cursor-pointer transition-all shadow-sm select-none group"
          >
            <div className="w-full flex items-center justify-between text-[11px] font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-stone-950 text-[#2C6E49] dark:text-emerald-400 font-bold uppercase border border-[#E8E4DC] dark:border-stone-800">
                {isFlipped ? 'Answer / Code Provision' : 'Concept / Provision'}
              </span>
              <span className="text-stone-400 dark:text-stone-500 flex items-center gap-1 group-hover:text-stone-600 transition">
                <span>Click or Press Space to flip</span>
                <RotateCcw className="w-3 h-3" />
              </span>
            </div>

            <div className="my-auto py-5 px-3">
              {!isFlipped ? (
                <h3 className="text-base md:text-xl font-bold text-stone-900 dark:text-stone-100 leading-relaxed font-serif m-0">
                  {currentCard?.front || 'No flashcard available'}
                </h3>
              ) : (
                <div className="space-y-2.5 animate-fade-in">
                  <p className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-emerald-300 leading-relaxed m-0 font-serif">
                    {currentCard?.back}
                  </p>
                  {currentCard?.category && (
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono block">
                      Category: {currentCard.category}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
              {isFlipped ? '✅ Click to flip back' : '💡 Click to reveal answer'}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={() => {
                setIsFlipped(false);
                setFlashcardIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={flashcardIndex === 0}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-30 text-xs font-semibold cursor-pointer transition"
            >
              ← Previous Card
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              Flip 🔄
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setFlashcardIndex((prev) => (prev + 1) % currentFlashcards.length);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#2C6E49] hover:bg-[#23583a] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer shadow-xs transition"
            >
              Next Card →
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: UPLOAD FILE & PASTE NOTES */}
      {activeMode === 'custom' && (
        <div className="bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-[#F0ECE1] dark:border-stone-800 pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-stone-900 dark:text-stone-100 font-serif m-0">
                Upload Lessons & Notes to Generate Quizzes
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 m-0">
                Supports PDF reviewers, Word documents (.docx), photos of book pages (.jpg/.png), or study notes (Supports up to 200MB).
              </p>
            </div>
            {apiKey ? (
              <span className="text-[11px] text-[#2C6E49] dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2C6E49] dark:bg-emerald-400 animate-pulse" />
                <span>Gemini API Active</span>
              </span>
            ) : (
              <button
                onClick={onOpenConnectModal}
                className="text-[11px] text-stone-500 dark:text-stone-400 hover:text-[#2C6E49] dark:hover:text-emerald-400 underline cursor-pointer"
              >
                Connect Gemini Account
              </button>
            )}
          </div>

          {/* Drag & Drop File Upload Box */}
          <div className="border-2 border-dashed border-[#DDD8CE] dark:border-stone-700 hover:border-[#2C6E49] dark:hover:border-emerald-500 rounded-2xl p-6 text-center bg-[#FAF8F5] dark:bg-stone-950 transition relative cursor-pointer group">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md,.jpg,.jpeg,.png,.webp"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 text-[#2C6E49] dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200 m-0">
                  {uploadedFile ? uploadedFile.name : 'Click or drop files here (PDF, Word, Images, Notes)'}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 m-0">
                  {uploadedFile
                    ? `${uploadedFile.size > 1024 * 1024 ? (uploadedFile.size / (1024 * 1024)).toFixed(1) + ' MB' : Math.round(uploadedFile.size / 1024) + ' KB'} ready for extraction`
                    : 'Upload your syllabus, National Building Code PDF, or lecture screenshots (Supports up to 200MB)'}
                </p>
              </div>
            </div>
          </div>

          {uploadedFile && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-[#2C6E49] dark:text-emerald-300">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 shrink-0 text-[#2C6E49] dark:text-emerald-400" />
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{uploadedFile.name}</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                      {uploadedFile.size > 1024 * 1024 ? (uploadedFile.size / (1024 * 1024)).toFixed(1) + ' MB' : (uploadedFile.size / 1024).toFixed(1) + ' KB'} • {uploadedFile.mimeType}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-rose-600 transition cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Detected Subject & Topics Review Card */}
              {uploadedFile.detectedMetadata && (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-stone-950 border border-[#E8E4DC] dark:border-stone-800 space-y-3 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0ECE1] dark:border-stone-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#2C6E49] dark:text-emerald-400" />
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        Detected Subject: {uploadedFile.detectedMetadata.primarySubject}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#1B4332] dark:text-emerald-300 font-bold uppercase">
                      {uploadedFile.detectedMetadata.estimatedDifficulty}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed m-0">
                    {uploadedFile.detectedMetadata.summary}
                  </p>

                  {uploadedFile.detectedMetadata.secondaryTopics.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500 font-semibold tracking-wider">
                        Identified Core Topics:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {uploadedFile.detectedMetadata.secondaryTopics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-[#E8E4DC] dark:border-stone-800 text-stone-700 dark:text-stone-300 font-medium"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Text Area */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-stone-600 dark:text-stone-400 block mb-1 font-medium">
                Topic / Subject Title
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Philippine National Building Code (PD 1096)"
                className="w-full bg-[#FAF8F5] dark:bg-stone-950 border border-[#E8E4DC] dark:border-stone-800 rounded-xl px-4 py-2 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#2C6E49] dark:focus:border-emerald-500"
              />
            </div>

            {/* Question Count Selector for Generation */}
            <div>
              <label className="text-xs text-stone-600 dark:text-stone-400 block mb-1.5 font-medium">
                Number of Board Exam Questions to Generate
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {([15, 25, 50] as const).map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleCountSelectionChange(count)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs ${
                      questionCountType === count
                        ? 'bg-[#2C6E49] text-white shadow-xs'
                        : 'bg-[#FAF8F5] dark:bg-stone-950 text-stone-600 dark:text-stone-400 border border-[#E8E4DC] dark:border-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handleCountSelectionChange('custom')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs ${
                    questionCountType === 'custom'
                      ? 'bg-[#2C6E49] text-white shadow-xs'
                      : 'bg-[#FAF8F5] dark:bg-stone-950 text-stone-600 dark:text-stone-400 border border-[#E8E4DC] dark:border-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  Custom Count
                </button>

                {questionCountType === 'custom' && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={customQuestionCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 15;
                        handleCountSelectionChange('custom', val);
                      }}
                      className="w-16 px-2.5 py-1 text-xs font-mono font-bold rounded-xl border border-[#E8E4DC] dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#2C6E49]"
                    />
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">items</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-stone-600 dark:text-stone-400 block mb-1 font-medium">
                Or Paste Study Notes / Outline Text
              </label>
              <textarea
                value={pastedNotes}
                onChange={(e) => setPastedNotes(e.target.value)}
                placeholder="Paste key concepts or lecture notes here...
- PD 1096 Section 805: Minimum ceiling height for habitable rooms is 2.40m with artificial ventilation.
- BP 344 Rule II: Maximum slope for accessible ramp is 1:12.
- RA 9514: Maximum travel distance to exit is 45m (60m if sprinklered).
- Leandro Locsin designed the Cultural Center of the Philippines."
                rows={6}
                className="w-full bg-[#FAF8F5] dark:bg-stone-950 border border-[#E8E4DC] dark:border-stone-800 rounded-2xl p-4 text-xs font-mono text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#2C6E49] dark:focus:border-emerald-500 placeholder:text-stone-400 dark:placeholder:text-stone-600 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Generation Progress Indicator */}
          {isProcessingFile && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 border-2 border-[#2C6E49] border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-[#1B4332] m-0">Generating Philippine Licensure Materials...</p>
                <p className="text-[11px] text-[#2C6E49] m-0">{generationStage || 'Formulating board exam questions and flashcards...'}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleCopyGeminiExamPrompt}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium cursor-pointer"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? 'Copied Exam Prompt!' : 'Copy Gemini Board Exam Prompt'}</span>
            </button>

            <button
              onClick={handleGenerateFromNotes}
              disabled={isProcessingFile || (!pastedNotes.trim() && !uploadedFile && !customTopic.trim())}
              className="px-6 py-2.5 rounded-2xl bg-[#2C6E49] hover:bg-[#23583a] disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-[#2C6E49]/20 transition cursor-pointer flex items-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${isProcessingFile ? 'animate-spin' : ''}`} />
              <span>{isProcessingFile ? 'Creating Quiz...' : 'Generate Quiz & Flashcards'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
