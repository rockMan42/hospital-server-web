<template>
  <div class="queue-system-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-icon">
        <el-icon><Microphone /></el-icon>
      </div>
      <h1>门诊叫号系统</h1>
      <p>实时查看叫号信息和等候队列</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 科室选择区域 -->
      <div class="section-card department-section">
        <div class="section-header">
          <div class="header-icon">
            <span>🏥</span>
          </div>
          <h2>选择科室</h2>
        </div>
        
        <div class="department-selector">
          <el-radio-group v-model="selectedDepartment" size="large">
            <el-radio-button 
              v-for="dept in departments" 
              :key="dept.id" 
              :label="dept.id"
            >
              {{ dept.name }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 叫号信息区域 -->
      <div class="queue-info-grid">
        <!-- 当前叫号 -->
        <div class="section-card current-call-section">
          <div class="section-header">
            <div class="header-icon">
              <span>📢</span>
            </div>
            <h2>当前就诊</h2>
          </div>
          
          <div class="current-call">
            <div class="call-header">正在叫号</div>
            <div class="call-info" v-if="currentCall.patient">
              <div class="patient-number">{{ currentCall.patient.number }}</div>
              <div class="patient-name">{{ currentCall.patient.name }}</div>
              <div class="room-info">请到 {{ currentCall.room }} 就诊</div>
            </div>
            <div class="no-call" v-else>暂无叫号信息</div>
          </div>
        </div>

        <!-- 等候队列 -->
        <div class="section-card waiting-queue-section">
          <div class="section-header">
            <div class="header-icon">
              <span>👥</span>
            </div>
            <h2>等候队列</h2>
            <div class="queue-count">{{ waitingPatients.length }}人等候</div>
          </div>
          
          <div class="waiting-queue">
            <div class="queue-list">
              <div 
                v-for="(patient, index) in waitingPatients" 
                :key="patient.number"
                class="queue-item"
                :class="{ 'next-patient': index === 0 }"
              >
                <div class="queue-position">{{ index + 1 }}</div>
                <div class="queue-info">
                  <span class="queue-number">{{ patient.number }}</span>
                  <span class="queue-name">{{ patient.name }}</span>
                </div>
                <span class="queue-status" :class="getStatusClass(patient.status)">
                  {{ patient.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">
            <span>🎯</span>
          </div>
          <div class="stat-content">
            <h3>{{ currentNumber }}</h3>
            <p>当前号码</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <span>⏰</span>
          </div>
          <div class="stat-content">
            <h3>{{ estimatedWaitTime }}</h3>
            <p>预计等候</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <span>📊</span>
          </div>
          <div class="stat-content">
            <h3>{{ todayTotal }}</h3>
            <p>今日总数</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <span>👨‍⚕️</span>
          </div>
          <div class="stat-content">
            <h3>{{ availableDoctors }}</h3>
            <p>在诊医生</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区域 -->
    <div class="bottom-actions">
      <button class="action-btn primary" @click="refreshQueue">
        <el-icon><Refresh /></el-icon>
        刷新队列
      </button>
      <button class="action-btn secondary" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Microphone, Refresh, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 门诊叫号系统数据
const selectedDepartment = ref(1)

const departments = ref([
  { id: 1, name: '内科' },
  { id: 2, name: '外科' },
  { id: 3, name: '儿科' },
  { id: 4, name: '妇产科' },
  { id: 5, name: '眼科' },
  { id: 6, name: '耳鼻喉科' }
])

// 模拟当前叫号信息
const currentCall = ref({
  patient: {
    number: 'A015',
    name: '张*明'
  },
  room: '内科诊室3'
})

// 模拟等候队列
const waitingPatients = ref([
  { number: 'A016', name: '李*华', status: '等候中' },
  { number: 'A017', name: '王*芳', status: '等候中' },
  { number: 'A018', name: '赵*伟', status: '等候中' },
  { number: 'A019', name: '刘*婷', status: '预约等候' },
  { number: 'A020', name: '陈*强', status: '预约等候' }
])

// 统计数据
const currentNumber = ref('A015')
const estimatedWaitTime = ref('15分钟')
const todayTotal = ref(156)
const availableDoctors = ref(8)

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case '等候中':
      return 'status-waiting'
    case '预约等候':
      return 'status-appointment'
    case '叫号中':
      return 'status-calling'
    default:
      return 'status-default'
  }
}

// 刷新队列
const refreshQueue = () => {
  ElMessage.success('队列信息已刷新')
  // 这里可以调用API刷新数据
}

// 返回首页
const goBack = () => {
  router.push('/publicdevice')
}

// 自动刷新数据
let refreshInterval = null

const autoRefresh = () => {
  // 模拟数据更新
  const numbers = ['A015', 'A016', 'A017', 'A018']
  const randomIndex = Math.floor(Math.random() * numbers.length)
  currentNumber.value = numbers[randomIndex]
  
  // 更新等候时间
  const waitTimes = ['10分钟', '15分钟', '20分钟', '25分钟']
  estimatedWaitTime.value = waitTimes[Math.floor(Math.random() * waitTimes.length)]
}

onMounted(() => {
  // 每30秒自动刷新一次数据
  refreshInterval = setInterval(autoRefresh, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style lang="scss" scoped>
// 颜色变量
$primary: #1a75bc;
$success: #67c23a;
$warning: #e6a23c;
$danger: #f56c6c;
$text: #303133;
$text-light: #606266;
$border: #ebeef5;
$bg-light: #f8f9fc;

.queue-system-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

// 页面标题
.page-header {
  text-align: center;
  margin-bottom: 30px;
  
  .header-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary, lighten($primary, 10%));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 32px;
    color: white;
    box-shadow: 0 8px 25px rgba(26, 117, 188, 0.3);
  }
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: $text;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 16px;
    color: $text-light;
    margin: 0;
  }
}

// 主要内容区域
.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

// 通用卡片样式
.section-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 24px;
  
  .section-header {
    display: flex;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid $border;
    background: linear-gradient(135deg, $bg-light, white);
    
    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, $primary, lighten($primary, 10%));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      margin-right: 16px;
    }
    
    h2 {
      font-size: 20px;
      font-weight: 600;
      color: $text;
      margin: 0;
      flex: 1;
    }
    
    .queue-count {
      background: $primary;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

// 科室选择区域
.department-section {
  .department-selector {
    padding: 24px;
    
    :deep(.el-radio-group) {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      width: 100%;
    }
    
    :deep(.el-radio-button) {
      .el-radio-button__inner {
        width: 100%;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 500;
        padding: 16px 20px;
        border: 2px solid $border;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: $primary;
          color: $primary;
        }
      }
      
      &.is-active .el-radio-button__inner {
        background: linear-gradient(135deg, $primary, darken($primary, 5%));
        border-color: $primary;
        color: white;
        box-shadow: 0 4px 15px rgba(26, 117, 188, 0.3);
      }
    }
  }
}

// 叫号信息网格
.queue-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 30px;
}

// 当前叫号区域
.current-call-section {
  .current-call {
    padding: 32px 24px;
    text-align: center;
    
    .call-header {
      font-size: 18px;
      color: $text-light;
      margin-bottom: 24px;
      font-weight: 500;
    }
    
    .call-info {
      .patient-number {
        font-size: 48px;
        font-weight: 700;
        color: $primary;
        margin-bottom: 12px;
        letter-spacing: 3px;
        text-shadow: 0 2px 4px rgba(26, 117, 188, 0.2);
      }
      
      .patient-name {
        font-size: 24px;
        font-weight: 600;
        color: $text;
        margin-bottom: 16px;
      }
      
      .room-info {
        font-size: 16px;
        color: $text-light;
        background: $bg-light;
        padding: 12px 20px;
        border-radius: 25px;
        display: inline-block;
      }
    }
    
    .no-call {
      font-size: 18px;
      color: $text-light;
      padding: 40px 0;
      background: $bg-light;
      border-radius: 12px;
    }
  }
}

// 等候队列区域
.waiting-queue-section {
  .waiting-queue {
    .queue-list {
      max-height: 400px;
      overflow-y: auto;
      
      .queue-item {
        display: flex;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid $border;
        transition: all 0.3s ease;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background: $bg-light;
        }
        
        &.next-patient {
          background: linear-gradient(135deg, lighten($primary, 45%), lighten($primary, 50%));
          border-left: 4px solid $primary;
        }
        
        .queue-position {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: $primary;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          margin-right: 16px;
        }
        
        .queue-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          
          .queue-number {
            font-weight: 600;
            color: $text;
            font-size: 16px;
          }
          
          .queue-name {
            color: $text-light;
            font-size: 14px;
          }
        }
        
        .queue-status {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          
          &.status-waiting {
            background: lighten($success, 45%);
            color: $success;
          }
          
          &.status-appointment {
            background: lighten($warning, 45%);
            color: $warning;
          }
          
          &.status-calling {
            background: lighten($danger, 45%);
            color: $danger;
          }
        }
      }
    }
  }
}

// 统计信息区域
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      background: linear-gradient(135deg, $primary, lighten($primary, 10%));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    
    .stat-content {
      h3 {
        font-size: 28px;
        font-weight: 700;
        color: $text;
        margin: 0 0 4px 0;
      }
      
      p {
        font-size: 14px;
        color: $text-light;
        margin: 0;
      }
    }
  }
}

// 底部操作区域
.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 32px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.primary {
      background: linear-gradient(135deg, $primary, darken($primary, 5%));
      color: white;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(26, 117, 188, 0.3);
      }
    }
    
    &.secondary {
      background: white;
      color: $text;
      border: 2px solid $border;
      
      &:hover {
        border-color: $primary;
        color: $primary;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .queue-info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .queue-system-container {
    padding: 15px;
  }
  
  .page-header {
    .header-icon {
      width: 60px;
      height: 60px;
      font-size: 24px;
    }
    
    h1 {
      font-size: 24px;
    }
  }
  
  .department-selector {
    :deep(.el-radio-group) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .bottom-actions {
    flex-direction: column;
    align-items: center;
    
    .action-btn {
      width: 200px;
      justify-content: center;
    }
  }
}

@media (max-width: 480px) {
  .department-selector {
    :deep(.el-radio-group) {
      grid-template-columns: 1fr;
    }
  }
  
  .current-call {
    .call-info {
      .patient-number {
        font-size: 36px !important;
      }
      
      .patient-name {
        font-size: 18px !important;
      }
    }
  }
}
</style>