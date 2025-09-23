<template>
  <div class="schedule-selector">
    <div class="filters">
      <el-form :inline="true" label-width="72px">
        <el-form-item label="科室">
          <el-cascader
            v-model="cascaderValue"
            :options="departmentOptions"
            :props="cascaderProps"
            placeholder="选择科室/诊室"
            filterable
            clearable
            style="width: 280px"
            @change="onCascaderChange"
          />
        </el-form-item>
        <el-form-item label="医生">
          <el-select v-model="doctorId" placeholder="选择医生" filterable clearable style="width: 200px" @change="loadSchedules">
            <el-option v-for="doc in doctors" :key="doc.id" :label="doc.name" :value="doc.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="date" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 180px" @change="loadSchedules" />
        </el-form-item>
        <el-form-item label="时段">
          <el-select v-model="session" placeholder="选择时段" clearable style="width: 160px" @change="loadSchedules">
            <el-option label="上午" value="MORNING" />
            <el-option label="下午" value="AFTERNOON" />
            <el-option label="晚上" value="EVENING" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="loadSchedules">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="schedules" height="320" v-loading="loading" @row-click="selectSchedule" class="schedule-table">
      <el-table-column label="日期" width="120">
        <template #default="{ row }">{{ row.date }}</template>
      </el-table-column>
      <el-table-column label="时段" width="100">
        <template #default="{ row }">{{ sessionLabel(row.session) }}</template>
      </el-table-column>
      <el-table-column prop="doctor.name" label="医生" width="140" />
      <el-table-column prop="clinicRoom.name" label="诊室" width="140" />
      <el-table-column label="剩余号源">
        <template #default="{ row }">
          <el-tag type="success" effect="plain">普通 {{ (row.generalQuota ?? 0) - (row.usedGeneral ?? 0) }}</el-tag>
          <el-tag type="warning" effect="plain" style="margin-left: 6px">专家 {{ (row.expertQuota ?? 0) - (row.usedExpert ?? 0) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" link @click.stop="selectSchedule(row)">选择</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="selected && selected.id" class="selected">
      已选择：{{ selected.date }} {{ sessionLabel(selected.session) }} · {{ selected.doctor?.name }} · {{ selected.clinicRoom?.name }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDepartmentList, getClinicRoomList } from '@/api/departments'
import { getDoctorList } from '@/api/doctors'
import { listSchedules } from '@/api/schedules'

const props = defineProps({
  modelValue: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'change'])

const departments = ref([])
const doctors = ref([])
const schedules = ref([])
const loading = ref(false)

const departmentId = ref()
const clinicRoomId = ref()
const doctorId = ref()
const date = ref('')
const session = ref()
const cascaderValue = ref([])

const selected = ref(props.modelValue)
watch(() => props.modelValue, v => selected.value = v)

// 懒加载诊室数据
const loadClinicRooms = async (node, resolve) => {
  const { value, data } = node
  const departmentId = value || data?.id
  console.log('🏥 懒加载诊室，科室ID:', departmentId, '节点信息:', node)
  
  if (!departmentId) {
    console.error('❌ 科室ID为空，无法加载诊室')
    resolve([])
    return
  }
  
  try {
    const res = await getClinicRoomList(departmentId)
    console.log('✅ 诊室API响应:', res)
    
    const clinicRooms = res.data || []
    const nodes = clinicRooms.map(room => ({
      id: room.clinicRoomId,
      name: room.name,
      leaf: true // 诊室是叶子节点
    }))
    
    console.log('🏥 诊室节点:', nodes)
    resolve(nodes)
  } catch (e) {
    console.error('❌ 加载诊室失败:', e)
    ElMessage.error('加载诊室失败')
    resolve([])
  }
}

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'clinicRooms',
  lazy: true,
  lazyLoad: loadClinicRooms
}

// 构建科室-诊室级联数据
const departmentOptions = ref([])

// 级联选择器变化处理
const onCascaderChange = (value) => {
  console.log('🏥 级联选择器变化:', value)
  
  if (Array.isArray(value) && value.length > 0) {
    departmentId.value = value[0] // 科室ID
    clinicRoomId.value = value[1] || null // 诊室ID（可选）
  } else {
    departmentId.value = null
    clinicRoomId.value = null
  }
  
  onDepartmentChange()
}

const onDepartmentChange = async () => {
  doctorId.value = undefined
  await loadDoctors()
  await loadSchedules()
}

const loadDepartments = async () => {
  try {
    console.log('🔍 开始加载科室列表...')
    const res = await getDepartmentList()
    console.log('✅ 科室API响应:', res)
    
    // 处理不同的响应格式
    const deptList = res?.data || res || []
    
    // 构建级联数据结构
    departmentOptions.value = deptList.map(dept => ({
      id: dept.departmentId,
      name: dept.name,
      leaf: false // 科室不是叶子节点，有子级诊室
    }))
    
    console.log('🏥 科室级联数据:', departmentOptions.value)
    
    if (departmentOptions.value.length === 0) {
      ElMessage.info('暂无科室数据')
    } else {
      console.log(`📋 成功加载 ${departmentOptions.value.length} 个科室`)
    }
  } catch (e) {
    console.error('❌ 加载科室失败:', e)
    if (e.code === 'ERR_NETWORK' || e.message.includes('ERR_CONNECTION_REFUSED')) {
      ElMessage.error('无法连接到后端服务器，请确认服务器是否启动在 http://localhost:8081')
    } else {
      ElMessage.error(`加载科室失败: ${e.message || '网络错误'}`)
    }
  }
}

const loadDoctors = async () => {
  try {
    // 只有选择了科室和诊室才加载医生
    if (!departmentId.value || !clinicRoomId.value) {
      doctors.value = []
      return
    }
    
    console.log('🔍 开始加载医生列表...', {
      departmentId: departmentId.value,
      clinicRoomId: clinicRoomId.value
    })
    
    const res = await getDoctorList({
      departmentId: departmentId.value,
      clinicRoomId: clinicRoomId.value
    })
    
    console.log('✅ 医生API响应:', res)
    
    const doctorList = res.data || []
    doctors.value = doctorList.map(doc => ({
      id: doc.doctorId,
      name: doc.name
    }))
    
    console.log('👨‍⚕️ 医生列表:', doctors.value)
    
    if (doctors.value.length === 0) {
      ElMessage.info('该诊室暂无医生')
    } else {
      console.log(`👨‍⚕️ 成功加载 ${doctors.value.length} 个医生`)
    }
  } catch (e) {
    console.error('❌ 加载医生失败:', e)
    ElMessage.error('加载医生失败')
    doctors.value = []
  }
}

const loadSchedules = async () => {
  loading.value = true
  try {
    const params = {
      departmentId: departmentId.value,
      doctorId: doctorId.value,
      date: date.value || undefined,
      session: session.value
    }
    
    // 如果选择了具体诊室，添加诊室筛选条件
    if (clinicRoomId.value) {
      params.clinicRoomId = clinicRoomId.value
    }
    
    console.log('🔍 查询排班参数:', params)
    const res = await listSchedules(params)
    schedules.value = res.data?.items || res.data || []
    
    console.log('📅 排班查询结果:', schedules.value)
  } catch (e) {
    console.error('❌ 加载排班失败:', e)
    ElMessage.error('加载排班失败')
  } finally {
    loading.value = false
  }
}



const sessionLabel = (s) => ({ MORNING: '上午', AFTERNOON: '下午', EVENING: '晚上' }[s] || s)

const selectSchedule = (row) => {
  selected.value = row
  emit('update:modelValue', row)
  emit('change', row?.id)
}

onMounted(async () => {
  console.log('🚀 ScheduleSelector 组件已挂载，开始初始化...')
  await loadDepartments()
})
</script>

<style scoped>
.schedule-selector { background: #fff; padding: 12px; border-radius: 8px; }
.filters { margin-bottom: 10px; }
.selected { margin-top: 8px; color: #409eff; }
.schedule-table :deep(.el-button.is-link) { padding: 0; }
</style>
