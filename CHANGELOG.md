# Changelog

本仓库所有显著变更记录于此文件。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

monorepo 内各包独立版本，版本段以包名标注。

## [Unreleased]

## [@lionad/use-scrollbar 0.5.0-alpha.3] - 2026-09-04

### Changed

- 滑块最小长度钳制 `config.size.min` 由 75 提升至 160：内容远超一屏时滑块按比例缩短，75 的下限会让滑块缩成一个点，拖拽命中区与视觉可辨识度都不够；x/y 共用同一钳制下限，容器小于 160 时仍由 `max` 侧钳制兜住不溢出轨道，JS 未就绪闪烁窗口的 CSS 兜底（30px）保持原值

## [@lionad/use-scrollbar 0.5.0-alpha.2] - 2026-08-09

### Fixed

- 修复宿主无组件实例场景（如自定义指令 `mounted` 钩子内调用 `useScrollbar`）产生 `onUnmounted is called when there is no active component instance` Vue 警告的问题：拖拽清理注册收敛为 `tryOnUnmounted`，无实例时静默跳过——该场景本就由宿主卸载路径的 `destroy`（内含 `clean`）兜底

## [@lionad/use-scrollbar 0.5.0-alpha.1] - 2026-08-08

### Fixed

- 修复 mount 自身即滚动容器（如 `v-vscroll` 指令形态）时轨道/thumb 随滚动量飞出可视区、滚到底滚动条整体消失的问题：轨道坐标系现随 mount 自身滚动量原位反向平移；mount 为不滚动的外层壳形态时补偿恒为 0，既有接入行为不变

## [@lionad/use-scrollbar-nuxt 0.2.0-alpha.1] - 2026-08-08

### Fixed

- 自动导入收敛为库独有 API（`useScrollbar` / `useScrollbars` / `useNativeScrollbar`）：不再注册与 `@vueuse/core` 同名的 `useScroll` / `useElementSize` / `useElementHover`，避免静默替换消费方的 vueuse 自动导入为库内部残缺实现（`useScroll` 无 `arrivedState`/`onScroll`，`useElementHover` 无 `delay` 选项）

## [@lionad/use-scrollbar 0.5.0-alpha.0] - 2026-08-08

npm 首发（前身为未 scoped 的旧包 `use-scrollbars`，0.4.x 及更早历史对 npm 用户不可见，故收敛为本首发段）。

### Added

- `useScrollbar` composable：用完全可定制的虚拟滚动条覆盖替换组件原生滚动条（纯滚动条 overlay，非虚拟滚动），专为 vxe-table、antd-vue-table 等复杂第三方组件的滚动条样式定制而生
- 内置主题 normal、steam、css-tricks，支持运行时 `barStates.theme` 切换
- 滚动条状态与行为 API：`init`（多滚动区手动初始化）、`scrollTo` / `scrollTop` / `scrollLeft`、`offset` 与 `setOffset`（按元素尺寸自动跟踪滚动条偏移）、`visibleOnHover`（悬停显隐）、`isDragging` / `isScrolling`（拖拽与滚动状态）、`destroy`
- `useNativeScrollbar` composable：获取原生滚动条信息（如宽度）
- 全量 TypeScript 类型声明
- SSR 安全：DOM 访问已守卫，服务端渲染时静默跳过，水合后 init/mount 才触碰真实 DOM
- 性能设计：拖拽位移按帧合并、滚动条样式按写入频率分层、滚动状态经 debounced 检测，滚动期不重建样式对象

## [@lionad/use-scrollbar-nuxt 0.2.0-alpha.0] - 2026-08-08

npm 首发。

### Added

- Nuxt 模块：注册即用，自动注入 `@lionad/use-scrollbar` 虚拟滚动条样式；`useScrollbar: { injectStyles: false }` 可关闭注入以完全自管样式
- composables 自动导入：`useScrollbar` / `useScrollbars`、`useScroll`、`useElementSize`、`useElementHover`、`useNativeScrollbar`
- SSR 安全：核心包 DOM 访问已守卫，无需 client-only 插件隔离
