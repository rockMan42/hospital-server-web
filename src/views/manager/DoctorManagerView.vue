<template>
  <div class="doctor-manager">
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
      <SideLeft :activeMenu="'doctor'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>医生管理</h1>
          <p>管理和维护医院所有医生信息</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">👨‍⚕️</div>
            <div class="card-info">
              <h3>医生总数</h3>
              <p class="number">{{ totalDoctors }}</p>
              <p class="desc">在职医生</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">✅</div>
            <div class="card-info">
              <h3>在岗医生</h3>
              <p class="number">{{ activeDoctors }}</p>
              <p class="desc">正常在岗</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">🏥</div>
            <div class="card-info">
              <h3>科室覆盖</h3>
              <p class="number">{{ departmentCoverage }}</p>
              <p class="desc">个科室</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">⏳</div>
            <div class="card-info">
              <h3>休假中</h3>
              <p class="number">{{ vacationDoctors }}</p>
              <p class="desc">休假医生</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="showAddDoctorModal">
            <span class="icon">+</span> 新增医生
          </button>
          <button class="action-btn outline" @click="exportDoctorData">
            <span class="icon">📤</span> 导出数据
          </button>
          <button class="action-btn outline" @click="importDoctorData">
            <span class="icon">📥</span> 导入数据
          </button>
          <button 
            class="action-btn danger" 
            @click="batchDeleteDoctors"
            :disabled="selectedDoctors.length === 0"
          >
            <span class="icon">🗑️</span> 批量删除 ({{ selectedDoctors.length }})
          </button>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="search-filter-section">
          <div class="search-bars">
            <!-- 医生姓名搜索 -->
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input 
                v-model="searchByName" 
                type="text" 
                placeholder="按医生姓名搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <!-- 工号搜索 -->
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <input 
                v-model="searchByEmployeeId" 
                type="text" 
                placeholder="按工号搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <!-- 科室搜索 -->
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
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
            <select v-model="selectedStatus" @change="handleFilter" class="filter-select">
              <option value="">全部状态</option>
              <option value="active">在岗</option>
              <option value="vacation">休假</option>
              <option value="suspended">停职</option>
            </select>
            
            <select v-model="selectedTitle" @change="handleFilter" class="filter-select">
              <option value="">全部职称</option>
              <option value="主任医师">主任医师</option>
              <option value="副主任医师">副主任医师</option>
              <option value="主治医师">主治医师</option>
              <option value="住院医师">住院医师</option>
            </select>

            <button class="clear-search-btn" @click="clearAllSearch" title="清空搜索">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              清空
            </button>
          </div>
        </div>

        <!-- 医生列表 -->
        <div class="doctor-list">
          <div class="list-header">
            <h2>医生列表</h2>
            <div class="list-info">
              共 {{ filteredDoctors.length }} 位医生
              <span v-if="selectedDoctors.length > 0" class="selected-info">
                ，已选择 {{ selectedDoctors.length }} 位
              </span>
            </div>
          </div>

          <!-- 医生表格 -->
          <div class="doctor-table-wrapper">
            <table class="doctor-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" class="select-checkbox">
                  </th>
                  <th>工号</th>
                  <th>医生姓名</th>
                  <th>职称</th>
                  <th>科室</th>
                  <th>专业</th>
                  <th>联系电话</th>
                  <th>入职时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doctor in paginatedDoctors" :key="doctor.id" class="table-row">
                  <td @click.stop>
                    <input 
                      type="checkbox" 
                      :checked="selectedDoctors.includes(doctor.id)" 
                      @change="toggleDoctorSelect(doctor.id)"
                      class="select-checkbox"
                    >
                  </td>
                  <td @click="viewDoctorDetail(doctor)">
                    <div class="employee-id">{{ doctor.employeeId }}</div>
                  </td>
                  <td @click="viewDoctorDetail(doctor)">
                    <div class="doctor-name-cell">
                      <div class="doctor-avatar">{{ doctor.name.charAt(0) }}</div>
                      <div>
                        <div class="doctor-name">{{ doctor.name }}</div>
                        <div class="doctor-meta">{{ doctor.gender }} | {{ doctor.age }}岁</div>
                      </div>
                    </div>
                  </td>
                  <td @click="viewDoctorDetail(doctor)">
                    <span class="title-badge" :class="getTitleClass(doctor.title)">
                      {{ doctor.title }}
                    </span>
                  </td>
                  <td @click="viewDoctorDetail(doctor)">
                    <div class="department-info">
                      <div class="department-name">{{ doctor.department }}</div>
                    </div>
                  </td>
                  <td @click="viewDoctorDetail(doctor)">
                    <span class="specialty">{{ doctor.specialty }}</span>
                  </td>
                  <td @click="viewDoctorDetail(doctor)">
                    <div class="contact-info">
                      <div class="phone">{{ doctor.phone }}</div>
                    </div>
                  </td>
                  <td @click="viewDoctorDetail(doctor)">
                    <div class="hire-date">{{ formatDate(doctor.hireDate) }}</div>
                  </td>
                  <td @click="viewDoctorDetail(doctor)">
                    <span class="status-badge" :class="doctor.status">
                      <span v-if="doctor.status === 'active'">✅ 在岗</span>
                      <span v-else-if="doctor.status === 'vacation'">🏖️ 休假</span>
                      <span v-else>⏸️ 停职</span>
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn-mini view" @click.stop="viewDoctorDetail(doctor)" title="查看详情">
                        👁️
                      </button>
                      <button class="action-btn-mini edit" @click.stop="editDoctor(doctor)" title="编辑">
                        ✏️
                      </button>
                      <button class="action-btn-mini schedule" @click.stop="manageSchedule(doctor)" title="排班">
                        📅
                      </button>
                      <button class="action-btn-mini delete" @click.stop="confirmDeleteDoctor(doctor)" title="删除">
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

    <!-- 新增医生弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddDoctorModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新增医生</h3>
          <button class="close-btn" @click="closeAddDoctorModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>医生姓名 <span class="required">*</span></label>
              <input v-model="newDoctor.name" type="text" placeholder="请输入医生姓名">
            </div>
            <div class="form-group">
              <label>工号 <span class="required">*</span></label>
              <input v-model="newDoctor.employeeId" type="text" placeholder="请输入工号">
            </div>
            <div class="form-group">
              <label>性别 <span class="required">*</span></label>
              <select v-model="newDoctor.gender">
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-group">
              <label>年龄 <span class="required">*</span></label>
              <input v-model="newDoctor.age" type="number" placeholder="请输入年龄" min="20" max="70">
            </div>
            <div class="form-group">
              <label>职称 <span class="required">*</span></label>
              <select v-model="newDoctor.title">
                <option value="">请选择职称</option>
                <option value="主任医师">主任医师</option>
                <option value="副主任医师">副主任医师</option>
                <option value="主治医师">主治医师</option>
                <option value="住院医师">住院医师</option>
              </select>
            </div>
            <div class="form-group">
              <label>科室 <span class="required">*</span></label>
              <select v-model="newDoctor.department">
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
              <label>专业</label>
              <input v-model="newDoctor.specialty" type="text" placeholder="请输入专业方向">
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="newDoctor.phone" type="text" placeholder="请输入联系电话">
            </div>
            <div class="form-group">
              <label>入职时间</label>
              <input v-model="newDoctor.hireDate" type="date">
            </div>
            <div class="form-group">
              <label>初始状态</label>
              <select v-model="newDoctor.status">
                <option value="active">在岗</option>
                <option value="vacation">休假</option>
                <option value="suspended">停职</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>备注</label>
              <textarea v-model="newDoctor.remarks" placeholder="请输入备注信息" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeAddDoctorModal">取消</button>
          <button class="action-btn primary" @click="addDoctor">确认添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import SideLeft from '@/components/manager/SideLeft.vue'
import AdminHeader from '@/components/manager/AdminHeader.vue'

// 状态管理
const dropdownVisible = ref(false)
const searchByName = ref('')
const searchByEmployeeId = ref('')
const searchByDepartment = ref('')
const selectedStatus = ref('')
const selectedTitle = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedDoctors = ref([])
const showAddModal = ref(false)

const store = useStore()
const router = useRouter()
let username = store.state.user?.username || '管理员'

// 新医生表单数据
const newDoctor = ref({
  name: '',
  employeeId: '',
  gender: '',
  age: '',
  title: '',
  department: '',
  specialty: '',
  phone: '',
  hireDate: new Date().toISOString().split('T')[0],
  status: 'active',
  remarks: ''
})

// 模拟医生数据
const doctorList = ref([
  {
    id: 1,
    name: '张医生',
    employeeId: 'DOC001',
    gender: '男',
    age: 45,
    title: '主任医师',
    department: '内科',
    specialty: '心血管内科',
    phone: '138-0000-0001',
    hireDate: '2010-03-15',
    status: 'active'
  },
  {
    id: 2,
    name: '李医生',
    employeeId: 'DOC002',
    gender: '女',
    age: 38,
    title: '副主任医师',
    department: '外科',
    specialty: '普通外科',
    phone: '138-0000-0002',
    hireDate: '2015-07-20',
    status: 'active'
  },
  {
    id: 3,
    name: '王医生',
    employeeId: 'DOC003',
    gender: '男',
    age: 42,
    title: '主治医师',
    department: '妇科',
    specialty: '妇产科',
    phone: '138-0000-0003',
    hireDate: '2012-09-10',
    status: 'vacation'
  },
  {
    id: 4,
    name: '赵医生',
    employeeId: 'DOC004',
    gender: '女',
    age: 35,
    title: '主治医师',
    department: '儿科',
    specialty: '儿童保健',
    phone: '138-0000-0004',
    hireDate: '2018-01-08',
    status: 'active'
  },
  {
    id: 5,
    name: '钱医生',
    employeeId: 'DOC005',
    gender: '男',
    age: 50,
    title: '主任医师',
    department: '骨科',
    specialty: '脊柱外科',
    phone: '138-0000-0005',
    hireDate: '2008-11-25',
    status: 'active'
  },
  {
    id: 6,
    name: '孙医生',
    employeeId: 'DOC006',
    gender: '女',
    age: 29,
    title: '住院医师',
    department: '皮肤科',
    specialty: '皮肤病学',
    phone: '138-0000-0006',
    hireDate: '2020-06-15',
    status: 'suspended'
  }
])

// 计算属性
const filteredDoctors = computed(() => {
  let filtered = doctorList.value

  // 按医生姓名搜索
  if (searchByName.value) {
    const query = searchByName.value.toLowerCase()
    filtered = filtered.filter(doctor => 
      doctor.name.toLowerCase().includes(query)
    )
  }

  // 按工号搜索
  if (searchByEmployeeId.value) {
    const query = searchByEmployeeId.value.toUpperCase()
    filtered = filtered.filter(doctor => 
      doctor.employeeId.includes(query)
    )
  }

  // 按科室搜索
  if (searchByDepartment.value) {
    const query = searchByDepartment.value.toLowerCase()
    filtered = filtered.filter(doctor => 
      doctor.department.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (selectedStatus.value) {
    filtered = filtered.filter(doctor => doctor.status === selectedStatus.value)
  }

  // 职称过滤
  if (selectedTitle.value) {
    filtered = filtered.filter(doctor => doctor.title === selectedTitle.value)
  }

  return filtered
})

const paginatedDoctors = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredDoctors.value.slice(start, end)
})

const totalDoctors = computed(() => doctorList.value.length)
const activeDoctors = computed(() => doctorList.value.filter(d => d.status === 'active').length)
const vacationDoctors = computed(() => doctorList.value.filter(d => d.status === 'vacation').length)
const departmentCoverage = computed(() => {
  const departments = new Set(doctorList.value.map(d => d.department))
  return departments.size
})
const totalPages = computed(() => Math.ceil(filteredDoctors.value.length / pageSize))

const isAllSelected = computed(() => {
  return paginatedDoctors.value.length > 0 && 
         paginatedDoctors.value.every(doctor => selectedDoctors.value.includes(doctor.id))
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

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const clearAllSearch = () => {
  searchByName.value = ''
  searchByEmployeeId.value = ''
  searchByDepartment.value = ''
  selectedStatus.value = ''
  selectedTitle.value = ''
  currentPage.value = 1
}

const changePage = (page) => {
  if (typeof page === 'number') {
    currentPage.value = page
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const getTitleClass = (title) => {
  const titleMap = {
    '主任医师': 'senior',
    '副主任医师': 'associate',
    '主治医师': 'attending',
    '住院医师': 'resident'
  }
  return titleMap[title] || 'resident'
}

const showAddDoctorModal = () => {
  showAddModal.value = true
}

const closeAddDoctorModal = () => {
  showAddModal.value = false
  // 重置表单
  newDoctor.value = {
    name: '',
    employeeId: '',
    gender: '',
    age: '',
    title: '',
    department: '',
    specialty: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active',
    remarks: ''
  }
}

const addDoctor = () => {
  // 简单验证
  if (!newDoctor.value.name || !newDoctor.value.employeeId || !newDoctor.value.gender || 
      !newDoctor.value.age || !newDoctor.value.title || !newDoctor.value.department) {
    ElMessage.warning('请填写必要信息（姓名、工号、性别、年龄、职称、科室）')
    return
  }

  // 检查工号是否重复
  const employeeIdExists = doctorList.value.some(doctor => doctor.employeeId === newDoctor.value.employeeId)
  if (employeeIdExists) {
    ElMessage.warning('工号已存在，请使用其他工号')
    return
  }

  // 添加新医生
  const doctor = {
    id: Date.now(),
    ...newDoctor.value,
    age: parseInt(newDoctor.value.age)
  }

  doctorList.value.unshift(doctor)
  
  ElNotification({
    title: '添加成功',
    message: `医生 ${doctor.name} 已成功添加`,
    type: 'success'
  })

  closeAddDoctorModal()
}

const viewDoctorDetail = (doctor) => {
  ElMessage.info(`查看医生详情：${doctor.name}`)
}

const editDoctor = (doctor) => {
  ElMessage.info(`编辑医生：${doctor.name}`)
}

const manageSchedule = (doctor) => {
  ElMessage.info(`管理排班：${doctor.name}`)
}

const confirmDeleteDoctor = (doctor) => {
  ElMessageBox.confirm(
    `确定要删除医生 "${doctor.name}" 吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    deleteDoctor(doctor.id)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const deleteDoctor = (doctorId) => {
  const index = doctorList.value.findIndex(d => d.id === doctorId)
  if (index > -1) {
    const deletedDoctor = doctorList.value[index]
    doctorList.value.splice(index, 1)
    
    // 从选中列表中移除
    const selectedIndex = selectedDoctors.value.indexOf(doctorId)
    if (selectedIndex > -1) {
      selectedDoctors.value.splice(selectedIndex, 1)
    }
    
    ElNotification({
      title: '删除成功',
      message: `医生 ${deletedDoctor.name} 已被删除`,
      type: 'success'
    })
    
    // 如果当前页没有数据且不是第一页，跳转到上一页
    if (paginatedDoctors.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }
}

const exportDoctorData = () => {
  ElMessage.info('导出医生数据')
}

const importDoctorData = () => {
  ElMessage.info('导入医生数据')
}

// 医生选择相关方法
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全选
    selectedDoctors.value = selectedDoctors.value.filter(
      id => !paginatedDoctors.value.some(doctor => doctor.id === id)
    )
  } else {
    // 全选当前页
    paginatedDoctors.value.forEach(doctor => {
      if (!selectedDoctors.value.includes(doctor.id)) {
        selectedDoctors.value.push(doctor.id)
      }
    })
  }
}

const toggleDoctorSelect = (doctorId) => {
  const index = selectedDoctors.value.indexOf(doctorId)
  if (index > -1) {
    selectedDoctors.value.splice(index, 1)
  } else {
    selectedDoctors.value.push(doctorId)
  }
}

const batchDeleteDoctors = () => {
  if (selectedDoctors.value.length === 0) {
    ElMessage.warning('请先选择要删除的医生')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedDoctors.value.length} 位医生吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    const deletedCount = selectedDoctors.value.length
    
    // 删除选中的医生
    doctorList.value = doctorList.value.filter(d => !selectedDoctors.value.includes(d.id))
    selectedDoctors.value = []
    
    ElNotification({
      title: '批量删除成功',
      message: `已删除 ${deletedCount} 位医生`,
      type: 'success'
    })
    
    // 调整页码
    if (paginatedDoctors.value.length === 0 && currentPage.value > 1) {
      currentPage.value = 1
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', () => (dropdownVisible.value = false))
})

onUnmounted(() => {
  document.removeEventListener('click', () => (dropdownVisible.value = false))
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

.doctor-manager {
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

  // 医生列表
  .doctor-list {
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
    .doctor-table-wrapper {
      overflow-x: auto;
      margin-bottom: 20px;
      border: 1px solid $border;
      border-radius: 8px;
      background: white;

      .doctor-table {
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

          &:nth-child(1) { width: 5%; } /* 选择框 */
          &:nth-child(2) { width: 10%; } /* 工号 */
          &:nth-child(3) { width: 15%; } /* 医生姓名 */
          &:nth-child(4) { width: 10%; } /* 职称 */
          &:nth-child(5) { width: 12%; } /* 科室 */
          &:nth-child(6) { width: 12%; } /* 专业 */
          &:nth-child(7) { width: 12%; } /* 联系电话 */
          &:nth-child(8) { width: 10%; } /* 入职时间 */
          &:nth-child(9) { width: 8%; } /* 状态 */
          &:nth-child(10) { width: 6%; } /* 操作 */
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

            // 工号
            .employee-id {
              font-weight: 600;
              color: $primary;
              font-family: 'Courier New', monospace;
              font-size: 13px;
            }

            // 医生姓名单元格
            .doctor-name-cell {
              display: flex;
              align-items: center;
              gap: 12px;

              .doctor-avatar {
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

              .doctor-name {
                font-weight: 600;
                color: $text;
                margin-bottom: 2px;
              }

              .doctor-meta {
                color: #666;
                font-size: 12px;
              }
            }

            // 职称标签
            .title-badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.senior {
                background: rgba($danger, 0.1);
                color: $danger;
              }

              &.associate {
                background: rgba($warning, 0.1);
                color: $warning;
              }

              &.attending {
                background: rgba($success, 0.1);
                color: $success;
              }

              &.resident {
                background: rgba($primary, 0.1);
                color: $primary;
              }
            }

            // 科室信息
            .department-info {
              line-height: 1.4;
              
              .department-name {
                font-weight: 500;
                color: $text;
              }
            }

            // 专业
            .specialty {
              color: #666;
              font-size: 12px;
            }

            // 联系方式
            .contact-info {
              line-height: 1.4;
              .phone {
                font-weight: 500;
                color: $text;
              }
            }

            // 入职时间
            .hire-date {
              color: #666;
              font-size: 12px;
            }

            // 状态标签
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.active { background: rgba($success, 0.1); color: $success; }
              &.vacation { background: rgba($warning, 0.1); color: $warning; }
              &.suspended { background: rgba($danger, 0.1); color: $danger; }
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

                &.schedule:hover {
                  background: rgba($purple, 0.1);
                  color: $purple;
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

  .doctor-table-wrapper {
    font-size: 12px;

    .doctor-table {
      th, td {
        padding: 8px;
      }
    }
  }
}
</style>