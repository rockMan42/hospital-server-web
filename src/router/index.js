import { createRouter, createWebHashHistory } from 'vue-router'
import DoctorDashboard from '@/views/doctor/DashboardView.vue'
import ManagerDashboard from '@/views/manager/DashboardView.vue'
import NurseDashboard from '@/views/nurse/DashboardView.vue'

const routes = [
  // 根路径，根据用户角色重定向到对应首页
  {
    path: '/',
    name: 'redirect',
    redirect: (to) => {
      // 根据用户角色重定向到对应首页
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (!user) return '/login'

      switch (user.role) {
        case 'doctor':
          return '/doctor/home'
        case 'manager':
          return '/manager/home'
        case 'nurse':
          return '/nurse/home'
        default:
          return '/login'
      }
    }
  },
  // 医生页面
  {
    path: '/doctor',
    name: 'doctor',
    meta: {
      title: "医生工作台",
      requiresAuth: true,
      requiredRole: 'doctor'
    },
    component: DoctorDashboard,
    redirect: '/doctor/home',
    children: [
      // 医生工作台
      {
        path: 'home',
        name: 'DoctorHome',
        meta: {
          title: "医生工作台",
          requiresAuth: true,
          requiredRole: 'doctor'
        },
        component: () => import('@/views/doctor/HomeView.vue')
      },
      // 患者管理
      {
        path: 'patient',
        name: 'DoctorPatientManager',
        meta: {
          title: "患者管理",
          requiresAuth: true,
          requiredRole: 'doctor'
        },
        component: () => import('@/views/doctor/PatientManagerView.vue')
      },
      // 病历管理
      {
        path: 'medicalrecord',
        name: 'DoctorMedicalRecordManager',
        meta: {
          title: "病历管理",
          requiresAuth: true,
          requiredRole: 'doctor'
        },
        component: () => import('@/views/doctor/BingLiManagerView.vue')
      },
      // 预约管理
      {
        path: 'reservation',
        name: 'DoctorReservationManager',
        meta: {
          title: "预约管理",
          requiresAuth: true,
          requiredRole: 'doctor'
        },
        component: () => import('@/views/doctor/YuYueManagerView.vue')
      },
      // 工作统计
      {
        path: 'statistics',
        name: 'DoctorWorkStatistics',
        meta: {
          title: "工作统计",
          requiresAuth: true,
          requiredRole: 'doctor'
        },
        component: () => import('@/views/doctor/WorkStatisticsView.vue')
      }
    ]
  },
  // 管理员页面
  {
    path: '/manager',
    name: 'manager',
    meta: {
      title: "管理员首页",
      requiresAuth: true,
      requiredRole: 'manager'
    },
    component: ManagerDashboard,
    redirect: '/manager/home',
    children: [
      // 管理员工作台
      {
        path: 'home',
        name: 'ManagerHome',
        meta: {
          title: "管理员工作台",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/ManagerMainView.vue')
      },
      // 科室管理
      {
        path: 'department',
        name: 'ManagerDepartmentManager',
        meta: {
          title: "科室管理",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/DepartmentManagerView.vue')
      },
      // 诊室管理
      {
        path: 'clinicroom',
        name: 'ManagerClinicRoomManager',
        meta: {
          title: "诊室管理",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/ClinicRoomManagerView.vue')
      },
      // 医生管理
      {
        path: 'doctor',
        name: 'ManagerDoctorManager',
        meta: {
          title: "医生管理",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/DoctorManagerView.vue')
      },
      // 护士管理
      {
        path: 'nurse',
        name: 'ManagerNurseManager',
        meta: {
          title: "护士管理",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/NurseManagerView.vue')
      },
      // 患者管理
      {
        path: 'patient',
        name: 'ManagerPatientManager',
        meta: {
          title: "患者管理",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/PatientManagerView.vue')
      },
      // 费用配置
      {
        path: 'feeconfig',
        name: 'ManagerFeeManager',
        meta: {
          title: "费用配置",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/FeeConfigurationView.vue')
      },
      {
        path: 'billing',
        name: 'ManagerBillingManager',
        meta: {
          title: "收费管理",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/BillingManagerView.vue')
      },
      {
        path: 'schedule',
        name: 'ManagerScheduleManager',
        meta: {
          title: "排班管理",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/ScheduleManagerView.vue')
      },
      // 预约管理
      {
        path: 'reservation',
        name: 'ManagerReservationManager',
        meta: {
          title: "预约管理",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/YuYueManagerView.vue')
      },
      // 窗口挂号
      {
        path: 'registration',
        name: 'ManagerRegistration',
        meta: {
          title: "窗口挂号",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/RegistrationWindowView.vue')
      },
      // 系统设置
      {
        path: 'settings',
        name: 'ManagerSettings',
        meta: {
          title: "系统设置",
          requiresAuth: true,
          requiredRole: 'manager'
        },
        component: () => import('@/views/manager/SettingsView.vue')
      }
    ]
  },
  // 护士页面
  {
    path: '/nurse',
    name: 'nurse',
    meta: {
      title: "护士首页",
      requiresAuth: true,
      requiredRole: 'nurse'
    },
    component: NurseDashboard,
    redirect: '/nurse/home',
    children: [
      // 护士工作台
      {
        path: 'home',
        name: 'NurseHome',
        meta: {
          title: "护士工作台",
          requiresAuth: true,
          requiredRole: 'nurse'
        },
        component: () => import('@/views/nurse/NurseHomeView.vue')
      },
      // 患者护理
      {
        path: 'patientcare',
        name: 'NursePatientCare',
        meta: {
          title: "患者护理",
          requiresAuth: true,
          requiredRole: 'nurse'
        },
        component: () => import('@/views/nurse/PatientCareView.vue')
      }
    ]
  },
  //公共设备页面
  {
    path: '/self-service',
    name: 'SelfService',
    meta: {
      title: "自助服务机",
      requiresAuth: false
    },
    redirect: '/self-service/home',
    component: () => import('@/views/public/PublicDashBoardView.vue'),
    children:[
      {
        path: 'home',
        name: 'SelfServiceMachine',
        meta: {
          title: "自助机",
          requiresAuth: false
        },
        component: () => import('@/views/public/SelfServiceView.vue')
      },
      // 科室选择页面
      {
        path:"department-selection",
        name:"department-selection",
        meta:{
          title:"科室选择",
          requiresAuth:false
        },
        component:()=>import('@/views/public/DepartmentSelection.vue')
      },   
      // 诊室选择页面   
      {
        path:"clinic-selection",
        name:"clinic-selection",
        meta:{
          title:"诊室选择",
          requiresAuth:false
        },
        component:()=>import('@/views/public/ClinicSelection.vue')
      },
      // 医生选择页面   
      {
        path:"doctor-selection",
        name:"doctor-selection",
        meta:{
          title:"医生选择",
          requiresAuth:false
        },
        component:()=>import('@/views/public/DoctorSelection.vue')
      },
      // 挂号方式选择页面
      {
        path:"patient-method-selection",
        name:"PatientMethodSelection",
        meta:{
          title:"挂号方式选择",
          requiresAuth:false
        },
        component:()=>import('@/views/public/PaymentMethodSelection.vue')
      },
      // 费用详情页面
      {
        path:"fee-details",
        name:"FeeDetails",
        meta:{
          title:"费用详情",
          requiresAuth:false
        },
        component:()=>import('@/views/public/FeedetailsView.vue')
      },
      // 支付页面
      {
        path:"payment",
        name:"Payment",
        meta:{
          title:"支付页面",
          requiresAuth:false
        },
        component:()=>import('@/views/public/PaymentView.vue')
      },
      //支付成功页面
      {
        path:"payment-success",
        name:"PaymentSuccess",
        meta:{
          title:"支付成功",
          requiresAuth:false
        },
        component:()=>import('@/views/public/PaymentSuccessView.vue')
      },
      //支付失败页面
      {
        path:"payment-failure",
        name:"PaymentFailure",
        meta:{
          title:"支付失败",
          requiresAuth:false
        },
        component:()=>import('@/views/public/PaymentFailedView.vue')
      },
      // 门诊缴费扫码页面
      {
        path:"payment-start-scan",
        name:"PaymentStartScan",
        meta:{
          title:"门诊缴费扫码",
          requiresAuth:false
        },
        component:()=>import('@/views/public/PaymentStartScanView.vue')
      },
      // 门诊缴费详细信息页面
      {
        path:"outpatient-fee-details",
        name:"OutpatientFeeDetails",
        meta:{
          title:"门诊缴费详细信息",
          requiresAuth:false
        },
        component:()=>import('@/views/public/OutpatientFeeDetailsView.vue')
      },
    ]
  },
  {
    path: '/publicdevice',
    name: 'PublicDevice',
    meta: {
      title: "公共设备",
      requiresAuth: false
    },
    redirect: '/publicdevice/view',
    component: () => import('@/views/public/PublicDashBoardView.vue'),
    children:[
      {
        path: 'view',
        name: 'PublicDeviceView',
        meta: {
          title: "公共设备展示",
          requiresAuth: false
        },
        component: () => import('@/views/public/PublicDeviceView.vue')
      },
      {
        path: 'queue',
        name: 'QueueSystem',
        meta: {
          title: "排队叫号系统",
          requiresAuth: false
        },
        component: () => import('@/views/public/QueueSystem.vue')
      }
    ]
  },
  // 语音合成测试页面（开发用）
  {
    path: '/tts',
    name: 'tts',
    meta: {
      title: "语音合成",
      requiresAuth: false
    },
    component: () => import('@/views/TTSView.vue')
  },
  // 登录页面
  {
    path: '/login',
    name: 'login',
    meta: {
      title: "登录",
      requiresAuth: false
    },
    component: () => import('@/views/LoginView.vue')
  },
  // 其他未匹配到的路径重定向到登录页
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  
  // 不需要认证的页面直接放行
  if (!to.meta.requiresAuth) {
    next()
    return
  }
  
  // 检查是否登录
  if (!token || !user) {
    next('/login')
    return
  }
  
  // 检查角色权限
  const requiredRole = to.meta.requiredRole
  if (requiredRole && user.role !== requiredRole) {
    // 角色不匹配，重定向到对应角色的首页
    switch (user.role) {
      case 'doctor':
        next('/doctor/home')
        break
      case 'manager':
        next('/manager/home')
        break
      case 'nurse':
        next('/nurse/home')
        break
      default:
        next('/login')
    }
    return
  }
  
  next()
})

export default router
