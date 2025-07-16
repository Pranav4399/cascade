import { FocusedCell, WordData } from '@/types/game';
import React, { useRef } from 'react';

export const useInputHandling = (gameWords: WordData[]) => {
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array(gameWords.length).fill(null).map(() => Array(9).fill(null))
  );

  const handleLetterInput = (
    wordIndex: number, 
    letterIndex: number, 
    value: string,
    userAnswers: string[][],
    setUserAnswers: (answers: string[][]) => void,
    setFocusedCell: (cell: FocusedCell | null) => void,
    gameComplete: boolean
  ) => {
    if (gameComplete) return;

    // Handle all text input here (works reliably on both desktop and mobile)
    if (value.length >= 1) {
      // Take only the last character typed (handles mobile keyboards better)
      const lastChar = value.slice(-1);
      
      if (/^[a-zA-Z]$/.test(lastChar)) {
        const upperValue = lastChar.toUpperCase();
        
        const newAnswers = userAnswers.map(row => [...row]);
        newAnswers[wordIndex][letterIndex] = upperValue;
        setUserAnswers(newAnswers);

        // Move to next box
        if (letterIndex < gameWords[wordIndex].answer.length - 1) {
          const nextInput = inputRefs.current[wordIndex][letterIndex + 1];
          if (nextInput) {
            nextInput.focus();
          }
          setFocusedCell({ wordIndex, letterIndex: letterIndex + 1 });
        }
      }
    } else if (value.length === 0) {
      // Handle when input is cleared
      const newAnswers = userAnswers.map(row => [...row]);
      newAnswers[wordIndex][letterIndex] = '';
      setUserAnswers(newAnswers);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent, 
    wordIndex: number, 
    letterIndex: number,
    userAnswers: string[][],
    setUserAnswers: (answers: string[][]) => void,
    setFocusedCell: (cell: FocusedCell | null) => void,
    gameComplete: boolean
  ) => {
    if (gameComplete) return;

    if (e.key === 'Backspace') {
      e.preventDefault(); // Only prevent default for backspace
      const newAnswers = userAnswers.map(row => [...row]);
      newAnswers[wordIndex][letterIndex] = '';
      setUserAnswers(newAnswers);
      
      // Focus previous cell on backspace
      if (letterIndex > 0) {
        const prevInput = inputRefs.current[wordIndex][letterIndex - 1];
        if (prevInput) {
          prevInput.focus();
        }
        setFocusedCell({ wordIndex, letterIndex: letterIndex - 1 });
      }
    }
    // Remove the letter handling from onKeyDown - let onChange handle it
  };

  const focusNextWord = (currentWordIndex: number, validatedAnswers: boolean[], setFocusedCell: (cell: FocusedCell | null) => void, userAnswers?: string[][]) => {
    // Find the next word that isn't validated yet
    for (let i = currentWordIndex + 1; i < gameWords.length; i++) {
      if (!validatedAnswers[i]) {
        // In cascade pattern, when word N is solved, word N+1 gets first N letters auto-filled
        // So we should focus on position N (0-indexed) of the next word
        const targetLetterIndex = currentWordIndex + 1;
        
        // Make sure the target position exists in this word
        if (targetLetterIndex < gameWords[i].answer.length) {
          const nextInput = inputRefs.current[i][targetLetterIndex];
          if (nextInput) {
            setTimeout(() => {
              nextInput.focus();
              setFocusedCell({ wordIndex: i, letterIndex: targetLetterIndex });
            }, 100); // Small delay to ensure validation state has updated
          }
        } else {
          // If the calculated position doesn't exist, fall back to first empty cell
          let fallbackIndex = 0;
          if (userAnswers && userAnswers[i]) {
            for (let j = 0; j < userAnswers[i].length; j++) {
              if (!userAnswers[i][j]) {
                fallbackIndex = j;
                break;
              }
            }
          }
          const nextInput = inputRefs.current[i][fallbackIndex];
          if (nextInput) {
            setTimeout(() => {
              nextInput.focus();
              setFocusedCell({ wordIndex: i, letterIndex: fallbackIndex });
            }, 100);
          }
        }
        return;
      }
    }
  };

  return {
    inputRefs,
    handleLetterInput,
    handleKeyDown,
    focusNextWord,
  };
};