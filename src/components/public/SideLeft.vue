<template>
  <!-- 公共设备端侧边栏 -->
  <aside class="sidebar">
    <nav class="menu">
      <!-- 核心功能分组 -->
      <div class="menu-title">设备功能</div>
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

      <!-- 系统操作分组 -->
      <div class="menu-title">系统操作</div>
      <a href="#" class="menu-item" @click.prevent="handleRestart">
        <span class="icon">🔄</span>
        <span>重启系统</span>
      </a>
      <a href="#" class="menu-item" @click.prevent="handleMaintenance">
        <span class="icon">🔧</span>
        <span>维护模式</span>
      </a>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

// Vue Router
const router = useRouter()
const route = useRoute()

// 组件 Props
const props = defineProps({
  activeMenu: {
    type: String,
    default: 'home'
  }
})

// 核心功能菜单项
const coreMenuItems = ref([
  { name: '设备首页', path: '/public/home', icon: '🏠', key: 'home' },
  { name: '自助挂号', path: '/public/registration', icon: '📝', key: 'registration' },
  { name: '门诊缴费', path: '/public/payment', icon: '💳', key: 'payment' },
  { name: '报告查询', path: '/public/reports', icon: '📋', key: 'reports' },
  { name: '叫号系统', path: '/public/queue', icon: '📢', key: 'queue' }
])

// 系统设置菜单项
const systemMenuItems = ref([
  { name: '设备设置', path: '/public/settings', icon: '⚙️', key: 'settings' },
  { name: '网络配置', path: '/public/network', icon: '🌐', key: 'network' },
  { name: '帮助中心', path: '/public/help', icon: '❓', key: 'help' }
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

// 系统操作处理
const handleRestart = () => {
  ElMessageBox.confirm(
    '确定要重启设备系统吗？',
    '重启确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('设备重启中...')
    // 这里可以调用重启API
  }).catch(() => {
    ElMessage.info('已取消重启')
  })
}

const handleMaintenance = () => {
  ElMessage.info('维护模式功能开发中...')
}
</script>

<style scoped lang="scss">
// 颜色变量 - 公共设备端主题色
$primary: #1a75bc;
$success: #67c23a;
$warning: #e6a23c;
$danger: #f56c6c;
$purple: #9a66e4;
$public: #1a75bc;  // 公共设备蓝色
$text: #333;
$light: #f8f9fc;
$border: #ebeef5;

// 侧边栏样式
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
  top: 72px; // 为TopNavbar留出空间
  z-index: 100; // 高于内容但低于TopNavbar

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
        
        // 为设备首页添加特殊的公共主题色
        &[href*="home"] {
          background: rgba($public, 0.1);
          color: $public;
          border-left-color: $public;
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
