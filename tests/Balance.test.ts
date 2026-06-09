import { describe, it, expect } from 'vitest';
import { estimateDifficulty } from '../src/core/Solvability.js';
import { generateSolvableLevel } from '../src/core/LevelGenerator.js';
import { createEndlessLevelConfig } from '../src/core/DailySeed.js';
import { Suit } from '../src/core/types.js';

describe('Balance', () => {
  it('无尽高难度 >= 低难度', () => {
    const easy = generateSolvableLevel(createEndlessLevelConfig(1, Suit.Cat, 100));
    const hard = generateSolvableLevel(createEndlessLevelConfig(10, Suit.Cat, 200));
    const dEasy = estimateDifficulty(easy.columns, Suit.Cat);
    const dHard = estimateDifficulty(hard.columns, Suit.Cat);
    expect(dHard).toBeGreaterThanOrEqual(dEasy * 0.8);
  });

  it('难度分数在0-1范围', () => {
    const level = generateSolvableLevel(createEndlessLevelConfig(5, Suit.Dog, 300));
    const d = estimateDifficulty(level.columns, Suit.Dog);
    expect(d).toBeGreaterThanOrEqual(0);
    expect(d).toBeLessThanOrEqual(1);
  });
});
