import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { HelpCircle } from 'lucide-react';

interface WordData {
  clue: string;
  answer: string;
  length: number;
}

const gameWords: WordData[] = [
  { clue: "ARGUE", answer: "BICKER", length: 6 },
  { clue: "CONFUSE", answer: "BAMBOOZLE", length: 9 },
  { clue: "UNCIVILISED", answer: "BARBARIC", length: 8 },
  { clue: "ADVOCATE", answer: "BARRISTER", length: 9 },
  { clue: "BULWARK", answer: "BARRICADE", length: 9 }
];

const GameGrid = () => {
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(5).fill(''));
  const [validatedAnswers, setValidatedAnswers] = useState<boolean[]>(Array(5).fill(false));
  const [gameComplete, setGameComplete] = useState(false);
  const [focusedCell, setFocusedCell] = useState<{wordIndex: number, letterIndex: number} | null>(null);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [hintsUsedPerWord, setHintsUsedPerWord] = useState<number[]>(Array(5).fill(0));
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array(5).fill(null).map(() => Array(9).fill(null))
  );

  // Create audio elements
  const wordSolvedChime = useRef<HTMLAudioElement | null>(null);
  const puzzleCompleteChime = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create simple audio chimes using Web Audio API
    const createChime = (frequencies: number[], duration: number = 0.3) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        oscillator.connect(gainNode);
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + duration + index * 0.1);
      });
    };

    // Simple chime for word completion
    const playWordChime = () => createChime([523, 659, 784]); // C5, E5, G5
    // Triumphant chime for puzzle completion
    const playPuzzleChime = () => createChime([523, 659, 784, 1047], 0.6); // C5, E5, G5, C6

    wordSolvedChime.current = { play: playWordChime } as any;
    puzzleCompleteChime.current = { play: playPuzzleChime } as any;
  }, []);

  // Auto-fill cascade letters when a word is solved
  const autoFillCascadeLetters = (solvedWordIndex: number, newAnswers: string[]) => {
    const solvedAnswer = gameWords[solvedWordIndex].answer;
    const updatedAnswers = [...newAnswers];
    
    // Fill the cascade letters for all other words
    for (let wordIndex = 0; wordIndex < gameWords.length; wordIndex++) {
      if (wordIndex === solvedWordIndex) continue; // Skip the solved word itself
      
      const currentWord = updatedAnswers[wordIndex] || '';
      const newWord = currentWord.split('');
      
      // Determine how many letters to fill based on the word's position
      const lettersToFill = wordIndex + 1;
      const lettersToTake = Math.min(lettersToFill, solvedAnswer.length);
      
      // Fill the required letters from the solved word
      for (let i = 0; i < lettersToTake; i++) {
        if (i < gameWords[wordIndex].length) {
          newWord[i] = solvedAnswer[i];
        }
      }
      
      updatedAnswers[wordIndex] = newWord.join('');
    }
    
    return updatedAnswers;
  };

  // Auto-validate answers and check for completion
  useEffect(() => {
    const newValidatedAnswers = [...validatedAnswers];
    let hasChanges = false;
    let newlyValidatedWords: number[] = [];
    let updatedAnswers = [...userAnswers];

    userAnswers.forEach((answer, index) => {
      if (answer.length === gameWords[index].length && answer === gameWords[index].answer) {
        if (!validatedAnswers[index]) {
          newValidatedAnswers[index] = true;
          newlyValidatedWords.push(index);
          hasChanges = true;
          
          // Auto-fill cascade letters for other words
          updatedAnswers = autoFillCascadeLetters(index, updatedAnswers);
        }
      } else if (validatedAnswers[index] && answer !== gameWords[index].answer) {
        newValidatedAnswers[index] = false;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setValidatedAnswers(newValidatedAnswers);
      
      // Update answers with auto-filled cascade letters
      if (JSON.stringify(updatedAnswers) !== JSON.stringify(userAnswers)) {
        setUserAnswers(updatedAnswers);
      }
      
      // Play chime for newly validated words
      newlyValidatedWords.forEach(() => {
        if (wordSolvedChime.current) {
          wordSolvedChime.current.play();
        }
      });
    }

    // Check if all answers are validated and puzzle is complete
    const allValidated = newValidatedAnswers.every(validated => validated);
    const patternValid = validatePattern(updatedAnswers);
    
    if (allValidated && patternValid && !gameComplete) {
      setGameComplete(true);
      if (puzzleCompleteChime.current) {
        setTimeout(() => puzzleCompleteChime.current?.play(), 200);
      }
      toast({
        title: "Puzzle Solved!",
        description: "Congratulations! You've completed the Cascade puzzle!",
      });
    }
  }, [userAnswers, validatedAnswers, gameComplete]);

  const handleLetterInput = (wordIndex: number, letterIndex: number, value: string) => {
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

  const handleKeyDown = (e: React.KeyboardEvent, wordIndex: number, letterIndex: number) => {
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

  const checkAnswers = () => {
    const correctAnswers = userAnswers.map((answer, index) => 
      answer === gameWords[index].answer
    );
    
    const allCorrect = correctAnswers.every(correct => correct);
    const patternValid = validatePattern(userAnswers);
    
    if (allCorrect && patternValid) {
      setGameComplete(true);
      if (puzzleCompleteChime.current) {
        puzzleCompleteChime.current.play();
      }
      toast({
        title: "Puzzle Solved!",
        description: "Congratulations! You've completed the Cascade puzzle!",
      });
    } else if (!patternValid) {
      toast({
        title: "Pattern Error",
        description: "Make sure each word follows the sequence pattern!",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Some answers are incorrect",
        description: "Keep trying! Check your synonyms.",
        variant: "destructive",
      });
    }
  };

  const useHint = () => {
    if (totalHintsUsed >= 3) {
      toast({
        title: "No more hints",
        description: "You've used all 3 hints available!",
        variant: "destructive",
      });
      return;
    }

    // Find the first incomplete word that we can give a hint for
    for (let wordIndex = 0; wordIndex < gameWords.length; wordIndex++) {
      if (validatedAnswers[wordIndex]) continue; // Skip already solved words
      
      const currentWord = userAnswers[wordIndex] || '';
      const correctAnswer = gameWords[wordIndex].answer;
      const newWord = currentWord.split('');
      
      // Find the next empty position to reveal
      for (let i = 0; i < correctAnswer.length; i++) {
        if (!newWord[i] || newWord[i] !== correctAnswer[i]) {
          newWord[i] = correctAnswer[i];
          
          const newAnswers = [...userAnswers];
          newAnswers[wordIndex] = newWord.join('');
          setUserAnswers(newAnswers);
          
          const newHintsUsedPerWord = [...hintsUsedPerWord];
          newHintsUsedPerWord[wordIndex] = hintsUsedPerWord[wordIndex] + 1;
          setHintsUsedPerWord(newHintsUsedPerWord);
          setTotalHintsUsed(totalHintsUsed + 1);

          toast({
            title: "Hint used!",
            description: `Revealed letter for "${gameWords[wordIndex].clue}" (${3 - totalHintsUsed - 1} hints remaining)`,
          });
          return;
        }
      }
    }

    toast({
      title: "No hints needed",
      description: "All available positions are already filled!",
    });
  };

  const resetGame = () => {
    setUserAnswers(Array(5).fill(''));
    setValidatedAnswers(Array(5).fill(false));
    setGameComplete(false);
    setFocusedCell(null);
    setTotalHintsUsed(0);
    setHintsUsedPerWord(Array(5).fill(0));
  };

  const renderLetterBoxes = (wordIndex: number) => {
    const word = gameWords[wordIndex];
    const userAnswer = userAnswers[wordIndex] || '';
    const isValidated = validatedAnswers[wordIndex];
    const boxes = [];
    
    for (let i = 0; i < word.length; i++) {
      const letter = userAnswer[i] || '';
      // Yellow highlight: first box of first row, first two of second row, etc.
      const isHighlighted = i < wordIndex + 1;
      const isFocused = focusedCell?.wordIndex === wordIndex && focusedCell?.letterIndex === i;
      const isCorrect = isValidated && letter === word.answer[i];
      
      boxes.push(
        <input
          key={i}
          ref={(el) => {
            if (inputRefs.current[wordIndex]) {
              inputRefs.current[wordIndex][i] = el;
            }
          }}
          type="text"
          value={letter}
          onChange={(e) => handleLetterInput(wordIndex, i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, wordIndex, i)}
          onFocus={() => setFocusedCell({wordIndex, letterIndex: i})}
          onBlur={() => setFocusedCell(null)}
          className={`
            w-10 h-10 border-2 flex items-center justify-center font-bold text-lg text-center
            ${isHighlighted ? 'bg-yellow-300 border-yellow-400' : 'bg-gray-100 border-gray-300'}
            ${isValidated && !isHighlighted ? 'bg-green-200 border-green-400' : ''}
            ${isCorrect ? 'text-green-800' : ''}
            ${isFocused ? 'ring-2 ring-blue-400' : ''}
            transition-colors duration-200 focus:outline-none
          `}
          maxLength={1}
          disabled={gameComplete}
        />
      );
    }
    
    return boxes;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Cascade</h1>
        <p className="text-gray-600">
          Find synonyms that follow the pattern - each word shares more starting letters with the next!
        </p>
      </div>

      <div className="space-y-6">
        {gameWords.map((word, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-32 text-right font-semibold text-gray-700">
              {word.clue}
            </div>
            
            <div className="flex gap-1 flex-1">
              {renderLetterBoxes(index)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button
          onClick={useHint}
          variant="outline"
          disabled={gameComplete || totalHintsUsed >= 3}
          className="px-6 py-2"
        >
          <HelpCircle className="w-4 h-4 mr-1" />
          Hint ({totalHintsUsed}/3)
        </Button>
        
        <Button 
          onClick={checkAnswers} 
          disabled={gameComplete || userAnswers.some(answer => !answer)}
          className="px-8 py-2"
        >
          Check Answers
        </Button>
        
        <Button 
          onClick={resetGame} 
          variant="outline"
          className="px-8 py-2"
        >
          Reset Game
        </Button>
      </div>

      {gameComplete && (
        <div className="mt-8 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
          <h2 className="text-xl font-bold text-green-800 mb-2">Puzzle Solved!</h2>
          <p className="text-green-700">
            Great job finding all the synonyms in the correct sequence pattern!
          </p>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">How to Play:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Find a synonym for each clue word</li>
          <li>• Each answer must start with the same letters as the previous answer</li>
          <li>• The first answer can start with any letter</li>
          <li>• The second must start with the same first letter</li>
          <li>• The third must start with the same first two letters, and so on</li>
          <li>• Use hints wisely - you only get 3 for the entire puzzle!</li>
        </ul>
      </div>
    </div>
  );
};

export default GameGrid;
