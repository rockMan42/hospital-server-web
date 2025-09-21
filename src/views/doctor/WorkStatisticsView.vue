<template>
  <div class="doctor-home">
    <!-- 顶部导航栏 -->
    <TopNavbar 
      :notification-count="3"
      @notification-click="handleNotificationClick"
      @profile-click="handleProfileClick"
      @settings-click="handleSettingsClick"
    />

    <!-- 主体布局 -->
    <div class="main-layout">
      <!-- 左侧菜单 - 使用SideLeft组件 -->
      <SideLeft :activeMenu="'statistics'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>工作统计</h1>
          <p>{{ currentDate }}，数据概览</p>
        </div>

        <!-- 时间筛选 -->
        <div class="time-filter">
          <div class="filter-tabs">
            <button 
              v-for="tab in timeTabs" 
              :key="tab.key"
              :class="['tab-btn', { active: activeTab === tab.key }]"
              @click="switchTab(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
          <div class="custom-date">
            <input type="date" v-model="startDate" class="date-input">
            <span>至</span>
            <input type="date" v-model="endDate" class="date-input">
            <button class="search-btn" @click="searchCustomDate">查询</button>
          </div>
        </div>

        <!-- 统计概览卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">👥</div>
            <div class="card-info">
              <h3>接诊患者</h3>
              <p class="number">{{ statisticsData.totalPatients }}</p>
              <p class="desc">{{ getTimePeriodText() }}累计</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">⏰</div>
            <div class="card-info">
              <h3>工作时长</h3>
              <p class="number">{{ statisticsData.workingHours }}h</p>
              <p class="desc">平均每日{{ (statisticsData.workingHours / getDayCount()).toFixed(1) }}小时</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">📋</div>
            <div class="card-info">
              <h3>开具处方</h3>
              <p class="number">{{ statisticsData.prescriptions }}</p>
              <p class="desc">处方总数</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">💰</div>
            <div class="card-info">
              <h3>诊疗收入</h3>
              <p class="number">¥{{ statisticsData.revenue.toLocaleString() }}</p>
              <p class="desc">医疗服务收入</p>
            </div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="charts-section">
          <!-- 患者趋势图 -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>患者接诊趋势</h3>
              <div class="chart-legend">
                <span class="legend-item">
                  <span class="legend-dot blue"></span>
                  接诊人数
                </span>
              </div>
            </div>
            <div class="chart-container">
              <canvas ref="patientsChart" width="400" height="200"></canvas>
            </div>
          </div>

          <!-- 疾病分类统计 -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>疾病分类统计</h3>
              <div class="chart-actions">
                <button class="export-btn" @click="exportDiseaseData">导出数据</button>
              </div>
            </div>
            <div class="disease-stats">
              <div 
                v-for="disease in diseaseStats" 
                :key="disease.name"
                class="disease-item"
              >
                <div class="disease-info">
                  <span class="disease-name">{{ disease.name }}</span>
                  <span class="disease-count">{{ disease.count }}例</span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: (disease.count / maxDiseaseCount * 100) + '%' }"
                  ></div>
                </div>
                <span class="percentage">{{ ((disease.count / totalDiseaseCount) * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 详细数据表格 -->
        <div class="data-table-section">
          <div class="table-card">
            <div class="table-header">
              <h3>详细工作记录</h3>
              <div class="table-actions">
                <button class="action-btn outline" @click="exportTableData">
                  <span class="icon">📤</span>
                  导出Excel
                </button>
                <button class="action-btn primary" @click="refreshData">
                  <span class="icon">🔄</span>
                  刷新数据
                </button>
              </div>
            </div>
            
            <div class="table-container">
              <table class="work-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>接诊人数</th>
                    <th>工作时长</th>
                    <th>处方数量</th>
                    <th>收入金额</th>
                    <th>主要疾病</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in workRecords" :key="record.date">
                    <td>{{ record.date }}</td>
                    <td>
                      <span class="number-badge">{{ record.patients }}</span>
                    </td>
                    <td>{{ record.hours }}h</td>
                    <td>{{ record.prescriptions }}</td>
                    <td class="revenue">¥{{ record.revenue.toLocaleString() }}</td>
                    <td>
                      <span class="disease-tag">{{ record.mainDisease }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页 -->
            <div class="pagination">
              <button 
                class="page-btn" 
                :disabled="currentPage === 1"
                @click="changePage(currentPage - 1)"
              >
                上一页
              </button>
              <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
              <button 
                class="page-btn" 
                :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)"
              >
                下一页
              </button>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="generateReport">生成报告</button>
          <button class="action-btn outline" @click="printStatistics">打印统计</button>
          <button class="action-btn outline" @click="shareStatistics">分享数据</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElNotification, ElMessage } from 'element-plus'
import SideLeft from '@/components/doctor/SideLeft.vue'
import TopNavbar from '@/components/doctor/TopNavbar.vue'

// 状态
const store = useStore()
const router = useRouter()

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

// 用户信息
let username = store.state.user.username || '医生'

// 当前日期
const currentDate = ref(new Date().toLocaleDateString('zh-CN', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  weekday: 'long'
}))

// 时间筛选
const activeTab = ref('week')
const startDate = ref('')
const endDate = ref('')

const timeTabs = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季度' },
  { key: 'year', label: '本年' }
]

// 统计数据
const statisticsData = ref({
  totalPatients: 156,
  workingHours: 168,
  prescriptions: 142,
  revenue: 45600
})

// 疾病统计数据
const diseaseStats = ref([
  { name: '感冒发烧', count: 45 },
  { name: '高血压', count: 32 },
  { name: '糖尿病', count: 28 },
  { name: '胃炎', count: 24 },
  { name: '关节炎', count: 18 },
  { name: '心脏病', count: 15 },
  { name: '其他', count: 38 }
])

// 工作记录数据
const workRecords = ref([
  { date: '2025-09-20', patients: 12, hours: 8, prescriptions: 10, revenue: 3200, mainDisease: '感冒发烧' },
  { date: '2025-09-19', patients: 15, hours: 8.5, prescriptions: 13, revenue: 4100, mainDisease: '高血压' },
  { date: '2025-09-18', patients: 11, hours: 7.5, prescriptions: 9, revenue: 2900, mainDisease: '糖尿病' },
  { date: '2025-09-17', patients: 18, hours: 9, prescriptions: 16, revenue: 5200, mainDisease: '胃炎' },
  { date: '2025-09-16', patients: 14, hours: 8, prescriptions: 12, revenue: 3800, mainDisease: '关节炎' },
  { date: '2025-09-15', patients: 9, hours: 7, prescriptions: 8, revenue: 2400, mainDisease: '心脏病' },
  { date: '2025-09-14', patients: 16, hours: 8.5, prescriptions: 14, revenue: 4500, mainDisease: '感冒发烧' }
])

// 分页
const currentPage = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.ceil(workRecords.value.length / pageSize))

// 计算属性
const totalDiseaseCount = computed(() => 
  diseaseStats.value.reduce((sum, item) => sum + item.count, 0)
)

const maxDiseaseCount = computed(() => 
  Math.max(...diseaseStats.value.map(item => item.count))
)

// 图表引用
const patientsChart = ref(null)

// 方法

const switchTab = (tabKey) => {
  activeTab.value = tabKey
  updateStatisticsData(tabKey)
}

const getTimePeriodText = () => {
  const texts = {
    today: '今日',
    week: '本周',
    month: '本月',
    quarter: '本季度',
    year: '本年'
  }
  return texts[activeTab.value] || '本周'
}

const getDayCount = () => {
  const counts = {
    today: 1,
    week: 7,
    month: 30,
    quarter: 90,
    year: 365
  }
  return counts[activeTab.value] || 7
}

const updateStatisticsData = (period) => {
  // 模拟不同时间段的数据
  const data = {
    today: { totalPatients: 12, workingHours: 8, prescriptions: 10, revenue: 3200 },
    week: { totalPatients: 156, workingHours: 56, prescriptions: 142, revenue: 45600 },
    month: { totalPatients: 680, workingHours: 240, prescriptions: 620, revenue: 198000 },
    quarter: { totalPatients: 2040, workingHours: 720, prescriptions: 1860, revenue: 594000 },
    year: { totalPatients: 8160, workingHours: 2880, prescriptions: 7440, revenue: 2376000 }
  }
  statisticsData.value = data[period] || data.week
}

const searchCustomDate = () => {
  if (!startDate.value || !endDate.value) {
    ElMessage.warning('请选择开始和结束日期')
    return
  }
  ElMessage.success('自定义时间查询成功')
  // 这里可以调用API获取自定义时间段的数据
}

const exportDiseaseData = () => {
  ElMessage.success('疾病统计数据导出成功')
}

const exportTableData = () => {
  ElMessage.success('工作记录导出成功')
}

const refreshData = () => {
  ElMessage.success('数据刷新成功')
}

const generateReport = () => {
  ElNotification({
    title: '报告生成中',
    message: '正在生成工作统计报告，请稍候...',
    type: 'info',
    duration: 3000
  })
}

const printStatistics = () => {
  window.print()
}

const shareStatistics = () => {
  ElMessage.success('统计数据分享链接已复制到剪贴板')
}

const changePage = (page) => {
  currentPage.value = page
}

// 绘制图表
const drawPatientsChart = () => {
  nextTick(() => {
    if (!patientsChart.value) return
    
    const canvas = patientsChart.value
    const ctx = canvas.getContext('2d')
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 模拟数据
    const data = [8, 12, 15, 11, 18, 14, 9]
    const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    
    const padding = 40
    const chartWidth = canvas.width - 2 * padding
    const chartHeight = canvas.height - 2 * padding
    
    // 绘制坐标轴
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    
    // Y轴
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.stroke()
    
    // X轴
    ctx.beginPath()
    ctx.moveTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()
    
    // 绘制数据点和连线
    const maxValue = Math.max(...data)
    const stepX = chartWidth / (data.length - 1)
    
    ctx.strokeStyle = '#409eff'
    ctx.fillStyle = '#409eff'
    ctx.lineWidth = 2
    
    ctx.beginPath()
    data.forEach((value, index) => {
      const x = padding + index * stepX
      const y = canvas.height - padding - (value / maxValue) * chartHeight
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      
      // 绘制数据点
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })
    ctx.stroke()
    
    // 绘制标签
    ctx.fillStyle = '#666'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    
    labels.forEach((label, index) => {
      const x = padding + index * stepX
      ctx.fillText(label, x, canvas.height - 10)
    })
  })
}

// 生命周期
onMounted(() => {
  // 设置默认日期
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  endDate.value = today.toISOString().split('T')[0]
  startDate.value = weekAgo.toISOString().split('T')[0]
  
  // 绘制图表
  drawPatientsChart()
})

onUnmounted(() => {
  // 清理资源
})
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

  // 时间筛选
  .time-filter {
    @include card;
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;

    .filter-tabs {
      display: flex;
      gap: 8px;

      .tab-btn {
        padding: 10px 20px;
        border: 1px solid $border;
        background: white;
        color: #666;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;

        &:hover {
          border-color: $primary;
          color: $primary;
        }

        &.active {
          background: $primary;
          color: white;
          border-color: $primary;
        }
      }
    }

    .custom-date {
      display: flex;
      align-items: center;
      gap: 12px;

      .date-input {
        padding: 8px 12px;
        border: 1px solid $border;
        border-radius: 6px;
        font-size: 14px;
      }

      .search-btn {
        padding: 8px 16px;
        background: $primary;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        
        &:hover {
          background: #66b1ff;
        }
      }
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

  // 图表区域
  .charts-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    margin-bottom: 30px;

    .chart-card {
      @include card;

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
          margin: 0;
          font-size: 18px;
          color: $text;
        }

        .chart-legend {
          display: flex;
          gap: 20px;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #666;

            .legend-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;

              &.blue { background: $primary; }
            }
          }
        }

        .chart-actions {
          .export-btn {
            padding: 6px 12px;
            background: transparent;
            border: 1px solid $border;
            border-radius: 6px;
            color: #666;
            cursor: pointer;
            font-size: 12px;

            &:hover {
              border-color: $primary;
              color: $primary;
            }
          }
        }
      }

      .chart-container {
        canvas {
          width: 100%;
          height: 200px;
        }
      }

      .disease-stats {
        .disease-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;

          .disease-info {
            min-width: 100px;
            display: flex;
            flex-direction: column;

            .disease-name {
              font-size: 14px;
              color: $text;
            }

            .disease-count {
              font-size: 12px;
              color: #999;
            }
          }

          .progress-bar {
            flex: 1;
            height: 8px;
            background: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;

            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, $primary, #66b1ff);
              border-radius: 4px;
              transition: width 0.3s ease;
            }
          }

          .percentage {
            min-width: 50px;
            text-align: right;
            font-size: 12px;
            color: #666;
          }
        }
      }
    }
  }

  // 数据表格
  .data-table-section {
    margin-bottom: 30px;

    .table-card {
      @include card;

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
          margin: 0;
          font-size: 18px;
          color: $text;
        }

        .table-actions {
          display: flex;
          gap: 12px;
        }
      }

      .table-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid $border;

        .work-table {
          width: 100%;
          border-collapse: collapse;

          th, td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid $border;
          }

          th {
            background: #f8f9fc;
            font-weight: 600;
            color: $text;
            font-size: 14px;
          }

          td {
            font-size: 14px;
            color: #666;

            .number-badge {
              background: rgba($primary, 0.1);
              color: $primary;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
            }

            &.revenue {
              font-weight: 600;
              color: $success;
            }

            .disease-tag {
              background: rgba($warning, 0.1);
              color: $warning;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
            }
          }

          tbody tr:hover {
            background: #f8f9fc;
          }
        }
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        margin-top: 20px;

        .page-btn {
          padding: 8px 16px;
          border: 1px solid $border;
          background: white;
          color: #666;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;

          &:hover:not(:disabled) {
            border-color: $primary;
            color: $primary;
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        .page-info {
          font-size: 14px;
          color: #666;
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

      .icon {
        font-size: 16px;
      }

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
}

// 响应式
@media (max-width: 1200px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

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
    
    .time-filter {
      flex-direction: column;
      align-items: stretch;
      
      .custom-date {
        justify-content: center;
      }
    }
    
    .stats-cards {
      grid-template-columns: 1fr;
    }
    
    .table-container {
      font-size: 12px;
      
      th, td {
        padding: 8px 12px;
      }
    }
  }
}
</style>
