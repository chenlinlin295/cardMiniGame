# 项目文档索引

所有设计与产品文档均放在本仓库内，以 [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) 为玩法权威规格。

## 文档列表

| 文档 | 说明 |
|------|------|
| [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) | **玩法功能规格**（主文档：普通4×3×2层、困难4×5×5~6层、7 槽单卡、三技能、复活等） |
| [`docs/JIMENG_DESIGN_BRIEF.md`](docs/JIMENG_DESIGN_BRIEF.md) | **即梦整页设计稿**（Icon UI、分关卡棋盘、弹层、3 秒转场、统一复活按钮） |
| [`docs/JIMENG_ASSET_PROMPTS.md`](docs/JIMENG_ASSET_PROMPTS.md) | **即梦单素材 Prompt**（头像+底牌分层、同局唯一分色、GIF、黑底问号收集册、150+ 文件清单） |
| [`docs/FUNCTIONAL_SPEC_REVIEW_V2.md`](docs/FUNCTIONAL_SPEC_REVIEW_V2.md) | **评审版功能文档**（页面、按钮、弹窗、位置、状态流转） |
| [`docs/GAMEPLAY_SPEC_REVIEW_V2.md`](docs/GAMEPLAY_SPEC_REVIEW_V2.md) | **评审版玩法文档**（动物池升级、牌量公式、难度与时间） |
| [`README.md`](README.md) | 项目简介、快速开始、结构说明 |
| [`TODO.md`](TODO.md) | 开发任务与历史修复记录 |

## 产品愿望（未全部实现）

以下功能在 [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) 中已部分纳入或标注优先级：

1. 消除成功后奖励动物卡，提供 **收集册**（困难关通关奖励 — 已纳入规格 P0）
2. 微信排名（P2，先期本地榜，**双页签：抓到几个 / 抓到几种(X/36)**）
3. 每种动物消除时 **音效 + 跑过动画**（已纳入规格 P0）
4. ~~每日挑战 / 无尽模式~~ → 已改为 **单一两关流程**
5. 每周实体奖品邮寄（远期，未纳入当前规格）

## 代码与文档对应

| 模块 | 路径 |
|------|------|
| 类型与常量 | `src/core/types.ts` |
| 收集盘 / 三消 | `src/core/MatchLogic.ts` |
| 对局状态机 | `src/core/GameState.ts` |
| 关卡生成 | `src/core/LevelGenerator.ts` |
| 可解性验证 | `src/core/Solvability.ts` |
| 模式控制 | `src/modes/GameController.ts` |
| 技能 | `src/skill/SkillManager.ts` |
| Web 原型 | `web/` |
