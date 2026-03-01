import { describe, it, expect } from 'vitest';
import { createGrid, getNeighbors, cloneGrid, countTerritory, countOccupied, getEmptyCells } from '../src/engine/grid';

describe('createGrid', () => {
  it('creates a grid with the correct dimensions', () => {
    const grid = createGrid(12);
    expect(grid.length).toBe(12);
    expect(grid[0].length).toBe(12);
  });

  it('all cells start empty with 0 nutrient', () => {
    const grid = createGrid(8);
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.owner).toBeNull();
        expect(cell.nutrient).toBe(0);
      }
    }
  });

  it('cells have correct row and col values', () => {
    const grid = createGrid(4);
    expect(grid[2][3].row).toBe(2);
    expect(grid[2][3].col).toBe(3);
  });
});

describe('getNeighbors', () => {
  it('returns 6 neighbors for an interior cell on an even row', () => {
    const neighbors = getNeighbors(4, 4, 12);
    expect(neighbors.length).toBe(6);
  });

  it('returns 6 neighbors for an interior cell on an odd row', () => {
    const neighbors = getNeighbors(5, 5, 12);
    expect(neighbors.length).toBe(6);
  });

  it('returns fewer neighbors for a corner cell (0,0)', () => {
    const neighbors = getNeighbors(0, 0, 12);
    // Even row, col 0: offsets (-1,-1),(−1,0) are out of bounds for row, (0,-1) out for col
    // Valid: (0,1), (1,-1) invalid, (1,0) valid
    expect(neighbors.length).toBeLessThan(6);
    expect(neighbors.length).toBeGreaterThan(0);
  });

  it('returns fewer neighbors for bottom-right corner', () => {
    const neighbors = getNeighbors(11, 11, 12);
    expect(neighbors.length).toBeLessThan(6);
    expect(neighbors.length).toBeGreaterThan(0);
  });

  it('neighbor coordinates are within grid bounds', () => {
    const size = 10;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const neighbors = getNeighbors(r, c, size);
        for (const n of neighbors) {
          expect(n.row).toBeGreaterThanOrEqual(0);
          expect(n.row).toBeLessThan(size);
          expect(n.col).toBeGreaterThanOrEqual(0);
          expect(n.col).toBeLessThan(size);
        }
      }
    }
  });
});

describe('cloneGrid', () => {
  it('produces a deep copy', () => {
    const grid = createGrid(4);
    grid[1][2].owner = 'player';
    grid[1][2].nutrient = 3;
    const clone = cloneGrid(grid);
    clone[1][2].owner = 'ai';
    expect(grid[1][2].owner).toBe('player');
  });
});

describe('countTerritory', () => {
  it('counts player and ai cells correctly', () => {
    const grid = createGrid(4);
    grid[0][0].owner = 'player';
    grid[0][1].owner = 'player';
    grid[1][0].owner = 'ai';
    expect(countTerritory(grid, 'player')).toBe(2);
    expect(countTerritory(grid, 'ai')).toBe(1);
  });
});

describe('countOccupied', () => {
  it('counts all non-null cells', () => {
    const grid = createGrid(4);
    grid[0][0].owner = 'player';
    grid[1][1].owner = 'ai';
    expect(countOccupied(grid)).toBe(2);
  });
});

describe('getEmptyCells', () => {
  it('returns all empty cells', () => {
    const grid = createGrid(3);
    grid[0][0].owner = 'player';
    const empty = getEmptyCells(grid);
    expect(empty.length).toBe(8);
  });
});
