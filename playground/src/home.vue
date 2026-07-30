<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
/**
 * playground 首页 / 库 showcase index。
 * 自包含整页：app shell（main.ts）把每个 .vue 直挂到 100vh 的 #play，无 router，
 * 故本页根容器自管纵向滚动；页内锚点用 scrollIntoView 而非 href 锚。
 * hero 的活预览直接 dogfood 本库（useScrollbar），切换三主题即实时演示 API。
 */
import { useScrollbar } from '@/hooks'

import logoUrl from '../../docs/assets/logo.png'

type ThemeKey = 'normal' | 'steam' | 'css-tricks'

// hero 活预览当前主题，驱动 useScrollbar 的 theme 响应式；
// 默认 steam：其 thumb 为 opacity:1 实色，配深底镜像首屏即肉眼可见，
// 比 normal 的半透灰条更能直接证明「滚动条确实被本库渲染」
const liveTheme = ref<ThemeKey>('steam')
const liveRef = ref<HTMLElement>()
const bar = useScrollbar(liveRef)
watchEffect(() => {
  bar.theme = liveTheme.value
})

// 主题模式：auto 跟随系统，不写 data-theme；dark/light 显式覆盖
type Mode = 'auto' | 'dark' | 'light'
const mode = ref<Mode>('auto')
const modeAttr = ref<string | undefined>(undefined)
function cycleMode() {
  mode.value = mode.value === 'auto' ? 'dark' : mode.value === 'dark' ? 'light' : 'auto'
  modeAttr.value = mode.value === 'auto' ? undefined : mode.value
}
const modeLabel = () => (mode.value === 'auto' ? 'Auto' : mode.value === 'dark' ? 'Dark' : 'Light')

// examples 索引：顺序经过编排，使两张宽卡（span 2）在 3 列网格下恰好填满、无空 cell
const examples = [
  { name: 'compare-styles', href: './compare-styles?type=normal', wide: true, tag: 'principle', desc: '并排对比本库、原生条、OverlayScrollbars 三套渲染结果。' },
  { name: 'ant-design-vue', href: './ant-vue-table', wide: false, tag: 'table', desc: 'ant-design-vue 表格接管滚动条。' },
  { name: 'vxe-table', href: './vxe-table', wide: false, tag: 'table', desc: 'vxe-table 横纵滚动条整体替换。' },
  { name: 'ag-grid', href: './ag-grid', wide: false, tag: 'grid', desc: 'AG Grid v36 视口滚动条覆盖。' },
  { name: 'tabulator', href: './tabulator', wide: false, tag: 'table', desc: 'Tabulator 表格滚动条定制。' },
  { name: 'vxe-table · multi', href: './vxe-table-multy', wide: true, tag: 'multi', desc: '同一页面多张 vxe-table 实例并存，各自独立接管。' },
  { name: 'codemirror', href: './codemirror', wide: false, tag: 'editor', desc: 'CodeMirror 6 编辑器双向滚动。' },
  { name: 'el-table', href: './el-table', wide: false, tag: 'table', desc: 'Element Plus 表格滚动条替换。' },
  { name: 'gantt-elastic', href: './gantt', wide: false, tag: 'chart', desc: 'GanttElastic 甘特图滚动接管。' },
  { name: 'overlay-scrollbars', href: './overlay-scrollbars', wide: false, tag: 'compare', desc: '与 OverlayScrollbars 同页对照。' },
]

// 三主题预览卡，视觉各取该主题真实配色，非等宽 feature card
const themes: { key: ThemeKey, label: string, href: string, swatch: string }[] = [
  { key: 'normal', label: 'Normal', href: './compare-styles?type=normal', swatch: 'linear-gradient(180deg,#d7d7db,#a9a9b0)' },
  { key: 'steam', label: 'Steam', href: './compare-styles?type=steam', swatch: 'linear-gradient(180deg,#5a6478,#2c313c)' },
  { key: 'css-tricks', label: 'CSS Tricks', href: './compare-styles?type=css-tricks', swatch: 'linear-gradient(180deg,#8a8a8a,#3a3a3a)' },
]

// 进场 reveal：内部滚动容器填满视口，IO root=null 即可观察交叉
let io: IntersectionObserver | null = null
onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce)
    return
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in')
        io?.unobserve(e.target)
      }
    }
  }, { threshold: 0.15 })
  document.querySelectorAll('.reveal').forEach(el => io!.observe(el))
})
onBeforeUnmount(() => io?.disconnect())

// 页内锚点：滚动发生在 .home 容器，scrollIntoView 会滚最近滚动祖先
function goExamples() {
  document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <!-- 首页根：自管滚动 + 承载设计令牌与 ambient 背景 -->
  <div class="home" :data-theme="modeAttr">
    <!-- 环境层：粉色辉光 + 极淡点阵，fixed 不随滚动重绘 -->
    <div class="ambient" aria-hidden="true">
      <span class="glow glow-a" />
      <span class="glow glow-b" />
    </div>

    <!-- 顶栏：单行，sticky 在内部滚动容器顶部 -->
    <header class="nav">
      <a class="brand" href="./home" aria-label="use-scrollbar home">
        <img :src="logoUrl" alt="use-scrollbar" class="brand-logo">
      </a>
      <nav class="nav-right">
        <button class="mode-pill" type="button" :aria-label="`color mode ${modeLabel()}`" @click="cycleMode">
          <span class="mode-glyph" aria-hidden="true">{{ mode === 'dark' ? '☾' : mode === 'light' ? '☀' : '◐' }}</span>
          {{ modeLabel() }}
        </button>
        <a class="nav-link" href="https://github.com/Lionad-Morotar/use-scrollbar" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </header>

    <main class="wrap">
      <!-- hero：非对称分割，左文案右活预览 -->
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow load" style="--i: 0">
            VUE 3 COMPOSABLE
          </p>
          <h1 class="hero-title load" style="--i: 1">
            给复杂表格组件，<span class="accent">一套自己的</span>滚动条
          </h1>
          <p class="hero-sub load" style="--i: 2">
            不替换滚动，只替换那条难看的滚动条。纯 overlay，零虚拟滚动。
          </p>
          <div class="hero-cta load" style="--i: 3">
            <button class="btn btn-primary" type="button" @click="goExamples">
              浏览示例
            </button>
            <a class="btn btn-ghost" href="https://github.com/Lionad-Morotar/use-scrollbar" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>

        <!-- 活预览：本库真实渲染的虚拟滚动条，切换主题即时演示 -->
        <div class="live-card load" style="--i: 2" data-testid="live-preview">
          <div class="live-head">
            <span class="live-tag">LIVE</span>
            <div class="live-switch" role="tablist" aria-label="scrollbar theme">
              <button
                v-for="t in themes" :key="t.key" type="button" role="tab"
                class="sw-pill" :class="[{ on: liveTheme === t.key }]"
                :aria-selected="liveTheme === t.key" @click="liveTheme = t.key"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
          <!-- 隐藏原生条，由 useScrollbar 覆盖渲染；
               自动探测（findScrollElement）只在子元素中找滚动容器，故 ref 挂外层包装而非滚动元素自身 -->
          <div ref="liveRef" class="live-viewport">
            <div class="live-scroll" :class="`lv-${liveTheme}`">
              <pre class="live-code">// use-scrollbar
function paint(container) {
  const bar = useScrollbar(container)
  bar.theme = 'normal'   // or 'steam' | 'css-tricks'
  // 原生滚动逻辑不变，只换那条滚动条
  return bar
}

// 横纵双向、hover 显隐、偏移微调都内置
function tune(bar) {
  bar.offset = {
    x: { left: 8, bottom: 8 },
    y: { top: 8, right: 8 },
  }
}

// 与 vxe-table / antd / ag-grid / tabulator /
// codemirror / el-table 同页共存，互不干扰
function mount(grid) {
  const bar = useScrollbar(grid.viewport)
  bar.visibleOnHover = true
  return bar
}

// 滚动事件、坐标、惯性全部交给浏览器原生，
// 我们只负责把滚动条画成你想要的样子。
function done() {
  console.log('scrollbar replaced, scroll untouched')
}
</pre>
            </div>
          </div>
        </div>
      </section>

      <!-- examples：核心导航网格，宽窄交错，无空 cell -->
      <section id="examples" class="section">
        <div class="section-head reveal">
          <h2 class="section-title">
            Examples
          </h2>
          <p class="section-lead">
            十个真实接入场景，点进去就是可运行的 playground 页。
          </p>
        </div>
        <div class="ex-grid">
          <a
            v-for="(ex, i) in examples" :key="ex.name"
            class="ex-card reveal" :class="[{ wide: ex.wide }]"
            :style="{ '--i': String(i % 3) }"
            :href="ex.href"
          >
            <span class="ex-tag">{{ ex.tag }}</span>
            <span class="ex-name">{{ ex.name }}</span>
            <span class="ex-desc">{{ ex.desc }}</span>
            <span class="ex-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <!-- themes：三主题色样，各取真实配色 -->
      <section class="section">
        <div class="section-head reveal">
          <h2 class="section-title">
            Themes
          </h2>
          <p class="section-lead">
            内置三套滚动条皮肤，也可照着自己的设计系统重写。
          </p>
        </div>
        <div class="theme-grid">
          <a
            v-for="(t, i) in themes" :key="t.key"
            class="theme-card reveal" :style="{ '--i': String(i) }" :href="t.href"
          >
            <span class="theme-track"><span class="theme-thumb" :style="{ background: t.swatch }" /></span>
            <span class="theme-name">{{ t.label }}</span>
            <span class="theme-key">{{ t.key }}</span>
          </a>
        </div>
      </section>

      <!-- clarify：核心定位澄清，避免「虚拟滚动」误读 -->
      <section class="clarify reveal">
        <span class="clarify-tag">CLARIFICATION</span>
        <h3 class="clarify-title">
          替换滚动条，不替换滚动
        </h3>
        <p class="clarify-body">
          这是一个滚动条 overlay 库，不是虚拟滚动。原生的滚动事件、坐标、惯性与可访问性全部保留，
          我们只把那条系统滚动条盖成可完全定制的虚拟条。
        </p>
      </section>
    </main>

    <footer class="foot">
      <span>© use-scrollbar</span>
      <span class="foot-sep">/</span>
      <span>MIT</span>
      <span class="foot-sep">/</span>
      <a href="https://github.com/Lionad-Morotar/use-scrollbar" target="_blank" rel="noreferrer">github</a>
    </footer>
  </div>
</template>

<style scoped>
  /* 字体仅 dev playground 使用，localhost 不苛求 self-host；display 用有性格的 grotesque 呼应 logo 斜体，body 走系统 sans，标签走 mono */
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:ital,opsz,wght@0,12..96,600;0,12..96,800;1,12..96,700&family=JetBrains+Mono:wght@400;500;700&display=swap');

  /* shape lock：cards 14px，interactive 全 pill，badge pill */
  .home {
    --r-card: 14px;
    --r-pill: 999px;

    --font-display: 'Bricolage Grotesque', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
    --font-body: system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif;

    /* light 令牌（默认） */
    --bg: #f4f4f5;
    --surface: #ffffff;
    --surface-2: #ececef;
    --text: #16161a;
    --muted: #6b6b75;
    --line: #e2e2e6;
    --accent: #d63d77;
    --accent-soft: rgba(214, 61, 119, 0.10);
    --accent-ink: #ffffff;
    --glow: rgba(214, 61, 119, 0.16);
    --dot: rgba(22, 22, 26, 0.05);

    position: relative;
    box-sizing: border-box;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    scroll-behavior: smooth;
  }

  /* auto 跟随系统；显式 dark 覆盖 */
  @media (prefers-color-scheme: dark) {
    .home:not([data-theme='light']) {
      --bg: #0a0a0d;
      --surface: #131318;
      --surface-2: #1b1b22;
      --text: #f3f1ee;
      --muted: #97949f;
      --line: #26262e;
      --accent: #ef6fa0;
      --accent-soft: rgba(239, 111, 160, 0.14);
      --accent-ink: #0a0a0d;
      --glow: rgba(239, 111, 160, 0.20);
      --dot: rgba(255, 255, 255, 0.04);
    }
  }
  .home[data-theme='dark'] {
    --bg: #0a0a0d;
    --surface: #131318;
    --surface-2: #1b1b22;
    --text: #f3f1ee;
    --muted: #97949f;
    --line: #26262e;
    --accent: #ef6fa0;
    --accent-soft: rgba(239, 111, 160, 0.14);
    --accent-ink: #0a0a0d;
    --glow: rgba(239, 111, 160, 0.20);
    --dot: rgba(255, 255, 255, 0.04);
  }

  /* ambient 环境层：辉光缓慢漂移，fixed 不放进滚动容器 */
  .ambient {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .ambient::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(var(--dot) 1px, transparent 1px);
    background-size: 26px 26px;
    mask-image: radial-gradient(120% 80% at 50% 0%, #000 30%, transparent 75%);
  }
  .glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    background: var(--glow);
    will-change: transform;
  }
  .glow-a {
    top: -12vh;
    right: -6vw;
    width: 46vw;
    height: 46vw;
    max-width: 620px;
    max-height: 620px;
    animation: drift-a 22s ease-in-out infinite alternate;
  }
  .glow-b {
    top: 30vh;
    left: -10vw;
    width: 34vw;
    height: 34vw;
    max-width: 460px;
    max-height: 460px;
    opacity: 0.7;
    animation: drift-b 28s ease-in-out infinite alternate;
  }
  @keyframes drift-a {
    from { transform: translate3d(0, 0, 0) scale(1); }
    to { transform: translate3d(-4%, 6%, 0) scale(1.12); }
  }
  @keyframes drift-b {
    from { transform: translate3d(0, 0, 0) scale(1.05); }
    to { transform: translate3d(5%, -5%, 0) scale(0.92); }
  }

  /* 顶栏 */
  .nav {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 64px;
    padding: 0 clamp(20px, 5vw, 56px);
    background: color-mix(in srgb, var(--bg) 78%, transparent);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
  }
  .brand-logo {
    height: 26px;
    width: auto;
    display: block;
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .mode-pill,
  .nav-link {
    font-family: var(--font-mono);
    font-size: 12.5px;
    letter-spacing: 0.02em;
    color: var(--text);
    text-decoration: none;
    border: 1px solid var(--line);
    background: var(--surface);
    border-radius: var(--r-pill);
    padding: 7px 14px;
    cursor: pointer;
    transition: border-color 0.25s ease, color 0.25s ease, transform 0.12s ease, background 0.25s ease;
  }
  .mode-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .mode-glyph {
    color: var(--accent);
    font-size: 13px;
    line-height: 1;
  }
  .nav-link {
    border-color: transparent;
    background: transparent;
  }
  .mode-pill:hover,
  .nav-link:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
  .mode-pill:active,
  .nav-link:active {
    transform: translateY(1px);
  }

  .wrap {
    position: relative;
    z-index: 1;
    width: min(1180px, 100% - 2 * clamp(20px, 5vw, 56px));
    margin: 0 auto;
    padding: clamp(40px, 7vh, 84px) 0 24px;
  }

  /* hero 非对称分割 */
  .hero {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: clamp(28px, 4vw, 64px);
    align-items: center;
    padding-bottom: clamp(48px, 9vh, 104px);
  }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 18px;
  }
  .hero-title {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(2.4rem, 5.4vw, 4.1rem);
    line-height: 1.02;
    letter-spacing: -0.02em;
    margin: 0 0 20px;
  }
  /* accent 短语原子化：CJK 贪婪填行会把首字"一"甩到上一行行尾，
     黑体"一"形如一横、又着 accent 色，极易误读成装饰残影；
     nowrap 使整段成为不可断单元，断行只发生在前面逗号处 */
  .hero-title .accent {
    color: var(--accent);
    font-weight: 800;
    white-space: nowrap;
  }
  .hero-sub {
    font-size: clamp(1rem, 1.4vw, 1.18rem);
    line-height: 1.6;
    color: var(--muted);
    max-width: 46ch;
    margin: 0 0 30px;
  }
  .hero-cta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .btn {
    font-family: var(--font-mono);
    font-size: 13.5px;
    letter-spacing: 0.02em;
    border-radius: var(--r-pill);
    padding: 12px 22px;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    transition: transform 0.12s ease, box-shadow 0.25s ease, background 0.25s ease, color 0.25s ease;
  }
  .btn-primary {
    border: 1px solid var(--accent);
    background: var(--accent);
    color: var(--accent-ink);
    box-shadow: 0 10px 30px -12px var(--glow);
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 38px -12px var(--glow);
  }
  .btn-primary:active {
    transform: translateY(0);
  }
  .btn-ghost {
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--text);
  }
  .btn-ghost:hover {
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-2px);
  }
  .btn-ghost:active {
    transform: translateY(0);
  }

  /* 活预览卡 */
  .live-card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-card);
    padding: 14px;
    box-shadow: 0 30px 70px -40px rgba(0, 0, 0, 0.55);
  }
  .live-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }
  .live-tag {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--accent);
  }
  .live-switch {
    display: inline-flex;
    gap: 4px;
    background: var(--surface-2);
    border-radius: var(--r-pill);
    padding: 3px;
  }
  .sw-pill {
    font-family: var(--font-mono);
    font-size: 11.5px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    border-radius: var(--r-pill);
    padding: 5px 11px;
    cursor: pointer;
    transition: color 0.2s ease, background 0.2s ease;
  }
  .sw-pill.on {
    background: var(--surface);
    color: var(--accent);
    box-shadow: 0 2px 8px -4px rgba(0, 0, 0, 0.4);
  }
  /* 滚动条挂载层：相对定位承载轨道，滚动仍在内层 .live-scroll */
  .live-viewport {
    position: relative;
    border-radius: 10px;
  }
  .live-scroll {
    height: 320px;
    border-radius: 10px;
    background: var(--surface-2);
    overflow: auto;
    /* 隐藏原生条，交给 useScrollbar 渲染 */
    scrollbar-width: none;
  }
  .live-scroll::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  /* 主题镜像底色：steam / css-tricks 需要深底才能让 opacity:1 的 thumb 显形 */
  .live-scroll.lv-steam {
    background: linear-gradient(135deg, #1c1f22, #2c313c);
  }
  .live-scroll.lv-css-tricks {
    background: linear-gradient(13deg, #262626, #545454);
  }
  .live-scroll.lv-steam .live-code,
  .live-scroll.lv-css-tricks .live-code {
    color: #d4d4d4;
  }

  .live-code {
    margin: 0;
    padding: 18px 20px;
    width: max-content;
    font-family: var(--font-mono);
    font-size: 12.5px;
    line-height: 1.7;
    color: var(--text);
    white-space: pre;
  }

  /* section 通用 */
  .section {
    padding: clamp(36px, 6vh, 72px) 0;
    border-top: 1px solid var(--line);
  }
  #examples {
    scroll-margin-top: 80px;
  }
  .section-head {
    margin-bottom: clamp(22px, 3vh, 36px);
  }
  .section-title {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(1.7rem, 3vw, 2.5rem);
    letter-spacing: -0.02em;
    margin: 0 0 8px;
  }
  .section-lead {
    color: var(--muted);
    font-size: 0.98rem;
    margin: 0;
    max-width: 52ch;
  }

  /* examples 网格：3 列时宽卡 span 2 恰好填满 */
  .ex-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .ex-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-decoration: none;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-card);
    padding: 20px 20px 22px;
    overflow: hidden;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.25s ease;
  }
  .ex-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent);
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ex-card:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
    box-shadow: 0 18px 40px -28px rgba(0, 0, 0, 0.6);
  }
  .ex-card:hover::before {
    transform: scaleY(1);
  }
  .ex-card:active {
    transform: translateY(-1px);
  }
  .ex-card.wide {
    grid-column: span 2;
    background: var(--accent-soft);
    border-color: color-mix(in srgb, var(--accent) 30%, var(--line));
  }
  .ex-card.wide .ex-name {
    font-size: clamp(1.3rem, 2.2vw, 1.7rem);
  }
  .ex-tag {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .ex-name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.12rem;
    letter-spacing: -0.01em;
  }
  .ex-desc {
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.5;
    max-width: 40ch;
  }
  .ex-arrow {
    position: absolute;
    top: 18px;
    right: 18px;
    font-family: var(--font-mono);
    color: var(--muted);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
  }
  .ex-card:hover .ex-arrow {
    transform: translate(4px, -4px);
    color: var(--accent);
  }

  /* themes 色样网格 */
  .theme-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .theme-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    text-decoration: none;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-card);
    padding: 18px;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
  }
  .theme-card:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
  }
  .theme-track {
    position: relative;
    height: 64px;
    border-radius: 10px;
    background: var(--surface-2);
    overflow: hidden;
  }
  .theme-thumb {
    position: absolute;
    top: 6px;
    right: 8px;
    width: 9px;
    height: 52px;
    border-radius: var(--r-pill);
  }
  .theme-name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.1rem;
  }
  .theme-key {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--muted);
    margin-top: -8px;
  }

  /* clarify callout */
  .clarify {
    position: relative;
    margin: clamp(36px, 6vh, 72px) 0 0;
    padding: clamp(26px, 4vw, 40px);
    background: var(--surface-2);
    border: 1px solid var(--line);
    border-left: 4px solid var(--accent);
    border-radius: var(--r-card);
  }
  .clarify-tag {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--accent);
  }
  .clarify-title {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(1.4rem, 2.6vw, 2rem);
    letter-spacing: -0.01em;
    margin: 12px 0 10px;
  }
  .clarify-body {
    color: var(--muted);
    line-height: 1.65;
    max-width: 64ch;
    margin: 0;
  }

  /* footer */
  .foot {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    width: min(1180px, 100% - 2 * clamp(20px, 5vw, 56px));
    margin: 0 auto;
    padding: 28px 0 40px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--muted);
  }
  .foot a {
    color: var(--muted);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  .foot a:hover {
    color: var(--accent);
  }
  .foot-sep {
    opacity: 0.5;
  }

  /* 进场：load 立即 stagger，reveal 由 IO 触发 */
  .load {
    animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: calc(var(--i, 0) * 90ms + 60ms);
  }
  .reveal {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: calc(var(--i, 0) * 60ms);
  }
  .reveal.in {
    opacity: 1;
    transform: none;
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: none; }
  }

  /* 响应式折叠 */
  @media (min-width: 640px) {
    .ex-grid { grid-template-columns: repeat(2, 1fr); }
    .theme-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 1024px) {
    .ex-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 860px) {
    .hero {
      grid-template-columns: 1fr;
      gap: 32px;
    }
    .hero-copy {
      order: 1;
    }
    .live-card {
      order: 2;
    }
  }

  /* 减少动效：一切归位、停漂 */
  @media (prefers-reduced-motion: reduce) {
    .home { scroll-behavior: auto; }
    .load { animation: none; }
    .reveal { opacity: 1; transform: none; transition: none; }
    .glow { animation: none; }
    .ex-card,
    .theme-card,
    .btn,
    .mode-pill,
    .nav-link,
    .ex-arrow { transition: none; }
  }
</style>
