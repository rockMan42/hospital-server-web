<template>
  <!-- 管理员端顶部导航栏 -->
  <header class="admin-header">
    <div class="logo">
      <div class="hospital-symbol">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V2M12 22V20M4 12H2M6.31 6.31L4.9 4.9M17.69 6.31L19.1 4.9M6.31 17.69L4.9 19.1M17.69 17.69L19.1 19.1M22 12H20M16 12H8M12 16V8"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span>{{ title }}</span>
    </div>

    <div class="header-right">
      <div class="notifications" @click="handleNotifications">
        <span>🔔</span>
        <span class="badge" v-if="notificationCount > 0">{{ notificationCount }}</span>
      </div>
      <div class="user-info" @click="toggleDropdown">
        <span class="name">{{ username }} 管理员</span>
        <span class="arrow">▼</span>
      </div>
      <div v-if="dropdownVisible" class="dropdown-menu">
        <a href="#" @click.prevent="handleProfile">个人资料</a>
        <a href="#" @click.prevent="handleSettings">系统设置</a>
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

// 组件 Props
const props = defineProps({
  title: {
    type: String,
    default: '医院管理系统'
  },
  notificationCount: {
    type: Number,
    default: 2
  }
})

// Emits
const emit = defineEmits(['notification-click', 'profile-click', 'settings-click'])

// 状态管理
const dropdownVisible = ref(false)
const store = useStore()
const router = useRouter()

// 用户信息
const username = computed(() => store.state.user?.username || '管理员')

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

// 确保导航栏固定的滚动处理
const handleScroll = () => {
  // 确保导航栏始终固定在顶部
  const header = document.querySelector('.admin-header')
  if (header) {
    header.style.position = 'fixed'
    header.style.top = '0'
    header.style.zIndex = '1000'
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('scroll', handleScroll, { passive: true })
  // 初始化时确保样式正确
  handleScroll()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
// 颜色变量
$primary: #409eff;
$danger: #f56c6c;
$text: #333;
$light: #f8f9fc;
$border: #ebeef5;

// 管理员端顶部导航栏样式
.admin-header {
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
  width: 100%;
  height: 72px; // 固定高度
  box-sizing: border-box;
  z-index: 1000;
  // 确保在滚动时保持固定
  transform: translateZ(0); // 启用硬件加速
  will-change: transform; // 优化性能
  // 防止在某些浏览器中出现滚动问题
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  // 确保在所有设备上都能正确固定
  -webkit-position: fixed;
  -moz-position: fixed;
  -ms-position: fixed;
  -o-position: fixed;

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 600;

    .hospital-symbol {
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
  .admin-header {
    padding: 12px 20px;

    .logo {
      font-size: 18px;
      gap: 8px;

      .hospital-symbol {
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
  .admin-header {
    .user-info {
      .name {
        display: none;
      }
    }
  }
}
</style>

<!-- 全局样式确保固定导航栏正常工作 -->
<style lang="scss">
// 确保body和html不会影响固定定位
html, body {
  margin: 0;
  padding: 0;
  position: relative;
}

// 确保页面内容不会被固定导航栏遮挡
body {
  padding-top: 0 !important;
  margin-top: 0 !important;
}

// 确保所有容器都正确处理固定导航栏
.admin-header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000 !important;
}
</style>
