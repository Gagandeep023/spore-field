import { useCallback } from 'react';
import type { GameState, Coord } from '../types';
import { playerPlace, toggleSacrifice } from '../engine/state';

interface UseInputOptions {
  state: GameState;
  setState: (state: GameState) => void;
}

export function useInput({ state, setState }: UseInputOptions) {
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (state.phase !== 'placing') return;

      const cell = state.grid[row]?.[col];
      if (!cell) return;

      if (state.sacrificeMode) {
        // In sacrifice mode, tapping own cells toggles sacrifice
        if (cell.owner === 'player') {
          setState(toggleSacrifice(state, row, col));
        }
        // Tapping empty cell in sacrifice mode does nothing
        return;
      }

      // Normal mode: tap empty cell to place
      if (cell.owner === null) {
        setState(playerPlace(state, row, col));
      }
    },
    [state, setState],
  );

  return { handleCellClick };
}
