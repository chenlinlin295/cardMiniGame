import { GameState } from '../core/GameState.js';
import { SkillManager } from '../skill/SkillManager.js';
import { createAdManager, type AdManager } from '../ad/AdManager.js';
import {
  calcDailyScore,
  createDailyLevelConfig,
  createEndlessLevelConfig,
  formatDailyDate,
  getDailyLuckySuit,
  getDailySeed,
  getEndlessBestLevel,
  getEndlessFailStreak,
  loadDailyResult,
  saveDailyResult,
  saveEndlessBestLevel,
  setEndlessFailStreak,
  type DailyResult,
} from '../core/DailySeed.js';
import { ENDLESS_INTERSTITIAL_EVERY, Suit, SUIT_EMOJIS, SUIT_NAMES } from '../core/types.js';

export interface GameSessionResult {
  won: boolean;
  mode: 'daily' | 'endless';
  level: number;
  moves: number;
  timeMs: number;
  skillUses: number;
  score: number;
  showInterstitial: boolean;
}

export class GameController {
  game: GameState;
  skills: SkillManager;
  ads: AdManager;
  mode: 'daily' | 'endless';
  level: number;
  luckySuit: Suit;

  constructor(mode: 'daily' | 'endless', luckySuit?: Suit, level = 1) {
    this.mode = mode;
    this.level = level;
    this.luckySuit = luckySuit ?? (mode === 'daily' ? getDailyLuckySuit() : Suit.Cat);

    const config =
      mode === 'daily'
        ? createDailyLevelConfig(undefined, this.luckySuit)
        : createEndlessLevelConfig(level, this.luckySuit);

    this.game = new GameState(config);
    this.skills = new SkillManager(this.game);
    this.ads = createAdManager();

    this.game.on((event) => {
      if (event.type === 'matched') {
        this.ads.vibrateShort();
      }
    });
  }

  static createDaily(luckySuit?: Suit): GameController {
    return new GameController('daily', luckySuit ?? getDailyLuckySuit());
  }

  static createEndless(level: number, luckySuit: Suit): GameController {
    return new GameController('endless', luckySuit, level);
  }

  pickColumn(index: number): boolean {
    return this.game.pickFromColumn(index);
  }

  pickHold(index: number): boolean {
    return this.game.pickFromHold(index);
  }

  takeToHold(indices: number[]): boolean {
    return this.skills.takeToHold(indices);
  }

  getAccumulatedSkills(): import('../core/types.js').SkillType[] {
    return [];
  }

  addAccumulatedSkill(skill: import('../core/types.js').SkillType): void {
    // 技能牌已移除，此方法不再使用
  }

  useAccumulatedSkill(skill: import('../core/types.js').SkillType): boolean {
    return false;
  }

  reviveWithVideo(): Promise<boolean> {
    return new Promise((resolve) => {
      this.ads.showRewarded((success) => {
        if (success) {
          const result = this.game.revive('video');
          resolve(result.success);
        } else {
          resolve(false);
        }
      });
    });
  }

  reviveWithShare(): Promise<boolean> {
    return new Promise((resolve) => {
      this.ads.shareForRevive((success) => {
        if (success) {
          const result = this.game.revive('share');
          resolve(result.success);
        } else {
          resolve(false);
        }
      });
    });
  }

  finishSession(): GameSessionResult {
    const state = this.game.getState();
    const won = state.status === 'won';
    const timeMs = this.game.getElapsedMs();
    const skillUses = this.game.getTotalSkillUses();
    const score =
      this.mode === 'daily'
        ? calcDailyScore(state.moves, timeMs, skillUses)
        : state.level * 1000 + (won ? 500 : 0);

    let showInterstitial = false;

    if (this.mode === 'daily') {
      showInterstitial = true;
      if (won) {
        saveDailyResult({
          date: formatDailyDate(),
          score,
          moves: state.moves,
          timeMs,
          skillUses,
          completed: true,
        });
      }
    } else {
      if (won) {
        saveEndlessBestLevel(state.level);
        setEndlessFailStreak(0);
      } else {
        const streak = getEndlessFailStreak() + 1;
        setEndlessFailStreak(streak);
        showInterstitial = streak % ENDLESS_INTERSTITIAL_EVERY === 0;
      }
    }

    if (showInterstitial) {
      this.ads.showInterstitial(this.mode === 'daily', getEndlessFailStreak());
    }

    return {
      won,
      mode: this.mode,
      level: state.level,
      moves: state.moves,
      timeMs,
      skillUses,
      score,
      showInterstitial,
    };
  }

  getDailyInfo() {
    const date = formatDailyDate();
    return {
      date,
      seed: getDailySeed(),
      luckySuit: getDailyLuckySuit(),
      luckyName: SUIT_NAMES[getDailyLuckySuit()],
      luckyEmoji: SUIT_EMOJIS[getDailyLuckySuit()],
      previousResult: loadDailyResult(date),
    };
  }

  getEndlessInfo() {
    return {
      bestLevel: getEndlessBestLevel(),
      currentLevel: this.level,
      failStreak: getEndlessFailStreak(),
    };
  }

  /** 无尽模式过关后进入下一关 */
  nextEndlessLevel(): GameController {
    const nextLevel = this.level + 1;
    return GameController.createEndless(nextLevel, this.luckySuit);
  }
}

export type { DailyResult };
