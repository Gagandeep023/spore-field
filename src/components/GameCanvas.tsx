import React, { useRef, useEffect, useCallback } from 'react';
import type { GameState, Coord } from '../types';
import { getNeighbors } from '../engine/grid';
import { COLORS } from '../engine/constants';

interface GameCanvasProps {
  state: GameState;
  onCellClick: (row: number, col: number) => void;
}

// Flat-top hexagon geometry helpers
function hexCorner(cx: number, cy: number, size: number, i: number): [number, number] {
  const angle = (Math.PI / 180) * (60 * i);
  return [cx + size * Math.cos(angle), cy + size * Math.sin(angle)];
}

function hexCenter(row: number, col: number, hexSize: number, offsetX: number, offsetY: number): [number, number] {
  const w = hexSize * 2;
  const h = Math.sqrt(3) * hexSize;
  const x = offsetX + col * (w * 0.75) + hexSize;
  const y = offsetY + row * h + h / 2 + (col % 2 === 1 ? h / 2 : 0);
  return [x, y];
}

function drawHex(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const [x, y] = hexCorner(cx, cy, size, i);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function cellColor(owner: 'player' | 'ai' | null, nutrient: number): string {
  if (owner === null) return COLORS.empty;
  const base = owner === 'player' ? COLORS.player : COLORS.ai;
  // Adjust alpha-like intensity based on nutrient (1-6 range typically)
  const intensity = Math.min(nutrient / 6, 1);
  const minOpacity = 0.3;
  const opacity = minOpacity + (1 - minOpacity) * intensity;
  return applyOpacity(base, opacity);
}

function applyOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Blend with dark background
  const bgR = 10, bgG = 10, bgB = 10;
  const finalR = Math.round(bgR + (r - bgR) * opacity);
  const finalG = Math.round(bgG + (g - bgG) * opacity);
  const finalB = Math.round(bgB + (b - bgB) * opacity);
  return `rgb(${finalR},${finalG},${finalB})`;
}

export default function GameCanvas({ state, onCellClick }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getHexSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 20;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const maxW = w / (state.gridSize * 1.5 + 0.5);
    const maxH = h / ((state.gridSize + 0.5) * Math.sqrt(3));
    return Math.floor(Math.min(maxW, maxH, 30));
  }, [state.gridSize]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hexSize = getHexSize();
    const hexH = Math.sqrt(3) * hexSize;
    const hexW = hexSize * 2;

    const totalW = state.gridSize * (hexW * 0.75) + hexW * 0.25 + 20;
    const totalH = (state.gridSize + 0.5) * hexH + 20;

    canvas.width = totalW;
    canvas.height = totalH;

    const offsetX = 10;
    const offsetY = 10;

    // Clear
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sacrificeSet = new Set(
      state.sacrificeTargets.map((t: Coord) => `${t.row},${t.col}`)
    );

    // Draw cells
    for (let r = 0; r < state.gridSize; r++) {
      for (let c = 0; c < state.gridSize; c++) {
        const cell = state.grid[r][c];
        const [cx, cy] = hexCenter(r, c, hexSize, offsetX, offsetY);

        // Fill
        drawHex(ctx, cx, cy, hexSize - 1);
        ctx.fillStyle = cellColor(cell.owner, cell.nutrient);
        ctx.fill();

        // Border
        drawHex(ctx, cx, cy, hexSize - 1);
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 1;

        // Contested border: bright where player and AI territories touch
        if (cell.owner !== null) {
          const neighbors = getNeighbors(r, c, state.gridSize);
          const hasEnemy = neighbors.some(n => {
            const nc = state.grid[n.row][n.col];
            return nc.owner !== null && nc.owner !== cell.owner;
          });
          if (hasEnemy) {
            ctx.strokeStyle = COLORS.contested;
            ctx.lineWidth = 2;
          }
        }

        ctx.stroke();

        // Sacrifice selection highlight
        if (sacrificeSet.has(`${r},${c}`)) {
          drawHex(ctx, cx, cy, hexSize + 1);
          ctx.strokeStyle = COLORS.sacrifice;
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Nutrient number (only for owned cells)
        if (cell.owner !== null && cell.nutrient > 0) {
          ctx.fillStyle = cell.owner === 'player' ? '#0a0a0a' : '#0a0a0a';
          ctx.font = `${Math.max(hexSize * 0.5, 10)}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(cell.nutrient), cx, cy);
        }
      }
    }
  }, [state, getHexSize]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const hexSize = getHexSize();
      const offsetX = 10;
      const offsetY = 10;

      // Find closest hex center
      let bestDist = Infinity;
      let bestR = -1;
      let bestC = -1;

      for (let r = 0; r < state.gridSize; r++) {
        for (let c = 0; c < state.gridSize; c++) {
          const [cx, cy] = hexCenter(r, c, hexSize, offsetX, offsetY);
          const dist = Math.sqrt((clickX - cx) ** 2 + (clickY - cy) ** 2);
          if (dist < hexSize && dist < bestDist) {
            bestDist = dist;
            bestR = r;
            bestC = c;
          }
        }
      }

      if (bestR >= 0 && bestC >= 0) {
        onCellClick(bestR, bestC);
      }
    },
    [state.gridSize, getHexSize, onCellClick],
  );

  return (
    <div className="sf-canvas-container" ref={containerRef}>
      <canvas ref={canvasRef} className="sf-canvas" onClick={handleClick} />
    </div>
  );
}
