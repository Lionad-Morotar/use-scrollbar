# 测试规范

**分析日期：** 2026-07-27

## 测试框架

**运行器：**

- 未检测到测试运行器。`package.json` 中没有 `test`、`test:unit`、`test:e2e` 等脚本。
- 未检测到 `vitest.config.*`、`jest.config.*`、`playwright.config.*` 或 `cypress.config.*`。
- 未在 `devDependencies` 中发现 `@vue/test-utils`、`vitest`、`jest`、`jsdom`、`happy-dom`、`cypress`、`playwright-core` 等测试相关依赖。

**断言库：**

- 未检测到。

**运行命令：**

```bash
# 当前项目没有定义测试命令
# 建议后续添加后使用：
# pnpm test           # Run all tests
# pnpm test:watch     # Watch mode
# pnpm test:coverage  # Coverage
```

## 测试文件组织

**位置：**

- 未检测到测试文件。
- 在仓库中搜索 `*.test.*` 与 `*.spec.*` 均无结果。

**命名：**

- 未形成约定。若后续引入测试，建议采用：
  - `src/hooks/useXxx/index.test.ts`
  - `src/hooks/useXxx/__tests__/index.spec.ts`

**结构：**

```
[建议]
src/
└── hooks/
    └── useScroll/
        ├── index.ts
        └── index.test.ts
```

## 测试结构

**套件组织：**

- 当前无测试套件。建议按以下模式组织：

```typescript
import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useScroll } from '@/hooks'

describe('useScroll', () => {
  it('should initialize x and y to 0', () => {
    const el = document.createElement('div')
    const { x, y } = useScroll(ref(el))
    expect(x.value).toBe(0)
    expect(y.value).toBe(0)
  })
})
```

**模式：**

- 当前无实际模式。建议对 DOM 相关 composables 使用 `happy-dom` 或 `jsdom` 环境。

## Mock

**框架：**

- 未检测到 mocking 框架。建议引入 `vitest` 后使用其内置 `vi.fn()` / `vi.spyOn()`。

**模式：**

- 建议对 `window`、`ResizeObserver`、`IntersectionObserver`、`requestAnimationFrame` 等浏览器 API 进行 mock：

```typescript
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    },
  )
})
```

**需要 Mock 的内容：**

- 浏览器专属 API：`ResizeObserver`、`scrollTo`、`getComputedStyle`、`document.onselectstart`
- 第三方 composables 的副作用（如 `@vueuse/core` 的 `useResizeObserver`）
- 计时器：`setTimeout` / `setInterval`（`vi.useFakeTimers()`）

**不需要 Mock 的内容：**

- 不要 mock 被测 Hook 本身的响应式返回值，应通过真实调用后断言 ref 值。
- 不要 mock Vue 的 `ref` / `computed` / `watchEffect`，测试应验证它们协同工作的结果。

## Fixtures 与 Factories

**测试数据：**

- 当前无测试数据工厂。建议为常见 DOM 结构创建工厂函数：

```typescript
function createScrollContainer(contentHeight = 1000, viewportHeight = 200) {
  const wrapper = document.createElement('div')
  wrapper.style.height = `${viewportHeight}px`
  wrapper.style.overflow = 'auto'
  const content = document.createElement('div')
  content.style.height = `${contentHeight}px`
  wrapper.appendChild(content)
  return { wrapper, content }
}
```

**位置：**

- 建议放在 `src/hooks/useXxx/__tests__/fixtures.ts` 或项目级 `test/fixtures.ts`。

## 覆盖率

**要求：**

- 当前未设置覆盖率阈值。

**查看覆盖率：**

```bash
# 建议后续添加 vitest 后使用：
# pnpm vitest run --coverage
```

## 测试类型

**单元测试：**

- 当前缺失。应优先覆盖纯工具函数：
  - `src/hooks/useScrollbar/utils.ts`：`safeRatio`、`safePrecicion`、`notEmpty`、`findScrollElement`
  - `src/hooks/useScrollbar/states.ts`：默认状态生成

**集成测试：**

- 当前缺失。应覆盖 composables 与 DOM 的交互：
  - `useScroll` 的滚动事件响应与 `x`/`y` 更新
  - `useElementSize` 在 `ResizeObserver` 触发后的尺寸同步
  - `useScrollbar` 的拖动事件与 `scrollTo` 调用

**E2E 测试：**

- 未使用。示例页面集中在 `play/src/` 下，目前通过 `pnpm dev` 手动验证。

## 常见模式

**异步测试：**

- 当前无测试。建议对 `watch` / `watchEffect` 使用 `nextTick` 或 `flushPromises`：

```typescript
import { nextTick } from 'vue'

it('updates size after resize', async () => {
  // trigger resize
  await nextTick()
  expect(width.value).toBe(100)
})
```

**错误测试：**

- 当前无测试。建议对 `throw new Error('uninitial')` 等场景使用：

```typescript
it('throws when scrollTo is called before init', () => {
  const states = useScrollbar()
  expect(() => states.scrollTo(0, 0)).toThrow('uninitial')
})
```

## CI / 质量门禁

**当前状态：**

- `.github/workflows/ci-on-dev.yml` 与 `.github/workflows/ci-on-release.yml` 仅执行 `pnpm install --frozen-lockfile` 与 `pnpm build`，不运行测试。
- 提交前通过 `lint-staged` 运行 ESLint --fix，但不包含测试校验。

**建议：**

- 在引入测试框架后，应在 CI 中增加 `pnpm test` 步骤，并设置 `pre-commit` 钩子阻止破坏测试的提交。

---

_测试分析日期：2026-07-27_
