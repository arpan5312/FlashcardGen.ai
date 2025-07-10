import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import Navigation from './components/Navigation';
import FileUpload from './components/FileUpload';
import LoadingSpinner from './components/LoadingSpinner';
import FlashcardDisplay from './components/FlashcardDisplay';
import FlashcardLibrary from './components/FlashcardLibrary';
import CategoryManager from './components/CategoryManager';
import ReviewDashboard from './components/ReviewDashboard';
import ReviewSession from './components/ReviewSession';
import { AppState, Flashcard, Category, ReviewSession as ReviewSessionType, ReviewResult } from './types/flashcard';
import { generateFlashcardsFromPDF } from './utils/flashcardGenerator';
import { storage } from './utils/storage';
import { calculateNextReview, getCardsForReview, getReviewStats } from './utils/spacedRepetition';

function App() {
  const [state, setState] = useState<AppState>({
    file: null,
    isGenerating: false,
    flashcards: [],
    categories: [],
    currentView: 'upload',
    selectedCategory: null,
    reviewSession: null,
    searchQuery: '',
    error: null
  });

  // Load data from storage on mount
  useEffect(() => {
    const flashcards = storage.getFlashcards();
    const categories = storage.getCategories();
    
    // Create default category if none exist
    if (categories.length === 0 && flashcards.length === 0) {
      const defaultCategory: Category = {
        id: 'default',
        name: 'General',
        color: '#3B82F6',
        description: 'Default category for flashcards',
        createdAt: new Date(),
        flashcardCount: 0
      };
      storage.addCategory(defaultCategory);
      setState(prev => ({ ...prev, flashcards, categories: [defaultCategory] }));
    } else {
      // Update flashcard counts for categories
      const updatedCategories = categories.map(cat => ({
        ...cat,
        flashcardCount: flashcards.filter(card => card.categoryId === cat.id).length
      }));
      setState(prev => ({ ...prev, flashcards, categories: updatedCategories }));
    }
  }, []);

  const handleFileSelect = useCallback((file: File | null) => {
    setState(prev => ({ ...prev, file, error: null }));
  }, []);

  const handleGenerateFlashcards = useCallback(async () => {
    if (!state.file) return;

    // Ensure we have a default category
    let categoryId = 'default';
    if (state.categories.length === 0) {
      const defaultCategory: Category = {
        id: 'default',
        name: 'General',
        color: '#3B82F6',
        description: 'Default category for flashcards',
        createdAt: new Date(),
        flashcardCount: 0
      };
      storage.addCategory(defaultCategory);
      setState(prev => ({ ...prev, categories: [defaultCategory] }));
    } else {
      categoryId = state.categories[0].id;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const newFlashcards = await generateFlashcardsFromPDF(state.file, categoryId);
      
      // Add unique IDs and save to storage
      const flashcardsWithIds = newFlashcards.map(card => ({
        ...card,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

      flashcardsWithIds.forEach(card => storage.addFlashcard(card));
      
      const allFlashcards = storage.getFlashcards();
      const updatedCategories = state.categories.map(cat => ({
        ...cat,
        flashcardCount: allFlashcards.filter(card => card.categoryId === cat.id).length
      }));

      setState(prev => ({ 
        ...prev, 
        flashcards: allFlashcards,
        categories: updatedCategories,
        isGenerating: false,
        currentView: 'library'
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: 'Failed to generate flashcards. Please try again.' 
      }));
    }
  }, [state.file, state.categories]);

  const handleReset = useCallback(() => {
    setState(prev => ({
      ...prev,
      file: null,
      isGenerating: false,
      error: null,
      currentView: 'upload'
    }));
  }, []);

  const handleViewChange = useCallback((view: 'upload' | 'library' | 'review' | 'categories') => {
    setState(prev => ({ ...prev, currentView: view }));
  }, []);

  // Category management
  const handleAddCategory = useCallback((categoryData: Omit<Category, 'id' | 'createdAt' | 'flashcardCount'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      flashcardCount: 0
    };
    
    storage.addCategory(newCategory);
    setState(prev => ({ ...prev, categories: [...prev.categories, newCategory] }));
  }, []);

  const handleUpdateCategory = useCallback((id: string, updates: Partial<Category>) => {
    storage.updateCategory(id, updates);
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
    }));
  }, []);

  const handleDeleteCategory = useCallback((id: string) => {
    if (confirm('Are you sure? This will delete all flashcards in this category.')) {
      storage.deleteCategory(id);
      const updatedFlashcards = storage.getFlashcards();
      setState(prev => ({
        ...prev,
        categories: prev.categories.filter(cat => cat.id !== id),
        flashcards: updatedFlashcards
      }));
    }
  }, []);

  const handleSelectCategory = useCallback((categoryId: string) => {
    setState(prev => ({ ...prev, selectedCategory: categoryId, currentView: 'library' }));
  }, []);

  // Flashcard management
  const handleDeleteFlashcard = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this flashcard?')) {
      storage.deleteFlashcard(id);
      const updatedFlashcards = storage.getFlashcards();
      const updatedCategories = state.categories.map(cat => ({
        ...cat,
        flashcardCount: updatedFlashcards.filter(card => card.categoryId === cat.id).length
      }));
      
      setState(prev => ({
        ...prev,
        flashcards: updatedFlashcards,
        categories: updatedCategories
      }));
    }
  }, [state.categories]);

  const handleEditFlashcard = useCallback((flashcard: Flashcard) => {
    // For now, just show an alert. In a real app, you'd open an edit modal
    alert('Edit functionality would open a modal here');
  }, []);

  // Review session management
  const handleStartReview = useCallback((flashcards: Flashcard[], categoryId?: string) => {
    if (flashcards.length === 0) {
      alert('No flashcards available for review');
      return;
    }

    const session: ReviewSessionType = {
      id: `session-${Date.now()}`,
      categoryId,
      flashcards,
      currentIndex: 0,
      startTime: new Date(),
      totalCards: flashcards.length,
      correctAnswers: 0,
      isCompleted: false
    };

    setState(prev => ({ ...prev, reviewSession: session, currentView: 'review' }));
  }, []);

  const handleReviewCard = useCallback((result: ReviewResult) => {
    if (!state.reviewSession) return;

    // Update flashcard based on review result
    const flashcard = state.flashcards.find(card => card.id === result.flashcardId);
    if (flashcard) {
      const { nextReview, difficulty } = calculateNextReview(flashcard, result);
      
      const updates: Partial<Flashcard> = {
        lastReviewed: new Date(),
        nextReview,
        difficulty,
        reviewCount: flashcard.reviewCount + 1,
        correctCount: flashcard.correctCount + (result.isCorrect ? 1 : 0)
      };

      storage.updateFlashcard(result.flashcardId, updates);
      
      const updatedFlashcards = storage.getFlashcards();
      setState(prev => ({ ...prev, flashcards: updatedFlashcards }));
    }

    // Update session
    const updatedSession: ReviewSessionType = {
      ...state.reviewSession,
      currentIndex: state.reviewSession.currentIndex + 1,
      correctAnswers: state.reviewSession.correctAnswers + (result.isCorrect ? 1 : 0)
    };

    if (updatedSession.currentIndex >= updatedSession.totalCards) {
      updatedSession.isCompleted = true;
      updatedSession.endTime = new Date();
    }

    setState(prev => ({ ...prev, reviewSession: updatedSession }));
  }, [state.reviewSession, state.flashcards]);

  const handleCompleteSession = useCallback(() => {
    setState(prev => ({ ...prev, reviewSession: null, currentView: 'review' }));
  }, []);

  const handleExitSession = useCallback(() => {
    setState(prev => ({ ...prev, reviewSession: null, currentView: 'library' }));
  }, []);

  // Search and filter
  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleCategoryFilter = useCallback((categoryId: string | null) => {
    setState(prev => ({ ...prev, selectedCategory: categoryId }));
  }, []);

  // Get review count for navigation badge
  const reviewCount = getCardsForReview(state.flashcards).length;

  const renderCurrentView = () => {
    if (state.reviewSession) {
      return (
        <ReviewSession
          session={state.reviewSession}
          onReviewCard={handleReviewCard}
          onCompleteSession={handleCompleteSession}
          onExitSession={handleExitSession}
        />
      );
    }

    switch (state.currentView) {
      case 'library':
        return (
          <FlashcardLibrary
            flashcards={state.flashcards}
            categories={state.categories}
            searchQuery={state.searchQuery}
            selectedCategory={state.selectedCategory}
            onSearchChange={handleSearchChange}
            onCategoryFilter={handleCategoryFilter}
            onEditFlashcard={handleEditFlashcard}
            onDeleteFlashcard={handleDeleteFlashcard}
            onStartReview={handleStartReview}
          />
        );
      
      case 'review':
        return (
          <ReviewDashboard
            flashcards={state.flashcards}
            categories={state.categories}
            onStartReview={handleStartReview}
          />
        );
      
      case 'categories':
        return (
          <CategoryManager
            categories={state.categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onSelectCategory={handleSelectCategory}
          />
        );
      
      case 'upload':
      default:
        return (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
            {state.isGenerating ? (
              <LoadingSpinner message="Generating flashcards from your PDF..." />
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <Sparkles className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Upload Your PDF
                  </h2>
                  <p className="text-gray-600">
                    Select a PDF file and we'll extract key information to create flashcards for you
                  </p>
                </div>

                <FileUpload
                  file={state.file}
                  onFileSelect={handleFileSelect}
                  disabled={state.isGenerating}
                />

                {state.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600">{state.error}</p>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={handleGenerateFlashcards}
                    disabled={!state.file || state.isGenerating}
                    className={`px-8 py-3 rounded-lg font-semibold text-white text-lg transition-all duration-200 ${
                      !state.file || state.isGenerating
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    }`}
                  >
                    {state.isGenerating ? 'Generating...' : 'Generate Flashcards'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation
        currentView={state.currentView}
        onViewChange={handleViewChange}
        reviewCount={reviewCount}
      />
      
      <div className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </div>
    </div>
  );
}

export default App;