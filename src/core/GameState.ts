import {
  HOLD_COUNT,
  PEEK_DURATION_MS,
  REVIVE_CLEAR_SLOTS,
  REVIVE_LIMITS,
  SKILL_LIMITS,
  SLOT_COUNT,
  SkillType,
  Suit,
  type Card,
  type GameSnapshot,
  type GameStateData,
  type GameStatus,
  type LevelConfig,
  type MatchResult,
  type ReviveResult,
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
} from './MatchLogic.js';
import { generateSolvableLevel } from './LevelGenerator.js';
import {
  claimDailyFreeSkill,
  getDailyFreeSkills,
} from './DailySeed.js';

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
      skillAdGranted: {
        shuffle: false,
        takeToHold: false,
        undo: false,
        peek: false,
        collect: false,
      },
      undoStack: [],
      moves: 0,
      startTime: Date.now(),
      reviveUsed: { video: 0, share: 0 },
      mode: config.mode,
      level: config.level,
      seed: level.seed,
      status: 'playing',
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

  /** 从列顶取牌（从上往下） */
  pickFromColumn(columnIndex: number): boolean {
    if (this.data.status !== 'playing') return false;
    const col = this.data.columns[columnIndex];
    if (!col || col.length === 0) return false;

    this.saveSnapshot();
    const card = col.pop()!;

    this.data.slots.push(card);
    this.data.moves++;

    this.groupSlotsBySuit();
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

    this.groupSlotsBySuit();
    const matches = tryAutoMatch(this.data.slots);
    this.emit({ type: 'cardFromHold', card });
    if (matches.length > 0) {
      this.emit({ type: 'matched', results: matches });
    }

    return this.checkEndState();
  }

  /** 将槽内同花色牌排列在一起 */
  private groupSlotsBySuit(): void {
    const slots = this.data.slots;
    slots.sort((a, b) => a.suit - b.suit);
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
    // 从上往下取牌：顶部牌是数组最后一个，透视显示顶部下面的2张牌
    const start = Math.max(0, col.length - 3);
    return col.slice(start, col.length - 1);
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

  /** 检查技能是否可使用（包含每日免费和广告获取逻辑） */
  canUseSkill(skill: SkillType): { canUse: boolean; reason?: string } {
    if (this.data.status !== 'playing') {
      return { canUse: false, reason: '游戏未进行' };
    }

    const limit = SKILL_LIMITS[skill];
    const used = this.data.skillUses[skill];

    // 如果还有剩余次数，直接可用
    if (used < limit) {
      return { canUse: true };
    }

    // 检查每日免费技能是否可用
    const dailyFree = getDailyFreeSkills();
    const skillKey = skill as 'shuffle' | 'undo' | 'peek';
    if (dailyFree[skillKey] === false) {
      return { canUse: true, reason: 'daily_free' };
    }

    // 检查广告获取是否可用
    if (this.data.skillAdGranted[skill] === false) {
      return { canUse: true, reason: 'ad_grant' };
    }

    return { canUse: false, reason: 'exhausted' };
  }

  /** 尝试使用技能（自动处理每日免费和广告获取） */
  tryApplySkill(skill: SkillType): { success: boolean; newUses: number; grantedBy?: 'daily' | 'ad' } {
    const check = this.canUseSkill(skill);
    if (!check.canUse) {
      return { success: false, newUses: this.data.skillUses[skill] };
    }

    const limit = SKILL_LIMITS[skill];
    const used = this.data.skillUses[skill];

    // 如果还有剩余次数，直接使用
    if (used < limit) {
      const result = this.applySkillDirect(skill);
      return { success: result, newUses: this.data.skillUses[skill] };
    }

    // 检查每日免费技能
    const skillKey = skill as 'shuffle' | 'undo' | 'peek';
    const dailyFree = getDailyFreeSkills();
    if (dailyFree[skillKey] === false) {
      claimDailyFreeSkill(skillKey);
      const result = this.applySkillDirect(skill);
      return { success: result, newUses: this.data.skillUses[skill], grantedBy: 'daily' };
    }

    // 检查广告获取
    if (this.data.skillAdGranted[skill] === false) {
      this.data.skillAdGranted[skill] = true;
      const result = this.applySkillDirect(skill);
      return { success: result, newUses: this.data.skillUses[skill], grantedBy: 'ad' };
    }

    return { success: false, newUses: this.data.skillUses[skill] };
  }

  /** 标记技能已通过广告获取（由GameController在广告完成后调用） */
  grantSkillViaAd(skill: SkillType): boolean {
    if (this.data.status !== 'playing') return false;
    if (this.data.skillAdGranted[skill]) return false; // 已经获取过了

    this.data.skillAdGranted[skill] = true;
    return true;
  }

  /** 检查每日免费技能是否还有剩余 */
  hasDailyFreeSkill(skill: SkillType): boolean {
    const skillKey = skill as 'shuffle' | 'undo' | 'peek';
    const dailyFree = getDailyFreeSkills();
    return dailyFree[skillKey] === false;
  }

  /** 检查广告获取是否还有剩余 */
  canGrantViaAd(skill: SkillType): boolean {
    return this.data.skillAdGranted[skill] === false;
  }

  /** 直接应用技能（内部使用，不检查次数） */
  private applySkillDirect(skill: SkillType): boolean {
    switch (skill) {
      case SkillType.Undo:
        return this.undo();
      case SkillType.Shuffle:
        return this.shuffle();
      case SkillType.Peek:
        return this.peek();
      case SkillType.Collect:
        return this.collect();
      default:
        return false;
    }
  }

  applySkill(skill: SkillType, wildSlotIndex?: number): boolean {
    const result = this.tryApplySkill(skill);
    return result.success;
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
    // 依次循环分发，保证每列从下往上堆叠（index 0 = 底部 = 最先可取）
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

  /** 凑齐技能：从现有牌中凑齐3张同花色消除 */
  private collect(): boolean {
    // 统计所有可用牌的花色数量（列顶 + 卡槽 + 待用区）
    const suitCounts = new Map<Suit, { count: number; sources: { location: string; index: number }[] }>();

    // 统计列顶牌
    this.data.columns.forEach((col, colIdx) => {
      if (col.length > 0) {
        const card = col[col.length - 1];
        const info = suitCounts.get(card.suit) || { count: 0, sources: [] };
        info.count++;
        info.sources.push({ location: 'column', index: colIdx });
        suitCounts.set(card.suit, info);
      }
    });

    // 统计卡槽牌
    this.data.slots.forEach((card, slotIdx) => {
      const info = suitCounts.get(card.suit) || { count: 0, sources: [] };
      info.count++;
      info.sources.push({ location: 'slot', index: slotIdx });
      suitCounts.set(card.suit, info);
    });

    // 统计待用区牌
    this.data.holdArea.forEach((card, holdIdx) => {
      const info = suitCounts.get(card.suit) || { count: 0, sources: [] };
      info.count++;
      info.sources.push({ location: 'hold', index: holdIdx });
      suitCounts.set(card.suit, info);
    });

    // 找到能凑齐3张的花色（排除技能牌花色）
    const JOKER_SUIT_VALUE = 10; // Suit.Joker 的值
    for (const [suit, info] of suitCounts.entries()) {
      if (info.count >= 3 && (suit as number) !== JOKER_SUIT_VALUE) {
        this.saveSnapshot();
        
        // 取出3张牌
        const taken: Card[] = [];
        let remaining = 3;
        
        // 先从待用区取（优先消耗待用区的牌）
        for (let i = info.sources.length - 1; i >= 0 && remaining > 0; i--) {
          const src = info.sources[i];
          if (src.location === 'hold') {
            taken.push(this.data.holdArea.splice(src.index, 1)[0]);
            remaining--;
          }
        }
        
        // 再从卡槽取
        for (let i = info.sources.length - 1; i >= 0 && remaining > 0; i--) {
          const src = info.sources[i];
          if (src.location === 'slot') {
            taken.push(this.data.slots.splice(src.index, 1)[0]);
            remaining--;
          }
        }
        
        // 最后从列顶取
        for (let i = info.sources.length - 1; i >= 0 && remaining > 0; i--) {
          const src = info.sources[i];
          if (src.location === 'column') {
            taken.push(this.data.columns[src.index].pop()!);
            remaining--;
          }
        }

        this.data.skillUses[SkillType.Collect]++;
        this.emit({ type: 'matched', results: [{ eliminated: taken, matchedSuit: suit }] });
        this.emit({ type: 'skillUsed', skill: SkillType.Collect });
        return this.checkEndState();
      }
    }

    return false; // 没有能凑齐的花色
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

  revive(method: 'video' | 'share'): ReviveResult {
    if (this.data.status !== 'lost') {
      return { success: false, clearedSlots: 0 };
    }

    const limit = REVIVE_LIMITS[method];
    if (this.data.reviveUsed[method] >= limit) {
      return { success: false, clearedSlots: 0 };
    }

    const moveCount = Math.min(REVIVE_CLEAR_SLOTS, this.data.slots.length);
    const availableHoldSpace = HOLD_COUNT - this.data.holdArea.length;
    const actualMoveCount = Math.min(moveCount, availableHoldSpace);
    
    const movedCards = this.data.slots.splice(-actualMoveCount, actualMoveCount);
    this.data.holdArea.push(...movedCards);
    
    this.data.reviveUsed[method]++;
    this.data.status = 'playing';

    this.emit({ type: 'revived', method });
    return { success: true, clearedSlots: actualMoveCount };
  }

  /** 是否还可以复活（每局游戏只能复活一次，视频或分享二选一） */
  canRevive(): boolean {
    if (this.data.status !== 'lost') return false;
    const totalUsed = this.data.reviveUsed.video + this.data.reviveUsed.share;
    return totalUsed < 1;
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
