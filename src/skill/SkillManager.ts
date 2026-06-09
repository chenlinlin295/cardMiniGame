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
    description: '全部剩余牌重新随机分配到6列',
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
  [SkillType.ExtraSlot]: {
    type: SkillType.ExtraSlot,
    name: '额外槽位',
    description: '临时8槽，持续30秒',
    icon: '➕',
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
      extraSlot: 99,
    };
    return uses < limits[skill];
  }

  useFromSkillCard(slotIndex: number, skill: SkillType): boolean {
    return this.game.activateSkillCard(slotIndex, skill);
  }

  takeToHold(slotIndices: number[]): boolean {
    return this.game.takeSlotsToHold(slotIndices);
  }

  takeToHoldWithSkillCard(skillCardIndex: number, slotIndices: number[]): boolean {
    return this.game.takeToHoldWithSkillCard(skillCardIndex, slotIndices);
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
