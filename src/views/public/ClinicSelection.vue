<template>
  <div class="clinic-selection">
    <div class="page-header">
      <h2>选择诊室</h2>
      <div class="step-indicator">步骤 2/4</div>
    </div>

    <div class="summary-bar">
      <span>已选科室：</span>
      <strong class="summary-value">{{ currentDepartmentName }}</strong>
    </div>

    <div class="search-box">
      <el-input
        v-model="searchKeyword"
        placeholder="按诊室名称/编号搜索"
        prefix-icon="Search"
        clearable
        @input="handleSearch"
        size="large"
      />
    </div>

    <div class="clinic-buttons">
      <div class="button-row" v-for="(row, rowIndex) in buttonRows" :key="rowIndex">
        <el-button
          v-for="clinic in row"
          :key="clinic.id"
          class="clinic-button"
          @click="selectClinic(clinic)"
        >
          <div class="button-content">
            <el-icon class="button-icon"><OfficeBuilding /></el-icon>
            <div class="button-text">
              <div class="clinic-name">{{ clinic.name }}</div>
              <div class="clinic-status">
                <span class="code">编号: {{ clinic.code }}</span>
                <span class="waiting">等候: {{ clinic.waitingCount }}</span>
              </div>
            </div>
          </div>
        </el-button>
      </div>
    </div>

    <div class="pagination-controls">
      <el-button 
        class="page-button"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        上一页
      </el-button>
      <div class="page-indicator">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </div>
      <el-button 
        class="page-button"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        下一页
      </el-button>
    </div>

    <div class="action-buttons">
      <el-button class="back-button" @click="goBack">
        返回科室选择
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { OfficeBuilding, Search } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(8) // 每页显示8个诊室（2行×4个）

const departmentId = computed(() => parseInt(route.query.departmentId))

// 模拟每个科室下的诊室数据
const allClinics = ref([
  { id: 101, departmentId: 1, code: 'NK-01', name: '内科诊室1', waitingCount: 6 },
  { id: 102, departmentId: 1, code: 'NK-02', name: '内科诊室2', waitingCount: 3 },
  { id: 103, departmentId: 1, code: 'NK-03', name: '内科诊室3', waitingCount: 10 },
  { id: 104, departmentId: 1, code: 'NK-04', name: '内科诊室4', waitingCount: 1 },
  { id: 201, departmentId: 2, code: 'WK-01', name: '外科诊室1', waitingCount: 2 },
  { id: 202, departmentId: 2, code: 'WK-02', name: '外科诊室2', waitingCount: 5 },
  { id: 301, departmentId: 3, code: 'FK-01', name: '妇产科诊室1', waitingCount: 4 },
  { id: 302, departmentId: 3, code: 'FK-02', name: '妇产科诊室2', waitingCount: 7 },
  { id: 401, departmentId: 4, code: 'EK-01', name: '儿科诊室1', waitingCount: 9 },
  { id: 402, departmentId: 4, code: 'EK-02', name: '儿科诊室2', waitingCount: 2 },
  { id: 501, departmentId: 5, code: 'YK-01', name: '眼科诊室1', waitingCount: 3 },
  { id: 601, departmentId: 6, code: 'EBH-01', name: '耳鼻喉诊室1', waitingCount: 1 },
  { id: 701, departmentId: 7, code: 'KQ-01', name: '口腔诊室1', waitingCount: 4 },
  { id: 801, departmentId: 8, code: 'PF-01', name: '皮肤诊室1', waitingCount: 2 },
])

// 当前科室的诊室
const clinics = computed(() => allClinics.value.filter(c => c.departmentId === departmentId.value))

// 过滤
const filteredClinics = computed(() => {
  if (!searchKeyword.value) return clinics.value
  return clinics.value.filter(c => c.name.includes(searchKeyword.value) || c.code.includes(searchKeyword.value))
})

// 分页
const totalPages = computed(() => Math.max(1, Math.ceil(filteredClinics.value.length / pageSize.value)))
const pagedClinics = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredClinics.value.slice(start, end)
})

const buttonRows = computed(() => {
  const rows = []
  const items = [...pagedClinics.value]
  while (items.length > 0) rows.push(items.splice(0, 4))
  return rows
})

// 已选科室名（用于顶部摘要）
const departmentNames = {
  1: '内科', 2: '外科', 3: '妇产科', 4: '儿科', 5: '眼科', 6: '耳鼻喉科', 7: '口腔科', 8: '皮肤科'
}
const currentDepartmentName = computed(() => departmentNames[departmentId.value] || '未知科室')

const selectClinic = (clinic) => {
  router.push({
    path: '/self-service/doctor-selection',
    query: { departmentId: String(departmentId.value), clinicId: String(clinic.id) }
  })
}

const handleSearch = () => { currentPage.value = 1 }

const goBack = () => { router.push('/self-service/department-selection') }

onMounted(() => {
  if (!route.query.departmentId) {
    ElMessage.error('请先选择科室')
    router.push('/self-service/department-selection')
  }
})
</script>

<style lang="scss" scoped>
// 颜色变量
$primary: #1a75bc;
$success: #67c23a;
$warning: #e6a23c;
$danger: #f56c6c;
$text: #303133;
$text-light: #606266;
$border: #ebeef5;
$bg-light: #f8f9fc;

.clinic-selection {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
  h2 { font-size: 32px; font-weight: 700; color: $text; margin: 0 0 10px; }
  .step-indicator { font-size: 16px; color: $text-light; background: white; padding: 8px 20px; border-radius: 20px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
}

.summary-bar {
  max-width: 900px;
  margin: 0 auto 16px;
  background: white;
  border: 1px solid $border;
  border-left: 4px solid $primary;
  border-radius: 12px;
  padding: 12px 16px;
  color: $text-light;
  .summary-value { color: $text; }
}

.search-box {
  max-width: 600px;
  margin: 0 auto 24px;
  :deep(.el-input) {
    .el-input__wrapper { border-radius: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 2px solid transparent; transition: all .3s ease; &:hover { box-shadow: 0 6px 20px rgba(26,117,188,0.15);} &.is-focus { border-color: $primary; box-shadow: 0 6px 20px rgba(26,117,188,0.25);} }
    .el-input__inner { font-size: 16px; padding: 0 20px; }
  }
}

.clinic-buttons { max-width: 1200px; margin: 0 auto; }
.button-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; &:last-child { margin-bottom: 0; } }

.clinic-button {
  background: white;
  border: 2px solid $border;
  border-radius: 16px;
  padding: 24px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 130px;
  display: flex; flex-direction: column; justify-content: center;
  &:hover { border-color: $primary; box-shadow: 0 8px 25px rgba(26,117,188,0.15); transform: translateY(-2px); }
  .button-content { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .button-icon { font-size: 32px; color: $primary; margin-bottom: 12px; }
  .clinic-name { font-size: 18px; font-weight: 600; color: $text; margin-bottom: 8px; }
  .clinic-status { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; color: $text-light; .code { color: $text-light; } .waiting { color: $warning; } }
}

.pagination-controls { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px; 
  .page-button { background: $primary; color: white; border: none; padding: 12px 24px; border-radius: 25px; font-size: 16px; cursor: pointer; transition: all .3s ease; &:hover:not(:disabled) { background: darken($primary,10%); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(26,117,188,0.3);} &:disabled { background: #c0c4cc; cursor: not-allowed; }}
  .page-indicator { font-size: 16px; color: $text; background: white; padding: 12px 20px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
}

.action-buttons { display: flex; justify-content: center; margin-top: 24px; 
  .back-button { background: white; color: $text; border: 2px solid $border; padding: 12px 24px; border-radius: 25px; font-size: 16px; cursor: pointer; transition: all .2s ease; &:hover { border-color: $primary; color: $primary; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(26,117,188,0.15);} }
}

@media (max-width: 1200px) { .button-row { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
@media (max-width: 768px) { 
  .clinic-selection { padding: 15px; }
  .page-header h2 { font-size: 24px; }
  .button-row { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
@media (max-width: 480px) { .button-row { grid-template-columns: 1fr; } }
</style>
