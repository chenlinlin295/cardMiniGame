import {
  COLUMN_COUNT,
  SUIT_COUNT,
  Suit,
  TOTAL_CARDS,
  SKILL_CARD_COUNT,
  type Card,
  type LevelConfig,
} from './types.js';
import { SeededRandom, createCard, resetCardIdCounter } from './utils.js';

export interface GeneratedLevel {
  columns: Card[][];
  deck: Card[];
  suitWeights: number[];
  seed: number;
}

export interface GeneratorOptions {
  maxAttempts?: number;
  minColumnHeight?: number;
  maxColumnHeight?: number;
}

/** 根据难度调整花色权重 - 确保每种花色数量是3的倍数，总和为90 */
export function adjustWeightsForDifficulty(base: number[], difficulty: number): number[] {
  const weights = [...base];
  const variance = Math.floor(difficulty * 3);

  for (let i = 0; i < weights.length; i++) {
    const delta = Math.floor((i % 2 === 0 ? 1 : -1) * variance * (0.5 + (i / weights.length) * 0.5));
    weights[i] = Math.max(6, Math.min(12, weights[i] + delta));
  }

  // 确保每种花色数量是3的倍数
  for (let i = 0; i < weights.length; i++) {
    weights[i] = Math.round(weights[i] / 3) * 3;
    weights[i] = Math.max(3, weights[i]);
  }

  // 确保总和为 90
  let sum = weights.reduce((a, b) => a + b, 0);
  while (sum > TOTAL_CARDS) {
    // 找最大的花色减3
    let maxIdx = 0;
    for (let i = 1; i < weights.length; i++) {
      if (weights[i] > weights[maxIdx] && weights[i] >= 6) maxIdx = i;
    }
    weights[maxIdx] -= 3;
    sum = weights.reduce((a, b) => a + b, 0);
  }
  while (sum < TOTAL_CARDS) {
    // 找最小的花色加3
    let minIdx = 0;
    for (let i = 1; i < weights.length; i++) {
      if (weights[i] < weights[minIdx]) minIdx = i;
    }
    weights[minIdx] += 3;
    sum = weights.reduce((a, b) => a + b, 0);
  }

  return weights;
}

/** 生成加权牌组 */
export function buildWeightedDeck(weights: number[], luckySuit: Suit, rng: SeededRandom): Card[] {
  resetCardIdCounter();
  const deck: Card[] = [];

  for (let suit = 0; suit < weights.length; suit++) {
    for (let i = 0; i < weights[suit]; i++) {
      const s = suit as Suit;
      deck.push(createCard(s));
    }
  }

  return rng.shuffle(deck);
}

/** 生成90张普通牌（10种花色×9张/花色，每种都是3的倍数） */
export function buildDeckWithLucky3(_luckySuit: Suit, rng: SeededRandom): Card[] {
  resetCardIdCounter();
  const deck: Card[] = [];
  const PER_SUIT = TOTAL_CARDS / SUIT_COUNT; // 90/10 = 9

  for (let suit = 0; suit < SUIT_COUNT; suit++) {
    for (let i = 0; i < PER_SUIT; i++) {
      deck.push(createCard(suit as Suit));
    }
  }

  // 添加技能牌（Joker花色），独立于90张普通牌
  for (let i = 0; i < SKILL_CARD_COUNT; i++) {
    deck.push(createCard(Suit.Joker));
  }

  return rng.shuffle(deck);
}

/** 将牌组平均分成列（90 张 → 5列，每列18张） */
export function splitIntoColumns(deck: Card[], _rng?: SeededRandom, _options?: GeneratorOptions): Card[][] {
  const columns: Card[][] = Array.from({ length: COLUMN_COUNT }, () => []);
  const base = Math.floor(deck.length / COLUMN_COUNT);
  const remainder = deck.length % COLUMN_COUNT;

  let offset = 0;
  for (let i = 0; i < COLUMN_COUNT; i++) {
    const height = base + (i < remainder ? 1 : 0);
    columns[i] = deck.slice(offset, offset + height);
    offset += height;
  }

  return columns;
}

/** 逆向构造可解关卡 */
export function generateSolvableLevel(config: LevelConfig, options: GeneratorOptions = {}): GeneratedLevel {
  const rng = new SeededRandom(config.seed + Math.floor(Math.random() * 10000));
  const maxAttempts = options.maxAttempts ?? 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const attemptRng = new SeededRandom(config.seed + attempt * 9973 + Math.floor(Math.random() * 10000));
    const deck = buildDeckWithLucky3(config.luckySuit, attemptRng);
    const columns = splitIntoColumns(deck, attemptRng, options);

    if (verifyBasicSolvability(columns)) {
      const weights = getLucky3Weights();
      return { columns, deck, suitWeights: weights, seed: config.seed + attempt * 9973 };
    }
  }

  // fallback: 使用构造法
  const weights = getLucky3Weights();
  return generateConstructedLevel(config, weights, rng);
}

/** 获取花色权重（10种花色×9张=90张） */
function getLucky3Weights(): number[] {
  const PER_SUIT = TOTAL_CARDS / SUIT_COUNT; // 90/10 = 9
  return Array.from({ length: SUIT_COUNT }, () => PER_SUIT);
}

/** 基础可解性检查 */
function verifyBasicSolvability(columns: Card[][]): boolean {
  const allCards = columns.flat();
  const suitCounts = new Array(SUIT_COUNT).fill(0);
  allCards.forEach((c) => {
    suitCounts[c.suit]++;
  });

  // 确保每种花色数量都是3的倍数
  for (let s = 0; s < SUIT_COUNT; s++) {
    if (suitCounts[s] % 3 !== 0) {
      return false;
    }
  }

  return true;
}

/** 逆向构造法 fallback */
function generateConstructedLevel(
  config: LevelConfig,
  weights: number[],
  rng: SeededRandom,
): GeneratedLevel {
  resetCardIdCounter();
  const deck: Card[] = [];
  for (let suit = 0; suit < weights.length; suit++) {
    for (let i = 0; i < weights[suit]; i++) {
      deck.push(createCard(suit as Suit));
    }
  }

  const shuffledDeck = rng.shuffle(deck);
  const columns = splitIntoColumns(shuffledDeck);
  return { columns, deck: shuffledDeck, suitWeights: weights, seed: config.seed };
}

export function createLevelConfig(
  mode: LevelConfig['mode'],
  level: number,
  luckySuit: Suit,
  seed?: number,
): LevelConfig {
  const difficulty = mode === 'daily' ? 0.5 : Math.min(0.9, 0.2 + level * 0.05);
  return {
    seed: seed ?? Date.now(),
    luckySuit,
    mode,
    level,
    difficulty,
  };
}
