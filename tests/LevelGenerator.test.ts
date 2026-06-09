import { describe, it, expect } from 'vitest';
import { generateSolvableLevel } from '../src/core/LevelGenerator.js';
import { createDailyLevelConfig } from '../src/core/DailySeed.js';
import { TOTAL_CARDS, COLUMN_COUNT } from '../src/core/types.js';

describe('LevelGenerator', () => {
  it('生成100张牌分8列', () => {
    const config = createDailyLevelConfig(new Date('2026-06-08'));
    const level = generateSolvableLevel(config);
    const total = level.columns.reduce((s, c) => s + c.length, 0);
    expect(total).toBe(TOTAL_CARDS);
    expect(level.columns.length).toBe(COLUMN_COUNT);
  });

  it('生成3张技能牌', () => {
    const config = createDailyLevelConfig(new Date('2026-06-08'));
    const level = generateSolvableLevel(config);
    const allCards = level.columns.flat();
    const skillCards = allCards.filter(c => c.isSkillCard);
    expect(skillCards.length).toBe(3);
    skillCards.forEach(c => {
      expect(c.skillConsumed).toBe(false);
    });
  });

  it('8列高度平均分配', () => {
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
