<template>
  <div class="public-home-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-icon">
        <span>🏥</span>
      </div>
      <h1>公共设备终端</h1>
      <p>欢迎使用医院自助服务系统</p>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <span>🏥</span>
        </div>
        <div class="stat-content">
          <h3>{{ todayRegistrations }}</h3>
          <p>今日挂号</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <span>💳</span>
        </div>
        <div class="stat-content">
          <h3>{{ todayPayments }}</h3>
          <p>今日缴费</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <span>📋</span>
        </div>
        <div class="stat-content">
          <h3>{{ reportsPrinted }}</h3>
          <p>报告打印</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <span>👥</span>
        </div>
        <div class="stat-content">
          <h3>{{ currentQueue }}</h3>
          <p>当前排队</p>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-sections">
      <!-- 自助服务区域 -->
      <div class="section-card">
        <div class="section-header">
          <div class="header-icon">
            <span>🔧</span>
          </div>
          <h2>自助服务</h2>
        </div>
        
        <div class="service-options">
          <div 
            v-for="option in selfServiceOptions" 
            :key="option.id"
            class="option-card"
            :class="{ disabled: option.disabled }"
            @click="selectSelfService(option)"
          >
            <div class="option-icon">
              <component :is="option.icon" />
            </div>
            <div class="option-content">
              <h3>{{ option.title }}</h3>
              <p>{{ option.desc }}</p>
            </div>
            <div v-if="option.disabled" class="status-tag">维护中</div>
          </div>
        </div>
      </div>

      <!-- 门诊叫号系统 -->
      <div class="section-card">
        <div class="section-header">
          <div class="header-icon">
            <span>📢</span>
          </div>
          <h2>门诊叫号</h2>
          <button class="view-more-btn" @click="goToQueueSystem">
            查看完整叫号系统
          </button>
        </div>
        
        <div class="queue-system">
          <!-- 科室选择 -->
          <div class="department-selector">
            <el-radio-group v-model="selectedDepartment" size="small">
              <el-radio-button 
                v-for="dept in departments" 
                :key="dept.id" 
                :label="dept.id"
              >
                {{ dept.name }}
              </el-radio-button>
            </el-radio-group>
          </div>

          <!-- 当前叫号 -->
          <div class="current-call">
            <div class="call-header">正在叫号</div>
            <div v-if="currentCall.patient" class="call-info">
              <div class="patient-number">{{ currentCall.patient.number }}</div>
              <div class="patient-name">{{ currentCall.patient.name }}</div>
              <div class="room-info">请到 {{ currentCall.room }} 就诊</div>
            </div>
            <div v-else class="no-call">暂无叫号信息</div>
          </div>

          <!-- 等候队列 -->
          <div class="waiting-queue">
            <div class="queue-header">等候队列</div>
            <div class="queue-list">
              <div 
                v-for="patient in waitingPatients" 
                :key="patient.number"
                class="queue-item"
              >
                <span class="queue-number">{{ patient.number }}</span>
                <span class="queue-name">{{ patient.name }}</span>
                <span class="queue-status">{{ patient.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作区域 -->
    <div class="quick-actions">
      <button class="action-btn primary" @click="goBack">
        <span>⬅️</span>
        返回
      </button>
      <button class="action-btn secondary" @click="showHelp">
        <span>❓</span>
        帮助
      </button>
      <button class="action-btn tertiary" @click="switchLanguage">
        <span>🌐</span>
        语言
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  Ticket, 
  Coin, 
  Printer, 
  Document, 
  List 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 统计数据
const todayRegistrations = ref(156)
const todayPayments = ref(89)
const reportsPrinted = ref(234)
const currentQueue = ref(23)

// 自助挂号缴费机选项
const selfServiceOptions = ref([
  { id: 1, title: '自助挂号', desc: '选择科室与医生进行挂号', icon: Ticket, disabled: false },
  { id: 2, title: '门诊缴费', desc: '使用医保卡或扫码支付', icon: Coin, disabled: false },
  { id: 3, title: '报告打印', desc: '打印检验检查报告单', icon: Printer, disabled: true },
  { id: 4, title: '信息查询', desc: '查询就诊记录与费用', icon: Document, disabled: false },
  { id: 5, title: '医保服务', desc: '医保相关业务办理', icon: List, disabled: true },
  { id: 6, title: '病历打印', desc: '打印门诊病历与处方', icon: Printer, disabled: false }
])

// 选择自助服务
const selectSelfService = (option) => {
  if (option.disabled) {
    ElMessage.warning(`${option.title}功能暂时维护中`)
    return
  }
  
  // 根据选项跳转到对应页面
  switch(option.id) {
    case 1: // 自助挂号
      window.location.href = '/self-service/home'
      break
    case 2: // 门诊缴费
      ElMessage.info('跳转到门诊缴费页面')
      break
    case 4: // 信息查询
      ElMessage.info('跳转到信息查询页面')
      break
    case 6: // 病历打印
      ElMessage.info('跳转到病历打印页面')
      break
    default:
      ElMessage.info(`您选择了: ${option.title}`)
  }
}

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

// 底部操作按钮功能
const goBack = () => {
  ElMessage.info('返回上级页面')
}

const showHelp = () => {
  ElMessage.info('显示使用帮助')
}

const switchLanguage = () => {
  ElMessage.info('切换系统语言')
}

// 跳转到叫号系统
const goToQueueSystem = () => {
  window.location.href = '/publicdevice/queue'
}

// 数据更新
let dataUpdateInterval = null

const updateData = () => {
  // 模拟实时数据更新
  todayRegistrations.value += Math.floor(Math.random() * 3)
  todayPayments.value += Math.floor(Math.random() * 2)
  reportsPrinted.value += Math.floor(Math.random() * 4)
  currentQueue.value = Math.max(0, currentQueue.value + Math.floor(Math.random() * 3) - 1)
}

onMounted(() => {
  // 每30秒更新一次数据
  dataUpdateInterval = setInterval(updateData, 30000)
})

onUnmounted(() => {
  if (dataUpdateInterval) {
    clearInterval(dataUpdateInterval)
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

.public-home-container {
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

// 统计卡片样式
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
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

// 主要内容区域
.main-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.section-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid $border;
  background: linear-gradient(135deg, $bg-light, white);

  .header-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
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
  
  .view-more-btn {
    background: $primary;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: darken($primary, 10%);
      transform: translateY(-1px);
    }
  }
}

// 自助服务选项样式
.service-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 24px;
}

.option-card {
  border: 2px solid $border;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: white;

  &:hover:not(.disabled) {
    border-color: $primary;
    box-shadow: 0 4px 20px rgba(26, 117, 188, 0.15);
    transform: translateY(-2px);
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background: #fafafa;
  }

  .option-icon {
    font-size: 32px;
    color: $primary;
    margin-bottom: 12px;
    display: flex;
    justify-content: center;
  }

  .option-content {
    text-align: center;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: $text;
    }

    p {
      font-size: 13px;
      color: $text-light;
      margin: 0;
      line-height: 1.4;
    }
  }

  .status-tag {
    position: absolute;
    top: 12px;
    right: 12px;
    background: $danger;
    color: white;
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 500;
  }
}

// 叫号系统样式
.queue-system {
  padding: 24px;
}

.department-selector {
  margin-bottom: 24px;

  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  :deep(.el-radio-button) {
    flex: 1;
    min-width: 80px;

    .el-radio-button__inner {
      width: 100%;
      border-radius: 8px;
      font-size: 13px;
    }
  }
}

.current-call {
  background: linear-gradient(135deg, $primary 0%, darken($primary, 10%) 100%);
  color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;

  .call-header {
    font-size: 16px;
    margin-bottom: 16px;
    opacity: 0.9;
    font-weight: 500;
  }

  .call-info {
    .patient-number {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }

    .patient-name {
      font-size: 18px;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .room-info {
      font-size: 14px;
      opacity: 0.8;
    }
  }

  .no-call {
    font-size: 16px;
    padding: 20px 0;
    opacity: 0.8;
  }
}

.waiting-queue {
  border: 2px solid $border;
  border-radius: 12px;
  overflow: hidden;
  background: white;

  .queue-header {
    background: $bg-light;
    padding: 16px 20px;
    font-weight: 600;
    font-size: 15px;
    color: $text;
    border-bottom: 1px solid $border;
  }

  .queue-list {
    max-height: 280px;
    overflow-y: auto;
  }

  .queue-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid $border;

    &:last-child {
      border-bottom: none;
    }

    &:nth-child(odd) {
      background: #fafbfc;
    }

    .queue-number {
      font-weight: 600;
      color: $primary;
      font-size: 15px;
    }

    .queue-name {
      flex: 1;
      margin-left: 20px;
      font-size: 14px;
      color: $text;
    }

    .queue-status {
      color: $success;
      font-size: 12px;
      background: lighten($success, 45%);
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 500;
    }
  }
}

// 快捷操作区域
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 500;
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
    background: linear-gradient(135deg, $success, darken($success, 5%));
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(103, 194, 58, 0.3);
    }
  }

  &.tertiary {
    background: linear-gradient(135deg, $warning, darken($warning, 5%));
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(230, 162, 60, 0.3);
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .main-sections {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .service-options {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .public-home-container {
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

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .service-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .quick-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 200px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .service-options {
    grid-template-columns: 1fr;
  }
}
</style>
