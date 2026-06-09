import {
  EXTRA_SLOT_DURATION_MS,
  HOLD_COUNT,
  PEEK_DURATION_MS,
  REVIVE_CLEAR_SLOTS,
  REVIVE_LIMITS,
  SKILL_LIMITS,
  SLOT_COUNT,
  SkillType,
  type Card,
  type GameSnapshot,
  type GameStateData,
  type GameStatus,
  type LevelConfig,
  type MatchResult,
  type ReviveResult,
  type Suit,
} from './types.js';
import {
  cloneCards,
  cloneColumns,
  createEmptySkillUses,
  deepCloneState,
} from './utils.js';
import {
  isDefeat,
  isVictory,
  tryAutoMatch,
  manualWildMatch as doManualWildMatch,
  getWildMatchOptions,
  canActivateWild,
} from './MatchLogic.js';
import { generateSolvableLevel } from './LevelGenerator.js';

export type GameEvent =
  | { type: 'cardPicked'; column: number; card: Card }
  | { type: 'cardToHold'; card: Card }
  | { type: 'cardFromHold'; card: Card }
  | { type: 'matched'; results: MatchResult[] }
  | { type: 'skillUsed'; skill: SkillType }
  | { type: 'shuffled' }
  | { type: 'undone' }
  | { type: 'revived'; method: 'video' | 'share' }
  | { type: 'won' }
  | { type: 'lost' }
  | { type: 'stateChanged' };

export type GameListener = (event: GameEvent) => void;

export class GameState {
  private data: GameStateData;
  private listeners: GameListener[] = [];

  constructor(config: LevelConfig) {
    const level = generateSolvableLevel(config);
    this.data = {
      columns: level.columns,
      slots: [],
      holdArea: [],
      luckySuit: config.luckySuit,
      maxSlots: SLOT_COUNT,
      extraSlotUntil: 0,
      peekUntil: 0,
      skillUses: createEmptySkillUses(),
      undoStack: [],
      moves: 0,
      startTime: Date.now(),
      reviveUsed: { video: 0, share: 0 },
      mode: config.mode,
      level: config.level,
      seed: level.seed,
      status: 'playing',
      luckySkillUses: 0,
      endlessFailStreak: 0,
    };
  }

  static fromData(data: GameStateData): GameState {
    const g = Object.create(GameState.prototype) as GameState;
    g.data = deepCloneState(data);
    g.listeners = [];
    return g;
  }

  getState(): Readonly<GameStateData> {
    return this.data;
  }

  on(listener: GameListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(event: GameEvent): void {
    this.listeners.forEach((l) => l(event));
    if (event.type !== 'stateChanged') {
      this.emit({ type: 'stateChanged' });
    }
  }

  private saveSnapshot(): void {
    const snap: GameSnapshot = {
      columns: cloneColumns(this.data.columns),
      slots: cloneCards(this.data.slots),
      holdArea: cloneCards(this.data.holdArea),
      moves: this.data.moves,
      maxSlots: this.data.maxSlots,
      extraSlotUntil: this.data.extraSlotUntil,
      peekUntil: this.data.peekUntil,
      skillUses: { ...this.data.skillUses },
    };
    this.data.undoStack.push(snap);
    if (this.data.undoStack.length > 20) {
      this.data.undoStack.shift();
    }
  }

  /** 从列顶取牌 */
  pickFromColumn(columnIndex: number): boolean {
    if (this.data.status !== 'playing') return false;
    const col = this.data.columns[columnIndex];
    if (!col || col.length === 0) return false;

    this.saveSnapshot();
    const card = col.pop()!;

    this.data.slots.push(card);
    this.data.moves++;

    const matches = tryAutoMatch(this.data.slots);
    this.checkExtraSlotExpiry();

    this.emit({ type: 'cardPicked', column: columnIndex, card });
    if (matches.length > 0) {
      this.emit({ type: 'matched', results: matches });
    }

    return this.checkEndState();
  }

  /** 从待用区取回卡槽 */
  pickFromHold(index: number): boolean {
    if (this.data.status !== 'playing') return false;
    if (index < 0 || index >= this.data.holdArea.length) return false;
    if (this.data.slots.length >= this.getEffectiveMaxSlots()) return false;

    this.saveSnapshot();
    const card = this.data.holdArea.splice(index, 1)[0];
    this.data.slots.push(card);
    this.data.moves++;

    const matches = tryAutoMatch(this.data.slots);
    this.emit({ type: 'cardFromHold', card });
    if (matches.length > 0) {
      this.emit({ type: 'matched', results: matches });
    }

    return this.checkEndState();
  }

  /** 获取当前有效槽位数 */
  getEffectiveMaxSlots(): number {
    if (Date.now() < this.data.extraSlotUntil) {
      return this.data.maxSlots;
    }
    if (this.data.maxSlots > SLOT_COUNT) {
      this.data.maxSlots = SLOT_COUNT;
    }
    return this.data.maxSlots;
  }

  isPeekActive(): boolean {
    return Date.now() < this.data.peekUntil;
  }

  getPeekCards(columnIndex: number): Card[] {
    const col = this.data.columns[columnIndex];
    if (!col) return [];
    const start = Math.max(0, col.length - 1 - 2);
    return col.slice(start, col.length - 1).reverse();
  }

  private checkExtraSlotExpiry(): void {
    if (this.data.maxSlots > SLOT_COUNT && Date.now() >= this.data.extraSlotUntil) {
      this.data.maxSlots = SLOT_COUNT;
    }
  }

  private checkEndState(): boolean {
    this.checkExtraSlotExpiry();

    if (isVictory(this.data.columns, this.data.slots, this.data.holdArea)) {
      this.data.status = 'won';
      this.emit({ type: 'won' });
      return true;
    }

    if (isDefeat(this.data.slots, this.getEffectiveMaxSlots())) {
      this.data.status = 'lost';
      this.emit({ type: 'lost' });
      return true;
    }

    return true;
  }

  /** 手动激活万能牌并选择消除花色 */
  activateManualWild(slotIndex: number, targetSuit: Suit): boolean {
    if (this.data.status !== 'playing') return false;

    this.saveSnapshot();
    const result = doManualWildMatch(this.data.slots, slotIndex, targetSuit, this.data.luckySuit);
    if (!result) return false;

    this.data.moves++;
    this.emit({ type: 'matched', results: [result] });
    return this.checkEndState();
  }

  /** 获取某张幸运牌可手动消除的花色 */
  getManualWildOptions(slotIndex: number): Suit[] {
    return getWildMatchOptions(this.data.slots, slotIndex, this.data.luckySuit);
  }

  /** 是否为可手动激活的幸运牌 */
  isLuckyCard(card: Card): boolean {
    return canActivateWild(card, this.data.luckySuit);
  }

  /** 点击幸运牌释放技能 */
  useSkillFromWild(slotIndex: number, skill: SkillType): boolean {
    if (this.data.status !== 'playing') return false;
    const card = this.data.slots[slotIndex];
    if (!this.isLuckyCard(card)) return false;

    return this.applySkill(skill, slotIndex);
  }

  applySkill(skill: SkillType, wildSlotIndex?: number): boolean {
    if (this.data.status !== 'playing') return false;
    const limit = SKILL_LIMITS[skill];
    if (this.data.skillUses[skill] >= limit) return false;

    switch (skill) {
      case SkillType.Undo:
        return this.undo();
      case SkillType.Shuffle:
        return this.shuffle();
      case SkillType.Peek:
        return this.peek();
      case SkillType.ExtraSlot:
        return this.extraSlot(wildSlotIndex);
      case SkillType.TakeToHold:
        return false; // 需要额外参数，走 takeSlotsToHold
      default:
        return false;
    }
  }

  /** 从卡槽取牌到待用区 */
  takeSlotsToHold(slotIndices: number[]): boolean {
    if (this.data.status !== 'playing') return false;
    if (slotIndices.length === 0 || slotIndices.length > 3) return false;
    if (this.data.holdArea.length + slotIndices.length > HOLD_COUNT) return false;

    const unique = [...new Set(slotIndices)].sort((a, b) => b - a);
    for (const idx of unique) {
      if (idx < 0 || idx >= this.data.slots.length) return false;
    }

    this.saveSnapshot();
    const taken: Card[] = [];
    for (const idx of unique) {
      taken.unshift(this.data.slots.splice(idx, 1)[0]);
    }

    for (const card of taken) {
      this.data.holdArea.push(card);
      this.emit({ type: 'cardToHold', card });
    }

    this.data.skillUses[SkillType.TakeToHold]++;
    this.emit({ type: 'skillUsed', skill: SkillType.TakeToHold });
    return true;
  }

  private shuffle(): boolean {
    if (this.data.skillUses[SkillType.Shuffle] >= SKILL_LIMITS[SkillType.Shuffle]) return false;

    this.saveSnapshot();
    const remaining = this.data.columns.flat();
    if (remaining.length === 0) return false;

    // Fisher-Yates with current time as entropy
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    const colCount = this.data.columns.length;
    const newColumns: Card[][] = Array.from({ length: colCount }, () => []);
    remaining.forEach((card, i) => {
      newColumns[i % colCount].push(card);
    });

    this.data.columns = newColumns;
    this.data.skillUses[SkillType.Shuffle]++;
    this.emit({ type: 'shuffled' });
    this.emit({ type: 'skillUsed', skill: SkillType.Shuffle });
    return true;
  }

  private peek(): boolean {
    this.data.peekUntil = Date.now() + PEEK_DURATION_MS;
    this.data.skillUses[SkillType.Peek]++;
    this.emit({ type: 'skillUsed', skill: SkillType.Peek });
    return true;
  }

  private extraSlot(wildSlotIndex?: number): boolean {
    this.data.maxSlots = SLOT_COUNT + 1;
    this.data.extraSlotUntil = Date.now() + EXTRA_SLOT_DURATION_MS;
    this.data.skillUses[SkillType.ExtraSlot]++;

    if (wildSlotIndex !== undefined) {
      const card = this.data.slots[wildSlotIndex];
      if (card && this.isLuckyCard(card)) {
        card.skillConsumed = true;
        card.isWild = false;
      }
    }

    this.emit({ type: 'skillUsed', skill: SkillType.ExtraSlot });
    return true;
  }

  undo(): boolean {
    if (this.data.skillUses[SkillType.Undo] >= SKILL_LIMITS[SkillType.Undo]) return false;
    const snap = this.data.undoStack.pop();
    if (!snap) return false;

    this.data.columns = snap.columns;
    this.data.slots = snap.slots;
    this.data.holdArea = snap.holdArea;
    this.data.moves = snap.moves;
    this.data.maxSlots = snap.maxSlots;
    this.data.extraSlotUntil = snap.extraSlotUntil;
    this.data.peekUntil = snap.peekUntil;
    this.data.skillUses[SkillType.Undo]++;
    this.data.status = 'playing';

    this.emit({ type: 'undone' });
    this.emit({ type: 'skillUsed', skill: SkillType.Undo });
    return true;
  }

  /** 消耗幸运牌释放技能 */
  activateWildSkill(slotIndex: number, skill: SkillType): boolean {
    if (this.data.status !== 'playing') return false;
    const card = this.data.slots[slotIndex];
    if (!this.isLuckyCard(card)) return false;
    if (this.data.luckySkillUses >= 3) return false;

    const ok = this.applySkillWithWildConsumption(skill, slotIndex);
    if (ok) {
      this.data.luckySkillUses++;
    }
    return ok;
  }

  private applySkillWithWildConsumption(skill: SkillType, slotIndex: number): boolean {
    if (skill === SkillType.TakeToHold) return false;

    const ok =
      skill === SkillType.Undo
        ? this.undo()
        : skill === SkillType.Shuffle
          ? this.shuffle()
          : skill === SkillType.Peek
            ? this.peek()
            : skill === SkillType.ExtraSlot
              ? this.extraSlot(slotIndex)
              : false;

    if (ok && skill !== SkillType.ExtraSlot) {
      const card = this.data.slots[slotIndex];
      if (card && this.isLuckyCard(card)) {
        card.skillConsumed = true;
        card.isWild = false;
      }
    }

    return ok;
  }

  revive(method: 'video' | 'share'): ReviveResult {
    if (this.data.status !== 'lost') {
      return { success: false, clearedSlots: 0 };
    }

    const limit = REVIVE_LIMITS[method];
    if (this.data.reviveUsed[method] >= limit) {
      return { success: false, clearedSlots: 0 };
    }

    const clearCount = Math.min(REVIVE_CLEAR_SLOTS, this.data.slots.length);
    this.data.slots.splice(-clearCount, clearCount);
    this.data.reviveUsed[method]++;
    this.data.status = 'playing';

    this.emit({ type: 'revived', method });
    return { success: true, clearedSlots: clearCount };
  }

  getElapsedMs(): number {
    return Date.now() - this.data.startTime;
  }

  getTotalSkillUses(): number {
    return Object.values(this.data.skillUses).reduce((a, b) => a + b, 0);
  }

  pause(): void {
    if (this.data.status === 'playing') this.data.status = 'paused';
  }

  resume(): void {
    if (this.data.status === 'paused') this.data.status = 'playing';
  }

  setLuckySuit(suit: Suit): void {
    this.data.luckySuit = suit;
  }
}
