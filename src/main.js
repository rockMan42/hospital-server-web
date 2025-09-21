import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'; //引入elementPlus图标
import VueWechatTitle from 'vue-wechat-title'; //统一标题
import 'dayjs/locale/zh-cn' // 中文支持
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import dayjs from 'dayjs'
// 设置 dayjs 为中文
dayjs.locale('zh-cn')


const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(store).use(router).use(ElementPlus).use(Antd, { locale: zhCN }).use(VueWechatTitle).mount('#app')
