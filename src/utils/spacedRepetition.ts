import { Flashcard, ReviewResult } from '../types/flashcard';

// Spaced repetition algorithm based on SM-2
export const calculateNextReview = (
  flashcard: Flashcard,
  result: ReviewResult
): { nextReview: Date; difficulty: 'easy' | 'medium' | 'hard' } => {
  const now = new Date();
  let interval = 1; // days
  
  // Base interval calculation
  if (flashcard.reviewCount === 0) {
    interval = result.isCorrect ? 1 : 0.5;
  } else if (flashcard.reviewCount === 1) {
    interval = result.isCorrect ? 6 : 1;
  } else {
    // Use previous interval and adjust based on performance
    const lastInterval = flashcard.nextReview && flashcard.lastReviewed
      ? Math.max(1, Math.round((flashcard.nextReview.getTime() - flashcard.lastReviewed.getTime()) / (1000 * 60 * 60 * 24)))
      : 1;
    
    if (result.isCorrect) {
      // Increase interval based on difficulty
      const multiplier = result.difficulty === 'easy' ? 2.5 : 
                        result.difficulty === 'medium' ? 2.0 : 1.3;
      interval = Math.round(lastInterval * multiplier);
    } else {
      // Reset to beginning if incorrect
      interval = 1;
    }
  }

  // Cap the interval at reasonable limits
  interval = Math.min(interval, 365); // Max 1 year
  interval = Math.max(interval, 0.5); // Min 12 hours

  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  
  return {
    nextReview,
    difficulty: result.difficulty
  };
};

export const getCardsForReview = (flashcards: Flashcard[], limit = 20): Flashcard[] => {
  const now = new Date();
  
  return flashcards
    .filter(card => {
      // Include cards that have never been reviewed or are due for review
      return !card.nextReview || card.nextReview <= now;
    })
    .sort((a, b) => {
      // Prioritize by next review date, then by creation date
      if (!a.nextReview && !b.nextReview) {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      if (!a.nextReview) return -1;
      if (!b.nextReview) return 1;
      return a.nextReview.getTime() - b.nextReview.getTime();
    })
    .slice(0, limit);
};

export const getReviewStats = (flashcards: Flashcard[]) => {
  const now = new Date();
  const dueCards = flashcards.filter(card => !card.nextReview || card.nextReview <= now);
  const reviewedToday = flashcards.filter(card => {
    if (!card.lastReviewed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return card.lastReviewed >= today;
  });

  return {
    total: flashcards.length,
    dueForReview: dueCards.length,
    reviewedToday: reviewedToday.length,
    averageAccuracy: flashcards.length > 0 
      ? Math.round((flashcards.reduce((sum, card) => sum + (card.reviewCount > 0 ? card.correctCount / card.reviewCount : 0), 0) / flashcards.length) * 100)
      : 0
  };
};