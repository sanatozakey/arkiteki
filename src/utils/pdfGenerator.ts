import { jsPDF } from 'jspdf';
import type { QuizDeck } from '../types';

/**
 * Generates a clean, professional Philippine Board of Architecture Licensure Exam PDF.
 */
export function generateQuizPdf(deck: QuizDeck, options: { includeAnswerKey?: boolean } = { includeAnswerKey: true }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
      drawHeaderBanner();
    }
  };

  const drawHeaderBanner = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('ARKITEKI • PHILIPPINE ARCHITECTURE LICENSURE EXAMINATION (ALE) REVIEWER', margin, y);
    y += 4;
    doc.setDrawColor(210, 205, 195);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // --- Title Page Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(27, 67, 50); // Deep Philippine Forest Green #1B4332
  doc.text('PHILIPPINE LICENSURE EXAMINATION FOR ARCHITECTS', margin, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(44, 110, 73); // #2C6E49
  doc.text(deck.title.toUpperCase(), margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(`Subject: ${deck.subject} • Total Questions: ${deck.questions.length} • Generated via Arkiteki Studio`, margin, y);
  y += 4;
  doc.text(`Instructions: Select the best answer for each question. Answers & legal code rationales are provided in the appendix.`, margin, y);
  y += 5;

  doc.setDrawColor(44, 110, 73);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // --- Questions Body ---
  deck.questions.forEach((q, index) => {
    const questionNumber = `${index + 1}.`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);

    const questionLines = doc.splitTextToSize(`${questionNumber} ${q.question}`, contentWidth);
    const questionBlockHeight = questionLines.length * 5 + (q.options ? q.options.length * 6 : 0) + 6;
    checkPageBreak(questionBlockHeight);

    doc.text(questionLines, margin, y);
    y += questionLines.length * 5 + 2;

    // Options
    if (q.options && q.options.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);

      const letters = ['[A]', '[B]', '[C]', '[D]', '[E]'];
      q.options.forEach((opt, optIdx) => {
        const letter = letters[optIdx] || `[${optIdx + 1}]`;
        const optionLines = doc.splitTextToSize(`${letter}  ${opt}`, contentWidth - 6);
        checkPageBreak(optionLines.length * 4.5);
        doc.text(optionLines, margin + 4, y);
        y += optionLines.length * 4.5 + 1;
      });
    }

    y += 4; // spacing between questions
  });

  // --- Appendix: Answer Key & Code Rationales ---
  if (options.includeAnswerKey && deck.questions.length > 0) {
    doc.addPage();
    y = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(27, 67, 50);
    doc.text('OFFICIAL ANSWER KEY & LEGAL CODE RATIONALES', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Philippine Architecture Board Exam Review • PD 1096, BP 344, RA 9514 & Theory', margin, y);
    y += 4;

    doc.setDrawColor(44, 110, 73);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    const letters = ['A', 'B', 'C', 'D'];

    deck.questions.forEach((q, index) => {
      const correctLetter = letters[q.correctAnswer] || 'A';
      const correctText = q.options ? q.options[q.correctAnswer] : '';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(44, 110, 73);

      const headerText = `Item ${index + 1}: Answer [${correctLetter}] — ${correctText}`;
      const headerLines = doc.splitTextToSize(headerText, contentWidth);
      checkPageBreak(headerLines.length * 4.5 + 14);

      doc.text(headerLines, margin, y);
      y += headerLines.length * 4.5 + 1;

      // Explanation
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 50, 50);

      const expLines = doc.splitTextToSize(`Rationale: ${q.explanation}`, contentWidth);
      checkPageBreak(expLines.length * 4);
      doc.text(expLines, margin, y);
      y += expLines.length * 4 + 1.5;

      if (q.codeReference) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`Reference: ${q.codeReference}`, margin, y);
        y += 4;
      }

      y += 3;
    });
  }

  // --- Add Page Numbers to all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Page ${i} of ${totalPages} • Arkiteki Studio (arkiteki.onrender.com / vercel.app)`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Clean filename
  const cleanTitle = deck.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanTitle}_ALE_Reviewer.pdf`);
}

/**
 * Generates printable Flashcards Study Sheet PDF.
 */
export function generateFlashcardsPdf(deck: QuizDeck) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(27, 67, 50);
  doc.text('ARKITEKI STUDY FLASHCARDS COMPILATION', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Deck: ${deck.title} • ${deck.flashcards.length} Key Cards`, margin, y);
  y += 4;

  doc.setDrawColor(44, 110, 73);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  deck.flashcards.forEach((card, index) => {
    // Each card is rendered in a neat framed box
    const cardHeight = 36;
    if (y + cardHeight > pageHeight - 15) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(250, 248, 245); // #FAF8F5
    doc.setDrawColor(220, 215, 205);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 3, 3, 'FD');

    // Front (Concept)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(44, 110, 73);
    doc.text(`CARD ${index + 1}: ${card.front}`, margin + 4, y + 6);

    // Separator line inside card
    doc.setDrawColor(230, 226, 218);
    doc.line(margin + 4, y + 9, margin + contentWidth - 4, y + 9);

    // Back (Definition / Code Rule)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);
    const defLines = doc.splitTextToSize(card.back, contentWidth - 8);
    doc.text(defLines, margin + 4, y + 14);

    y += cardHeight + 4;
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Page ${i} of ${totalPages} • Arkiteki Flashcards Sheet`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const cleanTitle = deck.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanTitle}_Flashcards.pdf`);
}
