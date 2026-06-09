/**
 * Cocos 主菜单场景控制器
 */
import { _decorator, Component, director } from 'cc';
import { getDailyLuckySuit, formatDailyDate, getEndlessBestLevel } from '../../../src/core/DailySeed';
import { SUIT_EMOJIS, SUIT_NAMES } from '../../../src/core/types';
import { createAdManager } from '../../../src/ad/AdManager';

const { ccclass } = _decorator;

@ccclass('MainMenu')
export class MainMenu extends Component {
  private ads = createAdManager();

  onLoad() {
    this.ads.showBanner();
  }

  onDailyChallenge() {
    const suit = getDailyLuckySuit();
    director.loadScene('Game', () => {
      const gameManager = director.getScene()?.getComponentInChildren('GameManager');
      if (gameManager) {
        (gameManager as import('./GameManager').GameManager).startDailyGame(suit);
      }
    });
  }

  onEndlessMode() {
    director.loadScene('LuckyPick');
  }

  getDailyInfo() {
    const suit = getDailyLuckySuit();
    return {
      date: formatDailyDate(),
      luckyEmoji: SUIT_EMOJIS[suit],
      luckyName: SUIT_NAMES[suit],
      bestLevel: getEndlessBestLevel(),
    };
  }
}
