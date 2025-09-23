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
              <p class="desc">医生数量</p>
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
              <option value="0">在岗</option>
              <option value="1">休假</option>
              <option value="2">停止</option>
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
              共 {{ totalDoctors }} 位医生
              <span v-if="selectedDoctors.length > 0" class="selected-info">
                ，已选择 {{ selectedDoctors.length }} 位
              </span>
            </div>
          </div>

          <!-- 医生表格 -->
          <div class="doctor-table-wrapper" v-loading="loading">
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
                    <div class="employee-id">{{ doctor.workId }}</div>
                  </td>
                  <td @click="viewDoctorDetail(doctor)">
                    <div class="doctor-name-cell">
                      <div class="doctor-avatar">{{ doctor.name.charAt(0) }}</div>
                      <div>
                        <div class="doctor-name">{{ doctor.name }}</div>
                        <div class="doctor-meta">工号: {{ doctor.workId }}</div>
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
                    <span class="status-badge" :class="statusMap[doctor.status]?.class">
                      <span v-if="doctor.status === 0">✅ 在岗</span>
                      <span v-else-if="doctor.status === 1">🏖️ 休假</span>
                      <span v-else>⏸️ 停止</span>
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

          <!-- Element Plus 分页组件 -->
          <div class="pagination-wrapper" v-if="pagination.total > 0">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :page-sizes="[5, 10, 20, 50]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="changePage"
            />
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
              <input v-model="newDoctor.workId" type="text" placeholder="请输入工号">
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
              <select v-model="newDoctor.ptId">
                <option value="">请选择职称</option>
                <option v-for="option in titleOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>诊室 <span class="required">*</span></label>
              <select v-model="newDoctor.clinicRoomId">
                <option value="">请选择诊室</option>
                <option v-for="option in clinicRoomOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>专业方向</label>
              <input v-model="newDoctor.majorDirect" type="text" placeholder="请输入专业方向">
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="newDoctor.phone" type="text" placeholder="请输入联系电话">
            </div>
            <div class="form-group">
              <label>入职时间</label>
              <input v-model="newDoctor.enterDate" type="date">
            </div>
            <div class="form-group">
              <label>初始状态</label>
              <select v-model="newDoctor.status">
                <option :value="0">在岗</option>
                <option :value="1">休假</option>
                <option :value="2">停职</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>描述</label>
              <textarea v-model="newDoctor.description" placeholder="请输入医生描述信息" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeAddDoctorModal">取消</button>
          <button class="action-btn primary" @click="addDoctor">确认添加</button>
        </div>
      </div>
    </div>

    <!-- 医生详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h3>医生详情</h3>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body" v-loading="detailLoading">
          <div v-if="doctorDetail" class="detail-content">
            <!-- 基本信息 -->
            <div class="detail-section">
              <h4>基本信息</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>医生姓名：</label>
                  <span>{{ doctorDetail.name }}</span>
                </div>
                <div class="detail-item">
                  <label>工号：</label>
                  <span class="work-id">{{ doctorDetail.workId }}</span>
                </div>
                <div class="detail-item">
                  <label>职称：</label>
                  <span class="title-badge" :class="getTitleClass(doctorDetail.profashionTitle)">
                    {{ doctorDetail.profashionTitle }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>科室：</label>
                  <span>{{ doctorDetail.departmentName }}</span>
                </div>
                <div class="detail-item">
                  <label>专业方向：</label>
                  <span>{{ doctorDetail.majorDirect || '暂无' }}</span>
                </div>
                <div class="detail-item">
                  <label>联系电话：</label>
                  <span>{{ doctorDetail.phone || '暂无' }}</span>
                </div>
                <div class="detail-item">
                  <label>入职时间：</label>
                  <span>{{ formatDate(doctorDetail.enterDate) }}</span>
                </div>
                <div class="detail-item">
                  <label>当前状态：</label>
                  <span class="status-badge" :class="statusMap[doctorDetail.status]?.class">
                    <span v-if="doctorDetail.status === 0">✅ 在岗</span>
                    <span v-else-if="doctorDetail.status === 1">🏖️ 休假</span>
                    <span v-else>⏸️ 停职</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-data">
            <p>暂无医生详情数据</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeDetailModal">关闭</button>
          <button class="action-btn primary" @click="editDoctor(doctorDetail)">编辑医生</button>
        </div>
      </div>
    </div>

    <!-- 编辑医生弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑医生</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body" v-loading="editLoading">
          <div class="form-grid">
            <div class="form-group">
              <label>医生姓名 <span class="required">*</span></label>
              <input v-model="editDoctorData.name" type="text" placeholder="请输入医生姓名">
            </div>
            <div class="form-group">
              <label>工号 <span class="required">*</span></label>
              <input v-model="editDoctorData.workId" type="text" placeholder="请输入工号">
            </div>
            <div class="form-group">
              <label>性别 <span class="required">*</span></label>
              <select v-model="editDoctorData.gender">
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-group">
              <label>年龄 <span class="required">*</span></label>
              <input v-model="editDoctorData.age" type="number" placeholder="请输入年龄" min="20" max="70">
            </div>
            <div class="form-group">
              <label>职称 <span class="required">*</span></label>
              <select v-model="editDoctorData.ptId">
                <option value="">请选择职称</option>
                <option v-for="option in titleOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>诊室 <span class="required">*</span></label>
              <select v-model="editDoctorData.clinicRoomId">
                <option value="">请选择诊室</option>
                <option v-for="option in clinicRoomOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>专业方向</label>
              <input v-model="editDoctorData.majorDirect" type="text" placeholder="请输入专业方向">
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input v-model="editDoctorData.phone" type="text" placeholder="请输入联系电话">
            </div>
            <div class="form-group">
              <label>入职时间</label>
              <input v-model="editDoctorData.enterDate" type="date">
            </div>
            <div class="form-group">
              <label>医生状态</label>
              <select v-model="editDoctorData.status">
                <option :value="0">在岗</option>
                <option :value="1">休假</option>
                <option :value="2">停职</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>描述</label>
              <textarea v-model="editDoctorData.description" placeholder="请输入医生描述信息" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeEditModal">取消</button>
          <button class="action-btn primary" @click="updateDoctorInfo">保存修改</button>
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
import { getDoctorFullPage, createDoctor, getDoctorDetail, updateDoctor, deleteDoctor } from '@/api/doctors'

// 状态管理
const dropdownVisible = ref(false)
const searchByName = ref('')
const searchByEmployeeId = ref('')
const searchByDepartment = ref('')
const selectedStatus = ref('')
const selectedTitle = ref('')
const selectedDoctors = ref([])
const showAddModal = ref(false)
const showDetailModal = ref(false)
const showEditModal = ref(false)
const loading = ref(false)
const detailLoading = ref(false)
const editLoading = ref(false)

// 分页数据
const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
  totalPage: 0
})

const store = useStore()
const router = useRouter()
let username = store.state.user?.username || '管理员'

// 新医生表单数据
const newDoctor = ref({
  name: '',
  workId: '',
  gender: '',
  age: '',
  clinicRoomId: '',
  ptId: '',
  majorDirect: '',
  phone: '',
  enterDate: new Date().toISOString().split('T')[0],
  status: 0,
  description: ''
})

// 医生数据
const doctorList = ref([])
const doctorDetail = ref(null)
const editDoctorData = ref({
  id: null,
  name: '',
  workId: '',
  gender: '',
  age: '',
  clinicRoomId: '',
  ptId: '',
  majorDirect: '',
  phone: '',
  enterDate: '',
  status: 0,
  description: ''
})

// 职称映射
const titleMap = {
  1: '主任医师',
  2: '副主任医师', 
  3: '主治医师',
  4: '住院医师',
  5: '实习医师',
  6: '主任医师',
  7: '副主任医师',
  8: '主治医师',
  9: '住院医师',
  10: '主任医师',
  11: '主治医师'
}

// 诊室映射
const clinicRoomMap = {
  9: '内科普通门诊',
  10: '内科专家门诊',
  11: '外科门诊',
  12: '备用诊室，暂未启用',
  35: '心内科普通门诊',
  36: '心内科专家门诊',
  37: '普外科门诊',
  38: '备用诊室，暂未启用',
  39: '急诊科门诊',
  40: '眼科门诊',
  41: '耳鼻喉科门诊',
  42: '皮肤科备用诊室',
  43: '口腔科门诊',
  44: '中医科门诊',
  45: '康复科门诊'
}

// 职称选项（用于表单下拉选择）
const titleOptions = [
  { value: 1, label: '主任医师' },
  { value: 2, label: '副主任医师' },
  { value: 3, label: '主治医师' },
  { value: 4, label: '住院医师' },
  { value: 5, label: '实习医师' }
]

// 诊室选项（用于表单下拉选择）
const clinicRoomOptions = [
  { value: 9, label: '内科普通门诊' },
  { value: 10, label: '内科专家门诊' },
  { value: 11, label: '外科门诊' },
  { value: 35, label: '心内科普通门诊' },
  { value: 36, label: '心内科专家门诊' },
  { value: 37, label: '普外科门诊' },
  { value: 39, label: '急诊科门诊' },
  { value: 40, label: '眼科门诊' },
  { value: 41, label: '耳鼻喉科门诊' },
  { value: 43, label: '口腔科门诊' },
  { value: 44, label: '中医科门诊' },
  { value: 45, label: '康复科门诊' }
]

// 状态映射
const statusMap = {
  0: { text: '在岗', class: 'active' },
  1: { text: '休假', class: 'vacation' },
  2: { text: '停止', class: 'suspended' }
}

// 计算属性
const paginatedDoctors = computed(() => doctorList.value)

const totalDoctors = computed(() => {
  const total = pagination.value.total
  console.log('🔢 总医生数:', total)
  return total
})

const activeDoctors = computed(() => {
  const activeList = doctorList.value.filter(d => d.status === 0)
  console.log('✅ 在岗医生:', activeList.length, '详情:', activeList.map(d => ({ name: d.name, status: d.status })))
  return activeList.length
})

const vacationDoctors = computed(() => {
  const vacationList = doctorList.value.filter(d => d.status === 1)
  console.log('🏖️ 休假医生:', vacationList.length, '详情:', vacationList.map(d => ({ name: d.name, status: d.status })))
  return vacationList.length
})

const departmentCoverage = computed(() => {
  const departments = new Set(doctorList.value.map(d => d.departmentName))
  console.log('🏥 科室覆盖:', departments.size, '科室列表:', Array.from(departments))
  return departments.size
})

const isAllSelected = computed(() => {
  return paginatedDoctors.value.length > 0 && 
         paginatedDoctors.value.every(doctor => selectedDoctors.value.includes(doctor.id))
})

// API调用函数
const fetchDoctors = async () => {
  console.log('🔍 开始获取医生列表')
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      size: pagination.value.size
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
      params.status = parseInt(selectedStatus.value)
    }
    if (selectedTitle.value !== '') {
      // 根据职称名称找到对应的ID
      const titleId = Object.keys(titleMap).find(key => titleMap[key] === selectedTitle.value)
      if (titleId) {
        params.ptId = parseInt(titleId)
      }
    }
    
    console.log('📡 请求参数:', params)
    const res = await getDoctorFullPage(params)
    console.log('✅ 医生列表响应:', res)
    
    const data = res?.data || {}
    doctorList.value = (data.list || []).map(doctor => ({
      id: doctor.id,
      workId: doctor.workId,
      name: doctor.name,
      title: doctor.profashionTitle,
      department: doctor.departmentName,
      departmentName: doctor.departmentName, // 保持原字段名用于计算属性
      specialty: doctor.majorDirect,
      phone: doctor.phone,
      hireDate: doctor.enterDate,
      status: Number(doctor.status) // 确保status是数字类型
    }))
    
    // 更新分页信息
    pagination.value = {
      page: data.pageIndex || 1,
      size: data.pageSize || 10,
      total: data.totalCount || 0,
      totalPage: data.totalPage || 1
    }
    
    console.log('📊 分页信息:', pagination.value)
    console.log('👥 医生列表数据:', doctorList.value)
    
    // 详细的状态分析
    const statusAnalysis = doctorList.value.map(d => ({
      name: d.name,
      status: d.status,
      statusType: typeof d.status
    }))
    console.log('🔍 医生状态详细分析:', statusAnalysis)
    
    const activeCount = doctorList.value.filter(d => d.status === 0).length
    const vacationCount = doctorList.value.filter(d => d.status === 1).length
    const suspendedCount = doctorList.value.filter(d => d.status === 2).length
    
    console.log('📈 统计数据:', {
      total: pagination.value.total,
      listLength: doctorList.value.length,
      active: activeCount,
      vacation: vacationCount,
      suspended: suspendedCount,
      departments: new Set(doctorList.value.map(d => d.departmentName)).size
    })
    
    if (doctorList.value.length === 0) {
      ElMessage.info('未找到匹配的医生')
    } else {
      ElMessage.success(`找到 ${doctorList.value.length} 个医生`)
    }
  } catch (e) {
    console.error('❌ 获取医生列表失败:', e)
    ElMessage.error(`获取医生列表失败: ${e.message || '网络错误'}`)
  } finally {
    loading.value = false
  }
}

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
  pagination.value.page = 1
  fetchDoctors()
}

const handleFilter = () => {
  pagination.value.page = 1
  fetchDoctors()
}

const clearAllSearch = () => {
  searchByName.value = ''
  searchByEmployeeId.value = ''
  searchByDepartment.value = ''
  selectedStatus.value = ''
  selectedTitle.value = ''
  pagination.value.page = 1
  fetchDoctors()
}

const changePage = (page) => {
  if (typeof page === 'number') {
    pagination.value.page = page
    fetchDoctors()
  }
}

// 改变每页显示数量
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.page = 1
  fetchDoctors()
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
    workId: '',
    gender: '',
    age: '',
    clinicRoomId: '',
    ptId: '',
    majorDirect: '',
    phone: '',
    enterDate: new Date().toISOString().split('T')[0],
    status: 0,
    description: ''
  }
}

const addDoctor = async () => {
  // 表单验证
  if (!newDoctor.value.name || !newDoctor.value.workId || !newDoctor.value.gender || 
      !newDoctor.value.age || !newDoctor.value.ptId || !newDoctor.value.clinicRoomId) {
    ElMessage.warning('请填写必要信息（姓名、工号、性别、年龄、职称、诊室）')
    return
  }

  // 年龄验证
  const age = parseInt(newDoctor.value.age)
  if (isNaN(age) || age < 20 || age > 70) {
    ElMessage.warning('请输入有效的年龄（20-70岁）')
    return
  }

  // 手机号验证（如果填写了）
  if (newDoctor.value.phone && !/^1[3-9]\d{9}$/.test(newDoctor.value.phone)) {
    ElMessage.warning('请输入有效的手机号码')
    return
  }

  try {
    loading.value = true
    
    // 准备API请求数据
    const doctorData = {
      name: newDoctor.value.name.trim(),
      workId: newDoctor.value.workId.trim(),
      gender: newDoctor.value.gender,
      age: age,
      clinicRoomId: parseInt(newDoctor.value.clinicRoomId),
      ptId: parseInt(newDoctor.value.ptId),
      majorDirect: newDoctor.value.majorDirect.trim() || undefined,
      phone: newDoctor.value.phone.trim() || undefined,
      enterDate: newDoctor.value.enterDate || undefined,
      status: newDoctor.value.status,
      description: newDoctor.value.description.trim() || undefined
    }

    console.log('🔄 正在创建医生:', doctorData)
    
    // 调用API创建医生
    const response = await createDoctor(doctorData)
    console.log('✅ 创建医生响应:', response)
    
    if (response && response.code === 200) {
      ElNotification({
        title: '添加成功',
        message: `医生 ${doctorData.name} 已成功添加`,
        type: 'success'
      })
      
      // 关闭弹窗
      closeAddDoctorModal()
      
      // 刷新医生列表
      await fetchDoctors()
    } else {
      ElMessage.error(response?.msg || '添加医生失败')
    }
  } catch (error) {
    console.error('❌ 添加医生失败:', error)
    ElMessage.error(`添加医生失败: ${error.message || '网络错误'}`)
  } finally {
    loading.value = false
  }
}

const viewDoctorDetail = async (doctor) => {
  try {
    detailLoading.value = true
    showDetailModal.value = true
    doctorDetail.value = null
    
    console.log('🔍 正在获取医生详情:', doctor.id)
    
    const response = await getDoctorDetail(doctor.id)
    console.log('✅ 医生详情响应:', response)
    
    if (response && response.code === 200) {
      doctorDetail.value = response.data
    } else {
      ElMessage.error(response?.msg || '获取医生详情失败')
      showDetailModal.value = false
    }
  } catch (error) {
    console.error('❌ 获取医生详情失败:', error)
    ElMessage.error(`获取医生详情失败: ${error.message || '网络错误'}`)
    showDetailModal.value = false
  } finally {
    detailLoading.value = false
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  doctorDetail.value = null
}

const editDoctor = async (doctor) => {
  try {
    editLoading.value = true
    showEditModal.value = true
    
    // 重置编辑表单数据
    editDoctorData.value = {
      id: null,
      name: '',
      workId: '',
      gender: '',
      age: '',
      clinicRoomId: '',
      ptId: '',
      majorDirect: '',
      phone: '',
      enterDate: '',
      status: 0,
      description: ''
    }
    
    console.log('🔍 正在获取医生详情用于编辑:', doctor.id)
    
    const response = await getDoctorDetail(doctor.id)
    console.log('✅ 编辑医生详情响应:', response)
    
    if (response && response.code === 200) {
      const data = response.data
      
      // 根据职称名称找到对应的ID
      const getPtIdByTitle = (title) => {
        const titleOption = titleOptions.find(option => option.label === title)
        return titleOption ? titleOption.value : ''
      }
      
      // 根据科室名称找到对应的诊室ID
      const getClinicRoomIdByDepartment = (departmentName) => {
        // 根据科室名称匹配诊室ID的映射关系
        const departmentToClinicRoom = {
          '内科': 9,        // 内科普通门诊
          '外科': 11,       // 外科门诊
          '心内科': 35,     // 心内科普通门诊
          '普外科': 37,     // 普外科门诊
          '急诊科': 39,     // 急诊科门诊
          '眼科': 40,       // 眼科门诊
          '耳鼻喉科': 41,   // 耳鼻喉科门诊
          '口腔科': 43,     // 口腔科门诊
          '中医科': 44,     // 中医科门诊
          '康复科': 45      // 康复科门诊
        }
        
        // 尝试精确匹配
        if (departmentToClinicRoom[departmentName]) {
          return departmentToClinicRoom[departmentName]
        }
        
        // 尝试模糊匹配
        for (const [dept, roomId] of Object.entries(departmentToClinicRoom)) {
          if (departmentName && departmentName.includes(dept)) {
            return roomId
          }
        }
        
        // 如果都匹配不到，返回默认的内科普通门诊
        return 9
      }
      
      // 回显数据到编辑表单
      editDoctorData.value = {
        id: data.id,
        name: data.name || '',
        workId: data.workId || '',
        gender: data.gender || '', // 直接从API响应获取
        age: data.age || '', // 直接从API响应获取
        clinicRoomId: getClinicRoomIdByDepartment(data.departmentName), // 根据科室名称推导
        ptId: getPtIdByTitle(data.profashionTitle), // 根据职称名称找ID
        majorDirect: data.majorDirect || '',
        phone: data.phone || '',
        enterDate: data.enterDate ? data.enterDate.split('T')[0] : '',
        status: data.status || 0,
        description: data.description || '' // 直接从API响应获取
      }
      
      console.log('📝 编辑表单数据回显完成:', editDoctorData.value)
      
      // 提示用户数据回显成功
      ElMessage({
        message: '医生信息已完整回显，可以开始编辑',
        type: 'success',
        duration: 2000
      })
    } else {
      ElMessage.error(response?.msg || '获取医生详情失败')
      showEditModal.value = false
    }
  } catch (error) {
    console.error('❌ 获取医生详情失败:', error)
    ElMessage.error(`获取医生详情失败: ${error.message || '网络错误'}`)
    showEditModal.value = false
  } finally {
    editLoading.value = false
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editDoctorData.value = {
    id: null,
    name: '',
    workId: '',
    gender: '',
    age: '',
    clinicRoomId: '',
    ptId: '',
    majorDirect: '',
    phone: '',
    enterDate: '',
    status: 0,
    description: ''
  }
}

const updateDoctorInfo = async () => {
  // 表单验证
  if (!editDoctorData.value.name || !editDoctorData.value.workId || !editDoctorData.value.gender || 
      !editDoctorData.value.age || !editDoctorData.value.ptId || !editDoctorData.value.clinicRoomId) {
    ElMessage.warning('请填写必要信息（姓名、工号、性别、年龄、职称、诊室）')
    return
  }

  // 年龄验证
  const age = parseInt(editDoctorData.value.age)
  if (isNaN(age) || age < 20 || age > 70) {
    ElMessage.warning('请输入有效的年龄（20-70岁）')
    return
  }

  // 手机号验证（如果填写了）
  if (editDoctorData.value.phone && !/^1[3-9]\d{9}$/.test(editDoctorData.value.phone)) {
    ElMessage.warning('请输入有效的手机号码')
    return
  }

  try {
    loading.value = true
    
    // 准备API请求数据
    const updateData = {
      id: editDoctorData.value.id,
      name: editDoctorData.value.name.trim(),
      workId: editDoctorData.value.workId.trim(),
      gender: editDoctorData.value.gender,
      age: age,
      ptId: parseInt(editDoctorData.value.ptId),
      clinicRoomId: parseInt(editDoctorData.value.clinicRoomId),
      majorDirect: editDoctorData.value.majorDirect.trim() || undefined,
      phone: editDoctorData.value.phone.trim() || undefined,
      enterDate: editDoctorData.value.enterDate || undefined,
      status: editDoctorData.value.status,
      description: editDoctorData.value.description.trim() || undefined
    }

    console.log('🔄 正在更新医生信息:', updateData)
    
    // 调用API更新医生
    const response = await updateDoctor(updateData)
    console.log('✅ 更新医生响应:', response)
    
    if (response && response.code === 200) {
      ElNotification({
        title: '更新成功',
        message: `医生 ${updateData.name} 信息已成功更新`,
        type: 'success'
      })
      
      // 关闭编辑弹窗
      closeEditModal()
      
      // 关闭详情弹窗（如果打开的话）
      if (showDetailModal.value) {
        closeDetailModal()
      }
      
      // 刷新医生列表
      await fetchDoctors()
    } else {
      ElMessage.error(response?.msg || '更新医生信息失败')
    }
  } catch (error) {
    console.error('❌ 更新医生信息失败:', error)
    ElMessage.error(`更新医生信息失败: ${error.message || '网络错误'}`)
  } finally {
    loading.value = false
  }
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
    deleteDoctorById(doctor.id)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const deleteDoctorById = async (doctorId) => {
  try {
    console.log('🗑️ 开始删除医生:', doctorId)
    
    const response = await deleteDoctor([doctorId])
    console.log('✅ 删除医生响应:', response)
    
    if (response && response.code === 200) {
      // 从选中列表中移除
      const selectedIndex = selectedDoctors.value.indexOf(doctorId)
      if (selectedIndex > -1) {
        selectedDoctors.value.splice(selectedIndex, 1)
      }
      
      ElNotification({
        title: '删除成功',
        message: response.msg || '医生已被删除',
        type: 'success'
      })
      
      // 重新获取医生列表
      await fetchDoctors()
    } else {
      ElMessage.error(response?.msg || '删除医生失败')
    }
  } catch (error) {
    console.error('❌ 删除医生失败:', error)
    ElMessage.error(`删除医生失败: ${error.message || '网络错误'}`)
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

const batchDeleteDoctors = async () => {
  if (selectedDoctors.value.length === 0) {
    ElMessage.warning('请先选择要删除的医生')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedDoctors.value.length} 位医生吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    console.log('🗑️ 开始批量删除医生:', selectedDoctors.value)
    
    const response = await deleteDoctor(selectedDoctors.value)
    console.log('✅ 批量删除医生响应:', response)
    
    if (response && response.code === 200) {
      const deletedCount = selectedDoctors.value.length
      selectedDoctors.value = []
      
      ElNotification({
        title: '批量删除成功',
        message: response.msg || `已删除 ${deletedCount} 位医生`,
        type: 'success'
      })
      
      // 重新获取医生列表
      await fetchDoctors()
    } else {
      ElMessage.error(response?.msg || '批量删除医生失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消批量删除')
    } else {
      console.error('❌ 批量删除医生失败:', error)
      ElMessage.error(`批量删除医生失败: ${error.message || '网络错误'}`)
    }
  }
}

// 生命周期
onMounted(async () => {
  document.addEventListener('click', () => (dropdownVisible.value = false))
  await fetchDoctors()
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

// 分页组件样式
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  
  :deep(.el-pagination) {
    .el-pagination__total {
      color: #666;
      font-weight: 500;
    }
    
    .el-pagination__sizes {
      .el-select {
        .el-input {
          .el-input__wrapper {
            border-radius: 8px;
          }
        }
      }
    }
    
    .btn-prev, .btn-next {
      border-radius: 8px;
      border: 1px solid #dcdfe6;
      
      &:hover {
        color: $primary;
        border-color: $primary;
      }
    }
    
    .el-pager {
      .number {
        border-radius: 8px;
        border: 1px solid transparent;
        
        &:hover {
          color: $primary;
          border-color: $primary;
        }
        
        &.is-active {
          background: $primary;
          border-color: $primary;
          color: white;
        }
      }
    }
    
    .el-pagination__jump {
      .el-input {
        .el-input__wrapper {
          border-radius: 8px;
        }
      }
    }
  }
}

// 医生详情弹窗样式
.detail-modal {
  max-width: 800px;
  
  .detail-content {
    .detail-section {
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        color: $text;
        font-weight: 600;
        padding-bottom: 8px;
        border-bottom: 2px solid $border;
      }
      
      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
        
        .detail-item {
          display: flex;
          align-items: center;
          padding: 12px;
          background: $light;
          border-radius: 8px;
          
          label {
            font-weight: 500;
            color: #666;
            min-width: 100px;
            margin-right: 12px;
          }
          
          span {
            color: $text;
            font-weight: 500;
            
            &.work-id {
              font-family: 'Courier New', monospace;
              color: $primary;
              font-weight: 600;
            }
          }
          
          .title-badge {
            display: inline-block;
            padding: 4px 12px;
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
          
          .status-badge {
            padding: 4px 12px;
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
        }
      }
    }
  }
  
  .no-data {
    text-align: center;
    padding: 40px;
    color: #999;
    
    p {
      margin: 0;
      font-size: 14px;
    }
  }
}

// 响应式适配详情弹窗
@media (max-width: 768px) {
  .detail-modal {
    max-width: 95%;
    
    .detail-grid {
      grid-template-columns: 1fr !important;
      
      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        
        label {
          min-width: auto;
          margin-right: 0;
          margin-bottom: 4px;
        }
      }
    }
  }
}
</style>