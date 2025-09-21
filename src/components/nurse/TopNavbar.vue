<template>
  <!-- 护士端顶部导航栏 -->
  <header class="top-navbar">
    <div class="logo">
      <div class="nursing-symbol">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
                fill="white"/>
          <path d="M12 6V18M6 12H18" 
                stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <span>护士端</span>
    </div>

    <div class="header-right">
      <div class="notifications" @click="handleNotifications">
        <span>🔔</span>
        <span class="badge" v-if="notificationCount > 0">{{ notificationCount }}</span>
      </div>
      <div class="user-info" @click="toggleDropdown">
        <span class="name">{{ displayName }}</span>
        <span class="arrow">▼</span>
      </div>
      <div v-if="dropdownVisible" class="dropdown-menu">
        <a href="#" @click.prevent="handleProfile">个人资料</a>
        <a href="#" @click.prevent="handleSettings">设置</a>
        <a href="#" @click.prevent="handleLogout">退出登录</a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props
const props = defineProps({
  notificationCount: {
    type: Number,
    default: 3
  }
})

// Emits
const emit = defineEmits(['notification-click', 'profile-click', 'settings-click'])

// 状态管理
const dropdownVisible = ref(false)
const store = useStore()
const router = useRouter()

// 用户信息
const username = computed(() => store.state.user?.username || '护士')
const displayName = computed(() => `${username.value} 护士长`)

// 方法
const toggleDropdown = (event) => {
  dropdownVisible.value = !dropdownVisible.value
  event.stopPropagation()
}

const handleNotifications = () => {
  emit('notification-click')
  ElMessage.info('查看通知功能')
}

const handleProfile = () => {
  emit('profile-click')
  ElMessage.info('个人资料功能开发中...')
}

const handleSettings = () => {
  emit('settings-click')
  ElMessage.info('设置功能开发中...')
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

// 点击外部关闭下拉菜单
const handleClickOutside = () => {
  dropdownVisible.value = false
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
// 颜色变量 - 护士端主题色
$primary: #67c23a;     // 护理绿色作为主色
$danger: #f56c6c;
$text: #333;
$light: #f8f9fc;
$border: #ebeef5;

// 顶部导航栏样式
.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 30px;
  background: $primary;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 101;

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 600;

    .nursing-symbol {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;

    .notifications {
      position: relative;
      font-size: 20px;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background-color 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background: $danger;
        color: white;
        font-size: 12px;
        min-width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      transition: background-color 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .name {
        font-size: 15px;
        font-weight: 500;
      }

      .arrow {
        font-size: 12px;
        transition: transform 0.3s ease;
      }

      &:hover .arrow {
        transform: rotate(180deg);
      }
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      min-width: 180px;
      margin-top: 8px;
      z-index: 100;
      animation: slideDown 0.3s ease;

      a {
        display: block;
        padding: 12px 20px;
        color: $text;
        text-decoration: none;
        border-bottom: 1px solid $border;
        transition: background-color 0.3s ease;
        font-size: 14px;

        &:last-child { 
          border: none; 
        }
        
        &:hover { 
          background: $light;
          color: $primary;
        }
      }
    }
  }
}

// 下拉菜单动画
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .top-navbar {
    padding: 12px 20px;

    .logo {
      font-size: 18px;
      gap: 8px;

      .nursing-symbol {
        width: 36px;
        height: 36px;
        
        svg {
          width: 18px;
          height: 18px;
        }
      }
    }

    .header-right {
      gap: 12px;

      .user-info {
        .name {
          font-size: 14px;
        }
      }

      .dropdown-menu {
        min-width: 160px;
        right: -10px;
      }
    }
  }
}

@media (max-width: 480px) {
  .top-navbar {
    .user-info {
      .name {
        display: none;
      }
    }
  }
}
</style>
