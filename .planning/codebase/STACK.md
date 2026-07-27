# 技术栈（Technology Stack）

**分析日期：** 2026-07-27

## 语言

**主要：**

- TypeScript 4.9.5 - `src/hooks/` 中所有可组合函数（composables）的源码与构建配置
- Vue 单文件组件（SFC） - `play/src/` 中的 Playground 示例

**次要：**

- JavaScript - 遗留 mixin `play/src/gantt-elastic/components/chart/row/task.mixin.js`、样式文件
- HTML - `play/index.html`
- Less - `src/hooks/useScrollbar/index.less` 中的滚动条样式与 Playground 样式

## 运行时

**环境：**

- 浏览器（仅客户端）
- Node.js >=16 用于构建与 CI

**包管理器：**

- pnpm >=7
- 锁文件：`pnpm-lock.yaml` 已存在

## 框架

**核心：**

- Vue 3.3.8（peer dependency `^3`） - 目标框架
- vue-demi 0.14.6 - 跨版本 Vue 兼容层
- @vueuse/core 10.7.0 - 基础工具（`useEventListener`、`useResizeObserver`、`unrefElement`）
- @vueuse/shared 10.7.0 - 共享辅助函数（`tryOnScopeDispose`、`tryOnMounted`、`useDebounceFn` 等）

**构建/开发：**

- Vite 4.5.0 - 构建工具与开发服务器
- @vitejs/plugin-vue 2.3.4 - Playground 的 Vue SFC 支持
- vite-plugin-dts 1.7.3 - TypeScript 声明文件生成
- vue-tsc 1.0.9 - 类型检查

**测试：**

- 未检测到 - 未配置测试框架

## 关键依赖

**关键（运行时）：**

- `vue-demi` ^0.14.6 - 支持在 Vue 2/3 中使用 Composition API
- `@vueuse/core` ^10.7.0 - 提供响应式元素/尺寸/滚动原语
- `@vueuse/shared` ^10.7.0 - 共享 Vue 工具函数

**基础设施（构建）：**

- `vite` ^4.5.0 - 以 `es` 和 `umd` 格式打包库
- `typescript` ^4.9.5 - 类型系统

**Playground 依赖：**

- `element-plus` ^2.4.2 - UI 示例
- `ant-design-vue` ^4.0.7 - 表格示例
- `vxe-table` ^4.5.13 - 表格示例
- `overlayscrollbars` ^2.4.4 / `overlayscrollbars-vue` ^0.5.6 - 对比示例
- `xe-utils` ^3.5.14 - VXE-Table 工具依赖

## 配置

**环境：**

- 无需运行时环境变量
- Playground 开发服务器可通过 `HTTPS` 环境变量启用可选 HTTPS（`play/vite.config.ts`）

**构建：**

- `vite.config.ts` - 库构建配置
- `tsconfig.json` - TypeScript 配置
- `play/vite.config.ts` - Playground 开发配置

**代码检查/格式化：**

- `.eslintrc.js` - ESLint，含 Vue 3 与 TypeScript 规则
- `.prettierrc` - Prettier 格式化规则
- `commitlint.config.js` - 约定式提交（Conventional Commits）约束
- `.husky/` - Git 钩子（commit-msg、pre-commit）
- `package.json` 中的 `lint-staged` - 自动修复已暂存文件

**CSS 处理：**

- `postcss.config.js` - PostCSS，使用 `postcss-preset-env`
- `less` ^4.2.0 - 预处理器

## 平台要求

**开发：**

- Node.js >=16
- pnpm >=7

**生产：**

- 浏览器环境，使用 Vue 3
- 通过 npm 以 ES module 与 UMD bundle 形式分发

---

_栈分析：2026-07-27_
