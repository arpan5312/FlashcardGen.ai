import React, { useState } from 'react';
import { Search, Filter, Edit2, Trash2, Clock, Target } from 'lucide-react';
import { Flashcard, Category } from '../types/flashcard';

interface FlashcardLibraryProps {
  flashcards: Flashcard[];
  categories: Category[];
  searchQuery: string;
  selectedCategory: string | null;
  onSearchChange: (query: string) => void;
  onCategoryFilter: (categoryId: string | null) => void;
  onEditFlashcard: (flashcard: Flashcard) => void;
  onDeleteFlashcard: (id: string) => void;
  onStartReview: (flashcards: Flashcard[]) => void;
}

const FlashcardLibrary: React.FC<FlashcardLibraryProps> = ({
  flashcards,
  categories,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryFilter,
  onEditFlashcard,
  onDeleteFlashcard,
  onStartReview,
}) => {
  const [sortBy, setSortBy] = useState<'created' | 'reviewed' | 'difficulty'>('created');

  const filteredFlashcards = flashcards
    .filter(card => {
      const matchesSearch = card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !selectedCategory || card.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'reviewed':
          if (!a.lastReviewed && !b.lastReviewed) return 0;
          if (!a.lastReviewed) return 1;
          if (!b.lastReviewed) return -1;
          return b.lastReviewed.getTime() - a.lastReviewed.getTime();
        case 'difficulty':
          const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        default:
          return 0;
      }
    });

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.color || '#6B7280';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Flashcard Library</h2>
          <p className="text-gray-600">{filteredFlashcards.length} flashcards</p>
        </div>
        {filteredFlashcards.length > 0 && (
          <button
            onClick={() => onStartReview(filteredFlashcards)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            <Target className="h-4 w-4" />
            <span>Review Selected</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search flashcards..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <select
              value={selectedCategory || ''}
              onChange={(e) => onCategoryFilter(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created">Sort by Created</option>
              <option value="reviewed">Sort by Last Reviewed</option>
              <option value="difficulty">Sort by Difficulty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flashcards Grid */}
      {filteredFlashcards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlashcards.map((flashcard) => (
            <div
              key={flashcard.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(flashcard.categoryId) }}
                    />
                    <span className="text-xs text-gray-500">
                      {getCategoryName(flashcard.categoryId)}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEditFlashcard(flashcard)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteFlashcard(flashcard.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {flashcard.question}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {flashcard.answer}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(flashcard.difficulty)}`}>
                      {flashcard.difficulty}
                    </span>
                    <span>{flashcard.reviewCount} reviews</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(flashcard.lastReviewed)}</span>
                  </div>
                </div>

                {flashcard.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {flashcard.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {flashcard.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{flashcard.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedCategory
              ? 'Try adjusting your search or filter criteria'
              : 'Upload a PDF to create your first flashcards'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashcardLibrary;