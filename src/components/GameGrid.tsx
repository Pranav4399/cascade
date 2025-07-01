
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

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
  const [submittedAnswers, setSubmittedAnswers] = useState<string[]>(Array(5).fill(''));
  const [gameComplete, setGameComplete] = useState(false);

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value.toUpperCase();
    setUserAnswers(newAnswers);
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
      toast({
        title: "Congratulations!",
        description: "You've solved the puzzle perfectly!",
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
    
    setSubmittedAnswers([...userAnswers]);
  };

  const resetGame = () => {
    setUserAnswers(Array(5).fill(''));
    setSubmittedAnswers(Array(5).fill(''));
    setGameComplete(false);
  };

  const renderLetterBoxes = (wordIndex: number) => {
    const word = gameWords[wordIndex];
    const userAnswer = submittedAnswers[wordIndex] || '';
    const boxes = [];
    
    for (let i = 0; i < word.length; i++) {
      const letter = userAnswer[i] || '';
      const isCorrect = letter === word.answer[i];
      const isHighlighted = i < wordIndex; // Highlight shared prefix letters
      
      boxes.push(
        <div
          key={i}
          className={`
            w-10 h-10 border-2 flex items-center justify-center font-bold text-lg
            ${isHighlighted ? 'bg-yellow-300 border-yellow-400' : 'bg-gray-100 border-gray-300'}
            ${submittedAnswers[wordIndex] && isCorrect ? 'bg-green-200 border-green-400' : ''}
            ${submittedAnswers[wordIndex] && !isCorrect && letter ? 'bg-red-200 border-red-400' : ''}
            transition-colors duration-200
          `}
        >
          {letter}
        </div>
      );
    }
    
    return boxes;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Synonym Sequence</h1>
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
            
            <div className="flex gap-1">
              {renderLetterBoxes(index)}
            </div>
            
            <Input
              value={userAnswers[index]}
              onChange={(e) => handleInputChange(index, e.target.value)}
              placeholder={`${word.length} letters`}
              className="w-40"
              disabled={gameComplete}
              maxLength={word.length}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-8">
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
        </ul>
      </div>
    </div>
  );
};

export default GameGrid;
