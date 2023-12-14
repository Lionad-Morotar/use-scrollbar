import { createApp } from "vue"
import ElementPlus from 'element-plus'
import {Table } from 'ant-design-vue'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
// import 'ant-design-vue/dist/antd.css'
import 'element-plus/dist/index.css'
import 'overlayscrollbars/styles/overlayscrollbars.css';

// main
;(async () => {
  const pages = import.meta.glob("./src/**/*.vue");
  const pathname = location.pathname.replace(/^\//, "") || "home";

  const fileRaw = pages[`./src/${pathname}.vue`];
  const fileIndex = pages[`./src/${pathname}/index.vue`];

  if (!fileRaw && !fileIndex) {
    location.pathname = "home";
    return;
  }

  const component = fileRaw
    ? // @ts-ignore
      (await fileRaw())?.default
    : // @ts-ignore
      (await fileIndex())?.default;

  const app = createApp(component);

  app.use(VXETable)
  app.use(ElementPlus)
  app.use(Table)

  app.mount('#play')
})()
