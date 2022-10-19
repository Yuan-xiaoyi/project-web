// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/default.css'
import VueCookie from 'vue-cookie'
import filter from "./utils/filter"

Vue.prototype.$filter = filter
Vue.use(VueCookie);
Vue.use(ElementUI);

Vue.config.productionTip = false

/* eslint-disable no-new */
// new Vue({
//   el: '#app',
//   router,
//   components: { App },
//   template: '<App/>'
// })

new Vue({
  el: '#app',
  render: h => h(App),
  router,
}).$mount('#app')