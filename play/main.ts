import { createApp } from "vue"
import ElementPlus from 'element-plus'
import {Table } from 'ant-design-vue'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
// import 'ant-design-vue/dist/antd.css'
import 'element-plus/dist/index.css'

// main
;(async () => {
  const apps = import.meta.glob('./src/*.vue')
  const name = location.pathname.replace(/^\//, '') || 'App'
  const file = apps[`./src/${name}.vue`]
  if (!file) {
    location.pathname = 'App'
    return
  }

  // @ts-ignore
  const App = (await file()).default
  const app = createApp(App)

  app.use(VXETable)
  app.use(ElementPlus)
  app.use(Table)

  app.mount('#play')
})()
