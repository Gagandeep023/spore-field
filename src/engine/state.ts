import type { Cell, Coord, GameState, GamePhase } from '../types';
import { createGrid, cloneGrid, countTerritory, countOccupied, getEmptyCells } from './grid';
import { spreadAll } from './spread';
import { aiPlace } from './ai';
import {
  DEFAULT_GRID_SIZE,
  BASE_NUTRIENT,
  AI_INSTANT_WIN_THRESHOLD,
  FIELD_FULL_THRESHOLD,
} from './constants';

/**
 * Create a fresh game state.
 */
export function createGameState(gridSize: number = DEFAULT_GRID_SIZE): GameState {
  const grid = createGrid(gridSize);
  const totalCells = gridSize * gridSize;

  return {
    grid,
    gridSize,
    phase: 'rules',
    turn: 0,
    playerTerritory: 0,
    aiTerritory: 0,
    totalCells,
    sacrificeMode: false,
    sacrificeTargets: [],
    nutrientPool: 0,
    winner: null,
    spreadAnimProgress: 0,
  };
}

/**
 * Start the game (transition from rules to placing).
 */
export function startGame(state: GameState): GameState {
  return { ...state, phase: 'placing', turn: 1 };
}

/**
 * Toggle sacrifice mode.
 */
export function toggleSacrificeMode(state: GameState): GameState {
  if (state.phase !== 'placing') return state;
  return {
    ...state,
    sacrificeMode: !state.sacrificeMode,
    // Clear sacrifice targets when turning off
    ...(state.sacrificeMode ? { sacrificeTargets: [], nutrientPool: 0 } : {}),
  };
}

/**
 * Toggle a cell for sacrifice (must be a player-owned cell).
 */
export function toggleSacrifice(state: GameState, row: number, col: number): GameState {
  if (state.phase !== 'placing' || !state.sacrificeMode) return state;

  const cell = state.grid[row]?.[col];
  if (!cell || cell.owner !== 'player') return state;

  const existing = state.sacrificeTargets.findIndex(t => t.row === row && t.col === col);
  if (existing >= 0) {
    // Remove from sacrifice
    const newTargets = [...state.sacrificeTargets];
    newTargets.splice(existing, 1);
    const removedNutrient = cell.nutrient;
    return {
      ...state,
      sacrificeTargets: newTargets,
      nutrientPool: state.nutrientPool - removedNutrient,
    };
  } else {
    // Add to sacrifice
    return {
      ...state,
      sacrificeTargets: [...state.sacrificeTargets, { row, col }],
      nutrientPool: state.nutrientPool + cell.nutrient,
    };
  }
}

/**
 * Player places a spore at the given empty cell.
 * Applies sacrifice bonus. Then AI places. Then spread runs.
 * Returns the new state after everything resolves.
 */
export function playerPlace(state: GameState, row: number, col: number): GameState {
  if (state.phase !== 'placing') return state;

  const cell = state.grid[row]?.[col];
  if (!cell || cell.owner !== null) return state;

  // Clone grid
  let newGrid = cloneGrid(state.grid);

  // Apply sacrifices: clear sacrificed cells
  for (const target of state.sacrificeTargets) {
    newGrid[target.row][target.col].owner = null;
    newGrid[target.row][target.col].nutrient = 0;
  }

  // Place player spore with nutrient = base + sacrifice pool
  const nutrient = BASE_NUTRIENT + state.nutrientPool;
  newGrid[row][col].owner = 'player';
  newGrid[row][col].nutrient = nutrient;

  // AI places
  newGrid = aiPlace(newGrid);

  // Spread phase
  newGrid = spreadAll(newGrid);

  // Calculate territory
  const playerTerritory = countTerritory(newGrid, 'player');
  const aiTerritory = countTerritory(newGrid, 'ai');
  const occupied = countOccupied(newGrid);
  const totalCells = state.totalCells;

  // Check win/lose conditions
  const aiPercent = aiTerritory / totalCells;
  const fieldFullPercent = occupied / totalCells;

  let phase: GamePhase = 'placing';
  let winner: 'player' | 'ai' | null = null;

  // AI instant win at 70%
  if (aiPercent >= AI_INSTANT_WIN_THRESHOLD) {
    phase = 'gameOver';
    winner = 'ai';
  }
  // Field 90%+ full
  else if (fieldFullPercent >= FIELD_FULL_THRESHOLD) {
    phase = 'gameOver';
    winner = playerTerritory > aiTerritory ? 'player' : 'ai';
  }
  // No empty cells left
  else if (getEmptyCells(newGrid).length === 0) {
    phase = 'gameOver';
    winner = playerTerritory > aiTerritory ? 'player' : 'ai';
  }

  return {
    ...state,
    grid: newGrid,
    phase,
    turn: state.turn + 1,
    playerTerritory,
    aiTerritory,
    sacrificeMode: false,
    sacrificeTargets: [],
    nutrientPool: 0,
    winner,
    spreadAnimProgress: 0,
  };
}

/**
 * Calculate territory percentages.
 */
export function getTerritoryPercent(state: GameState): { player: number; ai: number } {
  const total = state.totalCells;
  return {
    player: total > 0 ? Math.round((state.playerTerritory / total) * 100) : 0,
    ai: total > 0 ? Math.round((state.aiTerritory / total) * 100) : 0,
  };
}
