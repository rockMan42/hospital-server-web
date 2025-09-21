<template>
  <div class="nurse-home">
    <!-- 顶部导航栏 -->
    <TopNavbar 
      :notification-count="5"
      @notification-click="handleNotificationClick"
      @profile-click="handleProfileClick"
      @settings-click="handleSettingsClick"
    />

    <!-- 主体布局 -->
    <div class="main-layout">
      <!-- 左侧菜单 - 使用SideLeft组件 -->
      <SideLeft :activeMenu="'workbench'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>护士工作台</h1>
          <p>{{ currentDate }}，{{ currentWeekday }}</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">🏥</div>
            <div class="card-info">
              <h3>病房管理</h3>
              <p class="number">{{ totalRooms }}</p>
              <p class="desc">负责病房数</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">👥</div>
            <div class="card-info">
              <h3>在院患者</h3>
              <p class="number">{{ totalPatients }}</p>
              <p class="desc">当前护理患者</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">💊</div>
            <div class="card-info">
              <h3>用药提醒</h3>
              <p class="number">{{ medicationReminders }}</p>
              <p class="desc">待执行用药</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">🚨</div>
            <div class="card-info">
              <h3>紧急护理</h3>
              <p class="number">{{ urgentCareCount }}</p>
              <p class="desc">需优先处理</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="addVitalSigns">记录生命体征</button>
          <button class="action-btn outline" @click="viewMedications">查看用药记录</button>
          <button class="action-btn outline" @click="exportReport">导出护理报表</button>
        </div>

        <!-- 患者护理管理列表 -->
        <div class="patient-care-management">
          <div class="list-header">
            <h2>患者护理管理</h2>
            <button class="view-all-btn" @click="viewAll">
              <span>查看全部</span>
              <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <!-- 护理提醒面板 -->
          <div class="care-panel">
            <div class="care-info">
              <div class="current-task">
                <template v-if="pendingTasks.length === 0">
                  当前无待处理护理任务
                </template>
                <template v-else-if="currentTaskIndex < pendingTasks.length">
                  当前任务：{{ pendingTasks[currentTaskIndex].patientName }} - {{ pendingTasks[currentTaskIndex].taskType }}
                </template>
                <template v-else>
                  所有护理任务已完成
                </template>
              </div>
              <div class="current-time">{{ currentTime }}</div>
            </div>
            <div class="care-controls">
              <button
                class="care-btn primary"
                @click="startCareTask"
                :disabled="pendingTasks.length === 0 || currentTaskIndex >= pendingTasks.length"
              >
                开始护理
              </button>
              <button
                class="care-btn outline"
                @click="completeTask"
                :disabled="currentTaskIndex >= pendingTasks.length"
              >
                完成任务
              </button>
            </div>
          </div>

          <!-- 患者护理列表 -->
          <div class="patient-list">
            <div
              v-for="patient in patientList"
              :key="patient.id"
              class="patient-item"
              :class="{ urgent: patient.priority === 'urgent' }"
            >
              <div class="patient-info">
                <div class="patient-basic">
                  <strong>{{ patient.name }}</strong>
                  <span class="room-info">{{ patient.room }}床</span>
                  <span class="patient-details">{{ patient.gender }}，{{ patient.age }}岁</span>
                </div>
                <div class="diagnosis">{{ patient.diagnosis }}</div>
              </div>
              
              <div class="care-status">
                <div class="vital-signs">
                  <span class="vital-item">体温: {{ patient.temperature }}°C</span>
                  <span class="vital-item">血压: {{ patient.bloodPressure }}</span>
                  <span class="vital-item">心率: {{ patient.heartRate }}次/分</span>
                </div>
                <div class="last-care">上次护理: {{ patient.lastCareTime }}</div>
              </div>

              <div class="care-actions">
                <div class="priority-badge" :class="patient.priority">
                  {{ getPriorityText(patient.priority) }}
                </div>
                <div class="action-buttons">
                  <button class="action-btn-mini primary" @click="recordVitals(patient)" title="记录生命体征">
                    📊
                  </button>
                  <button class="action-btn-mini outline" @click="viewCareHistory(patient)" title="查看护理记录">
                    📋
                  </button>
                  <button class="action-btn-mini medication" @click="manageMedication(patient)" title="用药管理">
                    💊
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 今日护理任务 -->
        <div class="daily-tasks">
          <div class="task-header">
            <h2>今日护理任务</h2>
            <span class="task-count">{{ completedTasks }}/{{ totalTasks }} 已完成</span>
          </div>
          
          <div class="task-list">
            <div
              v-for="task in dailyTaskList"
              :key="task.id"
              class="task-item"
              :class="{ completed: task.completed }"
            >
              <div class="task-checkbox">
                <input 
                  type="checkbox" 
                  :checked="task.completed" 
                  @change="toggleTask(task.id)"
                  :id="`task-${task.id}`"
                >
                <label :for="`task-${task.id}`"></label>
              </div>
              
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-details">
                  <span class="task-time">{{ task.scheduledTime }}</span>
                  <span class="task-patient">{{ task.patientName }}</span>
                  <span class="task-room">{{ task.room }}床</span>
                </div>
              </div>
              
              <div class="task-status">
                <span class="status-badge" :class="task.completed ? 'completed' : 'pending'">
                  {{ task.completed ? '已完成' : '待执行' }}
                </span>
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
import SideLeft from '@/components/nurse/SideLeft.vue'
import TopNavbar from '@/components/nurse/TopNavbar.vue'

const store = useStore()
const router = useRouter()

// 当前任务索引
const currentTaskIndex = ref(0)

// 当前时间和日期
const currentTime = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
const currentDate = ref(new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }))
const currentWeekday = ref(new Date().toLocaleDateString('zh-CN', { weekday: 'long' }))

// 统计数据
const totalRooms = ref(12)
const totalPatients = ref(28)
const medicationReminders = ref(15)
const urgentCareCount = ref(3)

// 患者护理列表数据
const patientList = ref([
  {
    id: 1,
    name: '张三',
    gender: '男',
    age: 65,
    room: '301-1',
    diagnosis: '高血压、糖尿病',
    temperature: 36.8,
    bloodPressure: '140/90',
    heartRate: 78,
    lastCareTime: '2小时前',
    priority: 'normal'
  },
  {
    id: 2,
    name: '李四',
    gender: '女',
    age: 58,
    room: '301-2',
    diagnosis: '冠心病',
    temperature: 37.2,
    bloodPressure: '150/95',
    heartRate: 85,
    lastCareTime: '1小时前',
    priority: 'urgent'
  },
  {
    id: 3,
    name: '王五',
    gender: '男',
    age: 72,
    room: '302-1',
    diagnosis: '肺炎',
    temperature: 38.1,
    bloodPressure: '130/80',
    heartRate: 92,
    lastCareTime: '30分钟前',
    priority: 'urgent'
  },
  {
    id: 4,
    name: '赵六',
    gender: '女',
    age: 45,
    room: '302-2',
    diagnosis: '胃溃疡',
    temperature: 36.5,
    bloodPressure: '120/75',
    heartRate: 68,
    lastCareTime: '3小时前',
    priority: 'normal'
  },
  {
    id: 5,
    name: '陈七',
    gender: '男',
    age: 68,
    room: '303-1',
    diagnosis: '脑梗塞恢复期',
    temperature: 36.9,
    bloodPressure: '135/85',
    heartRate: 75,
    lastCareTime: '1.5小时前',
    priority: 'high'
  }
])

// 今日护理任务列表
const dailyTaskList = ref([
  {
    id: 1,
    title: '测量生命体征',
    scheduledTime: '08:00',
    patientName: '张三',
    room: '301-1',
    completed: true
  },
  {
    id: 2,
    title: '静脉输液',
    scheduledTime: '09:00',
    patientName: '李四',
    room: '301-2',
    completed: true
  },
  {
    id: 3,
    title: '口服药物管理',
    scheduledTime: '10:00',
    patientName: '王五',
    room: '302-1',
    completed: false
  },
  {
    id: 4,
    title: '伤口换药',
    scheduledTime: '11:00',
    patientName: '赵六',
    room: '302-2',
    completed: false
  },
  {
    id: 5,
    title: '康复训练指导',
    scheduledTime: '14:00',
    patientName: '陈七',
    room: '303-1',
    completed: false
  },
  {
    id: 6,
    title: '血糖监测',
    scheduledTime: '16:00',
    patientName: '张三',
    room: '301-1',
    completed: false
  }
])

// 待处理护理任务
const pendingTasks = computed(() => {
  return dailyTaskList.value.filter(task => !task.completed).map(task => ({
    ...task,
    patientName: task.patientName,
    taskType: task.title
  }))
})

// 计算属性
const completedTasks = computed(() => dailyTaskList.value.filter(task => task.completed).length)
const totalTasks = computed(() => dailyTaskList.value.length)

// 生命周期钩子
onMounted(() => {
  // 每分钟更新时间
  const timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, 60000)
  
  onUnmounted(() => {
    clearInterval(timer)
  })
})

// 事件处理方法
const handleNotificationClick = () => {
  ElMessage.info('查看通知功能')
}

const handleProfileClick = () => {
  ElMessage.info('个人资料功能开发中...')
}

const handleSettingsClick = () => {
  ElMessage.info('设置功能开发中...')
}

// 快捷操作方法
const addVitalSigns = () => {
  ElMessage.success('打开生命体征记录界面')
}

const viewMedications = () => {
  ElMessage.info('查看用药记录功能开发中...')
}

const exportReport = () => {
  ElMessage.success('正在导出护理报表...')
  setTimeout(() => {
    ElNotification({
      title: '导出完成',
      message: '护理报表已导出到下载目录',
      type: 'success'
    })
  }, 1500)
}

const viewAll = () => {
  ElMessage.info('查看全部患者护理记录')
}

// 护理任务相关方法
const startCareTask = () => {
  if (currentTaskIndex.value >= pendingTasks.value.length) {
    ElMessage.info('所有护理任务已完成')
    return
  }

  const task = pendingTasks.value[currentTaskIndex.value]
  const message = `开始执行护理任务：${task.patientName} - ${task.taskType}`

  ElNotification({
    title: '开始护理',
    message,
    type: 'info',
    duration: 3000
  })

  ElMessage.success(`正在为 ${task.patientName} 执行 ${task.taskType}`)
}

const completeTask = () => {
  if (currentTaskIndex.value >= pendingTasks.value.length) {
    ElMessage.info('没有待完成的任务')
    return
  }

  const task = pendingTasks.value[currentTaskIndex.value]
  
  // 在原始任务列表中找到对应任务并标记为完成
  const originalTask = dailyTaskList.value.find(t => t.id === task.id)
  if (originalTask) {
    originalTask.completed = true
  }

  ElNotification({
    title: '任务完成',
    message: `${task.patientName} 的 ${task.taskType} 已完成`,
    type: 'success',
    duration: 3000
  })

  // 自动移到下一个任务
  if (currentTaskIndex.value < pendingTasks.value.length - 1) {
    currentTaskIndex.value++
  }
}

// 患者相关操作方法
const getPriorityText = (priority) => {
  const priorityMap = {
    normal: '普通',
    high: '重要',
    urgent: '紧急'
  }
  return priorityMap[priority] || '普通'
}

const recordVitals = (patient) => {
  ElMessage.success(`记录 ${patient.name} 的生命体征`)
}

const viewCareHistory = (patient) => {
  ElMessage.info(`查看 ${patient.name} 的护理记录`)
}

const manageMedication = (patient) => {
  ElMessage.info(`管理 ${patient.name} 的用药`)
}

// 任务管理方法
const toggleTask = (taskId) => {
  const task = dailyTaskList.value.find(t => t.id === taskId)
  if (task) {
    task.completed = !task.completed
    const status = task.completed ? '完成' : '取消完成'
    ElMessage.success(`${task.title} 已${status}`)
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

.nurse-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 50%, #d1edff 100%);
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

// 主体布局
.main-layout {
  display: flex;
  min-height: calc(100vh - 72px); // 为TopNavbar留出空间
  margin-top: 72px; // 为TopNavbar留出空间
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

  // 患者护理管理
  .patient-care-management {
    @include card;
    margin-bottom: 30px;
    
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

    .care-panel {
      background: rgba($success, 0.08);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      border: 1px solid rgba($success, 0.2);

      .care-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;

        .current-task {
          font-weight: 600;
          color: $success;
          font-size: 16px;
        }

        .current-time {
          color: $success;
          font-weight: 500;
        }
      }

      .care-controls {
        display: flex;
        gap: 10px;

        .care-btn {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;

          &.primary {
            background: $success;
            color: white;
            border: none;
            &:hover { background: rgba(103, 194, 58, 0.9); }
          }

          &.outline {
            background: white;
            color: $success;
            border: 1px solid $success;
            &:hover { background: rgba($success, 0.1); }
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }

    .patient-list {
      .patient-item {
        display: grid;
        grid-template-columns: 2fr 2fr 1fr;
        gap: 20px;
        align-items: center;
        padding: 20px;
        border-bottom: 1px dashed $border;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:last-child { border: none; }

        &:hover {
          background: rgba($primary, 0.02);
          transform: translateX(4px);
        }

        &.urgent {
          border-left: 4px solid $danger;
          background: rgba($danger, 0.02);
        }

        .patient-info {
          .patient-basic {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            strong {
              font-size: 16px;
              color: $text;
            }

            .room-info {
              background: rgba($primary, 0.1);
              color: $primary;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
            }

            .patient-details {
              font-size: 13px;
              color: #666;
            }
          }

          .diagnosis {
            font-size: 14px;
            color: #555;
            font-weight: 500;
          }
        }

        .care-status {
          .vital-signs {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-bottom: 8px;

            .vital-item {
              font-size: 13px;
              color: #666;
              display: flex;
              justify-content: space-between;
            }
          }

          .last-care {
            font-size: 12px;
            color: #999;
          }
        }

        .care-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;

          .priority-badge {
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;

            &.normal { background: rgba($primary, 0.1); color: $primary; }
            &.high { background: rgba($warning, 0.1); color: $warning; }
            &.urgent { background: rgba($danger, 0.1); color: $danger; }
          }

          .action-buttons {
            display: flex;
            gap: 4px;

            .action-btn-mini {
              width: 28px;
              height: 28px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              transition: all 0.2s ease;

              &.primary {
                background: rgba($primary, 0.1);
                &:hover { background: rgba($primary, 0.2); }
              }

              &.outline {
                background: rgba($success, 0.1);
                &:hover { background: rgba($success, 0.2); }
              }

              &.medication {
                background: rgba($warning, 0.1);
                &:hover { background: rgba($warning, 0.2); }
              }
            }
          }
        }
      }
    }
  }

  // 今日护理任务
  .daily-tasks {
    @include card;

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid $border;

      h2 {
        margin: 0;
        font-size: 18px;
        color: $text;
      }

      .task-count {
        font-size: 14px;
        color: $success;
        font-weight: 600;
      }
    }

    .task-list {
      .task-item {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 16px;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px dashed $border;
        transition: all 0.3s ease;

        &:last-child { border: none; }

        &:hover {
          background: rgba($primary, 0.02);
          border-radius: 8px;
          padding: 16px;
          margin: 0 -16px;
        }

        &.completed {
          opacity: 0.6;

          .task-title {
            text-decoration: line-through;
          }
        }

        .task-checkbox {
          position: relative;

          input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: $success;
          }
        }

        .task-content {
          .task-title {
            font-size: 15px;
            font-weight: 500;
            color: $text;
            margin-bottom: 6px;
          }

          .task-details {
            display: flex;
            gap: 12px;
            font-size: 13px;
            color: #666;

            .task-time {
              font-weight: 500;
              color: $primary;
            }

            .task-patient {
              font-weight: 500;
            }

            .task-room {
              background: rgba($warning, 0.1);
              color: $warning;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
            }
          }
        }

        .task-status {
          .status-badge {
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;

            &.completed { background: rgba($success, 0.1); color: $success; }
            &.pending { background: rgba($warning, 0.1); color: $warning; }
          }
        }
      }
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .content {
    .patient-care-management .patient-list .patient-item {
      grid-template-columns: 1fr;
      gap: 16px;
      text-align: left;

      .care-actions {
        flex-direction: row;
        justify-content: space-between;
      }
    }
  }
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  
  .content {
    margin-left: 0;
    padding: 20px;

    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .quick-actions {
      .action-btn {
        flex: 1;
        justify-content: center;
      }
    }

    .patient-care-management .patient-list .patient-item {
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 16px;

      .care-status .vital-signs {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;

        .vital-item {
          font-size: 12px;
        }
      }
    }

    .daily-tasks .task-list .task-item {
      grid-template-columns: auto 1fr;
      gap: 12px;

      .task-status {
        grid-column: 2;
        justify-self: end;
      }
    }
  }
}
</style>