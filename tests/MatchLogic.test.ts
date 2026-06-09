import { describe, it, expect, beforeEach } from 'vitest';
import {
  findMatchableSuit,
  eliminateMatch,
  tryAutoMatch,
  manualWildMatch,
  isVictory,
  isDefeat,
} from '../src/core/MatchLogic.js';
import { createCard, resetCardIdCounter } from '../src/core/utils.js';
import { Suit, SLOT_COUNT } from '../src/core/types.js';

describe('MatchLogic', () => {
  beforeEach(() => resetCardIdCounter());

  it('三消：3张同花色', () => {
    const slots = [
      createCard(Suit.Cat),
      createCard(Suit.Cat),
      createCard(Suit.Cat),
    ];
    const suit = findMatchableSuit(slots);
    expect(suit).toBe(Suit.Cat);
    const result = eliminateMatch(slots, Suit.Cat);
    expect(result?.eliminated.length).toBe(3);
    expect(slots.length).toBe(0);
  });

  it('万能牌：不自动三消，需手动激活', () => {
    const wild = createCard(Suit.Cat, true);
    const slots = [createCard(Suit.Dog), createCard(Suit.Dog), wild];
    expect(findMatchableSuit(slots)).toBeNull();
    expect(tryAutoMatch(slots).length).toBe(0);
    expect(slots.length).toBe(3);
  });

  it('手动万能：2张同花色+1万能', () => {
    const slots = [createCard(Suit.Dog), createCard(Suit.Dog), createCard(Suit.Cat)];
    const result = manualWildMatch(slots, 2, Suit.Dog, Suit.Cat);
    expect(result).not.toBeNull();
    expect(slots.length).toBe(0);
  });

  it('槽满且无三消 → 失败', () => {
    const slots = [
      createCard(Suit.Cat),
      createCard(Suit.Dog),
      createCard(Suit.Rabbit),
      createCard(Suit.Bear),
      createCard(Suit.Fox),
      createCard(Suit.Panda),
      createCard(Suit.Koala),
    ];
    expect(isDefeat(slots, SLOT_COUNT)).toBe(true);
  });

  it('胜利：全空', () => {
    expect(isVictory([[], [], [], [], [], []], [], [])).toBe(true);
  });
});
