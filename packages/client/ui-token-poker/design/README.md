# Token 德州 · 视觉交接包（5a-C 定稿）

面向前端工程。目标仓库：`jadon7/dsh-sidebar-plugins`，建议落在
`packages/client/ui-token-poker/design/`。

设计基准帧是 **5a-C 软陶六人桌 · 棱面牌面**。所有数值以代码为准，本包里的
规范页是从组件里读出来的，不是手量的。

---

## 怎么打开

任何一个 `.dc.html` 用浏览器直接打开就行，不用装东西、不用起服务。
唯一要求：`support.js` 必须和它们放在同一层目录。

建议看的顺序：

| 文件 | 是什么 |
| --- | --- |
| `5b-States.dc.html` | **先看这个。** 11 个牌局状态全集，一屏一帧 |
| `5c-Spec.dc.html` | 完整视觉规范：色值 / 字号 / 间距 / 阴影 / 组件尺寸 / 牌面构造 |
| `5d-Motion.dc.html` | 动效规格，可播放、可 0.25× 慢放、可点某一步跳转 |
| `Poker-Table.dc.html` | 上面所有画面的唯一来源组件 |
| `Card-Faces.dc.html` | 52 张牌全表 + 牌面规格 |
| `5a-Cards.dc.html` | 定稿说明页（改了什么、尺寸、注意事项） |

---

## 哪些对得上源码，哪些是净新增

读了 `src/client/locales.ts` 和 `src/client/PokerPanel.tsx`（@dcc58ee）之后的结论。
**排期时请按这张表估工作量** —— 下半部分不是改样式，是做新功能。

**对得上源码（只是换皮）**

| 画面 | 依据 |
| --- | --- |
| `flop` 定稿帧 | 公共牌 2♠ 6♠ 2♣ + 2 张暗牌、手牌 A♦ 2♦、5 个对手与筹码、Rae 是庄，全部照 `PLAYERS` |
| 底池 / 跟注 / 滑杆 | `STARTING_POT 1700`、`CALL_AMOUNT 561`、`bet 1275`、`min 561 / max 2400`、`QUICK_BETS 25/33/75/133` |
| 状态行文案 | `status.default` 轮到你 · Noah 已下注 561K；`waiting` 用的是 `status.bet` 已下注 · 好友正在思考 |
| `invite` | **不是弹窗。** 头部按钮 `invited` 态，文案从 `invite` 换成 `invited`「房间码已复制」 |
| 头部 / 侧栏 / 标题副标题 | `title` `subtitle` `hand` `newHand` `leave` 逐条对应 |

**净新增，源码里不存在，文案是设计提案 —— 需要产品拍板**

| 画面 | 说明 |
| --- | --- |
| `preflop` `turn` `river` | 源码公共牌固定 3 明 2 暗，没有「街」的概念。分段控件是新增 |
| `waiting` 倒计时环 | 源码没有回合计时 |
| `allin` | 源码没有余额校验，滑杆上限是死值 2400 |
| `showdown` | 源码没有结算、牌型比较、赢家判定 |
| `empty` | 源码 `PLAYERS` 是 5 个定值，没有空座概念（`friends` 那句 4/6 在线本身就是硬编码字符串） |
| `leave` 确认弹窗 | 源码里 ESC 和「离开牌桌」都是 `onClose()` 直接关，没有二次确认 |
| `reconnect` | 源码完全没有连接状态 |

在 `5b-States.dc.html` 里，净新增的画面标签是**红色**的，对得上源码的是黑色。

---

## 组件接口

`Poker-Table.dc.html` 一个组件渲染全部 11 屏，只靠三个属性：

```
state          枚举，默认 flop
               preflop | flop | turn | river | waiting | allin |
               showdown | empty | invite | leave | reconnect
showSidebar    布尔，默认 true —— 关掉只剩牌桌 1208 × 900
fourColorDeck  布尔，默认 true —— 关掉退回传统双色牌（♥♦ 同红）
```

`flop` 就是 5a-C 定稿那一帧，其余 10 个状态在它之上**只改数据、不改布局**。
所以工程侧的对齐基准只有一个：把 `flop` 做对，其余状态自然对。

---

## 关键数值速查

写详细版在 `5c-Spec.dc.html`，这里只放最常用的。

**画布** 1440 × 900 ＝ 侧栏 232 + 桌面 1208。桌面四边安全边 34。

**色值**

```
页底          #171A2B
桌面渐变      radial-gradient(110% 80% at 50% 34%, #262B47, #1B1E30 62%, #171A2B)
软陶轨        linear-gradient(160deg, #3A4168, #2E3452 55%, #282D46)
桌面内凹      #212642
名牌          linear-gradient(180deg, #2C3252, #252A44)
名牌·行动中   linear-gradient(180deg, #333A5E, #2A3050) + 0 0 0 1.5px rgba(217,242,75,.35)
内凹件        #1E2237      滑杆槽 #1B1F33
柠檬黄        #D9F24B → #BCD934      （钱、你的回合、主按钮）
DSH 蓝        #4D6BFE                （品牌、选中、邀请）
在线绿        #8CE06A
珊瑚          #F04E5C → #D33B48      （全下、弃牌离开）
文字          #E9ECF7，层级靠 opacity .55 / .45 / .35，不另调灰
花色四色      ♠ #1C2A4A  ♥ #F04E5C  ♦ #2F7BFF  ♣ #17A97C
花色双色      ♠♣ #1C2A4A  ♥♦ #E23A46
牌背          外框 #0E2E6B  织面 #1C4CA8  中心菱标 #F1EDE3
```

**字体** 三套各管一件事，不要混用：

- `Archivo 800` —— 只写牌点角标，字高恒为卡宽 35%，line-height .82，字距 -.05em
- `Nunito 800` —— 数字与英文 UI（底池 38 / 下注额 26 / 玩家名 13.5）
- `Noto Sans SC 400–700` —— 全部中文

最小字号 10.5px，最小点击区 38px。

**牌** 比例恒定 5 : 7

```
公共牌 76 × 106  r11
手牌   66 × 92   r10   旋转 ±4°
亮牌小牌 30 × 42 r6
迷你牌背 16 × 22 r4
```

**操作区**

```
操作条  满宽−68 × 120  r24
按钮    弃牌 120 / 跟注 170 / 主按钮 210，高统一 60，r18
滑杆    槽高 8 r999，滑块 22
```

**阴影** 软陶质感 ＝ 大而软的外阴影 + 1px 顶部内高光，别只调 opacity。

```
名牌 / 卡片   0 14px 24px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.08)
牌            0 14px 22px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.9)
操作条        0 20px 36px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)
软陶轨        24px 28px 56px rgba(0,0,0,.5), -16px -18px 40px rgba(255,255,255,.03),
              inset 0 2px 0 rgba(255,255,255,.08)
桌面内凹      inset 0 12px 26px rgba(0,0,0,.55), inset 0 -2px 0 rgba(255,255,255,.05)
弹窗          0 40px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.1)
```

软陶轨是全桌**唯一一处偏移阴影**：光从左上来，桌子往右下投。别改方向。

**动效** 完整表在 `5d-Motion.dc.html`，原则三条：

1. 钱的动作要看得见 —— 筹码必须真的飞过去，底池数字必须滚，不能直接跳。
2. 牌永远从牌靴方向（左上）进场。
3. 状态类变化（回合切换、禁用）一律 160–180ms；只有钱和牌值得 300ms 以上。

只用 `transform` / `opacity` / `box-shadow`，不要动 `width` / `top`。

---

## 实现时的坑

1. **clipPath id 必须唯一。** 牌面的出血棱面花色靠 SVG `clipPath` 裁形，
   同一页出现多张牌时 id 重复会让后面的牌全部套用第一张的花色轮廓。
   组件里用实例计数器生成前缀（`pk1-0`、`pk1-1`…），照抄这个思路。
2. **翻牌用 `rotateY` + `backface-visibility: hidden` 双面**，父级要
   `perspective: 900px`。不要做两张牌淡入淡出 —— 牌背的菱格织纹淡出时会糊。
3. **牌背菱格是三层 `repeating-linear-gradient` 叠的**，不是图片。缩到
   16 × 22 时把粗纹从 14px 收到 9px，否则看起来像噪点。

---

## 还需要产品/工程拍板的事

0. **上面那张净新增表先过一遍。** 11 屏里只有 4 屏是纯换皮，其余 7 屏要新增
   后端/状态逻辑。如果这一版只想先落视觉，建议先做 `flop` `invite` 两屏。
1. **桌上有三支蓝**：DSH 蓝 `#4D6BFE`（品牌）、♦ 亮蓝 `#2F7BFF`（牌面）、
   牌背蓝 `#1C4CA8`。真机上如果觉得糊，先把牌背换成深蓝素面，别动前两支。
2. **四色牌只在多人同时亮牌时才真正吃到收益。** `fourColorDeck` 开关已经
   留好，上线前建议做一次 A/B，或至少放进设置项。
3. **目前全部文案是中文。** 英文宽约 1.6 倍，「跟注 561K」这类按钮现在是
   固定宽 170，切英文前要改成 `min-width` + 内距自适应。`locales.ts` 里
   英文词条已经齐了，直接能用。

---

## 提交到仓库

```bash
cd dsh-sidebar-plugins
git checkout -b design/poker-5a-c

mkdir -p packages/client/ui-token-poker/design
cp -R <解压出来的 handoff>/* packages/client/ui-token-poker/design/

git add packages/client/ui-token-poker/design
git commit -m "design: Token 德州 5a-C 定稿 + 11 状态 + 视觉/动效规范"
git push -u origin design/poker-5a-c
```

`support.js` 是运行时，必须一起提交，否则 `.dc.html` 打开是空白。
