# 技术栈（Technology Stack）

**分析日期：** 2026-07-28（monorepo 改造后刷新）

仓库为 pnpm workspace monorepo：`packages/vue`（核心包 `@lionad/use-scrollbar`）、`packages/nuxt`（Nuxt 模块 `@lionad/nuxt-use-scrollbar`）、`playground`（演示场）。根包私有化，仅承载编排脚本与共享质量工具链（`pnpm -r --if-present` 调度各包 build / test / check:types）。

## 语言

**主要：**

- TypeScript ~5.9.3 - `packages/vue/src/hooks/` 中所有可组合函数（composables）的源码与构建配置
- Vue 单文件组件（SFC） - `playground/src/` 中的 Playground 示例

**次要：**

- JavaScript - 遗留 mixin `playground/src/gantt-elastic/components/chart/row/task.mixin.js`、样式文件（gantt-elastic 整目录已 eslint ignore）
- HTML - `playground/index.html`
- Less - `packages/vue/src/hooks/useScrollbar/index.less` 中的滚动条样式与 Playground 样式

## 运行时

**环境：**

- 浏览器（仅客户端运行时生效；hook 入口已带 `typeof document/window` 守卫，SSR 下静默跳过，可安全用于 Nuxt 同构代码）
- Node.js `^20.19.0 || >=22.12.0` 用于构建与 CI（与 Vite 8 的 engines 对齐；CI 实际用 24）

**包管理器：**

- pnpm >=10（`packageManager` 字段钉 `pnpm@10.15.0`；CI 经 `pnpm/action-setup@v4` 读该字段，单源避免双源漂移）
- workspace：`pnpm-workspace.yaml`（`shellEmulator: true`、`trustPolicy: no-downgrade`）
- 锁文件：`pnpm-lock.yaml`（lockfileVersion 9）

## 框架

**核心：**

- Vue `^3.5.0`（peer dependency，运行时实测 3.5.40） - 目标框架
- @vueuse/core 14.3.0 - 基础工具（`useEventListener`、`useResizeObserver`、`unrefElement` 等）
- @vueuse/shared 14.3.0 - 共享辅助函数（`tryOnScopeDispose`、`tryOnMounted`、`useDebounceFn` 等）

vue-demi 已于本次现代化中移除：Vue2 支持早已脑死亡（peer 仅 `vue^3`、`useNativeScrollbar` 直接 import `vue`、README 的 Vue2 WIP 已划删除线），保留中间层只会制造"声明不真实"的歧义。`MaybeRef` / `MaybeRefOrGetter` / `toValue` 自 Vue 3.3 起由核心导出，vueuse 13+ 移除了重复导出，对应 import 已迁回 `vue`。

**构建/开发（packages/vue）：**

- Vite 8.1.5 - 构建工具（Rolldown 打包器，旧 `build.rollupOptions` 已更名为 `build.rolldownOptions`）
- unplugin-dts 1.0.3 - TypeScript 声明文件生成（vite-plugin-dts 已退役，作者推荐直接用 unplugin-dts）
- vue-tsc 3.3.8 - 类型检查（`pnpm check:types`）

**构建/开发（packages/nuxt）：**

- @nuxt/module-builder 1.0.3 - Nuxt 模块标准构建（unbuild 基底，产出 dist/module.mjs + types）
- @nuxt/kit ^4.5.1 - 模块定义与 auto-imports API（运行时依赖）
- nuxt ^4.5.1 + vue-tsc - fixture 验证（`check:fixture` 走 `nuxi build` + nitro prerender）

**构建/开发（playground）：**

- Vite 8.1.5 + @vitejs/plugin-vue 6.0.8 - 开发服务器（端口 7232 + host:true，文件式路由 `import.meta.glob`）
- @vitejs/plugin-basic-ssl 2.3.0 - 可选本地 HTTPS 自签证书（Vite 8 移除了 `server.https: boolean`）

**测试：**

- vitest 4.1.10 + happy-dom + @vue/test-utils 2.4.11 - 特征锁定测试基线（utils / states / 5 个 hooks + SSR 契约，40 specs）
- 配置见 `packages/vue/vitest.config.ts`：`test.server.deps.inline` 将 `@vueuse/*` 并入 vite 管线、共享同一 vue 实例，预防双实例导致的动态依赖收集静默失效

## 关键依赖

**关键（运行时）：**

- `@vueuse/core` ^14.3.0 - 响应式元素/尺寸/滚动原语
- `@vueuse/shared` ^14.3.0 - 共享 Vue 工具函数

**基础设施（构建/质量）：**

- `vite` ^8.1.5 - 以 `es` 与 `cjs` 格式打包库（UMD 已弃，无 CDN 全局名场景）
- `typescript` ~5.9.3 - 类型系统（受 typescript-eslint 8.65 的 peer `typescript <6.1.0` 约束，7.x 暂不可用）
- `eslint` ^10.8.0 + `@antfu/eslint-config` ^9.2.0 - flat config 统一 lint 与格式化（Prettier 与 eslintrc 已退役，@stylistic 接管格式化）
- `husky` ^9.1.7 + `lint-staged` ^17.2.0 + `@commitlint/cli` ^21 - Git 钩子与约定式提交

**Playground 依赖：**

- `element-plus` ^2.14.3 - UI 与 el-table 示例
- `ant-design-vue` ^4.2.6 - 表格示例
- `vxe-table` 4.5.13 / `xe-utils` ^3.5.14 - 表格示例（精确钉版，4.20 集成缺陷见 CONCERNS 退役条目）
- `ag-grid-vue3` ^36.0.2 / `ag-grid-community` ^36.0.2 - AG Grid 示例（v33+ 模块注册体系）
- `tabulator-tables` ^6.5.2 + `@types/tabulator-tables` ^6.3.6 - Tabulator 示例（无捆绑类型）
- `codemirror` ^6.0.2 - CodeMirror 6 示例
- `overlayscrollbars` ^2.16.0 / `overlayscrollbars-vue` ^0.5.10 - 对比示例

## 配置

**环境：**

- 无需运行时环境变量
- Playground 开发服务器可通过 `HTTPS` 环境变量启用可选 HTTPS（经 basic-ssl 插件）

**构建：**

- `packages/vue/vite.config.ts` - 库构建配置（Rolldown lib，`fileName` 显式 `.mjs`/`.cjs`，`cssFileName` 钉 `style.css`）
- 各包独立 `tsconfig.json`（根已无源码、根 tsconfig 已删除；`moduleResolution: Bundler`）
- `packages/nuxt/fixture/tsconfig.json` - extends `nuxi prepare` 生成的 `./.nuxt/tsconfig.json`
- `playground/vite.config.ts` - Playground 开发配置（`@/hooks` alias 直引 `packages/vue/src/hooks` 源码）
- `packages/vue/vitest.config.ts` - 测试配置

**代码检查/格式化：**

- `eslint.config.ts` - ESLint 10 flat config（@antfu/eslint-config，根级统一管所有包）
- `commitlint.config.cjs` - 约定式提交约束（CJS，因 `type: module` 用 `.cjs` 扩展名）
- `.husky/` - Git 钩子（v9 纯 shell 格式，不再 source `_/husky.sh`）
- 根 `package.json` 中的 `lint-staged` - 自动修复已暂存文件

**CSS 处理：**

- `postcss.config.mjs` - PostCSS，使用 `postcss-preset-env`（ESM，因 `type: module`，根级共享）
- `less` ^4.8.0 - 预处理器

## 平台要求

**开发：**

- Node.js `^20.19.0 || >=22.12.0`
- pnpm >=10

**生产：**

- 浏览器环境，使用 Vue 3.5+（SSR 场景经守卫静默降级，水合后生效）
- 通过 npm 以 ES module（`dist/index.mjs`）、CommonJS（`dist/index.cjs`）与类型声明（`dist/types/`）形式分发，样式独立为 `dist/style.css`；Nuxt 场景可改用 `@lionad/nuxt-use-scrollbar` 模块（auto-imports + 样式注入）

_栈分析：2026-07-28（monorepo 改造后刷新）_
