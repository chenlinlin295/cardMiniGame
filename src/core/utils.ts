/** 可复现的伪随机数生成器 (Mulberry32) */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0 || 1;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

export function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function cloneCards(cards: import('./types.js').Card[]): import('./types.js').Card[] {
  return cards.map((c) => ({ ...c }));
}

export function cloneColumns(columns: import('./types.js').Card[][]): import('./types.js').Card[][] {
  return columns.map((col) => cloneCards(col));
}

export function deepCloneState(state: import('./types.js').GameStateData): import('./types.js').GameStateData {
  return {
    ...state,
    columns: cloneColumns(state.columns),
    slots: cloneCards(state.slots),
    holdArea: cloneCards(state.holdArea),
    skillUses: { ...state.skillUses },
    undoStack: state.undoStack.map((s) => ({
      ...s,
      columns: cloneColumns(s.columns),
      slots: cloneCards(s.slots),
      holdArea: cloneCards(s.holdArea),
      skillUses: { ...s.skillUses },
    })),
    reviveUsed: { ...state.reviveUsed },
  };
}

export function createEmptySkillUses(): Record<import('./types.js').SkillType, number> {
  return {
    shuffle: 0,
    takeToHold: 0,
    undo: 0,
    peek: 0,
    extraSlot: 0,
  };
}

let cardIdCounter = 0;
export function resetCardIdCounter(): void {
  cardIdCounter = 0;
}

export function createCard(suit: import('./types.js').Suit): import('./types.js').Card {
  return {
    id: `c_${++cardIdCounter}`,
    suit,
  };
}
