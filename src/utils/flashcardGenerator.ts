import { Flashcard, Category } from '../types/flashcard';

// Mock flashcard generation - in a real app, this would call an API
export const generateFlashcardsFromPDF = async (file: File, categoryId: string): Promise<Flashcard[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Mock flashcards based on the file name for demonstration
  const mockFlashcards: Flashcard[] = [
    {
      id: '1',
      categoryId,
      question: 'What is the primary function of mitochondria in cells?',
      answer: 'Mitochondria are the powerhouses of the cell, responsible for producing ATP through cellular respiration.',
      difficulty: 'medium',
      lastReviewed: null,
      nextReview: null,
      reviewCount: 0,
      correctCount: 0,
      createdAt: new Date(),
      tags: ['biology', 'cell', 'mitochondria']
    },
    {
      id: '2',
      categoryId,
      question: 'What is photosynthesis?',
      answer: 'Photosynthesis is the process by which plants convert light energy into chemical energy (glucose) using carbon dioxide and water.',
      difficulty: 'medium',
      lastReviewed: null,
      nextReview: null,
      reviewCount: 0,
      correctCount: 0,
      createdAt: new Date(),
      tags: ['biology', 'plants', 'photosynthesis']
    },
    {
      id: '3',
      categoryId,
      question: 'What are the three main components of the cell theory?',
      answer: 'All living things are made of cells, cells are the basic unit of life, and all cells come from pre-existing cells.',
      difficulty: 'hard',
      lastReviewed: null,
      nextReview: null,
      reviewCount: 0,
      correctCount: 0,
      createdAt: new Date(),
      tags: ['biology', 'cell theory']
    },
    {
      id: '4',
      categoryId,
      question: 'What is DNA and what does it stand for?',
      answer: 'DNA stands for Deoxyribonucleic Acid. It is the hereditary material that contains genetic instructions for life.',
      difficulty: 'easy',
      lastReviewed: null,
      nextReview: null,
      reviewCount: 0,
      correctCount: 0,
      createdAt: new Date(),
      tags: ['biology', 'genetics', 'DNA']
    },
    {
      id: '5',
      categoryId,
      question: 'What is the difference between prokaryotic and eukaryotic cells?',
      answer: 'Prokaryotic cells lack a membrane-bound nucleus, while eukaryotic cells have a membrane-bound nucleus and organelles.',
      difficulty: 'medium',
      lastReviewed: null,
      nextReview: null,
      reviewCount: 0,
      correctCount: 0,
      createdAt: new Date(),
      tags: ['biology', 'cell types']
    },
    {
      id: '6',
      categoryId,
      question: 'What is osmosis?',
      answer: 'Osmosis is the movement of water molecules across a semi-permeable membrane from high to low concentration.',
      difficulty: 'medium',
      lastReviewed: null,
      nextReview: null,
      reviewCount: 0,
      correctCount: 0,
      createdAt: new Date(),
      tags: ['biology', 'osmosis', 'membrane']
    }
  ];

  return mockFlashcards;
}