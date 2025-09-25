<template>
    <!-- 侧边栏 -->
    <aside class="sidebar">
      
      <nav class="menu">
        <!-- 核心功能分组 -->
        <div class="menu-title">核心功能</div>
        <router-link
          v-for="item in coreMenuItems"
          :to="item.path"
          :key="item.key"
          custom
          v-slot="{ navigate, isActive }"
        >
          <a 
            href="#" 
            class="menu-item" 
            :class="{ active: isActive || isCurrentPath(item.path) }" 
            @click.prevent="handleMenuClick(navigate, item)"
          >
            <span class="icon">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </a>
        </router-link>
  
        <!-- 系统管理分组 -->
        <div class="menu-title">系统管理</div>
        <router-link
          v-for="item in systemMenuItems"
          :to="item.path"
          :key="item.key"
          custom
          v-slot="{ navigate, isActive }"
        >
          <a 
            href="#" 
            class="menu-item" 
            :class="{ active: isActive || isCurrentPath(item.path) }" 
            @click.prevent="handleMenuClick(navigate, item)"
          >
            <span class="icon">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </a>
        </router-link>
  
        <!-- 用户操作分组 -->
        <div class="menu-title">用户操作</div>
        <a href="#" class="menu-item" @click.prevent="handleProfile">
          <span class="icon">👤</span>
          <span>个人资料</span>
        </a>
        <a href="#" class="menu-item" @click.prevent="handleLogout">
          <span class="icon">🚪</span>
          <span>退出登录</span>
        </a>
      </nav>
    </aside>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useStore } from 'vuex'
  import { ElMessage, ElMessageBox } from 'element-plus'
  
  // Vue Router 和 Vuex
  const router = useRouter()
  const route = useRoute()
  const store = useStore()
  
  // 组件 Props
  const props = defineProps({
    activeMenu: {
      type: String,
      default: 'dashboard'
    }
  })
  
  // 核心功能菜单项
  const coreMenuItems = ref([
    { name: '工作台', path: '/manager/home', icon: '🏠', key: 'dashboard' },
    { name: '科室管理', path: '/manager/department', icon: '🏥', key: 'department' },
    { name: '诊室管理', path: '/manager/clinicroom', icon: '🚪', key: 'clinicroom' },
    { name: '医生管理', path: '/manager/doctor', icon: '👨‍⚕️', key: 'doctor' },
    { name: '护士管理', path: '/manager/nurse', icon: '👩‍⚕️', key: 'nurse' },
    { name: '患者管理', path: '/manager/patient', icon: '👥', key: 'patient' },
    { name: '预约管理', path: '/manager/reservation', icon: '📅', key: 'appointment' },
    { name: '门诊日程', path: '/manager/schedule', icon: '🗓️', key: 'schedule' },
    { name: '窗口挂号', path: '/manager/registration', icon: '🧾', key: 'registration' },
    { name: '出诊管理', path: '/manager/outpatient', icon: '👨‍⚕️', key: 'outpatient' }
  ])
  
  // 系统管理菜单项
  const systemMenuItems = ref([
    { name: '系统设置', path: '/manager/settings', icon: '⚙️', key: 'settings' },
    { name: '数据统计', path: '/manager/statistics', icon: '📊', key: 'statistics' },
    { name: '日志管理', path: '/manager/logs', icon: '📝', key: 'logs' },
    { name: '帮助中心', path: '/manager/help', icon: '❓', key: 'help' }
  ])
  
  // 当前路由路径 - 修复路由激活判断逻辑
  const currentPath = computed(() => {
    return route.path
  })
  
  // 判断是否为当前路径 - 修复激活判断逻辑
  const isCurrentPath = (path) => {
    // 精确匹配
    return currentPath.value === path
  }
  
  // 菜单点击处理
  const handleMenuClick = (navigate, item) => {
    console.log('点击菜单:', item.name, '路径:', item.path)
    try {
      navigate()
    } catch (error) {
      console.error('路由跳转失败:', error)
      // 备用跳转方式
      router.push(item.path)
    }
  }

  // 用户操作处理
  const handleProfile = () => {
    ElMessage.info('个人资料功能开发中...')
  }
  
  const handleLogout = () => {
    ElMessageBox.confirm(
      '确定要退出系统吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // 清除本地存储
      localStorage.clear()
      sessionStorage.clear()
      
      // 清除Vuex状态
      if (store.dispatch) {
        store.dispatch('user/logout')
      }
      
      // 重定向到登录页面
      router.push('/login')
      
      ElMessage.success('已安全退出系统')
    }).catch(() => {
      ElMessage.info('已取消退出')
    })
  }
  </script>
  
  <style scoped lang="scss">
  // 颜色变量 - 与ManagerMainView保持一致
  $primary: #409eff;
  $success: #67c23a;
  $warning: #e6a23c;
  $danger: #f56c6c;
  $purple: #9a66e4;
  $text: #333;
  $light: #f8f9fc;
  $border: #ebeef5;
  
  // 侧边栏样式 - 完全匹配ManagerMainView
  .sidebar {
    width: 260px;
    background: white;
    border-right: 1px solid $border;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 0;
    height: calc(100vh - 72px); // 减去AdminHeader的高度
    overflow-y: auto;
    position: fixed;
    left: 0;
    top: 72px; // 为AdminHeader留出空间
    z-index: 100;
  
  
    .menu {
      padding: 20px 0 30px 0; // 增加顶部内边距
      .menu-title {
        padding: 12px 24px;
        color: #666;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 16px;
  
        &:first-child {
          margin-top: 0;
        }
      }
  
      .menu-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 24px;
        color: #555;
        text-decoration: none;
        font-size: 15px;
        transition: all 0.3s ease;
        border-left: 3px solid transparent;
        cursor: pointer;
  
        &:hover {
          background: #f8f9fc;
          color: $primary;
        }
  
        &.active {
          background: rgba($primary, 0.1);
          color: $primary;
          border-left-color: $primary;
          font-weight: 600;
        }
  
        .icon {
          font-size: 18px;
          width: 20px;
          text-align: center;
        }
      }
    }
  }
  
  // 滚动条样式
  .sidebar::-webkit-scrollbar {
    width: 4px;
  }
  
  .sidebar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }
  
  .sidebar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
  
  .sidebar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  
  // 响应式设计
  @media (max-width: 1200px) {
    .sidebar {
      width: 220px;
      top: 72px; // 保持AdminHeader空间
      height: calc(100vh - 72px);
    }
  }
  
  @media (max-width: 992px) {
    .sidebar {
      width: 80px;
      top: 72px; // 保持AdminHeader空间
      height: calc(100vh - 72px);
      
      .menu {
        .menu-title {
          display: none;
        }
        
        .menu-item {
          justify-content: center;
          padding: 16px 12px;
          
          span:not(.icon) {
            display: none;
          }
          
          .icon {
            font-size: 20px;
          }
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      left: -260px;
      width: 260px;
      top: 72px; // 保持AdminHeader空间
      height: calc(100vh - 72px);
      transition: left 0.3s ease;
      z-index: 1000;
      
      &.open {
        left: 0;
      }
      
      .menu {
        .menu-title {
          display: block;
        }
        
        .menu-item {
          justify-content: flex-start;
          padding: 14px 24px;
          
          span:not(.icon) {
            display: inline;
          }
          
          .icon {
            font-size: 18px;
          }
        }
      }
    }
  }
  
  // 动画效果
  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
  
  .sidebar.open {
    animation: slideIn 0.3s ease-out;
  }
  </style>