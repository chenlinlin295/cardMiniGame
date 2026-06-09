export type AdPlatform = 'wechat' | 'douyin' | 'web';

export type AdType = 'rewarded' | 'interstitial' | 'banner';

export interface AdConfig {
  platform: AdPlatform;
  rewardedAdUnitId?: string;
  interstitialAdUnitId?: string;
  bannerAdUnitId?: string;
}

type AdCallback = (success: boolean) => void;

/** 多平台广告管理器抽象层 */
export class AdManager {
  private platform: AdPlatform;
  private config: AdConfig;
  private bannerVisible = false;
  private interstitialCount = 0;

  // 微信/抖音广告实例占位
  private rewardedAd: unknown = null;
  private interstitialAd: unknown = null;
  private bannerAd: unknown = null;

  constructor(config: AdConfig) {
    this.platform = config.platform;
    this.config = config;
    this.initAds();
  }

  private initAds(): void {
    if (this.platform === 'wechat' && typeof wx !== 'undefined') {
      this.initWechatAds();
    } else if (this.platform === 'douyin' && typeof tt !== 'undefined') {
      this.initDouyinAds();
    }
  }

  private initWechatAds(): void {
    const wxApi = wx as WechatMinigame.Wx;
    if (this.config.rewardedAdUnitId) {
      this.rewardedAd = wxApi.createRewardedVideoAd({
        adUnitId: this.config.rewardedAdUnitId,
      });
    }
    if (this.config.interstitialAdUnitId) {
      this.interstitialAd = wxApi.createInterstitialAd({
        adUnitId: this.config.interstitialAdUnitId,
      });
    }
    if (this.config.bannerAdUnitId) {
      const sysInfo = wxApi.getSystemInfoSync();
      this.bannerAd = wxApi.createBannerAd({
        adUnitId: this.config.bannerAdUnitId,
        style: {
          left: 0,
          top: sysInfo.windowHeight - 100,
          width: sysInfo.windowWidth,
        },
      });
    }
  }

  private initDouyinAds(): void {
    const ttApi = tt as DouyinMinigame.TT;
    if (this.config.rewardedAdUnitId) {
      this.rewardedAd = ttApi.createRewardedVideoAd({
        adUnitId: this.config.rewardedAdUnitId,
      });
    }
  }

  /** 展示激励视频 */
  showRewarded(callback: AdCallback): void {
    if (this.platform === 'wechat' && this.rewardedAd) {
      const ad = this.rewardedAd as WechatMinigame.RewardedVideoAd;
      ad.show().catch(() => {
        ad.load().then(() => ad.show());
      });
      ad.onClose((res) => {
        callback(res?.isEnded ?? false);
      });
      return;
    }

    if (this.platform === 'douyin' && this.rewardedAd) {
      const ad = this.rewardedAd as DouyinMinigame.RewardedVideoAd;
      ad.show().then(() => {
        ad.onClose((res: { isEnded: boolean }) => {
          callback(res.isEnded);
        });
      }).catch(() => callback(false));
      return;
    }

    // Web 开发模式：模拟成功
    console.log('[AdManager] Mock rewarded ad');
    setTimeout(() => callback(true), 500);
  }

  /** 展示插屏（每日挑战结算必出，无尽每3局1次） */
  showInterstitial(force = false, endlessFailStreak = 0): void {
    if (!force && endlessFailStreak > 0 && endlessFailStreak % 3 !== 0) {
      return;
    }

    if (this.platform === 'wechat' && this.interstitialAd) {
      const ad = this.interstitialAd as WechatMinigame.InterstitialAd;
      ad.show().catch(() => ad.load().then(() => ad.show()));
      return;
    }

    console.log('[AdManager] Mock interstitial ad');
    this.interstitialCount++;
  }

  /** 展示横幅 */
  showBanner(): void {
    if (this.bannerVisible) return;

    if (this.platform === 'wechat' && this.bannerAd) {
      (this.bannerAd as WechatMinigame.BannerAd).show();
      this.bannerVisible = true;
      return;
    }

    console.log('[AdManager] Mock banner ad');
    this.bannerVisible = true;
  }

  hideBanner(): void {
    if (!this.bannerVisible) return;

    if (this.platform === 'wechat' && this.bannerAd) {
      (this.bannerAd as WechatMinigame.BannerAd).hide();
    }
    this.bannerVisible = false;
  }

  /** 分享复活 */
  shareForRevive(callback: AdCallback): void {
    if (this.platform === 'wechat' && typeof wx !== 'undefined') {
      wx.shareAppMessage({
        title: '动物卡牌消除 - 快来帮我！',
        imageUrl: '',
        success: () => callback(true),
        fail: () => callback(false),
      });
      return;
    }

    if (this.platform === 'douyin' && typeof tt !== 'undefined') {
      tt.shareAppMessage({
        title: '动物卡牌消除 - 快来帮我！',
        success: () => callback(true),
        fail: () => callback(false),
      });
      return;
    }

    console.log('[AdManager] Mock share');
    callback(true);
  }

  /** 双倍每日积分 */
  showRewardedForDoubleScore(callback: AdCallback): void {
    this.showRewarded(callback);
  }

  vibrateShort(): void {
    if (typeof wx !== 'undefined') {
      wx.vibrateShort({ type: 'light' });
    } else if (typeof tt !== 'undefined') {
      tt.vibrateShort();
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
}

// 全局类型声明（微信/抖音小游戏）
declare global {
  const wx: WechatMinigame.Wx | undefined;
  const tt: DouyinMinigame.TT | undefined;

  namespace WechatMinigame {
    interface Wx {
      createRewardedVideoAd(opt: { adUnitId: string }): RewardedVideoAd;
      createInterstitialAd(opt: { adUnitId: string }): InterstitialAd;
      createBannerAd(opt: {
        adUnitId: string;
        style: { left: number; top: number; width: number };
      }): BannerAd;
      getSystemInfoSync(): { windowWidth: number; windowHeight: number };
      shareAppMessage(opt: {
        title: string;
        imageUrl?: string;
        success?: () => void;
        fail?: () => void;
      }): void;
      vibrateShort(opt: { type: string }): void;
    }
    interface RewardedVideoAd {
      show(): Promise<void>;
      load(): Promise<void>;
      onClose(cb: (res: { isEnded: boolean }) => void): void;
    }
    interface InterstitialAd {
      show(): Promise<void>;
      load(): Promise<void>;
    }
    interface BannerAd {
      show(): Promise<void>;
      hide(): void;
    }
  }

  namespace DouyinMinigame {
    interface TT {
      createRewardedVideoAd(opt: { adUnitId: string }): RewardedVideoAd;
      shareAppMessage(opt: {
        title: string;
        success?: () => void;
        fail?: () => void;
      }): void;
      vibrateShort(): void;
    }
    interface RewardedVideoAd {
      show(): Promise<void>;
      onClose(cb: (res: { isEnded: boolean }) => void): void;
    }
  }
}

export function createAdManager(platform?: AdPlatform): AdManager {
  const detected: AdPlatform =
    platform ??
    (typeof wx !== 'undefined' ? 'wechat' : typeof tt !== 'undefined' ? 'douyin' : 'web');

  return new AdManager({
    platform: detected,
    rewardedAdUnitId: 'adunit-rewarded-placeholder',
    interstitialAdUnitId: 'adunit-interstitial-placeholder',
    bannerAdUnitId: 'adunit-banner-placeholder',
  });
}
