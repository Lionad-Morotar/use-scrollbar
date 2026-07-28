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
  const pathname = location.pathname.replace(/^\//, '') || 'home'

  const fileRaw = pages[`./src/${pathname}.vue`]
  const fileIndex = pages[`./src/${pathname}/index.vue`]

  if (!fileRaw && !fileIndex) {
    location.pathname = 'home'
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
