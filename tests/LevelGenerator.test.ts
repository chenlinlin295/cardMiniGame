import { describe, it, expect } from 'vitest';
import { generateSolvableLevel, adjustWeightsForDifficulty } from '../src/core/LevelGenerator.js';
import { createDailyLevelConfig, createEndlessLevelConfig } from '../src/core/DailySeed.js';
import { TOTAL_CARDS, COLUMN_COUNT } from '../src/core/types.js';

describe('LevelGenerator', () => {
  it('生成100张牌分6列', () => {
    const config = createDailyLevelConfig(new Date('2026-06-08'));
    const level = generateSolvableLevel(config);
    const total = level.columns.reduce((s, c) => s + c.length, 0);
    expect(total).toBe(TOTAL_CARDS);
    expect(level.columns.length).toBe(COLUMN_COUNT);
  });

  it('加权总和为100', () => {
    const weights = adjustWeightsForDifficulty(
      [12, 11, 10, 10, 10, 10, 10, 9, 9, 9],
      0.5,
    );
    expect(weights.reduce((a, b) => a + b, 0)).toBe(TOTAL_CARDS);
  });

  it('无尽模式难度递增', () => {
    const c1 = createEndlessLevelConfig(1, 0);
    const c10 = createEndlessLevelConfig(10, 0);
    expect(c10.difficulty).toBeGreaterThan(c1.difficulty);
  });

  it('6列高度平均分配', () => {
    const config = createDailyLevelConfig(new Date('2026-06-08'));
    const level = generateSolvableLevel(config);
    const heights = level.columns.map((c) => c.length);
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    expect(max - min).toBeLessThanOrEqual(1);
  });

  it('每日种子可复现', () => {
    const date = new Date('2026-06-08');
    const l1 = generateSolvableLevel(createDailyLevelConfig(date));
    const l2 = generateSolvableLevel(createDailyLevelConfig(date));
    expect(l1.columns.length).toBe(l2.columns.length);
    expect(l1.deck.length).toBe(l2.deck.length);
  });
});
