<template>
  <div class="registration-home">
    <!-- 顶部导航栏 -->
    <AdminHeader title="医院管理系统" :notification-count="0" />

    <!-- 主体布局 -->
    <div class="main-layout">
      <!-- 左侧菜单 - 使用SideLeft组件 -->
      <SideLeft :activeMenu="'registration'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>窗口挂号</h1>
          <p>为到院患者创建挂号单并进入候诊队列</p>
        </div>

        <div class="grid">
          <!-- 左：选择排班 -->
          <section class="panel">
            <h2 class="panel-title">选择排班</h2>
            <ScheduleSelector v-model="selectedSchedule" @change="onScheduleChange" />
          </section>

          <!-- 右：患者与号源 -->
          <section class="panel">
            <h2 class="panel-title">患者与号源</h2>

            <el-form label-width="88px" :model="form">
              <el-form-item label="患者">
                <div class="patient-box">
                  <div v-if="patient" class="patient-info">
                    <div class="name">{{ patient.name }}</div>
                    <div class="meta">{{ genderLabel(patient.gender) }} · {{ patient.phone || '-' }}</div>
                  </div>
                  <el-button type="primary" @click="openPatientDialog">{{ patient ? '更换患者' : '选择患者' }}</el-button>
                </div>
              </el-form-item>

              <el-form-item label="号源类型">
                <el-radio-group v-model="form.type">
                  <el-radio label="GENERAL">普通号</el-radio>
                  <el-radio label="EXPERT">专家号</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :disabled="!canSubmit" :loading="submitting" @click="submit">
                  确认挂号
                </el-button>
                <el-button @click="reset">重置</el-button>
              </el-form-item>
            </el-form>

            <el-alert
              v-if="!selectedSchedule"
              title="请先在左侧选择一个排班"
              type="info"
              show-icon
            />
          </section>
        </div>
      </main>
    </div>

    <!-- 选择患者弹窗 -->
    <PatientSearchDialog v-model="showPatientDialog" @select="onSelectPatient" />

    <!-- 成功结果弹窗 -->
    <el-dialog v-model="showSuccess" title="挂号成功" width="520px">
      <el-descriptions :column="1" size="large" border>
        <el-descriptions-item label="票号">{{ result.ticketNo }}</el-descriptions-item>
        <el-descriptions-item label="队列号">{{ result.queueNo }}</el-descriptions-item>
        <el-descriptions-item label="科室">{{ selectedSchedule?.department?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="医生">{{ selectedSchedule?.doctor?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="诊室">{{ selectedSchedule?.clinicRoom?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="日期/时段">
          {{ selectedSchedule?.date }} / {{ sessionLabel(selectedSchedule?.session) }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="showSuccess = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import SideLeft from '@/components/manager/SideLeft.vue'
import AdminHeader from '@/components/manager/AdminHeader.vue'
import ScheduleSelector from '@/components/common/ScheduleSelector.vue'
import PatientSearchDialog from '@/components/common/PatientSearchDialog.vue'
import { createAppointment } from '@/api/appointments'

const selectedSchedule = ref(null)
const patient = ref(null)
const showPatientDialog = ref(false)

const form = ref({
  type: 'GENERAL'
})

const submitting = ref(false)
const showSuccess = ref(false)
const result = ref({ ticketNo: '', queueNo: '' })

const canSubmit = computed(() => !!(selectedSchedule.value && patient.value && form.value.type))

const onScheduleChange = () => {
  // 当选择的排班变化时，必要时可以重置号源类型
}

const openPatientDialog = () => {
  console.log('🔘 点击选择患者按钮')
  showPatientDialog.value = true
  console.log('🔘 showPatientDialog 设置为:', showPatientDialog.value)
}

const onSelectPatient = (p) => {
  console.log('✅ 选择了患者:', p)
  patient.value = p
}

const genderLabel = (g) => g || '-'
const sessionLabel = (s) => ({ MORNING: '上午', AFTERNOON: '下午', EVENING: '晚上' }[s] || s)

const submit = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('请先选择排班、患者和号源类型')
    return
  }
  submitting.value = true
  try {
    const payload = {
      patientId: patient.value.id,
      scheduleId: selectedSchedule.value.id,
      type: form.value.type
    }
    const res = await createAppointment(payload)
    const data = res.data || res // 兼容不同包装
    if (!data) throw new Error('挂号失败')

    // 兼容 {data:{ticketNo,queueNo}} 或 {ticketNo,queueNo}
    const tNo = data.ticketNo ?? data?.data?.ticketNo
    const qNo = data.queueNo ?? data?.data?.queueNo
    result.value = { ticketNo: tNo, queueNo: qNo }
    showSuccess.value = true
    ElMessage.success('挂号成功')
  } catch (e) {
    ElMessage.error(e?.message || '挂号失败')
  } finally {
    submitting.value = false
  }
}

const reset = () => {
  patient.value = null
  form.value.type = 'GENERAL'
}
</script>

<style scoped lang="scss">
// 颜色变量（与管理端风格保持一致）
$primary: #409eff;
$border: #ebeef5;

.registration-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 50%, #d1edff 100%);
}

.main-layout {
  display: flex;
  min-height: calc(100vh - 72px);
  padding-top: 72px; // 为AdminHeader留出空间
}

.content {
  flex: 1;
  margin-left: 260px; // 为SideLeft组件留出空间
  padding: 24px;
}

.page-header {
  margin-bottom: 16px;
  h1 { font-size: 22px; margin: 0 0 6px 0; }
  p { color: #666; margin: 0; }
}

.grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
}

.panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 16px;
}

.panel-title {
  font-size: 16px;
  margin: 0 0 10px 0;
}

.patient-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.patient-info {
  flex: 1;
  .name { font-size: 16px; font-weight: 600; }
  .meta { color: #888; font-size: 13px; }
}
</style>
