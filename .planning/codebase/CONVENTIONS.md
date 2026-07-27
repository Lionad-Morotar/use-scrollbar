# 编码规范

**分析日期：** 2026-07-27

## 命名规范

**文件：**

- 可复用 Hook 使用小写驼峰（camelCase）的目录名，入口文件统一为 `index.ts`：
  - `src/hooks/useScrollbar/index.ts`
  - `src/hooks/useScroll/index.ts`
  - `src/hooks/useElementHover/index.ts`
- Vue 单文件组件（SFC）使用大写驼峰（PascalCase）：
  - `src/headless/use-scrollbar.vue`
  - `play/src/vxe-table.vue`
- 同一 Hook 的辅助模块按职责命名：
  - `src/hooks/useScrollbar/states.ts`
  - `src/hooks/useScrollbar/scrollbars.ts`
  - `src/hooks/useScrollbar/utils.ts`
  - `src/hooks/useScrollbar/type.ts`

**函数：**

- 组合式函数（composables）使用 `useXxx` 前缀并作为默认导出：
  - `useScrollbar`、`useScroll`、`useElementSize`、`useElementHover`
- 工具函数使用 camelCase：
  - `notEmpty`、`safeRatio`、`safePrecicion`、`findScrollElement`
- 事件处理函数使用 `onXxx` 前缀：
  - `onMouseDown`、`onMouseMove`、`onScrollHandler`

**变量：**

- DOM 元素引用使用 `$` 前缀：
  - `$el`、`$elm`、`$wrapper`、`$content`
- 响应式状态优先使用 `ref` / `reactive`，命名保持语义化：
  - `isScrolling`、`inTrigger`、`mountOnW`、`viewportH`
- 临时集合使用复数简写：
  - `ws`、`hs`、`tops`、`lefts`

**类型：**

- Hook 选项类型使用 `UseXxxOptions`：
  - `UseScrollOptions`（`src/hooks/useScroll/index.ts:8`）
- Hook 返回类型使用 `UseXxxReturn` 并通过 `ReturnType<typeof useXxx>` 推导：
  - `UseScrollReturn`（`src/hooks/useScroll/index.ts:199`）
  - `UseElementSizeReturn`（`src/hooks/useElementSize/index.ts:80`）
- 组件内部状态类型使用 `States` / `ScrollbarStates`：
  - `States`（`src/hooks/useScrollbar/states.ts:84`）

**常量：**

- 全大写 SNAKE_CASE 用于模块级常量：
  - `SCROLLBAR_GAP`（`src/hooks/useScrollbar/utils.ts:11`）

## 代码风格

**格式化：**

- 使用 Prettier，配置在 `.prettierrc`：
  - `printWidth: 100`
  - `semi: false`（省略分号）
  - `singleQuote: true`
  - `trailingComma: all`
  - `vueIndentScriptAndStyle: true`
  - `htmlWhitespaceSensitivity: strict`

**Linting：**

- 使用 ESLint，配置在 `.eslintrc.js`：
  - Parser：`vue-eslint-parser` + `@typescript-eslint/parser`
  - Extends：`eslint:recommended`、`@typescript-eslint/recommended`、`plugin:vue/vue3-recommended`
  - 关闭 Vue 多词组件名校验：`vue/multi-word-component-names: off`
  - 关闭属性排序、单/多行内容换行等强制性格式规则：`vue/attributes-order`、`vue/max-attributes-per-line` 等
  - 关闭 TypeScript 显式返回类型与 `any` 限制：`@typescript-eslint/explicit-module-boundary-types`、`@typescript-eslint/no-explicit-any`
- `lint-staged` 在 pre-commit 阶段对 `*.{js,ts,tsx,vue}` 执行 `eslint --fix`（`.husky/pre-commit`）

## 导入组织

**顺序（自上而下）：**

1. 框架 / 运行时（`vue-demi`、`vue`）
2. 第三方库（`@vueuse/core`、`@vueuse/shared`）
3. 本地 Hook 桶文件或别名路径（`@/hooks`）
4. 同目录辅助模块（`./utils`、`./states`、`./scrollbars`）
5. `import type` 类型导入集中放在底部

**示例：**

```typescript
import type { MaybeComputedElementRef, MaybeElement, MaybeRef } from '@vueuse/core'
import type { CSSProperties, Ref } from 'vue-demi'
import type { States } from './states'
import { unrefElement, useEventListener } from '@vueuse/core'
import { tryOnScopeDispose } from '@vueuse/shared'
import { ref, watch } from 'vue-demi'
import { useElementHover, useElementSize, useScroll } from '@/hooks'

import { createComponent } from './scrollbars'
import getOpts from './states'
import { findScrollElement, notEmpty, safePrecicion, safeRatio, SCROLLBAR_GAP } from './utils'
```

**路径别名：**

- `@/*` 映射到 `./src/*`（`tsconfig.json` paths）
- `@/hooks` 在 Vite 中显式映射到 `./src/hooks/index.ts`（`vite.config.ts`、`play/vite.config.ts`）
- 同目录内优先使用相对路径 `./xxx`，避免别名回绕

## 错误处理

**模式：**

- 防御式提前返回（Guard Clauses）处理 `window` 或元素不存在的情况：
  ```typescript
  if (!window)
    return
  const _element = toValue(element)
  if (!_element)
    return
  const $elm = _element instanceof Document ? window.document.body : _element
  ```
- 可恢复的内部错误使用 `try/catch` + `console.error`：
  - `useScrollbar` 自动初始化失败时捕获异常（`src/hooks/useScrollbar/index.ts:528-539`）
  - `useNativeScrollbar` 测量原生滚动条宽度时捕获异常（`src/hooks/useNativeScrollbar/index.ts:35-37`）
- 未初始化方法通过抛出错误提示开发者：
  - `scrollTo` 默认实现 `throw new Error('uninitial')`（`src/hooks/useScrollbar/states.ts:79-81`）

**避免：**

- 当前没有统一的错误类型或 Result 模式，错误信息以字符串为主。

## 日志

**框架：** `console`

**模式：**

- 调试日志保留在源码中，使用 `[debug]` / `[info]` / `[ERR]` 前缀：
  - `console.log('[info] mode', mode)`（`vite.config.ts:46`）
  - `console.error('[ERR] error in init virtual scrollbar', x, err)`（`src/hooks/useScrollbar/index.ts:538`）
- 业务交互日志：拖动滚动条时临时禁用文本选择会打印 `[info] temporarily disable select when dragging scrollbars`（`src/hooks/useScrollbar/index.ts:466`）

## 注释

**何时注释：**

- 用中文解释模块职责、算法规则、隐含假设和折衷，而不是复述代码动作。
- 使用 `/* 区域标题 */` 分隔代码段落：
  - `/* Guards */`、`/* 初始化数据 */`、`/* 计算滚动条的显隐状态 */`（`src/hooks/useScrollbar/index.ts`）
- 对复杂算法补充规则说明：
  - `useScrollbar` 滚动条尺寸计算规则（`src/hooks/useScrollbar/index.ts:226-233`）

**TODO / FIXME：**

- 允许在注释中保留 `TODO` / `FIXME` / `@FIXME` 作为未完成事项的显式标记：
  - `// TODO DeepPartial<typeof defaultOpts>`（`src/hooks/useScrollbar/index.ts:33`）
  - `@FIXME 当容器尺寸大于滚动条尺寸时`（`src/hooks/useScrollbar/index.ts:232`）

**JSDoc/TSDoc：**

- 公共 API 使用 JSDoc 说明参数、默认值、触发时机：
  - `UseScrollOptions`（`src/hooks/useScroll/index.ts:8-62`）
- 内部工具函数通常不写 JSDoc

## 函数设计

**大小：**

- 没有严格行数限制，但核心实现文件明显偏长：`src/hooks/useScrollbar/index.ts` 约 550 行，已超过一般 300 行拆分建议。

**参数：**

- Composables 第一个参数通常是 `MaybeRefOrGetter<HTMLElement | ...>` 或 `MaybeComputedElementRef`：
  - `useScroll(element, options)`
  - `useElementSize(target, initialSize, options)`
- 配置对象使用可选参数并提供默认值：
  - `useScrollOptions` 默认 `throttle = 0`、`idle = 200`

**返回值：**

- 返回 `reactive` 状态对象或包含 ref 的 plain 对象：
  - `useScrollbar` 返回 `states`（`reactive`）
  - `useScroll` 返回 `{ x, y, isScrolling, measure }`
- 类型通过 `ReturnType<typeof xxx>` 导出

## 模块设计

**导出：**

- 每个 Hook 目录的 `index.ts` 默认导出 composable，并命名导出相关类型：
  - `export default function useScroll...`
  - `export type UseScrollReturn = ...`
- 桶文件 `src/hooks/index.ts` 同时提供命名导出和默认导出对象，兼容多种引入方式：
  - `export { useScrollbar, ... }`
  - `const index = { ... }; export default index`

**桶文件：**

- 使用桶文件聚合子模块：`src/hooks/index.ts` 统一导出所有 hooks
- 桶文件内部再 `export * from './useXxx'` 以暴露子模块的类型

**无 SFC 组件：**

- 滚动条 UI 通过渲染函数（render function）创建，不使用 `.vue` 文件：
  - `src/hooks/useScrollbar/scrollbars.ts` 使用 `h`、`createVNode`、`createApp` 动态挂载组件

---

_规范分析日期：2026-07-27_
