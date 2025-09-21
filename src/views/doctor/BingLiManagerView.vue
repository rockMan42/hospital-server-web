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
      <SideLeft :activeMenu="'medical'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>病历管理</h1>
          <p>管理和查看所有患者病历信息</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">📋</div>
            <div class="card-info">
              <h3>总病历数</h3>
              <p class="number">{{ totalRecords }}</p>
              <p class="desc">已建档病历</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">✅</div>
            <div class="card-info">
              <h3>今日新增</h3>
              <p class="number">{{ todayNewRecords }}</p>
              <p class="desc">新建病历</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">⏳</div>
            <div class="card-info">
              <h3>待完善</h3>
              <p class="number">{{ pendingRecords }}</p>
              <p class="desc">需要完善</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">🚨</div>
            <div class="card-info">
              <h3>重要病历</h3>
              <p class="number">{{ criticalRecords }}</p>
              <p class="desc">需重点关注</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="showAddRecordModal">新建病历</button>
          <button class="action-btn outline" @click="exportRecordData">导出数据</button>
          <button class="action-btn outline" @click="importRecordData">导入数据</button>
          <button 
            class="action-btn danger" 
            @click="batchDeleteRecords"
            :disabled="selectedRecords.length === 0"
          >
            批量删除 ({{ selectedRecords.length }})
          </button>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="search-filter-section">
          <div class="search-bars">
            <!-- 患者姓名搜索 -->
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input 
                v-model="searchByPatientName" 
                type="text" 
                placeholder="按患者姓名搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <!-- 病历号搜索 -->
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <input 
                v-model="searchByRecordNo" 
                type="text" 
                placeholder="按病历号搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <!-- 诊断关键词搜索 -->
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
              <input 
                v-model="searchByDiagnosis" 
                type="text" 
                placeholder="按诊断关键词搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>
          </div>
          
          <div class="filter-controls">
            <select v-model="selectedStatus" @change="handleFilter" class="filter-select">
              <option value="">全部状态</option>
              <option value="completed">已完成</option>
              <option value="pending">待完善</option>
              <option value="critical">重要病历</option>
            </select>
            
            <select v-model="selectedDepartment" @change="handleFilter" class="filter-select">
              <option value="">全部科室</option>
              <option value="internal">内科</option>
              <option value="surgery">外科</option>
              <option value="pediatrics">儿科</option>
              <option value="obstetrics">妇产科</option>
              <option value="orthopedics">骨科</option>
            </select>

            <input 
              type="date" 
              v-model="startDate" 
              @change="handleFilter" 
              class="filter-select date-input"
              title="开始日期"
              placeholder="开始日期"
            />
            <span class="date-separator">至</span>
            <input 
              type="date" 
              v-model="endDate" 
              @change="handleFilter" 
              class="filter-select date-input"
              title="结束日期"
              placeholder="结束日期"
            />

            <button class="clear-search-btn" @click="clearAllSearch" title="清空搜索">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              清空
            </button>
          </div>
        </div>

        <!-- 病历列表 -->
        <div class="record-list">
          <div class="list-header">
            <h2>病历列表</h2>
            <div class="list-info">
              共 {{ filteredRecords.length }} 份病历
              <span v-if="selectedRecords.length > 0" class="selected-info">
                ，已选择 {{ selectedRecords.length }} 份
              </span>
            </div>
          </div>

          <!-- 病历表格 -->
          <div class="record-table-wrapper">
            <table class="record-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" class="select-checkbox">
                  </th>
                  <th>病历号</th>
                  <th>患者信息</th>
                  <th>就诊日期</th>
                  <th>科室</th>
                  <th>主诉</th>
                  <th>诊断</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in paginatedRecords" :key="record.id" class="table-row">
                  <td @click.stop>
                    <input 
                      type="checkbox" 
                      :checked="selectedRecords.includes(record.id)" 
                      @change="toggleRecordSelect(record.id)"
                      class="select-checkbox"
                    >
                  </td>
                  <td @click="viewRecordDetail(record)">
                    <div class="record-number">{{ record.recordNo }}</div>
                  </td>
                  <td @click="viewRecordDetail(record)">
                    <div class="patient-info-cell">
                      <div class="patient-avatar-small">{{ record.patientName.charAt(0) }}</div>
                      <div>
                        <div class="patient-name">{{ record.patientName }}</div>
                        <div class="patient-meta">{{ record.gender === 'male' ? '男' : '女' }} | {{ record.age }}岁</div>
                      </div>
                    </div>
                  </td>
                  <td @click="viewRecordDetail(record)">
                    <div class="visit-date">{{ formatDate(record.visitDate) }}</div>
                    <div class="visit-time">{{ record.startTime }} - {{ record.endTime }}</div>
                  </td>
                  <td @click="viewRecordDetail(record)">
                    <span class="department-badge" :class="record.department">
                      {{ getDepartmentName(record.department) }}
                    </span>
                  </td>
                  <td @click="viewRecordDetail(record)">
                    <div class="chief-complaint" :title="record.chiefComplaint">
                      {{ record.chiefComplaint }}
                    </div>
                  </td>
                  <td @click="viewRecordDetail(record)">
                    <div class="diagnosis-info" :title="record.diagnosis">
                      {{ record.diagnosis }}
                    </div>
                  </td>
                  <td @click="viewRecordDetail(record)">
                    <span class="status-badge" :class="record.status">
                      <span v-if="record.status === 'completed'">已完成</span>
                      <span v-else-if="record.status === 'pending'">待完善</span>
                      <span v-else>重要病历</span>
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn-mini view" @click.stop="viewRecordDetail(record)" title="查看详情">
                        👁️
                      </button>
                      <button class="action-btn-mini edit" @click.stop="editRecord(record)" title="编辑">
                        ✏️
                      </button>
                      <button class="action-btn-mini print" @click.stop="printRecord(record)" title="打印">
                        🖨️
                      </button>
                      <button class="action-btn-mini delete" @click.stop="confirmDeleteRecord(record)" title="删除">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页 -->
          <div class="pagination" v-if="totalPages > 1">
            <button 
              class="page-btn" 
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              上一页
            </button>
            <div class="page-numbers">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                class="page-number" 
                :class="{ active: page === currentPage }"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </div>
            <button 
              class="page-btn" 
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- 新建病历弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddRecordModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>新建病历</h3>
          <button class="close-btn" @click="closeAddRecordModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label for="patientName">患者姓名 <span class="required">*</span></label>
              <input id="patientName" v-model="newRecord.patientName" type="text" placeholder="请输入患者姓名">
            </div>
            <div class="form-group">
              <label for="gender">性别 <span class="required">*</span></label>
              <select id="gender" v-model="newRecord.gender">
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div class="form-group">
              <label for="age">年龄 <span class="required">*</span></label>
              <input id="age" v-model="newRecord.age" type="number" placeholder="请输入年龄" min="0" max="150">
            </div>
            <div class="form-group">
              <label for="visitDate">就诊日期 <span class="required">*</span></label>
              <input id="visitDate" v-model="newRecord.visitDate" type="date">
            </div>
            <div class="form-group">
              <label for="startTime">开始时间 <span class="required">*</span></label>
              <input id="startTime" v-model="newRecord.startTime" type="time">
            </div>
            <div class="form-group">
              <label for="endTime">结束时间 <span class="required">*</span></label>
              <input id="endTime" v-model="newRecord.endTime" type="time">
            </div>
            <div class="form-group">
              <label for="department">科室 <span class="required">*</span></label>
              <select id="department" v-model="newRecord.department">
                <option value="">请选择科室</option>
                <option value="internal">内科</option>
                <option value="surgery">外科</option>
                <option value="pediatrics">儿科</option>
                <option value="obstetrics">妇产科</option>
                <option value="orthopedics">骨科</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label for="chiefComplaint">主诉 <span class="required">*</span></label>
              <textarea id="chiefComplaint" v-model="newRecord.chiefComplaint" placeholder="请输入患者主诉" rows="3"></textarea>
            </div>
            <div class="form-group full-width">
              <label for="presentIllness">现病史</label>
              <textarea id="presentIllness" v-model="newRecord.presentIllness" placeholder="请输入现病史" rows="4"></textarea>
            </div>
            <div class="form-group full-width">
              <label for="pastHistory">既往史</label>
              <textarea id="pastHistory" v-model="newRecord.pastHistory" placeholder="请输入既往史" rows="3"></textarea>
            </div>
            <div class="form-group full-width">
              <label for="physicalExam">体格检查</label>
              <textarea id="physicalExam" v-model="newRecord.physicalExam" placeholder="请输入体格检查结果" rows="4"></textarea>
            </div>
            <div class="form-group full-width">
              <label for="auxiliaryExam">辅助检查</label>
              <textarea id="auxiliaryExam" v-model="newRecord.auxiliaryExam" placeholder="请输入辅助检查结果" rows="3"></textarea>
            </div>
            <div class="form-group full-width">
              <label for="diagnosis">诊断 <span class="required">*</span></label>
              <textarea id="diagnosis" v-model="newRecord.diagnosis" placeholder="请输入诊断结果" rows="3"></textarea>
            </div>
            <div class="form-group full-width">
              <label for="treatment">治疗方案</label>
              <textarea id="treatment" v-model="newRecord.treatment" placeholder="请输入治疗方案" rows="4"></textarea>
            </div>
            <div class="form-group full-width">
              <label for="doctorAdvice">医嘱</label>
              <textarea id="doctorAdvice" v-model="newRecord.doctorAdvice" placeholder="请输入医嘱" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeAddRecordModal">取消</button>
          <button class="action-btn primary" @click="addRecord">确认保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElNotification, ElMessage } from 'element-plus'
import SideLeft from '@/components/doctor/SideLeft.vue'
import TopNavbar from '@/components/doctor/TopNavbar.vue'

// 状态管理
const searchByPatientName = ref('')
const searchByRecordNo = ref('')
const searchByDiagnosis = ref('')
const selectedStatus = ref('')
const selectedDepartment = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedRecords = ref([])
const showAddModal = ref(false)

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

// 新病历表单数据
const newRecord = ref({
  patientName: '',
  gender: '',
  age: '',
  visitDate: '',
  startTime: '',
  endTime: '',
  department: '',
  chiefComplaint: '',
  presentIllness: '',
  pastHistory: '',
  physicalExam: '',
  auxiliaryExam: '',
  diagnosis: '',
  treatment: '',
  doctorAdvice: ''
})

// 模拟病历数据
const recordList = ref([
  {
    id: 1,
    recordNo: 'MR202509200001',
    patientName: '张三',
    gender: 'male',
    age: 32,
    visitDate: '2025-09-20',
    startTime: '09:30',
    endTime: '10:00',
    department: 'internal',
    chiefComplaint: '胸闷气短3天',
    presentIllness: '患者3天前无明显诱因出现胸闷气短，活动后加重，休息后缓解',
    pastHistory: '高血压病史5年，规律服药',
    physicalExam: '血压150/90mmHg，心率85次/分，心律齐，肺部呼吸音清',
    auxiliaryExam: '心电图：窦性心律，ST-T改变',
    diagnosis: '高血压性心脏病',
    treatment: '调整降压药物，定期复查',
    doctorAdvice: '低盐低脂饮食，适量运动，按时服药',
    status: 'completed',
    createTime: '2025-09-20 09:45'
  },
  {
    id: 2,
    recordNo: 'MR202509200002',
    patientName: '李四',
    gender: 'female',
    age: 28,
    visitDate: '2025-09-20',
    startTime: '10:15',
    endTime: '10:45',
    department: 'obstetrics',
    chiefComplaint: '停经40天，恶心呕吐1周',
    presentIllness: '患者停经40天，1周前开始出现恶心呕吐，晨起明显',
    pastHistory: '月经规律，既往体健',
    physicalExam: '一般情况好，妇科检查子宫增大如孕40天大小',
    auxiliaryExam: 'HCG：阳性，B超：宫内早孕',
    diagnosis: '早期妊娠',
    treatment: '孕期保健指导',
    doctorAdvice: '定期产检，补充叶酸，注意休息',
    status: 'completed',
    createTime: '2025-09-20 10:30'
  },
  {
    id: 3,
    recordNo: 'MR202509200003',
    patientName: '王五',
    gender: 'male',
    age: 45,
    visitDate: '2025-09-20',
    startTime: '11:00',
    endTime: '11:30',
    department: 'surgery',
    chiefComplaint: '右下腹痛6小时',
    presentIllness: '患者6小时前进食后出现右下腹痛，呈持续性胀痛',
    pastHistory: '既往体健',
    physicalExam: '右下腹压痛，反跳痛阳性，肌紧张',
    auxiliaryExam: '血常规：白细胞升高，B超：阑尾增粗',
    diagnosis: '急性阑尾炎',
    treatment: '急诊手术治疗',
    doctorAdvice: '禁食禁水，术前准备',
    status: 'critical',
    createTime: '2025-09-20 11:15'
  },
  {
    id: 4,
    recordNo: 'MR202509190001',
    patientName: '赵六',
    gender: 'female',
    age: 35,
    visitDate: '2025-09-19',
    startTime: '14:30',
    endTime: '15:00',
    department: 'pediatrics',
    chiefComplaint: '发热咳嗽2天',
    presentIllness: '患儿2天前受凉后出现发热，最高39°C，伴咳嗽',
    pastHistory: '既往体健，预防接种按时',
    physicalExam: '体温38.5°C，咽部充血，肺部可闻及湿啰音',
    auxiliaryExam: '胸片：双肺纹理增粗',
    diagnosis: '上呼吸道感染',
    treatment: '对症治疗，抗感染',
    doctorAdvice: '多饮水，注意休息，按时服药',
    status: 'pending',
    createTime: '2025-09-19 14:45'
  },
  {
    id: 5,
    recordNo: 'MR202509190002',
    patientName: '钱七',
    gender: 'male',
    age: 55,
    visitDate: '2025-09-19',
    startTime: '15:45',
    endTime: '16:15',
    department: 'orthopedics',
    chiefComplaint: '腰痛伴下肢放射痛1月',
    presentIllness: '患者1月前搬重物后出现腰痛，伴左下肢放射痛',
    pastHistory: '腰椎间盘突出病史3年',
    physicalExam: '腰部活动受限，直腿抬高试验阳性',
    auxiliaryExam: '腰椎MRI：L4/5椎间盘突出',
    diagnosis: '腰椎间盘突出症',
    treatment: '保守治疗，理疗',
    doctorAdvice: '卧床休息，避免久坐，适当锻炼',
    status: 'completed',
    createTime: '2025-09-19 16:00'
  }
])

// 计算属性
const filteredRecords = computed(() => {
  let filtered = recordList.value

  // 按患者姓名搜索
  if (searchByPatientName.value) {
    const query = searchByPatientName.value.toLowerCase()
    filtered = filtered.filter(record => 
      record.patientName.toLowerCase().includes(query)
    )
  }

  // 按病历号搜索
  if (searchByRecordNo.value) {
    const query = searchByRecordNo.value.toLowerCase()
    filtered = filtered.filter(record => 
      record.recordNo.toLowerCase().includes(query)
    )
  }

  // 按诊断关键词搜索
  if (searchByDiagnosis.value) {
    const query = searchByDiagnosis.value.toLowerCase()
    filtered = filtered.filter(record => 
      record.diagnosis.toLowerCase().includes(query) ||
      record.chiefComplaint.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (selectedStatus.value) {
    filtered = filtered.filter(record => record.status === selectedStatus.value)
  }

  // 科室过滤
  if (selectedDepartment.value) {
    filtered = filtered.filter(record => record.department === selectedDepartment.value)
  }

  // 日期范围过滤
  if (startDate.value) {
    filtered = filtered.filter(record => record.visitDate >= startDate.value)
  }
  if (endDate.value) {
    filtered = filtered.filter(record => record.visitDate <= endDate.value)
  }

  return filtered
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredRecords.value.slice(start, end)
})

const totalRecords = computed(() => recordList.value.length)
const todayNewRecords = computed(() => 3) // 模拟数据
const pendingRecords = computed(() => recordList.value.filter(r => r.status === 'pending').length)
const criticalRecords = computed(() => recordList.value.filter(r => r.status === 'critical').length)
const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize))

const isAllSelected = computed(() => {
  return paginatedRecords.value.length > 0 && 
         paginatedRecords.value.every(record => selectedRecords.value.includes(record.id))
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
    return pages
  }
  
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) {
      pages.push(i)
    }
    pages.push('...')
    pages.push(total)
  } else if (current >= total - 3) {
    pages.push(1)
    pages.push('...')
    for (let i = total - 4; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    pages.push('...')
    for (let i = current - 1; i <= current + 1; i++) {
      pages.push(i)
    }
    pages.push('...')
    pages.push(total)
  }
  
  return pages
})

// 方法
const toggleDropdown = (event) => {
  dropdownVisible.value = !dropdownVisible.value
  event.stopPropagation()
}

const goBack = () => {
  router.push('/')
}

const goToPatientManager = () => {
  router.push('/patient-manager')
}

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const clearAllSearch = () => {
  searchByPatientName.value = ''
  searchByRecordNo.value = ''
  searchByDiagnosis.value = ''
  selectedStatus.value = ''
  selectedDepartment.value = ''
  startDate.value = ''
  endDate.value = ''
  currentPage.value = 1
}

const changePage = (page) => {
  if (typeof page === 'number') {
    currentPage.value = page
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getDepartmentName = (department) => {
  const names = {
    internal: '内科',
    surgery: '外科',
    pediatrics: '儿科',
    obstetrics: '妇产科',
    orthopedics: '骨科'
  }
  return names[department] || department
}

const generateRecordNo = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')
  return `MR${year}${month}${day}${random}`
}

const showAddRecordModal = () => {
  showAddModal.value = true
  // 设置默认日期和时间
  const now = new Date()
  newRecord.value.visitDate = now.toISOString().split('T')[0]
  newRecord.value.startTime = now.toTimeString().slice(0, 5)
  // 默认结束时间为开始时间后30分钟
  const endTime = new Date(now.getTime() + 30 * 60000)
  newRecord.value.endTime = endTime.toTimeString().slice(0, 5)
}

const closeAddRecordModal = () => {
  showAddModal.value = false
  // 重置表单
  newRecord.value = {
    patientName: '',
    gender: '',
    age: '',
    visitDate: '',
    startTime: '',
    endTime: '',
    department: '',
    chiefComplaint: '',
    presentIllness: '',
    pastHistory: '',
    physicalExam: '',
    auxiliaryExam: '',
    diagnosis: '',
    treatment: '',
    doctorAdvice: ''
  }
}

const addRecord = () => {
  // 简单验证
  if (!newRecord.value.patientName || !newRecord.value.gender || !newRecord.value.age || 
      !newRecord.value.visitDate || !newRecord.value.startTime || !newRecord.value.endTime ||
      !newRecord.value.department || !newRecord.value.chiefComplaint || !newRecord.value.diagnosis) {
    ElMessage.warning('请填写必要信息（患者姓名、性别、年龄、就诊日期、开始时间、结束时间、科室、主诉、诊断）')
    return
  }

  // 验证时间范围
  if (newRecord.value.startTime >= newRecord.value.endTime) {
    ElMessage.warning('结束时间必须晚于开始时间')
    return
  }

  // 添加新病历
  const record = {
    id: Date.now(),
    recordNo: generateRecordNo(),
    ...newRecord.value,
    age: parseInt(newRecord.value.age),
    status: 'completed',
    createTime: new Date().toLocaleString('zh-CN')
  }

  recordList.value.unshift(record)
  
  ElNotification({
    title: '保存成功',
    message: `病历 ${record.recordNo} 已成功保存`,
    type: 'success'
  })

  closeAddRecordModal()
}

const viewRecordDetail = (record) => {
  ElMessage.info(`查看病历详情：${record.recordNo}`)
  // 跳转到病历详情页面
}

const editRecord = (record) => {
  ElMessage.info(`编辑病历：${record.recordNo}`)
  // 实现编辑功能
}

const printRecord = (record) => {
  ElMessage.info(`打印病历：${record.recordNo}`)
  // 实现打印功能
}

const exportRecordData = () => {
  ElMessage.info('导出病历数据')
  // 实现导出功能
}

const importRecordData = () => {
  ElMessage.info('导入病历数据')
  // 实现导入功能
}

// 病历选择相关方法
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全选
    selectedRecords.value = selectedRecords.value.filter(
      id => !paginatedRecords.value.some(record => record.id === id)
    )
  } else {
    // 全选当前页
    paginatedRecords.value.forEach(record => {
      if (!selectedRecords.value.includes(record.id)) {
        selectedRecords.value.push(record.id)
      }
    })
  }
}

const toggleRecordSelect = (recordId) => {
  const index = selectedRecords.value.indexOf(recordId)
  if (index > -1) {
    selectedRecords.value.splice(index, 1)
  } else {
    selectedRecords.value.push(recordId)
  }
}

// 删除病历相关方法
const confirmDeleteRecord = (record) => {
  ElMessageBox.confirm(
    `确定要删除病历 "${record.recordNo}" 吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    deleteRecord(record.id)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const deleteRecord = (recordId) => {
  const index = recordList.value.findIndex(r => r.id === recordId)
  if (index > -1) {
    const deletedRecord = recordList.value[index]
    recordList.value.splice(index, 1)
    
    // 从选中列表中移除
    const selectedIndex = selectedRecords.value.indexOf(recordId)
    if (selectedIndex > -1) {
      selectedRecords.value.splice(selectedIndex, 1)
    }
    
    ElNotification({
      title: '删除成功',
      message: `病历 ${deletedRecord.recordNo} 已被删除`,
      type: 'success'
    })
    
    // 如果当前页没有数据且不是第一页，跳转到上一页
    if (paginatedRecords.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }
}

const batchDeleteRecords = () => {
  if (selectedRecords.value.length === 0) {
    ElMessage.warning('请先选择要删除的病历')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRecords.value.length} 份病历吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    const deletedCount = selectedRecords.value.length
    
    // 删除选中的病历
    recordList.value = recordList.value.filter(r => !selectedRecords.value.includes(r.id))
    selectedRecords.value = []
    
    ElNotification({
      title: '批量删除成功',
      message: `已删除 ${deletedCount} 份病历`,
      type: 'success'
    })
    
    // 调整页码
    if (paginatedRecords.value.length === 0 && currentPage.value > 1) {
      currentPage.value = 1
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 生命周期已移至TopNavbar组件中
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

// 顶部导航样式已移至TopNavbar组件中

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

  // 统计卡片（复用患者管理页面样式）
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

  // 快捷操作（复用患者管理页面样式）
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

      &.danger {
        background: $danger;
        color: white;
        border: none;
        &:hover { background: #f78989; }
        
        &:disabled {
          background: #ccc;
          cursor: not-allowed;
          &:hover { background: #ccc; }
        }
      }
    }
  }

  // 搜索筛选区域
  .search-filter-section {
    @include card;
    margin-bottom: 30px;
    display: flex;
    gap: 20px;
    align-items: flex-start;
    flex-wrap: wrap;

    .search-bars {
      display: flex;
      gap: 12px;
      flex: 1;
      flex-wrap: wrap;
      min-width: 600px;

      .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 180px;

        .search-icon {
          position: absolute;
          left: 10px;
          color: #999;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 10px 10px 10px 32px;
          border: 2px solid $border;
          border-radius: 8px;
          font-size: 13px;
          transition: all 0.3s ease;

          &:focus {
            outline: none;
            border-color: $primary;
            box-shadow: 0 0 0 3px rgba($primary, 0.1);
          }

          &::placeholder {
            color: #999;
            font-size: 12px;
          }
        }
      }
    }

    .filter-controls {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;

      .filter-select, .date-input {
        padding: 10px 12px;
        border: 2px solid $border;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: $primary;
        }
      }

      .date-separator {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #666;
        margin: 0 8px;
        white-space: nowrap;
      }

      .clear-search-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        background: #f5f5f5;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        color: #666;
        transition: all 0.3s ease;

        &:hover {
          background: #e0e0e0;
          color: $text;
        }
      }
    }
  }

  // 病历列表
  .record-list {
    @include card;

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h2 {
        margin: 0;
        font-size: 18px;
        color: $text;
      }

      .list-info {
        color: #666;
        font-size: 14px;

        .selected-info {
          color: $primary;
          font-weight: 500;
        }
      }
    }

    // 表格视图
    .record-table-wrapper {
      overflow-x: auto;
      margin-bottom: 20px;
      border: 1px solid $border;
      border-radius: 8px;
      background: white;

      .record-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        min-width: 1200px;

        th {
          padding: 12px 8px;
          background: $light;
          border-bottom: 2px solid $border;
          text-align: center;
          font-weight: 600;
          color: $text;
          font-size: 13px;
          vertical-align: middle;
          white-space: nowrap;
          box-sizing: border-box;

          &:first-child {
            text-align: center;
          }

          .select-checkbox {
            width: 16px;
            height: 16px;
            cursor: pointer;
            accent-color: $primary;
          }

          &:nth-child(1) { width: 4%; } /* 选择框 */
          &:nth-child(2) { width: 12%; } /* 病历号 */
          &:nth-child(3) { width: 15%; } /* 患者信息 */
          &:nth-child(4) { width: 10%; } /* 就诊日期 */
          &:nth-child(5) { width: 8%; } /* 科室 */
          &:nth-child(6) { width: 20%; } /* 主诉 */
          &:nth-child(7) { width: 18%; } /* 诊断 */
          &:nth-child(8) { width: 8%; } /* 状态 */
          &:nth-child(9) { width: 5%; } /* 操作 */
        }

        .table-row {
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: rgba($primary, 0.05);
          }

          td {
            padding: 12px 8px;
            border-bottom: 1px solid $border;
            font-size: 13px;
            vertical-align: middle;
            word-wrap: break-word;
            height: 65px;
            box-sizing: border-box;

            &:first-child {
              text-align: center;
            }

            &:last-child {
              text-align: center;
            }

            // 选择框
            .select-checkbox {
              width: 16px;
              height: 16px;
              cursor: pointer;
              accent-color: $primary;
            }

            // 病历号
            .record-number {
              font-weight: 600;
              color: $primary;
              font-family: 'Courier New', monospace;
              font-size: 12px;
            }

            // 患者信息单元格
            .patient-info-cell {
              display: flex;
              align-items: center;
              gap: 12px;

              .patient-avatar-small {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: $primary;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 600;
                flex-shrink: 0;
              }

              .patient-name {
                font-weight: 600;
                color: $text;
                margin-bottom: 2px;
              }

              .patient-meta {
                color: #666;
                font-size: 12px;
              }
            }

            // 就诊日期
            .visit-date {
              font-weight: 500;
              color: $text;
              margin-bottom: 2px;
            }

            .visit-time {
              color: #666;
              font-size: 12px;
            }

            // 科室标签
            .department-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
              
              &.internal { background: rgba(#3b82f6, 0.1); color: #3b82f6; }
              &.surgery { background: rgba(#ef4444, 0.1); color: #ef4444; }
              &.pediatrics { background: rgba(#f59e0b, 0.1); color: #f59e0b; }
              &.obstetrics { background: rgba(#ec4899, 0.1); color: #ec4899; }
              &.orthopedics { background: rgba(#8b5cf6, 0.1); color: #8b5cf6; }
            }

            // 主诉信息
            .chief-complaint {
              max-width: 200px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: $text;
              line-height: 1.4;
            }

            // 诊断信息
            .diagnosis-info {
              max-width: 180px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: $text;
              font-weight: 500;
            }

            // 状态标签
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.completed { background: rgba($success, 0.1); color: $success; }
              &.pending { background: rgba($warning, 0.1); color: $warning; }
              &.critical { background: rgba($danger, 0.1); color: $danger; }
            }

            // 操作按钮
            .table-actions {
              display: flex;
              gap: 4px;
              justify-content: center;

              .action-btn-mini {
                padding: 4px 6px;
                background: none;
                border: none;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.3s ease;
                font-size: 12px;

                &.view:hover {
                  background: rgba($primary, 0.1);
                  color: $primary;
                }

                &.edit:hover {
                  background: rgba($warning, 0.1);
                  color: $warning;
                }

                &.print:hover {
                  background: rgba($success, 0.1);
                  color: $success;
                }

                &.delete:hover {
                  background: rgba($danger, 0.1);
                  color: $danger;
                }
              }
            }
          }
        }
      }
    }

    // 分页
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding-top: 20px;
      border-top: 1px solid $border;

      .page-btn {
        padding: 8px 16px;
        border: 2px solid $border;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
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

      .page-numbers {
        display: flex;
        gap: 4px;

        .page-number {
          min-width: 36px;
          height: 36px;
          border: 2px solid $border;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;

          &.active {
            border-color: $primary;
            background: $primary;
            color: white;
          }

          &:not(.active):hover {
            border-color: $primary;
            color: $primary;
          }
        }
      }
    }
  }
}

// 弹窗样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 900px;
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;

    &.large {
      max-width: 1000px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid $border;

      h3 {
        margin: 0;
        font-size: 18px;
        color: $text;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: $light;
          color: $text;
        }
      }
    }

    .modal-body {
      padding: 24px;

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;

        .form-group {
          &.full-width {
            grid-column: 1 / -1;
          }

          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: $text;

            .required {
              color: $danger;
            }
          }

          input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid $border;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
            font-family: inherit;

            &:focus {
              outline: none;
              border-color: $primary;
              box-shadow: 0 0 0 3px rgba($primary, 0.1);
            }
          }

          textarea {
            resize: vertical;
            min-height: 80px;
          }
        }
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid $border;

      .action-btn {
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
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
          &:hover { background: rgba($primary, 0.1); }
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

  .content {
    padding: 20px;
  }

  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
    
    .search-bars {
      min-width: auto;
      
      .search-input-wrapper {
        min-width: 150px;
      }
    }
  }

  .record-table-wrapper {
    font-size: 12px;

    .record-table {
      th, td {
        padding: 8px;
      }
    }
  }

  .modal-content {
    width: 95%;
    max-width: none;

    .form-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
