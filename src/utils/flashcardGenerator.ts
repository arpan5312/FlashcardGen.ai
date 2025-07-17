import { Flashcard } from '../types/flashcard';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'; // ✅ PDF worker for browser
import { GoogleGenerativeAI } from '@google/generative-ai';

// Set the worker source so PDF.js can function in browser
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Set up Gemini
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) throw new Error("❌ VITE_GEMINI_API_KEY is not defined.");

const genAI = new GoogleGenerativeAI(apiKey);

export const generateFlashcardsFromPDF = async (file: File, categoryId: string): Promise<Flashcard[]> => {
  try {
    // Step 1: Extract PDF text
    const pdfText = await extractTextFromPDF(file);
    const truncatedText = pdfText.slice(0, 12000); // Token limit

    // Step 2: Prompt Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });


    const prompt = `
Generate exactly 6 flashcards from the study material below.

Each flashcard must strictly follow this format:
---
Question: ...
Answer: ...
Difficulty: easy | medium | hard
Tags: tag1, tag2, tag3
---

Only return flashcards. Do not include explanations or headings.

Text:
"""${truncatedText}"""
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini Output:\n', text); // ✅ Show the output for debugging

    const flashcards = parseFlashcardsFromGeminiOutput(text, categoryId);

    if (flashcards.length === 0) {
      throw new Error("⚠️ Gemini output couldn't be parsed.");
    }

    return flashcards;
  } catch (err) {
    console.error("❌ Flashcard generation error:", err);
    return getMockFlashcards(categoryId); // Fallback flashcards
  }
};

// --- Helper: Extract text from PDF
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages = await Promise.all(
    Array.from({ length: pdf.numPages }, async (_, i) => {
      const page = await pdf.getPage(i + 1);
      const content = await page.getTextContent();
      return content.items.map((item: any) => item.str).join(' ');
    })
  );

  return pages.join('\n');
}

// --- Helper: Parse Gemini output to Flashcard[]
function parseFlashcardsFromGeminiOutput(text: string, categoryId: string): Flashcard[] {
  const flashcards: Flashcard[] = [];
  const blocks = text.split(/-{3,}|\n\n+/);
  let id = 1;

  for (const block of blocks) {
    const getField = (regex: RegExp): string => {
      const match = block.match(regex);
      return match?.[1]?.trim() || '';
    };

    const question = getField(/(?:\*\*?)?question(?:\*\*?)?[:\-]?\s*(.*)/i);
    const answer = getField(/(?:\*\*?)?answer(?:\*\*?)?[:\-]?\s*(.*)/i);
    const difficulty = getField(/(?:\*\*?)?difficulty(?:\*\*?)?[:\-]?\s*(.*)/i).toLowerCase();
    const tagsRaw = getField(/(?:\*\*?)?tags(?:\*\*?)?[:\-]?\s*(.*)/i);

    if (question && answer) {
      flashcards.push({
        id: String(id++),
        categoryId,
        question,
        answer,
        difficulty: ['easy', 'medium', 'hard'].includes(difficulty)
          ? (difficulty as 'easy' | 'medium' | 'hard')
          : 'medium',
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0,
        correctCount: 0,
        createdAt: new Date(),
        tags: tagsRaw ? tagsRaw.split(',').map(tag => tag.trim()) : [],
      });
    } else {
      console.warn("⚠️ Skipped unparsable block:\n", block);
    }
  }

  return flashcards;
}

// --- Fallback flashcards if Gemini fails
function getMockFlashcards(categoryId: string): Flashcard[] {
  return [
    {
      id: '1',
      categoryId,
      question: 'What is the primary function of mitochondria in cells?',
      answer: 'Mitochondria are the powerhouses of the cell, producing ATP through respiration.',
      difficulty: 'medium',
      lastReviewed: null,
      nextReview: null,
      reviewCount: 0,
      correctCount: 0,
      createdAt: new Date(),
      tags: ['biology', 'cell', 'mitochondria'],
    },
    {
      id: '2',
      categoryId,
      question: 'What is photosynthesis?',
      answer: 'The process by which plants convert sunlight into glucose using CO₂ and water.',
      difficulty: 'easy',
      lastReviewed: null,
      nextReview: null,
      reviewCount: 0,
      correctCount: 0,
      createdAt: new Date(),
      tags: ['biology', 'plants', 'photosynthesis'],
    }
  ];
}
