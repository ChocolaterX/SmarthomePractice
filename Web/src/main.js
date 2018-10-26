// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueResource from 'vue-resource'
import axios from 'axios'
import ElementUI from 'element-ui'
import vuex from 'vuex'
import store from './store'

import router from './router/router.js'
import '../config/sys_config.js'

Vue.use(VueResource);
Vue.use(ElementUI);				//尚未引入此处的CSS
Vue.use(vuex);



Vue.config.productionTip = false;
//axios.defaults.withCredentials = true;		//默认允许后台跨域操作，如在客户端存储cookie等需要权限的操作
Vue.prototype.$axios = axios;


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
