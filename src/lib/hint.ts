import { WordData } from '@/types/game';

// Corrected cascade autofill logic
const cascadeAutofill = (
  answers: string[][],
  letterIndex: number,
  letter: string
) => {
  for (let wordIdx = letterIndex; wordIdx < answers.length; wordIdx++) {
    if (answers[wordIdx] && answers[wordIdx][letterIndex] !== undefined) {
      answers[wordIdx][letterIndex] = letter;
    }
  }
};

// Function to get a hint
export const getHint = (
  userAnswers: string[][],
  gameWords: WordData[],
  validatedAnswers: boolean[],
  yellowHintUsed: boolean
): { newAnswers: string[][]; hintApplied: boolean; wasYellowHint: boolean } => {
  const newAnswers = userAnswers.map(row => [...row]);

  const priorityHints: { wordIndex: number; letterIndex: number }[] = [];
  const regularHints: { wordIndex: number; letterIndex: number }[] = [];

  for (let i = 0; i < gameWords.length; i++) {
    if (validatedAnswers[i]) continue;

    for (let j = 0; j < gameWords[i].answer.length; j++) {
      if (newAnswers[i][j] === '') {
        const isYellowBox = j < i;
        if (isYellowBox) {
          priorityHints.push({ wordIndex: i, letterIndex: j });
        } else {
          regularHints.push({ wordIndex: i, letterIndex: j });
        }
      }
    }
  }

  if (priorityHints.length === 0 && regularHints.length === 0) {
    return { newAnswers, hintApplied: false, wasYellowHint: false };
  }

  let chosenHint: { wordIndex: number; letterIndex: number } | undefined;
  let wasYellowHint = false;

  // Prioritize yellow box hint only if it hasn't been used
  if (priorityHints.length > 0 && !yellowHintUsed) {
    chosenHint = priorityHints[Math.floor(Math.random() * priorityHints.length)];
    wasYellowHint = true;
  } else if (regularHints.length > 0) {
    // Fallback to regular hints
    chosenHint = regularHints[Math.floor(Math.random() * regularHints.length)];
  } else {
    // Or use a yellow hint if it's the only option left
    chosenHint = priorityHints[Math.floor(Math.random() * priorityHints.length)];
    wasYellowHint = true;
  }

  if (!chosenHint) {
    return { newAnswers, hintApplied: false, wasYellowHint: false };
  }

  const { wordIndex, letterIndex } = chosenHint;
  const letterToReveal = gameWords[wordIndex].answer[letterIndex];

  if (wasYellowHint) {
    cascadeAutofill(newAnswers, letterIndex, letterToReveal);
  } else {
    newAnswers[wordIndex][letterIndex] = letterToReveal;
  }

  return { newAnswers, hintApplied: true, wasYellowHint };
};
