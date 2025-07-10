import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface FlashcardProps {
  question: string;
  answer: string;
  index: number;
}

const Flashcard: React.FC<FlashcardProps> = ({ question, answer, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative w-full h-64 perspective-1000">
      <div
        className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front side */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
          <div className="p-6 h-full flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium opacity-80">Question {index + 1}</span>
              <RotateCcw className="h-4 w-4 opacity-60" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg font-medium text-center leading-relaxed">{question}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">Click to reveal answer</p>
            </div>
          </div>
        </div>

        {/* Back side */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg rotate-y-180">
          <div className="p-6 h-full flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium opacity-80">Answer {index + 1}</span>
              <RotateCcw className="h-4 w-4 opacity-60" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg font-medium text-center leading-relaxed">{answer}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-80">Click to see question</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;