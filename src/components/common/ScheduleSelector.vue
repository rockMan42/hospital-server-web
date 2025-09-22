<template>
  <div class="schedule-selector">
    <div class="filters">
      <el-form :inline="true" label-width="72px">
        <el-form-item label="科室">
          <el-select v-model="departmentId" placeholder="选择科室" filterable clearable style="width: 200px" @change="onDepartmentChange">
            <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
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
import { listDepartments } from '@/api/departments'
import { listDoctors } from '@/api/doctors'
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
const doctorId = ref()
const date = ref('')
const session = ref()

const selected = ref(props.modelValue)
watch(() => props.modelValue, v => selected.value = v)

const onDepartmentChange = async () => {
  doctorId.value = undefined
  await loadDoctors()
  await loadSchedules()
}

const loadDepartments = async () => {
  try {
    const res = await listDepartments()
    departments.value = res.data?.items || res.data || []
  } catch (e) {
    ElMessage.error('加载科室失败')
  }
}

const loadDoctors = async () => {
  try {
    const res = await listDoctors({ departmentId: departmentId.value })
    doctors.value = res.data?.items || res.data || []
  } catch (e) {
    ElMessage.error('加载医生失败')
  }
}

const loadSchedules = async () => {
  loading.value = true
  try {
    const res = await listSchedules({
      departmentId: departmentId.value,
      doctorId: doctorId.value,
      date: date.value || undefined,
      session: session.value
    })
    schedules.value = res.data?.items || res.data || []
  } catch (e) {
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
  await loadDepartments()
})
</script>

<style scoped>
.schedule-selector { background: #fff; padding: 12px; border-radius: 8px; }
.filters { margin-bottom: 10px; }
.selected { margin-top: 8px; color: #409eff; }
.schedule-table :deep(.el-button.is-link) { padding: 0; }
</style>
