import React, { useState, useCallback, useRef } from 'react';
import type { SporeFieldProps, GameState } from '../types';
import { createGameState, startGame, toggleSacrificeMode, playerPlace, toggleSacrifice, getTerritoryPercent } from '../engine/state';
import { DEFAULT_GRID_SIZE } from '../engine/constants';
import GameCanvas from './GameCanvas';
import HUD from './HUD';
import Rules from './Rules';
import GameOver from './GameOver';
import { useInput } from '../hooks/useInput';
import { useHighScore } from '../hooks/useHighScore';

export default function SporeFieldGame({ theme = 'dark', onGameOver }: SporeFieldProps) {
  const [state, setStateRaw] = useState<GameState>(() => createGameState(DEFAULT_GRID_SIZE));
  const [showRules, setShowRules] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const { highScore, submitScore } = useHighScore();
  const gameOverFiredRef = useRef(false);

  const setState = useCallback(
    (newState: GameState) => {
      setStateRaw(newState);

      if (newState.phase === 'gameOver' && !gameOverFiredRef.current) {
        gameOverFiredRef.current = true;
        const pct = getTerritoryPercent(newState);

        if (newState.winner === 'player') {
          const isNew = submitScore(pct.player, newState.turn - 1);
          setIsNewHighScore(isNew);
        }

        onGameOver?.({
          winner: newState.winner!,
          playerPercent: pct.player,
          aiPercent: pct.ai,
          turns: newState.turn - 1,
        });
      }
    },
    [onGameOver, submitScore],
  );

  const { handleCellClick } = useInput({ state, setState });

  const handleStart = useCallback(() => {
    setState(startGame(state));
  }, [state, setState]);

  const handleToggleSacrifice = useCallback(() => {
    setState(toggleSacrificeMode(state));
  }, [state, setState]);

  const handleShowRules = useCallback(() => {
    setShowRules(true);
  }, []);

  const handleRetry = useCallback(() => {
    gameOverFiredRef.current = false;
    setIsNewHighScore(false);
    const fresh = createGameState(DEFAULT_GRID_SIZE);
    setStateRaw(startGame(fresh));
  }, []);

  return (
    <div className={`sf-game sf-theme-${theme}`}>
      {state.phase === 'rules' && <Rules onStart={handleStart} />}

      {state.phase !== 'rules' && (
        <>
          <HUD
            state={state}
            onToggleSacrifice={handleToggleSacrifice}
            onShowRules={handleShowRules}
          />
          <GameCanvas state={state} onCellClick={handleCellClick} />
        </>
      )}

      {state.phase === 'gameOver' && (
        <GameOver
          state={state}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          onRetry={handleRetry}
        />
      )}

      {showRules && state.phase !== 'rules' && (
        <div className="sf-rules-overlay" onClick={() => setShowRules(false)}>
          <div className="sf-rules-content" onClick={e => e.stopPropagation()}>
            <h2 className="sf-rules-title">Rules</h2>
            <ol className="sf-rules-list">
              <li>Tap an empty cell to place a spore.</li>
              <li>After both you and the AI place, all spores spread to adjacent empty cells.</li>
              <li>Higher-nutrient spores spread first and win conflicts.</li>
              <li>Sacrifice your own cells to boost your next placement's nutrient level.</li>
              <li>If the AI controls 70% of the field, you lose instantly.</li>
            </ol>
            <button className="sf-btn sf-btn-primary" onClick={() => setShowRules(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
