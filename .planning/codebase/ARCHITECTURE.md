<!-- refreshed: 2026-07-27 -->

# 架构

**分析日期：** 2026-07-27

## 系统概览

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         Consumer Component / Page                        │
│     `play/src/compare-styles.vue`  ·  `play/src/vxe-table/index.vue`     │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Public API Surface                              │
│                   `src/hooks/index.ts` (barrel exports)                  │
│   useScrollbar  ·  useElementSize  ·  useElementHover  ·  useScroll      │
└──────────────┬──────────────────────────────┬───────────────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐  ┌──────────────────────────────────────┐
│   Scrollbar Core Hook        │  │   Utility / Satellite Hooks          │
│   `src/hooks/useScrollbar/   │  │   `src/hooks/useElementSize/...`     │
│    index.ts`                 │  │   `src/hooks/useElementHover/...`    │
│                              │  │   `src/hooks/useScroll/...`          │
│  ┌────────────────────────┐  │  │   `src/hooks/useNativeScrollbar/...` │
│  │ Reactive State Machine │  │  └──────────────────────────────────────┘
│  │ `states.ts`            │  │
│  └──────────┬─────────────┘  │
│             │                │
│  ┌──────────▼─────────────┐  │
│  │ Headless DOM Component │  │
│  │ `scrollbars.ts`        │  │
│  └──────────┬─────────────┘  │
│             │                │
└─────────────┼────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Render Runtime                                 │
│           `vue-demi` / `vue` (peer dependency)                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## 组件职责

| 组件 | 职责 | 文件 |
| --- | --- | --- |
| `useScrollbar` | 主组合式函数：挂载虚拟滚动条，计算滑块几何与位置，绑定拖拽事件 | `src/hooks/useScrollbar/index.ts` |
| `createComponent` | 通过 `vue` VNode API 渲染实际滚动条 DOM 节点并命令式挂载 | `src/hooks/useScrollbar/scrollbars.ts` |
| `getOpts` | 为 `useScrollbar` 与 DOM 组件生成 consumed 响应式状态对象 | `src/hooks/useScrollbar/states.ts` |
| `useScroll` | 面向性能的 `@vueuse/core/useScroll` 替代方案；暴露可写的 `x`/`y` computed refs | `src/hooks/useScroll/index.ts` |
| `useElementSize` | 包装 `ResizeObserver` 并具备 SVG 降级方案；用于测量 mount/viewport/content 元素 | `src/hooks/useElementSize/index.ts` |
| `useElementHover` | 挂载 `mouseenter`/`mouseleave` 监听器以驱动滚动条显隐 | `src/hooks/useElementHover/index.ts` |
| `useNativeScrollbar` | 通过创建临时 DOM 元素测量原生滚动条宽度 | `src/hooks/useNativeScrollbar/index.ts` |

## 模式概览

**总体：** 无头组合式函数 + 命令式 DOM 挂载

**关键特征：**

- 公共 API 是一组 Vue Composition API 函数，而非组件。
- 可视滚动条由一个内部以编程方式创建的 Vue 应用（`createApp`）渲染，该应用位于消费方渲染树之外。
- 状态是一个返回给调用者的扁平可变响应式对象；调用者读取并直接写入 `theme` 或 `offset` 等字段。
- 几何尺寸在 `watchEffect` 块内根据元素尺寸、滚动位置与拖拽状态派生。

## 分层

**公共 API 层：**

- 用途：向消费方暴露库能力，并集中导出以便打包。
- 位置：`src/hooks/index.ts`
- 包含：所有 hooks 的命名导出以及一个默认对象导出。
- 依赖：所有 hook 实现。
- 使用者：应用代码、包入口、playground 页面。

**滚动条核心层：**

- 用途：将原生滚动容器转换为自定义滚动条覆盖层。
- 位置：`src/hooks/useScrollbar/index.ts`
- 包含：`useScrollbar` 实现、拖拽计算、显隐逻辑、生命周期清理。
- 依赖：`useElementSize`、`useElementHover`、`useScroll`、`states`、`scrollbars`、`utils`。
- 使用者：公共 API、playground 示例。

**状态定义层：**

- 用途：定义可变滚动条状态的形状与默认值。
- 位置：`src/hooks/useScrollbar/states.ts`
- 包含：`getOpts` 工厂函数与 `States` 类型。
- 依赖：`utils` 中的 `SCROLLBAR_GAP`、`type.ts` 中的 `Theme`。
- 使用者：`useScrollbar/index.ts`、`scrollbars.ts`。

**渲染器层：**

- 用途：创建并更新滚动条滑块的 DOM 表示。
- 位置：`src/hooks/useScrollbar/scrollbars.ts`
- 包含：使用 `h`、`createVNode`、`Transition`、`vShow`、`createApp` 的 `createComponent` 函数。
- 依赖：`useScrollbar/index.ts` 中的 `ScrollbarStates` 类型。
- 使用者：`useScrollbar/index.ts` 通过 `mount()` 调用。

**工具 / 卫星 Hooks 层：**

- 用途：提供可复用的底层响应式原语。
- 位置：`src/hooks/useElementSize/`、`src/hooks/useElementHover/`、`src/hooks/useScroll/`、`src/hooks/useNativeScrollbar/`
- 包含：元素尺寸、悬停检测、滚动追踪、原生滚动条宽度测量。
- 依赖：`@vueuse/core`、`@vueuse/shared`、`vue-demi`。
- 使用者：核心滚动条层与消费方。

**样式层：**

- 用途：为渲染出的滚动条提供视觉主题与过渡。
- 位置：`src/hooks/useScrollbar/index.less`
- 包含：轨道/滑块布局、透明度过渡、`normal`/`steam`/`css-tricks` 主题。
- 依赖：`scrollbars.ts` 发出的 DOM 类名。
- 使用者：消费方通过打包后的 CSS 引入。

**Playground 层：**

- 用途：演示与真实第三方组件的集成。
- 位置：`play/`
- 包含：Vite 开发服务器、`vxe-table`、`ant-design-vue`、甘特图与样式对比的示例页面。
- 依赖：`src/hooks` 通过 `@/hooks` 别名引入。
- 使用者：仅开发者使用；不会随包发布。

## 数据流

### 主滚动条生命周期

1. **入口** — 消费方调用 `useScrollbar(elemRef, options)`（`src/hooks/useScrollbar/index.ts:31`）。
2. **自动发现** — 若提供 `initOn`，hook 通过 `findScrollElement`（`src/hooks/useScrollbar/utils.ts:26`）查找最近的可滚动子元素并调用 `init()`（`src/hooks/useScrollbar/index.ts:521`）。
3. **测量** — `init()` 规范化 `mount`、`content`、`wrapper`、`viewport` refs，并通过 `useElementSize` 与 `useScroll` 启动响应式尺寸/滚动观测（`src/hooks/useScrollbar/index.ts:129`）。
4. **状态派生** — 多个 `watchEffect` 块根据观测值计算显隐、滑块尺寸、轨道长度、滑块位置以及滚动标志（`src/hooks/useScrollbar/index.ts:219`–`396`）。
5. **DOM 创建** — `mount()` 调用 `createComponent(states)`（`src/hooks/useScrollbar/index.ts:512`），构建一个包含两条轨道/滑块 VNode 的 Vue 应用，并将其追加到 mount 元素（`src/hooks/useScrollbar/scrollbars.ts:76`）。
6. **交互** — 滑块上的 `mousedown` 触发拖拽逻辑，通过调用 `states.scrollTo()` 更新滚动位置（`src/hooks/useScrollbar/index.ts:422`–`508`）。
7. **清理** — `tryOnScopeDispose` 与 `onUnmounted` 销毁已挂载组件并移除监听器（`src/hooks/useScrollbar/index.ts:67`–`70`、`src/hooks/useScrollbar/scrollbars.ts:80`）。

### 手动集成路径

1. 消费方在没有初始元素的情况下获取 `barStates = useScrollbar()`。
2. 目标组件挂载后，消费方调用 `barStates.setOffset({ y: { top: $header } })` 将滑块偏移绑定到元素尺寸。
3. 消费方调用 `barStates.init({ mount, content, wrapper, viewport })` 连接滚动系统。
4. 此后状态与 DOM 响应式更新。

**状态管理：**

- 由 `useScrollbar` 返回的单一可变响应式对象（`states`）是事实来源。
- 调用者直接修改 `theme`、`offset`、`isHidden` 等字段。
- 内部 refs 通过 `watchEffect` 代理到 `states` 中，使 DOM 组件看到一个稳定的对象。

## 关键抽象

**滚动条状态对象：**

- 用途：核心 hook 与渲染器之间共享的集中式响应式容器。
- 示例：`src/hooks/useScrollbar/states.ts`
- 模式：扁平的可变响应式对象，既包含派生字段（`visible`、`size`、`position`），也包含命令式方法（`init`、`mount`、`destroy`、`setOffset`、`scrollTo`）。

**命令式组件挂载：**

- 用途：无需消费方在模板中放置组件即可渲染 UI。
- 示例：`src/hooks/useScrollbar/scrollbars.ts:76`
- 模式：`createApp` + 手动 `mount(document.createElement('div'))`，随后将 `$el` 追加到目标容器。

**滚动系统模型：**

- 用途：将任意可滚动区域抽象为 `mount`/`content`/`wrapper`/`viewport` 角色。
- 示例：`src/hooks/useScrollbar/index.ts:129`
- 模式：接受元素 ref 数组，将其规范化，并根据观测尺寸的并集派生几何尺寸。

## 入口点

**库入口点：**

- 位置：`src/hooks/index.ts`
- 触发方式：包引入（`use-scrollbars`）。
- 职责：重新导出所有 hooks，将 `useScrollbars` 别名到 `useScrollbar`，提供一个默认的命名空间对象。

**构建入口点：**

- 位置：`src/hooks/index.ts`（在 `vite.config.ts:26` 中引用）。
- 触发方式：`pnpm build`。
- 职责：在 `dist/` 中生成 ESM 与 UMD 产物以及 `.d.ts` 声明。

**Playground 入口点：**

- 位置：`play/main.ts`
- 触发方式：`pnpm dev` / `pnpm serve`。
- 职责：根据 URL 路径动态加载对应页面、安装 UI 库、挂载示例组件。

## 架构约束

- **Vue 运行时耦合：** 渲染器通过 `createApp` 为每个滚动条实例创建独立的 Vue 应用，这会带来额外的应用上下文运行时开销，并假设使用 Vue 3 API（通过 `vue-demi`）。`src/hooks/useScrollbar/scrollbars.ts:76`
- **渲染器清理中的全局状态：** 拖拽期间 `document.onselectstart` 被覆盖，并从捕获的引用中恢复；这会修改全局 DOM 属性。`src/hooks/useScrollbar/index.ts:464`–`486`
- **Hook 实例之间无隔离：** `useScrollbar` 修改返回给调用者的单一 `states` 对象；同一元素上的多次 `useScrollbar` 调用会创建独立的应用，但不存在跨实例协调。
- **DOM 修改假设：** Hook 将其滚动条元素直接追加到 `opts.mount`，并依赖消费方布局的 `position: relative/absolute`。`src/hooks/useScrollbar/index.less` 中对容器使用 `display: contents`，对轨道使用 `position: absolute`。
- **循环依赖风险：** `useScrollbar/index.ts` 从桶文件 `@/hooks` 导入 `useElementSize`/`useElementHover`/`useScroll`，而 `src/hooks/index.ts` 又再次导出 `useScrollbar`。Vite 别名在构建时解决此问题，但这仍是一个桶文件循环。

## 反模式

### 运行时 DOM 轮询

**发生了什么：** `vxe-table` 示例反复使用 `setInterval` 查询 DOM，直到固定左/右 wrapper 出现，然后解析手写的 deferred promises。`play/src/vxe-table/index.vue:38`–`71` **为什么不对：** 它将集成代码与第三方库的内部类名耦合，并通过轮询引入非确定性时序。 **应该这样做：** 优先使用组件公开的 ref API 或触发的事件；如果无法避免 DOM 访问，应将轮询封装到单个 helper 中，并提供超时/中止路径。

### 手动全局选区抑制

**发生了什么：** 拖拽期间，代码设置 `document.onselectstart = () => false`，并通过引用恢复之前的处理器。`src/hooks/useScrollbar/index.ts:464`–`486` **为什么不对：** 它会与其他可能管理 `onselectstart` 的代码竞争，并且在没有特性检测的情况下直接调用 `window.getSelection()`。 **应该这样做：** 在拖拽期间向 `document.body` 添加/移除一个临时的 CSS 类（如 `user-select: none`），或在足够的场景下对原始鼠标事件使用 `preventDefault()`。

### 无头组件占位

**发生了什么：** `src/headless/use-scrollbar.vue` 存在，但只包含一个 `WIP` 模板。`src/headless/use-scrollbar.vue:1` **为什么不对：** 源码树中的未完成组件可能误导消费方，并使公共表面复杂化。 **应该这样做：** 删除该占位文件，或将其移到功能分支直到实现完成。

## 错误处理

**策略：** 对 DOM 操作采取防御性 try/catch，并记录 `console.error`。

**模式：**

- 自动初始化将元素发现包装在 try/catch 中，并记录到 `console.error`。`src/hooks/useScrollbar/index.ts:537`–`539`
- `vxe-table` 集成捕获初始化错误，并回退到调用 `barStates.destroy()`。`play/src/vxe-table/index.vue:114`–`118`
- `useNativeScrollbar` 静默记录测量错误并返回 `0`。`src/hooks/useNativeScrollbar/index.ts:35`

## 横切关注点

**日志：** 核心代码与 playground 代码中散布着直接的 `console.log`/`console.error` 调用；没有日志抽象。

**校验：** 运行时校验极少；类型通过 TypeScript 在编译期强制执行。诸如 `opts.mount = opts.mount!` 之类的假设绕过空值检查。`src/hooks/useScrollbar/index.ts:138`

**认证：** 不适用；这是一个浏览器 UI 库，没有认证层。

---

_架构分析：2026-07-27_
