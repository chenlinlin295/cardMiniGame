import { describe, it, expect } from 'vitest';
import {
  getDailySeed,
  getDailyLuckySuit,
  calcDailyScore,
  formatDailyDate,
} from '../src/core/DailySeed.js';

describe('DailySeed', () => {
  it('同日期同种子', () => {
    const date = new Date('2026-06-08');
    expect(getDailySeed(date)).toBe(getDailySeed(date));
  });

  it('不同日期不同种子', () => {
    const s1 = getDailySeed(new Date('2026-06-08'));
    const s2 = getDailySeed(new Date('2026-06-09'));
    expect(s1).not.toBe(s2);
  });

  it('幸运花色在0-9范围', () => {
    const suit = getDailyLuckySuit(new Date('2026-06-08'));
    expect(suit).toBeGreaterThanOrEqual(0);
    expect(suit).toBeLessThanOrEqual(9);
  });

  it('分数计算：步数少分高', () => {
    const high = calcDailyScore(10, 60000, 0);
    const low = calcDailyScore(50, 120000, 5);
    expect(high).toBeGreaterThan(low);
  });

  it('日期格式化', () => {
    expect(formatDailyDate(new Date('2026-06-08'))).toBe('2026-06-08');
  });
});
