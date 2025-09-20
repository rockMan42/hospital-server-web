<template>
  <div class="doctor-home">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="logo">
        <div class="medical-symbol">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V2M12 22V20M4 12H2M6.31 6.31L4.9 4.9M17.69 6.31L19.1 4.9M6.31 17.69L4.9 19.1M17.69 17.69L19.1 19.1M22 12H20M16 12H8M12 16V8"
                  stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span>YiLiao 医生端</span>
      </div>

      <div class="header-right">
        <div class="notifications">
          <span>🔔</span>
          <span class="badge">3</span>
        </div>
        <div class="user-info" @click="toggleDropdown">
          <span class="name">{{ username }} 主治医师</span>
          <span class="arrow">▼</span>
        </div>
        <div v-if="dropdownVisible" class="dropdown-menu">
          <a href="#">个人资料</a>
          <a href="#">设置</a>
          <a href="#" @click.prevent="logout">退出登录</a>
        </div>
      </div>
    </header>

    <!-- 主体布局 -->
    <div class="main-layout">
      <!-- 左侧菜单 -->
      <aside class="sidebar">
        <nav class="menu">
          <div class="menu-title">核心功能</div>
          <a href="#" class="menu-item active">
            <span class="icon">📅</span>
            <span>今日预约</span>
          </a>
          <a href="#" class="menu-item">
            <span class="icon">👥</span>
            <span>患者管理</span>
          </a>
          <a href="#" class="menu-item">
            <span class="icon">📝</span>
            <span>病历记录</span>
          </a>
          <a href="#" class="menu-item">
            <span class="icon">📊</span>
            <span>工作统计</span>
          </a>

          <div class="menu-title">系统设置</div>
          <a href="#" class="menu-item">
            <span class="icon">⚙️</span>
            <span>账户设置</span>
          </a>
          <a href="#" class="menu-item">
            <span class="icon">❓</span>
            <span>帮助中心</span>
          </a>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>今日工作概览</h1>
          <p>2025年9月20日，星期六</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">📅</div>
            <div class="card-info">
              <h3>今日预约</h3>
              <p class="number">{{ totalAppointments }}</p>
              <p class="desc">待接诊</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">✅</div>
            <div class="card-info">
              <h3>已完成</h3>
              <p class="number">{{ completedCount }}</p>
              <p class="desc">今日已完成诊疗</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">⏳</div>
            <div class="card-info">
              <h3>待跟进</h3>
              <p class="number">{{ pendingFollowUp }}</p>
              <p class="desc">需复诊患者</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">🚨</div>
            <div class="card-info">
              <h3>紧急预约</h3>
              <p class="number">{{ urgentCount }}</p>
              <p class="desc">需优先处理</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary">新增患者</button>
          <button class="action-btn outline">查看病历</button>
          <button class="action-btn outline">导出报表</button>
        </div>

        <!-- 今日预约列表 -->
        <div class="recent-appointments">
            <div class="list-header">
              <h2>今日预约</h2>
              <button class="view-all-btn" @click="viewAll">
                <span>查看全部</span>
                <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

          <!-- 新增：叫号面板 -->
          <div class="call-panel">
            <div class="call-info">
              <div class="current-patient">
                <template v-if="pendingPatients.length === 0">
                  今日无待就诊患者
                </template>
                <template v-else-if="currentCallIndex < pendingPatients.length">
                  当前叫号：{{ pendingPatients[currentCallIndex].name }}
                </template>
                <template v-else>
                  所有患者已处理完毕
                </template>
              </div>
              <div class="current-time">{{ currentTime }}</div>
            </div>
            <div class="call-controls">
              <button
                class="call-btn primary"
                @click="callNextPatient"
                :disabled="pendingPatients.length === 0 || currentCallIndex >= pendingPatients.length"
              >
                叫号
              </button>
              <button
                class="call-btn outline"
                @click="nextPatient"
                :disabled="currentCallIndex >= pendingPatients.length - 1"
              >
                下一号
              </button>
            </div>
          </div>

          <!-- 预约列表 -->
          <div class="appointment-list">
            <div
              v-for="item in appointmentList"
              :key="item.id"
              class="appointment-item"
            >
              <div class="patient-info">
                <strong>{{ item.name }}</strong>
                <span>{{ item.gender }}，{{ item.age }}岁</span>
              </div>
              <div class="time">{{ item.time }}</div>
              <div class="status" :class="item.status">
                {{
                  item.status === 'pending' ? '待就诊' :
                  item.status === 'in-progress' ? '进行中' :
                  '已完成'
                }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElNotification, ElMessage } from 'element-plus'

// 状态
const dropdownVisible = ref(false)
const currentCallIndex = ref(0)
const store = useStore()

let username = store.state.user.username;
// 当前时间（模拟）
const currentTime = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

// 预约列表数据
const appointmentList = ref([
  { id: 1, name: '张三', gender: '男', age: 32, time: '10:30', status: 'completed' },
  { id: 2, name: '李四', gender: '女', age: 28, time: '10:40', status: 'completed' },
  { id: 3, name: '王五', gender: '男', age: 45, time: '10:50', status: 'pending' },
  { id: 4, name: '赵六', gender: '女', age: 35, time: '11:00', status: 'pending' },
  { id: 5, name: '赵好', gender: '男', age: 50, time: '11:10', status: 'pending' }
])

// 计算属性
const pendingPatients = computed(() => {
  return appointmentList.value.filter(item => item.status === 'pending')
})

const totalAppointments = computed(() => appointmentList.value.length)
const completedCount = computed(() => appointmentList.value.filter(p => p.status === 'completed').length)
const pendingFollowUp = computed(() => 4) // 示例
const urgentCount = computed(() => 1) // 示例

// 路由与退出
const router = useRouter()
const logout = () => {
  localStorage.clear()
  router.push('/login')
}

// 切换下拉菜单
const toggleDropdown = (event) => {
  dropdownVisible.value = !dropdownVisible.value
  event.stopPropagation()
}

onMounted(() => {
  document.addEventListener('click', () => (dropdownVisible.value = false))
})
onUnmounted(() => {
  document.removeEventListener('click', () => (dropdownVisible.value = false))
})

// 查看全部
const viewAll = () => {
  console.log('查看全部预约')
}

// 语音合成函数（优先使用本地服务，失败则降级）
const speak = async (text) => {
  try {
    const response = await fetch(`http://127.0.0.1:9882/kokoro?text=${encodeURIComponent(text)}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audio.play()
  } catch (error) {
    console.error('本地语音服务失败:', error)
    ElMessage.warning('使用浏览器语音播报')

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      speechSynthesis.speak(utterance)
    } else {
      ElMessage.info('您的浏览器不支持语音功能')
    }
  }
}

// 叫号逻辑
const callNextPatient = () => {
  const list = pendingPatients.value
  if (currentCallIndex.value >= list.length) {
    ElMessage.info('所有待就诊患者已处理完毕')
    return
  }

  const patient = list[currentCallIndex.value]
  const message = `请 ${patient.name} 到1号诊室就诊`

  // 更新状态为“进行中”
  const target = appointmentList.value.find(p => p.id === patient.id)
  if (target) target.status = 'in-progress'

  // 弹出通知
  ElNotification({
    title: '叫号成功',
    message,
    type: 'success',
    duration: 3000
  })

  // 语音播报
  speak(message)

  // 自动进入下一号（可选）
  // setTimeout(() => nextPatient(), 1500)
}

// 手动点击“下一号”
const nextPatient = () => {
  if (currentCallIndex.value < pendingPatients.value.length - 1) {
    currentCallIndex.value++
  } else {
    ElMessage.success('所有患者已处理完毕！')
  }
}
</script>

<style scoped lang="scss">
// 颜色变量
$primary: #409eff;
$success: #67c23a;
$warning: #e6a23c;
$danger: #f56c6c;
$purple: #9a66e4;
$text: #333;
$light: #f8f9fc;
$border: #ebeef5;

// 查看全部按钮样式
.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  // 悬停效果
  &:hover {
    border-color: $primary;
    color: $primary;
    background-color: rgba($primary, 0.05);

    .arrow-icon {
      transform: translateX(4px);
    }
  }

  // 按下效果
  &:active {
    transform: translateY(1px);
  }

  // 图标动效
  .arrow-icon {
    transition: transform 0.3s ease;
    width: 14px;
    height: 14px;
  }
}

// 混合：卡片样式
@mixin card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.doctor-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 50%, #d1edff 100%);
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

// 顶部导航
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 30px;
  background: $primary;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;

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

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;

    .notifications {
      position: relative;
      font-size: 20px;
      cursor: pointer;
      .badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background: $danger;
        color: white;
        font-size: 12px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      .arrow {
        font-size: 12px;
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

      a {
        display: block;
        padding: 12px 20px;
        color: $text;
        text-decoration: none;
        border-bottom: 1px solid $border;
        &:last-child { border: none; }
        &:hover { background: $light; }
      }
    }
  }
}

// 主体布局
.main-layout {
  display: flex;
  min-height: calc(100vh - 60px);
}

// 侧边栏
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid $border;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 30px 0;

  .menu {
    .menu-title {
      padding: 12px 24px;
      color: #666;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 16px;
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
      }
    }
  }
}

// 主内容区
.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;

  .page-header {
    margin-bottom: 30px;
    h1 {
      font-size: 28px;
      color: $text;
      margin: 0 0 8px 0;
      font-weight: 600;
    }
    p {
      color: #666;
      font-size: 15px;
    }
  }

  // 统计卡片
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .card {
      @include card;
      display: flex;
      align-items: center;
      gap: 16px;

      &-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;

        &.bg-blue { background: rgba($primary, 0.1); color: $primary; }
        &.bg-green { background: rgba($success, 0.1); color: $success; }
        &.bg-orange { background: rgba($warning, 0.1); color: $warning; }
        &.bg-purple { background: rgba($purple, 0.1); color: $purple; }
      }

      &-info {
        h3 {
          margin: 0 0 4px 0;
          font-size: 15px;
          color: #555;
        }
        .number {
          font-size: 24px;
          font-weight: 600;
          color: $text;
          margin: 0;
        }
        .desc {
          margin: 0;
          font-size: 13px;
          color: #999;
        }
      }
    }
  }

  // 快捷操作
  .quick-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 30px;
    flex-wrap: wrap;

    .action-btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &.primary {
        background: $primary;
        color: white;
        border: none;
        &:hover { background: #66b1ff; }
      }

      &.outline {
        background: white;
        color: $primary;
        border: 2px solid $primary;
        &:hover { background: #e6f7ff; }
      }
    }
  }

  // 预约列表
  .recent-appointments {
    @include card;
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    h2 {
      margin: 0;
      font-size: 18px;
      color: $text;
    }

    .call-panel {
      background: rgba($primary, 0.08);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      border: 1px solid rgba($primary, 0.2);

      .call-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;

        .current-patient {
          font-weight: 600;
          color: $primary;
          font-size: 16px;
        }

        .current-time {
          color: $primary;
          font-weight: 500;
        }
      }

      .call-controls {
        display: flex;
        gap: 10px;

        .call-btn {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;

          &.primary {
            background: $primary;
            color: white;
            border: none;
            &:hover { background: rgba(79, 172, 254, 0.9); }
          }

          &.outline {
            background: white;
            color: $primary;
            border: 1px solid $primary;
            &:hover { background: rgba($primary, 0.1); }
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }

    .appointment-list {
      .appointment-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px dashed $border;

        &:last-child { border: none; }

        .patient-info {
          display: flex;
          flex-direction: column;
          strong {
            font-size: 15px;
            color: $text;
          }
          span {
            font-size: 13px;
            color: #666;
          }
        }

        .time {
          font-weight: 600;
          color: #333;
        }

        .status {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;

          &.pending { background: #fef0f0; color: $danger; }
          &.completed { background: #e9f7ef; color: $success; }
          &.in-progress { background: #fff3e0; color: $warning; }
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid $border;
  }
  .content {
    padding: 20px;
  }
}
</style>