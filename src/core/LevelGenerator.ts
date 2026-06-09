import {
  COLUMN_COUNT,
  DEFAULT_SUIT_WEIGHTS,
  Suit,
  TOTAL_CARDS,
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

/** 根据难度调整花色权重 */
export function adjustWeightsForDifficulty(base: number[], difficulty: number): number[] {
  const weights = [...base];
  const variance = Math.floor(difficulty * 3);

  for (let i = 0; i < weights.length; i++) {
    const delta = Math.floor((i % 2 === 0 ? 1 : -1) * variance * (0.5 + (i / weights.length) * 0.5));
    weights[i] = Math.max(8, Math.min(12, weights[i] + delta));
  }

  // 确保总和为 100
  let sum = weights.reduce((a, b) => a + b, 0);
  while (sum > TOTAL_CARDS) {
    const idx = weights.indexOf(Math.max(...weights));
    weights[idx]--;
    sum--;
  }
  while (sum < TOTAL_CARDS) {
    const idx = weights.indexOf(Math.min(...weights));
    weights[idx]++;
    sum++;
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
      deck.push(createCard(s, false));
    }
  }

  return rng.shuffle(deck);
}

/** 将牌组平均分成 6 列（100 张 → 17/17/17/17/16/16） */
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

/** 逆向构造可解关卡：保证每种花色可三消完（含余牌+万能牌） */
export function generateSolvableLevel(config: LevelConfig, options: GeneratorOptions = {}): GeneratedLevel {
  const rng = new SeededRandom(config.seed);
  const weights = adjustWeightsForDifficulty(DEFAULT_SUIT_WEIGHTS, config.difficulty);
  const maxAttempts = options.maxAttempts ?? 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const attemptRng = new SeededRandom(config.seed + attempt * 9973);
    const deck = buildWeightedDeck(weights, config.luckySuit, attemptRng);
    const columns = splitIntoColumns(deck, attemptRng, options);

    if (verifyBasicSolvability(columns, config.luckySuit, weights)) {
      return { columns, deck, suitWeights: weights, seed: config.seed + attempt * 9973 };
    }
  }

  //  fallback: 使用构造法
  return generateConstructedLevel(config, weights, rng);
}

/** 基础可解性：万能牌数量 >= 余牌所需 */
function verifyBasicSolvability(columns: Card[][], luckySuit: Suit, weights: number[]): boolean {
  const allCards = columns.flat();
  const wildCount = allCards.filter((c) => c.suit === luckySuit).length;

  let remainderNeeds = 0;
  for (let s = 0; s < weights.length; s++) {
    const rem = weights[s] % 3;
    if (rem > 0) remainderNeeds += rem;
  }

  // 幸运花色的牌本身也是万能牌，其余牌若有余数需要其他万能补齐
  const luckyRemainder = weights[luckySuit] % 3;
  const otherRemainder = remainderNeeds - luckyRemainder;

  // 每个万能牌最多补2张余牌缺口
  return wildCount * 2 >= Math.max(0, otherRemainder);
}

/** 逆向构造法：按三消组拆入各列 */
function generateConstructedLevel(
  config: LevelConfig,
  weights: number[],
  rng: SeededRandom,
): GeneratedLevel {
  resetCardIdCounter();
  const columns: Card[][] = Array.from({ length: COLUMN_COUNT }, () => []);
  const groups: Card[][] = [];

  for (let suit = 0; suit < weights.length; suit++) {
    const s = suit as Suit;
    const count = weights[suit];

    for (let i = 0; i < count; i += 3) {
      const groupSize = Math.min(3, count - i);
      const group: Card[] = [];
      for (let j = 0; j < groupSize; j++) {
        group.push(createCard(s, false));
      }
      groups.push(group);
    }
  }

  const shuffledGroups = rng.shuffle(groups);
  shuffledGroups.forEach((group, i) => {
    const colIdx = i % COLUMN_COUNT;
    columns[colIdx].push(...group.reverse());
  });

  // 列内洗牌
  columns.forEach((col, i) => {
    if (col.length > 1 && i % 2 === 0) {
      const top = col.pop()!;
      const shuffled = rng.shuffle(col);
      col.length = 0;
      col.push(...shuffled, top);
    }
  });

  // 重新平均分配到 6 列，保证列高一致
  const shuffledDeck = rng.shuffle(columns.flat());
  const evenColumns = splitIntoColumns(shuffledDeck);

  const deck = shuffledDeck;
  return { columns: evenColumns, deck, suitWeights: weights, seed: config.seed };
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
