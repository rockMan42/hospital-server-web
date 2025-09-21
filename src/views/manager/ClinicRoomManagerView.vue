<template>
  <div class="clinic-room-manager">
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
      <SideLeft :activeMenu="'clinicroom'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>诊室管理</h1>
          <p>管理和维护医院所有诊室信息</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">🚪</div>
            <div class="card-info">
              <h3>诊室总数</h3>
              <p class="number">{{ totalRooms }}</p>
              <p class="desc">已创建诊室</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">✅</div>
            <div class="card-info">
              <h3>可用诊室</h3>
              <p class="number">{{ availableRooms }}</p>
              <p class="desc">正常使用中</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">🔧</div>
            <div class="card-info">
              <h3>维护中</h3>
              <p class="number">{{ maintenanceRooms }}</p>
              <p class="desc">维护保养中</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">📊</div>
            <div class="card-info">
              <h3>使用率</h3>
              <p class="number">{{ usageRate }}%</p>
              <p class="desc">平均使用率</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="showAddModal = true">
            <span class="icon">➕</span>
            新增诊室
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
            :disabled="selectedRooms.length === 0"
            @click="batchDelete"
          >
            <span class="icon">🗑️</span>
            批量删除 ({{ selectedRooms.length }})
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
                placeholder="按诊室名称搜索..."
                v-model="searchByName"
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
            <div class="search-input-wrapper">
              <span class="search-icon">🔢</span>
              <input 
                type="text" 
                class="search-input" 
                placeholder="按诊室编号搜索..."
                v-model="searchByRoomNumber"
                @input="handleSearch"
              />
            </div>
          </div>
          
          <div class="filter-controls">
            <select class="filter-select" v-model="selectedStatus" @change="handleFilter">
              <option value="">全部状态</option>
              <option value="available">可用</option>
              <option value="occupied">使用中</option>
              <option value="maintenance">维护中</option>
              <option value="disabled">停用</option>
            </select>
            
            <select class="filter-select" v-model="selectedType" @change="handleFilter">
              <option value="">全部类型</option>
              <option value="consultation">普通诊室</option>
              <option value="examination">检查室</option>
              <option value="treatment">治疗室</option>
              <option value="surgery">手术室</option>
              <option value="emergency">急诊室</option>
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

        <!-- 诊室列表 -->
        <div class="room-list">
          <div class="list-header">
            <h2>诊室列表</h2>
            <div class="list-info">
              共 {{ filteredRooms.length }} 个诊室
              <span v-if="selectedRooms.length > 0" class="selected-info">
                (已选择 {{ selectedRooms.length }} 个)
              </span>
            </div>
          </div>

          <div class="room-table-wrapper">
            <table class="room-table">
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
                  <th>诊室编号</th>
                  <th>诊室名称</th>
                  <th>所属科室</th>
                  <th>诊室类型</th>
                  <th>楼层位置</th>
                  <th>设备状态</th>
                  <th>当前状态</th>
                  <th>负责医生</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="room in paginatedRooms" 
                  :key="room.id"
                  class="table-row"
                  @click="selectRoom(room.id)"
                >
                  <td>
                    <input 
                      type="checkbox" 
                      class="select-checkbox"
                      :checked="selectedRooms.includes(room.id)"
                      @click.stop
                      @change="toggleRoomSelection(room.id)"
                    />
                  </td>
                  <td>
                    <span class="room-number">{{ room.roomNumber }}</span>
                  </td>
                  <td>
                    <div class="room-name-cell">
                      <div class="room-icon">{{ getRoomTypeIcon(room.type) }}</div>
                      <div>
                        <div class="room-name">{{ room.name }}</div>
                        <div class="room-meta">{{ room.area }}㎡</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="department-info">
                      <div class="department-name">{{ room.department }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="type-badge" :class="room.type">
                      {{ getRoomTypeName(room.type) }}
                    </span>
                  </td>
                  <td>
                    <div class="location-info">
                      <div class="floor">{{ room.floor }}楼</div>
                      <div class="position">{{ room.position }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="equipment-badge" :class="room.equipmentStatus">
                      {{ getEquipmentStatusName(room.equipmentStatus) }}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" :class="room.status">
                      {{ getStatusName(room.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="doctor-info">
                      <div class="doctor-name">{{ room.responsibleDoctor || '未分配' }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn-mini view" @click.stop="viewRoom(room)" title="查看详情">
                        👁️
                      </button>
                      <button class="action-btn-mini edit" @click.stop="editRoom(room)" title="编辑">
                        ✏️
                      </button>
                      <button class="action-btn-mini schedule" @click.stop="manageSchedule(room)" title="排班管理">
                        📅
                      </button>
                      <button class="action-btn-mini delete" @click.stop="deleteRoom(room)" title="删除">
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

    <!-- 新增/编辑诊室弹窗 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddModal ? '新增诊室' : '编辑诊室' }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>诊室编号 <span class="required">*</span></label>
              <input type="text" v-model="roomForm.roomNumber" placeholder="请输入诊室编号" />
            </div>
            <div class="form-group">
              <label>诊室名称 <span class="required">*</span></label>
              <input type="text" v-model="roomForm.name" placeholder="请输入诊室名称" />
            </div>
            <div class="form-group">
              <label>所属科室 <span class="required">*</span></label>
              <select v-model="roomForm.department">
                <option value="">请选择科室</option>
                <option value="心血管内科">心血管内科</option>
                <option value="骨科">骨科</option>
                <option value="妇产科">妇产科</option>
                <option value="儿科">儿科</option>
                <option value="急诊科">急诊科</option>
              </select>
            </div>
            <div class="form-group">
              <label>诊室类型 <span class="required">*</span></label>
              <select v-model="roomForm.type">
                <option value="">请选择类型</option>
                <option value="consultation">普通诊室</option>
                <option value="examination">检查室</option>
                <option value="treatment">治疗室</option>
                <option value="surgery">手术室</option>
                <option value="emergency">急诊室</option>
              </select>
            </div>
            <div class="form-group">
              <label>楼层</label>
              <input type="number" v-model="roomForm.floor" placeholder="请输入楼层" />
            </div>
            <div class="form-group">
              <label>位置</label>
              <input type="text" v-model="roomForm.position" placeholder="请输入具体位置" />
            </div>
            <div class="form-group">
              <label>面积(㎡)</label>
              <input type="number" v-model="roomForm.area" placeholder="请输入面积" />
            </div>
            <div class="form-group">
              <label>负责医生</label>
              <input type="text" v-model="roomForm.responsibleDoctor" placeholder="请输入负责医生" />
            </div>
            <div class="form-group full-width">
              <label>备注</label>
              <textarea v-model="roomForm.description" placeholder="请输入备注信息"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeModal">取消</button>
          <button class="action-btn primary" @click="saveRoom">保存</button>
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
const searchByDepartment = ref('')
const searchByRoomNumber = ref('')
const selectedStatus = ref('')
const selectedType = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedRooms = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingRoom = ref(null)

// 路由和状态
const router = useRouter()
const store = useStore()

// 表单数据
const roomForm = ref({
  roomNumber: '',
  name: '',
  department: '',
  type: '',
  floor: '',
  position: '',
  area: '',
  responsibleDoctor: '',
  description: ''
})

// 模拟诊室数据
const rooms = ref([
  {
    id: 1,
    roomNumber: 'R001',
    name: '心血管诊室1',
    department: '心血管内科',
    type: 'consultation',
    floor: 3,
    position: '东侧',
    area: 25,
    equipmentStatus: 'normal',
    status: 'available',
    responsibleDoctor: '张主任'
  },
  {
    id: 2,
    roomNumber: 'R002',
    name: '骨科检查室',
    department: '骨科',
    type: 'examination',
    floor: 5,
    position: '西侧',
    area: 30,
    equipmentStatus: 'normal',
    status: 'occupied',
    responsibleDoctor: '李医生'
  },
  {
    id: 3,
    roomNumber: 'R003',
    name: '妇产科治疗室',
    department: '妇产科',
    type: 'treatment',
    floor: 4,
    position: '南侧',
    area: 35,
    equipmentStatus: 'maintenance',
    status: 'maintenance',
    responsibleDoctor: '王医生'
  },
  {
    id: 4,
    roomNumber: 'R004',
    name: '儿科诊室',
    department: '儿科',
    type: 'consultation',
    floor: 2,
    position: '北侧',
    area: 28,
    equipmentStatus: 'normal',
    status: 'available',
    responsibleDoctor: '赵医生'
  },
  {
    id: 5,
    roomNumber: 'R005',
    name: '急诊抢救室',
    department: '急诊科',
    type: 'emergency',
    floor: 1,
    position: '中央',
    area: 50,
    equipmentStatus: 'normal',
    status: 'available',
    responsibleDoctor: '陈医生'
  }
])

// 统计数据
const totalRooms = computed(() => rooms.value.length)
const availableRooms = computed(() => rooms.value.filter(r => r.status === 'available').length)
const maintenanceRooms = computed(() => rooms.value.filter(r => r.status === 'maintenance').length)
const usageRate = computed(() => {
  const occupied = rooms.value.filter(r => r.status === 'occupied').length
  return Math.round((occupied / totalRooms.value) * 100)
})

// 过滤后的诊室
const filteredRooms = computed(() => {
  return rooms.value.filter(room => {
    const matchName = !searchByName.value || room.name.toLowerCase().includes(searchByName.value.toLowerCase())
    const matchDepartment = !searchByDepartment.value || room.department.toLowerCase().includes(searchByDepartment.value.toLowerCase())
    const matchRoomNumber = !searchByRoomNumber.value || room.roomNumber.toLowerCase().includes(searchByRoomNumber.value.toLowerCase())
    const matchStatus = !selectedStatus.value || room.status === selectedStatus.value
    const matchType = !selectedType.value || room.type === selectedType.value
    
    return matchName && matchDepartment && matchRoomNumber && matchStatus && matchType
  })
})

// 分页数据
const totalPages = computed(() => Math.ceil(filteredRooms.value.length / pageSize))
const paginatedRooms = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredRooms.value.slice(start, end)
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
  return paginatedRooms.value.length > 0 && 
         paginatedRooms.value.every(room => selectedRooms.value.includes(room.id))
})

// 辅助函数
const getRoomTypeIcon = (type) => {
  const icons = {
    consultation: '🏥',
    examination: '🔍',
    treatment: '💊',
    surgery: '🔬',
    emergency: '🚨'
  }
  return icons[type] || '🏥'
}

const getRoomTypeName = (type) => {
  const names = {
    consultation: '普通诊室',
    examination: '检查室',
    treatment: '治疗室',
    surgery: '手术室',
    emergency: '急诊室'
  }
  return names[type] || '未知'
}

const getEquipmentStatusName = (status) => {
  const names = {
    normal: '正常',
    maintenance: '维护中',
    fault: '故障'
  }
  return names[status] || '未知'
}

const getStatusName = (status) => {
  const names = {
    available: '可用',
    occupied: '使用中',
    maintenance: '维护中',
    disabled: '停用'
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
  searchByDepartment.value = ''
  searchByRoomNumber.value = ''
  selectedStatus.value = ''
  selectedType.value = ''
  currentPage.value = 1
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRooms.value = selectedRooms.value.filter(id => 
      !paginatedRooms.value.some(room => room.id === id)
    )
  } else {
    const newSelections = paginatedRooms.value.map(room => room.id)
    selectedRooms.value = [...new Set([...selectedRooms.value, ...newSelections])]
  }
}

const toggleRoomSelection = (roomId) => {
  const index = selectedRooms.value.indexOf(roomId)
  if (index > -1) {
    selectedRooms.value.splice(index, 1)
  } else {
    selectedRooms.value.push(roomId)
  }
}

const selectRoom = (roomId) => {
  toggleRoomSelection(roomId)
}

const exportData = () => {
  ElMessage.success('导出功能开发中...')
}

const importData = () => {
  ElMessage.success('导入功能开发中...')
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRooms.value.length} 个诊室吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    rooms.value = rooms.value.filter(room => !selectedRooms.value.includes(room.id))
    selectedRooms.value = []
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const viewRoom = (room) => {
  ElMessage.info(`查看诊室: ${room.name}`)
}

const editRoom = (room) => {
  editingRoom.value = room
  roomForm.value = { ...room }
  showEditModal.value = true
}

const manageSchedule = (room) => {
  ElMessage.info(`管理诊室排班: ${room.name}`)
}

const deleteRoom = (room) => {
  ElMessageBox.confirm(
    `确定要删除诊室 "${room.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = rooms.value.findIndex(r => r.id === room.id)
    if (index > -1) {
      rooms.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingRoom.value = null
  roomForm.value = {
    roomNumber: '',
    name: '',
    department: '',
    type: '',
    floor: '',
    position: '',
    area: '',
    responsibleDoctor: '',
    description: ''
  }
}

const saveRoom = () => {
  if (!roomForm.value.roomNumber || !roomForm.value.name || !roomForm.value.department || !roomForm.value.type) {
    ElMessage.warning('请填写必填字段')
    return
  }

  if (showAddModal.value) {
    const newRoom = {
      id: Date.now(),
      ...roomForm.value,
      equipmentStatus: 'normal',
      status: 'available'
    }
    rooms.value.push(newRoom)
    ElMessage.success('新增诊室成功')
  } else if (showEditModal.value) {
    const index = rooms.value.findIndex(r => r.id === editingRoom.value.id)
    if (index > -1) {
      rooms.value[index] = { ...editingRoom.value, ...roomForm.value }
      ElMessage.success('编辑诊室成功')
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

.clinic-room-manager {
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

  // 诊室列表
  .room-list {
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
    .room-table-wrapper {
      overflow-x: auto;
      margin-bottom: 20px;
      border: 1px solid $border;
      border-radius: 8px;
      background: white;

      .room-table {
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
          &:nth-child(2) { width: 10%; } /* 诊室编号 */
          &:nth-child(3) { width: 15%; } /* 诊室名称 */
          &:nth-child(4) { width: 12%; } /* 所属科室 */
          &:nth-child(5) { width: 10%; } /* 诊室类型 */
          &:nth-child(6) { width: 12%; } /* 楼层位置 */
          &:nth-child(7) { width: 10%; } /* 设备状态 */
          &:nth-child(8) { width: 10%; } /* 当前状态 */
          &:nth-child(9) { width: 10%; } /* 负责医生 */
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

            // 诊室编号
            .room-number {
              font-weight: 600;
              color: $primary;
              font-family: 'Courier New', monospace;
              font-size: 13px;
            }

            // 诊室名称单元格
            .room-name-cell {
              display: flex;
              align-items: center;
              gap: 12px;

              .room-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba($primary, 0.1);
                color: $primary;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 600;
                flex-shrink: 0;
              }

              .room-name {
                font-weight: 600;
                color: $text;
                margin-bottom: 2px;
              }

              .room-meta {
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

              &.consultation {
                background: rgba($primary, 0.1);
                color: $primary;
              }

              &.examination {
                background: rgba($success, 0.1);
                color: $success;
              }

              &.treatment {
                background: rgba($warning, 0.1);
                color: $warning;
              }

              &.surgery {
                background: rgba($danger, 0.1);
                color: $danger;
              }

              &.emergency {
                background: rgba($purple, 0.1);
                color: $purple;
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

            // 位置信息
            .location-info {
              line-height: 1.4;
              .floor {
                font-weight: 500;
                color: $text;
              }
              .position {
                color: #666;
                font-size: 12px;
              }
            }

            // 设备状态标签
            .equipment-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.normal { background: rgba($success, 0.1); color: $success; }
              &.maintenance { background: rgba($warning, 0.1); color: $warning; }
              &.fault { background: rgba($danger, 0.1); color: $danger; }
            }

            // 状态标签
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.available { background: rgba($success, 0.1); color: $success; }
              &.occupied { background: rgba($warning, 0.1); color: $warning; }
              &.maintenance { background: rgba($danger, 0.1); color: $danger; }
              &.disabled { background: rgba(#999, 0.1); color: #999; }
            }

            // 医生信息
            .doctor-info {
              line-height: 1.4;
              .doctor-name {
                font-weight: 500;
                color: $text;
              }
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

  .room-table-wrapper {
    font-size: 12px;

    .room-table {
      th, td {
        padding: 8px;
      }
    }
  }
}
</style>