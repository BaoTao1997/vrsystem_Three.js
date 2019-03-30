// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import * as THREE from 'three';
import Vue from 'vue'
import App from './App'
import store from './store';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';
import './assets/custom-theme/index.css'; // 换肤版本element-ui css https://github.com/PanJiaChen/custom-element-theme
import 'normalize.css/normalize.css';// normalize.css 样式格式化
import './styles/index.scss'; // 全局自定义的css样式
//引入axios
import axios from "axios";
Vue.prototype.$ajax = axios;

Vue.config.productionTip = false

Vue.use(ElementUI);
Vue.use(THREE);

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
