import type { Cell, Coord } from '../types';

/**
 * Create a grid of empty cells.
 */
export function createGrid(size: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < size; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < size; c++) {
      row.push({ row: r, col: c, owner: null, nutrient: 0 });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Get hex-like neighbors using offset coordinates.
 * Even rows: neighbors are (r-1,c-1),(r-1,c),(r,c-1),(r,c+1),(r+1,c-1),(r+1,c)
 * Odd rows:  neighbors are (r-1,c),(r-1,c+1),(r,c-1),(r,c+1),(r+1,c),(r+1,c+1)
 */
export function getNeighbors(row: number, col: number, gridSize: number): Coord[] {
  const isEvenRow = row % 2 === 0;

  const offsets: [number, number][] = isEvenRow
    ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
    : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];

  const neighbors: Coord[] = [];
  for (const [dr, dc] of offsets) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
      neighbors.push({ row: nr, col: nc });
    }
  }
  return neighbors;
}

/**
 * Deep clone a grid.
 */
export function cloneGrid(grid: Cell[][]): Cell[][] {
  return grid.map(row => row.map(cell => ({ ...cell })));
}

/**
 * Count cells owned by a given owner.
 */
export function countTerritory(grid: Cell[][], owner: 'player' | 'ai'): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.owner === owner) count++;
    }
  }
  return count;
}

/**
 * Count total occupied cells.
 */
export function countOccupied(grid: Cell[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.owner !== null) count++;
    }
  }
  return count;
}

/**
 * Get all empty cells.
 */
export function getEmptyCells(grid: Cell[][]): Coord[] {
  const empty: Coord[] = [];
  for (const row of grid) {
    for (const cell of row) {
      if (cell.owner === null) {
        empty.push({ row: cell.row, col: cell.col });
      }
    }
  }
  return empty;
}
