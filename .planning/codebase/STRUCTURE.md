# 代码库结构

**分析日期：** 2026-07-28（monorepo 改造后重写）

## 目录布局

```
[project-root]/
├── .github/            # GitHub workflows（ci-on-dev / ci-on-release，对 monorepo 布局无感知）
├── .husky/             # Git hooks (husky v9)
├── .planning/          # Codebase maps and planning documents
│   └── codebase/       # GSD codebase analysis output
├── docs/               # README assets and screenshots
├── packages/
│   ├── vue/            # 核心包 @lionad/use-scrollbar
│   │   ├── src/
│   │   │   ├── headless/   # WIP headless component placeholder
│   │   │   └── hooks/      # Composable functions
│   │   ├── test/           # vitest specs（含 SSR 契约 ssr.test.ts）
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts  # 库构建（Rolldown lib + unplugin-dts）
│   │   └── vitest.config.ts
│   └── nuxt/           # Nuxt 模块 @lionad/nuxt-use-scrollbar
│       ├── src/module.ts   # 模块定义（auto-imports + 样式注入）
│       ├── fixture/        # 最小 Nuxt 应用（nuxi build + nitro prerender 验证）
│       ├── package.json
│       └── tsconfig.json
├── playground/         # Vite-based dev playground and examples
│   ├── src/            # Example pages and integration demos
│   ├── index.html      # Playground HTML shell
│   ├── main.ts         # Dynamic page router / entry（import.meta.glob 文件式路由）
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts  # Playground Vite config（@/hooks alias → packages/vue/src/hooks）
├── .editorconfig
├── .gitignore
├── .npmrc
├── commitlint.config.cjs
├── eslint.config.ts    # ESLint 10 flat config（根级统一）
├── package.json        # 私有根包：编排脚本（pnpm -r --if-present）+ 共享质量工具链
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── postcss.config.mjs
└── README.md
```

## 目录用途

**`packages/vue/`：**

- 用途：核心库实现与发布主体（`@lionad/use-scrollbar`）。
- 包含：Vue composition functions、状态工厂、渲染器、工具 helper、样式与全部测试。
- 关键文件：`packages/vue/src/hooks/index.ts`、`packages/vue/src/hooks/useScrollbar/index.ts`、`packages/vue/src/hooks/useScrollbar/scrollbars.ts`、`packages/vue/src/hooks/useScrollbar/states.ts`、`packages/vue/src/hooks/useScrollbar/index.less`

**`packages/vue/src/hooks/`：**

- 用途：每个组合式函数一个目录。
- 包含：桶文件风格的 `index.ts` 以及每个 hook 的子目录。
- 关键文件：`packages/vue/src/hooks/index.ts`、`useScrollbar/`、`useScroll/`、`useElementSize/`、`useElementHover/`、`useNativeScrollbar/`

**`packages/vue/src/hooks/useScrollbar/`：**

- 用途：核心滚动条组合式函数及其支持模块。
- 包含：主 hook、状态工厂、命令式渲染器、类型、数学/DOM helper 与样式。
- 关键文件：`index.ts`、`scrollbars.ts`、`states.ts`、`utils.ts`、`type.ts`、`index.less`

**`packages/vue/test/`：**

- 用途：vitest 特征锁定与契约测试（happy-dom + node 双环境）。
- 关键文件：`ssr.test.ts`（node 环境 SSR 契约，`/** @vitest-environment node */` pragma）、states/hooks/utils 各 spec

**`packages/nuxt/`：**

- 用途：Nuxt 模块封装（`@lionad/nuxt-use-scrollbar`），@nuxt/module-builder 构建。
- 包含：模块定义、最小 fixture 应用。
- 关键文件：`src/module.ts`、`fixture/nuxt.config.ts`、`fixture/app.vue`

**`packages/nuxt/fixture/`：**

- 用途：模块的最小消费方，验收路径为 `nuxi build` + nitro prerender 路由 `/`。
- 说明：`.nuxt/` 与 `.output/` 由 `nuxi prepare`/`nuxi build` 生成，不入库。

**`playground/`：**

- 用途：开发 playground 与集成示例（私有包 `use-scrollbar-playground`）。
- 包含：Vite 应用入口、示例页面与 helper hooks。
- 关键文件：`main.ts`、`vite.config.ts`、`src/home.vue`、`src/compare-styles.vue`、`src/vxe-table/`、`src/ant-vue-table/`、`src/gantt-elastic/`、`src/ag-grid.vue`、`src/tabulator.vue`、`src/codemirror.vue`、`src/el-table.vue`、`src/overlay-scrollbars/`

**`docs/`：**

- 用途：README 引用的静态资源。
- 包含：PNG/SVG 图片与 logo。
- 关键文件：`docs/assets/logo.png`、`docs/assets/compare-1.png`、`docs/assets/compare-3.png`

**`.planning/codebase/`：**

- 用途：GSD 代码库分析文档。
- 包含：`ARCHITECTURE.md`、`STRUCTURE.md`、`STACK.md`、`CONCERNS.md` 等。

## 关键文件位置

**入口点：**

- `packages/vue/src/hooks/index.ts`：库公共 API 与包入口。
- `packages/nuxt/src/module.ts`：Nuxt 模块入口。
- `playground/main.ts`：Playground 开发服务器入口。

**配置：**

- `packages/vue/vite.config.ts`：库构建（Vite + unplugin-dts，输出 ESM + CJS + 类型 + style.css）。
- `playground/vite.config.ts`：带 `@/hooks` 别名的 Playground 开发服务器配置（端口 7232）。
- 各包 `tsconfig.json`：独立 TS 配置（根 tsconfig 已删除，根不再有源码）。
- `package.json`（根）：编排脚本、peer 无、共享 devDeps（eslint/husky/commitlint/postcss/nostics）。

**核心逻辑：**

- `packages/vue/src/hooks/useScrollbar/index.ts`：主 `useScrollbar` 组合式函数（含 SSR 守卫）。
- `packages/vue/src/hooks/useScrollbar/scrollbars.ts`：命令式 Vue 组件渲染器。
- `packages/vue/src/hooks/useScrollbar/states.ts`：响应式状态工厂。
- `packages/vue/src/hooks/useScrollbar/utils.ts`：数学与 DOM 遍历 helper。
- `packages/vue/src/hooks/useScrollbar/type.ts`：`Theme` 类型定义。
- `packages/vue/src/hooks/useScrollbar/index.less`：滚动条主题与布局样式。

**卫星 Hooks：**

- `useElementSize/index.ts`：基于 ResizeObserver 的尺寸测量。
- `useElementHover/index.ts`：悬停状态监听。
- `useScroll/index.ts`：面向性能的滚动追踪。
- `useNativeScrollbar/index.ts`：原生滚动条宽度测量。

## 命名约定

**文件：**

- 组合式函数：目录名使用 camelCase（`useScrollbar/`、`useElementSize/`），内含 `index.ts`。
- 与组合式函数同位置样式：组合式函数目录内的 `index.less`。
- 桶文件：`packages/vue/src/hooks/index.ts` 重新导出每个 hook。

**目录：**

- `packages/vue/src/hooks/<composableName>/`：每个组合式函数一个目录。
- `playground/src/<example-name>/`：每个复杂 playground 示例一个目录；`index.vue` 为页面根组件；单文件示例直接 `playground/src/<example-name>.vue`。

**函数：**

- 组合式函数以文件名同名函数默认导出，例如 `useScrollbar`、`useScroll`。
- Helper 工厂前缀为 `get`/`create`，例如 `getOpts`、`createComponent`。

## 新增代码位置

**新组合式函数：**

- 实现：`packages/vue/src/hooks/use<Name>/index.ts`
- 类型：`packages/vue/src/hooks/use<Name>/type.ts`（可选）
- 导出：在 `packages/vue/src/hooks/index.ts` 中添加命名重新导出
- Nuxt 暴露：在 `packages/nuxt/src/module.ts` 的 composables 清单中补登记

**新核心滚动条功能：**

- 状态字段：`packages/vue/src/hooks/useScrollbar/states.ts`
- 逻辑 / 派生：`packages/vue/src/hooks/useScrollbar/index.ts`
- 渲染器变更：`packages/vue/src/hooks/useScrollbar/scrollbars.ts`
- 样式变更：`packages/vue/src/hooks/useScrollbar/index.less`

**新主题：**

- 在 `packages/vue/src/hooks/useScrollbar/type.ts` 的 `Theme` 中添加主题字面量。
- 在 `packages/vue/src/hooks/useScrollbar/index.less` 的 `&.is-<theme>` 下添加对应 CSS 规则。

**新 Playground 示例：**

- 页面组件：`playground/src/<example-name>.vue` 或 `playground/src/<example-name>/index.vue`
- 将自动被 `playground/main.ts` 的 `import.meta.glob` 匹配；在 `playground/src/home.vue` 索引中补登记

**工具函数：**

- 共享 helper：滚动条专用 helper 放在 `packages/vue/src/hooks/useScrollbar/utils.ts`；目前未使用新的 `packages/vue/src/utils/` 目录。

## 特殊目录

**`packages/vue/src/headless/`：**

- 用途：预留用于无头滚动条 Vue 组件。
- 生成方式：否。
- 是否提交：是，但只包含一个 `WIP` 占位文件。

**各包 `dist/` 与 `packages/nuxt/fixture/.nuxt/`、`.output/`：**

- 用途：构建输出（ESM、CJS、类型、CSS；Nuxt 模块产物与 fixture 构建产物）。
- 生成方式：是，通过 `pnpm -r build` / `nuxi build`。
- 是否提交：否，被 `.gitignore` 忽略。

**`node_modules/`：**

- 用途：已安装依赖（pnpm workspace 根 + 各包）。
- 生成方式：是。
- 是否提交：否。

_结构分析：2026-07-28（monorepo 改造后重写）_
