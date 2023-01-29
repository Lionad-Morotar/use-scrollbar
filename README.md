<p align="center">
  <img width="555" alt="use-scrollbar" src="./docs/assets/logo.png">
</p>

<p align="center">
  <!-- npm version -->
  <a href="https://github.com/Lionad-Morotar/use-scrollbar"><img src="https://img.shields.io/npm/v/use-scrollbars.svg" alt="npm package"></a>
  <!-- ci status -->
  <a href="https://github.com/Lionad-Morotar/use-scrollbar/actions/workflows/check-build-module.yml"><img src="https://github.com/Lionad-Morotar/use-scrollbar/actions/workflows/ci.yml/badge.svg?branch=main" alt="build status"></a>
  <!-- license -->
  <a href="https://github.com/Lionad-Morotar/use-scrollbar/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Lionad-Morotar/use-scrollbar" alt="LICENSE"></a>
</p>

<div align="center">

# use-scrollbar

`use-scrollbar` enables a component based on a native scrollbar to replace its native scrollbar with a virtual scrollbar, NOT virtual scroll.

</div>

## 🎇 Brief

Assuming a 400px height div, you can easily get a div with beautiful virtual scrollbars by simply wrap the div with [ElementPlus Scrollbar](https://element-plus.gitee.io/zh-CN/component/scrollbar.html) scrollbars. But  none of the popular scrollbar components provide an interface for handling complex elements, that is to say, you cant wrap an complex component with [ElementPlus Scrollbar](https://element-plus.gitee.io/zh-CN/component/scrollbar.html) to have its internal native scrollbar replaced with beautiful virtual scrollbars. So you need `use-scrollbar`.

## ⚒️ Feature

* [x] Customisable virtual scrollbars, so that you can create your own scrollbar styles, animations or user interactions
* [x] Integrated with these style configurations: ElementPlus, Steam, CSS-Tricks ...
* [x] Full Typed
* [ ] WIP <del>Support Vue2 & Vue3</del>
* [ ] WIP <del>Vue Directives</del>
* [ ] WIP <del>Headless Component</del>
* [ ] WIP <del>Github pages for document and preview</del>

and PRs are welcom

## 📸 Preview

<p align="center">
  <center>
    <h4>1. Native Scrollbar <strong>VS</strong> Custom Scrollbar (theme: default)</h4>
    <img width="555" alt="compare" src="./docs/assets/compare-1.png">
    <br />
    <h4>2. Native Scrollbar <strong>VS</strong> Custom Scrollbar (theme: css-tricks)</h4>
    <img width="555" alt="compare" src="./docs/assets/compare-3.png">
  </center>
</p>

## 🤹‍♀️ Usage

Simple Usage

```typescript
import { onMounted, ref } from 'vue'
import { useSrollbar } from 'use-scrollbar'

const componentOrElementRef = ref(null);
const barStates = useScrollbar(componentOrElementRef, {
  // override default options
});
```

Another

```typescript
import { watchEffect, onMounted, ref } from 'vue'
import { useSrollbar } from 'use-scrollbar'

const componentOrElementRef = ref(null);
const barStates = useScrollbar(componentOrElementRef, {
  // override default options
});

const componentStates = ref('your-states');
watchEffect(() => {
  if (componentStates.valu3 === 'your-states') {
    barStates.theme = 'steam'
  } else {
    barStates.destroy()
  }
})
```

## 📦 Install

```bash
pnpm install use-scrollbar
```

## 🗂️ Simple Document

### States

##### barStates.theme

改变滚动条样式。

```typescript
const theme = 'normal' // 'normal' | 'steam' | 'css-tricks'
barStates.theme = theme
```

##### barStates.offset

改变滚动条相对挂载元素的偏移量。

```typescript
barStates.offset.y.top = 10 // px
barStates.offset.y.right = 10 // px
barStates.offset.x.left = 5 // px
barStates.offset.x.bottom = 5 // px
```

##### barStates.scrollTop

如果传入多个 wrapper，那么 scrollTop 属性等同于这几个 wrapper 对应 DOM 元素的最大的哪个 scrollTop 属性。如果需要滚动 wrapper 中的内容，可以给 scrollTop 设置值，也可以使用 [barStates.scrollTo](#barStates-scrollTo) 方法。

##### barStates.scrollLeft

类似 [barStates.scrollTop](#barStates-scrollTop)。

##### barStates.isDragging

判断当前滚动条是否出于拖动状态。

```typescript
console.log(barStates.isDragging.y)
```

### Actions

##### barStates.init

如果不是通过显式初始化（即 `useScrollbar(elem)`）的方式自动初始化滚动条，那么需要使用 init 方法手动初始化。init 方法提供了对控制滚动区（甚至多个滚动区）所需要的更细致的参数。

```typescript
const $parent = cmptRef.value.$el.parentElement;
const $wrapper = $parent.querySelector(".content-wrapper");
const $content = $parent.querySelector(".content");

// 详细 API 见类型文档
barStates.init({
  mount: cmptRef.value,
  content: [$content],
  // 可以不传，默认为 content 的 上一级父元素
  wrapper: [$wrapper],
  // 可以不传，默认为 wrapper 或 wrapper 的第一个元素
  viewport: $wrapper,
})
```

##### barStates.visibleOnHover

监听传入元素的鼠标事件，mouseenter 时显示滚动条，mouseleave 时隐藏滚动条。

##### barStates.setOffset

根据传入元素的尺寸自动设置滚动条的偏移量。在某些场景非常有用，比如你想改变一个弹窗，其滚动区域为整个弹窗内容区域，但是内容区填充了一个 `position:sticky` 头部，此时，如果将滚动条直接挂载到弹窗的内容区域，那么 y 轴滚动条的上方偏移量应为头部的高度。你可以在 barStates.setOffset 中传入此头部元素或组件，动态跟踪其高度并自动设置偏移量。

<p align="center">
  <img width="555" alt="use-scrollbar" src="./docs/assets/setOffset-dialog-example.svg">
</p>

```typescript
const cmptOrElemRef = ref(null);

barStates.setOffset({
  y: {
    top: cmptOrElemRef,
  }
})
```

## 📄 License

MIT License
