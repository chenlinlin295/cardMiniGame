import { describe, it, expect, beforeEach } from 'vitest';
import {
  findMatchableSuit,
  eliminateMatch,
  tryAutoMatch,
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

  it('技能牌：不参与自动三消', () => {
    const skillCard = createCard(Suit.Cat, true);
    const slots = [createCard(Suit.Dog), createCard(Suit.Dog), skillCard];
    expect(findMatchableSuit(slots)).toBeNull();
    expect(tryAutoMatch(slots).length).toBe(0);
    expect(slots.length).toBe(3);
  });

  it('技能牌消耗后参与三消', () => {
    const skillCard = createCard(Suit.Cat, true);
    skillCard.skillConsumed = true;
    const slots = [skillCard, createCard(Suit.Cat), createCard(Suit.Cat)];
    const suit = findMatchableSuit(slots);
    expect(suit).toBe(Suit.Cat);
    const result = eliminateMatch(slots, Suit.Cat);
    expect(result?.eliminated.length).toBe(3);
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
    expect(isVictory([[], [], [], [], [], [], [], []], [], [])).toBe(true);
  });
});
