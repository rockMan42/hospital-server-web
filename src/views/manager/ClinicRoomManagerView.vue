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
      <!-- 左侧菜单 -->
      <SideLeft :activeMenu="'clinicroom'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>诊室管理</h1>
          <p>管理和维护医院所有诊室信息</p>
        </div>

        <!-- 统计卡片 -->
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

        <!-- 搜索筛选 -->
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
              <span class="search-icon">🏷️</span>
              <input 
                type="text" 
                class="search-input" 
                placeholder="按诊室编号搜索..."
                v-model="searchByRoomNumber"
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
            <select 
              class="filter-select" 
              v-model="selectedStatus"
              @change="handleSearch"
            >
              <option value="">全部状态</option>
              <option value="可用">可用</option>
              <option value="使用中">使用中</option>
              <option value="维护中">维护中</option>
              <option value="停用">停用</option>
            </select>
            
            <button class="clear-search-btn" @click="clearSearch">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
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
              <span v-if="loading">加载中...</span>
              <span v-else>共 {{ totalCount }} 个诊室</span>
              <span v-if="selectedRooms.length > 0" class="selected-info">
                (已选择 {{ selectedRooms.length }} 个)
              </span>
            </div>
          </div>

          <!-- 表格 -->
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
                  <th>位置信息</th>
                  <th>当前状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="room in paginatedRooms" 
                  :key="room.id" 
                  class="table-row"
                  @click="handleRoomRowClick(room)"
                >
                  <td @click.stop>
                    <input 
                      type="checkbox" 
                      class="select-checkbox"
                      :checked="selectedRooms.includes(room.id)"
                      @change="toggleRoomSelection(room.id)"
                    />
                  </td>
                  <td>
                    <span class="room-number">{{ room.roomNumber }}</span>
                  </td>
                  <td>
                    <div class="room-name-cell">
                      <div class="room-icon">🏥</div>
                      <div>
                        <div class="room-name">{{ room.name }}</div>
                        <div class="room-meta">诊室ID: {{ room.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="department-info">
                      <div class="department-name">{{ room.departmentName || departmentMap[room.departmentId] || '未知科室' }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="location-info">
                      <div class="location">{{ room.location || '未设置' }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="status-badge" :class="getStatusClass(room.status)">
                      {{ getStatusName(room.status) }}
                    </span>
                  </td>
                  <td @click.stop>
                    <div class="table-actions">
                      <button 
                        class="action-btn-mini view" 
                        @click="handleViewDetail(room)"
                        title="查看详情"
                      >
                        👁️
                      </button>
                      <button 
                        class="action-btn-mini edit" 
                        @click="editRoom(room)"
                        title="编辑"
                      >
                        ✏️
                      </button>
                      <button 
                        class="action-btn-mini delete" 
                        @click="deleteRoom(room.id)"
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[5, 10, 20, 50]"
              :small="false"
              :disabled="loading"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalCount"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </main>
    </div>

    <!-- 新增/编辑弹窗 -->
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
              <input 
                type="text" 
                v-model="roomForm.roomNumber" 
                placeholder="请输入诊室编号"
                required
              />
            </div>
            <div class="form-group">
              <label>诊室名称 <span class="required">*</span></label>
              <input 
                type="text" 
                v-model="roomForm.name" 
                placeholder="请输入诊室名称"
                required
              />
            </div>
            <div class="form-group">
              <label>所属科室 <span class="required">*</span></label>
              <select v-model="roomForm.department" required>
                <option value="">请选择科室</option>
                <option value="内科">内科</option>
                <option value="外科">外科</option>
                <option value="儿科">儿科</option>
                <option value="妇产科">妇产科</option>
                <option value="急诊科">急诊科</option>
                <option value="眼科">眼科</option>
                <option value="耳鼻喉科">耳鼻喉科</option>
                <option value="皮肤科">皮肤科</option>
                <option value="口腔科">口腔科</option>
                <option value="中医科">中医科</option>
                <option value="康复科">康复科</option>
              </select>
            </div>
            <div class="form-group">
              <label>位置信息</label>
              <input 
                type="text" 
                v-model="roomForm.location" 
                placeholder="请输入位置信息"
              />
            </div>
            <div class="form-group">
              <label>诊室状态</label>
              <select v-model="roomForm.status">
                <option value="0">可用</option>
                <option value="1">使用中</option>
                <option value="2">维护中</option>
                <option value="3">停用</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeModal">取消</button>
          <button class="action-btn primary" @click="saveRoom">
            {{ showAddModal ? '添加诊室' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h3>诊室详情</h3>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="detailLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>正在加载诊室详情...</p>
          </div>
          <div v-else class="detail-grid">
            <div class="detail-item">
              <label>诊室ID</label>
              <span class="detail-value">{{ roomDetail.id }}</span>
            </div>
            <div class="detail-item">
              <label>诊室编号</label>
              <span class="detail-value room-number">{{ roomDetail.roomNumber }}</span>
            </div>
            <div class="detail-item">
              <label>诊室名称</label>
              <span class="detail-value room-name">{{ roomDetail.name }}</span>
            </div>
            <div class="detail-item">
              <label>所属科室</label>
              <span class="detail-value department">{{ roomDetail.departmentName }}</span>
            </div>
            <div class="detail-item">
              <label>位置信息</label>
              <span class="detail-value location">{{ roomDetail.location || '未设置' }}</span>
            </div>
            <div class="detail-item">
              <label>当前状态</label>
              <span class="detail-value">
                <span class="status-badge" :class="getStatusClass(roomDetail.status)">
                  {{ getStatusName(roomDetail.status) }}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeDetailModal">关闭</button>
          <button class="action-btn primary" @click="editRoomFromDetail">编辑诊室</button>
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
import { getClinicRoomPageList, getClinicRoomDetail, createClinicRoom, updateClinicRoom, deleteClinicRoom } from '@/api/clinicRooms'

// 状态管理
const searchByName = ref('')
const searchByRoomNumber = ref('')
const searchByDepartment = ref('')
const selectedStatus = ref('')
const loading = ref(false)
const rooms = ref([])
const selectedRooms = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const detailLoading = ref(false)
const roomDetail = ref({})
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

const router = useRouter()
const store = useStore()

// 表单数据
const roomForm = ref({
  roomNumber: '',
  name: '',
  department: '',
  location: '',
  status: '0',
  description: ''
})

// 科室映射
const departmentMap = {
  1: '内科',
  2: '外科', 
  3: '儿科',
  4: '妇产科',
  5: '急诊科',
  6: '眼科',
  7: '耳鼻喉科',
  8: '皮肤科',
  9: '口腔科',
  10: '中医科',
  11: '康复科'
}

// 根据科室名称获取科室ID
const getDepartmentIdByName = (deptName) => {
  const entry = Object.entries(departmentMap).find(([id, name]) => name === deptName)
  return entry ? parseInt(entry[0]) : undefined
}

// 状态映射
const statusMap = {
  0: { name: '可用', class: 'available' },
  1: { name: '使用中', class: 'occupied' },
  2: { name: '维护中', class: 'maintenance' },
  3: { name: '停用', class: 'disabled' }
}

// 统计数据
const totalRooms = computed(() => totalCount.value)
const availableRooms = computed(() => rooms.value.filter(r => r.status === 0).length)
const maintenanceRooms = computed(() => rooms.value.filter(r => r.status === 2).length)
const usageRate = computed(() => {
  const occupied = rooms.value.filter(r => r.status === 1).length
  return totalRooms.value > 0 ? Math.round((occupied / totalRooms.value) * 100) : 0
})

// 分页数据
const paginatedRooms = computed(() => rooms.value)

// 全选状态
const isAllSelected = computed(() => {
  return paginatedRooms.value.length > 0 && 
         paginatedRooms.value.every(room => selectedRooms.value.includes(room.id))
})

// API调用函数
const fetchClinicRooms = async () => {
  try {
    console.log('=== fetchClinicRooms 函数开始执行 ===')
    loading.value = true
    console.log('正在获取诊室列表...', {
      page: currentPage.value,
      size: pageSize.value,
      name: searchByName.value || undefined,
      roomNumber: searchByRoomNumber.value || undefined,
      departmentName: searchByDepartment.value || undefined,
      status: selectedStatus.value ? getStatusValue(selectedStatus.value) : undefined
    })
    
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }

    console.log('基础参数:', params)
    
    // 添加搜索条件
    if (searchByName.value) {
      params.name = searchByName.value
    }
    if (searchByRoomNumber.value) {
      params.roomNumber = searchByRoomNumber.value
    }
    if (searchByDepartment.value) {
      params.departmentName = searchByDepartment.value
    }
    if (selectedStatus.value) {
      const statusValue = getStatusValue(selectedStatus.value)
      if (statusValue !== null) {
        params.status = statusValue
      }
    }
    
    console.log('最终请求参数:', params)
    
    const response = await getClinicRoomPageList(params)
    console.log('API响应:', response)
    
    if (response && response.code === 200 && response.data) {
      const data = response.data
      console.log('解析后的数据:', data)
      
      rooms.value = data.list || []
      totalCount.value = data.totalCount || 0
      currentPage.value = data.pageIndex || 1
      pageSize.value = data.pageSize || 10
      
      console.log('更新后的状态:', {
        rooms: rooms.value.length,
        totalCount: totalCount.value,
        currentPage: currentPage.value,
        pageSize: pageSize.value
      })
      
      ElMessage.success(`成功加载 ${rooms.value.length} 条诊室数据`)
    } else {
      console.error('API响应格式错误:', response)
      ElMessage.error('获取诊室列表失败：响应格式错误')
      rooms.value = []
      totalCount.value = 0
    }
  } catch (error) {
    console.error('获取诊室列表失败:', error)
    ElMessage.error('获取诊室列表失败：' + (error.message || '网络错误'))
    rooms.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
    console.log('=== fetchClinicRooms 函数执行完成 ===')
  }
}

// 获取诊室详情
const fetchRoomDetail = async (roomId) => {
  try {
    console.log('=== 获取诊室详情 ===', roomId)
    detailLoading.value = true
    
    const response = await getClinicRoomDetail(roomId)
    console.log('诊室详情API响应:', response)
    
    if (response && response.code === 200 && response.data) {
      roomDetail.value = response.data
      console.log('诊室详情数据:', roomDetail.value)
      ElMessage.success('诊室详情加载成功')
    } else {
      console.error('获取诊室详情失败:', response)
      ElMessage.error('获取诊室详情失败')
    }
  } catch (error) {
    console.error('获取诊室详情失败:', error)
    ElMessage.error('获取诊室详情失败：' + (error.message || '网络错误'))
  } finally {
    detailLoading.value = false
  }
}

// 工具函数
const getStatusValue = (statusName) => {
  const statusEntry = Object.entries(statusMap).find(([key, value]) => value.name === statusName)
  return statusEntry ? parseInt(statusEntry[0]) : null
}

const getStatusName = (status) => {
  return statusMap[status]?.name || '未知状态'
}

const getStatusClass = (status) => {
  return statusMap[status]?.class || 'unknown'
}

// 事件处理函数
const handleSearch = () => {
  console.log('触发搜索', {
    name: searchByName.value,
    roomNumber: searchByRoomNumber.value,
    department: searchByDepartment.value,
    status: selectedStatus.value
  })
  currentPage.value = 1
  fetchClinicRooms()
}

const clearSearch = () => {
  searchByName.value = ''
  searchByRoomNumber.value = ''
  searchByDepartment.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
  fetchClinicRooms()
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchClinicRooms()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchClinicRooms()
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRooms.value = []
  } else {
    selectedRooms.value = paginatedRooms.value.map(room => room.id)
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

const handleRoomRowClick = (room) => {
  handleViewDetail(room)
}

const handleViewDetail = async (room) => {
  showDetailModal.value = true
  await fetchRoomDetail(room.id)
}

const closeDetailModal = () => {
  showDetailModal.value = false
  roomDetail.value = {}
}

const editRoomFromDetail = () => {
  closeDetailModal()
  editRoom(roomDetail.value)
}

const editRoom = (room) => {
  roomForm.value = {
    id: room.id,
    roomNumber: room.roomNumber || '',
    name: room.name || '',
    department: room.departmentName || '',
    location: room.location || '',
    status: room.status?.toString() || '0',
    description: room.description || ''
  }
  showEditModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  roomForm.value = {
    roomNumber: '',
    name: '',
    department: '',
    location: '',
    status: '0',
    description: ''
  }
}

const saveRoom = async () => {
  try {
    if (!roomForm.value.roomNumber || !roomForm.value.name || !roomForm.value.department) {
      ElMessage.warning('请填写必填字段')
      return
    }

    // 规范化与清理
    const deptId = getDepartmentIdByName(roomForm.value.department)
    if (!deptId) {
      ElMessage.warning('请选择有效的科室')
      return
    }

    const trimmedRoomNumber = (roomForm.value.roomNumber || '').trim()
    const trimmedName = (roomForm.value.name || '').trim()
    const trimmedLocation = (roomForm.value.location || '').trim()
    const statusVal = parseInt(roomForm.value.status)

    if (showEditModal.value) {
      // 编辑时严格按后端样例字段提交
      const updatePayload = {
        id: roomForm.value.id,
        name: trimmedName,
        roomNumber: trimmedRoomNumber,
        departmentId: deptId,
        location: trimmedLocation,
        status: statusVal
      }
      await updateClinicRoom(updatePayload)
      ElMessage.success('诊室更新成功')
    } else {
      // 新增时可以携带更完整的可选字段
      const createPayload = {
        roomNumber: trimmedRoomNumber,
        name: trimmedName,
        departmentId: deptId,
        location: trimmedLocation,
        status: statusVal,
        description: (roomForm.value.description || '').trim() || undefined
      }
      await createClinicRoom(createPayload)
      ElMessage.success('诊室创建成功')
    }

    closeModal()
    fetchClinicRooms()
  } catch (error) {
    console.error('保存诊室失败:', error)
    ElMessage.error('保存诊室失败：' + (error.message || '网络错误'))
  }
}

const deleteRoom = async (roomId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个诊室吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteClinicRoom(roomId)
    if (res && res.code === 200) {
      ElMessage.success('诊室删除成功')
      fetchClinicRooms()
    } else if (res && res.code === 203) {
      ElMessage.error('删除失败')
    } else {
      ElMessage.error('删除失败：' + (res?.msg || '未知错误'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除诊室失败:', error)
      ElMessage.error('删除诊室失败：' + (error.message || '网络错误'))
    }
  }
}

const batchDelete = async () => {
  if (selectedRooms.value.length === 0) {
    ElMessage.warning('请选择要删除的诊室')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRooms.value.length} 个诊室吗？`, '确认批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteClinicRoom(selectedRooms.value)
    if (res && res.code === 200) {
      ElMessage.success('批量删除成功')
      selectedRooms.value = []
      fetchClinicRooms()
    } else if (res && res.code === 203) {
      ElMessage.error('删除失败')
    } else {
      ElMessage.error('删除失败：' + (res?.msg || '未知错误'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败：' + (error.message || '网络错误'))
    }
  }
}

const exportData = () => {
  ElMessage.info('导出功能开发中...')
}

const importData = () => {
  ElMessage.info('导入功能开发中...')
}

// 顶部导航事件处理
const handleNotificationClick = () => {
  console.log('通知点击')
}

const handleProfileClick = () => {
  console.log('个人资料点击')
}

const handleSettingsClick = () => {
  console.log('设置点击')
}

// 组件挂载时获取数据
onMounted(() => {
  console.log('ClinicRoomManagerView 组件已挂载')
  fetchClinicRooms()
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
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
    margin-bottom: 30px;

    .card {
      @include card;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 18px;

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
          margin: 0 0 6px 0;
          font-size: 15px;
          color: #555;
        }
        .number {
          font-size: 26px;
          font-weight: 600;
          color: $text;
          margin: 0;
        }
        .desc {
          margin: 4px 0 0 0;
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
      border-radius: 8px;
      font-size: 14px;
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
        &:hover { background: rgba($primary, 0.1); }
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
          // 按当前7列布局设置宽度：选择框、编号、名称、科室、位置、状态、操作
          &:nth-child(1) { width: 5%; }
          &:nth-child(2) { width: 12%; }
          &:nth-child(3) { width: 18%; }
          &:nth-child(4) { width: 15%; }
          &:nth-child(5) { width: 20%; }
          &:nth-child(6) { width: 10%; }
          &:nth-child(7) { width: 10%; }
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

            .select-checkbox {
              width: 16px;
              height: 16px;
              cursor: pointer;
              accent-color: $primary;
            }

            .room-number {
              font-weight: 600;
              color: $primary;
              font-family: 'Courier New', monospace;
              font-size: 13px;
            }

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

            .department-info {
              line-height: 1.4;
              
              .department-name {
                font-weight: 500;
                color: $text;
              }
            }

            .location-info {
              line-height: 1.4;
              .location {
                color: #666;
              }
            }

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

            // 已移除负责医生列，无需相关样式

            .table-actions {
              display: flex;
              gap: 4px;
              justify-content: center;

              .action-btn-mini {
                padding: 6px 8px;
                background: none;
                border: none;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.3s ease;
                font-size: 14px;
                min-width: 32px;
                height: 32px;
                display: inline-flex;
                align-items: center;
                justify-content: center;

                &.view {
                  background: #f0f9ff;
                  color: #0369a1;
                  border: 1px solid #bae6fd;

                  &:hover {
                    background: #e0f2fe;
                    border-color: #7dd3fc;
                  }
                }

                &.edit {
                  background: #fef3c7;
                  color: #d97706;
                  border: 1px solid #fde68a;

                  &:hover {
                    background: #fef08a;
                    border-color: #facc15;
                  }
                }

                &.delete {
                  background: #fef2f2;
                  color: #dc2626;
                  border: 1px solid #fecaca;

                  &:hover {
                    background: #fee2e2;
                    border-color: #fca5a5;
                  }
                }
              }
            }
          }
        }
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 30px;
      padding: 20px 0;
      
      :deep(.el-pagination) {
        .el-pagination__total {
          color: #666;
          font-weight: 500;
        }

        .el-pagination__sizes {
          .el-select {
            .el-input__inner {
              border-radius: 8px;
            }
          }
        }

        .el-pager li {
          border-radius: 8px;
          margin: 0 2px;
          
          &.active {
            background: $primary;
            color: white;
          }
          
          &:hover:not(.active) {
            background: #e6f7ff;
            color: $primary;
          }
        }

        .btn-prev, .btn-next {
          border-radius: 8px;
          margin: 0 2px;
          
          &:hover:not(:disabled) {
            background: #e6f7ff;
            color: $primary;
          }
        }

        .el-pagination__jump {
          .el-input__inner {
            border-radius: 8px;
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

// 详情弹窗特殊样式
.detail-modal {
  max-width: 600px;
  width: 90%;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px 0;
}

.detail-item {
  background: #f8f9fc;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid $primary;

  label {
    display: block;
    font-weight: 600;
    color: #666;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .detail-value {
    display: block;
    font-size: 16px;
    color: #333;
    font-weight: 500;

    &.room-number {
      font-family: 'Courier New', monospace;
      background: #e3f2fd;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    &.room-name {
      color: $primary;
      font-weight: 600;
    }

    &.department {
      color: $success;
      font-weight: 600;
    }

    &.location {
      color: #666;
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid $primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  p {
    color: #666;
    font-size: 14px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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