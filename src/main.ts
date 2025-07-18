import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'; // Element Plus 默认样式
import 'element-plus/theme-chalk/dark/css-vars.css'  // Element Plus 的暗黑模式
import router from './router';
import App from './App.vue'

const app = createApp(App);
const pinia = createPinia();
// pinia持久化插件
pinia.use(piniaPersist);

// 全局启用pinia
app.use(pinia)

app.use(ElementPlus);
app.use(router);

app.mount('#app')

