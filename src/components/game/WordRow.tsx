import { FocusedCell, WordData } from '@/types/game';
import React from 'react';
import LetterInput from './LetterInput';

interface WordRowProps {
  word: WordData;
  wordIndex: number;
  userAnswerLetters: string[];
  isValidated: boolean;
  focusedCell: FocusedCell | null;
  gameComplete: boolean;
  onLetterInput: (wordIndex: number, letterIndex: number, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent, wordIndex: number, letterIndex: number) => void;
  onFocus: (wordIndex: number, letterIndex: number) => void;
  onBlur: () => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[][]>;
}

const WordRow: React.FC<WordRowProps> = ({
  word,
  wordIndex,
  userAnswerLetters,
  isValidated,
  focusedCell,
  gameComplete,
  onLetterInput,
  onKeyDown,
  onFocus,
  onBlur,
  inputRefs,
}) => {
  // Calculate dynamic gap based on word length for mobile
  const getDynamicGapClass = () => {
    if (word.answer.length >= 9) {
      // Very long words: small gap on mobile (still need some space)
      return 'gap-0.5 sm:gap-1';
    } else if (word.answer.length >= 8) {
      // Long words: standard gap on mobile
      return 'gap-0.5 sm:gap-1';
    } else {
      // Short to medium words: comfortable gap
      return 'gap-1 sm:gap-1';
    }
  };

  const renderLetterBoxes = () => {
    const boxes = [];
    
    for (let i = 0; i < word.answer.length; i++) {
      const letter = userAnswerLetters[i] || '';
      // Yellow highlight: first box of first row, first two of second row, etc.
      const isHighlighted = i < wordIndex + 1;
      const isFocused = focusedCell?.wordIndex === wordIndex && focusedCell?.letterIndex === i;
      const isCorrect = isValidated && letter === word.answer[i];
      
      boxes.push(
        <LetterInput
          key={i}
          value={letter}
          onChange={(value) => onLetterInput(wordIndex, i, value)}
          onKeyDown={(e) => onKeyDown(e, wordIndex, i)}
          onFocus={() => onFocus(wordIndex, i)}
          onBlur={onBlur}
          isHighlighted={isHighlighted}
          isValidated={isValidated}
          isFocused={isFocused}
          isCorrect={isCorrect}
          disabled={gameComplete}
          wordLength={word.answer.length}
          inputRef={(el) => {
            if (inputRefs.current[wordIndex]) {
              inputRefs.current[wordIndex][i] = el;
            }
          }}
        />
      );
    }
    
    return boxes;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
      <div className="w-full sm:w-32 text-center sm:text-right font-semibold game-text-primary flex-shrink-0 text-sm sm:text-base">
        {word.clue}
      </div>
      
      <div className={`flex ${getDynamicGapClass()} justify-center sm:justify-start`}>
        {renderLetterBoxes()}
      </div>
    </div>
  );
};

export default WordRow; 