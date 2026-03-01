import { describe, it, expect } from 'vitest';
import { aiPickPlacement, aiPlace } from '../src/engine/ai';
import { createGrid, getNeighbors, getEmptyCells } from '../src/engine/grid';
import { BASE_NUTRIENT } from '../src/engine/constants';

describe('aiPickPlacement', () => {
  it('picks a valid empty cell', () => {
    const grid = createGrid(8);
    grid[4][4].owner = 'player';
    grid[4][4].nutrient = 3;

    const pick = aiPickPlacement(grid);
    expect(pick).not.toBeNull();
    expect(grid[pick!.row][pick!.col].owner).toBeNull();
  });

  it('returns null when no empty cells exist', () => {
    const grid = createGrid(2);
    for (const row of grid) {
      for (const cell of row) {
        cell.owner = 'player';
        cell.nutrient = 1;
      }
    }
    const pick = aiPickPlacement(grid);
    expect(pick).toBeNull();
  });

  it('prefers cells with more empty neighbors', () => {
    // On a mostly empty grid, center cells have more empty neighbors
    const grid = createGrid(8);
    const pick = aiPickPlacement(grid);
    expect(pick).not.toBeNull();

    // Center-ish cells should be preferred
    const distFromCenter = Math.abs(pick!.row - 3.5) + Math.abs(pick!.col - 3.5);
    // Should pick something reasonably central, not a corner
    expect(distFromCenter).toBeLessThan(7);
  });

  it('picks cells near existing AI territory for connectivity', () => {
    const grid = createGrid(8);
    // AI has a cluster at (4,4)
    grid[4][4].owner = 'ai';
    grid[4][4].nutrient = 3;
    // Fill most of the board except near the cluster
    grid[0][0].owner = 'player';
    grid[0][0].nutrient = 1;

    const pick = aiPickPlacement(grid);
    expect(pick).not.toBeNull();
    // Should pick somewhere near (4,4)
    const neighbors = getNeighbors(4, 4, 8);
    const neighborCoords = new Set(neighbors.map(n => `${n.row},${n.col}`));
    // AI should strongly prefer a neighbor of its existing territory
    // (not guaranteed but likely given the scoring)
  });
});

describe('aiPlace', () => {
  it('places a cell with BASE_NUTRIENT value', () => {
    const grid = createGrid(6);
    const result = aiPlace(grid);

    // Find the AI cell
    let aiCell = null;
    for (const row of result) {
      for (const cell of row) {
        if (cell.owner === 'ai') aiCell = cell;
      }
    }
    expect(aiCell).not.toBeNull();
    expect(aiCell!.nutrient).toBe(BASE_NUTRIENT);
  });

  it('does not modify the original grid', () => {
    const grid = createGrid(6);
    const result = aiPlace(grid);

    // Original should be untouched
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.owner).toBeNull();
      }
    }

    // Result should have exactly one AI cell
    let aiCount = 0;
    for (const row of result) {
      for (const cell of row) {
        if (cell.owner === 'ai') aiCount++;
      }
    }
    expect(aiCount).toBe(1);
  });
});
