<template>
  <div class="appointment-manager">
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
      <SideLeft :activeMenu="'appointment'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>预约管理</h1>
          <p>管理和查看所有预约记录</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">📅</div>
            <div class="card-info">
              <h3>总预约数</h3>
              <p class="number">{{ totalAppointments }}</p>
              <p class="desc">所有预约记录</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">⏳</div>
            <div class="card-info">
              <h3>待就诊</h3>
              <p class="number">{{ pendingAppointments }}</p>
              <p class="desc">今日待就诊</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">🔄</div>
            <div class="card-info">
              <h3>进行中</h3>
              <p class="number">{{ inProgressAppointments }}</p>
              <p class="desc">当前进行中</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">✅</div>
            <div class="card-info">
              <h3>已完成</h3>
              <p class="number">{{ completedAppointments }}</p>
              <p class="desc">已完成预约</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="showAddAppointmentModal">新增预约</button>
          <button class="action-btn outline" @click="exportAppointmentData">导出数据</button>
          <button class="action-btn outline" @click="importAppointmentData">导入数据</button>
          <button 
            class="action-btn danger" 
            @click="batchDeleteAppointments"
            :disabled="selectedAppointments.length === 0"
          >
            批量删除 ({{ selectedAppointments.length }})
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
                v-model="searchByName" 
                type="text" 
                placeholder="按患者姓名搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <!-- 预约号搜索 -->
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <input 
                v-model="searchByAppointmentNo" 
                type="text" 
                placeholder="按预约号搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <!-- 手机号搜索 -->
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <input 
                v-model="searchByPhone" 
                type="text" 
                placeholder="按手机号搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>
          </div>
          
          <div class="filter-controls">
            <select v-model="selectedStatus" @change="handleFilter" class="filter-select">
              <option value="">全部状态</option>
              <option value="pending">待就诊</option>
              <option value="in-progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
            
            <select v-model="selectedDepartment" @change="handleFilter" class="filter-select">
              <option value="">全部科室</option>
              <option value="内科">内科</option>
              <option value="外科">外科</option>
              <option value="妇科">妇科</option>
              <option value="儿科">儿科</option>
              <option value="骨科">骨科</option>
              <option value="皮肤科">皮肤科</option>
            </select>

            <!-- 日期范围选择器 -->
            <div class="date-range-picker">
              <div class="date-input-wrapper">
                <input type="date" id="start-date" v-model="startDate" class="date-input" @change="handleFilter">
                <label for="start-date" class="date-label">开始日期</label>
              </div>
              <div class="date-separator">
                <span>至</span>
              </div>
              <div class="date-input-wrapper">
                <input type="date" id="end-date" v-model="endDate" class="date-input" @change="handleFilter">
                <label for="end-date" class="date-label">结束日期</label>
              </div>
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

        <!-- 预约记录列表 -->
        <div class="appointment-list">
          <div class="list-header">
            <h2>预约记录</h2>
            <div class="list-info">
              共 {{ filteredAppointments.length }} 条预约记录
              <span v-if="selectedAppointments.length > 0" class="selected-info">
                ，已选择 {{ selectedAppointments.length }} 条
              </span>
            </div>
          </div>

          <!-- 预约表格 -->
          <div class="appointment-table-wrapper">
            <table class="appointment-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" class="select-checkbox">
                  </th>
                  <th>预约号</th>
                  <th>患者信息</th>
                  <th>预约时间</th>
                  <th>科室</th>
                  <th>预约类型</th>
                  <th>联系方式</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appointment in paginatedAppointments" :key="appointment.id" class="table-row">
                  <td @click.stop>
                    <input 
                      type="checkbox" 
                      :checked="selectedAppointments.includes(appointment.id)" 
                      @change="toggleAppointmentSelect(appointment.id)"
                      class="select-checkbox"
                    >
                  </td>
                  <td @click="viewAppointmentDetail(appointment)">
                    <div class="appointment-number">#{{ generateAppointmentNumber(appointment.id) }}</div>
                  </td>
                  <td @click="viewAppointmentDetail(appointment)">
                    <div class="patient-name-cell">
                      <div class="patient-avatar-small">{{ appointment.patientName.charAt(0) }}</div>
                      <div>
                        <div class="patient-name">{{ appointment.patientName }}</div>
                        <div class="patient-meta">{{ appointment.gender }} | {{ appointment.age }}岁</div>
                      </div>
                    </div>
                  </td>
                  <td @click="viewAppointmentDetail(appointment)">
                    <div class="appointment-time-cell">
                      <div class="appointment-date">{{ formatDate(appointment.appointmentDate) }}</div>
                      <div class="appointment-time">{{ appointment.appointmentTime }}</div>
                    </div>
                  </td>
                  <td @click="viewAppointmentDetail(appointment)">
                    <span class="department-badge">{{ appointment.department }}</span>
                  </td>
                  <td @click="viewAppointmentDetail(appointment)">
                    <span class="appointment-type-badge">{{ appointment.appointmentType }}</span>
                  </td>
                  <td @click="viewAppointmentDetail(appointment)">
                    <div class="contact-info">
                      <div class="phone">{{ appointment.phone }}</div>
                    </div>
                  </td>
                  <td @click="viewAppointmentDetail(appointment)">
                    <span class="status-badge" :class="appointment.status">
                      <span v-if="appointment.status === 'pending'">⏳ 待就诊</span>
                      <span v-else-if="appointment.status === 'in-progress'">🔄 进行中</span>
                      <span v-else-if="appointment.status === 'completed'">✅ 已完成</span>
                      <span v-else>❌ 已取消</span>
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn-mini view" @click.stop="viewAppointmentDetail(appointment)" title="查看详情">
                        👁️
                      </button>
                      <button class="action-btn-mini edit" @click.stop="editAppointment(appointment)" title="编辑">
                        ✏️
                      </button>
                      <button class="action-btn-mini complete" @click.stop="completeAppointment(appointment)" title="完成" v-if="appointment.status === 'pending' || appointment.status === 'in-progress'">
                        ✅
                      </button>
                      <button class="action-btn-mini cancel" @click.stop="cancelAppointment(appointment)" title="取消" v-if="appointment.status === 'pending'">
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

    <!-- 新增预约弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddAppointmentModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新增预约</h3>
          <button class="close-btn" @click="closeAddAppointmentModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>患者姓名 <span class="required">*</span></label>
              <input v-model="newAppointment.patientName" type="text" placeholder="请输入患者姓名">
            </div>
            <div class="form-group">
              <label>性别 <span class="required">*</span></label>
              <select v-model="newAppointment.gender">
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-group">
              <label>年龄 <span class="required">*</span></label>
              <input v-model="newAppointment.age" type="number" placeholder="请输入年龄" min="0" max="150">
            </div>
            <div class="form-group">
              <label>手机号 <span class="required">*</span></label>
              <input v-model="newAppointment.phone" type="text" placeholder="请输入手机号">
            </div>
            <div class="form-group">
              <label>预约日期 <span class="required">*</span></label>
              <input v-model="newAppointment.appointmentDate" type="date">
            </div>
            <div class="form-group">
              <label>预约时间 <span class="required">*</span></label>
              <input v-model="newAppointment.appointmentTime" type="time">
            </div>
            <div class="form-group">
              <label>科室 <span class="required">*</span></label>
              <select v-model="newAppointment.department">
                <option value="">请选择科室</option>
                <option value="内科">内科</option>
                <option value="外科">外科</option>
                <option value="妇科">妇科</option>
                <option value="儿科">儿科</option>
                <option value="骨科">骨科</option>
                <option value="皮肤科">皮肤科</option>
              </select>
            </div>
            <div class="form-group">
              <label>预约类型</label>
              <select v-model="newAppointment.appointmentType">
                <option value="初诊">初诊</option>
                <option value="复诊">复诊</option>
                <option value="体检">体检</option>
                <option value="咨询">咨询</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>备注</label>
              <textarea v-model="newAppointment.remarks" placeholder="请输入备注信息" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeAddAppointmentModal">取消</button>
          <button class="action-btn primary" @click="addAppointment">确认添加</button>
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
import SideLeft from '@/components/manager/SideLeft.vue'
import AdminHeader from '@/components/manager/AdminHeader.vue'

// 状态管理
const searchByName = ref('')
const searchByAppointmentNo = ref('')
const searchByPhone = ref('')
const selectedStatus = ref('')
const selectedDepartment = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedAppointments = ref([])
const showAddModal = ref(false)

const store = useStore()
const router = useRouter()
let username = store.state.user?.username || '张医生'

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

// 日期范围
const startDate = ref('')
const endDate = ref('')

// 新预约表单数据
const newAppointment = ref({
  patientName: '',
  gender: '',
  age: '',
  phone: '',
  appointmentDate: '',
  appointmentTime: '',
  department: '',
  appointmentType: '初诊',
  remarks: ''
})

// 模拟预约数据
const appointmentList = ref([
  {
    id: 1,
    patientName: '张三',
    gender: '男',
    age: 32,
    phone: '138****1234',
    appointmentDate: '2025-09-21',
    appointmentTime: '09:30',
    department: '内科',
    appointmentType: '初诊',
    status: 'pending',
    remarks: '胸闷气短，需要检查'
  },
  {
    id: 2,
    patientName: '李四',
    gender: '女',
    age: 28,
    phone: '139****5678',
    appointmentDate: '2025-09-21',
    appointmentTime: '10:00',
    department: '妇科',
    appointmentType: '复诊',
    status: 'in-progress',
    remarks: '孕期检查'
  },
  {
    id: 3,
    patientName: '王五',
    gender: '男',
    age: 45,
    phone: '186****9012',
    appointmentDate: '2025-09-21',
    appointmentTime: '10:30',
    department: '内科',
    appointmentType: '体检',
    status: 'completed',
    remarks: '年度体检'
  },
  {
    id: 4,
    patientName: '赵六',
    gender: '女',
    age: 35,
    phone: '135****3456',
    appointmentDate: '2025-09-22',
    appointmentTime: '14:00',
    department: '儿科',
    appointmentType: '初诊',
    status: 'pending',
    remarks: '儿童发热'
  },
  {
    id: 5,
    patientName: '钱七',
    gender: '男',
    age: 50,
    phone: '158****7890',
    appointmentDate: '2025-09-22',
    appointmentTime: '15:30',
    department: '骨科',
    appointmentType: '复诊',
    status: 'pending',
    remarks: '腰椎间盘突出复查'
  },
  {
    id: 6,
    patientName: '孙八',
    gender: '女',
    age: 42,
    phone: '177****2345',
    appointmentDate: '2025-09-23',
    appointmentTime: '09:00',
    department: '皮肤科',
    appointmentType: '初诊',
    status: 'cancelled',
    remarks: '皮肤过敏'
  },
  {
    id: 7,
    patientName: '周九',
    gender: '男',
    age: 38,
    phone: '188****6789',
    appointmentDate: '2025-09-23',
    appointmentTime: '11:00',
    department: '外科',
    appointmentType: '咨询',
    status: 'pending',
    remarks: '手术咨询'
  }
])

// 计算属性
const filteredAppointments = computed(() => {
  let filtered = appointmentList.value

  // 按患者姓名搜索
  if (searchByName.value) {
    const query = searchByName.value.toLowerCase()
    filtered = filtered.filter(appointment => 
      appointment.patientName.toLowerCase().includes(query)
    )
  }

  // 按预约号搜索
  if (searchByAppointmentNo.value) {
    const query = searchByAppointmentNo.value
    filtered = filtered.filter(appointment => 
      generateAppointmentNumber(appointment.id).includes(query)
    )
  }

  // 按手机号搜索
  if (searchByPhone.value) {
    const query = searchByPhone.value
    filtered = filtered.filter(appointment => 
      appointment.phone.includes(query)
    )
  }

  // 状态过滤
  if (selectedStatus.value) {
    filtered = filtered.filter(appointment => appointment.status === selectedStatus.value)
  }

  // 科室过滤
  if (selectedDepartment.value) {
    filtered = filtered.filter(appointment => appointment.department === selectedDepartment.value)
  }

  // 日期范围过滤
  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value)
    const end = new Date(endDate.value)
    end.setDate(end.getDate() + 1) // 包含结束日期
    
    filtered = filtered.filter(appointment => {
      const appDate = new Date(appointment.appointmentDate)
      return appDate >= start && appDate < end
    })
  }

  return filtered
})

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredAppointments.value.slice(start, end)
})

const totalAppointments = computed(() => appointmentList.value.length)
const pendingAppointments = computed(() => appointmentList.value.filter(a => a.status === 'pending').length)
const inProgressAppointments = computed(() => appointmentList.value.filter(a => a.status === 'in-progress').length)
const completedAppointments = computed(() => appointmentList.value.filter(a => a.status === 'completed').length)
const totalPages = computed(() => Math.ceil(filteredAppointments.value.length / pageSize))

const isAllSelected = computed(() => {
  return paginatedAppointments.value.length > 0 && 
         paginatedAppointments.value.every(appointment => selectedAppointments.value.includes(appointment.id))
})

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

// 方法
const toggleDropdown = (event) => {
  dropdownVisible.value = !dropdownVisible.value
  event.stopPropagation()
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
  searchByName.value = ''
  searchByAppointmentNo.value = ''
  searchByPhone.value = ''
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

const generateAppointmentNumber = (id) => {
  // 生成预约号：APT + 年份 + 月份 + 6位数字ID
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const paddedId = String(id).padStart(6, '0')
  return `APT${year}${month}${paddedId}`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('zh-CN', options)
}

const showAddAppointmentModal = () => {
  showAddModal.value = true
}

const closeAddAppointmentModal = () => {
  showAddModal.value = false
  // 重置表单
  newAppointment.value = {
    patientName: '',
    gender: '',
    age: '',
    phone: '',
    appointmentDate: '',
    appointmentTime: '',
    department: '',
    appointmentType: '初诊',
    remarks: ''
  }
}

const addAppointment = () => {
  // 简单验证
  if (!newAppointment.value.patientName || !newAppointment.value.gender || 
      !newAppointment.value.age || !newAppointment.value.phone ||
      !newAppointment.value.appointmentDate || !newAppointment.value.appointmentTime ||
      !newAppointment.value.department) {
    ElMessage.warning('请填写必要信息')
    return
  }

  // 手机号格式验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(newAppointment.value.phone.replace(/\*/g, '1'))) {
    ElMessage.warning('请输入正确的手机号格式')
    return
  }

  // 添加新预约
  const appointment = {
    id: Date.now(),
    ...newAppointment.value,
    age: parseInt(newAppointment.value.age),
    status: 'pending'
  }

  appointmentList.value.unshift(appointment)
  
  ElNotification({
    title: '预约成功',
    message: `已新增预约：${appointment.patientName}`,
    type: 'success'
  })

  closeAddAppointmentModal()
}

const viewAppointmentDetail = (appointment) => {
  ElMessage.info(`查看预约详情：${appointment.patientName}`)
  // 实现查看详情功能
}

const editAppointment = (appointment) => {
  ElMessage.info(`编辑预约：${appointment.patientName}`)
  // 实现编辑功能
}

const completeAppointment = (appointment) => {
  appointment.status = 'completed'
  ElMessage.success(`预约 ${appointment.patientName} 已完成`)
}

const cancelAppointment = (appointment) => {
  ElMessageBox.confirm(
    `确定要取消 "${appointment.patientName}" 的预约吗？`,
    '确认取消',
    {
      confirmButtonText: '确定取消',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    appointment.status = 'cancelled'
    ElMessage.success(`预约 ${appointment.patientName} 已取消`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const exportAppointmentData = () => {
  ElMessage.info('导出预约数据')
  // 实现导出功能
}

const importAppointmentData = () => {
  ElMessage.info('导入预约数据')
  // 实现导入功能
}

// 预约选择相关方法
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全选
    selectedAppointments.value = selectedAppointments.value.filter(
      id => !paginatedAppointments.value.some(appointment => appointment.id === id)
    )
  } else {
    // 全选当前页
    paginatedAppointments.value.forEach(appointment => {
      if (!selectedAppointments.value.includes(appointment.id)) {
        selectedAppointments.value.push(appointment.id)
      }
    })
  }
}

const toggleAppointmentSelect = (appointmentId) => {
  const index = selectedAppointments.value.indexOf(appointmentId)
  if (index > -1) {
    selectedAppointments.value.splice(index, 1)
  } else {
    selectedAppointments.value.push(appointmentId)
  }
}

const batchDeleteAppointments = () => {
  if (selectedAppointments.value.length === 0) {
    ElMessage.warning('请先选择要删除的预约记录')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedAppointments.value.length} 条预约记录吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    const deletedCount = selectedAppointments.value.length
    
    // 删除选中的预约记录
    appointmentList.value = appointmentList.value.filter(a => !selectedAppointments.value.includes(a.id))
    selectedAppointments.value = []
    
    ElNotification({
      title: '批量删除成功',
      message: `已删除 ${deletedCount} 条预约记录`,
      type: 'success'
    })
    
    // 调整页码
    if (paginatedAppointments.value.length === 0 && currentPage.value > 1) {
      currentPage.value = 1
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 路由已在上方声明
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

.appointment-manager {
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

      .filter-select {
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

      // 日期范围选择器样式
      .date-range-picker {
        display: flex;
        align-items: center;
        gap: 8px;
        background: white;
        border: 2px solid $border;
        border-radius: 8px;
        padding: 4px 8px;
        transition: all 0.3s ease;

        &:focus-within {
          border-color: $primary;
          box-shadow: 0 0 0 3px rgba($primary, 0.1);
        }

        .date-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;

          .date-input {
            border: none;
            outline: none;
            padding: 6px 8px;
            font-size: 13px;
            background: transparent;
            color: $text;
            cursor: pointer;
            min-width: 120px;

            &::-webkit-calendar-picker-indicator {
              cursor: pointer;
              opacity: 0.6;
              &:hover {
                opacity: 1;
              }
            }
          }

          .date-label {
            position: absolute;
            top: -8px;
            left: 8px;
            background: white;
            padding: 0 4px;
            font-size: 11px;
            color: #666;
            pointer-events: none;
          }
        }

        .date-separator {
          color: #666;
          font-size: 12px;
          padding: 0 4px;
        }
      }

      // 清空搜索按钮
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

  // 预约记录列表
  .appointment-list {
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
    .appointment-table-wrapper {
      overflow-x: auto;
      margin-bottom: 20px;
      border: 1px solid $border;
      border-radius: 8px;
      background: white;

      .appointment-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        min-width: 1000px;

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

          &:nth-child(1) { width: 5%; } /* 选择框 */
          &:nth-child(2) { width: 12%; } /* 预约号 */
          &:nth-child(3) { width: 15%; } /* 患者信息 */
          &:nth-child(4) { width: 15%; } /* 预约时间 */
          &:nth-child(5) { width: 10%; } /* 科室 */
          &:nth-child(6) { width: 10%; } /* 预约类型 */
          &:nth-child(7) { width: 12%; } /* 联系方式 */
          &:nth-child(8) { width: 10%; } /* 状态 */
          &:nth-child(9) { width: 11%; } /* 操作 */
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
            height: 55px;
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

            // 预约号
            .appointment-number {
              font-weight: 600;
              color: $primary;
              font-family: 'Courier New', monospace;
              font-size: 13px;
            }

            // 患者信息单元格
            .patient-name-cell {
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

            // 预约时间单元格
            .appointment-time-cell {
              line-height: 1.4;
              
              .appointment-date {
                font-weight: 500;
                color: $text;
                margin-bottom: 2px;
              }
              
              .appointment-time {
                color: #666;
                font-size: 12px;
              }
            }

            // 科室标签
            .department-badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
              background: rgba($success, 0.1);
              color: $success;
            }

            // 预约类型标签
            .appointment-type-badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
              background: rgba($warning, 0.1);
              color: $warning;
            }

            // 联系方式
            .contact-info {
              line-height: 1.4;
              .phone {
                font-weight: 500;
                color: $text;
              }
            }

            // 状态标签
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.pending { background: rgba($warning, 0.1); color: $warning; }
              &.in-progress { background: rgba($primary, 0.1); color: $primary; }
              &.completed { background: rgba($success, 0.1); color: $success; }
              &.cancelled { background: rgba($danger, 0.1); color: $danger; }
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

                &.complete:hover {
                  background: rgba($success, 0.1);
                  color: $success;
                }

                &.cancel:hover {
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
    max-width: 700px;
    width: 90%;
    max-height: 85vh;
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
    margin-left: 0; // 移动端取消左边距
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

    .filter-controls {
      .date-range-picker {
        flex-direction: column;
        gap: 12px;
        
        .date-input-wrapper {
          width: 100%;
        }
        
        .date-separator {
          display: none;
        }
      }
    }
  }

  .appointment-table-wrapper {
    font-size: 12px;

    .appointment-table {
      th, td {
        padding: 8px;
      }
    }
  }
}
</style>