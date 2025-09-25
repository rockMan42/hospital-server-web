<template>
  <el-dialog :model-value="modelValue" title="选择患者" width="720px" @close="close">
    <div class="search-bar">
      <el-input v-model="keyword" placeholder="姓名 / 身份证 / 手机号" clearable @keyup.enter="handleSearch" @input="onKeywordChange" style="max-width: 360px" />
      <el-button type="primary" :loading="loading" @click="handleSearch">搜索</el-button>
      <el-button text @click="toggleCreate">新建患者</el-button>
      <el-button type="info" size="small" @click="testConnection">测试连接</el-button>
    </div>

    <div v-if="!creating">
      <el-table :data="patients" height="360" v-loading="loading">
        <el-table-column label="就诊卡号" width="180">
          <template #default="{ row }">{{ row.patientId || row.patient_id || '-' }}</template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">{{ row.gender || '-' }}</template>
        </el-table-column>
        <el-table-column prop="idCard" label="身份证号" width="200" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="selectPatient(row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!loading && patients.length === 0" class="empty">暂无数据，请尝试更换关键字</div>
      
      <!-- 分页组件 -->
      <el-pagination
        v-if="pagination.total > 0"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[5, 10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 16px; justify-content: center;"
      />
    </div>

    <div v-else class="create-form">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="就诊卡号" prop="patientId">
          <el-input v-model="form.patientId" placeholder="例如：HOS2025000001" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择">
            <el-option label="男" value="M" />
            <el-option label="女" value="F" />
          </el-select>
        </el-form-item>
        <el-form-item label="身份证" prop="idCard">
          <el-input v-model="form.idCard" placeholder="可自动解析出生日期/性别" />
        </el-form-item>
        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker v-model="form.birthDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item>
          <el-button @click="toggleCreate">返回搜索</el-button>
          <el-button type="primary" :loading="submitting" @click="submitCreate">创建并选择</el-button>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="close">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { searchPatients, createPatient } from '@/api/patients'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'select'])

const keyword = ref('')
const loading = ref(false)
const patients = ref([])
let searchTimer = null

// 分页数据
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const creating = ref(false)
const submitting = ref(false)
const formRef = ref()
const form = ref({
  patientId: '',
  name: '',
  gender: '',
  idCard: '',
  birthDate: '',
  phone: '',
  address: '',
  remark: ''
})
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^\d{6,20}$/ , message: '手机号格式不正确', trigger: 'blur' }
  ],
  idCard: [
    { pattern: /^(\d{15}|\d{17}[\dXx])$/, message: '身份证号格式不正确', trigger: 'blur' }
  ]
}

const close = () => emit('update:modelValue', false)

// 防抖搜索：输入后延迟500ms自动搜索
const onKeywordChange = () => {
  console.log('📝 搜索框输入变化:', keyword.value)
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    console.log('⏰ 防抖触发搜索')
    handleSearch(true) // 新搜索时重置到第一页
  }, 500)
}

// 智能识别输入类型：姓名/身份证/手机号
const detectSearchType = (input) => {
  if (!input || !input.trim()) return {}
  
  const trimmed = input.trim()
  
  // 身份证号：15位或18位数字，最后一位可能是X
  if (/^\d{15}$|^\d{17}[\dXx]$/.test(trimmed)) {
    console.log('🆔 识别为身份证号')
    return { idCard: trimmed }
  }
  
  // 手机号：11位数字，1开头
  if (/^1\d{10}$/.test(trimmed)) {
    console.log('📱 识别为手机号')
    return { phone: trimmed }
  }
  
  // 其他情况当作姓名
  console.log('👤 识别为姓名')
  return { name: trimmed }
}

const handleSearch = async (resetPage = false) => {
  if (resetPage) {
    pagination.value.page = 1
  }
  
  console.log('🔍 开始搜索患者，关键字:', keyword.value, '分页:', pagination.value)
  loading.value = true
  try {
    // 智能识别搜索类型
    const searchParams = {
      ...detectSearchType(keyword.value),
      page: pagination.value.page,
      size: pagination.value.size
    }
    console.log('🎯 搜索参数:', searchParams)
    
    const res = await searchPatients(searchParams)
    console.log('📡 患者搜索响应:', res)
    
    // 解析分页数据
    const data = res?.data || res
    const list = data?.list || data?.items || data || []
    const total = data?.totalCount || data?.total || 0
    
    console.log('📋 解析出的患者列表:', list, '总数:', total)
    
    patients.value = Array.isArray(list) ? list : []
    pagination.value.total = total
    
    console.log('✅ 最终设置的患者数据:', patients.value)
    console.log('📊 分页信息:', pagination.value)
    
    if (patients.value.length === 0) {
      ElMessage.info('未找到匹配的患者')
    } else {
      ElMessage.success(`找到 ${patients.value.length} 位患者，共 ${total} 条记录`)
    }
  } catch (e) {
    console.error('❌ 搜索患者失败:', e)
    ElMessage.error(`搜索失败: ${e.message || '网络错误'}`)
  } finally {
    loading.value = false
  }
}

const toggleCreate = () => {
  creating.value = !creating.value
}

// 分页事件处理
const handlePageChange = (page) => {
  console.log('📄 切换到第', page, '页')
  pagination.value.page = page
  handleSearch()
}

const handleSizeChange = (size) => {
  console.log('📏 每页显示', size, '条')
  pagination.value.size = size
  pagination.value.page = 1 // 改变每页条数时重置到第一页
  handleSearch()
}

const submitCreate = () => {
  formRef.value.validate(async (ok) => {
    if (!ok) return
    submitting.value = true
    try {
      // 将性别从 M/F 映射为 男/女 以适配后端
      const payload = {
        ...form.value,
        gender: form.value.gender === 'M' ? '男' : form.value.gender === 'F' ? '女' : form.value.gender
      }
      const res = await createPatient(payload)
      const created = res?.data || res // 兼容不同包装
      if (!created) throw new Error('创建失败')
      ElMessage.success('创建成功')
      emit('select', created)
      emit('update:modelValue', false)
    } catch (e) {
      ElMessage.error('创建失败')
    } finally {
      submitting.value = false
    }
  })
}

const selectPatient = (row) => {
  emit('select', row)
  emit('update:modelValue', false)
}

// 测试连接功能
const testConnection = async () => {
  console.log('🔧 测试后端连接...')
  ElMessage.info('正在测试后端连接...')
  try {
    const res = await searchPatients({ page: 1, size: 1 })
    console.log('✅ 连接测试成功:', res)
    ElMessage.success('后端连接正常')
  } catch (e) {
    console.error('❌ 连接测试失败:', e)
    ElMessage.error(`连接失败: ${e.message || '无法连接到后端'}`)
  }
}

// 监听弹窗打开，自动加载数据
watch(() => props.modelValue, (isOpen, wasOpen) => {
  console.log('👁️ PatientSearchDialog modelValue 变化:', { wasOpen, isOpen })
  if (isOpen && patients.value.length === 0) {
    console.log('🚀 弹窗打开，自动加载患者列表')
    handleSearch()
  }
}, { immediate: true })

// 根据中国身份证号自动解析出生日期与性别（仅在格式符合时）
watch(() => form.value.idCard, (val) => {
  if (!val) return
  const id = String(val).toUpperCase()
  const is18 = /^\d{17}[\dX]$/.test(id)
  const is15 = /^\d{15}$/.test(id)
  try {
    if (is18) {
      const y = id.substring(6, 10)
      const m = id.substring(10, 12)
      const d = id.substring(12, 14)
      // 设置出生日期（YYYY-MM-DD）
      form.value.birthDate = `${y}-${m}-${d}`
      // 第17位（索引16）奇数男，偶数女
      const genderCode = parseInt(id.substring(16, 17), 10)
      form.value.gender = genderCode % 2 === 1 ? 'M' : 'F'
    } else if (is15) {
      const y = `19${id.substring(6, 8)}`
      const m = id.substring(8, 10)
      const d = id.substring(10, 12)
      form.value.birthDate = `${y}-${m}-${d}`
      const genderCode = parseInt(id.substring(14, 15), 10)
      form.value.gender = genderCode % 2 === 1 ? 'M' : 'F'
    }
  } catch (e) {
    // 忽略解析错误
  }
})
</script>

<style scoped>
.search-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.empty { color: #999; text-align: center; padding: 16px 0; }
.create-form { padding-top: 8px; }
</style>
