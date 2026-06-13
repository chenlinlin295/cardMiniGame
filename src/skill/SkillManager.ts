import { SkillType } from '../core/types.js';
import type { GameState } from '../core/GameState.js';

export interface SkillInfo {
  type: SkillType;
  name: string;
  description: string;
  icon: string;
}

export const SKILL_INFO: Record<SkillType, SkillInfo> = {
  [SkillType.Shuffle]: {
    type: SkillType.Shuffle,
    name: '打乱',
    description: '全部剩余牌重新随机分配到列',
    icon: '🔀',
  },
  [SkillType.TakeToHold]: {
    type: SkillType.TakeToHold,
    name: '取牌',
    description: '从卡槽选最多3张移入待用区',
    icon: '📤',
  },
  [SkillType.Undo]: {
    type: SkillType.Undo,
    name: '撤销',
    description: '回退上一步操作',
    icon: '↩️',
  },
  [SkillType.Peek]: {
    type: SkillType.Peek,
    name: '透视',
    description: '每列额外展示接下来2张牌（10秒）',
    icon: '👁️',
  },
  [SkillType.Collect]: {
    type: SkillType.Collect,
    name: '凑齐',
    description: '从现有牌中凑齐3张同花色消除',
    icon: '🎯',
  },
};

export class SkillManager {
  constructor(private game: GameState) {}

  getAvailableSkills(): SkillInfo[] {
    return Object.values(SKILL_INFO);
  }

  canUseSkill(skill: SkillType): boolean {
    const state = this.game.getState();
    const uses = state.skillUses[skill];
    const limits: Record<SkillType, number> = {
      shuffle: 1,
      takeToHold: 99,
      undo: 3,
      peek: 99,
      collect: 99,
    };
    return uses < limits[skill];
  }

  takeToHold(slotIndices: number[]): boolean {
    return this.game.takeSlotsToHold(slotIndices);
  }

  /** 激励视频奖励：额外一次撤销 */
  grantBonusUndo(): boolean {
    const state = this.game.getState();
    if (state.skillUses[SkillType.Undo] > 0) {
      state.skillUses[SkillType.Undo]--;
      return true;
    }
    return false;
  }
}
