import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: "主页"
    },
    component: HomeView
  },
  {
    path: '/tts',
    name: 'tts',
    meta: {
      title: "语音合成"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/TTSView.vue')
  },
  {
    path: '/about',
    name: 'about',
    meta: {
      title: "关于我们"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView.vue')
  },
    {
    path: '/login',
    name: 'login',
    meta: {
      title: "登录"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/LoginView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  //获取vuex中的token和用户信息
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem('user'));
  // 判断token存在或者访问的是登录页
  if (token != null || to.path === "/login") {
    next()
  }else{
    if(user==null){
      next('/login');
    }else{
      next();
    }
  }
})

export default router
