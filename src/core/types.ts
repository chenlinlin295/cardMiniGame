/** 10 种动物花色 + 1种技能牌花色 */
export enum Suit {
  Cat = 0,
  Dog = 1,
  Rabbit = 2,
  Bear = 3,
  Fox = 4,
  Panda = 5,
  Koala = 6,
  Pig = 7,
  Frog = 8,
  Penguin = 9,
  Joker = 10,
}

/** 普通花色数量 */
export const SUIT_COUNT = 10;
/** 总花色数量（含技能牌） */
export const TOTAL_SUIT_COUNT = 11;
export const TOTAL_CARDS = 90;
export const SKILL_CARD_COUNT = 3;
export const COLUMN_COUNT = 5;
export const SLOT_COUNT = 7;
export const HOLD_COUNT = 3;
export const PEEK_DEPTH = 2;
export const PEEK_DURATION_MS = 10_000;
export const EXTRA_SLOT_DURATION_MS = 30_000;

export const SUIT_NAMES: Record<Suit, string> = {
  [Suit.Cat]: '猫',
  [Suit.Dog]: '狗',
  [Suit.Rabbit]: '兔',
  [Suit.Bear]: '熊',
  [Suit.Fox]: '狐',
  [Suit.Panda]: '熊猫',
  [Suit.Koala]: '考拉',
  [Suit.Pig]: '猪',
  [Suit.Frog]: '蛙',
  [Suit.Penguin]: '🐧',
  [Suit.Joker]: '技能',
};

export const SUIT_EMOJIS: Record<Suit, string> = {
  [Suit.Cat]: '🐱',
  [Suit.Dog]: '🐶',
  [Suit.Rabbit]: '🐰',
  [Suit.Bear]: '🐻',
  [Suit.Fox]: '🦊',
  [Suit.Panda]: '🐼',
  [Suit.Koala]: '🐨',
  [Suit.Pig]: '🐷',
  [Suit.Frog]: '🐸',
  [Suit.Penguin]: '🐧',
  [Suit.Joker]: '⭐',
};

export enum SkillType {
  Shuffle = 'shuffle',
  TakeToHold = 'takeToHold',
  Undo = 'undo',
  Peek = 'peek',
  Collect = 'collect',
}

export const SKILL_LIMITS: Record<SkillType, number> = {
  [SkillType.Shuffle]: 1,
  [SkillType.TakeToHold]: 1,
  [SkillType.Undo]: 1,
  [SkillType.Peek]: 1,
  [SkillType.Collect]: 1,
};

export type GameMode = 'daily' | 'endless';

export type GameStatus = 'playing' | 'won' | 'lost' | 'paused';

export interface Card {
  id: string;
  suit: Suit;
}

export interface GameSnapshot {
  columns: Card[][];
  slots: Card[];
  holdArea: Card[];
  moves: number;
  maxSlots: number;
  extraSlotUntil: number;
  peekUntil: number;
  skillUses: Record<SkillType, number>;
}

export interface LevelConfig {
  seed: number;
  luckySuit: Suit;
  mode: GameMode;
  level: number;
  /** 难度 0~1 */
  difficulty: number;
}

export interface GameStateData {
  columns: Card[][];
  slots: Card[];
  holdArea: Card[];
  luckySuit: Suit;
  maxSlots: number;
  extraSlotUntil: number;
  peekUntil: number;
  skillUses: Record<SkillType, number>;
  /** 每局游戏中通过广告获取的技能（每种技能仅限一次） */
  skillAdGranted: Record<SkillType, boolean>;
  undoStack: GameSnapshot[];
  moves: number;
  startTime: number;
  reviveUsed: { video: number; share: number };
  mode: GameMode;
  level: number;
  seed: number;
  status: GameStatus;
  /** 无尽模式连续失败计数（用于插屏） */
  endlessFailStreak: number;
}

export interface MatchResult {
  eliminated: Card[];
  matchedSuit: Suit;
}

export interface ReviveResult {
  success: boolean;
  clearedSlots: number;
}

export const DEFAULT_SUIT_WEIGHTS: number[] = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9];

export const REVIVE_LIMITS = {
  video: 1,
  share: 1,
} as const;

export const REVIVE_CLEAR_SLOTS = 3;

export const ENDLESS_INTERSTITIAL_EVERY = 3;
