# @lionad/use-scrollbar-nuxt

[`@lionad/use-scrollbar`](https://www.npmjs.com/package/@lionad/use-scrollbar) 的 Nuxt 模块：自动完成 composables 的 auto-import 与虚拟滚动条样式注入，SSR 安全，无需额外配置。

## Install

```bash
pnpm add @lionad/use-scrollbar @lionad/use-scrollbar-nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@lionad/use-scrollbar-nuxt'],
})
```

## Module Options

通过 `nuxt.config.ts` 中的 `useScrollbar` 键配置：

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `injectStyles` | `boolean` | `true` | 注入核心包的虚拟滚动条样式（`@lionad/use-scrollbar/dist/style.css`）。需要完全自管样式时置 `false` |

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@lionad/use-scrollbar-nuxt'],
  useScrollbar: { injectStyles: false },
})
```

## Auto-imports

以下 composables 自动可用，无需手动 import：

- `useScrollbar`（等同于 `useScrollbars`）— 将已有滚动系统的原生滚动条替换为虚拟滚动条
- `useScroll`
- `useElementSize`
- `useElementHover`
- `useNativeScrollbar` — 获取原生滚动条信息（如宽度）

```vue
<script setup lang="ts">
const componentOrElementRef = ref(null)
const barStates = useScrollbar(componentOrElementRef, {
  // override default options
})
</script>
```

SSR 下 composable 的 DOM 访问已守卫、静默跳过，水合后 init/mount 才触碰真实 DOM，无需 client-only 包裹。

完整 API 文档见核心包 [`@lionad/use-scrollbar`](https://www.npmjs.com/package/@lionad/use-scrollbar)。

## License

MIT License
