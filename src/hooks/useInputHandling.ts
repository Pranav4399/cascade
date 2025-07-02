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
    // This function is now mainly a fallback since we handle input in handleKeyDown
    // It may still be triggered by paste operations or other edge cases
    if (gameComplete) return;

    if (value.length === 1 && /^[a-zA-Z]$/.test(value)) {
      const upperValue = value.toUpperCase();
      
      // Always update the value and move to next box, even if it's the same character
      const newAnswers = userAnswers.map(row => [...row]);
      newAnswers[wordIndex][letterIndex] = upperValue;
      setUserAnswers(newAnswers);

      // Move to next box regardless of whether the character changed
      if (letterIndex < gameWords[wordIndex].length - 1) {
        const nextInput = inputRefs.current[wordIndex][letterIndex + 1];
        if (nextInput) {
          nextInput.focus();
        }
        setFocusedCell({ wordIndex, letterIndex: letterIndex + 1 });
      }
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
    } else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
      // Handle letter input directly in keyDown to ensure it works even with prefilled characters
      e.preventDefault(); // Prevent the default input behavior
      
      const upperValue = e.key.toUpperCase();
      const newAnswers = userAnswers.map(row => [...row]);
      newAnswers[wordIndex][letterIndex] = upperValue;
      setUserAnswers(newAnswers);

      // Move to next box
      if (letterIndex < gameWords[wordIndex].length - 1) {
        const nextInput = inputRefs.current[wordIndex][letterIndex + 1];
        if (nextInput) {
          nextInput.focus();
        }
        setFocusedCell({ wordIndex, letterIndex: letterIndex + 1 });
      }
    }
  };

  const focusNextWord = (currentWordIndex: number, validatedAnswers: boolean[], setFocusedCell: (cell: FocusedCell | null) => void, userAnswers?: string[][]) => {
    // Find the next word that isn't validated yet
    for (let i = currentWordIndex + 1; i < gameWords.length; i++) {
      if (!validatedAnswers[i]) {
        // Find the first empty cell in this word, or the first cell if no empty cells
        let targetLetterIndex = 0;
        if (userAnswers && userAnswers[i]) {
          for (let j = 0; j < userAnswers[i].length; j++) {
            if (!userAnswers[i][j]) {
              targetLetterIndex = j;
              break;
            }
          }
        }
        
        const nextInput = inputRefs.current[i][targetLetterIndex];
        if (nextInput) {
          setTimeout(() => {
            nextInput.focus();
            setFocusedCell({ wordIndex: i, letterIndex: targetLetterIndex });
          }, 100); // Small delay to ensure validation state has updated
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