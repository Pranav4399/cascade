import { FocusedCell, WordData } from '@/types/game';
import { createAudioChimes } from '@/utils/audio';
import { useEffect, useState } from 'react';

export const useGameState = (gameWords: WordData[], onGameComplete?: () => void) => {
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(gameWords.length).fill(''));
  const [validatedAnswers, setValidatedAnswers] = useState<boolean[]>(Array(gameWords.length).fill(false));
  const [gameComplete, setGameComplete] = useState(false);
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);

  const audioChimes = createAudioChimes();

  // Auto-validate answers and check for completion
  useEffect(() => {
    const newValidatedAnswers = [...validatedAnswers];
    let hasChanges = false;
    let newlyValidatedWords: number[] = [];

    userAnswers.forEach((answer, index) => {
      if (answer.length === gameWords[index].length && answer === gameWords[index].answer) {
        if (!validatedAnswers[index]) {
          newValidatedAnswers[index] = true;
          newlyValidatedWords.push(index);
          hasChanges = true;
        }
      } else if (validatedAnswers[index] && answer !== gameWords[index].answer) {
        newValidatedAnswers[index] = false;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setValidatedAnswers(newValidatedAnswers);
      
      // Play chime for newly validated words
      newlyValidatedWords.forEach(() => {
        audioChimes.playWordChime();
      });
    }

    // Check if all answers are validated and puzzle is complete
    const allValidated = newValidatedAnswers.every(validated => validated);
    const patternValid = validatePattern(userAnswers);
    
    if (allValidated && patternValid && !gameComplete) {
      setGameComplete(true);
      setTimeout(() => {
        audioChimes.playPuzzleChime();
        onGameComplete?.();
      }, 200);
    }
  }, [userAnswers, validatedAnswers, gameComplete, gameWords, audioChimes, onGameComplete]);

  const validatePattern = (answers: string[]): boolean => {
    for (let i = 1; i < answers.length; i++) {
      if (!answers[i]) continue;
      const prevAnswer = answers[i - 1];
      const currentAnswer = answers[i];
      
      if (prevAnswer && currentAnswer) {
        const requiredPrefix = prevAnswer.substring(0, i);
        if (!currentAnswer.startsWith(requiredPrefix)) {
          return false;
        }
      }
    }
    return true;
  };

  const resetGame = () => {
    setUserAnswers(Array(gameWords.length).fill(''));
    setValidatedAnswers(Array(gameWords.length).fill(false));
    setGameComplete(false);
    setFocusedCell(null);
  };

  return {
    userAnswers,
    setUserAnswers,
    validatedAnswers,
    gameComplete,
    focusedCell,
    setFocusedCell,
    resetGame,
    validatePattern,
  };
}; 