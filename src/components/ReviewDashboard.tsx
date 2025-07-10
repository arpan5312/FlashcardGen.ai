import React from 'react';
import { Brain, Clock, Target, TrendingUp, Calendar, Play } from 'lucide-react';
import { Flashcard, Category } from '../types/flashcard';
import { getCardsForReview, getReviewStats } from '../utils/spacedRepetition';

interface ReviewDashboardProps {
  flashcards: Flashcard[];
  categories: Category[];
  onStartReview: (flashcards: Flashcard[], categoryId?: string) => void;
}

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({
  flashcards,
  categories,
  onStartReview,
}) => {
  const stats = getReviewStats(flashcards);
  const dueCards = getCardsForReview(flashcards);

  const getCategoryStats = () => {
    return categories.map(category => {
      const categoryCards = flashcards.filter(card => card.categoryId === category.id);
      const categoryDue = getCardsForReview(categoryCards);
      const categoryStats = getReviewStats(categoryCards);
      
      return {
        ...category,
        totalCards: categoryCards.length,
        dueCards: categoryDue.length,
        accuracy: categoryStats.averageAccuracy,
      };
    }).filter(cat => cat.totalCards > 0);
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Dashboard</h2>
        <p className="text-gray-600">Track your progress and start review sessions</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cards</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Due for Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.dueForReview}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Reviewed Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reviewedToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageAccuracy}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Review Section */}
      {dueCards.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready for Review!</h3>
              <p className="text-blue-100 mb-4">
                You have {dueCards.length} cards ready for review. Keep up the great work!
              </p>
            </div>
            <button
              onClick={() => onStartReview(dueCards)}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
            >
              <Play className="h-5 w-5" />
              <span>Start Review</span>
            </button>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Review by Category</h3>
        
        {categoryStats.length > 0 ? (
          <div className="space-y-4">
            {categoryStats.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">
                      {category.totalCards} cards • {category.dueCards} due • {category.accuracy}% accuracy
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {category.dueCards > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      {category.dueCards} due
                    </span>
                  )}
                  <button
                    onClick={() => {
                      const categoryCards = flashcards.filter(card => card.categoryId === category.id);
                      const categoryDue = getCardsForReview(categoryCards);
                      onStartReview(categoryDue.length > 0 ? categoryDue : categoryCards, category.id);
                    }}
                    className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Target className="h-4 w-4" />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No flashcards available for review</p>
            <p className="text-sm text-gray-500 mt-1">Upload a PDF to create your first flashcards</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewDashboard;