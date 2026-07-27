# 代码库结构

**分析日期：** 2026-07-27

## 目录布局

```
[project-root]/
├── .github/            # GitHub workflows and templates
├── .husky/             # Git hooks (husky)
├── .planning/          # Codebase maps and planning documents
│   └── codebase/       # GSD codebase analysis output
├── docs/               # README assets and screenshots
├── play/               # Vite-based dev playground and examples
│   ├── src/            # Example pages and integration demos
│   ├── index.html      # Playground HTML shell
│   ├── main.ts         # Dynamic page router / entry
│   └── vite.config.ts  # Playground Vite config
├── src/                # Library source code
│   ├── headless/       # WIP headless component placeholder
│   └── hooks/          # Composable functions
├── .editorconfig
├── .eslintrc.js
├── .gitignore
├── .npmignore
├── .npmrc
├── .prettierrc
├── commitlint.config.js
├── env.d.ts            # Vite client and Vue global types
├── package.json
├── postcss.config.js
├── README.md
├── tsconfig.json
└── vite.config.ts      # Library build config
```

## 目录用途

**`src/`：**

- 用途：库实现。
- 包含：Vue composition functions、状态工厂、渲染器、工具 helper 与样式。
- 关键文件：`src/hooks/index.ts`、`src/hooks/useScrollbar/index.ts`、`src/hooks/useScrollbar/scrollbars.ts`、`src/hooks/useScrollbar/states.ts`、`src/hooks/useScrollbar/index.less`

**`src/hooks/`：**

- 用途：每个组合式函数一个目录。
- 包含：桶文件风格的 `index.ts` 以及每个 hook 的子目录。
- 关键文件：`src/hooks/index.ts`、`src/hooks/useScrollbar/`、`src/hooks/useScroll/`、`src/hooks/useElementSize/`、`src/hooks/useElementHover/`、`src/hooks/useNativeScrollbar/`

**`src/hooks/useScrollbar/`：**

- 用途：核心滚动条组合式函数及其支持模块。
- 包含：主 hook、状态工厂、命令式渲染器、类型、数学/DOM helper 与样式。
- 关键文件：`src/hooks/useScrollbar/index.ts`、`src/hooks/useScrollbar/scrollbars.ts`、`src/hooks/useScrollbar/states.ts`、`src/hooks/useScrollbar/utils.ts`、`src/hooks/useScrollbar/type.ts`、`src/hooks/useScrollbar/index.less`

**`src/headless/`：**

- 用途：计划用于无头滚动条组件。
- 包含：一个未实现的 Vue SFC 占位文件。
- 关键文件：`src/headless/use-scrollbar.vue`

**`play/`：**

- 用途：开发 playground 与集成示例。
- 包含：Vite 应用入口、示例页面与 helper hooks。
- 关键文件：`play/main.ts`、`play/vite.config.ts`、`play/src/home.vue`、`play/src/compare-styles.vue`、`play/src/vxe-table/index.vue`、`play/src/ant-vue-table/index.vue`、`play/src/gantt-elastic/index.vue`

**`docs/`：**

- 用途：README 引用的静态资源。
- 包含：PNG/SVG 图片与 logo。
- 关键文件：`docs/assets/logo.png`、`docs/assets/compare-1.png`、`docs/assets/compare-3.png`

**`.planning/codebase/`：**

- 用途：GSD 代码库分析文档。
- 包含：`ARCHITECTURE.md`、`STRUCTURE.md`。

## 关键文件位置

**入口点：**

- `src/hooks/index.ts`：库公共 API 与包入口。
- `play/main.ts`：Playground 开发服务器入口。

**配置：**

- `vite.config.ts`：库构建（Vite + `vite-plugin-dts`，输出 ESM + UMD）。
- `play/vite.config.ts`：带 `@/hooks` 别名的 Playground 开发服务器配置。
- `tsconfig.json`：TypeScript 编译器选项，路径别名 `@/*` → `src/*`。
- `package.json`：脚本、依赖、peer dependency `vue@^3`。

**核心逻辑：**

- `src/hooks/useScrollbar/index.ts`：主 `useScrollbar` 组合式函数。
- `src/hooks/useScrollbar/scrollbars.ts`：命令式 Vue 组件渲染器。
- `src/hooks/useScrollbar/states.ts`：响应式状态工厂。
- `src/hooks/useScrollbar/utils.ts`：数学与 DOM 遍历 helper。
- `src/hooks/useScrollbar/type.ts`：`Theme` 类型定义。
- `src/hooks/useScrollbar/index.less`：滚动条主题与布局样式。

**卫星 Hooks：**

- `src/hooks/useElementSize/index.ts`：基于 ResizeObserver 的尺寸测量。
- `src/hooks/useElementHover/index.ts`：悬停状态监听。
- `src/hooks/useScroll/index.ts`：面向性能的滚动追踪。
- `src/hooks/useNativeScrollbar/index.ts`：原生滚动条宽度测量。

**测试：**

- 未检测到。仓库中没有测试文件、测试配置或测试脚本。

## 命名约定

**文件：**

- 组合式函数：目录名使用 camelCase（`useScrollbar/`、`useElementSize/`），内含 `index.ts`。
- 与组合式函数同位置样式：组合式函数目录内的 `index.less`。
- 桶文件：`src/hooks/index.ts` 重新导出每个 hook。

**目录：**

- `src/hooks/<composableName>/`：每个组合式函数一个目录。
- `play/src/<example-name>/`：每个复杂 playground 示例一个目录；`index.vue` 为页面根组件。

**函数：**

- 组合式函数以文件名同名函数默认导出，例如 `useScrollbar`、`useScroll`。
- Helper 工厂前缀为 `get`/`create`，例如 `getOpts`、`createComponent`。

## 新增代码位置

**新组合式函数：**

- 实现：`src/hooks/use<Name>/index.ts`
- 类型：`src/hooks/use<Name>/type.ts`（可选）
- 导出：在 `src/hooks/index.ts` 中添加命名重新导出

**新核心滚动条功能：**

- 状态字段：`src/hooks/useScrollbar/states.ts`
- 逻辑 / 派生：`src/hooks/useScrollbar/index.ts`
- 渲染器变更：`src/hooks/useScrollbar/scrollbars.ts`
- 样式变更：`src/hooks/useScrollbar/index.less`

**新主题：**

- 在 `src/hooks/useScrollbar/type.ts` 的 `Theme` 中添加主题字面量。
- 在 `src/hooks/useScrollbar/index.less` 的 `&.is-<theme>` 下添加对应 CSS 规则。

**新 Playground 示例：**

- 页面组件：`play/src/<example-name>.vue` 或 `play/src/<example-name>/index.vue`
- 将自动被 `play/main.ts:12` 的 glob 匹配。

**工具函数：**

- 共享 helper：滚动条专用 helper 放在 `src/hooks/useScrollbar/utils.ts`；目前未使用新的 `src/utils/` 目录。

## 特殊目录

**`src/headless/`：**

- 用途：预留用于无头滚动条 Vue 组件。
- 生成方式：否。
- 是否提交：是，但只包含一个 `WIP` 占位文件。

**`dist/`：**

- 用途：构建输出（ESM、UMD、类型、CSS）。
- 生成方式：是，通过 `pnpm build`。
- 是否提交：否，被 `.gitignore` 忽略。

**`node_modules/`：**

- 用途：已安装依赖。
- 生成方式：是。
- 是否提交：否。

---

_结构分析：2026-07-27_
