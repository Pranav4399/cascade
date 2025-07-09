import { Button } from '@/components/ui/button';
import gameDataArray from '@/data/gameWords.json';
import { generatePuzzle } from '@/lib/puzzle';
import { Difficulty, WordData } from '@/types/game';
import { useEffect, useState } from 'react';

interface Puzzle {
  id: number;
  date: string;
  words: WordData[];
}

const PuzzleGenerator = () => {
  const [dictionary, setDictionary] = useState<Record<string, string> | null>(null);
  const [frequencyMap, setFrequencyMap] = useState<Map<string, number>>(new Map());
  const [generatedPuzzle, setGeneratedPuzzle] = useState<WordData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/dictionary.json').then(res => res.json()),
      fetch('/word-frequency.json').then(res => res.json())
    ]).then(([dict, freqData]) => {
      setDictionary(dict);
      const freqMap = new Map<string, number>();
      // The data is an array of [word, logFrequency]
      freqData.forEach((item: [string, number], index: number) => {
        // We use the index as the rank, since the list is pre-sorted by frequency
        freqMap.set(item[0].toLowerCase(), index);
      });
      setFrequencyMap(freqMap);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError('Failed to load dictionary or frequency list.');
      setLoading(false);
    });
  }, []);

  const handleGeneratePuzzle = () => {
    if (!dictionary || frequencyMap.size === 0) {
      setError("Dictionary or frequency list not loaded yet.");
      return;
    }
    setLoading(true);
    setError(null);
    setGeneratedPuzzle(null);
    setIsCopied(false); // Reset copied state on new puzzle

    setTimeout(() => {
      try {
        const puzzle = generatePuzzle(dictionary, frequencyMap, difficulty);

        if (puzzle) {
          setGeneratedPuzzle(puzzle);
        } else {
          setError(`Could not generate a unique puzzle for "${difficulty}" difficulty. Please try another difficulty or generate again.`);
        }
      } catch (e) {
        setError('An unexpected error occurred during puzzle generation.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 10);
  };

  const copyJsonToClipboard = () => {
    if (!generatedPuzzle || isCopied) return;

    const newPuzzleData: Puzzle = {
      id: gameDataArray.length + 1,
      date: new Date().toISOString().split('T')[0],
      words: generatedPuzzle,
    };

    const jsonString = JSON.stringify(newPuzzleData, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  if (loading && !dictionary) {
    return (
      <div className="p-6 text-center">
        <p className="game-text-primary text-lg">Loading dictionary...</p>
        <p className="game-text-secondary text-sm">This may take a moment.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold game-text-primary mb-4 sm:mb-0">
          Puzzle Generator
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <Button onClick={handleGeneratePuzzle} disabled={loading || !dictionary}>
            {loading ? 'Generating...' : 'Generate New Puzzle'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {generatedPuzzle && (
        <div className="mt-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold game-text-primary mb-2">
              Generated Puzzle
            </h3>
            <div className="space-y-2">
              {generatedPuzzle.map((word, index) => (
                <div key={index} className="flex items-center">
                  <span className="font-mono p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                    {word.answer}
                  </span>
                  <span className="mx-2 game-text-secondary">-</span>
                  <span className="game-text-secondary italic">
                    {word.clue}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold game-text-primary">
                JSON Output
              </h3>
              <Button variant="ghost" size="sm" onClick={copyJsonToClipboard} disabled={isCopied}>
                {isCopied ? 'Copied!' : 'Copy JSON'}
              </Button>
            </div>
            <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md text-sm overflow-x-auto">
              <code>
                {JSON.stringify(
                  {
                    id: gameDataArray.length + 1,
                    date: new Date().toISOString().split('T')[0],
                    words: generatedPuzzle,
                  },
                  null,
                  2
                )}
              </code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuzzleGenerator;
