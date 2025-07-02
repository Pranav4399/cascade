import React from 'react';

interface LetterInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  isHighlighted: boolean;
  isValidated: boolean;
  isFocused: boolean;
  isCorrect: boolean;
  disabled: boolean;
  wordLength: number;
  inputRef: (el: HTMLInputElement | null) => void;
}

const LetterInput: React.FC<LetterInputProps> = ({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  isHighlighted,
  isValidated,
  isFocused,
  isCorrect,
  disabled,
  wordLength,
  inputRef,
}) => {
  // Calculate dynamic sizing for mobile to prevent horizontal scrolling
  const getDynamicSizeClasses = () => {
    // For screens sm and above, use standard sizing
    const desktopClasses = 'sm:w-12 sm:h-12';
    
    // For mobile, use more liberal sizing to better utilize screen space
    // Available width: assume 320px (iPhone SE) - 24px padding = 296px usable
    // More generous sizing while still preventing overflow
    
    if (wordLength >= 9) {
      // 9 letters: use larger size (32px each + 8px gaps = 296px total)
      return `w-8 h-8 ${desktopClasses}`;
    } else if (wordLength >= 8) {
      // 8 letters: use medium size (36px each + 7px gaps = 295px total)
      return `w-9 h-9 ${desktopClasses}`;
    } else if (wordLength >= 7) {
      // 7 letters: use standard mobile size (40px each + 6px gaps = 286px total)
      return `w-10 h-10 ${desktopClasses}`;
    } else {
      // 6 letters or less: use larger mobile size (44px each + 5px gaps = 269px total)
      return `w-11 h-11 ${desktopClasses}`;
    }
  };

  const getDynamicTextSize = () => {
    // More liberal text sizing
    if (wordLength >= 9) {
      return 'text-base sm:text-lg';
    } else {
      return 'text-base sm:text-lg';
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`
        ${getDynamicSizeClasses()} border-2 flex items-center justify-center 
        font-bold ${getDynamicTextSize()} text-center uppercase
        ${isHighlighted ? 'game-letter-highlighted' : 
          isCorrect ? 'game-letter-validated' : 
          'game-letter-input'}
        ${isFocused ? 'ring-2 ring-blue-500 border-blue-500 dark:ring-blue-400 dark:border-blue-400' : ''}
        transition-all duration-200 focus:outline-none caret-transparent
        ${!isValidated && !isHighlighted && 'hover:border-gray-400 hover:shadow-sm'}
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-default
      `}
      maxLength={1}
      disabled={disabled}
    />
  );
};

export default LetterInput; 