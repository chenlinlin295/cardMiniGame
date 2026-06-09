import type { Card, Suit } from './types.js';
import { COLUMN_COUNT, SLOT_COUNT, HOLD_COUNT } from './types.js';
import { findMatchableSuit, tryAutoMatch, isVictory, isDefeat } from './MatchLogic.js';
import { SeededRandom } from './utils.js';

export interface SimState {
  columns: Card[][];
  slots: Card[];
  holdArea: Card[];
  maxSlots: number;
}

/** 贪心模拟：随机取列顶牌，检查是否存在通关路径（启发式） */
export function simulateGreedy(state: SimState, rng: SeededRandom, maxSteps = 200): boolean {
  const columns = state.columns.map((c) => [...c]);
  const slots: Card[] = [];
  const holdArea: Card[] = [];
  const maxSlots = state.maxSlots;

  for (let step = 0; step < maxSteps; step++) {
    if (columns.every((c) => c.length === 0) && slots.length === 0 && holdArea.length === 0) {
      return true;
    }

    if (isDefeat(slots, maxSlots)) {
      return false;
    }

    // 优先从列取牌
    const availableCols = columns.map((c, i) => i).filter((i) => columns[i].length > 0);
    if (availableCols.length === 0) {
      // 从待用区取回
      if (holdArea.length > 0) {
        const card = holdArea.pop()!;
        slots.push(card);
        tryAutoMatch(slots);
        continue;
      }
      break;
    }

    const colIdx = rng.pick(availableCols);
    const card = columns[colIdx].pop()!;
    slots.push(card);
    tryAutoMatch(slots);
  }

  return isVictory(columns, slots, holdArea);
}

/** BFS 有限深度搜索可解性 */
export function checkSolvabilityBFS(
  columns: Card[][],
  maxSlots = SLOT_COUNT,
  maxDepth = 80,
): boolean {
  const initial: SimState = {
    columns: columns.map((c) => [...c]),
    slots: [],
    holdArea: [],
    maxSlots,
  };

  const queue: { state: SimState; depth: number }[] = [{ state: initial, depth: 0 }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { state, depth } = queue.shift()!;
    const key = serializeState(state);
    if (visited.has(key)) continue;
    visited.add(key);

    if (isVictory(state.columns, state.slots, state.holdArea)) return true;
    if (depth >= maxDepth) continue;
    if (isDefeat(state.slots, state.maxSlots)) continue;

    // 从每列取牌
    for (let col = 0; col < COLUMN_COUNT; col++) {
      if (state.columns[col].length === 0) continue;
      const next = cloneSimState(state);
      const card = next.columns[col][next.columns[col].length - 1];
      next.columns[col] = next.columns[col].slice(0, -1);
      next.slots = [...next.slots, card];
      tryAutoMatch(next.slots);
      if (!isDefeat(next.slots, next.maxSlots)) {
        queue.push({ state: next, depth: depth + 1 });
      }
    }

    // 从待用区取回
    for (let h = 0; h < state.holdArea.length; h++) {
      const next = cloneSimState(state);
      const card = next.holdArea.splice(h, 1)[0];
      next.slots = [...next.slots, card];
      tryAutoMatch(next.slots);
      if (!isDefeat(next.slots, next.maxSlots)) {
        queue.push({ state: next, depth: depth + 1 });
      }
    }
  }

  return false;
}

function serializeState(state: SimState): string {
  const colStr = state.columns.map((c) => c.map((card) => `${card.suit}${card.isWild ? 'w' : ''}`).join(',')).join('|');
  const slotStr = state.slots.map((c) => `${c.suit}${c.isWild ? 'w' : ''}`).join(',');
  const holdStr = state.holdArea.map((c) => `${c.suit}`).join(',');
  return `${colStr}#${slotStr}#${holdStr}`;
}

function cloneSimState(state: SimState): SimState {
  return {
    columns: state.columns.map((c) => [...c]),
    slots: [...state.slots],
    holdArea: [...state.holdArea],
    maxSlots: state.maxSlots,
  };
}

/** 估算关卡难度分数 */
export function estimateDifficulty(columns: Card[][], luckySuit: Suit): number {
  const all = columns.flat();
  const wildCount = all.filter((c) => c.suit === luckySuit).length;
  const colHeights = columns.map((c) => c.length);
  const heightVariance = Math.max(...colHeights) - Math.min(...colHeights);
  const topSuits = columns.filter((c) => c.length > 0).map((c) => c[c.length - 1].suit);
  const topDiversity = new Set(topSuits).size;

  return (heightVariance / 10) * 0.3 + (1 - wildCount / 12) * 0.4 + (1 - topDiversity / 6) * 0.3;
}
