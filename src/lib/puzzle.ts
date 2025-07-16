import { Difficulty, WordData } from '@/types/game';

// --- Helper Functions ---
const shuffleArray = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const findCascade = (
  currentChain: WordData[],
  usedAnswers: Set<string>,
  dictionary: Record<string, string>,
  allWords: string[]
): WordData[] | null => {
  if (currentChain.length === 5) {
    return currentChain;
  }

  const lastAnswer = currentChain[currentChain.length - 1].answer;
  const prefix = lastAnswer.substring(0, currentChain.length).toLowerCase();

  const potentialWords = allWords.filter(w =>
    w.toLowerCase().startsWith(prefix) &&
    !usedAnswers.has(w.toUpperCase()) &&
    w.length > prefix.length
  );

  shuffleArray(potentialWords);

  for (const word of potentialWords.slice(0, 20)) { // Try first 20 shuffled matches
    const newWord: WordData = {
      clue: dictionary[word],
      answer: word.toUpperCase(),
    };

    const newUsedAnswers = new Set(usedAnswers);
    newUsedAnswers.add(newWord.answer);

    const result = findCascade([...currentChain, newWord], newUsedAnswers, dictionary, allWords);
    if (result) return result;
  }

  return null;
};

export const generatePuzzle = (
    dictionary: Record<string, string>,
    frequencyMap: Map<string, number>,
    difficulty: Difficulty
): WordData[] | null => {
    const allWords = Object.keys(dictionary);
    let wordPool: string[];

    // The frequencyMap now stores rank (index) directly.
    // Lower rank = more frequent.
    switch (difficulty) {
        case 'easy':
            wordPool = allWords.filter(word => {
                const rank = frequencyMap.get(word.toLowerCase());
                return rank !== undefined && rank < 5000 && word.length >= 4 && word.length <= 6;
            });
            break;
        case 'medium':
            wordPool = allWords.filter(word => {
                const rank = frequencyMap.get(word.toLowerCase());
                return rank !== undefined && rank < 15000 && word.length >= 4 && word.length <= 8;
            });
            break;
        case 'hard':
        default:
            wordPool = allWords.filter(word => word.length >= 4);
            break;
    }

    if (wordPool.length < 50) {
        console.warn(`Warning: Word pool for "${difficulty}" is small (${wordPool.length} words). Puzzle generation may fail or be slow.`);
        if (wordPool.length < 5) return null;
    }

    for (let i = 0; i < 1000; i++) { 
        const startWord = wordPool[Math.floor(Math.random() * wordPool.length)];
        
        if (!startWord) continue;

        const firstWord: WordData = {
            clue: dictionary[startWord],
            answer: startWord.toUpperCase(),
        };

        const usedAnswers = new Set([firstWord.answer]);
        const result = findCascade([firstWord], usedAnswers, dictionary, wordPool);

        if (result) {
            return result;
        }
    }

    return null;
};
