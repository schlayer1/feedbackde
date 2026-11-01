// src/services/documentExtractor.ts - Textextraktion aus DOCX, PDF und Bild-Screenshots
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { callGeminiApi } from './geminiEngine';

// Konfiguriere PDF.js Worker
if (typeof window !== 'undefined' && pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface ExtractedDocumentResult {
  text: string;
  wordCount: number;
  fileName: string;
  fileType: 'docx' | 'pdf' | 'jpg' | 'png' | 'direct';
  pageCount?: number;
}

export async function extractTextFromFile(file: File): Promise<ExtractedDocumentResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'docx') {
    return extractFromDocx(file);
  }

  if (extension === 'pdf') {
    return extractFromPdf(file);
  }

  if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
    return extractFromImage(file);
  }

  if (['txt', 'md'].includes(extension)) {
    const text = await file.text();
    return {
      text,
      wordCount: countWords(text),
      fileName: file.name,
      fileType: 'direct'
    };
  }

  throw new Error(`Das Dateiformat .${extension} wird leider nicht unterstützt. Bitte lade eine Word- (.docx), PDF- (.pdf) oder Bilddatei (.jpg/.png) hoch.`);
}

export async function extractFromDocx(file: File): Promise<ExtractedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const cleanText = result.value.trim();

  return {
    text: cleanText,
    wordCount: countWords(cleanText),
    fileName: file.name,
    fileType: 'docx'
  };
}

export async function extractFromPdf(file: File): Promise<ExtractedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let fullText = '';
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n\n';
  }

  const cleanText = fullText.trim();
  return {
    text: cleanText,
    wordCount: countWords(cleanText),
    fileName: file.name,
    fileType: 'pdf',
    pageCount: numPages
  };
}

export async function extractFromImage(file: File): Promise<ExtractedDocumentResult> {
  const base64Data = await fileToBase64(file);
  const mimeType = file.type || 'image/jpeg';

  const transcriptionPrompt = `
Du bist ein hochpräziser Texterkennungs- und OCR-Assistent für den Deutschunterricht.
Deine Aufgabe ist es, den im Bild sichtbaren deutschen Schülertext (ob digital getippt oder handschriftlich verfasst) exakt, buchstabengetreu und vollständig zu transkribieren.

Regeln:
1. Behalte Absätze und Zeilenumbrüche sinnvoll bei.
2. Korrigiere KEINE Rechtschreibfehler des Schülers – der Text soll im Originalzustand transkribiert werden, damit die didaktische KI ihn nachher bewerten kann.
3. Gib AUSSCHLIESSLICH den erkannten Text zurück – keine Begrüßung, keine Anmerkungen, keine Zitateinfassungen.
`;

  try {
    const recognizedText = await callGeminiApi({
      systemPrompt: transcriptionPrompt,
      userPrompt: 'Transkribiere bitte den gesamten Text aus diesem Screenshot/Foto.',
      image: {
        mimeType,
        data: base64Data
      },
      temperature: 0.1
    });

    const cleanText = recognizedText.trim();
    return {
      text: cleanText,
      wordCount: countWords(cleanText),
      fileName: file.name,
      fileType: file.name.endsWith('.png') ? 'png' : 'jpg'
    };
  } catch (err: any) {
    throw new Error(`Die KI-Texterkennung des Bildes ist fehlgeschlagen: ${err.message || err}. Bitte prüfe die Bildschärfe oder füge den Text per Hand ein.`);
  }
}

function countWords(str: string): number {
  if (!str || !str.trim()) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
