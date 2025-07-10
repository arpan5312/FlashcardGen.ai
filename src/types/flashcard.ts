export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: Date | null;
  nextReview: Date | null;
  reviewCount: number;
  correctCount: number;
  createdAt: Date;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
  flashcardCount: number;
}

export interface ReviewSession {
  id: string;
  categoryId?: string;
  flashcards: Flashcard[];
  currentIndex: number;
  startTime: Date;
  endTime?: Date;
  totalCards: number;
  correctAnswers: number;
  isCompleted: boolean;
}

export interface AppState {
  file: File | null;
  isGenerating: boolean;
  flashcards: Flashcard[];
  categories: Category[];
  currentView: 'upload' | 'library' | 'review' | 'categories';
  selectedCategory: string | null;
  reviewSession: ReviewSession | null;
  searchQuery: string;
  error: string | null;
}

export interface ReviewResult {
  flashcardId: string;
  isCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  timeSpent: number;
}