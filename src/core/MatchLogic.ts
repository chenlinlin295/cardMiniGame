import type { Card, MatchResult, Suit } from './types.js';
import { SUIT_COUNT } from './types.js';

/** 统计槽位中各花色数量（不含万能牌，万能牌不参与自动三消） */
export function countSlots(slots: Card[]): { counts: number[]; wildCount: number; wildIndices: number[] } {
  const counts = new Array(SUIT_COUNT).fill(0);
  const wildIndices: number[] = [];
  let wildCount = 0;

  slots.forEach((card, index) => {
    if (card.isWild && !card.skillConsumed) {
      wildCount++;
      wildIndices.push(index);
    } else {
      counts[card.suit]++;
    }
  });

  return { counts, wildCount, wildIndices };
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
  const { counts, wildCount, wildIndices } = countSlots(slots);
  const needWild = Math.max(0, 3 - counts[targetSuit]);

  if (counts[targetSuit] + wildCount < 3 || needWild > wildCount) {
    return null;
  }

  const eliminated: Card[] = [];
  const remaining: Card[] = [];
  let taken = 0;
  let wildTaken = 0;

  for (const card of slots) {
    if (taken >= 3) {
      remaining.push(card);
      continue;
    }

    const isActiveWild = card.isWild && !card.skillConsumed;

    if (!isActiveWild && card.suit === targetSuit && counts[targetSuit] > 0) {
      eliminated.push(card);
      taken++;
      counts[targetSuit]--;
    } else if (isActiveWild && wildTaken < needWild) {
      eliminated.push(card);
      taken++;
      wildTaken++;
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
    wildUsed: wildTaken > 0,
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

/** 幸运花色牌是否可手动激活为万能牌 */
export function canActivateWild(card: Card, luckySuit: Suit): boolean {
  return card.suit === luckySuit && !card.isWild && !card.skillConsumed;
}

/** 手动万能消：玩家选择用哪张幸运牌、凑哪种花色 */
export function manualWildMatch(slots: Card[], slotIndex: number, targetSuit: Suit, luckySuit: Suit): MatchResult | null {
  const card = slots[slotIndex];
  if (!card || !canActivateWild(card, luckySuit)) return null;

  card.isWild = true;
  const result = eliminateMatch(slots, targetSuit);
  if (!result) {
    card.isWild = false;
    return null;
  }

  return result;
}

/** 获取手动万能可匹配的花色列表 */
export function getWildMatchOptions(slots: Card[], slotIndex: number, luckySuit: Suit): Suit[] {
  const card = slots[slotIndex];
  if (!card || !canActivateWild(card, luckySuit)) return [];

  const options: Suit[] = [];
  const { counts } = countSlots(slots);

  for (let s = 0; s < SUIT_COUNT; s++) {
    // 激活后该牌作万能，需 counts[s] + 1 >= 3
    if (counts[s] >= 2) options.push(s as Suit);
  }

  return options;
}

/** 新牌不再自动标记万能 */
export function shouldBeWild(_suit: Suit, _luckySuit: Suit): boolean {
  return false;
}

/** 检查游戏是否胜利 */
export function isVictory(columns: Card[][], slots: Card[], holdArea: Card[]): boolean {
  const colsEmpty = columns.every((col) => col.length === 0);
  return colsEmpty && slots.length === 0 && holdArea.length === 0;
}

/** 检查是否失败（槽满且无法纯三消，不含未手动激活的万能） */
export function isDefeat(slots: Card[], maxSlots: number): boolean {
  if (slots.length < maxSlots) return false;
  return findMatchableSuit(slots) === null;
}
