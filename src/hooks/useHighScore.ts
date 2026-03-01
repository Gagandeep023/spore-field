import { useState, useCallback } from 'react';
import type { HighScore } from '../types';

const STORAGE_KEY = 'spore-field-highscore';

function loadHighScore(): HighScore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HighScore;
  } catch {
    return null;
  }
}

function saveHighScore(score: HighScore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch {
    // localStorage unavailable
  }
}

export function useHighScore() {
  const [highScore, setHighScore] = useState<HighScore | null>(loadHighScore);

  const submitScore = useCallback((territory: number, turns: number) => {
    const newScore: HighScore = {
      territory,
      turns,
      date: new Date().toISOString(),
    };

    const current = loadHighScore();
    if (!current || territory > current.territory) {
      saveHighScore(newScore);
      setHighScore(newScore);
      return true; // new high score
    }
    return false;
  }, []);

  return { highScore, submitScore };
}
