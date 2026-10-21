import JSZip from 'jszip';
import type { UploadedFileItem, DetectedDocumentMetadata } from '../types';

/**
 * Robust file content extraction pipeline supporting:
 * - PDF documents (via pdfjs text extraction + base64 for Gemini multimodal OCR)
 * - Word .docx documents (unzipping word/document.xml via JSZip)
 * - Images: JPG, JPEG, PNG, WEBP (multimodal base64)
 * - Plain text and Markdown (.txt, .md)
 */
export async function processUploadedFile(file: File): Promise<UploadedFileItem> {
  const mimeType = file.type || getMimeTypeFromExtension(file.name);

  // Validate file size (max 25MB)
  const MAX_SIZE_BYTES = 25 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`File "${file.name}" exceeds the maximum upload limit of 25MB.`);
  }

  // 1. Text files (.txt, .md, text/*)
  if (mimeType.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
    const textContent = await file.text();
    const base64Data = btoa(unescape(encodeURIComponent(textContent)));
    const metadata = analyzeTextContentLocally(textContent, file.name);

    return {
      name: file.name,
      size: file.size,
      type: 'text/plain',
      mimeType: 'text/plain',
      base64Data,
      rawText: textContent,
      textPreview: textContent.slice(0, 1000) + (textContent.length > 1000 ? '...' : ''),
      detectedMetadata: metadata,
    };
  }

  // 2. Word .docx document: extract XML text paragraphs from word/document.xml
  if (file.name.toLowerCase().endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')?.async('text');

      if (docXml) {
        // Extract paragraph texts cleanly
        const paragraphs = docXml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
        const extractedLines: string[] = [];

        for (const p of paragraphs) {
          const textMatches = p.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
          if (textMatches && textMatches.length > 0) {
            const lineText = textMatches.map((t) => t.replace(/<[^>]+>/g, '')).join('');
            if (lineText.trim().length > 0) {
              extractedLines.push(lineText.trim());
            }
          }
        }

        const fullExtractedText = extractedLines.join('\n');
        if (fullExtractedText.trim().length > 20) {
          const base64Data = btoa(unescape(encodeURIComponent(fullExtractedText)));
          const metadata = analyzeTextContentLocally(fullExtractedText, file.name);

          return {
            name: file.name,
            size: file.size,
            type: 'text/plain',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            base64Data,
            rawText: fullExtractedText,
            textPreview: fullExtractedText.slice(0, 1000) + (fullExtractedText.length > 1000 ? '...' : ''),
            detectedMetadata: metadata,
          };
        }
      }
    } catch (e) {
      console.warn('DOCX ZIP extraction error, using fallback:', e);
    }
  }

  // 3. Binary files (PDF, Images, etc.): Read arrayBuffer and data URL
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = arrayBufferToBase64(arrayBuffer);
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  let extractedPdfText = '';

  if (mimeType === 'application/pdf') {
    extractedPdfText = await extractPdfText(arrayBuffer);
  }

  const rawTextToUse = extractedPdfText || (mimeType.startsWith('image/') ? undefined : undefined);
  const metadata = analyzeTextContentLocally(extractedPdfText || '', file.name);

  return {
    name: file.name,
    size: file.size,
    type: mimeType,
    mimeType,
    base64Data,
    dataUrl,
    rawText: rawTextToUse,
    textPreview: extractedPdfText
      ? extractedPdfText.slice(0, 1000) + (extractedPdfText.length > 1000 ? '...' : '')
      : `[Attached ${file.name} (${Math.round(file.size / 1024)} KB) - multimodal processing enabled]`,
    detectedMetadata: metadata,
  };
}

/**
 * Extracts text from PDF bytes in browser or fallback environment
 */
async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  // Try pdfjs-dist if available in browser
  if (typeof window !== 'undefined') {
    try {
      const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
      // Set worker if available
      try {
        const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default || workerModule;
        }
      } catch {
        // worker optional
      }

      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      const textParts: string[] = [];

      for (let pageNum = 1; pageNum <= Math.min(pdfDoc.numPages, 100); pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items
          .map((item: any) => item.str || '')
          .filter((s: string) => s.trim().length > 0);

        if (pageStrings.length > 0) {
          textParts.push(`--- [Page ${pageNum}] ---\n` + pageStrings.join(' '));
        }
      }

      const combined = textParts.join('\n\n');
      if (combined.trim().length > 50) {
        return combined;
      }
    } catch (err) {
      console.warn('PDF.js client extraction failed, using stream fallback', err);
    }
  }

  // Stream text fallback (extracts plain ASCII/UTF8 text streams inside PDF)
  try {
    const decoder = new TextDecoder('latin1');
    const raw = decoder.decode(arrayBuffer);
    const textMatches = raw.match(/\(([^\(\)\\]{3,200})\)\s*T[jJ]/g);
    if (textMatches && textMatches.length > 5) {
      return textMatches
        .map((m) => m.replace(/^[\s\(]+|[\)\sTjJ]+$/g, ''))
        .filter((t) => t.length > 2)
        .join(' ');
    }
  } catch {
    // Ignore fallback errors
  }

  return '';
}

/**
 * Converts ArrayBuffer to clean Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 8192;

  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }

  return btoa(binary);
}

/**
 * Intelligent local topic & metadata extractor derived strictly from document content
 */
export function analyzeTextContentLocally(
  text: string,
  fallbackFilename: string
): DetectedDocumentMetadata {
  const cleanFilename = fallbackFilename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const normalized = text.toLowerCase();

  // 1. Check for prominent Philippine Building & Architecture Laws
  if (
    normalized.includes('batas pambansa blg. 344') ||
    normalized.includes('bp 344') ||
    normalized.includes('accessibility law') ||
    normalized.includes('persons with disability') ||
    normalized.includes('pwd ramp') ||
    normalized.includes('tactile paving')
  ) {
    return {
      title: 'Accessibility Law (BP 344) & Universal Design',
      primarySubject: 'Philippine Accessibility Law (BP 344)',
      secondaryTopics: [
        'Ramp Gradients & Rest Landings (1:12 slope)',
        'Accessible Door Clearances (0.80m)',
        'PWD Toilet Grab Bars & Clear Turning Radii',
        'Tactile Surface Warning Indicators',
        'Drop Curbs & Walkways',
      ],
      keyTermsAndConcepts: ['1:12 Slope', '0.80m Clear Width', '1.50m Turning Space', 'Tactile Paving', 'Dropped Curbs'],
      estimatedDifficulty: 'Board-Exam Level',
      summary: 'Comprehensive provisions governing universal accessibility for persons with disabilities in the built environment under Batas Pambansa Blg. 344.',
      sourceConfidence: 0.98,
    };
  }

  if (
    normalized.includes('pd 1096') ||
    normalized.includes('presidential decree 1096') ||
    normalized.includes('national building code') ||
    normalized.includes('tosl') ||
    normalized.includes('ambf') ||
    normalized.includes('flar')
  ) {
    return {
      title: 'National Building Code of the Philippines (PD 1096)',
      primarySubject: 'Philippine Building Laws & Zoning Regulations',
      secondaryTopics: [
        'Allowable Maximum Building Footprint (AMBF)',
        'Total Open Space within Lot (TOSL) & USA/ISA',
        'Habitable Ceiling Clearances (2.70m / 2.40m)',
        'Standard Parking Stall Dimensions (2.50m x 5.00m)',
        'Yard Setbacks across Zoning Classifications',
      ],
      keyTermsAndConcepts: ['AMBF', 'TOSL', 'USA', 'FLAR', 'Ceiling Clearance', 'Setbacks'],
      estimatedDifficulty: 'Board-Exam Level',
      summary: 'Statutory requirements of Presidential Decree No. 1096 regulating building safety, environmental health, zoning, setbacks, and open space computations in the Philippines.',
      sourceConfidence: 0.96,
    };
  }

  if (
    normalized.includes('ra 9514') ||
    normalized.includes('fire code') ||
    normalized.includes('bureau of fire protection') ||
    normalized.includes('means of egress') ||
    normalized.includes('travel distance')
  ) {
    return {
      title: 'Fire Code of the Philippines (RA 9514)',
      primarySubject: 'Life Safety & Fire Protection Engineering',
      secondaryTopics: [
        'Maximum Travel Distances to Exits (45m / 60m)',
        'Fire-Resistive Door Ratings & Smoke Compartmentation',
        'Corridor Width Clearances & Occupant Load Factors',
        'Automatic Fire Sprinkler Systems in High-Rise Structures',
        'Panic Hardware & Egress Illumination',
      ],
      keyTermsAndConcepts: ['Means of Egress', 'Travel Distance', 'FSIC', 'Occupant Load', 'Fire Damper'],
      estimatedDifficulty: 'Board-Exam Level',
      summary: 'Life safety standards and fire mitigation protocols governed by Republic Act No. 9514 for architectural egress and occupancy compliance.',
      sourceConfidence: 0.95,
    };
  }

  if (
    normalized.includes('history of architecture') ||
    normalized.includes('leandro locsin') ||
    normalized.includes('francisco mañosa') ||
    normalized.includes('juan nakpil') ||
    normalized.includes('pablo antonio') ||
    normalized.includes('bahay na bato') ||
    normalized.includes('renaissance') ||
    normalized.includes('gothic') ||
    normalized.includes('baroque')
  ) {
    return {
      title: 'History of Architecture & Master Architects',
      primarySubject: 'Architectural History & Theory',
      secondaryTopics: [
        'Philippine Vernacular Architecture (Bahay Kubo, Bahay na Bato)',
        'National Artists for Architecture and Landmark Works',
        'Classical Orders, Roman Engineering, and Gothic Cathedrals',
        'Renaissance, Baroque, and Modern Movement Pioneers',
        'Filipino Neo-Vernacular Tectonics',
      ],
      keyTermsAndConcepts: ['Leandro Locsin', 'Francisco Mañosa', 'Volada', 'Brutalism', 'Flying Buttress'],
      estimatedDifficulty: 'Moderate',
      summary: 'Chronological and theoretical evolution of global and Philippine architecture, examining masterworks, stylistic paradigms, and structural innovations.',
      sourceConfidence: 0.94,
    };
  }

  // 2. Generic content analysis: extract headings and prominent sentences
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const potentialTitle = lines.find((l) => l.length > 5 && l.length < 90 && !l.startsWith('http')) || cleanFilename;

  // Extract recurring capitalized terms
  const capitalizedMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b/g) || [];
  const freqMap: Record<string, number> = {};
  for (const m of capitalizedMatches) {
    if (m.length > 4 && !['The', 'This', 'That', 'With', 'From', 'Into'].includes(m)) {
      freqMap[m] = (freqMap[m] || 0) + 1;
    }
  }

  const topTerms = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([term]) => term);

  const fallbackSubject = topTerms.length > 0 ? topTerms[0] : potentialTitle;

  return {
    title: potentialTitle,
    primarySubject: fallbackSubject,
    secondaryTopics: topTerms.length > 1 ? topTerms.slice(1) : ['Foundational Concepts', 'Definitions', 'Key Applications'],
    keyTermsAndConcepts: topTerms.length > 0 ? topTerms : ['Key Principle 1', 'Key Principle 2', 'Regulation/Formula'],
    estimatedDifficulty: text.length > 2000 ? 'Moderate' : 'Easy',
    summary: text.slice(0, 180).trim() + (text.length > 180 ? '...' : ''),
    sourceConfidence: text.length > 100 ? 0.85 : 0.6,
  };
}

export function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'txt':
    case 'md':
      return 'text/plain';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    default:
      return 'application/octet-stream';
  }
}
