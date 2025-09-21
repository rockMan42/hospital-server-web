<template>
  <div class="department-manager">
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
      <SideLeft :activeMenu="'department'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>科室管理</h1>
          <p>管理和维护医院所有科室信息</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">🏥</div>
            <div class="card-info">
              <h3>科室总数</h3>
              <p class="number">{{ totalDepartments }}</p>
              <p class="desc">已创建科室</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">✅</div>
            <div class="card-info">
              <h3>正常运营</h3>
              <p class="number">{{ activeDepartments }}</p>
              <p class="desc">正常开放科室</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">👨‍⚕️</div>
            <div class="card-info">
              <h3>医生总数</h3>
              <p class="number">{{ totalDoctors }}</p>
              <p class="desc">在职医生</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">⏳</div>
            <div class="card-info">
              <h3>维护中</h3>
              <p class="number">{{ maintenanceDepartments }}</p>
              <p class="desc">维护中科室</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="showAddDepartmentModal">
            <span class="icon">+</span> 新建科室
          </button>
          <button class="action-btn outline" @click="exportDepartmentData">
            <span class="icon">📤</span> 导出数据
          </button>
          <button class="action-btn outline" @click="importDepartmentData">
            <span class="icon">📥</span> 导入数据
          </button>
          <button 
            class="action-btn danger" 
            @click="batchDeleteDepartments"
            :disabled="selectedDepartments.length === 0"
          >
            <span class="icon">🗑️</span> 批量删除 ({{ selectedDepartments.length }})
          </button>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="search-filter-section">
          <div class="search-bars">
            <!-- 科室名称搜索 -->
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                v-model="searchByName" 
                type="text" 
                placeholder="按科室名称搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <!-- 科室代码搜索 -->
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <input 
                v-model="searchByCode" 
                type="text" 
                placeholder="按科室代码搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <!-- 主任医师搜索 -->
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input 
                v-model="searchByDirector" 
                type="text" 
                placeholder="按主任医师搜索..."
                class="search-input"
                @input="handleSearch"
              />
            </div>
          </div>
          
          <div class="filter-controls">
            <select v-model="selectedStatus" @change="handleFilter" class="filter-select">
              <option value="">全部状态</option>
              <option value="active">正常运营</option>
              <option value="maintenance">维护中</option>
              <option value="suspended">暂停服务</option>
            </select>
            
            <select v-model="selectedType" @change="handleFilter" class="filter-select">
              <option value="">全部类型</option>
              <option value="clinical">临床科室</option>
              <option value="medical">医技科室</option>
              <option value="administrative">行政科室</option>
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

        <!-- 科室列表 -->
        <div class="department-list">
          <div class="list-header">
            <h2>科室列表</h2>
            <div class="list-info">
              共 {{ filteredDepartments.length }} 个科室
              <span v-if="selectedDepartments.length > 0" class="selected-info">
                ，已选择 {{ selectedDepartments.length }} 个
              </span>
            </div>
          </div>

          <!-- 科室表格 -->
          <div class="department-table-wrapper">
            <table class="department-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" class="select-checkbox">
                  </th>
                  <th>科室代码</th>
                  <th>科室名称</th>
                  <th>科室类型</th>
                  <th>主任医师</th>
                  <th>医生数量</th>
                  <th>诊室数量</th>
                  <th>联系电话</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="department in paginatedDepartments" :key="department.id" class="table-row">
                  <td @click.stop>
                    <input 
                      type="checkbox" 
                      :checked="selectedDepartments.includes(department.id)" 
                      @change="toggleDepartmentSelect(department.id)"
                      class="select-checkbox"
                    >
                  </td>
                  <td @click="viewDepartmentDetail(department)">
                    <div class="department-code">{{ department.code }}</div>
                  </td>
                  <td @click="viewDepartmentDetail(department)">
                    <div class="department-name-cell">
                      <div class="department-icon">{{ department.name.charAt(0) }}</div>
                      <div>
                        <div class="department-name">{{ department.name }}</div>
                        <div class="department-meta">成立于 {{ department.establishedYear }}</div>
                      </div>
                    </div>
                  </td>
                  <td @click="viewDepartmentDetail(department)">
                    <span class="type-badge" :class="department.type">
                      <span v-if="department.type === 'clinical'">临床科室</span>
                      <span v-else-if="department.type === 'medical'">医技科室</span>
                      <span v-else>行政科室</span>
                    </span>
                  </td>
                  <td @click="viewDepartmentDetail(department)">
                    <div class="director-info">
                      <div class="director-name">{{ department.director }}</div>
                      <div class="director-title">{{ department.directorTitle }}</div>
                    </div>
                  </td>
                  <td @click="viewDepartmentDetail(department)">
                    <span class="count-number">{{ department.doctorCount }}</span>
                  </td>
                  <td @click="viewDepartmentDetail(department)">
                    <span class="count-number">{{ department.roomCount }}</span>
                  </td>
                  <td @click="viewDepartmentDetail(department)">
                    <div class="contact-info">
                      <div class="phone">{{ department.phone }}</div>
                    </div>
                  </td>
                  <td @click="viewDepartmentDetail(department)">
                    <span class="status-badge" :class="department.status">
                      <span v-if="department.status === 'active'">✅ 正常运营</span>
                      <span v-else-if="department.status === 'maintenance'">🔧 维护中</span>
                      <span v-else>⏸️ 暂停服务</span>
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn-mini view" @click.stop="viewDepartmentDetail(department)" title="查看详情">
                        👁️
                      </button>
                      <button class="action-btn-mini edit" @click.stop="editDepartment(department)" title="编辑">
                        ✏️
                      </button>
                      <button class="action-btn-mini settings" @click.stop="manageDepartment(department)" title="管理">
                        ⚙️
                      </button>
                      <button class="action-btn-mini delete" @click.stop="confirmDeleteDepartment(department)" title="删除">
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

    <!-- 新增科室弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddDepartmentModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新增科室</h3>
          <button class="close-btn" @click="closeAddDepartmentModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>科室名称 <span class="required">*</span></label>
              <input v-model="newDepartment.name" type="text" placeholder="请输入科室名称">
            </div>
            <div class="form-group">
              <label>科室代码 <span class="required">*</span></label>
              <input v-model="newDepartment.code" type="text" placeholder="请输入科室代码">
            </div>
            <div class="form-group">
              <label>科室类型 <span class="required">*</span></label>
              <select v-model="newDepartment.type">
                <option value="">请选择类型</option>
                <option value="clinical">临床科室</option>
                <option value="medical">医技科室</option>
                <option value="administrative">行政科室</option>
              </select>
            </div>
            <div class="form-group">
              <label>主任医师</label>
              <input v-model="newDepartment.director" type="text" placeholder="请输入主任医师姓名">
            </div>
            <div class="form-group">
              <label>职称</label>
              <input v-model="newDepartment.directorTitle" type="text" placeholder="请输入职称">
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="newDepartment.phone" type="text" placeholder="请输入联系电话">
            </div>
            <div class="form-group">
              <label>成立年份</label>
              <input v-model="newDepartment.establishedYear" type="number" placeholder="请输入成立年份" min="1900" max="2025">
            </div>
            <div class="form-group">
              <label>初始状态</label>
              <select v-model="newDepartment.status">
                <option value="active">正常运营</option>
                <option value="maintenance">维护中</option>
                <option value="suspended">暂停服务</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>科室描述</label>
              <textarea v-model="newDepartment.description" placeholder="请输入科室描述信息" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeAddDepartmentModal">取消</button>
          <button class="action-btn primary" @click="addDepartment">确认添加</button>
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
const searchByCode = ref('')
const searchByDirector = ref('')
const selectedStatus = ref('')
const selectedType = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedDepartments = ref([])
const showAddModal = ref(false)

const store = useStore()
const router = useRouter()
let username = store.state.user?.username || '管理员'

// 新科室表单数据
const newDepartment = ref({
  name: '',
  code: '',
  type: '',
  director: '',
  directorTitle: '',
  phone: '',
  establishedYear: new Date().getFullYear(),
  status: 'active',
  description: ''
})

// 模拟科室数据
const departmentList = ref([
  {
    id: 1,
    name: '内科',
    code: 'DEPT001',
    type: 'clinical',
    director: '张主任',
    directorTitle: '主任医师',
    doctorCount: 15,
    roomCount: 8,
    phone: '010-12345678',
    establishedYear: 1985,
    status: 'active',
    description: '负责内科疾病的诊断和治疗'
  },
  {
    id: 2,
    name: '外科',
    code: 'DEPT002',
    type: 'clinical',
    director: '李主任',
    directorTitle: '主任医师',
    doctorCount: 12,
    roomCount: 6,
    phone: '010-12345679',
    establishedYear: 1987,
    status: 'active',
    description: '负责外科手术和治疗'
  },
  {
    id: 3,
    name: '妇科',
    code: 'DEPT003',
    type: 'clinical',
    director: '王主任',
    directorTitle: '主任医师',
    doctorCount: 8,
    roomCount: 4,
    phone: '010-12345680',
    establishedYear: 1990,
    status: 'active',
    description: '专门负责妇科疾病诊治'
  },
  {
    id: 4,
    name: '儿科',
    code: 'DEPT004',
    type: 'clinical',
    director: '赵主任',
    directorTitle: '副主任医师',
    doctorCount: 10,
    roomCount: 5,
    phone: '010-12345681',
    establishedYear: 1992,
    status: 'active',
    description: '专门负责儿童疾病诊治'
  },
  {
    id: 5,
    name: '放射科',
    code: 'DEPT005',
    type: 'medical',
    director: '钱主任',
    directorTitle: '主任医师',
    doctorCount: 6,
    roomCount: 3,
    phone: '010-12345682',
    establishedYear: 1995,
    status: 'maintenance',
    description: '负责医学影像检查'
  },
  {
    id: 6,
    name: '检验科',
    code: 'DEPT006',
    type: 'medical',
    director: '孙主任',
    directorTitle: '主任技师',
    doctorCount: 8,
    roomCount: 2,
    phone: '010-12345683',
    establishedYear: 1988,
    status: 'active',
    description: '负责各类医学检验'
  },
  {
    id: 7,
    name: '行政办公室',
    code: 'DEPT007',
    type: 'administrative',
    director: '周主任',
    directorTitle: '主任',
    doctorCount: 0,
    roomCount: 5,
    phone: '010-12345684',
    establishedYear: 1980,
    status: 'active',
    description: '负责医院行政管理工作'
  },
  {
    id: 8,
    name: '骨科',
    code: 'DEPT008',
    type: 'clinical',
    director: '吴主任',
    directorTitle: '主任医师',
    doctorCount: 9,
    roomCount: 4,
    phone: '010-12345685',
    establishedYear: 2000,
    status: 'suspended',
    description: '专门负责骨科疾病诊治'
  }
])

// 计算属性
const filteredDepartments = computed(() => {
  let filtered = departmentList.value

  // 按科室名称搜索
  if (searchByName.value) {
    const query = searchByName.value.toLowerCase()
    filtered = filtered.filter(department => 
      department.name.toLowerCase().includes(query)
    )
  }

  // 按科室代码搜索
  if (searchByCode.value) {
    const query = searchByCode.value.toUpperCase()
    filtered = filtered.filter(department => 
      department.code.includes(query)
    )
  }

  // 按主任医师搜索
  if (searchByDirector.value) {
    const query = searchByDirector.value.toLowerCase()
    filtered = filtered.filter(department => 
      department.director.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (selectedStatus.value) {
    filtered = filtered.filter(department => department.status === selectedStatus.value)
  }

  // 类型过滤
  if (selectedType.value) {
    filtered = filtered.filter(department => department.type === selectedType.value)
  }

  return filtered
})

const paginatedDepartments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredDepartments.value.slice(start, end)
})

const totalDepartments = computed(() => departmentList.value.length)
const activeDepartments = computed(() => departmentList.value.filter(d => d.status === 'active').length)
const maintenanceDepartments = computed(() => departmentList.value.filter(d => d.status === 'maintenance').length)
const totalDoctors = computed(() => departmentList.value.reduce((sum, dept) => sum + dept.doctorCount, 0))
const totalPages = computed(() => Math.ceil(filteredDepartments.value.length / pageSize))

const isAllSelected = computed(() => {
  return paginatedDepartments.value.length > 0 && 
         paginatedDepartments.value.every(department => selectedDepartments.value.includes(department.id))
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
  searchByCode.value = ''
  searchByDirector.value = ''
  selectedStatus.value = ''
  selectedType.value = ''
  currentPage.value = 1
}

const changePage = (page) => {
  if (typeof page === 'number') {
    currentPage.value = page
  }
}

const showAddDepartmentModal = () => {
  showAddModal.value = true
}

const closeAddDepartmentModal = () => {
  showAddModal.value = false
  // 重置表单
  newDepartment.value = {
    name: '',
    code: '',
    type: '',
    director: '',
    directorTitle: '',
    phone: '',
    establishedYear: new Date().getFullYear(),
    status: 'active',
    description: ''
  }
}

const addDepartment = () => {
  // 简单验证
  if (!newDepartment.value.name || !newDepartment.value.code || !newDepartment.value.type) {
    ElMessage.warning('请填写必要信息（科室名称、代码、类型）')
    return
  }

  // 检查科室代码是否重复
  const codeExists = departmentList.value.some(dept => dept.code === newDepartment.value.code)
  if (codeExists) {
    ElMessage.warning('科室代码已存在，请使用其他代码')
    return
  }

  // 添加新科室
  const department = {
    id: Date.now(),
    ...newDepartment.value,
    doctorCount: 0,
    roomCount: 0,
    establishedYear: parseInt(newDepartment.value.establishedYear)
  }

  departmentList.value.unshift(department)
  
  ElNotification({
    title: '添加成功',
    message: `科室 ${department.name} 已成功添加`,
    type: 'success'
  })

  closeAddDepartmentModal()
}

const viewDepartmentDetail = (department) => {
  ElMessage.info(`查看科室详情：${department.name}`)
  // 实现查看详情功能
}

const editDepartment = (department) => {
  ElMessage.info(`编辑科室：${department.name}`)
  // 实现编辑功能
}

const manageDepartment = (department) => {
  ElMessage.info(`管理科室：${department.name}`)
  // 实现科室管理功能
}

const confirmDeleteDepartment = (department) => {
  ElMessageBox.confirm(
    `确定要删除科室 "${department.name}" 吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    deleteDepartment(department.id)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const deleteDepartment = (departmentId) => {
  const index = departmentList.value.findIndex(d => d.id === departmentId)
  if (index > -1) {
    const deletedDepartment = departmentList.value[index]
    departmentList.value.splice(index, 1)
    
    // 从选中列表中移除
    const selectedIndex = selectedDepartments.value.indexOf(departmentId)
    if (selectedIndex > -1) {
      selectedDepartments.value.splice(selectedIndex, 1)
    }
    
    ElNotification({
      title: '删除成功',
      message: `科室 ${deletedDepartment.name} 已被删除`,
      type: 'success'
    })
    
    // 如果当前页没有数据且不是第一页，跳转到上一页
    if (paginatedDepartments.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }
}

const exportDepartmentData = () => {
  ElMessage.info('导出科室数据')
  // 实现导出功能
}

const importDepartmentData = () => {
  ElMessage.info('导入科室数据')
  // 实现导入功能
}

// 科室选择相关方法
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全选
    selectedDepartments.value = selectedDepartments.value.filter(
      id => !paginatedDepartments.value.some(department => department.id === id)
    )
  } else {
    // 全选当前页
    paginatedDepartments.value.forEach(department => {
      if (!selectedDepartments.value.includes(department.id)) {
        selectedDepartments.value.push(department.id)
      }
    })
  }
}

const toggleDepartmentSelect = (departmentId) => {
  const index = selectedDepartments.value.indexOf(departmentId)
  if (index > -1) {
    selectedDepartments.value.splice(index, 1)
  } else {
    selectedDepartments.value.push(departmentId)
  }
}

const batchDeleteDepartments = () => {
  if (selectedDepartments.value.length === 0) {
    ElMessage.warning('请先选择要删除的科室')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedDepartments.value.length} 个科室吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    const deletedCount = selectedDepartments.value.length
    
    // 删除选中的科室
    departmentList.value = departmentList.value.filter(d => !selectedDepartments.value.includes(d.id))
    selectedDepartments.value = []
    
    ElNotification({
      title: '批量删除成功',
      message: `已删除 ${deletedCount} 个科室`,
      type: 'success'
    })
    
    // 调整页码
    if (paginatedDepartments.value.length === 0 && currentPage.value > 1) {
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

.department-manager {
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

// 侧边栏样式已移至SideLeft组件中

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

  // 科室列表
  .department-list {
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
    .department-table-wrapper {
      overflow-x: auto;
      margin-bottom: 20px;
      border: 1px solid $border;
      border-radius: 8px;
      background: white;

      .department-table {
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
          &:nth-child(2) { width: 10%; } /* 科室代码 */
          &:nth-child(3) { width: 15%; } /* 科室名称 */
          &:nth-child(4) { width: 10%; } /* 科室类型 */
          &:nth-child(5) { width: 15%; } /* 主任医师 */
          &:nth-child(6) { width: 8%; } /* 医生数量 */
          &:nth-child(7) { width: 8%; } /* 诊室数量 */
          &:nth-child(8) { width: 12%; } /* 联系电话 */
          &:nth-child(9) { width: 10%; } /* 状态 */
          &:nth-child(10) { width: 7%; } /* 操作 */
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

            // 科室代码
            .department-code {
              font-weight: 600;
              color: $primary;
              font-family: 'Courier New', monospace;
              font-size: 13px;
            }

            // 科室名称单元格
            .department-name-cell {
              display: flex;
              align-items: center;
              gap: 12px;

              .department-icon {
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

              .department-name {
                font-weight: 600;
                color: $text;
                margin-bottom: 2px;
              }

              .department-meta {
                color: #666;
                font-size: 12px;
              }
            }

            // 类型标签
            .type-badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.clinical {
                background: rgba($success, 0.1);
                color: $success;
              }

              &.medical {
                background: rgba($warning, 0.1);
                color: $warning;
              }

              &.administrative {
                background: rgba($purple, 0.1);
                color: $purple;
              }
            }

            // 主任信息
            .director-info {
              line-height: 1.4;
              
              .director-name {
                font-weight: 500;
                color: $text;
                margin-bottom: 2px;
              }
              
              .director-title {
                color: #666;
                font-size: 12px;
              }
            }

            // 数量数字
            .count-number {
              font-weight: 600;
              color: $primary;
              font-size: 16px;
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

              &.active { background: rgba($success, 0.1); color: $success; }
              &.maintenance { background: rgba($warning, 0.1); color: $warning; }
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

                &.settings:hover {
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

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid $border;
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

  .department-table-wrapper {
    font-size: 12px;

    .department-table {
      th, td {
        padding: 8px;
      }
    }
  }
}
</style>