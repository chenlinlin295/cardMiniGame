import { hashString, SeededRandom } from './utils.js';
import type { LevelConfig } from './types.js';
import { Suit } from './types.js';

const DAILY_SALT = 'animal-card-daily-v1';

/** 生成每日挑战种子：YYYYMMDD + salt → 全服同局 */
export function getDailySeed(date: Date = new Date()): number {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  return hashString(`${dateStr}_${DAILY_SALT}`);
}

/** 每日挑战固定幸运花色（全服一致） */
export function getDailyLuckySuit(date: Date = new Date()): Suit {
  const seed = getDailySeed(date);
  const rng = new SeededRandom(seed);
  return rng.nextInt(0, 9) as Suit;
}

export function createDailyLevelConfig(date: Date = new Date(), luckySuit?: Suit): LevelConfig {
  return {
    seed: getDailySeed(date),
    luckySuit: luckySuit ?? getDailyLuckySuit(date),
    mode: 'daily',
    level: 1,
    difficulty: 0.5,
  };
}

export function createEndlessLevelConfig(level: number, luckySuit: Suit, seed?: number): LevelConfig {
  const difficulty = Math.min(0.9, 0.2 + (level - 1) * 0.05);
  return {
    seed: seed ?? Date.now(),
    luckySuit,
    mode: 'endless',
    level,
    difficulty,
  };
}

export function formatDailyDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 计算每日排名分数：步数越少、用时越短、技能越少 → 分越高 */
export function calcDailyScore(moves: number, timeMs: number, skillUses: number): number {
  const base = 10000;
  const movePenalty = moves * 10;
  const timePenalty = Math.floor(timeMs / 1000) * 5;
  const skillPenalty = skillUses * 50;
  return Math.max(0, base - movePenalty - timePenalty - skillPenalty);
}

export interface DailyResult {
  date: string;
  score: number;
  moves: number;
  timeMs: number;
  skillUses: number;
  completed: boolean;
}

export function saveDailyResult(result: DailyResult): void {
  if (typeof localStorage === 'undefined') return;
  const key = `daily_${result.date}`;
  const existing = localStorage.getItem(key);
  if (existing) {
    const prev = JSON.parse(existing) as DailyResult;
    if (prev.score >= result.score) return;
  }
  localStorage.setItem(key, JSON.stringify(result));
}

export function loadDailyResult(date: string): DailyResult | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(`daily_${date}`);
  return raw ? (JSON.parse(raw) as DailyResult) : null;
}

export function getEndlessBestLevel(): number {
  if (typeof localStorage === 'undefined') return 0;
  return parseInt(localStorage.getItem('endless_best') ?? '0', 10);
}

export function saveEndlessBestLevel(level: number): void {
  if (typeof localStorage === 'undefined') return;
  const current = getEndlessBestLevel();
  if (level > current) {
    localStorage.setItem('endless_best', String(level));
  }
}

export function getEndlessFailStreak(): number {
  if (typeof localStorage === 'undefined') return 0;
  return parseInt(localStorage.getItem('endless_fail_streak') ?? '0', 10);
}

export function setEndlessFailStreak(streak: number): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('endless_fail_streak', String(streak));
}
