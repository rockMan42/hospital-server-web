<template>
  <div class="self-service-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-icon">
        <el-icon><Monitor /></el-icon>
      </div>
      <h1>自助服务终端</h1>
      <p>选择您需要的自助服务项目</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 自助服务选项 -->
      <div class="section-card">
        <div class="section-header">
          <div class="header-icon">
            <span>🔧</span>
          </div>
          <h2>自助挂号缴费机</h2>
          <div class="service-count">{{ availableServices }}项服务可用</div>
        </div>
        
        <div class="device-options">
          <div 
            v-for="option in selfServiceOptions" 
            :key="option.id" 
            class="option-card"
            :class="{ disabled: option.disabled }"
            @click="!option.disabled && selectSelfService(option)"
          >
            <div class="option-icon">
              <el-icon><component :is="option.icon" /></el-icon>
            </div>
            <div class="option-content">
              <div class="option-title">{{ option.title }}</div>
              <div class="option-desc">{{ option.desc }}</div>
            </div>
            <div v-if="option.disabled" class="status-tag">暂不可用</div>
            <div v-else class="available-tag">可用</div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="section-card instructions-section">
        <div class="section-header">
          <div class="header-icon">
            <span>📋</span>
          </div>
          <h2>使用说明</h2>
        </div>
        
        <div class="instructions-content">
          <div class="instruction-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>选择服务</h3>
              <p>点击上方对应的服务选项</p>
            </div>
          </div>
          
          <div class="instruction-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>身份验证</h3>
              <p>刷身份证或输入就诊卡号</p>
            </div>
          </div>
          
          <div class="instruction-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>完成操作</h3>
              <p>按照屏幕提示完成相关操作</p>
            </div>
          </div>
          
          <div class="instruction-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>取票离开</h3>
              <p>取走凭证和找零，完成服务</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
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
            <span>⏱️</span>
          </div>
          <div class="stat-content">
            <h3>{{ averageTime }}</h3>
            <p>平均用时</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区域 -->
    <div class="bottom-actions">
      <button class="action-btn primary" @click="refreshServices">
        <el-icon><Refresh /></el-icon>
        刷新服务
      </button>
      <button class="action-btn secondary" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
      </button>
      <button class="action-btn tertiary" @click="getHelp">
        <el-icon><QuestionFilled /></el-icon>
        获取帮助
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from "vue-router"
import { 
  Monitor,
  Ticket,
  Coin,
  Printer,
  Document,
  List,
  Refresh,
  ArrowLeft,
  QuestionFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 自助挂号缴费机选项
const selfServiceOptions = ref([
  { 
    id: 1, 
    title: '自助挂号', 
    desc: '选择科室与医生进行挂号', 
    icon: Ticket, 
    disabled: false,
    link: '/self-service/department-selection'  
  },
  { 
    id: 2, 
    title: '门诊缴费', 
    desc: '使用医保卡或扫码支付', 
    icon: Coin, 
    disabled: false,
    link: '/self-service/payment-start-scan' 
  },
  { 
    id: 3, 
    title: '报告打印', 
    desc: '打印检验检查报告单', 
    icon: Printer, 
    disabled: true,
    link: '/self-service/report-print'
  },
  { 
    id: 4, 
    title: '信息查询', 
    desc: '查询就诊记录与费用', 
    icon: Document, 
    disabled: false,
    link: '/self-service/info-query'
  },
  { 
    id: 5, 
    title: '医保服务', 
    desc: '医保相关业务办理', 
    icon: List, 
    disabled: true,
    link: '/self-service/insurance'
  },
  { 
    id: 6, 
    title: '病历打印', 
    desc: '打印门诊病历与处方', 
    icon: Printer, 
    disabled: false,
    link: '/self-service/medical-record'
  }
])

// 统计数据
const todayRegistrations = ref(156)
const todayPayments = ref(89)
const reportsPrinted = ref(234)
const averageTime = ref('3分钟')

// 计算可用服务数量
const availableServices = computed(() => {
  return selfServiceOptions.value.filter(option => !option.disabled).length
})

// 选择自助服务
const selectSelfService = (option) => {
  ElMessage.info(`您选择了: ${option.title}`)
  
  // 如果有链接，则跳转
  if (option.link) {
    router.push(option.link)
  } else {
    ElMessage.warning('该功能正在开发中，敬请期待')
  }
}

// 刷新服务
const refreshServices = () => {
  ElMessage.success('服务状态已刷新')
  // 这里可以调用API刷新服务状态
}

// 返回首页
const goBack = () => {
  router.push('/publicdevice')
}

// 获取帮助
const getHelp = () => {
  ElMessage.info('如需帮助，请联系工作人员或拨打服务热线')
}

// 模拟数据更新
const updateStats = () => {
  todayRegistrations.value += Math.floor(Math.random() * 3)
  todayPayments.value += Math.floor(Math.random() * 2)
  reportsPrinted.value += Math.floor(Math.random() * 4)
}

onMounted(() => {
  // 每分钟更新一次统计数据
  setInterval(updateStats, 60000)
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

.self-service-container {
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
    
    .service-count {
      background: $success;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

// 自助服务选项
.device-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 24px;
}

.option-card {
  border: 2px solid $border;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 200px;

  &:hover:not(.disabled) {
    border-color: $primary;
    box-shadow: 0 8px 30px rgba(26, 117, 188, 0.15);
    transform: translateY(-4px);
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background: #fafafa;
  }

  .option-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: linear-gradient(135deg, $primary, lighten($primary, 10%));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: white;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(26, 117, 188, 0.3);
  }

  .option-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .option-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
      color: $text;
    }

    .option-desc {
      font-size: 14px;
      color: $text-light;
      line-height: 1.5;
    }
  }

  .status-tag {
    position: absolute;
    top: 16px;
    right: 16px;
    background: $danger;
    color: white;
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 500;
  }
  
  .available-tag {
    position: absolute;
    top: 16px;
    right: 16px;
    background: $success;
    color: white;
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 500;
  }
}

// 使用说明区域
.instructions-section {
  .instructions-content {
    padding: 24px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .instruction-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
    background: $bg-light;
    border-radius: 12px;
    
    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: $primary;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
      flex-shrink: 0;
    }
    
    .step-content {
      h3 {
        font-size: 16px;
        font-weight: 600;
        color: $text;
        margin: 0 0 8px 0;
      }
      
      p {
        font-size: 14px;
        color: $text-light;
        margin: 0;
        line-height: 1.4;
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
    
    &.tertiary {
      background: linear-gradient(135deg, $success, darken($success, 5%));
      color: white;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(103, 194, 58, 0.3);
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .device-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .instructions-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .self-service-container {
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
  
  .device-options {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .option-card {
    min-height: 160px;
    padding: 20px;
    
    .option-icon {
      width: 60px;
      height: 60px;
      font-size: 24px;
      margin-bottom: 16px;
    }
    
    .option-title {
      font-size: 18px;
    }
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .instructions-content {
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
  .option-card {
    .option-icon {
      width: 50px;
      height: 50px;
      font-size: 20px;
    }
    
    .option-title {
      font-size: 16px;
    }
    
    .option-desc {
      font-size: 13px;
    }
  }
}
</style>