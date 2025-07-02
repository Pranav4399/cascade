import { FocusedCell, WordData } from '@/types/game';
import { createAudioChimes } from '@/utils/audio';
import { useEffect, useState } from 'react';

interface GameSaveData {
  userAnswers: string[];
  validatedAnswers: boolean[];
  gameComplete: boolean;
  startTime: number;
  completionTime?: number;
}

export const useGameState = (gameWords: WordData[], gameId: string, onGameComplete?: () => void) => {
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(gameWords.length).fill(''));
  const [validatedAnswers, setValidatedAnswers] = useState<boolean[]>(Array(gameWords.length).fill(false));
  const [gameComplete, setGameComplete] = useState(false);
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  const audioChimes = createAudioChimes();
  const storageKey = `cascade-game-${gameId}`;

  // Update current time every second for live timer
  useEffect(() => {
    if (gameComplete) return;
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [gameComplete]);

  // Load saved game state on mount
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const gameData: GameSaveData = JSON.parse(savedData);
        setUserAnswers(gameData.userAnswers);
        setValidatedAnswers(gameData.validatedAnswers);
        setGameComplete(gameData.gameComplete);
        setStartTime(gameData.startTime);
        setCompletionTime(gameData.completionTime || null);
      } catch (error) {
        console.warn('Failed to load saved game data:', error);
      }
    }
  }, [storageKey]);

  // Save game state whenever it changes
  useEffect(() => {
    const gameData: GameSaveData = {
      userAnswers,
      validatedAnswers,
      gameComplete,
      startTime,
      completionTime: completionTime || undefined,
    };
    localStorage.setItem(storageKey, JSON.stringify(gameData));
  }, [userAnswers, validatedAnswers, gameComplete, startTime, completionTime, storageKey]);

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
          // Trigger auto-fill when a word is completed
          autoFillPrefixes(index, answer);
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
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      setGameComplete(true);
      setCompletionTime(totalTime);
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

  // Auto-fill functionality: when a word is completed, fill matching prefixes in other words
  const autoFillPrefixes = (completedWordIndex: number, completedWord: string) => {
    const newAnswers = [...userAnswers];
    let hasChanges = false;

    // For each other word, check if it should be auto-filled
    gameWords.forEach((word, wordIndex) => {
      if (wordIndex === completedWordIndex) return; // Skip the completed word itself
      
      // Calculate how many letters this word should share with the completed word
      const sharedPrefixLength = Math.min(completedWordIndex + 1, wordIndex + 1);
      const requiredPrefix = completedWord.substring(0, sharedPrefixLength);
      
      // Only auto-fill if the word starts with the required prefix in the correct answer
      if (word.answer.startsWith(requiredPrefix)) {
        const currentAnswer = newAnswers[wordIndex] || '';
        
        // Auto-fill the prefix if it's not already there or if it's wrong
        if (!currentAnswer.startsWith(requiredPrefix)) {
          // Preserve any correct letters beyond the prefix
          const existingPart = currentAnswer.substring(sharedPrefixLength);
          const correctPart = word.answer.substring(sharedPrefixLength);
          
          // Only keep existing letters if they match the correct answer
          let preservedPart = '';
          for (let i = 0; i < Math.min(existingPart.length, correctPart.length); i++) {
            if (existingPart[i] === correctPart[i]) {
              preservedPart += existingPart[i];
            } else {
              break;
            }
          }
          
          newAnswers[wordIndex] = requiredPrefix + preservedPart;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setUserAnswers(newAnswers);
    }
  };

  const resetGame = () => {
    const newStartTime = Date.now();
    setUserAnswers(Array(gameWords.length).fill(''));
    setValidatedAnswers(Array(gameWords.length).fill(false));
    setGameComplete(false);
    setFocusedCell(null);
    setStartTime(newStartTime);
    setCompletionTime(null);
    // Clear saved game data
    localStorage.removeItem(storageKey);
  };

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentElapsedTime = (): number => {
    if (gameComplete && completionTime) {
      return completionTime;
    }
    return currentTime - startTime;
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
    completionTime,
    formatTime,
    currentTime,
    getCurrentElapsedTime,
  };
}; 