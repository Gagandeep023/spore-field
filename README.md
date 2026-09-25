# @gagandeep023/spore-field

**Grow. Spread. Outcompete.**

A turn-based territory control browser game on a hex-like grid. Place spores, spread across the field, sacrifice outliers to power up your next move, and outcompete the AI opponent.

## Install

```bash
npm install @gagandeep023/spore-field
```

## Usage

```tsx
import { SporeField } from '@gagandeep023/spore-field/frontend';
import '@gagandeep023/spore-field/frontend/styles.css';

function App() {
  return (
    <SporeField
      onGameOver={({ winner, playerPercent, aiPercent, turns }) => {
        console.log(
          `${winner} won with ${playerPercent}% in ${turns} turns`,
        );
      }}
    />
  );
}
```

## How to Play

1. Tap an empty cell to place a spore.
2. After both you and the AI place, all spores spread to adjacent empty cells.
3. Higher-nutrient spores spread first and win conflicts.
4. Sacrifice your own cells to boost your next placement's nutrient level.
5. If the AI controls 70% of the field, you lose instantly.
6. When the field fills up, whoever controls more territory wins.

## Requests and feedback

[![Request a feature](https://img.shields.io/badge/request-a%20feature-64ffda)](https://github.com/Gagandeep023/spore-field/discussions/new?category=ideas)
[![Report a bug](https://img.shields.io/badge/report-a%20bug-cc4444)](https://github.com/Gagandeep023/spore-field/issues/new?template=bug_report.yml)

Ideas and questions go to Discussions, bugs to Issues.

## License

MIT
