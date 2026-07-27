# 代码库隐患

**分析日期：** 2026-07-27

## 技术债

**包清单与构建产物不匹配：**

- `package.json` 将 `main` 与 `exports.require` 声明为 `./dist/lib/index.cjs.js`，但 `vite.config.ts` 只构建 ESM 与 UMD 产物（`dist/lib/index.esm.js` / `dist/lib/index.umd.js`）。
- 文件：`package.json:5-10`，`vite.config.ts:24-43`
- 影响：通过 `require` 解析本包的 CJS/Node 用户将收到缺失文件。
- 修复方向：对齐构建格式与 `exports`（新增 `cjs` 格式，或将 `main` 改为 UMD 构建），并设置 Rollup `output.exports: 'named'` 以消除 interop 警告。

**tsconfig 使用非标准键：**

- `tsconfig.json` 使用 `"includes"` 而非 `"include"`，TypeScript 会忽略该键，导致预期的包含范围（`env.d.ts`、`element-plus/global.d.ts`）未被强制生效。
- 文件：`tsconfig.json:31`
- 影响：类型检查行为实际上未定义，很可能回退到默认 glob，意外纳入 `play/` 代码。
- 修复方向：重命名为 `"include"`，并按需显式列出 `src` 与 `play`。

**内嵌 Hook 副本：**

- `src/hooks/useElementSize/index.ts` 与 `src/hooks/useScroll/index.ts` 是 `@vueuse/core` 工具函数的 fork/定制副本。
- 文件：`src/hooks/useElementSize/index.ts`，`src/hooks/useScroll/index.ts`
- 影响：上游修复与 API 更新必须手动 backport；偏离度越高维护成本越大。
- 修复方向：评估上游版本是否已满足当初的性能需求，若已满足则移除内嵌副本。

**滚动包裹层的启发式自动探测：**

- `useScrollbar` 可通过 `findScrollElement` 自动初始化，该函数以递归 DFS 选取第一个满足 `scrollHeight > clientHeight` 的子元素。
- 文件：`src/hooks/useScrollbar/index.ts:521-546`，`src/hooks/useScrollbar/utils.ts:26-41`
- 影响：在嵌套 overflow 容器场景中可能选错元素，且深树会付出不必要的遍历开销。
- 修复方向：将自动探测改为可选，并在文档中说明显式 `init({ mount, wrapper, content })` 才是稳健路径。

## 已知缺陷

**拖拽处理器错误地将事件对象绑定为 `this`：**

- `onDragY` 与 `onDragX` 调用 `onMouseDown.bind(e)(e)`，这会把 MouseEvent 绑定到 `this`，同时将其作为第一个参数传入；实际意图只是 `onMouseDown(e)`。
- 文件：`src/hooks/useScrollbar/index.ts:501-508`
- 触发条件：在滚动条 thumb 上触发 mousedown。
- 临时规避：目前无需规避，因为 `onMouseDown` 未使用 `this`；但代码具有误导性，一旦使用 `this` 就会崩溃。
- 修复方向：将两处调用替换为 `onMouseDown(e)`。

**TypeScript 错误导致 `pnpm check:types` 失败：**

- `pnpm check:types` 目前因多处错误失败，包括 `vxe-table-multy.vue` 缺少必填 prop `tableRef`、`compare-styles.vue` 存在未使用的 `instance`、以及 `useElementHover` 中 `MaybeComputedElementRef` 使用不兼容等。
- 文件：`play/src/vxe-table-multy.vue:10,35`，`play/src/compare-styles.vue:279`，`src/hooks/useElementHover/index.ts:25,33`
- 触发条件：运行 `pnpm check:types`。
- 临时规避：CI 未运行类型检查，因此这些错误在自动化流程中被静默忽略。
- 修复方向：将 `tableRef` 设为可选，或在多表示例中提供 `v-model:tableRef`；移除未使用的解构变量；将 hover 目标类型与 `@vueuse/core` 对齐。

**重复调用 `init()` 导致脱离的 Vue 应用泄漏：**

- `mount()` 每次都会新建一个 `createApp` 实例并追加到 DOM，但在 `init()` 再次调用时不会销毁之前的应用。
- 文件：`src/hooks/useScrollbar/index.ts:512-516`，`src/hooks/useScrollbar/scrollbars.ts:76-95`
- 触发条件：在同一个 `useScrollbar` 实例上多次调用 `barStates.init(...)`，或在 wrapper 中切换 enable。
- 临时规避：重新初始化前始终调用 `barStates.destroy()`。
- 修复方向：让 `mount()` 在创建新实例前先 unmount 已有的 `instance.value`。

**CI 在发布工作流中检出错误分支：**

- `.github/workflows/ci-on-release.yml` 在 `release` 分支 `push` 时触发，但 checkout 步骤硬编码了 `ref: dev`。
- 文件：`.github/workflows/ci-on-release.yml:14-16`
- 触发条件：每次推送到 `release`。
- 影响：发布分支上的代码可能并非 CI 实际构建的代码。
- 修复方向：移除硬编码的 `ref`，让工作流检出触发分支。

## 安全考量

**SSR 环境下访问全局 DOM 不安全：**

- `createComponent` 在 `scrollbars.ts` 中调用 `document.createElement('div')`；`useNativeScrollbar` 向 `document.body` 追加节点；`onMouseDown` 访问 `window.getSelection()` 与 `document.onselectstart`。
- 文件：`src/hooks/useScrollbar/scrollbars.ts:78`，`src/hooks/useNativeScrollbar/index.ts:14-33`，`src/hooks/useScrollbar/index.ts:457-478`
- 当前缓解：无；本库假设运行环境为浏览器。
- 建议：将 DOM 访问置于 `typeof document !== 'undefined'` 守卫之后，或至少注明这些 hook 仅客户端可用。对于 Nuxt/Vite SSR 用户这是硬性阻塞。

**全局修改 `document.onselectstart`：**

- 拖拽期间库会覆盖 `document.onselectstart`，并在清理时恢复之前的原始值。这绕过了现代事件监听器规范。
- 文件：`src/hooks/useScrollbar/index.ts:464-466`，`src/hooks/useScrollbar/index.ts:486`
- 当前缓解：在 `clean()` 中恢复先前值。
- 建议：在 mousedown 事件上调用 `preventDefault`，或挂载 `selectstart` 监听器并在其中调用 `preventDefault`，避免修改全局属性。

## 性能瓶颈

**`useScrollbar` 中过多的响应式订阅：**

- 每个 `useScrollbar` 实例约建立 18 个 `watchEffect`/`watch` 订阅，全部对同一个 `states` 对象与局部 ref 的变动作出响应。
- 文件：`src/hooks/useScrollbar/index.ts:152-396`
- 原因：每个尺寸/位置/样式维度都在独立 effect 中计算；每次滚动事件都会触发多个 effect 重算重叠值。
- 改进路径：将相关计算合并到单一 effect 或 computed 值中，并对样式计算 effect 进行 throttle/debounce。

**vxe-table wrapper 的轮询间隔永不超时：**

- `play/src/vxe-table/index.vue` 使用 `setInterval(..., 17 * 5)` 等待内部 vxe-table DOM 元素（`vxe-table--fixed-left-wrapper`、`vxe-table--fixed-right-wrapper`）。这些 interval 没有最大重试次数，也未在 unmount 时清理。
- 文件：`play/src/vxe-table/index.vue:38-71`
- 原因：依赖 vxe-table 内部类名；一旦类名变更或表格卸载，interval 将永远运行。
- 改进路径：将轮询替换为 `MutationObserver` 或 Vue 的 `nextTick` + `onMounted`，并在 `onUnmounted` 中始终清除 interval。

**每次滚动都执行平方根尺寸曲线：**

- thumb 尺寸计算在每次 scroll/resize 时于 `watchEffect` 中运行，并调用 `Math.sqrt(overflow)`。
- 文件：`src/hooks/useScrollbar/index.ts:234-288`
- 原因：尺寸只取决于内容/视口维度，而非滚动位置；但因读取了滚动时更新的响应式值，每次滚动都会重算。
- 改进路径：仅基于 content/viewport ref 计算 thumb 尺寸，并将其与滚动驱动的位置更新分离。

## 脆弱区域

**选择器依赖第三方内部类名：**

- vxe-table 与 ant-design-vue 示例查询了 `.vxe-table--body-wrapper`、`.vxe-body--x-space`、`.vxe-table--header-wrapper`、`.ant-table-header`、`.ant-table-body > table` 等内部类名。
- 文件：`play/src/vxe-table/index.vue:99-103`，`play/src/ant-vue-table/index.vue:42-43`
- 脆弱原因：vxe-table 或 ant-design-vue 的小版本升级可能重命名或移除这些类名，导致滚动条初始化静默失效。
- 安全修改：暴露显式的 `wrapper`/`content` 元素 ref，而非依赖内部 DOM 结构。
- 测试覆盖：没有自动化测试验证这些集成。

**`init()` 会修改调用者的 options 对象：**

- `init()` 会就地规范化 `opts.content`、`opts.wrapper`、`opts.viewport`，将单个值转为数组并过滤空值。
- 文件：`src/hooks/useScrollbar/index.ts:138-149`
- 脆弱原因：调用者传入共享 options 对象时，会观察到其作为副作用被修改。
- 安全修改：规范化前将 `opts` 复制到本地变量。

**CSS 依赖 mount 元素已定位：**

- 滚动条轨道在 `display: contents` 容器内使用 `position: absolute`，因此它相对最近的已定位祖先定位，不一定是 `opts.mount`。
- 文件：`src/hooks/useScrollbar/index.less:5-17`，`src/hooks/useScrollbar/scrollbars.ts:10`
- 脆弱原因：如果消费者未在 mount 元素上设置 `position: relative/absolute`，thumb 会出现在错误位置。
- 安全修改：通过内联样式向 `opts.mount` 注入 `position: relative`，或在文档中将其作为必需前置条件。

**ant-design-vue 示例中的魔法尺寸：**

- `play/src/ant-vue-table/index.vue` 对表格尺寸进行 `+ 160` 和 `- 60` 运算，但未作解释。
- 文件：`play/src/ant-vue-table/index.vue:28-31`
- 脆弱原因：假设了固定表头高度与任意额外宽度；设计变更时即会失效。
- 安全修改：测量实际表头高度，或从 token/ref 中读取。

## 扩展限制

**每个滚动条实例一个 Vue 应用：**

- 每次 `init()` 都会创建新的 `createApp(component)` 并挂载到 DOM。
- 文件：`src/hooks/useScrollbar/scrollbars.ts:76-78`
- 当前容量：页面上几十个滚动条会创建几十个微型 Vue 应用。
- 限制：每个应用自带调度器/响应式图；超过一定数量后，相比单一渲染器或 VNode 方案会带来更大的内存与调度开销。
- 扩展路径：将滚动条渲染为由消费方应用管理的 teleport/VNode，或使用单一轻量渲染器。

**样式更新未批量合并：**

- thumb 位置与样式通过多个 effect 写入 `states.styles`，单次滚动事件会引发多次响应式更新。
- 文件：`src/hooks/useScrollbar/index.ts:303-418`
- 限制：多实例高频滚动可能撑满 Vue 调度器。
- 扩展路径：在一个 computed 中派生最终样式对象，并以原子方式写入。

## 高风险依赖

**CI 锁定已终止支持的 Node.js 16 与旧版 pnpm 7：**

- `.github/workflows/ci-on-dev.yml` 与 `ci-on-release.yml` 使用 `node-version: 16` 与 `pnpm/action-setup@v2` 且 `version: 7`。
- 文件：`.github/workflows/ci-on-dev.yml:19-27`，`.github/workflows/ci-on-release.yml:19-27`
- 风险：Node 16 已终止支持；GitHub Actions 镜像可能弃用该版本，且不再提供安全补丁。
- 迁移计划：升级到 Node 20/22 与 pnpm 9/12，以匹配本地工具链偏好。

**Husky v8 使用已废弃的 `husky install`：**

- `package.json` 的 `prepare` 执行 `husky install`，该命令在 Husky v9 中已移除。
- 文件：`package.json:23`
- 风险：升级 Husky 会破坏安装步骤。
- 迁移计划：迁移到 Husky v9 的 `husky` 命令，或锁定 Husky 为 v8。

**Vue2 兼容声明并不真实：**

- README 列出 "Support Vue3 & <del>Vue2</del>" 但标注不完整，而 `useNativeScrollbar` 直接从 `'vue'` 导入 `reactive`，peer dependency 也是 `vue: ^3`。
- 文件：`src/hooks/useNativeScrollbar/index.ts:1`，`package.json:70-72`，`README.md:35`
- 风险：任何未来的 Vue2 支持工作都必须先审计每个文件中的直接 `vue` 导入与 peer 声明。
- 迁移计划：官方决定是否支持 Vue2；若不支持，移除声明与 `vue-demi` 中间层。

## 缺失的关键功能

**没有测试套件：**

- 不存在 `.test.*`、`.spec.*` 或测试框架配置文件。类型检查与构建是唯一的自动化质量门禁。
- 文件：n/a
- 阻塞：无法放心重构 `useScrollbar` 的尺寸/拖拽逻辑，也无法防止第三方表格集成回归。

**没有 SSR 守卫：**

- 问题：服务端渲染时会因无条件访问 DOM 全局对象而崩溃。
- 阻塞：无法在 Nuxt 或任何 SSR 环境中使用。

**Headless 组件与指令尚未完成：**

- `src/headless/use-scrollbar.vue` 只有 `<template> WIP </template>`，README 中也将指令与 headless 组件标为 WIP。
- 文件：`src/headless/use-scrollbar.vue`，`README.md:36-37`
- 阻塞：需要即插即用组件或指令 API 的使用者无法使用。

**没有公开文档站点：**

- README 将 "Github pages for document and preview" 标为 WIP。
- 文件：`README.md:38`
- 阻塞：新用户难以发现与体验交互示例。

## 测试覆盖缺口

**核心滚动条逻辑未测试：**

- 未覆盖：thumb 尺寸计算、位置-滚动比例映射、拖拽-滚动映射、`setOffset` 元素跟踪、自动探测启发式。
- 文件：`src/hooks/useScrollbar/index.ts`，`src/hooks/useScrollbar/utils.ts`
- 风险：尺寸边界情况（零 overflow、容器小于 thumb 最小值、快速 init/destroy）可能在无感知的情况下失效。
- 优先级：高。

**辅助 hook 未测试：**

- 未覆盖：`useElementHover` 监听器生命周期、`useElementSize` SVG 降级、`useNativeScrollbar` 宽度计算、`useScroll` scroll-end 检测。
- 文件：`src/hooks/useElementHover/index.ts`，`src/hooks/useElementSize/index.ts`，`src/hooks/useNativeScrollbar/index.ts`，`src/hooks/useScroll/index.ts`
- 风险：浏览器特定行为（如 ResizeObserver box sizes、scrollend 支持）的回归无法被捕获。
- 优先级：中。

**集成示例未测试：**

- 未覆盖：vxe-table、ant-design-vue、gantt-elastic、overlay-scrollbars 示例是否正确渲染并保持滚动条同步。
- 文件：`play/src/vxe-table/`、`play/src/ant-vue-table/`、`play/src/gantt-elastic/`、`play/src/overlay-scrollbars/`
- 风险：第三方 DOM 变更会破坏示例，进而影响库的形象。
- 优先级：中。

---

_隐患审计：2026-07-27_
