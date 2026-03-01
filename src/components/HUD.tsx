import React from 'react';
import type { GameState } from '../types';
import { getTerritoryPercent } from '../engine/state';

interface HUDProps {
  state: GameState;
  onToggleSacrifice: () => void;
  onShowRules: () => void;
}

export default function HUD({ state, onToggleSacrifice, onShowRules }: HUDProps) {
  const pct = getTerritoryPercent(state);

  return (
    <div className="sf-hud">
      <div className="sf-hud-row">
        <span className="sf-hud-label">Turn {state.turn}</span>
        <button className="sf-btn sf-btn-small" onClick={onShowRules} title="Rules">
          ?
        </button>
      </div>

      <div className="sf-hud-row">
        <span className="sf-hud-territory sf-hud-player">
          You: {pct.player}%
        </span>
        <span className="sf-hud-territory sf-hud-ai">
          AI: {pct.ai}%
        </span>
      </div>

      <div className="sf-hud-row">
        <button
          className={`sf-btn sf-btn-sacrifice ${state.sacrificeMode ? 'sf-btn-active' : ''}`}
          onClick={onToggleSacrifice}
        >
          {state.sacrificeMode ? 'Cancel Sacrifice' : 'Sacrifice Mode'}
        </button>
        {state.nutrientPool > 0 && (
          <span className="sf-hud-nutrient">
            +{state.nutrientPool} nutrient
          </span>
        )}
      </div>

      {state.sacrificeMode && state.sacrificeTargets.length > 0 && (
        <div className="sf-hud-row">
          <span className="sf-hud-label sf-sacrifice-hint">
            {state.sacrificeTargets.length} cell{state.sacrificeTargets.length > 1 ? 's' : ''} selected.
            Tap empty cell to place (sacrifice mode auto-off).
          </span>
        </div>
      )}
    </div>
  );
}
