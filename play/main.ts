import { createApp } from "vue"

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

  app.mount('#play')
})()
