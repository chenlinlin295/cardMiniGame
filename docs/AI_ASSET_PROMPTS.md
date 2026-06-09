# 动物卡牌消除 — AI 3D 素材生成 Prompt 手册

> **用途**：本文档为《动物卡牌消除》休闲手游的全部视觉素材提供 AI 生成 Prompt，可直接复制到 **豆包**、**即梦**、**Midjourney** 等工具中使用。  
> **游戏类型**：移动端竖屏休闲卡牌三消游戏（机制类似「羊了个羊」），玩家从 6 列叠牌中选取卡牌放入 7 格卡槽，同花色 3 张自动消除，清空全部卡牌即胜利。  
> **美术方向**：**3D 卡通渲染（Cel-shaded / Stylized 3D）**，Q 版可爱动物，深色星空休闲风，适合微信/抖音小游戏。

---

## 一、全局美术规范（所有 Prompt 必须遵守）

### 1.1 风格关键词（每条 Prompt 末尾追加）

```
3D render, stylized cartoon, cel-shaded, mobile game asset, Q-version cute, soft ambient lighting, clean edges, no text watermark, no UI mockup frame, isolated on transparent background (PNG) OR full scene as specified, high detail, game-ready, 4K quality
```

**中文补充关键词**：
```
3D渲染，卡通风格，Q版可爱，手游素材，游戏可用，边缘清晰，无水印，无文字（除非单独标注需要文字）
```

### 1.2 主色板（配色参考）

| 名称 | 色值 | 用途 |
|------|------|------|
| 深空背景 | `#1A1A2E` | 页面主背景 |
| 面板底色 | `#16213E` | 按钮、弹窗底 |
| 主强调色 | `#E94560` | 主按钮、牌背渐变终点 |
| 辅助高亮 | `#FFD369` | 分数、选中态 |
| 万能/幸运金 | `#FFD700` | 幸运牌、万能牌边框 |
| 卡槽底色 | `#0F3460` | 卡槽区、待用区托盘 |
| 成功绿 | `#4ECCA3` | 胜利态 |
| 牌背渐变起点 | `#533483` | 牌背紫色 |

### 1.3 尺寸与比例规范

| 素材类型 | 推荐导出尺寸 | 宽高比 | 格式 | 备注 |
|----------|-------------|--------|------|------|
| 卡牌正面/背面 | **440 × 580 px**（@1x）或 **880 × 1160 px**（@2x） | **3:4** | PNG 透明底 | 核心资产，10 种动物 + 1 牌背 |
| 卡牌边框/角标（幸运/万能） | 440 × 580 px | 3:4 | PNG 透明底 | 叠加层，不含动物 |
| 空槽占位框 | 440 × 580 px | 3:4 | PNG 透明底 | 半透明虚线框 |
| 全屏背景 | **750 × 1334 px**（设计稿）或 **1125 × 2436 px** | 9:16 竖屏 | JPG/PNG | 可平铺或拉伸 |
| UI 按钮 | 按实际按钮大小，建议 **600 × 120 px** | 约 5:1 | PNG 九宫格可拉伸 | 圆角 12px 视觉 |
| 图标（技能/功能） | **128 × 128 px** 或 **256 × 256 px** | 1:1 | PNG 透明底 | 3D 立体图标 |
| Logo | **512 × 512 px** | 1:1 | PNG 透明底 | 爪印 + 游戏名可分开生成 |
| 弹窗面板 | **650 × 800 px** 左右 | 自由 | PNG 透明底 | 圆角 16px |
| 消除动画帧 | **512 × 512 px** | 1:1 | PNG 序列帧 | 可选，8~12 帧 |

### 1.4 3D 渲染要求

- **渲染风格**：Stylized 3D / 低多边形卡通（Low-poly Cartoon），非写实、非恐怖、非成人向
- **光照**：柔和环境光 + 轻微 rim light（轮廓光），避免过曝或过暗
- **材质**：哑光塑料感或轻微陶瓷感，颜色饱和但不过艳
- **视角**：
  - **卡牌正面**：正面对玩家，轻微俯视 5°~10°，动物居中占卡面 60%~70%
  - **卡牌背面**：正面对玩家，无透视变形
  - **UI 图标**：正面或 3/4 视角，立体感强
  - **背景**：广角场景，无强烈透视畸变
- **阴影**：卡牌/UI 元素自带轻微投影，便于叠加到游戏界面

### 1.5 负面 Prompt（建议每条都加）

```
realistic photo, horror, scary, blood, violence, adult content, blurry, low quality, jpeg artifacts, text overlay, watermark, logo of other games, human face, complex background clutter, oversaturated neon, dark gloomy horror style, pixel art, 2D flat illustration only
```

**中文负面词**：
```
写实照片，恐怖，血腥，暴力，成人内容，模糊，低质量，水印，其他游戏 logo，复杂杂乱背景，纯 2D 扁平插画风
```

---

## 二、品牌与 Logo

### 2.1 游戏 Logo（爪印主标识）

**素材编号**：`logo_paw_main`  
**类型**：3D 图标，透明背景  
**尺寸**：512 × 512 px  

**Prompt（中文，推荐即梦/豆包）**：
```
手游《动物卡牌消除》游戏 Logo，3D 渲染，一个可爱的立体爪印图标，Q版卡通风格，爪印为圆润的猫爪形状，材质为柔和哑光金色（#FFD700）带轻微金属光泽，爪印下方有微妙的紫色到玫红色渐变光晕（#533483 到 #E94560），背景完全透明，居中构图，适合作为 App 图标和小游戏启动 Logo，3D render, stylized cartoon, cel-shaded, mobile game logo, cute paw print, soft lighting, no text, transparent background, 512x512
```

**Prompt（英文备选）**：
```
3D cute paw print game logo for mobile casual card match game, stylized cartoon cel-shaded, golden matte material with soft purple-pink glow halo, centered, transparent background, app icon style, no text, 512x512, game-ready asset
```

---

### 2.2 游戏标题艺术字（可选，用于主菜单）

**素材编号**：`logo_title_text`  
**类型**：3D 立体字 + 爪印装饰  
**尺寸**：750 × 200 px  

**Prompt**：
```
手游标题美术字「动物卡牌消除」，3D 立体卡通渲染，字体圆润可爱，主色白色带金色描边（#FFD700），字上方或字间嵌入一个小 3D 金色爪印装饰，整体风格 Q 版休闲手游，背景透明，适合放在深蓝紫色（#1A1A2E）背景上，3D stylized game title typography, cute rounded font, golden outline, mobile game header, transparent background, 750x200, no watermark
```

---

## 三、卡牌素材（核心，最高优先级）

> **统一说明**：所有卡牌 Prompt 生成时，请确保 **同批次 10 张动物卡风格一致**（相同卡框、相同光照、相同 3D 渲染参数），仅替换动物主体。建议在同一 AI 会话中连续生成并固定 seed。

### 3.0 卡牌通用框架描述（写入每条动物卡 Prompt）

```
一张竖版手游卡牌，宽高比 3:4，3D 渲染。卡框为圆角矩形（圆角约 8px 视觉），边框宽度约 4px，边框颜色为深蓝（#16213E）带轻微内发光。卡面底色为深蓝渐变（#16213E 到 #0F3460）。卡牌有轻微厚度感（约 3mm 视觉），边缘有柔和投影。动物为 3D Q 版模型居中展示，占卡面 65% 区域。正面对玩家，轻微俯视。背景透明（仅卡牌本体，不含场景）。
```

---

### 3.1 猫卡（Cat）

**素材编号**：`card_cat`  
**尺寸**：440 × 580 px，3:4，PNG  

**Prompt**：
```
手游卡牌消除游戏素材，一张 3:4 竖版 Q 版卡牌正面。3D 渲染 stylized cartoon 风格。卡框圆角矩形，深蓝边框（#16213E），卡面底色深蓝渐变。卡面中央是一只 3D Q 版橘色小猫，圆脸大眼，表情可爱开心，坐姿，毛发柔软卡通质感，占卡面 65%。正面对玩家，轻微俯视 8 度。卡牌有轻微立体厚度和底部投影。背景透明。mobile game card asset, cat suit card, cel-shaded 3D, cute orange cat, transparent background, 440x580, no text, no watermark
```

---

### 3.2 狗卡（Dog）

**素材编号**：`card_dog`  

**Prompt**：
```
手游卡牌消除游戏素材，3:4 竖版 Q 版卡牌正面，3D stylized cartoon 渲染。深蓝圆角卡框（#16213E），卡面中央 3D Q 版柯基犬，短腿圆屁股，吐舌头开心表情，棕白配色，占卡面 65%，正面对玩家轻微俯视。卡牌立体厚度，透明背景。mobile game card, dog suit, cel-shaded 3D, cute corgi, transparent PNG, 440x580, no text
```

---

### 3.3 兔卡（Rabbit）

**素材编号**：`card_rabbit`  

**Prompt**：
```
手游卡牌消除游戏素材，3:4 竖版 Q 版卡牌正面，3D stylized cartoon。深蓝圆角卡框，中央 3D Q 版白色小兔子，长耳朵竖起，粉色脸颊，乖巧坐姿，占卡面 65%，正面对玩家。卡牌有厚度与投影，透明背景。mobile game card, rabbit suit, cel-shaded 3D, cute white bunny, transparent PNG, 440x580, no text
```

---

### 3.4 熊卡（Bear）

**素材编号**：`card_bear`  

**Prompt**：
```
手游卡牌消除游戏素材，3:4 竖版 Q 版卡牌正面，3D stylized cartoon。深蓝圆角卡框，中央 3D Q 版棕色小熊，圆耳朵，憨厚微笑，坐姿，占卡面 65%。正面对玩家，轻微俯视。透明背景，卡牌立体厚度。mobile game card, bear suit, cel-shaded 3D, cute brown bear, transparent PNG, 440x580, no text
```

---

### 3.5 狐卡（Fox）

**素材编号**：`card_fox`  

**Prompt**：
```
手游卡牌消除游戏素材，3:4 竖版 Q 版卡牌正面，3D stylized cartoon。深蓝圆角卡框，中央 3D Q 版橙色小狐狸，大尾巴蓬松，机灵表情，坐姿，占卡面 65%。正面对玩家。透明背景。mobile game card, fox suit, cel-shaded 3D, cute orange fox, transparent PNG, 440x580, no text
```

---

### 3.6 熊猫卡（Panda）

**素材编号**：`card_panda`  

**Prompt**：
```
手游卡牌消除游戏素材，3:4 竖版 Q 版卡牌正面，3D stylized cartoon。深蓝圆角卡框，中央 3D Q 版大熊猫，经典黑白配色，抱着一根小竹子，占卡面 65%，正面对玩家。透明背景，卡牌立体厚度。mobile game card, panda suit, cel-shaded 3D, cute giant panda, transparent PNG, 440x580, no text
```

---

### 3.7 考拉卡（Koala）

**素材编号**：`card_koala`  

**Prompt**：
```
手游卡牌消除游戏素材，3:4 竖版 Q 版卡牌正面，3D stylized cartoon。深蓝圆角卡框，中央 3D Q 版灰色考拉，大圆耳朵，抱着桉树叶，慵懒可爱表情，占卡面 65%。正面对玩家。透明背景。mobile game card, koala suit, cel-shaded 3D, cute koala, transparent PNG, 440x580, no text
```

---

### 3.8 猪卡（Pig）

**素材编号**：`card_pig`  

**Prompt**：
```
手游卡牌消除游戏素材，3:4 竖版 Q 版卡牌正面，3D stylized cartoon。深蓝圆角卡框，中央 3D Q 版粉色小猪，圆鼻子，卷尾巴，开心表情，占卡面 65%。正面对玩家。透明背景。mobile game card, pig suit, cel-shaded 3D, cute pink piglet, transparent PNG, 440x580, no text
```

---

### 3.9 蛙卡（Frog）

**素材编号**：`card_frog`  

**Prompt**：
```
手游卡牌消除游戏素材，3:4 竖版 Q 版卡牌正面，3D stylized cartoon。深蓝圆角卡框，中央 3D Q 版绿色小青蛙，大圆眼，坐在小荷叶上，占卡面 65%，正面对玩家。透明背景。mobile game card, frog suit, cel-shaded 3D, cute green frog, transparent PNG, 440x580, no text
```

---

### 3.10 企鹅卡（Penguin）

**素材编号**：`card_penguin`  

**Prompt**：
```
手游卡牌消除游戏素材，3:4 竖版 Q 版卡牌正面，3D stylized cartoon。深蓝圆角卡框，中央 3D Q 版黑白小企鹅，圆滚滚身体，翅膀微张，占卡面 65%，正面对玩家。透明背景。mobile game card, penguin suit, cel-shaded 3D, cute penguin, transparent PNG, 440x580, no text
```

---

### 3.11 卡牌背面（统一牌背）

**素材编号**：`card_back`  
**尺寸**：440 × 580 px，3:4，PNG  

**Prompt**：
```
手游卡牌消除游戏统一牌背设计，3:4 竖版，3D 渲染 stylized cartoon。卡背为圆角矩形卡牌，正面朝向玩家。卡背背景为 135 度对角渐变，从深紫色（#533483）过渡到玫红色（#E94560）。卡背中央有一个 3D 立体金色爪印（#FFD700），爪印周围有微弱光晕和装饰性小星星。卡背有轻微皮革或哑光塑料纹理，卡牌有立体厚度，边缘有细金色描边。背景透明。mobile game card back, paw print pattern, purple to pink gradient, 3D cel-shaded, transparent PNG, 440x580, no text watermark
```

**变体说明**：牌背只需 1 张，游戏中所有未翻开的牌共用。

---

### 3.12 幸运牌边框叠加层

**素材编号**：`card_frame_lucky`  
**类型**：透明 PNG 叠加层，不含动物  

**Prompt**：
```
手游卡牌消除游戏 UI 叠加素材，3:4 竖版透明 PNG。仅包含卡牌边框装饰，不含卡面内容。边框为明亮金色（#FFD700）发光描边，宽度约 6px，四角有小型 3D 金色角饰。右上角有一个 3D 圆形金色徽章，徽章内可留空（程序后续贴「运」字）或生成简化星形符号。整体 Q 版卡通 3D 风格，透明背景。mobile game lucky card frame overlay, golden glowing border, transparent PNG, 440x580, no animal, no full card face
```

---

### 3.13 万能牌边框叠加层

**素材编号**：`card_frame_wild`  
**类型**：透明 PNG 叠加层  

**Prompt**：
```
手游卡牌消除游戏 UI 叠加素材，3:4 竖版透明 PNG。万能牌金色边框，比幸运牌更华丽，边框为双层金色（#FFD700）发光效果，带微小粒子光点。四角有 3D 星星装饰。右上角 3D 金色圆形徽章（程序贴「★」）。透明背景，不含动物和卡面。mobile game wild card frame overlay, premium golden border, transparent PNG, 440x580
```

---

### 3.14 空槽占位框

**素材编号**：`card_slot_empty`  

**Prompt**：
```
手游卡牌消除游戏 UI 素材，3:4 竖版透明 PNG。空的卡槽占位框，圆角矩形虚线边框，颜色为半透明白色（opacity 30%），内部为空，有轻微 3D 内凹感。用于表示卡槽尚未放入卡牌。mobile game empty slot placeholder, dashed rounded rectangle, semi-transparent, 440x580, transparent background
```

---

### 3.15 花色选择小图标（10 张，用于选幸运花色界面）

**素材编号**：`icon_suit_cat` ~ `icon_suit_penguin`  
**尺寸**：256 × 256 px，1:1，PNG  

**通用 Prompt 模板**（替换 `{动物}` 和 `{特征}`）：
```
手游卡牌消除游戏花色选择图标，256x256 正方形，3D Q 版 {动物} 头像特写，{特征}，圆形或圆角方形底框，底框颜色深蓝（#16213E），选中态预留金色光圈位置。stylized cartoon cel-shaded 3D，透明背景或独立图标，mobile game suit picker icon, no text
```

| 编号 | 动物 | 特征描述 |
|------|------|----------|
| `icon_suit_cat` | 猫 | 橘色小猫圆脸 |
| `icon_suit_dog` | 狗 | 柯基犬吐舌 |
| `icon_suit_rabbit` | 兔 | 白色长耳兔 |
| `icon_suit_bear` | 熊 | 棕色圆耳熊 |
| `icon_suit_fox` | 狐 | 橙色蓬松尾狐狸 |
| `icon_suit_panda` | 熊猫 | 黑白熊猫抱竹 |
| `icon_suit_koala` | 考拉 | 灰色大耳考拉 |
| `icon_suit_pig` | 猪 | 粉色卷尾小猪 |
| `icon_suit_frog` | 蛙 | 绿色圆眼青蛙 |
| `icon_suit_penguin` | 企鹅 | 黑白圆滚企鹅 |

---

## 四、全屏背景（各页面）

> 所有背景为 **750 × 1334 px** 竖屏，JPG 或 PNG，**不含 UI 按钮**（按钮单独生成后程序叠加）。

### 4.1 主菜单背景

**素材编号**：`bg_main_menu`  

**Prompt**：
```
手游《动物卡牌消除》主菜单全屏背景，竖屏 9:16（750x1334）。3D 渲染 stylized cartoon 场景。深空蓝紫色夜空（#1A1A2E 为主），远处有柔和星云和星星。中景是一个可爱的 3D 动物卡牌桌，桌面上散落着几叠 Q 版卡牌和金色爪印装饰。前景底部有轻微虚化的 grass 或 soft platform。整体氛围温馨休闲，适合小游戏主菜单。无 UI 按钮，无文字，无 watermark。mobile game main menu background, cute animal card theme, night sky purple blue, 3D cel-shaded, vertical 9:16
```

---

### 4.2 选幸运花色页背景

**素材编号**：`bg_lucky_pick`  

**Prompt**：
```
手游卡牌消除游戏「选择幸运花色」页面背景，竖屏 9:16（750x1334）。3D stylized cartoon。深蓝紫渐变背景（#1A1A2E 到 #16213E），中央区域有柔和金色魔法光圈（#FFD700），象征幸运。周围漂浮 10 种 Q 版 3D 动物小剪影（猫狗兔熊狐熊猫考拉猪蛙企鹅），半透明装饰。上方留白给标题，中间留白给 5x2 花色网格，下方留白给按钮。无 UI 元素，无文字。mobile game lucky suit selection background, golden magic circle, cute animal silhouettes, vertical 9:16
```

---

### 4.3 对局游戏背景

**素材编号**：`bg_gameplay`  

**Prompt**：
```
手游卡牌消除游戏对局界面背景，竖屏 9:16（750x1334）。3D stylized cartoon。深色系休闲牌桌场景。上方 20% 为简洁顶栏区域（深蓝 #16213E 渐变）。中间 50% 为 6 列卡牌摆放区，桌面为深蓝绿色毡面质感（#0F3460），有轻微 3D 桌台边缘。下方 30% 为卡槽和待用区区域，有内凹 tray 托盘造型。整体干净，不抢卡牌视觉。无卡牌、无 UI 按钮、无文字。mobile game gameplay background, card table felt surface, vertical 9:16, dark casual style
```

---

### 4.4 结算页背景 — 胜利

**素材编号**：`bg_result_win`  

**Prompt**：
```
手游卡牌消除游戏胜利结算页背景，竖屏 9:16（750x1334）。3D stylized cartoon。深蓝背景上绽放金色（#FFD700）和绿色（#4ECCA3）庆祝光效，飘落 confetti 彩纸和星星。底部有 Q 版 3D 动物们（猫狗兔等）举手庆祝的剪影。中央留白给结算面板。喜庆但不喧闹，无 UI 无文字。mobile game victory result background, celebration confetti, cute animals cheering, vertical 9:16
```

---

### 4.5 结算页背景 — 失败

**素材编号**：`bg_result_lose`  

**Prompt**：
```
手游卡牌消除游戏失败结算页背景，竖屏 9:16（750x1334）。3D stylized cartoon。深蓝紫背景（#1A1A2E），色调略暗但不压抑。一只 Q 版 3D 小猫在角落委屈表情（占画面 15% 以内作装饰），飘落少量蓝色小花瓣。中央留白给结算面板。无 UI 无文字。mobile game defeat result background, soft melancholy cute cat, vertical 9:16, not horror
```

---

### 4.6 弹窗遮罩层

**素材编号**：`overlay_modal_dim`  
**尺寸**：750 × 1334 px  

**Prompt**：
```
手游 UI 弹窗半透明遮罩，750x1334 竖屏，纯黑色 60% 透明度均匀蒙版，可带极轻微 vignette 暗角。无内容，无文字。mobile game modal overlay, semi-transparent black dim, vertical full screen
```

> **备注**：遮罩也可程序用 CSS 实现，此素材为可选。

---

## 五、UI 按钮与控件（全部 3D 素材化）

> 按钮建议生成 **九宫格可拉伸** 样式：左右各留 20% 为圆角帽，中间 60% 为可平铺纹理。

### 5.1 主按钮（Primary — 玫红色）

**素材编号**：`btn_primary`  
**尺寸**：600 × 120 px  

**Prompt**：
```
手游 UI 主按钮素材，3D 渲染 stylized cartoon。圆角胶囊形按钮（圆角 12px 视觉），主体色玫红（#E94560），顶部有高光，底部有阴影，轻微立体按压感。按钮表面有极 subtle 的 paw print 纹理。背景透明，无文字（程序叠加文字）。mobile game primary button, 3D cel-shaded, glossy casual UI, 600x120, transparent PNG, nine-patch friendly
```

---

### 5.2 次要按钮（Secondary — 深蓝面板色）

**素材编号**：`btn_secondary`  

**Prompt**：
```
手游 UI 次要按钮素材，3D stylized cartoon。圆角胶囊形，主体色深蓝（#16213E），细边框灰蓝（#8892B0），轻微内阴影，背景透明，无文字。mobile game secondary button, 3D cel-shaded, 600x120, transparent PNG
```

---

### 5.3 幽灵/返回按钮（Ghost — 透明底描边）

**素材编号**：`btn_ghost`  

**Prompt**：
```
手游 UI 幽灵按钮素材，3D stylized cartoon。圆角胶囊形，透明或极半透明底，白色或灰蓝（#8892B0）细描边 2px，轻微 3D 浮雕感。用于「返回」「取消」类操作。背景透明，无文字。mobile game ghost button, outline style, 600x120, transparent PNG
```

---

### 5.4 返回按钮（带箭头图标，独立图标版）

**素材编号**：`btn_back_icon`  
**尺寸**：128 × 128 px  

**Prompt**：
```
手游 UI 返回按钮图标，128x128 正方形，3D stylized cartoon。一个左向箭头（←）嵌入圆角方形底框中，底框色深蓝（#16213E），箭头为白色带轻微 3D 厚度。适合左上角返回。透明背景，无文字。mobile game back button icon, 3D cel-shaded, left arrow, transparent PNG
```

---

### 5.5 暂停按钮

**素材编号**：`btn_pause_icon`  
**尺寸**：128 × 128 px  

**Prompt**：
```
手游 UI 暂停按钮图标，128x128，3D stylized cartoon。经典双竖线暂停符号，白色，嵌入深蓝圆角方形底框（#16213E），有 3D 按压质感。透明背景。mobile game pause button icon, 3D cel-shaded, transparent PNG
```

---

### 5.6 每日挑战按钮（带日历元素）

**素材编号**：`btn_daily_challenge`  
**尺寸**：600 × 120 px  

**Prompt**：
```
手游 UI 按钮素材，3D stylized cartoon。玫红主色（#E94560）圆角胶囊按钮，左侧嵌入一个 3D Q 版小日历图标（金色 #FFD369），日历上有星星标记。按钮无文字，背景透明。mobile game daily challenge button with calendar icon, 3D cel-shaded, 600x120, transparent PNG
```

---

### 5.7 无尽模式按钮（带无限符号）

**素材编号**：`btn_endless_mode`  
**尺寸**：600 × 120 px  

**Prompt**：
```
手游 UI 按钮素材，3D stylized cartoon。深蓝（#16213E）圆角胶囊按钮，左侧嵌入 3D 金色无限符号 ∞（#FFD369），符号有立体光泽。无文字，透明背景。mobile game endless mode button with infinity icon, 3D cel-shaded, 600x120, transparent PNG
```

---

### 5.8 开始游戏按钮（强调态）

**素材编号**：`btn_start_game`  
**尺寸**：600 × 120 px  

**Prompt**：
```
手游 UI 开始游戏按钮，3D stylized cartoon。大号玫红（#E94560）圆角胶囊按钮，比主按钮更亮，带金色（#FFD700）外发光，表面有微光粒子，表示可点击状态。无文字，透明背景。mobile game start button highlighted, 3D cel-shaded, glowing, 600x120, transparent PNG
```

---

### 5.9 看视频复活按钮

**素材编号**：`btn_revive_video`  

**Prompt**：
```
手游 UI 按钮，3D stylized cartoon。玫红主色圆角胶囊，左侧 3D 小电视/播放图标（白色），表示看广告复活。无文字，透明背景。mobile game watch ad revive button, 3D cel-shaded, play TV icon, 600x120, transparent PNG
```

---

### 5.10 分享复活按钮

**素材编号**：`btn_revive_share`  

**Prompt**：
```
手游 UI 按钮，3D stylized cartoon。深蓝（#16213E）圆角胶囊，左侧 3D 分享箭头图标（白色），表示分享复活。无文字，透明背景。mobile game share revive button, 3D cel-shaded, 600x120, transparent PNG
```

---

### 5.11 双倍积分按钮

**素材编号**：`btn_double_score`  

**Prompt**：
```
手游 UI 按钮，3D stylized cartoon。金色（#FFD369）圆角胶囊按钮，左侧 3D 星星 x2 图标，表示双倍奖励。无文字，透明背景。mobile game double score button, 3D cel-shaded, golden, 600x120, transparent PNG
```

---

## 六、游戏区域 UI 组件

### 6.1 卡槽托盘（7 格）

**素材编号**：`ui_slot_tray`  
**尺寸**：约 700 × 160 px  

**Prompt**：
```
手游卡牌消除游戏卡槽区 UI 托盘，3D stylized cartoon。横向长条形容器，深蓝（#0F3460）内凹 tray 造型，圆角 12px，可容纳 7 张 3:4 卡牌位。每个槽位有轻微分隔线。顶部可预留小标签区域（程序贴「卡槽」文字）。整体有 3D 立体感和底部投影。透明背景或仅托盘本体。mobile game slot tray UI, 7 card slots, 3D cel-shaded, 700x160, transparent PNG
```

---

### 6.2 待用区托盘（3 格）

**素材编号**：`ui_hold_tray`  
**尺寸**：约 400 × 160 px  

**Prompt**：
```
手游卡牌消除游戏待用区 UI 托盘，3D stylized cartoon。较小横向 tray，深蓝（#0F3460）内凹，圆角 12px，3 个卡牌位。风格与卡槽托盘一致但更小。透明背景。mobile game hold area tray UI, 3 card slots, 3D cel-shaded, 400x160, transparent PNG
```

---

### 6.3 顶栏信息条

**素材编号**：`ui_top_bar`  
**尺寸**：750 × 80 px  

**Prompt**：
```
手游对局顶栏 UI 条，750x80 横条，3D stylized cartoon。深蓝半透明（#16213E 80% opacity）圆角底条，左右留白给模式名、步数、计时器文字（程序渲染）。右侧预留圆形暂停按钮位。无具体文字内容。mobile game top HUD bar, 3D cel-shaded, transparent PNG, 750x80
```

---

### 6.4 弹窗面板底框（通用）

**素材编号**：`ui_modal_panel`  
**尺寸**：650 × 800 px  

**Prompt**：
```
手游 UI 弹窗面板底框，3D stylized cartoon。圆角矩形（圆角 16px），主体色深蓝（#16213E），顶部有轻微高光，底部投影。面板边缘有细金色（#FFD369）装饰线。中央大面积留白给内容和按钮（程序叠加）。无文字。mobile game modal dialog panel, 3D cel-shaded, 650x800, transparent PNG
```

---

### 6.5 统计信息面板（主菜单用）

**素材编号**：`ui_stats_panel`  
**尺寸**：650 × 200 px  

**Prompt**：
```
手游 UI 信息展示面板，3D stylized cartoon。横向圆角矩形，深蓝（#16213E）底，内嵌 2~3 个分隔区域，用于显示最高分、关卡等数据（程序渲染数字）。有 3D 内凹质感。无文字。mobile game stats panel UI, 3D cel-shaded, 650x200, transparent PNG
```

---

## 七、技能图标（5 个，3D 立体）

**统一规格**：256 × 256 px，1:1，PNG 透明底，3D stylized cartoon

### 7.1 打乱（Shuffle）

**素材编号**：`skill_shuffle`  

**Prompt**：
```
手游技能图标，256x256，3D stylized cartoon。打乱技能：两个交叉的 3D 箭头形成洗牌符号，箭头色金色（#FFD369），底为深蓝圆角方形（#16213E）。立体 cel-shaded，透明背景。mobile game shuffle skill icon, 3D cross arrows, no text
```

---

### 7.2 取牌（Take to Hold）

**素材编号**：`skill_take`  

**Prompt**：
```
手游技能图标，256x256，3D stylized cartoon。取牌技能：一只 3D 卡牌被向上箭头托起，箭头白色，卡牌 miniature 3:4 比例，底框深蓝。透明背景。mobile game take card skill icon, 3D card with up arrow, no text
```

---

### 7.3 撤销（Undo）

**素材编号**：`skill_undo`  

**Prompt**：
```
手游技能图标，256x256，3D stylized cartoon。撤销技能：3D 弯曲返回箭头（↩），金色（#FFD369），底框深蓝圆角方形。透明背景。mobile game undo skill icon, 3D curved arrow, no text
```

---

### 7.4 透视（Peek）

**素材编号**：`skill_peek`  

**Prompt**：
```
手游技能图标，256x256，3D stylized cartoon。透视技能：一只 3D 卡通眼睛（Q 版），眼瞳发光，表示看穿牌堆，底框深蓝。透明背景。mobile game peek skill icon, 3D glowing eye, no text
```

---

### 7.5 额外槽位（Extra Slot）

**素材编号**：`skill_extra_slot`  

**Prompt**：
```
手游技能图标，256x256，3D stylized cartoon。额外槽位技能：3D 加号「+」与一个小卡槽组合，加号金色（#FFD369），底框深蓝。透明背景。mobile game extra slot skill icon, 3D plus sign with slot, no text
```

---

## 八、结算与反馈素材

### 8.1 胜利徽章

**素材编号**：`result_win_badge`  
**尺寸**：512 × 512 px  

**Prompt**：
```
手游胜利徽章，512x512，3D stylized cartoon。金色（#FFD700）奖杯或 crown 造型，周围环绕星星和 paw print，Q 版可爱，背景透明。用于结算页「你赢了」展示。mobile game victory badge, 3D golden trophy, cel-shaded, transparent PNG, no text
```

---

### 8.2 失败徽章

**素材编号**：`result_lose_badge`  
**尺寸**：512 × 512 px  

**Prompt**：
```
手游失败徽章，512x512，3D stylized cartoon。一只 Q 版 3D 小猫委屈表情头像，周围有蓝色小泪滴（可爱不恐怖），背景透明。mobile game defeat badge, 3D cute sad cat, cel-shaded, transparent PNG, no text
```

---

### 8.3 三消消除特效（序列帧，可选）

**素材编号**：`fx_match_pop_01` ~ `fx_match_pop_12`  
**尺寸**：512 × 512 px，12 帧  

**Prompt（首帧，后续帧描述变化）**：
```
手游卡牌三消消除特效第1帧，512x512，3D stylized cartoon。中央 3D 金色爆炸星形光效，周围飞溅 tiny paw prints 和 confetti，背景透明。mobile game match-3 pop VFX frame 1, 3D golden burst, transparent PNG
```

**帧间变化说明**（生成时逐帧描述）：
- 帧 1~4：光效扩大，粒子飞散
- 帧 5~8：光效达到最大，粒子扩散
- 帧 9~12：光效缩小淡出，粒子消失

---

## 九、3D 消除动画动物（跑过屏幕，可选进阶）

> 用于三消成功时动物从屏幕下方跑过的动画。需 **侧视或 3/4 视角**，便于横向移动。  
> 建议尺寸：**512 × 512 px** 单帧，或导出 3D 模型（GLB）供引擎使用。

**通用 Prompt 模板**：
```
手游卡牌消除游戏 3D Q 版 {动物} 角色，侧面奔跑姿态，3D stylized cartoon cel-shaded，{特征}，单角色居中，背景透明。用于横向跑过屏幕的消除庆祝动画。mobile game 3D character side view running, cute {animal}, transparent PNG, 512x512, no shadow on ground
```

为 10 种动物各生成 1 张：**cat, dog, rabbit, bear, fox, panda, koala, pig, frog, penguin**（特征同第三节卡牌描述）。

---

## 十、素材清单总表

| 类别 | 数量 | 素材编号前缀 | 优先级 |
|------|------|-------------|--------|
| 卡牌正面（10 动物） | 10 | `card_*` | P0 |
| 卡牌背面 | 1 | `card_back` | P0 |
| 幸运/万能边框 | 2 | `card_frame_*` | P0 |
| 空槽占位 | 1 | `card_slot_empty` | P1 |
| 花色选择图标 | 10 | `icon_suit_*` | P1 |
| 全屏背景 | 5~6 | `bg_*` | P0 |
| UI 按钮 | 11 | `btn_*` | P0 |
| 游戏区 UI | 5 | `ui_*` | P1 |
| 技能图标 | 5 | `skill_*` | P1 |
| 结算徽章 | 2 | `result_*` | P1 |
| Logo | 1~2 | `logo_*` | P0 |
| 消除特效 | 12 帧 | `fx_match_pop_*` | P2 |
| 3D 跑过动物 | 10 | `char_run_*` | P2 |

**合计约 75~87 张素材**（含序列帧）。

---

## 十一、生成工作流建议

### 11.1 推荐生成顺序

1. **先定风格**：生成 1 张猫卡 + 1 张牌背 + 1 个主菜单背景 → 确认风格后再批量生成
2. **批量卡牌**：同一工具、同一会话、固定风格参数，连续生成 10 张动物卡
3. **UI 组件**：按钮、托盘、图标统一 3D 渲染参数
4. **背景**：各页面背景最后生成，参考已定卡牌色调微调

### 11.2 即梦 / 豆包 操作提示

| 平台 | 建议设置 |
|------|----------|
| **即梦** | 选「游戏图标/3D 渲染」类模板；图片比例按上表设置；开启「高清」；卡牌类选透明背景（若支持） |
| **豆包** | 图片生成 → 描述词粘贴 Prompt → 比例选手动或 3:4 / 9:16；可要求「透明背景 PNG」 |
| **通用** | 一次生成 4 张选最佳；不满意的局部用「重绘/扩图」修正；10 张卡牌务必风格统一 |

### 11.3 导出与命名

```
assets/
├── cards/
│   ├── card_cat.png
│   ├── card_dog.png
│   ├── ...
│   ├── card_back.png
│   ├── card_frame_lucky.png
│   └── card_frame_wild.png
├── icons/
│   ├── icon_suit_cat.png
│   ├── skill_shuffle.png
│   └── ...
├── ui/
│   ├── btn_primary.png
│   ├── ui_slot_tray.png
│   └── ...
├── backgrounds/
│   ├── bg_main_menu.jpg
│   ├── bg_gameplay.jpg
│   └── ...
└── logo/
    └── logo_paw_main.png
```

### 11.4 导入游戏后的叠加规则

| 游戏状态 | 图层顺序（从下到上） |
|----------|---------------------|
| 普通牌 | 卡面动物 → （无边框） |
| 幸运牌 | 卡面动物 → `card_frame_lucky` → 角标「运」文字 |
| 万能牌 | 卡面动物 → `card_frame_wild` → 角标「★」文字 |
| 牌背 | 仅 `card_back` |
| 空槽 | `card_slot_empty` |

---

## 十二、快速复制区 — 风格锚定 Prompt

> **第一次生成前**，先用此 Prompt 生成一张「风格样张」，确认后再批量生产。

```
【风格锚定】手游《动物卡牌消除》3D 美术风格样张。Stylized cartoon cel-shaded 3D 渲染，Q 版可爱动物主题，深色休闲风。主色：深空蓝 #1A1A2E、玫红 #E94560、金色 #FFD700。一张 3:4 卡牌（橘猫）+ 旁边一个 3D 金色爪印 + 深蓝牌桌一角。整体光照柔和，材质哑光塑料感，边缘清晰，适合微信小游戏。无 watermark，无文字。
```

---

*文档版本：v1.0 | 对应项目：animal-card-match | 设计分辨率：750×1334*
