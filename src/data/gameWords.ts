import { GameData, GameDataArray, WordData } from '@/types/game';
import gameDataArray from './gameWords.json';

// Import the full array of game data
const gameData: GameDataArray = gameDataArray;

// Function to get today's game data based on current date
const getCurrentGameData = (): GameData => {
  const today = new Date();
  // Use local date instead of UTC to avoid timezone issues
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`; // Format: YYYY-MM-DD
  
  // Find the game that matches today's date
  const todaysGame = gameData.find(game => game.date === todayString);
  
  // If no game found for today, return the first available game as fallback
  return todaysGame || gameData[0];
};

// Export just the words array for backward compatibility
export const gameWords: WordData[] = getCurrentGameData().words; 