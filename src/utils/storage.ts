import { Flashcard, Category } from '../types/flashcard';

const STORAGE_KEYS = {
  FLASHCARDS: 'flashcardgen_flashcards',
  CATEGORIES: 'flashcardgen_categories',
};

export const storage = {
  // Flashcards
  getFlashcards: (): Flashcard[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    if (!data) return [];
    
    return JSON.parse(data).map((card: any) => ({
      ...card,
      lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : null,
      nextReview: card.nextReview ? new Date(card.nextReview) : null,
      createdAt: new Date(card.createdAt),
    }));
  },

  saveFlashcards: (flashcards: Flashcard[]): void => {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
  },

  addFlashcard: (flashcard: Flashcard): void => {
    const flashcards = storage.getFlashcards();
    flashcards.push(flashcard);
    storage.saveFlashcards(flashcards);
  },

  updateFlashcard: (id: string, updates: Partial<Flashcard>): void => {
    const flashcards = storage.getFlashcards();
    const index = flashcards.findIndex(card => card.id === id);
    if (index !== -1) {
      flashcards[index] = { ...flashcards[index], ...updates };
      storage.saveFlashcards(flashcards);
    }
  },

  deleteFlashcard: (id: string): void => {
    const flashcards = storage.getFlashcards().filter(card => card.id !== id);
    storage.saveFlashcards(flashcards);
  },

  // Categories
  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!data) return [];
    
    return JSON.parse(data).map((category: any) => ({
      ...category,
      createdAt: new Date(category.createdAt),
    }));
  },

  saveCategories: (categories: Category[]): void => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory: (category: Category): void => {
    const categories = storage.getCategories();
    categories.push(category);
    storage.saveCategories(categories);
  },

  updateCategory: (id: string, updates: Partial<Category>): void => {
    const categories = storage.getCategories();
    const index = categories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      storage.saveCategories(categories);
    }
  },

  deleteCategory: (id: string): void => {
    const categories = storage.getCategories().filter(cat => cat.id !== id);
    storage.saveCategories(categories);
    
    // Also delete flashcards in this category
    const flashcards = storage.getFlashcards().filter(card => card.categoryId !== id);
    storage.saveFlashcards(flashcards);
  },
};