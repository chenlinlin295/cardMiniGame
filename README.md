# 萌宠大冒险

羊了个羊式三消叠牌休闲小游戏，只面向微信小程序移动端，以广告为主要赢利模式。

**完整玩法规格见 [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md)**（权威文档）。

## 玩法摘要

- **分关卡棋盘**：普通 **4×3（12列，每列2张）**，困难 **4×5（20列，每列5~6张）**；仅列顶可点；**7 格单卡槽** + 上方 **3 个移出堆叠位（默认隐藏）**
- **两关制**：普通 **24 张 / 120 秒** → 困难 **117 张 / 480 秒（非常虐）**；困难通关奖励动物入 **收集册**
- **失败**：7 槽单卡占满或超时；复活按类型独立计次（**超时1次 + 槽满1次**）
- **三技能**：移出（点击后按7槽重排结果自动移出前3张，FIFO）· 凑齐（仅从现有牌中补齐三消，不生牌）· 洗牌（每日各送 1 次，可看广告补 1 次）
- **复活**：时间复活=加时；槽满复活=7 槽全上移到移出区（3-3-1分摞，可逐层点回）
- **通关判定**：棋盘、卡槽、移出区三处卡牌全部清空
- **UI**：顶栏/技能以 **Icon** 为主；首页 GIF 动图；**36 种动物总池**，对局采用“头像与底牌色解耦”的同局唯一分色映射（普通8/困难18抽样）
- **排行**：双页签（抓到几个 / 抓到几种）；右侧展示头像昵称对应统计值，无对局分数

## 文档

| 文档 | 说明 |
|------|------|
| [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) | 玩法功能规格 |
| [`docs/JIMENG_DESIGN_BRIEF.md`](docs/JIMENG_DESIGN_BRIEF.md) | 即梦整页设计稿 Prompt |
| [`docs/JIMENG_ASSET_PROMPTS.md`](docs/JIMENG_ASSET_PROMPTS.md) | 即梦单个素材 Prompt |
| [`DOCS.md`](DOCS.md) | 文档索引与产品愿望 |

## 项目结构

```
src/                  # 核心 TypeScript 逻辑（引擎无关）
  core/               # GameState, MatchLogic, LevelGenerator, Solvability
  skill/              # SkillManager
  ad/                 # AdManager（微信激励视频/Web mock）
  modes/              # GameController
web/                  # Web 可玩原型（HTML/CSS/JS）
cocos/                # Cocos Creator 3.x 项目骨架
docs/                 # 设计文档
tests/                # Vitest 单元测试
```

## 快速开始

```bash
npm install
npm run build    # 编译 TypeScript
npm test         # 运行测试
npm run dev      # 启动 Web 原型 (http://localhost:3000)
```

## 微信小程序集成

1. 核心逻辑保持在 `src/`，Web 仅用于本地原型调试
2. 发布目标只考虑微信小程序 / 微信小游戏移动端
3. 素材按 @2x 输出，设计基准见 `docs/JIMENG_ASSET_PROMPTS.md`

## 广告接入

在 `src/ad/AdManager.ts` 中配置微信广告位 id：

- 激励视频：复活、技能补次
- 插屏：结算（按需）
- 横幅：主界面与对局底部

## License

MIT
