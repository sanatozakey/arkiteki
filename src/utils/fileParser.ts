import type { UploadedFileItem } from '../types';

export async function processUploadedFile(file: File): Promise<UploadedFileItem> {
  const mimeType = file.type || getMimeTypeFromExtension(file.name);

  // 1. If text file, read text directly
  if (mimeType.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
    const textContent = await file.text();
    const base64Data = btoa(unescape(encodeURIComponent(textContent)));
    return {
      name: file.name,
      size: file.size,
      type: 'text/plain',
      mimeType: 'text/plain',
      base64Data,
      textPreview: textContent.slice(0, 400) + (textContent.length > 400 ? '...' : ''),
    };
  }

  // 2. If Word .docx document, extract XML text paragraphs directly in browser
  if (file.name.toLowerCase().endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const rawStr = textDecoder.decode(arrayBuffer);
      const matches = rawStr.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      if (matches && matches.length > 0) {
        const extractedText = matches.map((m) => m.replace(/<[^>]+>/g, '')).join(' ');
        if (extractedText.length > 30) {
          return {
            name: file.name,
            size: file.size,
            type: 'text/plain',
            mimeType: 'text/plain',
            base64Data: btoa(unescape(encodeURIComponent(extractedText))),
            textPreview: extractedText.slice(0, 400) + (extractedText.length > 400 ? '...' : ''),
          };
        }
      }
    } catch (e) {
      console.warn('Docx fast text extraction fallback', e);
    }
  }

  // 3. If PDF or Image or other binary, read as ArrayBuffer / Base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 without "data:mime;base64," prefix
      const base64Match = result.match(/^data:(.*?);base64,(.*)$/);
      const cleanBase64 = base64Match ? base64Match[2] : '';
      const detectedMime = base64Match ? base64Match[1] : mimeType;

      resolve({
        name: file.name,
        size: file.size,
        type: detectedMime,
        mimeType: detectedMime,
        base64Data: cleanBase64,
        dataUrl: result,
        textPreview: `[Attached ${file.name} (${Math.round(file.size / 1024)} KB)]`,
      });
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
}

function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'txt':
    case 'md': return 'text/plain';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc': return 'application/msword';
    default: return 'application/octet-stream';
  }
}
