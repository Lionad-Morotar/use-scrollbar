<p align="center">
  <a href="todo">
    <img width="216" src="todo">
  </a>
</p>

<p align="center">
  <!-- npm version -->
  <a href="https://github.com/Lionad-Morotar/use-scrollbar"><img src="https://img.shields.io/npm/v/use-scrollbar.svg" alt="npm package"></a>
  <!-- ci status -->
  <a href="https://github.com/Lionad-Morotar/use-scrollbar/actions/workflows/node-ci.yml"><img src="https://github.com/Lionad-Morotar/use-scrollbar/actions/workflows/ci.yml/badge.svg?branch=master" alt="build status"></a>
  <!-- license -->
  <a href="https://github.com/Lionad-Morotar/use-scrollbar/blob/master/LICENSE"><img src="https://img.shields.io/github/license/Lionad-Morotar/use-scrollbar" alt="LICENSE"></a>
</p>

<div align="center">

# use-scrollbar

`use-scrollbar` enable an native-scrollbar-based component to replace its native-scrollbar with virtual scrollbar.

</div>

## 🎇 Brief

As if theres a 400px height div#simple, you can easily wrap it with [ElementPlus Scrollbar](https://element-plus.gitee.io/zh-CN/component/scrollbar.html), so that you get a 400px height div#simple with beautiful scrollbars. But its hard to enable a complex component with virtual scrollbar, that is to say, wrap complex component with [ElementPlus Scrollbar](https://element-plus.gitee.io/zh-CN/component/scrollbar.html) is useless, you need `use-scrollbar`.

## 🤹‍♀️ Usage

Easy API with type supported.

```typescript
import { onMounted, ref } from 'vue'
import { useSrollbar } from 'use-scrollbar'

const elementRef = ref(null);

onMounted(() => {
  const barStates = useScrollbars();
  const $parent = elementRef.value.$el.parentElement;

  barStates.visibleOnHover($parent);
  barStates.init({
    // where to append the scrollbars
    mount: $parent,
    // an element contains large mount of items,
    // usually an elem with `overflow:scroll`
    wrapper: $parent.querySelector('.items-list'),
  });
})
```

## 📦 Install

```bash
pnpm install use-scrollbar
```

## 🗂️ Full Document

TODO

## 🗃️ TODO

- [ ] test utils
- [ ] full api doc

## 📄 License

MIT License
