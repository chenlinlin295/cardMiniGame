import {
  COLUMN_COUNT,
  SUIT_COUNT,
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

/** 生成3张技能牌，其余97张普通牌均分到10种花色 */
export function buildDeckWithLucky3(_luckySuit: Suit, rng: SeededRandom): Card[] {
  resetCardIdCounter();
  const deck: Card[] = [];
  const SKILL_CARD_COUNT = 3;
  const NORMAL_COUNT = TOTAL_CARDS - SKILL_CARD_COUNT;
  const PER_SUIT = Math.floor(NORMAL_COUNT / SUIT_COUNT);
  const EXTRA = NORMAL_COUNT % SUIT_COUNT;

  for (let suit = 0; suit < SUIT_COUNT; suit++) {
    const count = PER_SUIT + (suit < EXTRA ? 1 : 0);
    for (let i = 0; i < count; i++) {
      deck.push(createCard(suit as Suit, false));
    }
  }

  // 添加3张技能牌（随机花色）
  for (let i = 0; i < SKILL_CARD_COUNT; i++) {
    const randomSuit = rng.nextInt(0, SUIT_COUNT - 1) as Suit;
    deck.push(createCard(randomSuit, true));
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

/** 逆向构造可解关卡：3张技能牌，其余均分 */
export function generateSolvableLevel(config: LevelConfig, options: GeneratorOptions = {}): GeneratedLevel {
  const rng = new SeededRandom(config.seed);
  const maxAttempts = options.maxAttempts ?? 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const attemptRng = new SeededRandom(config.seed + attempt * 9973);
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

/** 获取花色权重（3张技能牌，其余均分） */
function getLucky3Weights(): number[] {
  const NORMAL_COUNT = TOTAL_CARDS - 3;
  const PER_SUIT = Math.floor(NORMAL_COUNT / SUIT_COUNT);
  const EXTRA = NORMAL_COUNT % SUIT_COUNT;
  return Array.from({ length: SUIT_COUNT }, (_, suit) =>
    PER_SUIT + (suit < EXTRA ? 1 : 0),
  );
}

/** 基础可解性检查 */
function verifyBasicSolvability(columns: Card[][]): boolean {
  const allCards = columns.flat();
  const skillCardCount = allCards.filter((c) => c.isSkillCard).length;
  const suitCounts = new Array(SUIT_COUNT).fill(0);
  allCards.forEach((c) => {
    if (!c.isSkillCard || c.skillConsumed) {
      suitCounts[c.suit]++;
    }
  });

  let remainderNeeds = 0;
  for (let s = 0; s < SUIT_COUNT; s++) {
    const rem = suitCounts[s] % 3;
    if (rem > 0) remainderNeeds += rem;
  }

  return skillCardCount * 2 >= remainderNeeds;
}

/** 逆向构造法 fallback：直接洗牌均分（保证100张） */
function generateConstructedLevel(
  config: LevelConfig,
  weights: number[],
  rng: SeededRandom,
): GeneratedLevel {
  resetCardIdCounter();
  const deck: Card[] = [];
  for (let suit = 0; suit < weights.length; suit++) {
    for (let i = 0; i < weights[suit]; i++) {
      deck.push(createCard(suit as Suit, false));
    }
  }
  
  // 添加3张技能牌（随机花色）
  for (let i = 0; i < 3; i++) {
    const randomSuit = rng.nextInt(0, SUIT_COUNT - 1) as Suit;
    deck.push(createCard(randomSuit, true));
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
