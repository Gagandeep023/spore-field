export type CellOwner = 'player' | 'ai' | null;

export interface Cell {
  row: number;
  col: number;
  owner: CellOwner;
  nutrient: number;
}

export interface Coord {
  row: number;
  col: number;
}

export type GamePhase = 'rules' | 'placing' | 'spreading' | 'gameOver';

export interface GameState {
  grid: Cell[][];
  gridSize: number;
  phase: GamePhase;
  turn: number;
  playerTerritory: number;
  aiTerritory: number;
  totalCells: number;
  sacrificeMode: boolean;
  sacrificeTargets: Coord[];
  nutrientPool: number;
  winner: 'player' | 'ai' | null;
  spreadAnimProgress: number;
}

export interface SporeFieldProps {
  theme?: 'dark' | 'light';
  onGameOver?: (result: { winner: 'player' | 'ai'; playerPercent: number; aiPercent: number; turns: number }) => void;
}

export interface HighScore {
  territory: number;
  turns: number;
  date: string;
}
