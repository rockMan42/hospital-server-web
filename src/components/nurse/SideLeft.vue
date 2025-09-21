<template>
  <!-- 护士端侧边栏 -->
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

      <!-- 系统设置分组 -->
      <div class="menu-title">系统设置</div>
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
    default: 'workbench'
  }
})

// 核心功能菜单项 - 护士专业功能
const coreMenuItems = ref([
  { name: '护士工作台', path: '/nursehome', icon: '🏥', key: 'workbench' },
  { name: '患者护理', path: '/patientcare', icon: '👩‍⚕️', key: 'patientcare' },
  { name: '病房管理', path: '/wardmanager', icon: '🏨', key: 'ward' },
  { name: '用药管理', path: '/medicationmanager', icon: '💊', key: 'medication' },
  { name: '护理记录', path: '/nursingrecord', icon: '📋', key: 'record' },
  { name: '护理统计', path: '/nursingstatistic', icon: '📊', key: 'statistics' }
])

// 系统设置菜单项
const systemMenuItems = ref([
  { name: '账户设置', path: '/settings', icon: '⚙️', key: 'settings' },
  { name: '帮助中心', path: '/help', icon: '❓', key: 'help' }
])

// 当前路由路径
const currentPath = computed(() => {
  return route.path
})

// 判断是否为当前路径
const isCurrentPath = (path) => {
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
// 颜色变量 - 护士端主题色
$primary: #67c23a;     // 护理绿色作为主色
$success: #67c23a;
$warning: #e6a23c;
$danger: #f56c6c;
$purple: #9a66e4;
$nursing: #52c41a;     // 护理专业绿色
$text: #333;
$light: #f8f9fc;
$border: #ebeef5;

// 侧边栏样式 - 基于医生端但适配护士端
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid $border;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 0;
  height: calc(100vh - 72px); // 调整高度，为TopNavbar留出空间
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 72px; // 为TopNavbar留出空间(16px*2 + 约40px内容高度)
  z-index: 100; // 高于内容但低于TopNavbar

  // 护士端标题样式已移至TopNavbar组件中

  .menu {
    padding: 30px 0;
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
        
        // 为护士工作台添加特殊的护理主题色
        &[href="#workbench"] {
          background: rgba($nursing, 0.1);
          color: $nursing;
          border-left-color: $nursing;
        }
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
  }
}

@media (max-width: 992px) {
  .sidebar {
    width: 80px;
        // 医生端标题已移除
    
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
    transition: left 0.3s ease;
    z-index: 1000;
    
    &.open {
      left: 0;
    }
        // 医生端标题已移除
    
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