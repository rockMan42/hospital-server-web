import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/doctor/HomeView.vue'

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
    path: '/patientmanager',
    name: 'patientmanager',
    meta: {
      title: "患者管理"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/doctor/PatientManagerView.vue')
  },
  {
    path: '/binglimanager',
    name: 'binglimanager',
    meta: {
      title: "病例管理"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/doctor/BingLiManagerView.vue')
  },
  {
    path: '/yuyuemanager',
    name: 'yuyuemanager',
    meta: {
      title: "预约管理"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/doctor/YuYueManagerView.vue')
  },
  {
    path: '/workstatistic',
    name: 'workstatistic',
    meta: {
      title: "工作统计"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/doctor/WorkStatisticsView.vue')
  },
  {
    path: '/manager',
    name: 'manager',
    meta: {
      title: "管理员首页"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/manager/ManagerMainView.vue')
  },
  {
    path: '/departmentmanager',
    name: 'departmentmanager',
    meta: {
      title: "科室管理"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/manager/DepartmentManagerView.vue')
  },
  {
    path: '/clinicroommanager',
    name: 'clinicroommanager',
    meta: {
      title: "诊室管理"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/manager/ClinicRoomManagerView.vue')
  },
  {
    path: '/doctormanager',
    name: 'doctormanager',
    meta: {
      title: "医生管理"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/manager/DoctorManagerView.vue')
  },
  {
    path: '/nursemanager',
    name: 'nursemanager',
    meta: {
      title: "护士管理"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/manager/NurseManagerView.vue')
  },
  {
    path: '/mpatientmanager',
    name: 'ManagerPatientManager',
    meta: {
      title: "患者管理"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/manager/PatientManagerView.vue')
  },
  {
    path: '/myuyuemanager',
    name: 'ManagerYuYueManager',
    meta: {
      title: "预约管理"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/manager/YuYueManagerView.vue')
  },
  {
    path: '/schedule',
    name: 'schedule',
    meta: {
      title: "门诊日程"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/manager/ScheduleView.vue')
  },
  {
    path: '/outpatientmanager',
    name: 'outpatientmanager',
    meta: {
      title: "出诊管理"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/manager/OutpatientManagerView.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    meta: {
      title: "系统设置"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/manager/SettingsView.vue')
  },
  {
    path: '/nursehome',
    name: 'nursehome',
    meta: {
      title: "护士首页"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/nurse/NurseHomeView.vue')
  },
  {
    path: '/patientcare',
    name: 'patientcare',
    meta: {
      title: "患者护理"
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/nurse/PatientCareView.vue')
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
