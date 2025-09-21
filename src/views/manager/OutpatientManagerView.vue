<template>
  <div class="outpatient-manager">
    <!-- 顶部导航栏 -->
    <AdminHeader 
      title="医院管理系统"
      :notification-count="2"
      @notification-click="handleNotificationClick"
      @profile-click="handleProfileClick"
      @settings-click="handleSettingsClick"
    />

    <!-- 主体布局 -->
    <div class="main-layout">
      <!-- 左侧菜单 - 使用SideLeft组件 -->
      <SideLeft :activeMenu="'outpatient'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>出诊管理</h1>
          <p>管理和安排医生出诊计划</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">🏥</div>
            <div class="card-info">
              <h3>今日出诊</h3>
              <p class="number">{{ todayOutpatients }}</p>
              <p class="desc">位医生出诊</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">👨‍⚕️</div>
            <div class="card-info">
              <h3>出诊医生</h3>
              <p class="number">{{ totalOutpatientDoctors }}</p>
              <p class="desc">参与出诊</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">🌍</div>
            <div class="card-info">
              <h3>服务区域</h3>
              <p class="number">{{ serviceAreas }}</p>
              <p class="desc">个服务区域</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">📅</div>
            <div class="card-info">
              <h3>本周计划</h3>
              <p class="number">{{ weeklyPlans }}</p>
              <p class="desc">个出诊计划</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="showAddOutpatientModal">
            <span class="icon">➕</span> 新增出诊
          </button>
          <button class="action-btn outline" @click="generateWeeklyPlan">
            <span class="icon">📋</span> 生成周计划
          </button>
          <button class="action-btn outline" @click="exportOutpatientData">
            <span class="icon">📤</span> 导出数据
          </button>
          <button class="action-btn outline" @click="importOutpatientData">
            <span class="icon">📥</span> 导入数据
          </button>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="search-filter-section">
          <div class="search-bars">
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input 
                v-model="searchByDoctor" 
                type="text" 
                placeholder="按医生姓名搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
              </svg>
              <input 
                v-model="searchByLocation" 
                type="text" 
                placeholder="按出诊地点搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>
          </div>
          
          <div class="filter-controls">
            <select v-model="selectedDepartment" @change="handleFilter" class="filter-select">
              <option value="">全部科室</option>
              <option value="心血管内科">心血管内科</option>
              <option value="骨科">骨科</option>
              <option value="妇产科">妇产科</option>
              <option value="儿科">儿科</option>
              <option value="急诊科">急诊科</option>
            </select>
            
            <select v-model="selectedStatus" @change="handleFilter" class="filter-select">
              <option value="">全部状态</option>
              <option value="scheduled">已安排</option>
              <option value="in-progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>

            <div class="date-picker-wrapper">
              <input type="date" v-model="selectedDate" @change="handleFilter" class="date-input">
            </div>

            <button class="clear-search-btn" @click="clearAllSearch" title="清空搜索">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              清空
            </button>
          </div>
        </div>

        <!-- 出诊列表 -->
        <div class="outpatient-list">
          <div class="list-header">
            <h2>出诊安排</h2>
            <div class="list-info">
              共 {{ filteredOutpatients.length }} 个出诊安排
              <span v-if="selectedOutpatients.length > 0" class="selected-info">
                ，已选择 {{ selectedOutpatients.length }} 个
              </span>
            </div>
          </div>

          <div class="outpatient-table-wrapper">
            <table class="outpatient-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" class="select-checkbox">
                  </th>
                  <th>医生信息</th>
                  <th>科室</th>
                  <th>出诊日期</th>
                  <th>出诊时间</th>
                  <th>出诊地点</th>
                  <th>服务类型</th>
                  <th>预约人数</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="outpatient in paginatedOutpatients" :key="outpatient.id" class="table-row">
                  <td @click.stop>
                    <input 
                      type="checkbox" 
                      :checked="selectedOutpatients.includes(outpatient.id)" 
                      @change="toggleOutpatientSelect(outpatient.id)"
                      class="select-checkbox"
                    >
                  </td>
                  <td @click="viewOutpatientDetail(outpatient)">
                    <div class="doctor-cell">
                      <div class="doctor-avatar">{{ outpatient.doctorName.charAt(0) }}</div>
                      <div>
                        <div class="doctor-name">{{ outpatient.doctorName }}</div>
                        <div class="doctor-title">{{ outpatient.doctorTitle }}</div>
                      </div>
                    </div>
                  </td>
                  <td @click="viewOutpatientDetail(outpatient)">
                    <span class="department-badge">{{ outpatient.department }}</span>
                  </td>
                  <td @click="viewOutpatientDetail(outpatient)">
                    <div class="date-cell">
                      <div class="date">{{ formatDate(outpatient.date) }}</div>
                      <div class="weekday">{{ getWeekday(outpatient.date) }}</div>
                    </div>
                  </td>
                  <td @click="viewOutpatientDetail(outpatient)">{{ outpatient.timeSlot }}</td>
                  <td @click="viewOutpatientDetail(outpatient)">
                    <div class="location-info">
                      <div class="location-name">{{ outpatient.location }}</div>
                      <div class="location-address">{{ outpatient.address }}</div>
                    </div>
                  </td>
                  <td @click="viewOutpatientDetail(outpatient)">
                    <span class="service-type-badge" :class="outpatient.serviceType">
                      {{ getServiceTypeName(outpatient.serviceType) }}
                    </span>
                  </td>
                  <td @click="viewOutpatientDetail(outpatient)">
                    <span class="appointment-count" :class="{ 'full': outpatient.currentAppointments >= outpatient.maxAppointments }">
                      {{ outpatient.currentAppointments }}/{{ outpatient.maxAppointments }}
                    </span>
                  </td>
                  <td @click="viewOutpatientDetail(outpatient)">
                    <span class="status-badge" :class="outpatient.status">
                      {{ getStatusName(outpatient.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn-mini edit" @click.stop="editOutpatient(outpatient)" title="编辑">
                        ✏️
                      </button>
                      <button class="action-btn-mini view" @click.stop="viewOutpatientDetail(outpatient)" title="查看详情">
                        👁️
                      </button>
                      <button class="action-btn-mini location" @click.stop="viewLocation(outpatient)" title="查看位置">
                        📍
                      </button>
                      <button class="action-btn-mini cancel" @click.stop="cancelOutpatient(outpatient)" title="取消出诊" v-if="outpatient.status === 'scheduled'">
                        ❌
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

    <!-- 新增出诊弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddOutpatientModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新增出诊</h3>
          <button class="close-btn" @click="closeAddOutpatientModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>医生 <span class="required">*</span></label>
              <select v-model="newOutpatient.doctorId">
                <option value="">请选择医生</option>
                <option v-for="doctor in availableDoctors" :key="doctor.id" :value="doctor.id">
                  {{ doctor.name }} - {{ doctor.department }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>出诊日期 <span class="required">*</span></label>
              <input v-model="newOutpatient.date" type="date">
            </div>
            <div class="form-group">
              <label>出诊时间 <span class="required">*</span></label>
              <input v-model="newOutpatient.timeSlot" type="text" placeholder="如：09:00-17:00">
            </div>
            <div class="form-group">
              <label>出诊地点 <span class="required">*</span></label>
              <input v-model="newOutpatient.location" type="text" placeholder="请输入出诊地点">
            </div>
            <div class="form-group">
              <label>详细地址</label>
              <input v-model="newOutpatient.address" type="text" placeholder="请输入详细地址">
            </div>
            <div class="form-group">
              <label>服务类型 <span class="required">*</span></label>
              <select v-model="newOutpatient.serviceType">
                <option value="">请选择服务类型</option>
                <option value="consultation">义诊咨询</option>
                <option value="health-check">健康体检</option>
                <option value="emergency">应急医疗</option>
                <option value="education">健康教育</option>
              </select>
            </div>
            <div class="form-group">
              <label>预约限额</label>
              <input v-model="newOutpatient.maxAppointments" type="number" placeholder="最大预约人数" min="1">
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="newOutpatient.contactPhone" type="text" placeholder="请输入联系电话">
            </div>
            <div class="form-group full-width">
              <label>备注</label>
              <textarea v-model="newOutpatient.remarks" placeholder="请输入备注信息" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeAddOutpatientModal">取消</button>
          <button class="action-btn primary" @click="addOutpatient">确认添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import SideLeft from '@/components/manager/SideLeft.vue'
import AdminHeader from '@/components/manager/AdminHeader.vue'

// 状态管理
const searchByDoctor = ref('')
const searchByLocation = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')
const selectedDate = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedOutpatients = ref([])
const showAddModal = ref(false)

const store = useStore()
const router = useRouter()

// 新出诊表单数据
const newOutpatient = ref({
  doctorId: '',
  date: '',
  timeSlot: '',
  location: '',
  address: '',
  serviceType: '',
  maxAppointments: 30,
  contactPhone: '',
  remarks: ''
})

// 模拟医生数据
const availableDoctors = ref([
  { id: 1, name: '张医生', department: '心血管内科', title: '主任医师' },
  { id: 2, name: '李医生', department: '骨科', title: '副主任医师' },
  { id: 3, name: '王医生', department: '妇产科', title: '主治医师' },
  { id: 4, name: '刘医生', department: '儿科', title: '主治医师' },
  { id: 5, name: '陈医生', department: '急诊科', title: '主任医师' }
])

// 模拟出诊数据
const outpatientList = ref([
  {
    id: 1,
    doctorName: '张医生',
    doctorTitle: '主任医师',
    department: '心血管内科',
    date: '2025-09-22',
    timeSlot: '09:00-17:00',
    location: '社区卫生服务中心',
    address: '朝阳区建国路88号',
    serviceType: 'consultation',
    maxAppointments: 30,
    currentAppointments: 25,
    contactPhone: '010-12345678',
    status: 'scheduled'
  },
  {
    id: 2,
    doctorName: '李医生',
    doctorTitle: '副主任医师',
    department: '骨科',
    date: '2025-09-23',
    timeSlot: '08:30-16:30',
    location: '养老院',
    address: '海淀区中关村大街123号',
    serviceType: 'health-check',
    maxAppointments: 20,
    currentAppointments: 18,
    contactPhone: '010-87654321',
    status: 'in-progress'
  },
  {
    id: 3,
    doctorName: '王医生',
    doctorTitle: '主治医师',
    department: '妇产科',
    date: '2025-09-24',
    timeSlot: '10:00-16:00',
    location: '乡村诊所',
    address: '昌平区回龙观镇',
    serviceType: 'consultation',
    maxAppointments: 25,
    currentAppointments: 15,
    contactPhone: '010-11223344',
    status: 'scheduled'
  },
  {
    id: 4,
    doctorName: '刘医生',
    doctorTitle: '主治医师',
    department: '儿科',
    date: '2025-09-25',
    timeSlot: '09:00-15:00',
    location: '学校医务室',
    address: '西城区西单大街56号',
    serviceType: 'education',
    maxAppointments: 40,
    currentAppointments: 22,
    contactPhone: '010-55667788',
    status: 'scheduled'
  },
  {
    id: 5,
    doctorName: '陈医生',
    doctorTitle: '主任医师',
    department: '急诊科',
    date: '2025-09-26',
    timeSlot: '24小时',
    location: '应急救援点',
    address: '丰台区南三环路99号',
    serviceType: 'emergency',
    maxAppointments: 50,
    currentAppointments: 8,
    contactPhone: '010-99887766',
    status: 'completed'
  }
])

// 计算属性
const filteredOutpatients = computed(() => {
  let filtered = outpatientList.value

  // 按医生搜索
  if (searchByDoctor.value) {
    const query = searchByDoctor.value.toLowerCase()
    filtered = filtered.filter(outpatient => 
      outpatient.doctorName.toLowerCase().includes(query)
    )
  }

  // 按地点搜索
  if (searchByLocation.value) {
    const query = searchByLocation.value.toLowerCase()
    filtered = filtered.filter(outpatient => 
      outpatient.location.toLowerCase().includes(query) ||
      outpatient.address.toLowerCase().includes(query)
    )
  }

  // 科室过滤
  if (selectedDepartment.value) {
    filtered = filtered.filter(outpatient => outpatient.department === selectedDepartment.value)
  }

  // 状态过滤
  if (selectedStatus.value) {
    filtered = filtered.filter(outpatient => outpatient.status === selectedStatus.value)
  }

  // 日期过滤
  if (selectedDate.value) {
    filtered = filtered.filter(outpatient => outpatient.date === selectedDate.value)
  }

  return filtered
})

const paginatedOutpatients = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredOutpatients.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredOutpatients.value.length / pageSize))

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
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
  }
  
  return pages
})

const isAllSelected = computed(() => {
  return paginatedOutpatients.value.length > 0 && 
         paginatedOutpatients.value.every(outpatient => selectedOutpatients.value.includes(outpatient.id))
})

// 统计数据
const todayOutpatients = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return outpatientList.value.filter(o => o.date === today && o.status !== 'cancelled').length
})

const totalOutpatientDoctors = computed(() => {
  const doctors = new Set(outpatientList.value.map(o => o.doctorName))
  return doctors.size
})

const serviceAreas = computed(() => {
  const areas = new Set(outpatientList.value.map(o => o.location))
  return areas.size
})

const weeklyPlans = computed(() => {
  const today = new Date()
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
  
  return outpatientList.value.filter(o => {
    const outpatientDate = new Date(o.date)
    return outpatientDate >= weekStart && outpatientDate <= weekEnd
  }).length
})

// 方法
const handleNotificationClick = () => {
  ElMessage.info('查看通知功能')
}

const handleProfileClick = () => {
  ElMessage.info('个人资料功能开发中...')
}

const handleSettingsClick = () => {
  ElMessage.info('设置功能开发中...')
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const clearAllSearch = () => {
  searchByDoctor.value = ''
  searchByLocation.value = ''
  selectedDepartment.value = ''
  selectedStatus.value = ''
  selectedDate.value = ''
  currentPage.value = 1
}

const changePage = (page) => {
  if (typeof page === 'number') {
    currentPage.value = page
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const getWeekday = (dateString) => {
  const date = new Date(dateString)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

const getServiceTypeName = (serviceType) => {
  const names = {
    consultation: '义诊咨询',
    'health-check': '健康体检',
    emergency: '应急医疗',
    education: '健康教育'
  }
  return names[serviceType] || '未知'
}

const getStatusName = (status) => {
  const names = {
    scheduled: '已安排',
    'in-progress': '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return names[status] || '未知'
}

const showAddOutpatientModal = () => {
  showAddModal.value = true
}

const closeAddOutpatientModal = () => {
  showAddModal.value = false
  newOutpatient.value = {
    doctorId: '',
    date: '',
    timeSlot: '',
    location: '',
    address: '',
    serviceType: '',
    maxAppointments: 30,
    contactPhone: '',
    remarks: ''
  }
}

const addOutpatient = () => {
  if (!newOutpatient.value.doctorId || !newOutpatient.value.date || 
      !newOutpatient.value.timeSlot || !newOutpatient.value.location || 
      !newOutpatient.value.serviceType) {
    ElMessage.warning('请填写必要信息')
    return
  }

  const doctor = availableDoctors.value.find(d => d.id == newOutpatient.value.doctorId)
  const outpatient = {
    id: Date.now(),
    doctorName: doctor.name,
    doctorTitle: doctor.title,
    department: doctor.department,
    date: newOutpatient.value.date,
    timeSlot: newOutpatient.value.timeSlot,
    location: newOutpatient.value.location,
    address: newOutpatient.value.address || '',
    serviceType: newOutpatient.value.serviceType,
    maxAppointments: newOutpatient.value.maxAppointments,
    currentAppointments: 0,
    contactPhone: newOutpatient.value.contactPhone || '',
    status: 'scheduled'
  }

  outpatientList.value.unshift(outpatient)
  
  ElNotification({
    title: '出诊安排成功',
    message: `已为 ${doctor.name} 安排 ${formatDate(outpatient.date)} 的出诊`,
    type: 'success'
  })

  closeAddOutpatientModal()
}

const editOutpatient = (outpatient) => {
  ElMessage.info(`编辑出诊：${outpatient.doctorName}`)
}

const viewOutpatientDetail = (outpatient) => {
  ElMessage.info(`查看出诊详情：${outpatient.doctorName} - ${outpatient.location}`)
}

const viewLocation = (outpatient) => {
  ElMessage.info(`查看位置：${outpatient.location} - ${outpatient.address}`)
}

const cancelOutpatient = (outpatient) => {
  ElMessageBox.confirm(
    `确定要取消 ${outpatient.doctorName} 在 ${outpatient.location} 的出诊吗？`,
    '确认取消',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    outpatient.status = 'cancelled'
    ElMessage.success('出诊已取消')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const generateWeeklyPlan = () => {
  ElMessage.info('生成周计划功能开发中...')
}

const exportOutpatientData = () => {
  ElMessage.success('导出出诊数据功能开发中...')
}

const importOutpatientData = () => {
  ElMessage.success('导入出诊数据功能开发中...')
}

// 选择相关方法
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全选
    selectedOutpatients.value = selectedOutpatients.value.filter(
      id => !paginatedOutpatients.value.some(outpatient => outpatient.id === id)
    )
  } else {
    // 全选当前页
    paginatedOutpatients.value.forEach(outpatient => {
      if (!selectedOutpatients.value.includes(outpatient.id)) {
        selectedOutpatients.value.push(outpatient.id)
      }
    })
  }
}

const toggleOutpatientSelect = (outpatientId) => {
  const index = selectedOutpatients.value.indexOf(outpatientId)
  if (index > -1) {
    selectedOutpatients.value.splice(index, 1)
  } else {
    selectedOutpatients.value.push(outpatientId)
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
$teal: #2d8c99;

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

.outpatient-manager {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 50%, #d1edff 100%);
  font-family: 'Helvetica Neue', Arial, sans-serif;
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
      min-width: 400px;

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

      .date-picker-wrapper {
        display: flex;
        align-items: center;
      }

      .clear-search-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        background: white;
        border: 2px solid $border;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 13px;
        color: #666;

        &:hover {
          border-color: $danger;
          color: $danger;
          background: rgba($danger, 0.05);
        }

        svg {
          flex-shrink: 0;
        }
      }
    }
  }

  // 出诊列表
  .outpatient-list {
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

    // 表格样式
    .outpatient-table-wrapper {
      overflow-x: auto;
      margin-bottom: 20px;
      border: 1px solid $border;
      border-radius: 8px;
      background: white;

      .outpatient-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 1200px;

        th {
          padding: 12px 8px;
          background: $light;
          border-bottom: 2px solid $border;
          text-align: left;
          font-weight: 600;
          color: $text;
          font-size: 13px;
          white-space: nowrap;
        }

        .table-row {
          border-bottom: 1px solid $border;
          transition: all 0.2s ease;

          &:hover {
            background: rgba($primary, 0.02);
          }

          td {
            padding: 12px 8px;
            vertical-align: middle;
            font-size: 13px;
          }
        }

        .select-checkbox {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: $primary;
        }

        .doctor-cell {
          display: flex;
          align-items: center;
          gap: 10px;

          .doctor-avatar {
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
          }

          .doctor-name {
            font-weight: 500;
            color: $text;
          }

          .doctor-title {
            font-size: 12px;
            color: #999;
          }
        }

        .department-badge {
          padding: 4px 8px;
          background: rgba($teal, 0.1);
          color: $teal;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .date-cell {
          .date {
            font-weight: 500;
            color: $text;
          }
          .weekday {
            font-size: 12px;
            color: #999;
          }
        }

        .location-info {
          .location-name {
            font-weight: 500;
            color: $text;
          }
          .location-address {
            font-size: 12px;
            color: #999;
            margin-top: 2px;
          }
        }

        .service-type-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;

          &.consultation { background: rgba($primary, 0.1); color: $primary; }
          &.health-check { background: rgba($success, 0.1); color: $success; }
          &.emergency { background: rgba($danger, 0.1); color: $danger; }
          &.education { background: rgba($purple, 0.1); color: $purple; }
        }

        .appointment-count {
          font-weight: 500;
          &.full { color: $danger; }
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;

          &.scheduled { background: rgba($primary, 0.1); color: $primary; }
          &.in-progress { background: rgba($success, 0.1); color: $success; }
          &.completed { background: rgba($success, 0.2); color: $success; }
          &.cancelled { background: rgba($danger, 0.1); color: $danger; }
        }

        .table-actions {
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

            &.edit {
              background: rgba($primary, 0.1);
              &:hover { background: rgba($primary, 0.2); }
            }

            &.view {
              background: rgba($success, 0.1);
              &:hover { background: rgba($success, 0.2); }
            }

            &.location {
              background: rgba($warning, 0.1);
              &:hover { background: rgba($warning, 0.2); }
            }

            &.cancel {
              background: rgba($danger, 0.1);
              &:hover { background: rgba($danger, 0.2); }
            }
          }
        }
      }
    }

    // 分页样式
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 20px;

      .page-btn, .page-number {
        padding: 8px 12px;
        border: 1px solid $border;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
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

      .page-number.active {
        background: $primary;
        color: white;
        border-color: $primary;
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
    width: 90%;
    max-width: 700px;
    max-height: 80vh;
    overflow-y: auto;

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
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        font-size: 20px;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &:hover {
          background: rgba($danger, 0.1);
          color: $danger;
        }
      }
    }

    .modal-body {
      padding: 24px;

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;

        .form-group {
          display: flex;
          flex-direction: column;

          &.full-width {
            grid-column: 1 / -1;
          }

          label {
            margin-bottom: 6px;
            font-size: 14px;
            font-weight: 500;
            color: $text;

            .required {
              color: $danger;
            }
          }

          input, select, textarea {
            padding: 10px 12px;
            border: 2px solid $border;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;

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
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;

        &.outline {
          background: white;
          color: #666;
          border: 2px solid $border;

          &:hover {
            border-color: #999;
            color: #333;
          }
        }

        &.primary {
          background: $primary;
          color: white;
          border: none;

          &:hover {
            background: #66b1ff;
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
  
  .content {
    margin-left: 0;
    padding: 20px;
  }

  .search-filter-section {
    .search-bars {
      min-width: auto;
    }
    
    .filter-controls {
      width: 100%;
      justify-content: flex-start;
    }
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    .action-btn {
      flex: 1;
      justify-content: center;
    }
  }

  .outpatient-table-wrapper {
    .outpatient-table {
      min-width: 800px;
    }
  }
}
</style>