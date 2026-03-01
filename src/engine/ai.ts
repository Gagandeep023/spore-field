import type { Cell, Coord } from '../types';
import { getNeighbors, getEmptyCells, countTerritory } from './grid';
import { BASE_NUTRIENT } from './constants';

/**
 * AI picks the best empty cell to place a spore.
 * Strategy: maximize empty neighbor count (future spread potential)
 * and prefer cells far from player territory.
 */
export function aiPickPlacement(grid: Cell[][]): Coord | null {
  const gridSize = grid.length;
  const emptyCells = getEmptyCells(grid);

  if (emptyCells.length === 0) return null;

  let bestScore = -Infinity;
  let bestCell: Coord = emptyCells[0];

  for (const cell of emptyCells) {
    const neighbors = getNeighbors(cell.row, cell.col, gridSize);

    // Count empty neighbors (future spread potential)
    let emptyNeighborCount = 0;
    let playerNeighborCount = 0;
    let aiNeighborCount = 0;

    for (const n of neighbors) {
      const nCell = grid[n.row][n.col];
      if (nCell.owner === null) emptyNeighborCount++;
      else if (nCell.owner === 'player') playerNeighborCount++;
      else if (nCell.owner === 'ai') aiNeighborCount++;
    }

    // Score: prefer cells with many empty neighbors,
    // some bonus for being near existing AI territory (connectivity),
    // and slight bonus for blocking player expansion
    let score = emptyNeighborCount * 3;
    score += aiNeighborCount * 1; // connectivity bonus
    score += playerNeighborCount * 2; // blocking bonus

    // Prefer cells toward center for better spread
    const centerR = (gridSize - 1) / 2;
    const centerC = (gridSize - 1) / 2;
    const distFromCenter = Math.abs(cell.row - centerR) + Math.abs(cell.col - centerC);
    score -= distFromCenter * 0.3;

    if (score > bestScore) {
      bestScore = score;
      bestCell = cell;
    }
  }

  return bestCell;
}

/**
 * Place an AI spore at the chosen cell.
 */
export function aiPlace(grid: Cell[][]): Cell[][] {
  const target = aiPickPlacement(grid);
  if (!target) return grid;

  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  newGrid[target.row][target.col].owner = 'ai';
  newGrid[target.row][target.col].nutrient = BASE_NUTRIENT;
  return newGrid;
}
