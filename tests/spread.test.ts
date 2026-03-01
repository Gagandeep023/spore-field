import { describe, it, expect } from 'vitest';
import { spreadAll } from '../src/engine/spread';
import { createGrid, getNeighbors } from '../src/engine/grid';

describe('spreadAll', () => {
  it('spreads to adjacent empty cells', () => {
    const grid = createGrid(6);
    grid[3][3].owner = 'player';
    grid[3][3].nutrient = 3;

    const result = spreadAll(grid);

    // The center cell should still be player-owned
    expect(result[3][3].owner).toBe('player');

    // At least some neighbors should now be player-owned
    const neighbors = getNeighbors(3, 3, 6);
    const claimed = neighbors.filter(n => result[n.row][n.col].owner === 'player');
    expect(claimed.length).toBeGreaterThan(0);
  });

  it('higher nutrient spreads first and wins conflicts', () => {
    // Place a player cell with high nutrient and an AI cell with low nutrient
    // pointing at the same empty cell
    const grid = createGrid(6);
    grid[2][2].owner = 'player';
    grid[2][2].nutrient = 5;
    grid[2][4].owner = 'ai';
    grid[2][4].nutrient = 2;

    const result = spreadAll(grid);

    // Cell (2,3) is neighbor to both on even row.
    // Player nutrient 5 -> child nutrient 4
    // AI nutrient 2 -> child nutrient 1
    // Player should win (2,3)
    expect(result[2][3].owner).toBe('player');
  });

  it('ties result in no claim when different owners', () => {
    const grid = createGrid(6);
    // Place two cells with same nutrient on opposite sides of an empty cell
    // Row 2 is even: neighbors of (2,2) include (2,1) and (2,3)
    grid[2][1].owner = 'player';
    grid[2][1].nutrient = 3;
    grid[2][3].owner = 'ai';
    grid[2][3].nutrient = 3;

    const result = spreadAll(grid);

    // (2,2) is a neighbor of both (2,1) and (2,3) on even row
    // Both produce child nutrient 2 -> tie -> no claim
    expect(result[2][2].owner).toBeNull();
  });

  it('same owner tie resolves in favor of that owner', () => {
    const grid = createGrid(6);
    // Two player cells next to the same empty cell
    grid[2][1].owner = 'player';
    grid[2][1].nutrient = 3;
    grid[2][3].owner = 'player';
    grid[2][3].nutrient = 3;

    const result = spreadAll(grid);

    // (2,2) is neighbor of both, same owner -> should be claimed
    expect(result[2][2].owner).toBe('player');
  });

  it('nutrient decays by 1 after spreading (min 1)', () => {
    const grid = createGrid(4);
    grid[2][2].owner = 'player';
    grid[2][2].nutrient = 3;

    const result = spreadAll(grid);

    // Original cell nutrient should decay: 3 -> 2
    expect(result[2][2].nutrient).toBe(2);
  });

  it('nutrient does not decay below 1', () => {
    const grid = createGrid(4);
    grid[2][2].owner = 'player';
    grid[2][2].nutrient = 1;

    const result = spreadAll(grid);
    expect(result[2][2].nutrient).toBe(1);
  });

  it('child cells have parent nutrient - 1', () => {
    const grid = createGrid(6);
    grid[3][3].owner = 'player';
    grid[3][3].nutrient = 4;

    const result = spreadAll(grid);

    const neighbors = getNeighbors(3, 3, 6);
    for (const n of neighbors) {
      if (result[n.row][n.col].owner === 'player' && !(n.row === 3 && n.col === 3)) {
        // Child nutrient = 4-1=3, then decay -> 2
        expect(result[n.row][n.col].nutrient).toBe(2);
      }
    }
  });

  it('does not spread to already occupied cells', () => {
    const grid = createGrid(6);
    grid[3][3].owner = 'player';
    grid[3][3].nutrient = 3;
    // Occupy a neighbor
    const neighbors = getNeighbors(3, 3, 6);
    grid[neighbors[0].row][neighbors[0].col].owner = 'ai';
    grid[neighbors[0].row][neighbors[0].col].nutrient = 2;

    const result = spreadAll(grid);

    // The AI cell should remain AI
    expect(result[neighbors[0].row][neighbors[0].col].owner).toBe('ai');
  });
});
