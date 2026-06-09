/**
 * Cocos Creator 游戏主控制器
 * 在 Cocos 编辑器中将此组件挂到 Game 场景根节点
 *
 * 使用前：将 /src 目录复制到 assets/scripts/core 或通过 npm 构建后导入
 */
import { _decorator, Component, Node, Label, Prefab, instantiate, Color, UITransform } from 'cc';
import { GameController } from '../../../src/modes/GameController';
import { SkillType, SUIT_EMOJIS, SUIT_NAMES, Suit } from '../../../src/core/types';
import { SKILL_INFO } from '../../../src/skill/SkillManager';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  @property(Node)
  columnsContainer: Node | null = null;

  @property(Node)
  slotsContainer: Node | null = null;

  @property(Node)
  holdContainer: Node | null = null;

  @property(Prefab)
  cardPrefab: Prefab | null = null;

  @property(Label)
  movesLabel: Label | null = null;

  @property(Label)
  timerLabel: Label | null = null;

  @property(Node)
  skillPanel: Node | null = null;

  @property(Node)
  revivePanel: Node | null = null;

  private controller: GameController | null = null;
  private wildSlotIndex = -1;

  startDailyGame(luckySuit: Suit) {
    this.controller = GameController.createDaily(luckySuit);
    this.bindEvents();
    this.render();
  }

  startEndlessGame(level: number, luckySuit: Suit) {
    this.controller = GameController.createEndless(level, luckySuit);
    this.bindEvents();
    this.render();
  }

  private bindEvents() {
    if (!this.controller) return;
    this.controller.game.on((event) => {
      if (event.type === 'lost') {
        this.revivePanel?.active && (this.revivePanel.active = true);
      }
      if (event.type === 'won') {
        this.onGameEnd(true);
      }
      if (event.type === 'matched') {
        this.controller?.ads.vibrateShort();
      }
      this.render();
    });
  }

  onColumnClick(columnIndex: number) {
    this.controller?.pickColumn(columnIndex);
    this.render();
  }

  onSlotWildClick(slotIndex: number) {
    this.wildSlotIndex = slotIndex;
    this.skillPanel && (this.skillPanel.active = true);
  }

  onSkillSelect(skill: SkillType) {
    if (!this.controller || this.wildSlotIndex < 0) return;
    this.controller.useWildSkill(this.wildSlotIndex, skill);
    this.skillPanel && (this.skillPanel.active = false);
    this.wildSlotIndex = -1;
    this.render();
  }

  async onReviveVideo() {
    const ok = await this.controller?.reviveWithVideo();
    if (ok) {
      this.revivePanel && (this.revivePanel.active = false);
      this.render();
    }
  }

  async onReviveShare() {
    const ok = await this.controller?.reviveWithShare();
    if (ok) {
      this.revivePanel && (this.revivePanel.active = false);
      this.render();
    }
  }

  private onGameEnd(won: boolean) {
    const result = this.controller?.finishSession();
    // 跳转 Result 场景，传递 result
    console.log('Game ended:', won, result);
  }

  private render() {
    if (!this.controller) return;
    const state = this.controller.game.getState();

    if (this.movesLabel) {
      this.movesLabel.string = `步数: ${state.moves}`;
    }

    // 列、槽位、待用区渲染逻辑
    // 使用 cardPrefab 实例化，设置 emoji 文本和点击事件
    this.renderColumns(state.columns);
    this.renderSlots(state.slots);
    this.renderHold(state.holdArea);
  }

  private renderColumns(columns: import('../../../src/core/types').Card[][]) {
    if (!this.columnsContainer || !this.cardPrefab) return;
    this.columnsContainer.removeAllChildren();

    columns.forEach((col, colIdx) => {
      if (col.length === 0) return;
      const top = col[col.length - 1];
      const card = instantiate(this.cardPrefab);
      const label = card.getComponentInChildren(Label);
      if (label) label.string = SUIT_EMOJIS[top.suit];
      card.on(Node.EventType.TOUCH_END, () => this.onColumnClick(colIdx));
      this.columnsContainer!.addChild(card);
    });
  }

  private renderSlots(slots: import('../../../src/core/types').Card[]) {
    if (!this.slotsContainer || !this.cardPrefab) return;
    this.slotsContainer.removeAllChildren();

    slots.forEach((card, idx) => {
      const node = instantiate(this.cardPrefab);
      const label = node.getComponentInChildren(Label);
      if (label) label.string = SUIT_EMOJIS[card.suit];
      if (card.isWild && !card.skillConsumed) {
        node.on(Node.EventType.TOUCH_END, () => this.onSlotWildClick(idx));
      }
      this.slotsContainer!.addChild(node);
    });
  }

  private renderHold(hold: import('../../../src/core/types').Card[]) {
    if (!this.holdContainer || !this.cardPrefab) return;
    this.holdContainer.removeAllChildren();

    hold.forEach((card, idx) => {
      const node = instantiate(this.cardPrefab);
      const label = node.getComponentInChildren(Label);
      if (label) label.string = SUIT_EMOJIS[card.suit];
      node.on(Node.EventType.TOUCH_END, () => {
        this.controller?.pickHold(idx);
        this.render();
      });
      this.holdContainer!.addChild(node);
    });
  }
}
