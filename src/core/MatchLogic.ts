import type { Card, MatchResult, Suit } from './types.js';
import { SUIT_COUNT } from './types.js';

/** 统计槽位中各花色数量（技能牌不参与自动三消） */
export function countSlots(slots: Card[]): { counts: number[] } {
  const counts = new Array(SUIT_COUNT).fill(0);

  slots.forEach((card) => {
    if (!card.isSkillCard || card.skillConsumed) {
      counts[card.suit]++;
    }
  });

  return { counts };
}

/** 自动三消：仅 3 张同花色，不含万能牌 */
export function findMatchableSuit(slots: Card[]): Suit | null {
  const { counts } = countSlots(slots);

  for (let s = 0; s < SUIT_COUNT; s++) {
    if (counts[s] >= 3) return s as Suit;
  }

  return null;
}

/** 执行三消，返回被消除的牌 */
export function eliminateMatch(slots: Card[], targetSuit: Suit): MatchResult | null {
  const { counts } = countSlots(slots);

  if (counts[targetSuit] < 3) {
    return null;
  }

  const eliminated: Card[] = [];
  const remaining: Card[] = [];
  let taken = 0;

  for (const card of slots) {
    if (taken >= 3) {
      remaining.push(card);
      continue;
    }

    const isNormalCard = !card.isSkillCard || card.skillConsumed;

    if (isNormalCard && card.suit === targetSuit) {
      eliminated.push(card);
      taken++;
    } else {
      remaining.push(card);
    }
  }

  if (taken < 3) return null;

  slots.length = 0;
  slots.push(...remaining);

  return {
    eliminated,
    matchedSuit: targetSuit,
  };
}

/** 检查并执行自动三消（仅纯三同花色） */
export function tryAutoMatch(slots: Card[]): MatchResult[] {
  const results: MatchResult[] = [];
  let suit = findMatchableSuit(slots);
  while (suit !== null) {
    const result = eliminateMatch(slots, suit);
    if (!result) break;
    results.push(result);
    suit = findMatchableSuit(slots);
  }
  return results;
}

/** 检查游戏是否胜利 */
export function isVictory(columns: Card[][], slots: Card[], holdArea: Card[]): boolean {
  const colsEmpty = columns.every((col) => col.length === 0);
  return colsEmpty && slots.length === 0 && holdArea.length === 0;
}

/** 检查是否失败（槽满且无法三消） */
export function isDefeat(slots: Card[], maxSlots: number): boolean {
  if (slots.length < maxSlots) return false;
  return findMatchableSuit(slots) === null;
}
