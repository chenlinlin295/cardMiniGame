# 动物卡牌消除 🐾

2D 休闲卡牌消除小游戏，面向微信/抖音小游戏平台，以广告为主要赢利模式。

## 玩法

- 100 张牌、10 种动物花色，随机分成 6 列
- 底部 7 个卡槽，仅可取每列最前一张
- 开局选择幸运花色，幸运牌为万能牌并可释放技能
- 槽内同花色 3 张自动消除
- 6 列 + 卡槽 + 待用区全部清空即胜利；卡槽满则失败

## 模式

- **每日挑战**：全服同种子同局，固定幸运花色
- **无尽模式**：难度递增，记录最高关卡

## 技能（5 种）

| 技能 | 效果 |
|------|------|
| 打乱 | 剩余牌重新随机分配到 6 列 |
| 取牌 | 从卡槽移最多 3 张到待用区 |
| 撤销 | 回退上一步 |
| 透视 | 每列展示接下来 2 张牌（10 秒） |
| 额外槽位 | 临时 8 槽（30 秒） |

## 项目结构

```
src/                  # 核心 TypeScript 逻辑（引擎无关）
  core/               # GameState, MatchLogic, LevelGenerator, DailySeed
  skill/              # SkillManager
  ad/                 # AdManager（微信/抖音/Web 抽象）
  modes/              # GameController
web/                  # Web 可玩原型（HTML/CSS/JS）
cocos/                # Cocos Creator 3.x 项目骨架
tests/                # Vitest 单元测试
```

## 快速开始

```bash
npm install
npm run build    # 编译 TypeScript
npm test         # 运行测试
npm run dev      # 启动 Web 原型 (http://localhost:3000)
```

## Cocos Creator 集成

1. 用 Cocos Creator 3.8+ 打开 `cocos/` 目录
2. 将 `src/` 链接或复制到 `assets/scripts/core/`
3. 创建场景：Main（主菜单）、Game（对局）、Result（结算）
4. 将 `GameManager.ts` 挂到 Game 场景
5. 构建发布 → 微信小游戏 / 抖音小游戏

## 广告接入

在 `src/ad/AdManager.ts` 中配置各平台 adUnitId：

- 激励视频：复活、双倍积分、额外撤销
- 插屏：每日挑战结算、无尽每 3 局失败
- 横幅：主界面与对局底部

## 开发阶段

- [x] Phase 1：核心原型（6 列 + 7 槽 + 三消 + 万能牌 + 关卡生成）
- [x] Phase 2：5 技能 + 待用区 + 每日/无尽模式
- [x] Phase 3：AdManager + Web UI 原型 + Cocos 骨架
- [x] Phase 4：单元测试 + 难度估算

## License

MIT
