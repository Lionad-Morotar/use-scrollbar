import { Table } from 'ant-design-vue'
import ElementPlus from 'element-plus'
import { createApp } from 'vue'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
// import 'ant-design-vue/dist/antd.css'
import 'element-plus/dist/index.css'
import 'overlayscrollbars/styles/overlayscrollbars.css'

// main
void (async () => {
  const pages = import.meta.glob('./src/**/*.vue')
  // Pages 子路径托管时 location.pathname 带 base 前缀(如 /use-scrollbar/home),先剥离再做页面匹配;
  // 回退跳转显式拼回前缀——给 pathname 赋相对值在尾斜杠缺失时会被 URL 解析 pop 掉仓库段
  const base = import.meta.env.BASE_URL
  const pathname
    = (location.pathname.startsWith(base)
      ? location.pathname.slice(base.length)
      : location.pathname.replace(/^\//, '')) || 'home'

  const fileRaw = pages[`./src/${pathname}.vue`]
  const fileIndex = pages[`./src/${pathname}/index.vue`]

  if (!fileRaw && !fileIndex) {
    location.pathname = `${base}home`
    return
  }

  // @ts-expect-error import.meta.glob 的模块记录类型不含 default 声明
  const component = fileRaw ? (await fileRaw())?.default : (await fileIndex())?.default

  const app = createApp(component)

  app.use(VXETable)
  app.use(ElementPlus)
  app.use(Table)

  app.mount('#play')
})()
