# 代码库隐患

**分析日期：** 2026-07-28（工具链现代化后刷新；已退役项见文末清单）

## 技术债

**内嵌 Hook 副本：**

- `packages/vue/src/hooks/useElementSize/index.ts` 与 `packages/vue/src/hooks/useScroll/index.ts` 是 `@vueuse/core` 工具函数的 
  fork/定制副本。
- 文件：`packages/vue/src/hooks/useElementSize/index.ts`，`packages/vue/src/hooks/useScroll/index.ts`
- 影响：上游修复与 API 更新必须手动 backport；偏离度越高维护成本越大。
- 修复方向：评估上游版本是否已满足当初的性能需求，若已满足则移除内嵌副本。

**滚动包裹层的启发式自动探测：**

- `useScrollbar` 可通过 `findScrollElement` 自动初始化，该函数以递归 DFS 选取第一个满足 `scrollHeight > clientHeight` 的子元素。
- 文件：`packages/vue/src/hooks/useScrollbar/index.ts`，`packages/vue/src/hooks/useScrollbar/utils.ts`
- 影响：在嵌套 overflow 容器场景中可能选错元素，且深树会付出不必要的遍历开销；DFS 中对每个子节点读取 `scrollHeight`/`clientHeight` 属于强制同步布局，N 个子节点最坏 N 次 reflow（
  初始化一次性，非滚动热点）。
- 修复方向：将自动探测改为可选，并在文档中说明显式 `init({ mount, wrapper, content })` 才是稳健路径。

## 已知缺陷

**拖拽处理器错误地将事件对象绑定为 `this`：**

- `onDragY` 与 `onDragX` 调用 `onMouseDown.bind(e)(e)`，这会把 MouseEvent 绑定到 `this`，同时将其作为第一个参数传入；实际意图只是 `onMouseDown(e)`。
- 文件：`packages/vue/src/hooks/useScrollbar/index.ts`
- 触发条件：在滚动条 thumb 上触发 mousedown。
- 临时规避：目前无需规避，因为 `onMouseDown` 未使用 `this`；但代码具有误导性，一旦使用 `this` 就会崩溃。
- 修复方向：将两处调用替换为 `onMouseDown(e)`。

## 安全考量

**全局修改 `document.onselectstart`：**

- 拖拽期间库会覆盖 `document.onselectstart`，并在清理时恢复之前的原始值。这绕过了现代事件监听器规范。
- 文件：`packages/vue/src/hooks/useScrollbar/index.ts`
- 当前缓解：在 `clean()` 中恢复先前值。
- 建议：在 mousedown 事件上调用 `preventDefault`，或挂载 `selectstart` 监听器并在其中调用 `preventDefault`，避免修改全局属性。

## 性能瓶颈

**`useScrollbar` 的响应式订阅仍然偏多：**

- 每个 `useScrollbar` 实例在 init 内建立约 10 个 `watchEffect`/`watch` 订阅（经 2026-07-28 优化从 ~18 收敛：10 个代理 effect 合并为 1、
  scrollTo 死 watchEffect 直赋值、tick 机制去 ref 噪声）。
- 文件：`packages/vue/src/hooks/useScrollbar/index.ts`
- 原因：尺寸/位置/显隐等维度仍在独立 effect 中计算；每次滚动事件会触发聚合 effect → computed → position effect → 样式 effect 的级联。
- 改进路径：进一步收敛需动 position/size 计算结构，收益递减，暂不展开。

**`isScrolling` 状态存在两套并行实现：**

- `useScroll` 返回的 `isScrolling`（scrollend 原生事件 + idle debounce 兜底）在 `useScrollbar` 解构时被丢弃；
  `useScrollbar` 用 `scrollingX/scrollingY` ref + `setTimeout`（x 轴 102ms、y 轴 51ms）自造分方向检测。
- 文件：`packages/vue/src/hooks/useScrollbar/index.ts`（scrolling watch），`packages/vue/src/hooks/useScroll/index.ts`
- 影响：每个 scroll 事件 clear/set 一次 timeout + 2 个 watch；timer id 已移出 ref（原 scrollXTick 的 id 变化曾令代理 effect 滚动期空跑，已修复）。
- 为何保留自造实现：`useScroll.isScrolling` 不分方向，而 play 的 vxe-table 示例以 `is-scrolling-x`/`is-scrolling-y` 独立类名消费分方向语义（
  2026-07-28 取证后否决任一方向化透传方案）。

**vxe-table wrapper 的轮询间隔永不超时：**

- `playground/src/vxe-table/index.vue` 使用 `setInterval(..., 17 * 5)` 等待内部 vxe-table DOM 元素（
  `vxe-table--fixed-left-wrapper`、`vxe-table--fixed-right-wrapper`）。这些 interval 没有最大重试次数，也未在 unmount 时清理。
- 文件：`playground/src/vxe-table/index.vue`
- 原因：依赖 vxe-table 内部类名；一旦类名变更或表格卸载，interval 将永远运行。
- 改进路径：将轮询替换为 `MutationObserver` 或 Vue 的 `nextTick` + `onMounted`，并在 `onUnmounted` 中始终清除 interval。

## 脆弱区域

**选择器依赖第三方内部类名：**

- vxe-table 与 ant-design-vue 示例查询了 `.vxe-table--body-wrapper`、`.vxe-body--x-space`、`.vxe-table--header-wrapper`、
  `.ant-table-header`、`.ant-table-body > table` 等内部类名；新增的四个演示页同样依赖 `.ag-grid-viewport`、`.tabulator-tableholder`、
  `.cm-scroller`、`.el-scrollbar__wrap`（AG Grid v36 已实测改名过一次：旧 `.ag-body-viewport` 失配致虚拟滚动条静默未挂载）。
- 文件：`playground/src/vxe-table/index.vue`，`playground/src/ant-vue-table/index.vue`，`playground/src/ag-grid.vue`，
  `playground/src/tabulator.vue`，`playground/src/codemirror.vue`，`playground/src/el-table.vue`
- 脆弱原因：vxe-table 或 ant-design-vue 的小版本升级可能重命名或移除这些类名，导致滚动条初始化静默失效。
- 安全修改：暴露显式的 `wrapper`/`content` 元素 ref，而非依赖内部 DOM 结构。
- 测试覆盖：集成示例尚无自动化渲染断言（见测试覆盖缺口）。

**`init()` 会修改调用者的 options 对象：**

- `init()` 会就地规范化 `opts.content`、`opts.wrapper`、`opts.viewport`，将单个值转为数组并过滤空值。
- 文件：`packages/vue/src/hooks/useScrollbar/index.ts`
- 脆弱原因：调用者传入共享 options 对象时，会观察到其作为副作用被修改。
- 安全修改：规范化前将 `opts` 复制到本地变量。

**CSS 依赖 mount 元素已定位：**

- 滚动条轨道在 `display: contents` 容器内使用 `position: absolute`，因此它相对最近的已定位祖先定位，不一定是 `opts.mount`。
- 文件：`packages/vue/src/hooks/useScrollbar/index.less`，`packages/vue/src/hooks/useScrollbar/scrollbars.ts`
- 脆弱原因：如果消费者未在 mount 元素上设置 `position: relative/absolute`，thumb 会出现在错误位置。
- 安全修改：通过内联样式向 `opts.mount` 注入 `position: relative`，或在文档中将其作为必需前置条件。

**ant-design-vue 示例中的魔法尺寸：**

- `playground/src/ant-vue-table/index.vue` 对表格尺寸进行 `+ 160` 和 `- 60` 运算，但未作解释。
- 文件：`playground/src/ant-vue-table/index.vue`
- 脆弱原因：假设了固定表头高度与任意额外宽度；设计变更时即会失效。
- 安全修改：测量实际表头高度，或从 token/ref 中读取。

**fixture 构建的依赖解析可逃逸出 workspace：**

- `packages/nuxt` 的 `check:fixture`（nitro prerender）中，
  SSR bundle 从 `.pnpm` 虚拟 store 解析 `nostics` 时向上链为 `.pnpm/* → 根 node_modules → $HOME`，会命中 `$HOME/node_modules` 里的无关旧版副本（
  实测 0.2.0 缺 `defineProdDiagnostics` 导出致 prerender 500）。
- 当前缓解：根 `package.json` devDependencies 显式声明 `nostics ^1.2.0` 截断解析链；这也兜底了无 $HOME 幽灵的 CI 环境（否则 MODULE_NOT_FOUND）。
- 脆弱原因：凡 nitro/nuxt 构建期外部化（externalize）的传递依赖都有同类风险，子包声明拦截不到 `.pnpm` 内部起点。
- 安全修改：长期应等 nitro 侧修复 externalize 解析或 pnpm 提供 store 内隔离；届时可移除根声明。

## 扩展限制

**每个滚动条实例一个 Vue 应用：**

- 每次 `init()` 都会创建新的 `createApp(component)` 并挂载到 DOM。
- 文件：`packages/vue/src/hooks/useScrollbar/scrollbars.ts`
- 当前容量：页面上几十个滚动条会创建几十个微型 Vue 应用。
- 限制：每个应用自带调度器/响应式图；超过一定数量后，相比单一渲染器或 VNode 方案会带来更大的内存与调度开销。
- 加剧因素：`states` reactive 对象同时被主应用的多个 effect 和滚动条子应用的 render effect 订阅，一次滚动写入要穿越两个独立响应式图的调度器，是每帧双重调度的根源。
- 扩展路径：将滚动条渲染为由消费方应用管理的 teleport/VNode，或使用单一轻量渲染器。

## 测试覆盖缺口

**核心滚动条逻辑覆盖提升，但计算维度仍有缺口：**

- 已有（2026-07-28 性能优化后）：init/destroy 与泄漏防护（实例去重、副作用计数、hover 行为）、拖拽按帧合并与 path 短路、isScrolling 分方向与 idle 时序、
  样式对象引用稳定与 will-change 动态附加。
- 未覆盖：thumb 尺寸计算（sqrt 曲线）、位置-滚动比例映射的边界、`setOffset` 元素跟踪、自动探测启发式。
- 文件：`packages/vue/src/hooks/useScrollbar/index.ts`，`packages/vue/src/hooks/useScrollbar/utils.ts`
- 风险：尺寸边界情况（零 overflow、容器小于 thumb 最小值、快速 init/destroy）可能在无感知的情况下失效。
- 优先级：中。

**辅助 hook 部分覆盖：**

- 已有：useElementHover 的监听器接线与状态翻转、useElementSize 的 content-box/contentRect 消费与初始值、useScroll 的挂载测量与 scroll 更新与 onStop、
  useNativeScrollbar 的差值测量与探针清理。
- 未覆盖：useElementSize 的 SVG `getComputedStyle` 降级路径、useScroll 的 throttle 分支与原生 `scrollend` 去重、浏览器特定行为（
  ResizeObserver box sizes、scrollend 支持）的回归。
- 风险：浏览器特定行为的回归无法被捕获。
- 优先级：中。

**集成示例未测试：**

- 未覆盖：vxe-table、ant-design-vue、gantt-elastic、overlay-scrollbars 与新增的 ag-grid、tabulator、codemirror、
  el-table 示例是否正确渲染并保持滚动条同步（仅人工与浏览器 DOM 探测验证）。
- 文件：`playground/src/vxe-table/`、`playground/src/ant-vue-table/`、`playground/src/gantt-elastic/`、
  `playground/src/overlay-scrollbars/`、`playground/src/ag-grid.vue`、`playground/src/tabulator.vue`、
  `playground/src/codemirror.vue`、`playground/src/el-table.vue`
- 风险：第三方 DOM 变更会破坏示例，进而影响库的形象。
- 优先级：中。

## 缺失的关键功能

**Headless 组件与指令尚未完成：**

- `packages/vue/src/headless/use-scrollbar.vue` 只有 `<template> WIP </template>`，README 中也将指令与 headless 组件标为 WIP。
- 文件：`packages/vue/src/headless/use-scrollbar.vue`，`README.md`
- 阻塞：需要即插即用组件或指令 API 的使用者无法使用。

**没有公开文档站点：**

- README 将 "Github pages for document and preview" 标为 WIP。
- 文件：`README.md`
- 阻塞：新用户难以发现与体验交互示例。

## 已于 2026-07-28 性能优化中退役的隐患

以下条目在同日性能专项中修复（4 个垂直切片提交 4708bbe / c32678c / 5f9a931 / cd072e1），保留此清单供回溯：

- **重复调用 `init()` 的三层泄漏**：滚动条 Vue 应用与 DOM 容器随 init 累积（mount 前不 destroy + 无依赖 watchEffect 重跑挂载）、`visibleOnHover` 监听器永不清理、
  init 内 ~20 watcher 挂宿主 scope 线性泄漏；修复为 mount 前置 destroy + stopHover 清理链 + 每次 init 独立 effectScope 整批回收。
- **拖拽期 mousemove 未节流双重驱动**：onMouseMove 直驱 scrollTo 与 scroll 事件同帧重复驱动效应链；修复为位移记录 + rAF 调度的 applyDrag，同帧只取最后位移。
- **轨道长度为 0 时拖拽强拉到底**：`top / 0` 经 safeRatio 钳制为 1 使 targetScroll 取最大值；修复为 applyDrag 每分支 `path <= 0` 短路。
- **代理 effect 十二个同构 + scrollTo 死 watchEffect**：合并为 1 个全字段比较写入的 effect，scrollTo 直赋值；
  scrollXTick/scrollYTick 把 setTimeout id 存 ref 导致代理 effect 滚动期空跑，timer 句柄改闭包变量。
- **样式 effect 每帧全量重建 CSSProperties**：静态字段与位移分层，transform 改 `translateY(var(--thumb-y))` 消费 CSS 变量，states.styles 对象引用稳定；
  同引用对象下字段移除须空串赋值（Vue patchStyle 删除路径对同引用失效）。
- **`useNativeScrollbar` 探针测量未缓存**：模块级缓存（null 哨兵，0 为有效值），SSR 无 document 时不测量不缓存。
- **thumb 的 `will-change: auto` 无效**：改 isScrolling/isDragging 期间动态内联 `will-change: transform`，静止空串移除。

## 已于 2026-07-28 演示页修复中退役的隐患

- **vxe-table 4.20 的集成不兼容**：其 `package.json` 不声明 dependencies 却运行时 import `@vxe-ui/core`/`dom-zindex`（
  pnpm 10 严格布局下消费方须显式声明并将 `vxe-table` 列入 `optimizeDeps.include`）；4.20 新增 `.vxe-table--scroll-*-handle` 自绘滚动条元素，
  play 隐藏原生条的 `::-webkit-scrollbar` 规则对其失效致双滚动条共存；固定列整表复制 ×3 叠加只增不减的虚拟滚动渲染窗口（`endIndex = Math.max(...)`）使滚动长任务达 0.3-5s。
  经钉死回退 vxe-table@4.5.13 并恢复 `optimizeDeps.exclude` 退役。

## 已于 2026-07-28 工具链现代化中退役的隐患

以下条目在本次现代化中已修复，保留此清单供回溯：

- **tsconfig 非标准键**：`"includes"` 改为 `"include"`，include 范围显式覆盖 src / play / test / config，
  `moduleResolution` 改 `Bundler`。
- **包清单与构建产物不匹配**：`exports` 改为 types / import / require 三档现代双形式，CJS 产物 `dist/index.cjs` 已真实产出（原 `index.cjs.js` 从不生成），
  UMD 移除。
- **TypeScript 错误导致 check:types 失败**：5 处已知错误与升级后新暴露的错误已全部修复，`pnpm check:types` 现 exit 0，并纳入 CI 门禁。
- **CI 锁定 Node 16 与 pnpm 7**：CI 升 Node 24、pnpm action v4（版本读 `packageManager` 单源），
  并补齐 typecheck / lint / test / build 四门禁。
- **release CI 检出错误分支**：移除硬编码 `ref: dev`，检出触发分支本身。
- **Husky v8 废弃的 husky install**：迁 Husky 9，hook 改纯 shell 格式，prepare 改 `husky`。
- **Vue2 兼容声明不真实**：移除 vue-demi，peer 收紧 `vue: ^3.5.0`，声明现已与实际能力一致。

## 已于 2026-07-28 monorepo 改造中退役的隐患

- **SSR 环境下访问全局 DOM 不安全**（安全考量）与**没有 SSR 守卫**（缺失的关键功能）：
  `init`/`mount`/`onMouseDown`/`clean` 四个入口补齐 `typeof document`/`typeof window` 守卫，SSR 下静默跳过而非抛错；
  node 环境契约测试 `packages/vue/test/ssr.test.ts`（7 例）锁定不回退。

_隐患审计：2026-07-28（工具链现代化后刷新；同日经性能专项探索 + 外部正交审查复核，修正"sqrt 曲线每帧重算"的错误描述；同日性能优化落地 4 切片，7 条隐患退役、3 条更新现状，见性能退役清单；
monorepo 改造后路径整体迁移至 packages/* 与 playground/）_
