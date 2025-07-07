import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { currentGameData, gameWords } from '@/data/gameWords';
import { useFirstVisit } from '@/hooks/useFirstVisit';
import { MAX_HINTS, useGameState } from '@/hooks/useGameState';
import { useInputHandling } from '@/hooks/useInputHandling';
import { useStreakCounter } from '@/hooks/useStreakCounter';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ThemeToggle from '../ui/ThemeToggle';
import CongratsModal from './CongratsModal';
import HowToPlayModal from './HowToPlayModal';
import WordRow from './WordRow';

// Native SVG icon to replace lucide-react
const HelpCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LightbulbIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a7 7 0 0 0-7 7c0 2.05 1.2 3.85 3 5.22V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.78c1.8-1.37 3-3.17 3-5.22a7 7 0 0 0-7-7z" />
    <path d="M9 21h6" />
  </svg>
);


const GameGrid = () => {
  const { showModal, closeModal } = useFirstVisit();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  const { currentStreak, maxStreak, incrementStreak, resetStreak, hasGameContributedToStreak } = useStreakCounter();
  
  // Create a ref to store the focus function to avoid circular dependency
  const focusNextWordRef = useRef<((wordIndex: number) => void) | null>(null);

  const gameState = useGameState(gameWords, currentGameData.id.toString(), () => {
    setShowCongratsModal(true);
  }, (wordIndex: number) => {
    // Auto-focus to next word when current word is validated
    focusNextWordRef.current?.(wordIndex);
  });

  const inputHandling = useInputHandling(gameWords);

  const {
    userAnswers,
    setUserAnswers,
    validatedAnswers,
    gameComplete,
    gameGivenUp,
    focusedCell,
    setFocusedCell,
    completionTime,
    formatTime,
    getCurrentElapsedTime,
    giveUpGame,
    applyHint,
    hintsUsed,
  } = gameState;

  const { inputRefs, handleLetterInput, handleKeyDown, focusNextWord } = inputHandling;

  // Handle streak logic when game completes
  const streakHandledRef = useRef(false);
  
  useEffect(() => {
    const gameId = currentGameData.id.toString();
    const hasAlreadyContributed = hasGameContributedToStreak(gameId);
    
    if (gameComplete && !streakHandledRef.current && !hasAlreadyContributed) {
      streakHandledRef.current = true;
      if (gameGivenUp) {
        resetStreak(gameId);
      } else {
        incrementStreak(gameId);
      }
    }
    
    // Reset the flag when game is not complete (for new games)
    if (!gameComplete) {
      streakHandledRef.current = false;
    }
  }, [gameComplete, gameGivenUp, incrementStreak, resetStreak, hasGameContributedToStreak]);

  // Set up the focus function ref with useCallback to avoid recreating on every render
  const handleWordValidated = useCallback((wordIndex: number) => {
    focusNextWord(wordIndex, validatedAnswers, setFocusedCell, userAnswers);
  }, [focusNextWord, validatedAnswers, setFocusedCell, userAnswers]);

  // Update the ref when the callback changes
  focusNextWordRef.current = handleWordValidated;

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
      setFocusedCell,
      gameComplete
    );
  };

  const onFocus = (wordIndex: number, letterIndex: number) => {
    setFocusedCell({ wordIndex, letterIndex });
  };

  const onBlur = () => {
    setFocusedCell(null);
  };

  const handleShare = async () => {
    const timeText = completionTime ? formatTime(completionTime) : 'Not completed';
    const shareText = `🎯 I just solved today's Cascade puzzle in ${timeText}!\n\n` +
      `🔥 Current streak: ${currentStreak}\n` +
      `🏆 Best streak: ${maxStreak}\n\n` +
      `Can you beat my time?\n\n` +
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

  const handleConfirmGiveUp = () => {
    giveUpGame();
    setShowConfirmModal(false);
  };

  const handleHintClick = () => {
    applyHint();
    setShowHintModal(false);
  };

  return (
    <div className="min-h-screen game-background flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="border-b game-header transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="sm:hidden">
            {/* Top Row: Title and Controls */}
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold game-text-primary">
                Cascade
              </h1>
              <div className="flex items-center gap-0.5">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelpModal(true)}
                  className="p-1.5"
                >
                  <HelpCircleIcon className="w-5 h-5 game-text-primary" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHintModal(true)}
                  className="p-1.5"
                >
                  <LightbulbIcon className="w-5 h-5 game-text-primary" />
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center">
            <h1 className="text-3xl font-bold game-text-primary text-left flex-1">
              Cascade
            </h1>
            <div className="flex items-center gap-0.5">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelpModal(true)}
                className="p-2"
              >
                <HelpCircleIcon className="w-6 h-6 game-text-primary" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHintModal(true)}
                  className="p-2"
                >
                  <LightbulbIcon className="w-6 h-6 game-text-primary" />
                </Button>
              </div>
            </div>
          </div>
        </header>

      {/* Main Game Area */}
      <main className="flex-1 p-3 sm:p-4 pt-4 sm:pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-2 sm:mb-4">
            <p className="game-text-secondary text-xs sm:text-sm">
              Find synonyms that follow the pattern
            </p>
          </div>
          {/* Timer below the 'Find synonyms..' line */}
          <div className="text-center mb-4 sm:mb-8">
            <div className="text-base font-mono game-text-primary inline-block">
              {formatTime(getCurrentElapsedTime())}
            </div>
          </div>

          {/* Game Grid */}
          <div className="max-w-2xl mx-auto">
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {gameWords.map((word, index) => (
                <WordRow
                  key={index}
                  word={word}
                  wordIndex={index}
                  userAnswerLetters={
                    userAnswers[index] || Array(word.length).fill("")
                  }
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
          </div>

          {/* Bottom Content - Aligned with title on desktop */}
          <div className="max-w-4xl mx-auto">
            {/* Reveal Cascade Button */}
            {!gameComplete && (
              <div className="text-center mb-6 sm:mb-8">
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirmModal(true)}
                  className="px-6 py-2 bg-white dark:bg-gray-800 border border-black dark:border-gray-300 text-black dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-full"
                >
                  Reveal cascade
                </Button>
              </div>
            )}

            {/* Completion Message */}
            {gameComplete && (
              <div className="text-center mb-6 sm:mb-8">
                {gameGivenUp ? (
                  <>
                    <p className="text-lg sm:text-xl font-medium game-text-primary mb-1">
                      Don't give up!
                    </p>
                    <p className="text-sm game-text-secondary mb-2">
                      You can always try again tomorrow
                    </p>
                    <div className="text-xs game-text-secondary">
                      Current streak: {currentStreak} | Best streak: {maxStreak}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-lg sm:text-xl font-medium game-text-primary mb-1">
                      Well done!
                    </p>
                    <p className="text-sm game-text-secondary mb-2">
                      You've completed the cascade pattern
                    </p>
                    <div className="text-xs game-text-secondary">
                      Current streak: {currentStreak} | Best streak: {maxStreak}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <HowToPlayModal
        isOpen={showModal || showHelpModal}
        onClose={() => {
          closeModal();
          setShowHelpModal(false);
        }}
      />

      <CongratsModal
        isOpen={showCongratsModal}
        onClose={() => setShowCongratsModal(false)}
        onShare={handleShare}
        completionTime={completionTime}
        formatTime={formatTime}
        currentStreak={currentStreak}
        maxStreak={maxStreak}
      />

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reveal the cascade?</DialogTitle>
            <DialogDescription>
              This will reveal all the answers and end the current game. Are you
              sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleConfirmGiveUp}
              className="bg-white dark:bg-gray-800 border border-black dark:border-gray-300 text-black dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-full"
            >
              Reveal cascade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showHintModal} onOpenChange={setShowHintModal}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Need a hint?</DialogTitle>
            <DialogDescription>
              You have {MAX_HINTS - hintsUsed} hints remaining.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowHintModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleHintClick}
              disabled={hintsUsed >= MAX_HINTS || gameComplete}
              className="bg-white dark:bg-gray-800 border border-black dark:border-gray-300 text-black dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-full"
            >
              Use Hint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameGrid;
