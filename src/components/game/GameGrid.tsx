import { Button } from '@/components/ui/button';
import { gameWords } from '@/data/gameWords';
import { useFirstVisit } from '@/hooks/useFirstVisit';
import { useGameState } from '@/hooks/useGameState';
import { useInputHandling } from '@/hooks/useInputHandling';
import React, { useEffect, useState } from 'react';
import CongratsModal from './CongratsModal';
import HowToPlayModal from './HowToPlayModal';
import WordRow from './WordRow';

// Native SVG icon to replace lucide-react
const HelpCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GameGrid = () => {
  const { showModal, closeModal } = useFirstVisit();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);

  const gameState = useGameState(gameWords, () => {
    setShowCongratsModal(true);
  });
  
  const inputHandling = useInputHandling(gameWords);

  const {
    userAnswers,
    setUserAnswers,
    validatedAnswers,
    gameComplete,
    focusedCell,
    setFocusedCell,
    resetGame,
  } = gameState;

  const { inputRefs, handleLetterInput, handleKeyDown } = inputHandling;

  // Auto-focus on first input when page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRefs.current[0] && inputRefs.current[0][0] && !gameComplete) {
        inputRefs.current[0][0].focus();
        setFocusedCell({ wordIndex: 0, letterIndex: 0 });
      }
    }, 100); // Small delay to ensure refs are set

    return () => clearTimeout(timer);
  }, [inputRefs, gameComplete, setFocusedCell]);

  const onLetterInput = (wordIndex: number, letterIndex: number, value: string) => {
    handleLetterInput(
      wordIndex,
      letterIndex,
      value,
      userAnswers,
      setUserAnswers,
      setFocusedCell,
      gameComplete
    );
  };

  const onKeyDown = (e: React.KeyboardEvent, wordIndex: number, letterIndex: number) => {
    handleKeyDown(
      e,
      wordIndex,
      letterIndex,
      userAnswers,
      setUserAnswers,
      setFocusedCell
    );
  };

  const onFocus = (wordIndex: number, letterIndex: number) => {
    setFocusedCell({ wordIndex, letterIndex });
  };

  const onBlur = () => {
    setFocusedCell(null);
  };

  const handleShare = async () => {
    const shareText = `🎯 I just solved today's Cascade puzzle!\n\n` +
      `${gameWords.map((word, index) => 
        `${word.clue}: ${userAnswers[index]}`
      ).join('\n')}\n\n` +
      `Try it yourself!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cascade Puzzle Solved!',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        // Could add a toast here to indicate copied to clipboard
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      // Could add a toast here to indicate copied to clipboard
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div></div> {/* Empty div for spacing */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Cascade</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 sm:p-2"
          >
            <HelpCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </Button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 p-3 sm:p-4 pt-4 sm:pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-4 sm:mb-8">
            <p className="text-gray-600 text-xs sm:text-sm">
              Find synonyms that follow the pattern
            </p>
          </div>

          {/* Game Grid */}
          <div className="max-w-2xl mx-auto">
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {gameWords.map((word, index) => (
                <WordRow
                  key={index}
                  word={word}
                  wordIndex={index}
                  userAnswer={userAnswers[index] || ''}
                  isValidated={validatedAnswers[index]}
                  focusedCell={focusedCell}
                  gameComplete={gameComplete}
                  onLetterInput={onLetterInput}
                  onKeyDown={onKeyDown}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  inputRefs={inputRefs}
                />
              ))}
            </div>

            {/* Completion Message */}
            {gameComplete && (
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-lg sm:text-xl font-medium text-gray-700 mb-1">
                  Well done!
                </p>
                <p className="text-sm text-gray-600">
                  You've completed the cascade pattern
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <HowToPlayModal isOpen={showModal || showHelpModal} onClose={() => {
        closeModal();
        setShowHelpModal(false);
      }} />

      <CongratsModal
        isOpen={showCongratsModal}
        onClose={() => setShowCongratsModal(false)}
        onShare={handleShare}
      />
    </div>
  );
};

export default GameGrid;
