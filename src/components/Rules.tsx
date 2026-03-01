import React from 'react';

interface RulesProps {
  onStart: () => void;
}

export default function Rules({ onStart }: RulesProps) {
  return (
    <div className="sf-rules-overlay">
      <div className="sf-rules-content">
        <h1 className="sf-rules-title">Spore Field</h1>
        <p className="sf-rules-tagline">Grow. Spread. Outcompete.</p>

        <div className="sf-rules-section">
          <h3>Goal</h3>
          <p>Control more territory than the AI when the field fills up.</p>
        </div>

        <div className="sf-rules-section">
          <h3>Rules</h3>
          <ol className="sf-rules-list">
            <li>Tap an empty cell to place a spore.</li>
            <li>After both you and the AI place, all spores spread to adjacent empty cells.</li>
            <li>Higher-nutrient spores spread first and win conflicts.</li>
            <li>Sacrifice your own cells to boost your next placement's nutrient level.</li>
            <li>If the AI controls 70% of the field, you lose instantly.</li>
          </ol>
        </div>

        <div className="sf-rules-section">
          <h3>Tip</h3>
          <p>Don't just expand. Sacrifice outliers to create a powerful central push.</p>
        </div>

        <button className="sf-btn sf-btn-primary" onClick={onStart}>
          Start Game
        </button>
      </div>
    </div>
  );
}
