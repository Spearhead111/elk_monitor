import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from '@/router'
import pinia from '@/stores'
import authImg from '@/components/auth-img/index.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/icons/iconfont/iconfont.css'
import 'normalize.css'
import './assets/css/index.css'
import 'animate.css'

const app = createApp(App)

app.component('authImg', authImg)
app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')
