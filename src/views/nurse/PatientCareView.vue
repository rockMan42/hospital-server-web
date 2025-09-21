<template>
  <div class="patient-care">
    <!-- 顶部导航栏 -->
    <TopNavbar 
      :notification-count="8"
      @notification-click="handleNotificationClick"
      @profile-click="handleProfileClick"
      @settings-click="handleSettingsClick"
    />

    <!-- 主体布局 -->
    <div class="main-layout">
      <!-- 左侧菜单 - 使用SideLeft组件 -->
      <SideLeft :activeMenu="'patientcare'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>患者护理管理</h1>
          <p>{{ currentDate }}，{{ currentWeekday }} - 专业护理服务</p>
        </div>

        <!-- 护理统计卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">👥</div>
            <div class="card-info">
              <h3>在护患者</h3>
              <p class="number">{{ totalPatients }}</p>
              <p class="desc">当前负责患者</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">✅</div>
            <div class="card-info">
              <h3>今日完成</h3>
              <p class="number">{{ completedCares }}</p>
              <p class="desc">护理任务完成</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">⏰</div>
            <div class="card-info">
              <h3>待处理</h3>
              <p class="number">{{ pendingCares }}</p>
              <p class="desc">护理任务待办</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-red">🚨</div>
            <div class="card-info">
              <h3>紧急护理</h3>
              <p class="number">{{ urgentCares }}</p>
              <p class="desc">需立即处理</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="addNewCare">新增护理记录</button>
          <button class="action-btn outline" @click="batchUpdate">批量更新</button>
          <button class="action-btn outline" @click="exportCareReport">导出护理报告</button>
          <button class="action-btn outline" @click="scheduleReminder">设置提醒</button>
        </div>

        <!-- 搜索和筛选 -->
        <div class="search-filter-section">
          <div class="search-bar">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="搜索患者姓名、病房号或诊断..."
              class="search-input"
            >
            <button class="search-btn" @click="performSearch">🔍</button>
          </div>
          
          <div class="filter-options">
            <select v-model="selectedWard" class="filter-select">
              <option value="">全部病房</option>
              <option value="ICU">ICU</option>
              <option value="内科">内科病房</option>
              <option value="外科">外科病房</option>
              <option value="儿科">儿科病房</option>
            </select>
            
            <select v-model="selectedPriority" class="filter-select">
              <option value="">全部优先级</option>
              <option value="urgent">紧急</option>
              <option value="high">重要</option>
              <option value="normal">普通</option>
            </select>
            
            <select v-model="selectedStatus" class="filter-select">
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="in-progress">进行中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>

        <!-- 患者护理列表 -->
        <div class="patient-care-list">
          <div class="list-header">
            <h2>患者护理详情</h2>
            <div class="list-controls">
              <button class="view-mode-btn" :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'">
                📋 卡片视图
              </button>
              <button class="view-mode-btn" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">
                📊 表格视图
              </button>
            </div>
          </div>

          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'" class="card-view">
            <div
              v-for="patient in filteredPatients"
              :key="patient.id"
              class="patient-care-card"
              :class="{ 
                urgent: patient.priority === 'urgent',
                high: patient.priority === 'high' 
              }"
            >
              <div class="card-header">
                <div class="patient-basic-info">
                  <h3>{{ patient.name }}</h3>
                  <span class="room-badge">{{ patient.room }}</span>
                  <span class="patient-meta">{{ patient.gender }}，{{ patient.age }}岁</span>
                </div>
                <div class="priority-indicator" :class="patient.priority">
                  {{ getPriorityText(patient.priority) }}
                </div>
              </div>

              <div class="card-body">
                <div class="diagnosis-section">
                  <strong>诊断：</strong>{{ patient.diagnosis }}
                </div>
                
                <div class="vital-signs-section">
                  <h4>生命体征</h4>
                  <div class="vitals-grid">
                    <div class="vital-item">
                      <span class="vital-label">体温</span>
                      <span class="vital-value" :class="getTemperatureClass(patient.vitals.temperature)">
                        {{ patient.vitals.temperature }}°C
                      </span>
                    </div>
                    <div class="vital-item">
                      <span class="vital-label">血压</span>
                      <span class="vital-value">{{ patient.vitals.bloodPressure }}</span>
                    </div>
                    <div class="vital-item">
                      <span class="vital-label">心率</span>
                      <span class="vital-value">{{ patient.vitals.heartRate }}/分</span>
                    </div>
                    <div class="vital-item">
                      <span class="vital-label">血氧</span>
                      <span class="vital-value" :class="getOxygenClass(patient.vitals.oxygenSaturation)">
                        {{ patient.vitals.oxygenSaturation }}%
                      </span>
                    </div>
                  </div>
                </div>

                <div class="care-tasks-section">
                  <h4>护理任务</h4>
                  <div class="task-list">
                    <div 
                      v-for="task in patient.careTasks" 
                      :key="task.id"
                      class="task-item"
                      :class="{ completed: task.completed }"
                    >
                      <input 
                        type="checkbox" 
                        :checked="task.completed"
                        @change="toggleTask(patient.id, task.id)"
                      >
                      <span class="task-text">{{ task.description }}</span>
                      <span class="task-time">{{ task.scheduledTime }}</span>
                    </div>
                  </div>
                </div>

                <div class="medication-section">
                  <h4>用药记录</h4>
                  <div class="medication-list">
                    <div 
                      v-for="med in patient.medications" 
                      :key="med.id"
                      class="medication-item"
                    >
                      <span class="med-name">{{ med.name }}</span>
                      <span class="med-dosage">{{ med.dosage }}</span>
                      <span class="med-frequency">{{ med.frequency }}</span>
                      <span class="med-status" :class="med.status">{{ med.status }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <div class="last-update">
                  最后更新：{{ patient.lastUpdate }}
                </div>
                <div class="action-buttons">
                  <button class="btn-mini primary" @click="recordVitals(patient)" title="记录生命体征">
                    📊
                  </button>
                  <button class="btn-mini success" @click="addCareNote(patient)" title="添加护理记录">
                    📝
                  </button>
                  <button class="btn-mini warning" @click="manageMedication(patient)" title="用药管理">
                    💊
                  </button>
                  <button class="btn-mini info" @click="viewHistory(patient)" title="查看历史">
                    📋
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 表格视图 -->
          <div v-if="viewMode === 'table'" class="table-view">
            <table class="care-table">
              <thead>
                <tr>
                  <th>患者信息</th>
                  <th>病房</th>
                  <th>诊断</th>
                  <th>生命体征</th>
                  <th>护理任务</th>
                  <th>优先级</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="patient in filteredPatients" 
                  :key="patient.id"
                  :class="{ urgent: patient.priority === 'urgent' }"
                >
                  <td>
                    <div class="patient-info">
                      <strong>{{ patient.name }}</strong>
                      <div class="patient-details">{{ patient.gender }}，{{ patient.age }}岁</div>
                    </div>
                  </td>
                  <td>
                    <span class="room-badge">{{ patient.room }}</span>
                  </td>
                  <td>{{ patient.diagnosis }}</td>
                  <td>
                    <div class="vitals-summary">
                      <div>{{ patient.vitals.temperature }}°C</div>
                      <div>{{ patient.vitals.bloodPressure }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="task-progress">
                      {{ getCompletedTasksCount(patient.careTasks) }}/{{ patient.careTasks.length }}
                    </div>
                  </td>
                  <td>
                    <span class="priority-badge" :class="patient.priority">
                      {{ getPriorityText(patient.priority) }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="btn-mini primary" @click="recordVitals(patient)">📊</button>
                      <button class="btn-mini success" @click="addCareNote(patient)">📝</button>
                      <button class="btn-mini warning" @click="manageMedication(patient)">💊</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 护理提醒面板 -->
        <div class="care-reminder-panel">
          <div class="panel-header">
            <h2>护理提醒</h2>
            <span class="reminder-count">{{ upcomingReminders.length }} 个即将到期</span>
          </div>
          
          <div class="reminder-list">
            <div 
              v-for="reminder in upcomingReminders" 
              :key="reminder.id"
              class="reminder-item"
              :class="reminder.urgency"
            >
              <div class="reminder-time">{{ reminder.time }}</div>
              <div class="reminder-content">
                <div class="reminder-patient">{{ reminder.patientName }}</div>
                <div class="reminder-task">{{ reminder.task }}</div>
              </div>
              <div class="reminder-actions">
                <button class="btn-mini success" @click="completeReminder(reminder.id)">完成</button>
                <button class="btn-mini outline" @click="snoozeReminder(reminder.id)">稍后</button>
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

// 当前时间和日期
const currentDate = ref(new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }))
const currentWeekday = ref(new Date().toLocaleDateString('zh-CN', { weekday: 'long' }))

// 视图模式
const viewMode = ref('card')

// 搜索和筛选
const searchQuery = ref('')
const selectedWard = ref('')
const selectedPriority = ref('')
const selectedStatus = ref('')

// 统计数据
const totalPatients = ref(15)
const completedCares = ref(28)
const pendingCares = ref(12)
const urgentCares = ref(3)

// 患者护理数据
const patientList = ref([
  {
    id: 1,
    name: '张三',
    gender: '男',
    age: 65,
    room: 'ICU-301',
    diagnosis: '急性心肌梗死',
    priority: 'urgent',
    lastUpdate: '10分钟前',
    vitals: {
      temperature: 38.2,
      bloodPressure: '160/95',
      heartRate: 95,
      oxygenSaturation: 92
    },
    careTasks: [
      { id: 1, description: '测量生命体征', scheduledTime: '08:00', completed: true },
      { id: 2, description: '静脉输液', scheduledTime: '09:00', completed: true },
      { id: 3, description: '心电监护', scheduledTime: '10:00', completed: false },
      { id: 4, description: '用药观察', scheduledTime: '11:00', completed: false }
    ],
    medications: [
      { id: 1, name: '阿司匹林', dosage: '100mg', frequency: '每日一次', status: 'completed' },
      { id: 2, name: '硝酸甘油', dosage: '0.5mg', frequency: '需要时', status: 'pending' }
    ]
  },
  {
    id: 2,
    name: '李四',
    gender: '女',
    age: 58,
    room: '内科-205',
    diagnosis: '糖尿病酮症酸中毒',
    priority: 'high',
    lastUpdate: '30分钟前',
    vitals: {
      temperature: 37.8,
      bloodPressure: '140/85',
      heartRate: 88,
      oxygenSaturation: 96
    },
    careTasks: [
      { id: 1, description: '血糖监测', scheduledTime: '08:00', completed: true },
      { id: 2, description: '胰岛素注射', scheduledTime: '08:30', completed: true },
      { id: 3, description: '饮食指导', scheduledTime: '12:00', completed: false }
    ],
    medications: [
      { id: 1, name: '胰岛素', dosage: '10单位', frequency: '餐前', status: 'completed' },
      { id: 2, name: '二甲双胍', dosage: '500mg', frequency: '每日两次', status: 'pending' }
    ]
  },
  {
    id: 3,
    name: '王五',
    gender: '男',
    age: 72,
    room: '外科-108',
    diagnosis: '胆囊切除术后',
    priority: 'normal',
    lastUpdate: '1小时前',
    vitals: {
      temperature: 36.8,
      bloodPressure: '130/80',
      heartRate: 75,
      oxygenSaturation: 98
    },
    careTasks: [
      { id: 1, description: '伤口换药', scheduledTime: '09:00', completed: true },
      { id: 2, description: '下床活动', scheduledTime: '14:00', completed: false },
      { id: 3, description: '疼痛评估', scheduledTime: '16:00', completed: false }
    ],
    medications: [
      { id: 1, name: '头孢克肟', dosage: '200mg', frequency: '每日两次', status: 'completed' },
      { id: 2, name: '布洛芬', dosage: '400mg', frequency: '疼痛时', status: 'pending' }
    ]
  },
  {
    id: 4,
    name: '赵六',
    gender: '女',
    age: 45,
    room: '儿科-302',
    diagnosis: '支气管肺炎',
    priority: 'high',
    lastUpdate: '2小时前',
    vitals: {
      temperature: 39.1,
      bloodPressure: '120/75',
      heartRate: 102,
      oxygenSaturation: 94
    },
    careTasks: [
      { id: 1, description: '雾化吸入', scheduledTime: '08:00', completed: true },
      { id: 2, description: '体温监测', scheduledTime: '12:00', completed: false },
      { id: 3, description: '痰液护理', scheduledTime: '16:00', completed: false }
    ],
    medications: [
      { id: 1, name: '阿奇霉素', dosage: '250mg', frequency: '每日一次', status: 'completed' },
      { id: 2, name: '布地奈德', dosage: '2ml', frequency: '雾化', status: 'pending' }
    ]
  }
])

// 护理提醒数据
const upcomingReminders = ref([
  {
    id: 1,
    time: '14:00',
    patientName: '张三',
    task: '心电监护检查',
    urgency: 'urgent'
  },
  {
    id: 2,
    time: '14:30',
    patientName: '李四',
    task: '饮食指导',
    urgency: 'normal'
  },
  {
    id: 3,
    time: '15:00',
    patientName: '赵六',
    task: '体温监测',
    urgency: 'high'
  }
])

// 计算属性
const filteredPatients = computed(() => {
  let filtered = patientList.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(patient => 
      patient.name.toLowerCase().includes(query) ||
      patient.room.toLowerCase().includes(query) ||
      patient.diagnosis.toLowerCase().includes(query)
    )
  }

  if (selectedWard.value) {
    filtered = filtered.filter(patient => patient.room.includes(selectedWard.value))
  }

  if (selectedPriority.value) {
    filtered = filtered.filter(patient => patient.priority === selectedPriority.value)
  }

  return filtered
})

// 生命周期钩子
onMounted(() => {
  // 每分钟更新时间
  const timer = setInterval(() => {
    currentDate.value = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    currentWeekday.value = new Date().toLocaleDateString('zh-CN', { weekday: 'long' })
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
const addNewCare = () => {
  ElMessage.success('打开新增护理记录界面')
}

const batchUpdate = () => {
  ElMessage.info('批量更新功能开发中...')
}

const exportCareReport = () => {
  ElMessage.success('正在导出护理报告...')
  setTimeout(() => {
    ElNotification({
      title: '导出完成',
      message: '护理报告已导出到下载目录',
      type: 'success'
    })
  }, 1500)
}

const scheduleReminder = () => {
  ElMessage.info('设置提醒功能开发中...')
}

// 搜索方法
const performSearch = () => {
  ElMessage.success(`搜索: ${searchQuery.value || '全部患者'}`)
}

// 工具方法
const getPriorityText = (priority) => {
  const priorityMap = {
    normal: '普通',
    high: '重要',
    urgent: '紧急'
  }
  return priorityMap[priority] || '普通'
}

const getTemperatureClass = (temperature) => {
  if (temperature >= 38.5) return 'high-fever'
  if (temperature >= 37.5) return 'fever'
  if (temperature <= 36.0) return 'low-temp'
  return 'normal'
}

const getOxygenClass = (oxygen) => {
  if (oxygen < 90) return 'critical'
  if (oxygen < 95) return 'low'
  return 'normal'
}

const getCompletedTasksCount = (tasks) => {
  return tasks.filter(task => task.completed).length
}

// 患者操作方法
const recordVitals = (patient) => {
  ElMessage.success(`记录 ${patient.name} 的生命体征`)
}

const addCareNote = (patient) => {
  ElMessage.success(`为 ${patient.name} 添加护理记录`)
}

const manageMedication = (patient) => {
  ElMessage.info(`管理 ${patient.name} 的用药`)
}

const viewHistory = (patient) => {
  ElMessage.info(`查看 ${patient.name} 的护理历史`)
}

// 任务管理方法
const toggleTask = (patientId, taskId) => {
  const patient = patientList.value.find(p => p.id === patientId)
  if (patient) {
    const task = patient.careTasks.find(t => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      const status = task.completed ? '完成' : '取消完成'
      ElMessage.success(`${task.description} 已${status}`)
    }
  }
}

// 提醒管理方法
const completeReminder = (reminderId) => {
  const reminderIndex = upcomingReminders.value.findIndex(r => r.id === reminderId)
  if (reminderIndex !== -1) {
    const reminder = upcomingReminders.value[reminderIndex]
    upcomingReminders.value.splice(reminderIndex, 1)
    ElMessage.success(`${reminder.task} 已完成`)
  }
}

const snoozeReminder = (reminderId) => {
  ElMessage.info('提醒已延后10分钟')
}
</script>

<style scoped lang="scss">
// 颜色变量 - 护士端主题色
$primary: #67c23a;     // 护理绿色作为主色
$success: #67c23a;
$warning: #e6a23c;
$danger: #f56c6c;
$info: #409eff;
$purple: #9a66e4;
$nursing: #52c41a;     // 护理专业绿色
$text: #333;
$light: #f8f9fc;
$border: #ebeef5;

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

.patient-care {
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

        &.bg-blue { background: rgba($info, 0.1); color: $info; }
        &.bg-green { background: rgba($success, 0.1); color: $success; }
        &.bg-orange { background: rgba($warning, 0.1); color: $warning; }
        &.bg-red { background: rgba($danger, 0.1); color: $danger; }
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
        &:hover { background: #85ce61; }
      }

      &.outline {
        background: white;
        color: $primary;
        border: 2px solid $primary;
        &:hover { background: #f0f9ff; }
      }
    }
  }

  // 搜索和筛选区域
  .search-filter-section {
    @include card;
    margin-bottom: 30px;

    .search-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      .search-input {
        flex: 1;
        padding: 12px 16px;
        border: 2px solid $border;
        border-radius: 12px;
        font-size: 15px;
        transition: border-color 0.3s ease;

        &:focus {
          outline: none;
          border-color: $primary;
        }

        &::placeholder {
          color: #999;
        }
      }

      .search-btn {
        padding: 12px 20px;
        background: $primary;
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.3s ease;

        &:hover {
          background: #85ce61;
        }
      }
    }

    .filter-options {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      .filter-select {
        padding: 10px 14px;
        border: 2px solid $border;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        cursor: pointer;
        transition: border-color 0.3s ease;

        &:focus {
          outline: none;
          border-color: $primary;
        }
      }
    }
  }

  // 患者护理列表
  .patient-care-list {
    @include card;
    margin-bottom: 30px;

    .list-header {
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

      .list-controls {
        display: flex;
        gap: 8px;

        .view-mode-btn {
          padding: 8px 16px;
          border: 2px solid $border;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;

          &.active {
            background: $primary;
            color: white;
            border-color: $primary;
          }

          &:hover:not(.active) {
            border-color: $primary;
            color: $primary;
          }
        }
      }
    }

    // 卡片视图
    .card-view {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;

      .patient-care-card {
        background: white;
        border: 2px solid $border;
        border-radius: 16px;
        padding: 20px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        &.urgent {
          border-color: $danger;
          background: rgba($danger, 0.02);
        }

        &.high {
          border-color: $warning;
          background: rgba($warning, 0.02);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;

          .patient-basic-info {
            h3 {
              margin: 0 0 8px 0;
              font-size: 18px;
              color: $text;
            }

            .room-badge {
              background: rgba($primary, 0.1);
              color: $primary;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
              margin-right: 8px;
            }

            .patient-meta {
              font-size: 14px;
              color: #666;
            }
          }

          .priority-indicator {
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;

            &.normal { background: rgba($info, 0.1); color: $info; }
            &.high { background: rgba($warning, 0.1); color: $warning; }
            &.urgent { background: rgba($danger, 0.1); color: $danger; }
          }
        }

        .card-body {
          .diagnosis-section {
            margin-bottom: 16px;
            font-size: 14px;
            color: #555;
          }

          .vital-signs-section {
            margin-bottom: 16px;

            h4 {
              margin: 0 0 8px 0;
              font-size: 14px;
              color: $text;
              font-weight: 600;
            }

            .vitals-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;

              .vital-item {
                display: flex;
                justify-content: space-between;
                padding: 6px 8px;
                background: rgba($primary, 0.05);
                border-radius: 6px;
                font-size: 13px;

                .vital-label {
                  color: #666;
                }

                .vital-value {
                  font-weight: 500;
                  color: $text;

                  &.high-fever { color: $danger; }
                  &.fever { color: $warning; }
                  &.low-temp { color: $info; }
                  &.critical { color: $danger; }
                  &.low { color: $warning; }
                }
              }
            }
          }

          .care-tasks-section {
            margin-bottom: 16px;

            h4 {
              margin: 0 0 8px 0;
              font-size: 14px;
              color: $text;
              font-weight: 600;
            }

            .task-list {
              .task-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 0;
                font-size: 13px;

                &.completed {
                  opacity: 0.6;

                  .task-text {
                    text-decoration: line-through;
                  }
                }

                input[type="checkbox"] {
                  accent-color: $success;
                }

                .task-text {
                  flex: 1;
                  color: $text;
                }

                .task-time {
                  color: $primary;
                  font-weight: 500;
                }
              }
            }
          }

          .medication-section {
            h4 {
              margin: 0 0 8px 0;
              font-size: 14px;
              color: $text;
              font-weight: 600;
            }

            .medication-list {
              .medication-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 8px;
                background: rgba($warning, 0.05);
                border-radius: 6px;
                margin-bottom: 4px;
                font-size: 13px;

                .med-name {
                  font-weight: 500;
                  color: $text;
                }

                .med-dosage, .med-frequency {
                  color: #666;
                  font-size: 12px;
                }

                .med-status {
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: 500;

                  &.completed { background: rgba($success, 0.1); color: $success; }
                  &.pending { background: rgba($warning, 0.1); color: $warning; }
                }
              }
            }
          }
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid $border;

          .last-update {
            font-size: 12px;
            color: #999;
          }

          .action-buttons {
            display: flex;
            gap: 6px;

            .btn-mini {
              width: 32px;
              height: 32px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              transition: all 0.2s ease;

              &.primary {
                background: rgba($info, 0.1);
                &:hover { background: rgba($info, 0.2); }
              }

              &.success {
                background: rgba($success, 0.1);
                &:hover { background: rgba($success, 0.2); }
              }

              &.warning {
                background: rgba($warning, 0.1);
                &:hover { background: rgba($warning, 0.2); }
              }

              &.info {
                background: rgba($purple, 0.1);
                &:hover { background: rgba($purple, 0.2); }
              }
            }
          }
        }
      }
    }

    // 表格视图
    .table-view {
      .care-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;

        th {
          background: rgba($primary, 0.1);
          color: $text;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid $border;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid $border;
          vertical-align: top;
        }

        tr {
          transition: background 0.3s ease;

          &:hover {
            background: rgba($primary, 0.02);
          }

          &.urgent {
            background: rgba($danger, 0.02);
          }
        }

        .patient-info {
          strong {
            display: block;
            margin-bottom: 4px;
          }

          .patient-details {
            font-size: 12px;
            color: #666;
          }
        }

        .room-badge {
          background: rgba($primary, 0.1);
          color: $primary;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .vitals-summary {
          font-size: 13px;
          line-height: 1.4;
        }

        .task-progress {
          font-weight: 500;
          color: $primary;
        }

        .priority-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;

          &.normal { background: rgba($info, 0.1); color: $info; }
          &.high { background: rgba($warning, 0.1); color: $warning; }
          &.urgent { background: rgba($danger, 0.1); color: $danger; }
        }

        .table-actions {
          display: flex;
          gap: 4px;

          .btn-mini {
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
              background: rgba($info, 0.1);
              &:hover { background: rgba($info, 0.2); }
            }

            &.success {
              background: rgba($success, 0.1);
              &:hover { background: rgba($success, 0.2); }
            }

            &.warning {
              background: rgba($warning, 0.1);
              &:hover { background: rgba($warning, 0.2); }
            }
          }
        }
      }
    }
  }

  // 护理提醒面板
  .care-reminder-panel {
    @include card;

    .panel-header {
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

      .reminder-count {
        background: rgba($warning, 0.1);
        color: $warning;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
      }
    }

    .reminder-list {
      .reminder-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 8px;
        transition: all 0.3s ease;

        &:hover {
          background: rgba($primary, 0.05);
        }

        &.urgent {
          background: rgba($danger, 0.05);
          border-left: 4px solid $danger;
        }

        &.high {
          background: rgba($warning, 0.05);
          border-left: 4px solid $warning;
        }

        &.normal {
          background: rgba($info, 0.05);
          border-left: 4px solid $info;
        }

        .reminder-time {
          font-weight: 600;
          color: $primary;
          font-size: 16px;
          min-width: 60px;
        }

        .reminder-content {
          flex: 1;

          .reminder-patient {
            font-weight: 500;
            color: $text;
            margin-bottom: 2px;
          }

          .reminder-task {
            font-size: 14px;
            color: #666;
          }
        }

        .reminder-actions {
          display: flex;
          gap: 8px;

          .btn-mini {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;

            &.success {
              background: $success;
              color: white;
              border: none;
              &:hover { background: #85ce61; }
            }

            &.outline {
              background: white;
              color: $primary;
              border: 1px solid $primary;
              &:hover { background: rgba($primary, 0.1); }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .content {
    .patient-care-list .card-view {
      grid-template-columns: 1fr;
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

    .search-filter-section {
      .filter-options {
        .filter-select {
          flex: 1;
        }
      }
    }

    .patient-care-list {
      .list-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .card-view .patient-care-card {
        .vitals-grid {
          grid-template-columns: 1fr;
        }
      }

      .table-view {
        overflow-x: auto;
      }
    }
  }
}
</style>