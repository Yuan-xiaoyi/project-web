import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'

const originalPush = VueRouter.prototype.push

VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

const router = new VueRouter({
  base: '/shjmanage',
  
  // base: '/',
  mode: 'hash',
  routes: [
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})

//路由拦截
router.beforeEach((to,from,next)=>{
  let token = Vue.cookie.get('token'); //这里根据自己项目的实际情况添加是否登录的判断条件
  
  if (to.name !== 'Login' && !token)
    next({ path: '/login'})
  else next()
})


export default router;