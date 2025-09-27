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
          <button class="action-btn primary" @click="showAddNurseModal">
            <span class="icon">➡️</span>
            新增护士
          </button>
          <button class="action-btn outline" @click="exportNurseData">
            <span class="icon">📤</span>
            导出数据
          </button>
          <button class="action-btn outline" @click="importNurseData">
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
            
            <select class="filter-select" v-model="selectedLevel" @change="handleFilter" @click="onTitleSelectClick" :disabled="professionTitlesLoading">
              <option value="">{{ professionTitlesLoading ? '加载中...' : `全部职称(${nurseProfessionTitles.length})` }}</option>
              <option v-for="title in nurseProfessionTitles" :key="title.id" :value="title.id">
                {{ title.profashionTitle }}
              </option>
            </select>
          </div>
        </div>

        <!-- 护士列表 -->
        <div class="nurse-list">
          <div class="list-header">
            <h2>护士列表</h2>
            <div class="list-info">
              共 {{ totalCount }} 位护士
              <span v-if="selectedNurses.length > 0" class="selected-info">
                (已选择 {{ selectedNurses.length }} 位)
              </span>
              <span v-if="loading" class="loading-info">
                加载中...
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
                  @click="handleNurseRowClick(nurse)"
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
                    <span class="employee-id">{{ nurse.workId }}</span>
                  </td>
                  <td>
                    <div class="nurse-name-cell">
                      <div class="nurse-avatar">{{ nurse.name.charAt(0) }}</div>
                      <div>
                        <div class="nurse-name">{{ nurse.name }}</div>
                        <div class="nurse-meta">{{ nurse.gender }} · {{ nurse.age || '未知' }}岁</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="level-badge">
                      {{ getLevelName(nurse.profashionTitle) }}
                    </span>
                  </td>
                  <td>
                    <div class="department-info">
                      <div class="department-name">{{ nurse.departmentName }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="specialty">{{ nurse.majorDirect }}</span>
                  </td>
                  <td>
                    <div class="contact-info">
                      <div class="phone">{{ nurse.phone }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="hire-date">{{ nurse.enterDate }}</span>
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
                      <button class="action-btn-mini delete" @click.stop="deleteNurseById(nurse)" title="删除">
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
              :disabled="currentPage === 1 || loading"
              @click="currentPage--; fetchNurseList()"
            >
              上一页
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                class="page-number"
                :class="{ active: page === currentPage }"
                :disabled="loading"
                @click="currentPage = page; fetchNurseList()"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="page-btn" 
              :disabled="currentPage >= totalPages || loading"
              @click="currentPage++; fetchNurseList()"
            >
              下一页
            </button>
            
            <div class="page-info">
              第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 新增/编辑护士弹窗 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddModal ? '新增护士' : '编辑护士' }}</h3>
          <div v-if="editFormLoading && showEditModal" class="loading-indicator">
            <span class="loading-spinner"></span>
            正在加载护士信息...
          </div>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>工号 <span class="required">*</span></label>
              <input type="text" v-model="nurseForm.workId" placeholder="请输入工号" />
            </div>
            <div class="form-group">
              <label>护士姓名 <span class="required">*</span></label>
              <input type="text" v-model="nurseForm.name" placeholder="请输入护士姓名" />
            </div>
            <div class="form-group">
              <label>性别 <span class="required">*</span></label>
              <select v-model="nurseForm.gender">
                <option value="">请选择性别</option>
                <option value="女">女</option>
                <option value="男">男</option>
              </select>
            </div>
            <div class="form-group">
              <label>年龄</label>
              <input type="number" v-model="nurseForm.age" placeholder="请输入年龄" />
            </div>
            <div class="form-group">
              <label>护理职称 <span class="required">*</span></label>
              <select v-model="nurseForm.nptId" :disabled="professionTitlesLoading">
                <option value="">{{ professionTitlesLoading ? '正在加载职称...' : '请选择职称' }}</option>
                <option v-for="title in nurseProfessionTitles" :key="title.id" :value="title.id">
                  {{ title.profashionTitle }}
                </option>
              </select>
              <small v-if="nurseProfessionTitles.length === 0 && !professionTitlesLoading" style="color: #999;">
                暂无职称数据
              </small>
              <small v-else-if="nurseProfessionTitles.length > 0" style="color: #67c23a;">
                已加载 {{ nurseProfessionTitles.length }} 个职称
              </small>
            </div>
            <div class="form-group">
              <label>诊室</label>
              <select v-model="nurseForm.clinicRoomId" :disabled="clinicRoomsLoading">
                <option value="">{{ clinicRoomsLoading ? '正在加载诊室...' : '请选择诊室' }}</option>
                <option v-for="room in clinicRooms" :key="room.clinicRoomId" :value="room.clinicRoomId">
                  {{ room.name }}
                </option>
              </select>
              <small v-if="clinicRooms.length === 0 && !clinicRoomsLoading" style="color: #999;">
                暂无诊室数据
              </small>
              <small v-else-if="clinicRooms.length > 0" style="color: #67c23a;">
                已加载 {{ clinicRooms.length }} 个诊室
              </small>
            </div>
            <div class="form-group">
              <label>专业方向</label>
              <input type="text" v-model="nurseForm.majorDirect" placeholder="请输入专业方向" />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input type="tel" v-model="nurseForm.phone" placeholder="请输入联系电话" />
            </div>
            <div class="form-group">
              <label>入职时间</label>
              <input type="date" v-model="nurseForm.enterDate" />
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="nurseForm.status">
                <option :value="0">在岗</option>
                <option :value="1">休假</option>
                <option :value="2">停职</option>
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

    <!-- 护士详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑护士</h3>
          <div v-if="editFormLoading" class="loading-indicator">
            <span class="loading-spinner"></span>
            正在加载护士信息...
          </div>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="detailLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载护士详情中...</p>
          </div>
          <div v-else-if="nurseDetail" class="detail-grid">
            <div class="detail-item">
              <label>工号：</label>
              <span class="detail-value workid">{{ nurseDetail.workId }}</span>
            </div>
            <div class="detail-item">
              <label>护士姓名：</label>
              <span class="detail-value name">{{ nurseDetail.name }}</span>
            </div>
            <div class="detail-item">
              <label>性别：</label>
              <span class="detail-value">{{ nurseDetail.gender }}</span>
            </div>
            <div class="detail-item">
              <label>年龄：</label>
              <span class="detail-value">{{ nurseDetail.age }}岁</span>
            </div>
            <div class="detail-item">
              <label>护理职称：</label>
              <span class="detail-value title">{{ nurseDetail.profashionTitle }}</span>
            </div>
            <div class="detail-item">
              <label>所属科室：</label>
              <span class="detail-value department">{{ nurseDetail.departmentName }}</span>
            </div>
            <div class="detail-item">
              <label>专业方向：</label>
              <span class="detail-value">{{ nurseDetail.majorDirect || '暂无' }}</span>
            </div>
            <div class="detail-item">
              <label>联系电话：</label>
              <span class="detail-value phone">{{ nurseDetail.phone || '暂无' }}</span>
            </div>
            <div class="detail-item">
              <label>入职时间：</label>
              <span class="detail-value">{{ nurseDetail.enterDate || '暂无' }}</span>
            </div>
            <div class="detail-item">
              <label>工作状态：</label>
              <span class="detail-value status" :class="getStatusKey(nurseDetail.status)">
                {{ getStatusName(nurseDetail.status) }}
              </span>
            </div>
            <div class="detail-item full-width" v-if="nurseDetail.description">
              <label>备注信息：</label>
              <span class="detail-value description">{{ nurseDetail.description }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeDetailModal">关闭</button>
          <button class="action-btn primary" @click="editNurse(nurseDetail); closeDetailModal()">编辑护士</button>
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
import { getNurseFullPage, getNurseProfessionTitleList, getNurseDetail, createNurse, updateNurse, deleteNurse } from '@/api/nurses'
import { getClinicRoomPage } from '@/api/clinicRooms'

// 状态管理
const searchByName = ref('')
const searchByEmployeeId = ref('')
const searchByDepartment = ref('')
const selectedStatus = ref('')
const selectedLevel = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedNurses = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const editingNurse = ref(null)
const editFormLoading = ref(false)
const nurseDetail = ref(null)

// API数据状态
const nurses = ref([])
const nurseProfessionTitles = ref([])
const clinicRooms = ref([])
const loading = ref(false)
const detailLoading = ref(false)
const professionTitlesLoading = ref(false)
const clinicRoomsLoading = ref(false)
const totalCount = ref(0)
const totalPages = ref(0)

// 路由和状态
const router = useRouter()
const store = useStore()

// 表单数据
const nurseForm = ref({
  workId: '',
  name: '',
  gender: '',
  age: '',
  nptId: '',
  clinicRoomId: '',
  majorDirect: '',
  phone: '',
  enterDate: '',
  status: 0,
  description: ''
})

// API函数
const fetchNurseList = async () => {
  try {
    loading.value = true
    console.log('开始获取护士列表...')
    
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    // 添加搜索条件
    if (searchByName.value.trim()) {
      params.name = searchByName.value.trim()
    }
    if (searchByEmployeeId.value.trim()) {
      params.workId = searchByEmployeeId.value.trim()
    }
    if (searchByDepartment.value.trim()) {
      params.departmentName = searchByDepartment.value.trim()
    }
    if (selectedStatus.value !== '') {
      params.status = getStatusValue(selectedStatus.value)
    }
    if (selectedLevel.value !== '') {
      params.nptId = selectedLevel.value
    }
    
    console.log('请求参数:', params)
    
    const response = await getNurseFullPage(params)
    console.log('护士列表响应:', response)
    
    if (response.code === 200 && response.data) {
      nurses.value = response.data.list || []
      totalCount.value = response.data.totalCount || 0
      totalPages.value = response.data.totalPage || 0
      
      console.log(`成功获取护士列表，共 ${totalCount.value} 条记录`)
      
      // 处理日期格式
      nurses.value.forEach(nurse => {
        if (nurse.enterDate) {
          nurse.enterDate = nurse.enterDate.split('T')[0]
        }
      })
    } else {
      console.error('获取护士列表失败:', response.msg)
      ElMessage.error(response.msg || '获取护士列表失败')
    }
  } catch (error) {
    console.error('获取护士列表异常:', error)
    console.error('错误详情:', error.response || error.message || error)
    
    // 更详细的错误信息
    let errorMessage = '获取护士列表失败'
    if (error.response) {
      // 服务器响应错误
      errorMessage = error.response.data?.msg || `服务器错误: ${error.response.status}`
    } else if (error.request) {
      // 网络连接错误
      errorMessage = '网络连接失败，请检查网络连接'
    } else {
      // 其他错误
      errorMessage = error.message || '未知错误'
    }
    
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const fetchNurseProfessionTitles = async () => {
  try {
    professionTitlesLoading.value = true
    console.log('开始获取护士职称列表...')
    
    const response = await getNurseProfessionTitleList()
    console.log('护士职称列表响应:', response)
    
    if (response.code === 200 && response.data) {
      nurseProfessionTitles.value = response.data || []
      console.log(`成功获取护士职称列表，共 ${nurseProfessionTitles.value.length} 个职称`)
    } else {
      console.error('获取护士职称列表失败:', response.msg)
      ElMessage.error(response.msg || '获取护士职称列表失败')
    }
  } catch (error) {
    console.error('获取护士职称列表异常:', error)
    console.error('错误详情:', error.response || error.message || error)
    
    // 显示错误信息
    let errorMessage = '获取护士职称列表失败'
    if (error.response) {
      errorMessage = error.response.data?.msg || `服务器错误: ${error.response.status}`
    } else if (error.request) {
      errorMessage = '网络连接失败，请检查网络连接'
    } else {
      errorMessage = error.message || '未知错误'
    }
    
    ElMessage.error(errorMessage)
  } finally {
    professionTitlesLoading.value = false
  }
}

const fetchNurseDetail = async (nurseId) => {
  try {
    detailLoading.value = true
    console.log('开始获取护士详情，ID:', nurseId)
    
    const response = await getNurseDetail(nurseId)
    console.log('护士详情响应:', response)
    
    if (response.code === 200 && response.data) {
      nurseDetail.value = response.data
      
      // 处理日期格式
      if (nurseDetail.value.enterDate) {
        nurseDetail.value.enterDate = nurseDetail.value.enterDate.split('T')[0]
      }
      
      console.log('成功获取护士详情:', nurseDetail.value.name)
    } else {
      console.error('获取护士详情失败:', response.msg)
      ElMessage.error(response.msg || '获取护士详情失败')
    }
  } catch (error) {
    console.error('获取护士详情异常:', error)
    console.error('错误详情:', error.response || error.message || error)
    
    let errorMessage = '获取护士详情失败'
    if (error.response) {
      errorMessage = error.response.data?.msg || `服务器错误: ${error.response.status}`
    } else if (error.request) {
      errorMessage = '网络连接失败，请检查网络连接'
    } else {
      errorMessage = error.message || '未知错误'
    }
    
    ElMessage.error(errorMessage)
  } finally {
    detailLoading.value = false
  }
}

const fetchClinicRooms = async () => {
  try {
    clinicRoomsLoading.value = true
    console.log('开始获取诊室列表...')
    
    // 调用真实的诊室API
    const response = await getClinicRoomPage({
      status: 0 // 只获取可用的诊室
    })
    console.log('诊室列表响应:', response)
    
    if (response.code === 200 && response.data) {
      clinicRooms.value = response.data || []
      console.log(`成功获取诊室列表，共 ${clinicRooms.value.length} 个诊室`)
    } else {
      console.error('获取诊室列表失败:', response.msg)
      ElMessage.error(response.msg || '获取诊室列表失败')
    }
  } catch (error) {
    console.error('获取诊室列表异常:', error)
    console.error('错误详情:', error.response || error.message || error)
    
    // 如果接口失败，使用模拟数据作为后备方案
    console.warn('诊室接口调用失败，使用模拟数据')
    clinicRooms.value = [
      { clinicRoomId: 1, name: '内科诊室1号' },
      { clinicRoomId: 2, name: '外科诊室1号' },
      { clinicRoomId: 3, name: '儿科诊室1号' },
      { clinicRoomId: 4, name: '妇产科诊室1号' },
      { clinicRoomId: 5, name: '急诊科诊室1号' }
    ]
    
    let errorMessage = '获取诊室列表失败'
    if (error.response && error.response.status === 404) {
      ElMessage.warning('诊室接口未实现，使用模拟数据')
    } else {
      ElMessage.warning('诊室接口暂时不可用，使用模拟数据')
    }
  } finally {
    clinicRoomsLoading.value = false
  }
}



// 统计数据
const totalNurses = computed(() => totalCount.value || 0)
const activeNurses = computed(() => nurses.value.filter(n => n.status === 0).length)
const departmentCoverage = computed(() => {
  const departments = new Set(nurses.value.map(n => n.departmentName))
  return departments.size
})
const nightShiftNurses = computed(() => {
  // 模拟夜班护士数量
  return Math.floor(totalNurses.value * 0.3)
})

// 职称选项
const titleOptions = computed(() => {
  return nurseProfessionTitles.value.map(title => ({
    value: title.id,
    label: title.profashionTitle
  }))
})

// 分页数据 - 直接使用API返回的数据
const paginatedNurses = computed(() => nurses.value)

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
const getLevelName = (profashionTitle) => {
  return profashionTitle || '未知'
}

const getStatusName = (status) => {
  const names = {
    0: '在岗',
    1: '休假',
    2: '停职'
  }
  return names[status] || '未知'
}

const getStatusValue = (statusKey) => {
  const values = {
    'active': 0,
    'vacation': 1,
    'suspended': 2
  }
  return values[statusKey]
}

const getStatusKey = (statusValue) => {
  const keys = {
    0: 'active',
    1: 'vacation', 
    2: 'suspended'
  }
  return keys[statusValue] || 'active'
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
  fetchNurseList()
}

const handleFilter = () => {
  currentPage.value = 1
  fetchNurseList()
}

// 点击职称下拉框时的处理
const onTitleSelectClick = () => {
  console.log('点击了职称下拉框')
  console.log('当前职称数据:', nurseProfessionTitles.value)
  console.log('职称数据长度:', nurseProfessionTitles.value.length)
  
  // 如果没有职称数据，尝试重新加载
  if (nurseProfessionTitles.value.length === 0) {
    console.log('职称数据为空，尝试重新加载...')
    fetchNurseProfessionTitles()
  }
}

const clearAllSearch = () => {
  searchByName.value = ''
  searchByEmployeeId.value = ''
  searchByDepartment.value = ''
  selectedStatus.value = ''
  selectedLevel.value = ''
  currentPage.value = 1
  fetchNurseList()
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

const showAddNurseModal = () => {
  showAddModal.value = true
}

const exportNurseData = () => {
  ElMessage.success('导出功能开发中...')
}

const importNurseData = () => {
  ElMessage.success('导入功能开发中...')
}

// 调试编辑表单数据
const debugEditForm = () => {
  console.log('=== 编辑表单调试信息 ===')
  console.log('当前表单数据:', nurseForm.value)
  console.log('诊室数据:', clinicRooms.value)
  console.log('职称数据:', nurseProfessionTitles.value)
  console.log('编辑中的护士:', editingNurse.value)
  
  if (nurses.value.length > 0) {
    console.log('第一个护士数据示例:', nurses.value[0])
    console.log('第一个护士字段:')
    console.log('- age:', nurses.value[0].age, '类型:', typeof nurses.value[0].age)
    console.log('- gender:', nurses.value[0].gender)
    console.log('- clinicRoomId:', nurses.value[0].clinicRoomId, '类型:', typeof nurses.value[0].clinicRoomId)
    console.log('- profashionTitle:', nurses.value[0].profashionTitle)
  }
  
  ElMessage.info('调试信息已输出到控制台')
}

// 测试更新护士功能
const testUpdateNurse = async () => {
  try {
    // 检查是否有护士数据
    if (nurses.value.length === 0) {
      ElMessage.warning('没有护士数据，请先添加护士')
      return
    }
    
    // 使用第一个护士进行测试
    const firstNurse = nurses.value[0]
    const testUpdateData = {
      id: firstNurse.id,
      name: '张护士（已更新）',
      phone: '13900139000',
      status: 1,
      clinicRoomId: 2,
      description: '更新后的备注信息'
    }
    
    console.log('测试更新护士:', testUpdateData)
    const response = await updateNurse(testUpdateData)
    
    if (response.code === 200) {
      ElMessage.success('测试更新护士成功')
      await fetchNurseList() // 刷新列表
    } else {
      ElMessage.error(response.msg || '测试更新护士失败')
    }
  } catch (error) {
    console.error('测试更新护士异常:', error)
    ElMessage.error('测试更新护士失败: ' + (error.message || '未知错误'))
  }
}

// 测试删除护士功能
const testDeleteNurse = async () => {
  try {
    // 检查是否有护士数据
    if (nurses.value.length === 0) {
      ElMessage.warning('没有护士数据，请先添加护士')
      return
    }
    
    // 使用最后一个护士进行测试删除
    const lastNurse = nurses.value[nurses.value.length - 1]
    console.log('测试删除护士:', lastNurse)
    
    await deleteNurseById(lastNurse)
  } catch (error) {
    console.error('测试删除护士异常:', error)
    ElMessage.error('测试删除护士失败: ' + (error.message || '未知错误'))
  }
}

// 测试批量删除护士功能
const testBatchDelete = async () => {
  try {
    // 检查是否有护士数据
    if (nurses.value.length < 2) {
      ElMessage.warning('护士数据不足，至少需要2个护士才能测试批量删除')
      return
    }
    
    // 选中最后两个护士进行测试
    const testNurseIds = nurses.value.slice(-2).map(nurse => nurse.id)
    selectedNurses.value = testNurseIds
    
    console.log('测试批量删除护士:', testNurseIds)
    ElMessage.info(`已选中 ${testNurseIds.length} 个护士，请点击批量删除按钮进行测试`)
  } catch (error) {
    console.error('测试批量删除护士异常:', error)
    ElMessage.error('测试批量删除护士失败: ' + (error.message || '未知错误'))
  }
}

// 测试添加护士功能
const testAddNurse = async () => {
  try {
    const testNurseData = {
      name: '张护士',
      workId: 'N100',
      gender: '女',
      age: 28,
      nptId: 2,
      clinicRoomId: 1,
      majorDirect: '内科护理',
      phone: '13800138000',
      enterDate: '2024-01-01',
      status: 0,
      description: '经验丰富的内科护士'
    }
    
    console.log('测试添加护士:', testNurseData)
    const response = await createNurse(testNurseData)
    
    if (response.code === 200) {
      ElMessage.success('测试添加护士成功')
      await fetchNurseList() // 刷新列表
    } else {
      ElMessage.error(response.msg || '测试添加护士失败')
    }
  } catch (error) {
    console.error('测试添加护士异常:', error)
    ElMessage.error('测试添加护士失败: ' + (error.message || '未知错误'))
  }
}


// 批量删除护士功能
const batchDelete = async () => {
  if (selectedNurses.value.length === 0) {
    ElMessage.warning('请选择要删除的护士')
    return
  }
  
  try {
    console.log('=== 开始批量删除护士 ===')
    console.log('选中的护士IDs:', selectedNurses.value)
    console.log('删除数量:', selectedNurses.value.length)
    
    // 获取选中护士的名称列表
    const selectedNurseNames = nurses.value
      .filter(nurse => selectedNurses.value.includes(nurse.id))
      .map(nurse => nurse.name)
      .slice(0, 5) // 最多显示5个名称
    
    const nameList = selectedNurseNames.join('、')
    const moreText = selectedNurses.value.length > 5 ? `等${selectedNurses.value.length}位护士` : ''
    
    // 显示批量删除确认对话框
    await ElMessageBox.confirm(
      `确定要删除以下 ${selectedNurses.value.length} 位护士吗？\n\n${nameList}${moreText}\n\n此操作不可撤销！`,
      '批量删除护士确认',
      {
        confirmButtonText: `确定删除 ${selectedNurses.value.length} 位护士`,
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )
    
    console.log('用户确认批量删除，开始调用API...')
    const response = await deleteNurse(selectedNurses.value)
    
    if (response.code === 200) {
      console.log('批量删除护士成功')
      ElMessage.success(`成功删除 ${selectedNurses.value.length} 位护士`)
      selectedNurses.value = [] // 清空选中状态
      await fetchNurseList() // 刷新列表
    } else {
      console.error('批量删除护士失败:', response.msg)
      ElMessage.error(response.msg || '批量删除护士失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消批量删除操作')
    } else {
      console.error('批量删除护士异常:', error)
      console.error('错误详情:', error.response || error.message || error)
      
      let errorMessage = '批量删除护士失败'
      if (error.response) {
        errorMessage = error.response.data?.msg || `服务器错误: ${error.response.status}`
      } else if (error.request) {
        errorMessage = '网络连接失败，请检查网络连接'
      } else {
        errorMessage = error.message || '未知错误'
      }
      
      ElMessage.error(errorMessage)
    }
  }
}

const viewNurse = async (nurse) => {
  await fetchNurseDetail(nurse.id)
  showDetailModal.value = true
}

const handleNurseRowClick = async (nurse) => {
  await fetchNurseDetail(nurse.id)
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  nurseDetail.value = null
}

const editNurse = async (nurse) => {
  try {
    console.log('=== 开始编辑护士 ===')
    console.log('护士ID:', nurse.id)
    console.log('护士名称:', nurse.name)
    
    // 显示加载状态
    editingNurse.value = nurse
    showEditModal.value = true
    editFormLoading.value = true
    
    // 调用详情接口获取完整信息
    console.log('调用getNurseDetail接口获取完整信息...')
    const response = await getNurseDetail(nurse.id)
    console.log('护士详情响应:', response)
    
    if (response.code === 200 && response.data) {
      const nurseDetail = response.data
      console.log('获取到的完整护士信息:', nurseDetail)
      
      // 映射详情数据到表单格式
      const formData = {
        workId: nurseDetail.workId || '',
        name: nurseDetail.name || '',
        gender: nurseDetail.gender || '',
        age: nurseDetail.age || '',
        nptId: getNptIdByTitle(nurseDetail.profashionTitle) || '',
        clinicRoomId: nurseDetail.clinicRoomId || '',
        majorDirect: nurseDetail.majorDirect || '',
        phone: nurseDetail.phone || '',
        enterDate: nurseDetail.enterDate ? nurseDetail.enterDate.split('T')[0] : '',
        status: nurseDetail.status !== undefined ? nurseDetail.status : 0,
        description: nurseDetail.description || ''
      }
      
      console.log('表单数据映射结果:', formData)
      console.log('年龄:', formData.age, '性别:', formData.gender, '诊室ID:', formData.clinicRoomId)
      
      nurseForm.value = formData
      ElMessage.success('护士信息加载成功')
    } else {
      console.error('获取护士详情失败:', response.msg)
      ElMessage.error(response.msg || '获取护士详情失败')
      
      // 如果详情接口失败，使用列表数据作为后备
      console.log('使用列表数据作为后备方案')
      const formData = {
        workId: nurse.workId || '',
        name: nurse.name || '',
        gender: nurse.gender || '',
        age: nurse.age || '',
        nptId: getNptIdByTitle(nurse.profashionTitle) || '',
        clinicRoomId: nurse.clinicRoomId || '',
        majorDirect: nurse.majorDirect || '',
        phone: nurse.phone || '',
        enterDate: nurse.enterDate ? nurse.enterDate.split('T')[0] : '',
        status: nurse.status !== undefined ? nurse.status : 0,
        description: nurse.description || ''
      }
      nurseForm.value = formData
    }
  } catch (error) {
    console.error('编辑护士异常:', error)
    ElMessage.error('加载护士信息失败，请检查网络连接')
    
    // 异常情况下使用列表数据
    const formData = {
      workId: nurse.workId || '',
      name: nurse.name || '',
      gender: nurse.gender || '',
      age: nurse.age || '',
      nptId: getNptIdByTitle(nurse.profashionTitle) || '',
      clinicRoomId: nurse.clinicRoomId || '',
      majorDirect: nurse.majorDirect || '',
      phone: nurse.phone || '',
      enterDate: nurse.enterDate ? nurse.enterDate.split('T')[0] : '',
      status: nurse.status !== undefined ? nurse.status : 0,
      description: nurse.description || ''
    }
    nurseForm.value = formData
  } finally {
    editFormLoading.value = false
  }
}

const getNptIdByTitle = (titleName) => {
  const title = nurseProfessionTitles.value.find(t => t.profashionTitle === titleName)
  return title ? title.id : ''
}

const manageSchedule = (nurse) => {
  ElMessage.info(`管理护士排班: ${nurse.name}`)
}

// 单个删除护士功能
const deleteNurseById = async (nurse) => {
  try {
    console.log('=== 开始删除护士 ===')
    console.log('护士信息:', {
      id: nurse.id,
      name: nurse.name,
      workId: nurse.workId
    })
    
    // 显示删除确认对话框
    await ElMessageBox.confirm(
      `确定要删除护士 "${nurse.name}" (${nurse.workId}) 吗？\n\n此操作不可撤销！`,
      '删除护士确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )
    
    console.log('用户确认删除，开始调用API...')
    const response = await deleteNurse([nurse.id])
    
    if (response.code === 200) {
      console.log('删除护士成功')
      ElMessage.success(`成功删除护士 "${nurse.name}"`)
      await fetchNurseList() // 刷新列表
    } else {
      console.error('删除护士失败:', response.msg)
      ElMessage.error(response.msg || '删除护士失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消删除操作')
    } else {
      console.error('删除护士异常:', error)
      console.error('错误详情:', error.response || error.message || error)
      
      let errorMessage = '删除护士失败'
      if (error.response) {
        errorMessage = error.response.data?.msg || `服务器错误: ${error.response.status}`
      } else if (error.request) {
        errorMessage = '网络连接失败，请检查网络连接'
      } else {
        errorMessage = error.message || '未知错误'
      }
      
      ElMessage.error(errorMessage)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingNurse.value = null
  nurseForm.value = {
    workId: '',
    name: '',
    gender: '',
    age: '',
    nptId: '',
    clinicRoomId: '',
    majorDirect: '',
    phone: '',
    enterDate: '',
    status: 0,
    description: ''
  }
}

const saveNurse = async () => {
  // 表单验证
  if (!nurseForm.value.workId || !nurseForm.value.name || !nurseForm.value.gender || !nurseForm.value.nptId) {
    ElMessage.warning('请填写必填字段（工号、姓名、性别、职称）')
    return
  }
  
  // 年龄验证
  if (nurseForm.value.age && (nurseForm.value.age < 18 || nurseForm.value.age > 65)) {
    ElMessage.warning('年龄必须在18-65岁之间')
    return
  }
  
  // 手机号验证
  if (nurseForm.value.phone && !/^1[3-9]\d{9}$/.test(nurseForm.value.phone)) {
    ElMessage.warning('请输入正确的手机号码')
    return
  }

  try {
    if (showAddModal.value) {
      // 新增护士 - 数据清理和类型转换
      const nurseData = {
        name: nurseForm.value.name.trim(),
        workId: nurseForm.value.workId.trim(),
        gender: nurseForm.value.gender,
        age: nurseForm.value.age ? parseInt(nurseForm.value.age) : undefined,
        nptId: parseInt(nurseForm.value.nptId),
        clinicRoomId: nurseForm.value.clinicRoomId ? parseInt(nurseForm.value.clinicRoomId) : undefined,
        majorDirect: nurseForm.value.majorDirect ? nurseForm.value.majorDirect.trim() : undefined,
        phone: nurseForm.value.phone ? nurseForm.value.phone.trim() : undefined,
        enterDate: nurseForm.value.enterDate || undefined,
        status: parseInt(nurseForm.value.status),
        description: nurseForm.value.description ? nurseForm.value.description.trim() : undefined
      }
      
      console.log('开始新增护士:', nurseData)
      const response = await createNurse(nurseData)
      
      if (response.code === 200) {
        ElMessage.success('新增护士成功')
        closeModal()
        await fetchNurseList() // 刷新列表
      } else {
        ElMessage.error(response.msg || '新增护士失败')
      }
    } else if (showEditModal.value) {
      // 编辑护士 - 根据API要求只发送必要字段
      const updateData = {
        id: editingNurse.value.id
      }
      
      // 只添加有值的字段
      if (nurseForm.value.name && nurseForm.value.name.trim()) {
        updateData.name = nurseForm.value.name.trim()
      }
      
      if (nurseForm.value.phone && nurseForm.value.phone.trim()) {
        updateData.phone = nurseForm.value.phone.trim()
      }
      
      if (nurseForm.value.status !== undefined && nurseForm.value.status !== '') {
        updateData.status = parseInt(nurseForm.value.status)
      }
      
      if (nurseForm.value.clinicRoomId) {
        updateData.clinicRoomId = parseInt(nurseForm.value.clinicRoomId)
      }
      
      if (nurseForm.value.description && nurseForm.value.description.trim()) {
        updateData.description = nurseForm.value.description.trim()
      }
      
      console.log('开始编辑护士:', updateData)
      const response = await updateNurse(updateData)
      
      if (response.code === 200) {
        ElMessage.success('编辑护士成功')
        closeModal()
        await fetchNurseList() // 刷新列表
      } else {
        ElMessage.error(response.msg || '编辑护士失败')
      }
    }
  } catch (error) {
    console.error('保存护士信息异常:', error)
    ElMessage.error('保存护士信息失败，请检查网络连接')
  }
}

// 生命周期
onMounted(async () => {
  console.log('护士管理页面加载中...')
  console.log('当前基础URL:', 'http://localhost:8081/')
  
  try {
    // 并行加载基础数据
    console.log('步骤1: 并行加载基础数据')
    await Promise.all([
      fetchNurseProfessionTitles(),
      fetchClinicRooms()
    ])
    
    console.log('步骤2: 加载护士列表')
    await fetchNurseList()
    
    console.log('护士管理页面加载完成')
    console.log('最终职称数据:', nurseProfessionTitles.value)
    console.log('最终诊室数据:', clinicRooms.value)
  } catch (error) {
    console.error('页面初始化失败:', error)
    ElMessage.error('页面初始化失败，请刷新页面重试')
  }
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

// 详情弹窗样式
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  padding: 8px 0;

  .detail-item {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    background: #f8f9fc;
    border-radius: 8px;
    border-left: 4px solid $primary;

    &.full-width {
      grid-column: 1 / -1;
      flex-direction: column;
      align-items: stretch;
    }

    label {
      font-weight: 600;
      color: #555;
      min-width: 80px;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .detail-value {
      color: $text;
      word-break: break-word;
      
      &.workid {
        font-family: 'Courier New', monospace;
        color: $primary;
        font-weight: 600;
      }
      
      &.name {
        font-weight: 600;
        color: $text;
      }
      
      &.title {
        color: $warning;
        font-weight: 500;
      }
      
      &.department {
        color: $success;
        font-weight: 500;
      }
      
      &.phone {
        font-family: 'Courier New', monospace;
        color: $primary;
      }
      
      &.status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        
        &.active {
          background: rgba($success, 0.1);
          color: $success;
        }
        
        &.vacation {
          background: rgba($warning, 0.1);
          color: $warning;
        }
        
        &.suspended {
          background: rgba($danger, 0.1);
          color: $danger;
        }
      }
      
      &.description {
        margin-top: 8px;
        line-height: 1.6;
        color: #666;
      }
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
  font-size: 14px;
  margin-left: auto;
  margin-right: 16px;
}

.loading-indicator .loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e6f7ff;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-container p {
  color: #666;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.page-info {
  margin-left: 16px;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.loading-info {
  color: $primary;
  font-weight: 500;
  margin-left: 8px;
}

// 移动端适配
@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
    
    .detail-item {
      flex-direction: column;
      align-items: stretch;
      
      label {
        margin-right: 0;
        margin-bottom: 4px;
        min-width: auto;
      }
    }
  }
  
  .page-info {
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>