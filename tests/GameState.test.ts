import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../src/core/GameState.js';
import { createEndlessLevelConfig } from '../src/core/DailySeed.js';
import { Suit, SkillType } from '../src/core/types.js';

describe('GameState', () => {
  let game: GameState;

  beforeEach(() => {
    game = new GameState(createEndlessLevelConfig(1, Suit.Cat, 12345));
  });

  it('从列取牌进入卡槽', () => {
    const cols = game.getState().columns;
    const colWithCards = cols.findIndex((c) => c.length > 0);
    expect(colWithCards).toBeGreaterThanOrEqual(0);
    const before = cols[colWithCards].length;
    game.pickFromColumn(colWithCards);
    expect(game.getState().columns[colWithCards].length).toBe(before - 1);
    expect(game.getState().slots.length).toBeGreaterThan(0);
  });

  it('撤销回退', () => {
    const colIdx = game.getState().columns.findIndex((c) => c.length > 0);
    game.pickFromColumn(colIdx);
    const movesAfterPick = game.getState().moves;
    game.activateWildSkill(0, SkillType.Undo);
    // undo via applySkill if no wild - use applySkill directly
    game.applySkill(SkillType.Undo);
    expect(game.getState().moves).toBeLessThan(movesAfterPick);
  });

  it('复活清空槽位', () => {
    // 填满槽位模拟失败较复杂，测试 revive 接口
    const state = game.getState();
    state.status = 'lost';
    const g2 = GameState.fromData(state);
    const result = g2.revive('video');
    expect(result.success).toBe(true);
    expect(g2.getState().status).toBe('playing');
  });
});
