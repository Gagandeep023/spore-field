import React from 'react';
import type { GameState, HighScore } from '../types';
import { getTerritoryPercent } from '../engine/state';

interface GameOverProps {
  state: GameState;
  highScore: HighScore | null;
  isNewHighScore: boolean;
  onRetry: () => void;
}

export default function GameOver({ state, highScore, isNewHighScore, onRetry }: GameOverProps) {
  const pct = getTerritoryPercent(state);
  const won = state.winner === 'player';

  return (
    <div className="sf-gameover-overlay">
      <div className="sf-gameover-content">
        <h1 className={`sf-gameover-title ${won ? 'sf-win' : 'sf-lose'}`}>
          {won ? 'Field Conquered' : 'Overrun'}
        </h1>

        <div className="sf-gameover-stats">
          <div className="sf-stat">
            <span className="sf-stat-label">Your Territory</span>
            <span className="sf-stat-value sf-hud-player">{pct.player}%</span>
          </div>
          <div className="sf-stat">
            <span className="sf-stat-label">AI Territory</span>
            <span className="sf-stat-value sf-hud-ai">{pct.ai}%</span>
          </div>
          <div className="sf-stat">
            <span className="sf-stat-label">Turns</span>
            <span className="sf-stat-value">{state.turn - 1}</span>
          </div>
        </div>

        {isNewHighScore && (
          <p className="sf-gameover-highscore">New High Score!</p>
        )}

        {highScore && !isNewHighScore && (
          <p className="sf-gameover-best">
            Best: {highScore.territory}% territory
          </p>
        )}

        <button className="sf-btn sf-btn-primary" onClick={onRetry}>
          Play Again
        </button>
      </div>
    </div>
  );
}
