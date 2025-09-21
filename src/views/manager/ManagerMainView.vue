<template>
  <div class="manager-home">
    <!-- 顶部导航栏 -->
    <AdminHeader 
      title="医院管理系统"
      :notification-count="3"
      @notification-click="handleNotificationClick"
      @profile-click="handleProfileClick"
      @settings-click="handleSettingsClick"
    />

    <!-- 主体布局 -->
    <div class="main-layout">
      <!-- 左侧菜单 - 使用SideLeft组件 -->
      <SideLeft :activeMenu="'dashboard'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>系统概览</h1>
          <p>2025年9月20日，星期六</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">🏥</div>
            <div class="card-info">
              <h3>科室总数</h3>
              <p class="number">{{ totalDepartments }}</p>
              <p class="desc">已创建科室</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">🚪</div>
            <div class="card-info">
              <h3>诊室总数</h3>
              <p class="number">{{ totalRooms }}</p>
              <p class="desc">可用诊室</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">👨‍⚕️</div>
            <div class="card-info">
              <h3>医生总数</h3>
              <p class="number">{{ totalDoctors }}</p>
              <p class="desc">注册医生</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">⏳</div>
            <div class="card-info">
              <h3>待审核</h3>
              <p class="number">{{ pendingDoctors }}</p>
              <p class="desc">待审核医生</p>
            </div>
          </div>
        </div>

        <!-- 新增：护士总数卡片 -->
        <div class="card">
          <div class="card-icon bg-teal">👩‍⚕️</div>
          <div class="card-info">
            <h3>护士总数</h3>
            <p class="number">{{ totalNurses }}</p>
            <p class="desc">注册护士</p>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="createDepartment">
            <span class="icon">+</span> 新建科室
          </button>
          <button class="action-btn outline" @click="createRoom">
            <span class="icon">+</span> 新建诊室
          </button>
          <button class="action-btn outline" @click="createDoctor">
            <span class="icon">+</span> 新建医生
          </button>
          <button class="action-btn outline" @click="exportData">
            <span class="icon">📤</span> 导出数据
          </button>
        </div>

        <!-- 系统通知 -->
        <div class="system-notifications">
          <div class="notification-header">
            <h2>系统通知</h2>
            <button class="view-all-btn" @click="viewAllNotifications">
              <span>查看全部</span>
              <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
          
          <div class="notification-list">
            <div v-for="notification in notifications" :key="notification.id" class="notification-item">
              <div class="notification-icon" :class="notification.type">
                <span v-if="notification.type === 'warning'">⚠️</span>
                <span v-else>ℹ️</span>
              </div>
              <div class="notification-content">
                <h3>{{ notification.title }}</h3>
                <p>{{ notification.message }}</p>
                <div class="notification-meta">
                  <span class="time">{{ notification.time }}</span>
                  <span v-if="notification.action" class="action" @click="handleAction(notification)">{{ notification.action }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近操作 -->
        <div class="recent-operations">
          <div class="operations-header">
            <h2>最近操作</h2>
            <button class="view-all-btn" @click="viewAllOperations">
              <span>查看全部</span>
              <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
          
          <div class="operations-list">
            <div v-for="operation in recentOperations" :key="operation.id" class="operation-item">
              <div class="operation-icon" :class="operation.type">
                <span v-if="operation.type === 'department'">🏥</span>
                <span v-else-if="operation.type === 'doctor'">👨‍⚕️</span>
                <span v-else-if="operation.type === 'room'">🚪</span>
                <span v-else>🔄</span>
              </div>
              <div class="operation-content">
                <h3>{{ operation.title }}</h3>
                <p>{{ operation.description }}</p>
                <div class="operation-meta">
                  <span class="time">{{ operation.time }}</span>
                  <span class="user">操作人: {{ operation.user }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElNotification, ElMessage } from 'element-plus'
import { onUnmounted } from 'vue'
import SideLeft from '@/components/manager/SideLeft.vue'
import AdminHeader from '@/components/manager/AdminHeader.vue'

// 状态
const dropdownVisible = ref(false)
const store = useStore()

// 用户名
let username = store.state.user.username

// 数据模拟
const totalDepartments = ref(24)
const totalRooms = ref(48)
const totalDoctors = ref(152)
const pendingDoctors = ref(8)
// 新增：护士数据
const totalNurses = ref(85)  // 示例数据

const notifications = ref([
  {
    id: 1,
    title: "新医生申请",
    message: "张明医生提交了注册申请，等待审核",
    time: "10:30",
    type: "warning",
    action: "审核"
  },
  {
    id: 2,
    title: "系统维护通知",
    message: "系统将于今晚23:00进行例行维护，预计1小时",
    time: "09:15",
    type: "info",
    action: "查看详情"
  },
  {
    id: 3,
    title: "诊室空闲率",
    message: "心内科诊室空闲率超过70%，建议调整排班",
    time: "08:45",
    type: "info"
  }
])

const recentOperations = ref([
  {
    id: 1,
    title: "新建科室",
    description: "新增了'康复医学科'科室",
    time: "昨天 15:30",
    type: "department",
    user: "管理员1"
  },
  {
    id: 2,
    title: "医生审核",
    description: "审核通过李华医生的注册申请",
    time: "昨天 14:15",
    type: "doctor",
    user: "管理员1"
  },
  {
    id: 3,
    title: "新建诊室",
    description: "在门诊楼3层新增了5间诊室",
    time: "昨天 11:20",
    type: "room",
    user: "管理员2"
  },
  {
    id: 4,
    title: "系统配置",
    description: "更新了预约系统参数",
    time: "昨天 09:45",
    type: "system",
    user: "系统管理员"
  }
])

// 路由与操作
const router = useRouter()
const logout = () => {
  localStorage.clear()
  router.push('/login')
}

// 顶部导航栏事件处理
const handleNotificationClick = () => {
  ElMessage.info('查看通知功能')
}

const handleProfileClick = () => {
  ElMessage.info('个人资料功能开发中...')
}

const handleSettingsClick = () => {
  ElMessage.info('设置功能开发中...')
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

// 操作处理
const createDepartment = () => {
  ElMessage.success('跳转至新建科室页面')
}

const createRoom = () => {
  ElMessage.success('跳转至新建诊室页面')
}

const createDoctor = () => {
  ElMessage.success('跳转至新建医生页面')
}

const exportData = () => {
  ElMessage.success('数据导出成功')
}

const handleAction = (notification) => {
  if (notification.action === '审核') {
    ElMessage.info('跳转至医生审核页面')
  } else if (notification.action === '查看详情') {
    ElMessage.info('查看系统维护详情')
  }
}

const viewAllNotifications = () => {
  ElMessage.info('查看全部系统通知')
}

const viewAllOperations = () => {
  ElMessage.info('查看全部操作记录')
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
$teal: #2d8c99;

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

.manager-home {
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
  min-height: calc(100vh - 72px);
  padding-top: 72px; // 为AdminHeader留出空间
}

// 主内容区
.content {
  flex: 1;
  margin-left: 260px; // 为SideLeft组件留出空间
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
      display: flex;
      align-items: center;
      gap: 8px;

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

      .icon {
        font-size: 16px;
      }
    }
  }

  // 系统通知
  .system-notifications {
    @include card;
    margin-bottom: 30px;

    .notification-header {
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

    .notification-list {
      .notification-item {
        display: flex;
        padding: 16px 0;
        border-bottom: 1px solid $border;

        &:last-child { border: none; }

        .notification-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 18px;

          &.warning { background: rgba($warning, 0.2); color: $warning; }
          &.info { background: rgba($primary, 0.2); color: $primary; }
        }

        .notification-content {
          flex: 1;
          h3 {
            margin: 0 0 4px 0;
            font-size: 15px;
            color: $text;
          }
          p {
            margin: 0 0 8px 0;
            color: #666;
            font-size: 13px;
          }
          .notification-meta {
            display: flex;
            justify-content: space-between;
            color: #999;
            font-size: 12px;
            .time { font-weight: 500; }
            .action {
              color: $primary;
              cursor: pointer;
              &:hover { text-decoration: underline; }
            }
          }
        }
      }
    }
  }

  // 最近操作
  .recent-operations {
    @include card;

    .operations-header {
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

    .operations-list {
      .operation-item {
        display: flex;
        padding: 16px 0;
        border-bottom: 1px solid $border;

        &:last-child { border: none; }

        .operation-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 18px;

          &.department { background: rgba($primary, 0.2); color: $primary; }
          &.doctor { background: rgba($success, 0.2); color: $success; }
          &.room { background: rgba($warning, 0.2); color: $warning; }
          &.system { background: rgba($purple, 0.2); color: $purple; }
        }

        .operation-content {
          flex: 1;
          h3 {
            margin: 0 0 4px 0;
            font-size: 15px;
            color: $text;
          }
          p {
            margin: 0 0 8px 0;
            color: #666;
            font-size: 13px;
          }
          .operation-meta {
            display: flex;
            justify-content: space-between;
            color: #999;
            font-size: 12px;
            .time { font-weight: 500; }
            .user { color: #666; }
          }
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