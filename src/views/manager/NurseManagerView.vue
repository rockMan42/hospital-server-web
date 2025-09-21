<template>
  <div class="nurse-manager">
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
      <SideLeft :activeMenu="'nurse'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>护士管理</h1>
          <p>管理和维护医院所有护士信息</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">👩‍⚕️</div>
            <div class="card-info">
              <h3>护士总数</h3>
              <p class="number">{{ totalNurses }}</p>
              <p class="desc">在职护士</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">✅</div>
            <div class="card-info">
              <h3>在岗护士</h3>
              <p class="number">{{ activeNurses }}</p>
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
            <div class="card-icon bg-purple">🌙</div>
            <div class="card-info">
              <h3>夜班护士</h3>
              <p class="number">{{ nightShiftNurses }}</p>
              <p class="desc">夜班值守</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="showAddModal = true">
            <span class="icon">➕</span>
            新增护士
          </button>
          <button class="action-btn outline" @click="exportData">
            <span class="icon">📤</span>
            导出数据
          </button>
          <button class="action-btn outline" @click="importData">
            <span class="icon">📥</span>
            导入数据
          </button>
          <button 
            class="action-btn danger" 
            :disabled="selectedNurses.length === 0"
            @click="batchDelete"
          >
            <span class="icon">🗑️</span>
            批量删除 ({{ selectedNurses.length }})
          </button>
        </div>

        <!-- 搜索和筛选 -->
        <div class="search-filter-section">
          <div class="search-bars">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                class="search-input" 
                placeholder="按护士姓名搜索..."
                v-model="searchByName"
                @input="handleSearch"
              />
            </div>
            <div class="search-input-wrapper">
              <span class="search-icon">🆔</span>
              <input 
                type="text" 
                class="search-input" 
                placeholder="按工号搜索..."
                v-model="searchByEmployeeId"
                @input="handleSearch"
              />
            </div>
            <div class="search-input-wrapper">
              <span class="search-icon">🏥</span>
              <input 
                type="text" 
                class="search-input" 
                placeholder="按科室搜索..."
                v-model="searchByDepartment"
                @input="handleSearch"
              />
            </div>
          </div>
          
          <div class="filter-controls">
            <select class="filter-select" v-model="selectedStatus" @change="handleFilter">
              <option value="">全部状态</option>
              <option value="active">在岗</option>
              <option value="vacation">休假</option>
              <option value="suspended">停职</option>
            </select>
            
            <select class="filter-select" v-model="selectedLevel" @change="handleFilter">
              <option value="">全部级别</option>
              <option value="head">护士长</option>
              <option value="supervisor">主管护师</option>
              <option value="nurse">护师</option>
              <option value="junior">护士</option>
            </select>

            <button class="clear-search-btn" @click="clearAllSearch">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              清空搜索
            </button>
          </div>
        </div>

        <!-- 护士列表 -->
        <div class="nurse-list">
          <div class="list-header">
            <h2>护士列表</h2>
            <div class="list-info">
              共 {{ filteredNurses.length }} 位护士
              <span v-if="selectedNurses.length > 0" class="selected-info">
                (已选择 {{ selectedNurses.length }} 位)
              </span>
            </div>
          </div>

          <div class="nurse-table-wrapper">
            <table class="nurse-table">
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      class="select-checkbox"
                      :checked="isAllSelected"
                      @change="toggleSelectAll"
                    />
                  </th>
                  <th>工号</th>
                  <th>护士姓名</th>
                  <th>护理级别</th>
                  <th>科室</th>
                  <th>专业方向</th>
                  <th>联系电话</th>
                  <th>入职时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="nurse in paginatedNurses" 
                  :key="nurse.id"
                  class="table-row"
                  @click="selectNurse(nurse.id)"
                >
                  <td>
                    <input 
                      type="checkbox" 
                      class="select-checkbox"
                      :checked="selectedNurses.includes(nurse.id)"
                      @click.stop
                      @change="toggleNurseSelection(nurse.id)"
                    />
                  </td>
                  <td>
                    <span class="employee-id">{{ nurse.employeeId }}</span>
                  </td>
                  <td>
                    <div class="nurse-name-cell">
                      <div class="nurse-avatar">{{ nurse.name.charAt(0) }}</div>
                      <div>
                        <div class="nurse-name">{{ nurse.name }}</div>
                        <div class="nurse-meta">{{ nurse.gender === 'female' ? '女' : '男' }} · {{ nurse.age }}岁</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="level-badge" :class="nurse.level">
                      {{ getLevelName(nurse.level) }}
                    </span>
                  </td>
                  <td>
                    <div class="department-info">
                      <div class="department-name">{{ nurse.department }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="specialty">{{ nurse.specialty }}</span>
                  </td>
                  <td>
                    <div class="contact-info">
                      <div class="phone">{{ nurse.phone }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="hire-date">{{ nurse.hireDate }}</span>
                  </td>
                  <td>
                    <span class="status-badge" :class="nurse.status">
                      {{ getStatusName(nurse.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn-mini view" @click.stop="viewNurse(nurse)" title="查看详情">
                        👁️
                      </button>
                      <button class="action-btn-mini edit" @click.stop="editNurse(nurse)" title="编辑">
                        ✏️
                      </button>
                      <button class="action-btn-mini schedule" @click.stop="manageSchedule(nurse)" title="排班管理">
                        📅
                      </button>
                      <button class="action-btn-mini delete" @click.stop="deleteNurse(nurse)" title="删除">
                        🗑️
                      </button>
                    </div>
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
              @click="currentPage--"
            >
              上一页
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                class="page-number"
                :class="{ active: page === currentPage }"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="page-btn" 
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              下一页
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- 新增/编辑护士弹窗 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddModal ? '新增护士' : '编辑护士' }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>工号 <span class="required">*</span></label>
              <input type="text" v-model="nurseForm.employeeId" placeholder="请输入工号" />
            </div>
            <div class="form-group">
              <label>护士姓名 <span class="required">*</span></label>
              <input type="text" v-model="nurseForm.name" placeholder="请输入护士姓名" />
            </div>
            <div class="form-group">
              <label>性别 <span class="required">*</span></label>
              <select v-model="nurseForm.gender">
                <option value="">请选择性别</option>
                <option value="female">女</option>
                <option value="male">男</option>
              </select>
            </div>
            <div class="form-group">
              <label>年龄</label>
              <input type="number" v-model="nurseForm.age" placeholder="请输入年龄" />
            </div>
            <div class="form-group">
              <label>护理级别 <span class="required">*</span></label>
              <select v-model="nurseForm.level">
                <option value="">请选择级别</option>
                <option value="head">护士长</option>
                <option value="supervisor">主管护师</option>
                <option value="nurse">护师</option>
                <option value="junior">护士</option>
              </select>
            </div>
            <div class="form-group">
              <label>科室 <span class="required">*</span></label>
              <select v-model="nurseForm.department">
                <option value="">请选择科室</option>
                <option value="心血管内科">心血管内科</option>
                <option value="骨科">骨科</option>
                <option value="妇产科">妇产科</option>
                <option value="儿科">儿科</option>
                <option value="急诊科">急诊科</option>
                <option value="ICU">ICU</option>
                <option value="手术室">手术室</option>
              </select>
            </div>
            <div class="form-group">
              <label>专业方向</label>
              <input type="text" v-model="nurseForm.specialty" placeholder="请输入专业方向" />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input type="tel" v-model="nurseForm.phone" placeholder="请输入联系电话" />
            </div>
            <div class="form-group">
              <label>入职时间</label>
              <input type="date" v-model="nurseForm.hireDate" />
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="nurseForm.status">
                <option value="active">在岗</option>
                <option value="vacation">休假</option>
                <option value="suspended">停职</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>备注</label>
              <textarea v-model="nurseForm.description" placeholder="请输入备注信息"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeModal">取消</button>
          <button class="action-btn primary" @click="saveNurse">保存</button>
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
const searchByName = ref('')
const searchByEmployeeId = ref('')
const searchByDepartment = ref('')
const selectedStatus = ref('')
const selectedLevel = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedNurses = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingNurse = ref(null)

// 路由和状态
const router = useRouter()
const store = useStore()

// 表单数据
const nurseForm = ref({
  employeeId: '',
  name: '',
  gender: '',
  age: '',
  level: '',
  department: '',
  specialty: '',
  phone: '',
  hireDate: '',
  status: 'active',
  description: ''
})

// 模拟护士数据
const nurses = ref([
  {
    id: 1,
    employeeId: 'N001',
    name: '李护士长',
    gender: 'female',
    age: 35,
    level: 'head',
    department: '心血管内科',
    specialty: '心血管护理',
    phone: '13800138001',
    hireDate: '2018-03-15',
    status: 'active'
  },
  {
    id: 2,
    employeeId: 'N002',
    name: '王主管',
    gender: 'female',
    age: 32,
    level: 'supervisor',
    department: '骨科',
    specialty: '骨科护理',
    phone: '13800138002',
    hireDate: '2019-06-20',
    status: 'active'
  },
  {
    id: 3,
    employeeId: 'N003',
    name: '张护师',
    gender: 'female',
    age: 28,
    level: 'nurse',
    department: '妇产科',
    specialty: '妇产科护理',
    phone: '13800138003',
    hireDate: '2020-09-10',
    status: 'vacation'
  },
  {
    id: 4,
    employeeId: 'N004',
    name: '刘护士',
    gender: 'female',
    age: 25,
    level: 'junior',
    department: '儿科',
    specialty: '儿科护理',
    phone: '13800138004',
    hireDate: '2021-12-05',
    status: 'active'
  },
  {
    id: 5,
    employeeId: 'N005',
    name: '陈护士',
    gender: 'male',
    age: 30,
    level: 'nurse',
    department: 'ICU',
    specialty: '重症护理',
    phone: '13800138005',
    hireDate: '2019-01-15',
    status: 'active'
  }
])

// 统计数据
const totalNurses = computed(() => nurses.value.length)
const activeNurses = computed(() => nurses.value.filter(n => n.status === 'active').length)
const departmentCoverage = computed(() => {
  const departments = new Set(nurses.value.map(n => n.department))
  return departments.size
})
const nightShiftNurses = computed(() => {
  // 模拟夜班护士数量
  return Math.floor(totalNurses.value * 0.3)
})

// 过滤后的护士
const filteredNurses = computed(() => {
  return nurses.value.filter(nurse => {
    const matchName = !searchByName.value || nurse.name.toLowerCase().includes(searchByName.value.toLowerCase())
    const matchEmployeeId = !searchByEmployeeId.value || nurse.employeeId.toLowerCase().includes(searchByEmployeeId.value.toLowerCase())
    const matchDepartment = !searchByDepartment.value || nurse.department.toLowerCase().includes(searchByDepartment.value.toLowerCase())
    const matchStatus = !selectedStatus.value || nurse.status === selectedStatus.value
    const matchLevel = !selectedLevel.value || nurse.level === selectedLevel.value
    
    return matchName && matchEmployeeId && matchDepartment && matchStatus && matchLevel
  })
})

// 分页数据
const totalPages = computed(() => Math.ceil(filteredNurses.value.length / pageSize))
const paginatedNurses = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredNurses.value.slice(start, end)
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
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    }
  }
  
  return pages
})

// 全选状态
const isAllSelected = computed(() => {
  return paginatedNurses.value.length > 0 && 
         paginatedNurses.value.every(nurse => selectedNurses.value.includes(nurse.id))
})

// 辅助函数
const getLevelName = (level) => {
  const names = {
    head: '护士长',
    supervisor: '主管护师',
    nurse: '护师',
    junior: '护士'
  }
  return names[level] || '未知'
}

const getStatusName = (status) => {
  const names = {
    active: '在岗',
    vacation: '休假',
    suspended: '停职'
  }
  return names[status] || '未知'
}

// 事件处理
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
  selectedLevel.value = ''
  currentPage.value = 1
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedNurses.value = selectedNurses.value.filter(id => 
      !paginatedNurses.value.some(nurse => nurse.id === id)
    )
  } else {
    const newSelections = paginatedNurses.value.map(nurse => nurse.id)
    selectedNurses.value = [...new Set([...selectedNurses.value, ...newSelections])]
  }
}

const toggleNurseSelection = (nurseId) => {
  const index = selectedNurses.value.indexOf(nurseId)
  if (index > -1) {
    selectedNurses.value.splice(index, 1)
  } else {
    selectedNurses.value.push(nurseId)
  }
}

const selectNurse = (nurseId) => {
  toggleNurseSelection(nurseId)
}

const exportData = () => {
  ElMessage.success('导出功能开发中...')
}

const importData = () => {
  ElMessage.success('导入功能开发中...')
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedNurses.value.length} 位护士吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    nurses.value = nurses.value.filter(nurse => !selectedNurses.value.includes(nurse.id))
    selectedNurses.value = []
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const viewNurse = (nurse) => {
  ElMessage.info(`查看护士: ${nurse.name}`)
}

const editNurse = (nurse) => {
  editingNurse.value = nurse
  nurseForm.value = { ...nurse }
  showEditModal.value = true
}

const manageSchedule = (nurse) => {
  ElMessage.info(`管理护士排班: ${nurse.name}`)
}

const deleteNurse = (nurse) => {
  ElMessageBox.confirm(
    `确定要删除护士 "${nurse.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = nurses.value.findIndex(n => n.id === nurse.id)
    if (index > -1) {
      nurses.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingNurse.value = null
  nurseForm.value = {
    employeeId: '',
    name: '',
    gender: '',
    age: '',
    level: '',
    department: '',
    specialty: '',
    phone: '',
    hireDate: '',
    status: 'active',
    description: ''
  }
}

const saveNurse = () => {
  if (!nurseForm.value.employeeId || !nurseForm.value.name || !nurseForm.value.gender || !nurseForm.value.level || !nurseForm.value.department) {
    ElMessage.warning('请填写必填字段')
    return
  }

  if (showAddModal.value) {
    const newNurse = {
      id: Date.now(),
      ...nurseForm.value
    }
    nurses.value.push(newNurse)
    ElMessage.success('新增护士成功')
  } else if (showEditModal.value) {
    const index = nurses.value.findIndex(n => n.id === editingNurse.value.id)
    if (index > -1) {
      nurses.value[index] = { ...editingNurse.value, ...nurseForm.value }
      ElMessage.success('编辑护士成功')
    }
  }

  closeModal()
}

// 生命周期
onMounted(() => {
  // 页面加载完成
})

onUnmounted(() => {
  // 清理工作
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

.nurse-manager {
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

  // 护士列表
  .nurse-list {
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
    .nurse-table-wrapper {
      overflow-x: auto;
      margin-bottom: 20px;
      border: 1px solid $border;
      border-radius: 8px;
      background: white;

      .nurse-table {
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

          &:nth-child(1) { width: 5%; }  /* 选择框 */
          &:nth-child(2) { width: 8%; }  /* 工号 */
          &:nth-child(3) { width: 15%; } /* 护士姓名 */
          &:nth-child(4) { width: 10%; } /* 护理级别 */
          &:nth-child(5) { width: 12%; } /* 科室 */
          &:nth-child(6) { width: 12%; } /* 专业方向 */
          &:nth-child(7) { width: 12%; } /* 联系电话 */
          &:nth-child(8) { width: 10%; } /* 入职时间 */
          &:nth-child(9) { width: 8%; }  /* 状态 */
          &:nth-child(10) { width: 8%; } /* 操作 */
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

            // 护士名称单元格
            .nurse-name-cell {
              display: flex;
              align-items: center;
              gap: 12px;

              .nurse-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 600;
                flex-shrink: 0;
              }

              .nurse-name {
                font-weight: 600;
                color: $text;
                margin-bottom: 2px;
              }

              .nurse-meta {
                color: #666;
                font-size: 12px;
              }
            }

            // 级别标签
            .level-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.head {
                background: rgba($danger, 0.1);
                color: $danger;
              }

              &.supervisor {
                background: rgba($warning, 0.1);
                color: $warning;
              }

              &.nurse {
                background: rgba($primary, 0.1);
                color: $primary;
              }

              &.junior {
                background: rgba($success, 0.1);
                color: $success;
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

            // 专业方向
            .specialty {
              color: #666;
              font-size: 13px;
            }

            // 联系信息
            .contact-info {
              line-height: 1.4;
              .phone {
                font-weight: 500;
                color: $text;
                font-family: 'Courier New', monospace;
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
    margin-left: 0;
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

  .nurse-table-wrapper {
    font-size: 12px;

    .nurse-table {
      th, td {
        padding: 8px;
      }
    }
  }
}
</style>