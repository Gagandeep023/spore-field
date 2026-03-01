import type { Cell, Coord, CellOwner } from '../types';
import { getNeighbors, cloneGrid } from './grid';
import { MIN_NUTRIENT } from './constants';

interface SpreadClaim {
  row: number;
  col: number;
  owner: CellOwner;
  nutrient: number;
}

/**
 * Run the spread phase. All occupied cells attempt to spread to adjacent empty cells.
 * Higher nutrient cells spread first and win conflicts.
 * Ties result in no claim.
 * After spreading, all nutrient values decay by 1 (min 1).
 */
export function spreadAll(grid: Cell[][]): Cell[][] {
  const newGrid = cloneGrid(grid);
  const gridSize = grid.length;

  // Collect all occupied cells, sorted by nutrient descending
  const occupied: Cell[] = [];
  for (const row of grid) {
    for (const cell of row) {
      if (cell.owner !== null) {
        occupied.push(cell);
      }
    }
  }
  occupied.sort((a, b) => b.nutrient - a.nutrient);

  // Track claims on empty cells: coord key -> best claim(s)
  const claims = new Map<string, SpreadClaim[]>();

  for (const cell of occupied) {
    const neighbors = getNeighbors(cell.row, cell.col, gridSize);
    for (const n of neighbors) {
      // Only spread to cells that are empty in the original grid
      if (grid[n.row][n.col].owner !== null) continue;

      const key = `${n.row},${n.col}`;
      const childNutrient = Math.max(cell.nutrient - 1, MIN_NUTRIENT);
      const claim: SpreadClaim = {
        row: n.row,
        col: n.col,
        owner: cell.owner,
        nutrient: childNutrient,
      };

      const existing = claims.get(key);
      if (!existing) {
        claims.set(key, [claim]);
      } else {
        const bestNutrient = existing[0].nutrient;
        if (childNutrient > bestNutrient) {
          claims.set(key, [claim]);
        } else if (childNutrient === bestNutrient) {
          existing.push(claim);
        }
        // If lower nutrient, ignore
      }
    }
  }

  // Apply claims: only if there's a single owner at the best nutrient level
  for (const [, claimList] of claims) {
    if (claimList.length === 1) {
      const c = claimList[0];
      newGrid[c.row][c.col].owner = c.owner;
      newGrid[c.row][c.col].nutrient = c.nutrient;
    } else {
      // Check if all claims are from the same owner
      const owners = new Set(claimList.map(c => c.owner));
      if (owners.size === 1) {
        const c = claimList[0];
        newGrid[c.row][c.col].owner = c.owner;
        newGrid[c.row][c.col].nutrient = c.nutrient;
      }
      // Different owners at same nutrient = contested, no claim
    }
  }

  // Nutrient decay: all occupied cells lose 1 nutrient (min 1)
  for (const row of newGrid) {
    for (const cell of row) {
      if (cell.owner !== null) {
        cell.nutrient = Math.max(cell.nutrient - 1, MIN_NUTRIENT);
      }
    }
  }

  return newGrid;
}
