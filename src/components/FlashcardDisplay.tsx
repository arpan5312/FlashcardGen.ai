import React from 'react';
import { Brain, RotateCcw } from 'lucide-react';
import Flashcard from './Flashcard';
import { Flashcard as FlashcardType } from '../types/flashcard';

interface FlashcardDisplayProps {
  flashcards: FlashcardType[];
  onReset: () => void;
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({ flashcards, onReset }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Flashcards</h2>
            <p className="text-gray-600">{flashcards.length} cards generated</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
        >
          <RotateCcw className="h-4 w-4" />
          <span>New PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcards.map((flashcard, index) => (
          <Flashcard
            key={flashcard.id}
            question={flashcard.question}
            answer={flashcard.answer}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default FlashcardDisplay;