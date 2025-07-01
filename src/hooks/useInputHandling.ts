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
    userAnswers: string[],
    setUserAnswers: (answers: string[]) => void,
    setFocusedCell: (cell: FocusedCell | null) => void,
    gameComplete: boolean
  ) => {
    if (gameComplete) return;
    
    const newAnswers = [...userAnswers];
    const currentWord = newAnswers[wordIndex] || '';
    const newWord = currentWord.split('');
    
    // Only allow single letters and convert to uppercase
    if (value.length <= 1 && /^[a-zA-Z]*$/.test(value)) {
      newWord[letterIndex] = value.toUpperCase();
      newAnswers[wordIndex] = newWord.join('');
      setUserAnswers(newAnswers);
      
      // Auto-focus next cell if letter was entered
      if (value && letterIndex < gameWords[wordIndex].length - 1) {
        const nextInput = inputRefs.current[wordIndex][letterIndex + 1];
        if (nextInput) {
          nextInput.focus();
        }
        setFocusedCell({wordIndex, letterIndex: letterIndex + 1});
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent, 
    wordIndex: number, 
    letterIndex: number,
    userAnswers: string[],
    setUserAnswers: (answers: string[]) => void,
    setFocusedCell: (cell: FocusedCell | null) => void
  ) => {
    if (e.key === 'Backspace') {
      const newAnswers = [...userAnswers];
      const currentWord = newAnswers[wordIndex] || '';
      const newWord = currentWord.split('');
      newWord[letterIndex] = '';
      newAnswers[wordIndex] = newWord.join('');
      setUserAnswers(newAnswers);
      
      // Focus previous cell on backspace if current cell is empty
      if (letterIndex > 0 && !currentWord[letterIndex]) {
        const prevInput = inputRefs.current[wordIndex][letterIndex - 1];
        if (prevInput) {
          prevInput.focus();
        }
        setFocusedCell({wordIndex, letterIndex: letterIndex - 1});
      }
    }
  };

  return {
    inputRefs,
    handleLetterInput,
    handleKeyDown,
  };
}; 