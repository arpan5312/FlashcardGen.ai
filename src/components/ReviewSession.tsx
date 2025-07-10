import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Clock, Target, TrendingUp } from 'lucide-react';
import { ReviewSession as ReviewSessionType, Flashcard, ReviewResult } from '../types/flashcard';

interface ReviewSessionProps {
  session: ReviewSessionType;
  onReviewCard: (result: ReviewResult) => void;
  onCompleteSession: () => void;
  onExitSession: () => void;
}

const ReviewSession: React.FC<ReviewSessionProps> = ({
  session,
  onReviewCard,
  onCompleteSession,
  onExitSession,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showResult, setShowResult] = useState(false);

  const currentCard = session.flashcards[session.currentIndex];
  const progress = ((session.currentIndex + 1) / session.totalCards) * 100;

  useEffect(() => {
    setIsFlipped(false);
    setShowResult(false);
    setStartTime(new Date());
  }, [session.currentIndex]);

  const handleAnswer = (isCorrect: boolean, difficulty: 'easy' | 'medium' | 'hard') => {
    const timeSpent = new Date().getTime() - startTime.getTime();
    
    const result: ReviewResult = {
      flashcardId: currentCard.id,
      isCorrect,
      difficulty,
      timeSpent,
    };

    onReviewCard(result);
    setShowResult(true);

    // Auto-advance after showing result
    setTimeout(() => {
      if (session.currentIndex + 1 >= session.totalCards) {
        onCompleteSession();
      }
    }, 1500);
  };

  const handleFlip = () => {
    if (!showResult) {
      setIsFlipped(!isFlipped);
    }
  };

  if (session.isCompleted) {
    const accuracy = session.totalCards > 0 ? Math.round((session.correctAnswers / session.totalCards) * 100) : 0;
    
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <TrendingUp className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h2>
            <p className="text-gray-600">Great job on completing your review session</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{session.totalCards}</div>
              <div className="text-sm text-gray-500">Cards Reviewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{session.correctAnswers}</div>
              <div className="text-sm text-gray-500">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
          </div>

          <div className="flex space-x-4 justify-center">
            <button
              onClick={onExitSession}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Back to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Target className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review Session</h2>
              <p className="text-gray-600">
                Card {session.currentIndex + 1} of {session.totalCards}
              </p>
            </div>
          </div>
          <button
            onClick={onExitSession}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Exit Session
          </button>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative w-full h-96 perspective-1000 mb-8">
        <div
          className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
        >
          {/* Front side - Question */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <div className="p-8 h-full flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium opacity-80">Question</span>
                <RotateCcw className="h-5 w-5 opacity-60" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl font-medium text-center leading-relaxed">
                  {currentCard.question}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-80">Click to reveal answer</p>
              </div>
            </div>
          </div>

          {/* Back side - Answer */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg rotate-y-180">
            <div className="p-8 h-full flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium opacity-80">Answer</span>
                <RotateCcw className="h-5 w-5 opacity-60" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl font-medium text-center leading-relaxed">
                  {currentCard.answer}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-80">How well did you know this?</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Buttons */}
      {isFlipped && !showResult && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleAnswer(false, 'hard')}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            <XCircle className="h-5 w-5" />
            <span>Didn't Know</span>
          </button>
          <button
            onClick={() => handleAnswer(true, 'medium')}
            className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            <Clock className="h-5 w-5" />
            <span>Somewhat</span>
          </button>
          <button
            onClick={() => handleAnswer(true, 'easy')}
            className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Easy</span>
          </button>
        </div>
      )}

      {showResult && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span>Answer recorded! Moving to next card...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSession;