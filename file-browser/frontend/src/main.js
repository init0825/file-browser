/**
 * Vue应用主入口文件
 * 创建并挂载Vue应用实例
 */
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

// 创建Vue应用并挂载到DOM
createApp(App).mount('#app');