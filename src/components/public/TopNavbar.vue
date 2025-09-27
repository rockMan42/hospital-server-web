<template>
  <!-- 公共设备端顶部导航栏 -->
  <header class="top-navbar">
    <div class="logo">
      <div class="medical-symbol">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span>{{ title }}</span>
    </div>

    <div class="header-center">
      <div class="current-time">{{ currentTime }}</div>
    </div>

    <div class="header-right">
      <div class="system-status" :class="systemStatusClass">
        <span class="status-dot"></span>
        <span class="status-text">{{ systemStatusText }}</span>
      </div>
      <div class="language-switch" @click="handleLanguageSwitch">
        <span>🌐</span>
        <span>{{ currentLanguage }}</span>
      </div>
      <div class="help-btn" @click="handleHelp">
        <span>❓</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '自助服务终端'
  },
  systemStatus: {
    type: String,
    default: 'online' // online, offline, maintenance
  }
})

// Emits
const emit = defineEmits(['language-switch', 'help-click', 'status-change'])

// 状态管理
const currentTime = ref('')
const currentLanguage = ref('中文')
const languages = ['中文', 'English']
let timeInterval = null

// 系统状态计算属性
const systemStatusClass = computed(() => {
  return {
    'status-online': props.systemStatus === 'online',
    'status-offline': props.systemStatus === 'offline',
    'status-maintenance': props.systemStatus === 'maintenance'
  }
})

const systemStatusText = computed(() => {
  const statusMap = {
    'online': '系统正常',
    'offline': '系统离线',
    'maintenance': '维护中'
  }
  return statusMap[props.systemStatus] || '未知状态'
})

// 时间更新
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short'
  })
}

// 方法
const handleLanguageSwitch = () => {
  const currentIndex = languages.indexOf(currentLanguage.value)
  const nextIndex = (currentIndex + 1) % languages.length
  currentLanguage.value = languages[nextIndex]
  
  emit('language-switch', currentLanguage.value)
  ElMessage.success(`已切换到${currentLanguage.value}`)
}

const handleHelp = () => {
  emit('help-click')
  ElMessage.info('帮助功能')
}

// 生命周期
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped lang="scss">
// 颜色变量
$primary: #1a75bc;
$success: #67c23a;
$warning: #e6a23c;
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
  background: linear-gradient(135deg, $primary 0%, #0c4d8c 100%);
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

    .medical-symbol {
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

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;

    .current-time {
      font-size: 16px;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.1);
      padding: 8px 16px;
      border-radius: 20px;
      backdrop-filter: blur(5px);
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .system-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.1);
      font-size: 14px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      &.status-online .status-dot {
        background: $success;
      }

      &.status-offline .status-dot {
        background: $danger;
      }

      &.status-maintenance .status-dot {
        background: $warning;
      }
    }

    .language-switch {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      transition: background-color 0.3s ease;
      font-size: 14px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .help-btn {
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background-color 0.3s ease;
      font-size: 18px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

// 状态指示器动画
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .top-navbar {
    padding: 12px 20px;

    .logo {
      font-size: 18px;
      gap: 8px;

      .medical-symbol {
        width: 36px;
        height: 36px;
        
        svg {
          width: 18px;
          height: 18px;
        }
      }
    }

    .header-center {
      .current-time {
        font-size: 14px;
        padding: 6px 12px;
      }
    }

    .header-right {
      gap: 12px;

      .system-status {
        .status-text {
          display: none;
        }
      }

      .language-switch {
        span:last-child {
          display: none;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .top-navbar {
    .header-center {
      display: none;
    }

    .header-right {
      .system-status {
        padding: 4px 8px;
      }
    }
  }
}
</style>
