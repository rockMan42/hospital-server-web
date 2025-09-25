<template>
  <div class="patient-manager">
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
      <SideLeft :activeMenu="'patient'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>患者管理</h1>
          <p>管理和查看所有患者信息</p>
        </div>

        <!-- 数据卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">👥</div>
            <div class="card-info">
              <h3>总患者数</h3>
              <p class="number">{{ totalPatients }}</p>
              <p class="desc">已注册患者</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">✅</div>
            <div class="card-info">
              <h3>今日新增</h3>
              <p class="number">{{ todayNewPatients }}</p>
              <p class="desc">新注册患者</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">⏳</div>
            <div class="card-info">
              <h3>待复诊</h3>
              <p class="number">{{ pendingFollowUp }}</p>
              <p class="desc">需要复诊</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">🚨</div>
            <div class="card-info">
              <h3>重点关注</h3>
              <p class="number">{{ criticalPatients }}</p>
              <p class="desc">需重点关注</p>
            </div>
          </div>
        </div>

         <!-- 快捷操作 -->
         <div class="quick-actions">
           <button class="action-btn primary" @click="showAddPatientModal">新增患者</button>
           <button class="action-btn outline" @click="exportPatientData">导出数据</button>
           <button class="action-btn outline" @click="importPatientData">导入数据</button>
           <button 
             class="action-btn danger" 
             @click="batchDeletePatients"
             :disabled="selectedPatients.length === 0"
           >
             批量删除 ({{ selectedPatients.length }})
           </button>
         </div>

         <!-- 搜索和筛选区域 -->
         <div class="search-filter-section">
           <div class="search-bars">
             <!-- 姓名搜索 -->
             <div class="search-input-wrapper">
               <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                 <circle cx="12" cy="7" r="4"></circle>
               </svg>
               <input 
                 v-model="searchByName" 
                 type="text" 
                 placeholder="按姓名搜索..."
                 class="search-input"
                 @input="handleSearch"
               />
             </div>

             <!-- 身份证号搜索 -->
             <div class="search-input-wrapper">
               <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                 <line x1="8" y1="21" x2="16" y2="21"></line>
                 <line x1="12" y1="17" x2="12" y2="21"></line>
               </svg>
               <input 
                 v-model="searchByIdCard" 
                 type="text" 
                 placeholder="按身份证号搜索..."
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
             <select v-model="selectedGender" @change="handleFilter" class="filter-select">
               <option value="">全部性别</option>
               <option value="男">男</option>
               <option value="女">女</option>
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

         <!-- 患者列表 -->
         <div class="patient-list">
           <div class="list-header">
             <h2>患者列表</h2>
             <div class="list-info">
               共 {{ totalPatients }} 位患者
               <span v-if="selectedPatients.length > 0" class="selected-info">
                 ，已选择 {{ selectedPatients.length }} 位
               </span>
             </div>
           </div>

          <!-- 患者表格 -->
          <div class="patient-table-wrapper" v-loading="loading">
            <table class="patient-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" class="select-checkbox">
                  </th>
                  <th>就诊卡号</th>
                  <th>患者姓名</th>
                  <th>性别</th>
                  <th>年龄</th>
                  <th>联系方式</th>
                  <th>地址</th>
                  <th>身份证号</th>
                  <th>备注</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="patient in paginatedPatients" :key="patient.id" class="table-row">
                  <td @click.stop>
                    <input 
                      type="checkbox" 
                      :checked="selectedPatients.includes(patient.id)" 
                      @change="togglePatientSelect(patient.id)"
                      class="select-checkbox"
                    >
                  </td>
                  <td @click="viewPatientDetail(patient)">
                    <div class="card-number">{{ patient.patientId || patient.patient_id || generateCardNumber(patient.id) }}</div>
                  </td>
                  <td @click="viewPatientDetail(patient)">
                    <div class="patient-name-cell">
                      <div class="patient-avatar-small">{{ patient.name.charAt(0) }}</div>
                      <div>
                        <div class="patient-name">{{ patient.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td @click="viewPatientDetail(patient)">
                    <span class="gender-badge" :class="genderClass(patient.gender)">
                      {{ patient.gender }}
                    </span>
                  </td>
                  <td @click="viewPatientDetail(patient)">{{ calculateAge(patient.birthDate) }}岁</td>
                  <td @click="viewPatientDetail(patient)">
                    <div class="contact-info">
                      <div class="phone">{{ patient.phone }}</div>
                    </div>
                  </td>
                  <td @click="viewPatientDetail(patient)">
                    <div class="address-info" :title="patient.address">
                      {{ patient.address }}
                    </div>
                  </td>
                  <td @click="viewPatientDetail(patient)">
                    <span class="id-card">{{ maskIdCard(patient.idCard) }}</span>
                  </td>
                  <td @click="viewPatientDetail(patient)">
                    <span class="remark-info" :title="patient.remark">
                      {{ patient.remark || '无备注' }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn-mini edit" @click.stop="editPatient(patient)" title="编辑">
                        ✏️
                      </button>
                      <button class="action-btn-mini view" @click.stop="viewMedicalRecord(patient)" title="病历">
                        📋
                      </button>
                      <button class="action-btn-mini delete" @click.stop="confirmDeletePatient(patient)" title="删除">
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

    <!-- 新增患者弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddPatientModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新增患者</h3>
          <button class="close-btn" @click="closeAddPatientModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>就诊卡号</label>
              <input v-model="newPatient.patientId" type="text" placeholder="例如：HOS2025000001">
            </div>
            <div class="form-group">
              <label>患者姓名 <span class="required">*</span></label>
              <input v-model="newPatient.name" type="text" placeholder="请输入患者姓名">
            </div>
            <div class="form-group">
              <label>性别 <span class="required">*</span></label>
              <select v-model="newPatient.gender">
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-group">
              <label>出生日期</label>
              <input v-model="newPatient.birthDate" type="date" placeholder="请选择出生日期">
            </div>
            <div class="form-group">
              <label>身份证号</label>
              <input v-model="newPatient.idCard" type="text" placeholder="请输入身份证号">
            </div>
            <div class="form-group">
              <label>手机号 <span class="required">*</span></label>
              <input v-model="newPatient.phone" type="text" placeholder="请输入手机号">
            </div>
            <div class="form-group">
              <label>地址</label>
              <input v-model="newPatient.address" type="text" placeholder="请输入地址">
            </div>
            <div class="form-group full-width">
              <label>备注</label>
              <textarea v-model="newPatient.remark" placeholder="请输入备注信息" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeAddPatientModal">取消</button>
          <button class="action-btn primary" @click="addPatient">确认添加</button>
        </div>
      </div>
    </div>
    
    <!-- 患者详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>患者详情</h3>
          <button class="close-btn" @click="showDetailModal = false">×</button>
        </div>
        <div class="modal-body" v-loading="detailLoading">
          <div v-if="patientDetail" class="form-grid">
            <div class="form-group">
              <label>就诊卡号</label>
              <input type="text" :value="patientDetail.patientId || patientDetail.patient_id || '-'" disabled>
            </div>
            <div class="form-group">
              <label>患者姓名</label>
              <input type="text" :value="patientDetail.name" disabled>
            </div>
            <div class="form-group">
              <label>性别</label>
              <input type="text" :value="patientDetail.gender" disabled>
            </div>
            <div class="form-group">
              <label>出生日期</label>
              <input type="text" :value="patientDetail.birthDate || '-'" disabled>
            </div>
            <div class="form-group">
              <label>身份证号</label>
              <input type="text" :value="patientDetail.idCard || '-'" disabled>
            </div>
            <div class="form-group">
              <label>手机号</label>
              <input type="text" :value="patientDetail.phone || '-'" disabled>
            </div>
            <div class="form-group">
              <label>地址</label>
              <input type="text" :value="patientDetail.address || '-'" disabled>
            </div>
            <div class="form-group full-width">
              <label>备注</label>
              <textarea :value="patientDetail.remark || '-'" rows="3" disabled />
            </div>
          </div>
          <div v-else-if="!detailLoading" style="padding: 24px; text-align: center; color: #666;">暂无数据</div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="showDetailModal = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 编辑患者弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑患者</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body" v-loading="editLoading">
          <div class="form-grid">
            <div class="form-group">
              <label>就诊卡号</label>
              <input v-model="editPatientData.patientId" type="text" placeholder="例如：HOS2025000001">
            </div>
            <div class="form-group">
              <label>患者姓名 <span class="required">*</span></label>
              <input v-model="editPatientData.name" type="text" placeholder="请输入患者姓名">
            </div>
            <div class="form-group">
              <label>性别 <span class="required">*</span></label>
              <select v-model="editPatientData.gender">
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-group">
              <label>出生日期</label>
              <input v-model="editPatientData.birthDate" type="date" placeholder="请选择出生日期">
            </div>
            <div class="form-group">
              <label>身份证号</label>
              <input v-model="editPatientData.idCard" type="text" placeholder="请输入身份证号">
            </div>
            <div class="form-group">
              <label>手机号 <span class="required">*</span></label>
              <input v-model="editPatientData.phone" type="text" placeholder="请输入手机号">
            </div>
            <div class="form-group">
              <label>地址</label>
              <input v-model="editPatientData.address" type="text" placeholder="请输入地址">
            </div>
            <div class="form-group full-width">
              <label>备注</label>
              <textarea v-model="editPatientData.remark" placeholder="请输入备注信息" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn outline" @click="closeEditModal">取消</button>
          <button class="action-btn primary" @click="updatePatientInfo">保存修改</button>
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
import { searchPatients, createPatient, getPatientDetail, updatePatient, deletePatient as deletePatientApi } from '@/api/patients'

// 状态管理
const searchByName = ref('')
const searchByIdCard = ref('')
const searchByPhone = ref('')
const selectedStatus = ref('')
const selectedGender = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedPatients = ref([])
const showAddModal = ref(false)
const loading = ref(false)

// 详情弹窗状态
const showDetailModal = ref(false)
const detailLoading = ref(false)
const patientDetail = ref(null)

// 编辑弹窗状态
const showEditModal = ref(false)
const editLoading = ref(false)
const editPatientData = ref({
  id: '',
  patientId: '',
  name: '',
  gender: '',
  birthDate: '',
  idCard: '',
  phone: '',
  address: '',
  remark: ''
})

// API数据状态
const patientList = ref([])
const totalCount = ref(0)
const totalPages = ref(0)

const store = useStore()
const router = useRouter()

// 新患者表单数据
const newPatient = ref({
  patientId: '',
  name: '',
  gender: '',
  birthDate: '',
  idCard: '',
  phone: '',
  address: '',
  remark: ''
})

// 获取患者列表
const fetchPatients = async () => {
  try {
    loading.value = true
    console.log('📋 获取患者列表，参数:', {
      page: currentPage.value,
      size: pageSize.value,
      name: searchByName.value || undefined,
      idCard: searchByIdCard.value || undefined,
      phone: searchByPhone.value || undefined
    })
    
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    // 只有非空搜索条件才添加到参数中
    if (searchByName.value.trim()) {
      params.name = searchByName.value.trim()
    }
    if (searchByIdCard.value.trim()) {
      params.idCard = searchByIdCard.value.trim()
    }
    if (searchByPhone.value.trim()) {
      params.phone = searchByPhone.value.trim()
    }
    
    const response = await searchPatients(params)
    console.log('患者列表响应:', response)
    
    if (response.code === 200) {
      const data = response.data
      patientList.value = data.list || []
      totalCount.value = data.totalCount || 0
      totalPages.value = data.totalPage || 0
      
      console.log('📋 患者数据更新:', {
        list: patientList.value.length,
        totalCount: totalCount.value,
        totalPages: totalPages.value,
        samplePatient: patientList.value[0] // 显示第一个患者的完整数据结构
      })
    } else {
      ElMessage.error(response.msg || '获取患者列表失败')
      patientList.value = []
      totalCount.value = 0
      totalPages.value = 0
    }
  } catch (error) {
    console.error('获取患者列表失败:', error)
    ElMessage.error('获取患者列表失败，请稍后重试')
    patientList.value = []
    totalCount.value = 0
    totalPages.value = 0
  } finally {
    loading.value = false
  }
}

// 计算属性
const paginatedPatients = computed(() => {
  // 直接返回API获取的当前页数据
  return patientList.value
})

const totalPatients = computed(() => totalCount.value)
const todayNewPatients = computed(() => 2) // 模拟数据，可以后续从API获取
const pendingFollowUp = computed(() => patientList.value.filter(p => p.remark && p.remark.includes('复诊')).length)
const criticalPatients = computed(() => patientList.value.filter(p => p.remark && (p.remark.includes('重点') || p.remark.includes('关注'))).length)

const isAllSelected = computed(() => {
  return paginatedPatients.value.length > 0 && 
         paginatedPatients.value.every(patient => selectedPatients.value.includes(patient.id))
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

const goBack = () => {
  router.push('/')
}

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

const handleSearch = () => {
  currentPage.value = 1
  fetchPatients()
}

const handleFilter = () => {
  currentPage.value = 1
  fetchPatients()
}

const clearAllSearch = () => {
  searchByName.value = ''
  searchByIdCard.value = ''
  searchByPhone.value = ''
  selectedGender.value = ''
  currentPage.value = 1
  fetchPatients()
}

const changePage = (page) => {
  if (typeof page === 'number') {
    currentPage.value = page
    fetchPatients()
  }
}

const maskIdCard = (idCard) => {
  if (!idCard) return ''
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

const generateCardNumber = (id) => {
  if (!id) return '-'
  // 生成就诊卡号：HOS + 年份 + 6位数字ID
  const year = new Date().getFullYear()
  const paddedId = String(id).padStart(6, '0')
  return `HOS${year}${paddedId}`
}

// 新增患者时生成一个建议的就诊卡号（可编辑）
const generatePatientIdForNew = () => {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return `HOS${year}${rand}`
}

const calculateAge = (birthDate) => {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// 性别样式映射：后端返回 '男'/'女'，也兼容 'male'/'female'
const genderClass = (gender) => {
  if (!gender) return ''
  const g = typeof gender === 'string' ? gender.trim() : ''
  if (g === '男' || g.toLowerCase?.() === 'male' || g === 'M') return 'male'
  if (g === '女' || g.toLowerCase?.() === 'female' || g === 'F') return 'female'
  return ''
}

const showAddPatientModal = () => {
  // 打开时预填一个可编辑的就诊卡号
  if (!newPatient.value.patientId) {
    newPatient.value.patientId = generatePatientIdForNew()
  }
  showAddModal.value = true
}

const closeAddPatientModal = () => {
  showAddModal.value = false
  // 重置表单
  newPatient.value = {
    patientId: '',
    name: '',
    gender: '',
    birthDate: '',
    idCard: '',
    phone: '',
    address: '',
    remark: ''
  }
}

const addPatient = async () => {
  // 基本校验
  if (!newPatient.value.name || !newPatient.value.gender || !newPatient.value.phone) {
    ElMessage.warning('请填写必要信息（姓名、性别、手机号）')
    return
  }

  // 手机号格式验证（中国大陆手机号）
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(newPatient.value.phone)) {
    ElMessage.warning('请输入正确的手机号格式')
    return
  }

  // 组装请求参数，按后端字段
  const payload = {
    patientId: newPatient.value.patientId ? newPatient.value.patientId.trim() : generatePatientIdForNew(),
    name: newPatient.value.name.trim(),
    gender: newPatient.value.gender, // '男' | '女'
    idCard: newPatient.value.idCard ? newPatient.value.idCard.trim() : undefined,
    birthDate: newPatient.value.birthDate || undefined,
    phone: newPatient.value.phone.trim(),
    address: newPatient.value.address ? newPatient.value.address.trim() : undefined,
    remark: newPatient.value.remark ? newPatient.value.remark.trim() : undefined
  }

  try {
    loading.value = true
    console.log('🆕 创建患者 payload:', payload)
    const resp = await createPatient(payload)
    console.log('创建患者响应:', resp)
    if (resp && resp.code === 200) {
      ElNotification({
        title: '添加成功',
        message: `患者 ${payload.name} 已创建`,
        type: 'success'
      })
      closeAddPatientModal()
      // 刷新列表到第一页，便于看到新数据
      currentPage.value = 1
      await fetchPatients()
    } else {
      ElMessage.error(resp?.msg || '创建患者失败')
    }
  } catch (err) {
    console.error('创建患者失败:', err)
    ElMessage.error('创建患者失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const editPatient = async (patient) => {
  // 获取详情以回显
  const id = patient?.id
  if (!id) {
    ElMessage.error('无法获取患者ID')
    return
  }
  editLoading.value = true
  showEditModal.value = true
  try {
    const resp = await getPatientDetail(id)
    if (resp && resp.code === 200 && resp.data) {
      const d = resp.data
      editPatientData.value = {
        id: d.id,
        patientId: d.patientId || d.patient_id || '',
        name: d.name || '',
        gender: d.gender || '',
        birthDate: d.birthDate || '',
        idCard: d.idCard || '',
        phone: d.phone || '',
        address: d.address || '',
        remark: d.remark || ''
      }
    } else {
      showEditModal.value = false
      ElMessage.error(resp?.msg || '获取患者详情失败')
    }
  } catch (e) {
    console.error('获取患者详情失败:', e)
    showEditModal.value = false
    ElMessage.error('获取患者详情失败，请稍后重试')
  } finally {
    editLoading.value = false
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editPatientData.value = {
    id: '', patientId: '', name: '', gender: '', birthDate: '', idCard: '', phone: '', address: '', remark: ''
  }
}

const updatePatientInfo = async () => {
  // 基本校验
  const p = editPatientData.value
  if (!p.id) {
    ElMessage.error('缺少患者ID')
    return
  }
  if (!p.name || !p.gender || !p.phone) {
    ElMessage.warning('请完整填写必填项（姓名、性别、手机号）')
    return
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(p.phone)) {
    ElMessage.warning('请输入正确的手机号格式')
    return
  }

  // 组装payload
  const payload = {
    id: p.id,
    patientId: p.patientId ? String(p.patientId).trim() : undefined,
    name: p.name.trim(),
    gender: p.gender,
    idCard: p.idCard ? p.idCard.trim() : undefined,
    birthDate: p.birthDate || undefined,
    phone: p.phone.trim(),
    address: p.address ? p.address.trim() : undefined,
    remark: p.remark ? p.remark.trim() : undefined
  }

  try {
    editLoading.value = true
    const resp = await updatePatient(payload)
    if (resp && resp.code === 200) {
      ElNotification({ title: '更新成功', message: `患者 ${payload.name} 信息已更新`, type: 'success' })
      closeEditModal()
      // 刷新当前页
      await fetchPatients()
    } else {
      ElMessage.error(resp?.msg || '更新失败')
    }
  } catch (e) {
    console.error('更新患者失败:', e)
    ElMessage.error('更新患者失败，请稍后重试')
  } finally {
    editLoading.value = false
  }
}

const viewPatientDetail = (patient) => {
  // 打开详情弹窗并加载详情
  showDetailModal.value = true
  detailLoading.value = true
  patientDetail.value = null
  const id = patient?.id
  if (!id) {
    detailLoading.value = false
    ElMessage.error('无法获取患者ID')
    return
  }
  ;(async () => {
    try {
      const resp = await getPatientDetail(id)
      if (resp && resp.code === 200) {
        patientDetail.value = resp.data
      } else {
        ElMessage.error(resp?.msg || '获取患者详情失败')
        showDetailModal.value = false
      }
    } catch (e) {
      console.error('获取患者详情失败:', e)
      ElMessage.error('获取患者详情失败，请稍后重试')
      showDetailModal.value = false
    } finally {
      detailLoading.value = false
    }
  })()
}

const viewMedicalRecord = (patient) => {
  ElMessage.info(`查看病历：${patient.name}`)
  // 跳转到病历页面
}

const makeAppointment = (patient) => {
  ElMessage.info(`为患者 ${patient.name} 预约`)
  // 跳转到预约页面
}

const exportPatientData = () => {
  ElMessage.info('导出患者数据')
  // 实现导出功能
}

const importPatientData = () => {
  ElMessage.info('导入患者数据')
  // 实现导入功能
}

// 患者选择相关方法
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消全选
    selectedPatients.value = selectedPatients.value.filter(
      id => !paginatedPatients.value.some(patient => patient.id === id)
    )
  } else {
    // 全选当前页
    paginatedPatients.value.forEach(patient => {
      if (!selectedPatients.value.includes(patient.id)) {
        selectedPatients.value.push(patient.id)
      }
    })
  }
}

const togglePatientSelect = (patientId) => {
  const index = selectedPatients.value.indexOf(patientId)
  if (index > -1) {
    selectedPatients.value.splice(index, 1)
  } else {
    selectedPatients.value.push(patientId)
  }
}

// 删除患者相关方法
const confirmDeletePatient = (patient) => {
  ElMessageBox.confirm(
    `确定要删除患者 "${patient.name}" 吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    deletePatientById(patient.id)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const deletePatientById = async (patientId) => {
  if (!patientId) return
  try {
    loading.value = true
    const resp = await deletePatientApi(patientId)
    if (resp && resp.code === 200) {
      ElNotification({ title: '删除成功', message: '患者已删除', type: 'success' })
      // 从选中列表中移除
      const idx = selectedPatients.value.indexOf(patientId)
      if (idx > -1) selectedPatients.value.splice(idx, 1)
      // 若当前页无数据，回到第一页
      await fetchPatients()
      if (patientList.value.length === 0 && currentPage.value > 1) {
        currentPage.value = 1
        await fetchPatients()
      }
    } else {
      ElMessage.error(resp?.msg || '删除失败')
    }
  } catch (e) {
    console.error('删除患者失败:', e)
    ElMessage.error('删除患者失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const batchDeletePatients = () => {
  if (selectedPatients.value.length === 0) {
    ElMessage.warning('请先选择要删除的患者')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedPatients.value.length} 位患者吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    const ids = [...selectedPatients.value]
    try {
      loading.value = true
      const resp = await deletePatientApi(ids)
      if (resp && resp.code === 200) {
        ElNotification({ title: '批量删除成功', message: `已删除 ${ids.length} 位患者`, type: 'success' })
        selectedPatients.value = []
        // 刷新列表
        await fetchPatients()
        if (patientList.value.length === 0 && currentPage.value > 1) {
          currentPage.value = 1
          await fetchPatients()
        }
      } else {
        ElMessage.error(resp?.msg || '批量删除失败')
      }
    } catch (e) {
      console.error('批量删除失败:', e)
      ElMessage.error('批量删除失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
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

// 生命周期
onMounted(() => {
  // 页面加载时获取患者列表
  fetchPatients()
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

.patient-manager {
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

  // 统计卡片（复用医生主页样式）
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

  // 快捷操作（复用医生主页样式）
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
           opacity: 0.5;
           cursor: not-allowed;
           &:hover { background: $danger; }
         }
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
    }
  }

  // 患者列表
  .patient-list {
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
    .patient-table-wrapper {
      overflow-x: auto;
      margin-bottom: 20px;
      border: 1px solid $border;
      border-radius: 8px;
      background: white;

     .patient-table {
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

           .select-checkbox {
             width: 16px;
             height: 16px;
             cursor: pointer;
             accent-color: $primary;
           }

           &:nth-child(1) { width: 5%; } /* 选择框 */
           &:nth-child(2) { width: 12%; } /* 就诊卡号 */
           &:nth-child(3) { width: 15%; } /* 患者姓名 */
           &:nth-child(4) { width: 6%; } /* 性别 */
           &:nth-child(5) { width: 6%; } /* 年龄 */
           &:nth-child(6) { width: 12%; } /* 联系方式 */
           &:nth-child(7) { width: 18%; } /* 地址 */
           &:nth-child(8) { width: 14%; } /* 身份证号 */
           &:nth-child(9) { width: 7%; } /* 状态 */
           &:nth-child(10) { width: 5%; } /* 操作 */
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

             // 就诊卡号
             .card-number {
               font-weight: 600;
               color: $primary;
               font-family: 'Courier New', monospace;
               font-size: 13px;
             }

            // 患者姓名单元格
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

             // 性别标签
             .gender-badge {
               display: inline-block;
               padding: 2px 8px;
               border-radius: 12px;
               font-size: 12px;
               font-weight: 500;

               &.male {
                 background: rgba(#3b82f6, 0.1);
                 color: #3b82f6;
               }

               &.female {
                 background: rgba(#ec4899, 0.1);
                 color: #ec4899;
               }
             }

             // 联系方式
             .contact-info {
               line-height: 1.4;
               .phone {
                 font-weight: 500;
                 color: $text;
               }
             }

             // 地址信息
             .address-info {
               max-width: 150px;
               overflow: hidden;
               text-overflow: ellipsis;
               white-space: nowrap;
               color: $text;
             }

             // 身份证号
             .id-card {
               font-family: 'Courier New', monospace;
               font-size: 12px;
               color: #666;
               letter-spacing: 1px;
             }

             // 备注信息
             .remark-info {
               font-size: 12px;
               color: #666;
               max-width: 120px;
               overflow: hidden;
               text-overflow: ellipsis;
               white-space: nowrap;
               display: inline-block;
             }

            // 状态标签
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.active { background: rgba($success, 0.1); color: $success; }
              &.inactive { background: rgba($warning, 0.1); color: $warning; }
              &.critical { background: rgba($danger, 0.1); color: $danger; }
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

                 &.edit:hover {
                   background: rgba($primary, 0.1);
                   color: $primary;
                 }

                 &.view:hover {
                   background: rgba($success, 0.1);
                   color: $success;
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

  .patient-table-wrapper {
    font-size: 12px;

    .patient-table {
      th, td {
        padding: 8px;
      }
    }
  }
}
</style>