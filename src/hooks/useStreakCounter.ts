import { useCallback, useEffect, useState } from 'react';

interface StreakData {
  currentStreak: number;
  maxStreak: number;
  lastGameDate: string;
  lastGameId?: string; // Track which game last contributed to the streak
}

export const useStreakCounter = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lastGameId, setLastGameId] = useState<string>('');
  const storageKey = 'cascade-streak'; // Global streak counter

  // Load streak data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const streakData: StreakData = JSON.parse(savedData);
        setCurrentStreak(streakData.currentStreak || 0);
        setMaxStreak(streakData.maxStreak || 0);
        setLastGameId(streakData.lastGameId || '');
      } catch (error) {
        console.warn('Failed to load streak data:', error);
      }
    }
  }, [storageKey]);

  // Save streak data whenever it changes
  useEffect(() => {
    const today = new Date().toDateString();
    const streakData: StreakData = {
      currentStreak,
      maxStreak,
      lastGameDate: today,
      lastGameId,
    };
    localStorage.setItem(storageKey, JSON.stringify(streakData));
  }, [currentStreak, maxStreak, lastGameId, storageKey]);

  const incrementStreak = useCallback((gameId: string) => {
    // Only increment if this game hasn't already contributed to the current streak
    if (lastGameId !== gameId) {
      setCurrentStreak(prev => {
        const newCurrentStreak = prev + 1;
        setMaxStreak(prevMax => Math.max(prevMax, newCurrentStreak));
        return newCurrentStreak;
      });
      setLastGameId(gameId);
    }
  }, [lastGameId]);

  const resetStreak = useCallback((gameId: string) => {
    setCurrentStreak(0);
    setLastGameId(gameId); // Mark this game as the one that caused the reset
    // Keep maxStreak unchanged
  }, []);

  const hasGameContributedToStreak = useCallback((gameId: string) => {
    return lastGameId === gameId;
  }, [lastGameId]);

  return {
    currentStreak,
    maxStreak,
    incrementStreak,
    resetStreak,
    hasGameContributedToStreak,
  };
}; 