<p align="center">
  <a href="todo">
    <img width="216" src="todo">
  </a>
</p>

<p align="center">
  <a href="https://github.com/Lionad-Morotar/use-scrollbar"><img src="https://img.shields.io/npm/v/use-scrollbar.svg" alt="npm package"></a>
  <a href="https://github.com/Lionad-Morotar/use-scrollbar/actions/workflows/node-ci.yml"><img src="https://github.com/Lionad-Morotar/use-scrollbar/actions/workflows/ci.yml/badge.svg?branch=master" alt="build status"></a>
  <a href="https://github.com/Lionad-Morotar/use-scrollbar/blob/master/LICENSE"><img src="https://img.shields.io/github/license/Lionad-Morotar/use-scrollbar" alt="LICENSE"></a>
</p>

<div align="center">

# use-scrollbar

use-scrollbar replace the native scrollbar with virtual scrollbar on an Element，useful in extend an existing native-scrollbar-based library，**NOT virtual scroll**

</div>

## 📦 Install

```bash
pnpm install use-scrollbar
```

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
    // an instead of directives
    mount: $parent,
    // use-scrollbar
    content: $parent.querySelector('.items-list'),
  });
})
```

## Full Document

TODO

## TODO

- [ ] test utils
- [ ] full api doc

## 📄 License

MIT License
