<template>
  <div class="schedule-manager">
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
      <SideLeft :activeMenu="'schedule'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>门诊日程</h1>
          <p>管理和查看医院门诊排班安排</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">📅</div>
            <div class="card-info">
              <h3>今日排班</h3>
              <p class="number">{{ todaySchedules }}</p>
              <p class="desc">个排班安排</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">👨‍⚕️</div>
            <div class="card-info">
              <h3>在岗医生</h3>
              <p class="number">{{ onDutyDoctors }}</p>
              <p class="desc">位医生在岗</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">🏥</div>
            <div class="card-info">
              <h3>开放科室</h3>
              <p class="number">{{ openDepartments }}</p>
              <p class="desc">个科室开放</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">⏰</div>
            <div class="card-info">
              <h3>本周排班</h3>
              <p class="number">{{ weeklySchedules }}</p>
              <p class="desc">个排班计划</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="showAddScheduleModal">
            <span class="icon">➕</span> 新增排班
          </button>
          <button class="action-btn outline" @click="generateWeeklySchedule">
            <span class="icon">🗓️</span> 生成周排班
          </button>
          <button class="action-btn outline" @click="exportSchedule">
            <span class="icon">📤</span> 导出排班表
          </button>
          <button class="action-btn outline" @click="importSchedule">
            <span class="icon">📥</span> 导入排班表
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
                v-model="searchByDepartment" 
                type="text" 
                placeholder="按科室搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>
          </div>
          
          <div class="filter-controls">
            <select v-model="selectedShift" @change="handleFilter" class="filter-select">
              <option value="">全部班次</option>
              <option value="morning">上午班</option>
              <option value="afternoon">下午班</option>
              <option value="evening">晚班</option>
              <option value="night">夜班</option>
            </select>
            
            <select v-model="selectedStatus" @change="handleFilter" class="filter-select">
              <option value="">全部状态</option>
              <option value="scheduled">已排班</option>
              <option value="on-duty">值班中</option>
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

        <!-- 日程视图切换 -->
        <div class="view-switcher">
          <div class="view-tabs">
            <button 
              class="view-tab" 
              :class="{ active: currentView === 'table' }"
              @click="currentView = 'table'"
            >
              📋 表格视图
            </button>
            <button 
              class="view-tab" 
              :class="{ active: currentView === 'calendar' }"
              @click="currentView = 'calendar'"
            >
              📅 日历视图
            </button>
          </div>
        </div>

        <!-- 表格视图 -->
        <div v-if="currentView === 'table'" class="schedule-table-view">
          <div class="schedule-list">
            <div class="list-header">
              <h2>排班列表</h2>
              <div class="list-info">
                共 {{ filteredSchedules.length }} 个排班安排
              </div>
            </div>

            <div class="schedule-table-wrapper">
              <table class="schedule-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>班次</th>
                    <th>医生</th>
                    <th>科室</th>
                    <th>诊室</th>
                    <th>时间段</th>
                    <th>预约限额</th>
                    <th>已预约</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="schedule in paginatedSchedules" :key="schedule.id" class="table-row">
                    <td>
                      <div class="date-cell">
                        <div class="date">{{ formatDate(schedule.date) }}</div>
                        <div class="weekday">{{ getWeekday(schedule.date) }}</div>
                      </div>
                    </td>
                    <td>
                      <span class="shift-badge" :class="schedule.shift">
                        {{ getShiftName(schedule.shift) }}
                      </span>
                    </td>
                    <td>
                      <div class="doctor-cell">
                        <div class="doctor-avatar">{{ schedule.doctorName.charAt(0) }}</div>
                        <div>
                          <div class="doctor-name">{{ schedule.doctorName }}</div>
                          <div class="doctor-title">{{ schedule.doctorTitle }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="department-badge">{{ schedule.department }}</span>
                    </td>
                    <td>{{ schedule.room }}</td>
                    <td>{{ schedule.timeSlot }}</td>
                    <td>{{ schedule.maxAppointments }}</td>
                    <td>
                      <span class="appointment-count" :class="{ 'full': schedule.currentAppointments >= schedule.maxAppointments }">
                        {{ schedule.currentAppointments }}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" :class="schedule.status">
                        {{ getStatusName(schedule.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="action-btn-mini edit" @click="editSchedule(schedule)" title="编辑">
                          ✏️
                        </button>
                        <button class="action-btn-mini view" @click="viewScheduleDetail(schedule)" title="查看详情">
                          👁️
                        </button>
                        <button class="action-btn-mini delete" @click="cancelSchedule(schedule)" title="取消排班">
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
        </div>

        <!-- 日历视图 -->
        <div v-if="currentView === 'calendar'" class="schedule-calendar-view">
          <div class="calendar-header">
            <button class="nav-btn" @click="previousWeek">‹</button>
            <h3>{{ currentWeekRange }}</h3>
            <button class="nav-btn" @click="nextWeek">›</button>
          </div>
          
          <div class="calendar-grid">
            <div class="calendar-header-row">
              <div class="time-column">时间</div>
              <div v-for="day in weekDays" :key="day.date" class="day-column">
                <div class="day-header">
                  <div class="day-name">{{ day.name }}</div>
                  <div class="day-date">{{ day.date }}</div>
                </div>
              </div>
            </div>
            
            <div class="calendar-body">
              <div v-for="timeSlot in timeSlots" :key="timeSlot" class="time-row">
                <div class="time-cell">{{ timeSlot }}</div>
                <div v-for="day in weekDays" :key="`${day.date}-${timeSlot}`" class="schedule-cell">
                  <div 
                    v-for="schedule in getScheduleForDayAndTime(day.date, timeSlot)" 
                    :key="schedule.id"
                    class="schedule-item"
                    :class="schedule.status"
                    @click="viewScheduleDetail(schedule)"
                  >
                    <div class="schedule-doctor">{{ schedule.doctorName }}</div>
                    <div class="schedule-department">{{ schedule.department }}</div>
                    <div class="schedule-room">{{ schedule.room }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 新增排班弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddScheduleModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新增排班</h3>
          <button class="close-btn" @click="closeAddScheduleModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>医生 <span class="required">*</span></label>
              <select v-model="newSchedule.doctorId">
                <option value="">请选择医生</option>
                <option v-for="doctor in availableDoctors" :key="doctor.id" :value="doctor.id">
                  {{ doctor.name }} - {{ doctor.department }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>日期 <span class="required">*</span></label>
              <input v-model="newSchedule.date" type="date">
            </div>
            <div class="form-group">
              <label>班次 <span class="required">*</span></label>
              <select v-model="newSchedule.shift">
                <option value="">请选择班次</option>
                <option value="morning">上午班</option>
                <option value="afternoon">下午班</option>
                <option value="evening">晚班</option>
                <option value="night">夜班</option>
              </select>
            </div>
            <div class="form-group">
              <label>诊室</label>
              <input v-model="newSchedule.room" type="text" placeholder="请输入诊室号">
            </div>
            <div class="form-group">
              <label>时间段</label>
              <input v-model="newSchedule.timeSlot" type="text" placeholder="如：08:00-12:00">
            </div>
            <div class="form-group">
              <label>预约限额</label>
              <input v-model="newSchedule.maxAppointments" type="number" placeholder="最大预约数" min="1">
            </div>
            <div class="form-group full-width">
              <label>备注</label>
              <textarea v-model="newSchedule.remarks" placeholder="请输入备注信息" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeAddScheduleModal">取消</button>
          <button class="action-btn primary" @click="addSchedule">确认添加</button>
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
const searchByDepartment = ref('')
const selectedShift = ref('')
const selectedStatus = ref('')
const selectedDate = ref('')
const currentPage = ref(1)
const pageSize = 10
const showAddModal = ref(false)
const currentView = ref('table') // 'table' 或 'calendar'
const currentWeek = ref(new Date())

const store = useStore()
const router = useRouter()

// 新排班表单数据
const newSchedule = ref({
  doctorId: '',
  date: '',
  shift: '',
  room: '',
  timeSlot: '',
  maxAppointments: 20,
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

// 模拟排班数据
const scheduleList = ref([
  {
    id: 1,
    doctorName: '张医生',
    doctorTitle: '主任医师',
    department: '心血管内科',
    date: '2025-09-22',
    shift: 'morning',
    room: '101',
    timeSlot: '08:00-12:00',
    maxAppointments: 20,
    currentAppointments: 15,
    status: 'scheduled'
  },
  {
    id: 2,
    doctorName: '李医生',
    doctorTitle: '副主任医师',
    department: '骨科',
    date: '2025-09-22',
    shift: 'afternoon',
    room: '203',
    timeSlot: '14:00-18:00',
    maxAppointments: 15,
    currentAppointments: 12,
    status: 'on-duty'
  },
  {
    id: 3,
    doctorName: '王医生',
    doctorTitle: '主治医师',
    department: '妇产科',
    date: '2025-09-23',
    shift: 'morning',
    room: '305',
    timeSlot: '08:00-12:00',
    maxAppointments: 25,
    currentAppointments: 25,
    status: 'scheduled'
  },
  {
    id: 4,
    doctorName: '刘医生',
    doctorTitle: '主治医师',
    department: '儿科',
    date: '2025-09-23',
    shift: 'afternoon',
    room: '401',
    timeSlot: '14:00-18:00',
    maxAppointments: 30,
    currentAppointments: 18,
    status: 'scheduled'
  },
  {
    id: 5,
    doctorName: '陈医生',
    doctorTitle: '主任医师',
    department: '急诊科',
    date: '2025-09-24',
    shift: 'night',
    room: '501',
    timeSlot: '20:00-08:00',
    maxAppointments: 10,
    currentAppointments: 3,
    status: 'scheduled'
  }
])

// 计算属性
const filteredSchedules = computed(() => {
  let filtered = scheduleList.value

  // 按医生搜索
  if (searchByDoctor.value) {
    const query = searchByDoctor.value.toLowerCase()
    filtered = filtered.filter(schedule => 
      schedule.doctorName.toLowerCase().includes(query)
    )
  }

  // 按科室搜索
  if (searchByDepartment.value) {
    const query = searchByDepartment.value.toLowerCase()
    filtered = filtered.filter(schedule => 
      schedule.department.toLowerCase().includes(query)
    )
  }

  // 班次过滤
  if (selectedShift.value) {
    filtered = filtered.filter(schedule => schedule.shift === selectedShift.value)
  }

  // 状态过滤
  if (selectedStatus.value) {
    filtered = filtered.filter(schedule => schedule.status === selectedStatus.value)
  }

  // 日期过滤
  if (selectedDate.value) {
    filtered = filtered.filter(schedule => schedule.date === selectedDate.value)
  }

  return filtered
})

const paginatedSchedules = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredSchedules.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredSchedules.value.length / pageSize))

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

// 统计数据
const todaySchedules = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return scheduleList.value.filter(s => s.date === today).length
})

const onDutyDoctors = computed(() => {
  return scheduleList.value.filter(s => s.status === 'on-duty').length
})

const openDepartments = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const departments = new Set(scheduleList.value.filter(s => s.date === today).map(s => s.department))
  return departments.size
})

const weeklySchedules = computed(() => {
  const today = new Date()
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
  
  return scheduleList.value.filter(s => {
    const scheduleDate = new Date(s.date)
    return scheduleDate >= weekStart && scheduleDate <= weekEnd
  }).length
})

// 日历视图相关
const weekDays = computed(() => {
  const days = []
  const startOfWeek = new Date(currentWeek.value)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    days.push({
      name: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][i],
      date: day.toISOString().split('T')[0]
    })
  }
  
  return days
})

const currentWeekRange = computed(() => {
  const start = weekDays.value[0].date
  const end = weekDays.value[6].date
  return `${start} - ${end}`
})

const timeSlots = ref([
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
  '19:00-20:00', '20:00-21:00'
])

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
  searchByDepartment.value = ''
  selectedShift.value = ''
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

const getShiftName = (shift) => {
  const names = {
    morning: '上午班',
    afternoon: '下午班',
    evening: '晚班',
    night: '夜班'
  }
  return names[shift] || '未知'
}

const getStatusName = (status) => {
  const names = {
    scheduled: '已排班',
    'on-duty': '值班中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return names[status] || '未知'
}

const showAddScheduleModal = () => {
  showAddModal.value = true
}

const closeAddScheduleModal = () => {
  showAddModal.value = false
  newSchedule.value = {
    doctorId: '',
    date: '',
    shift: '',
    room: '',
    timeSlot: '',
    maxAppointments: 20,
    remarks: ''
  }
}

const addSchedule = () => {
  if (!newSchedule.value.doctorId || !newSchedule.value.date || !newSchedule.value.shift) {
    ElMessage.warning('请填写必要信息')
    return
  }

  const doctor = availableDoctors.value.find(d => d.id == newSchedule.value.doctorId)
  const schedule = {
    id: Date.now(),
    doctorName: doctor.name,
    doctorTitle: doctor.title,
    department: doctor.department,
    date: newSchedule.value.date,
    shift: newSchedule.value.shift,
    room: newSchedule.value.room || '待分配',
    timeSlot: newSchedule.value.timeSlot || getDefaultTimeSlot(newSchedule.value.shift),
    maxAppointments: newSchedule.value.maxAppointments,
    currentAppointments: 0,
    status: 'scheduled'
  }

  scheduleList.value.unshift(schedule)
  
  ElNotification({
    title: '排班成功',
    message: `已为 ${doctor.name} 安排 ${formatDate(schedule.date)} 的排班`,
    type: 'success'
  })

  closeAddScheduleModal()
}

const getDefaultTimeSlot = (shift) => {
  const slots = {
    morning: '08:00-12:00',
    afternoon: '14:00-18:00',
    evening: '18:00-22:00',
    night: '22:00-08:00'
  }
  return slots[shift] || '08:00-18:00'
}

const editSchedule = (schedule) => {
  ElMessage.info(`编辑排班：${schedule.doctorName}`)
}

const viewScheduleDetail = (schedule) => {
  ElMessage.info(`查看排班详情：${schedule.doctorName} - ${schedule.date}`)
}

const cancelSchedule = (schedule) => {
  ElMessageBox.confirm(
    `确定要取消 ${schedule.doctorName} 在 ${schedule.date} 的排班吗？`,
    '确认取消',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    schedule.status = 'cancelled'
    ElMessage.success('排班已取消')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const generateWeeklySchedule = () => {
  ElMessage.info('生成周排班功能开发中...')
}

const exportSchedule = () => {
  ElMessage.success('导出排班表功能开发中...')
}

const importSchedule = () => {
  ElMessage.success('导入排班表功能开发中...')
}

// 日历视图方法
const previousWeek = () => {
  const newWeek = new Date(currentWeek.value)
  newWeek.setDate(newWeek.getDate() - 7)
  currentWeek.value = newWeek
}

const nextWeek = () => {
  const newWeek = new Date(currentWeek.value)
  newWeek.setDate(newWeek.getDate() + 7)
  currentWeek.value = newWeek
}

const getScheduleForDayAndTime = (date, timeSlot) => {
  return scheduleList.value.filter(schedule => {
    return schedule.date === date && schedule.timeSlot.includes(timeSlot.split('-')[0])
  })
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

.schedule-manager {
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

  // 视图切换
  .view-switcher {
    margin-bottom: 20px;

    .view-tabs {
      display: flex;
      gap: 8px;
      background: white;
      padding: 4px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      width: fit-content;

      .view-tab {
        padding: 10px 16px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        color: #666;

        &.active {
          background: $primary;
          color: white;
        }

        &:hover:not(.active) {
          background: rgba($primary, 0.1);
          color: $primary;
        }
      }
    }
  }

  // 排班列表
  .schedule-list {
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
      }
    }

    // 表格样式
    .schedule-table-wrapper {
      overflow-x: auto;
      margin-bottom: 20px;
      border: 1px solid $border;
      border-radius: 8px;
      background: white;

      .schedule-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 1000px;

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

        .shift-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;

          &.morning { background: rgba($success, 0.1); color: $success; }
          &.afternoon { background: rgba($primary, 0.1); color: $primary; }
          &.evening { background: rgba($warning, 0.1); color: $warning; }
          &.night { background: rgba($purple, 0.1); color: $purple; }
        }

        .department-badge {
          padding: 4px 8px;
          background: rgba($teal, 0.1);
          color: $teal;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;

          &.scheduled { background: rgba($primary, 0.1); color: $primary; }
          &.on-duty { background: rgba($success, 0.1); color: $success; }
          &.completed { background: rgba($success, 0.2); color: $success; }
          &.cancelled { background: rgba($danger, 0.1); color: $danger; }
        }

        .appointment-count {
          font-weight: 500;
          &.full { color: $danger; }
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

            &.delete {
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

  // 日历视图
  .schedule-calendar-view {
    @include card;

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        color: $text;
      }

      .nav-btn {
        width: 32px;
        height: 32px;
        border: 1px solid $border;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: all 0.2s ease;

        &:hover {
          border-color: $primary;
          color: $primary;
        }
      }
    }

    .calendar-grid {
      border: 1px solid $border;
      border-radius: 8px;
      overflow: hidden;

      .calendar-header-row {
        display: grid;
        grid-template-columns: 100px repeat(7, 1fr);
        background: $light;

        .time-column, .day-column {
          padding: 12px 8px;
          border-right: 1px solid $border;
          text-align: center;
          font-weight: 600;
          font-size: 13px;

          &:last-child {
            border-right: none;
          }
        }

        .day-header {
          .day-name {
            color: $text;
          }
          .day-date {
            font-size: 12px;
            color: #999;
            margin-top: 2px;
          }
        }
      }

      .calendar-body {
        .time-row {
          display: grid;
          grid-template-columns: 100px repeat(7, 1fr);
          border-bottom: 1px solid $border;

          &:last-child {
            border-bottom: none;
          }

          .time-cell {
            padding: 12px 8px;
            border-right: 1px solid $border;
            background: $light;
            font-size: 12px;
            color: #666;
            text-align: center;
          }

          .schedule-cell {
            padding: 4px;
            border-right: 1px solid $border;
            min-height: 60px;
            position: relative;

            &:last-child {
              border-right: none;
            }

            .schedule-item {
              background: rgba($primary, 0.1);
              border: 1px solid rgba($primary, 0.3);
              border-radius: 4px;
              padding: 4px 6px;
              margin-bottom: 2px;
              cursor: pointer;
              transition: all 0.2s ease;

              &:hover {
                background: rgba($primary, 0.2);
              }

              &.on-duty {
                background: rgba($success, 0.1);
                border-color: rgba($success, 0.3);
              }

              &.completed {
                background: rgba($success, 0.2);
                border-color: rgba($success, 0.4);
              }

              &.cancelled {
                background: rgba($danger, 0.1);
                border-color: rgba($danger, 0.3);
              }

              .schedule-doctor {
                font-size: 11px;
                font-weight: 500;
                color: $text;
              }

              .schedule-department {
                font-size: 10px;
                color: #666;
              }

              .schedule-room {
                font-size: 10px;
                color: #999;
              }
            }
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
    width: 90%;
    max-width: 600px;
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
}
</style>