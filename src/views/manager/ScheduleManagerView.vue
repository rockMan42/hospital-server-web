<template>
  <div class="manager-container">
    <AdminHeader 
      title="医院管理系统"
      :notification-count="2"
      @notification-click="handleNotificationClick"
      @profile-click="handleProfileClick"
      @settings-click="handleSettingsClick"
    />
    <SideLeft :activeMenu="'schedule'" />
    <div class="content-area">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="16">
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalCount }}</div>
              <div class="stat-label">总排班数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon active">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.activeCount }}</div>
              <div class="stat-label">启用排班</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon doctor">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.doctorCount }}</div>
              <div class="stat-label">医生排班</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon nurse">
              <el-icon><Female /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.nurseCount }}</div>
              <div class="stat-label">护士排班</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon pharmacist">
              <el-icon><Medicine /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.pharmacistCount }}</div>
              <div class="stat-label">药剂师排班</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-icon staff">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.staffCount }}</div>
              <div class="stat-label">其他人员</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选卡片 -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <div class="filter-label">科室/部门</div>
          <el-select
            v-model="filters.department_id"
            placeholder="请选择科室/部门"
            clearable
            filterable
            :filter-method="filterDepartmentOptions"
            @change="handleDepartmentChange"
          >
            <el-option
              v-for="dept in filteredDepartmentOptions"
              :key="dept.value"
              :label="dept.label"
              :value="dept.value"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">诊室</div>
          <el-select
            v-model="filters.clinic_room_id"
            placeholder="请选择诊室"
            clearable
            filterable
            :disabled="!filters.department_id"
            @change="handleClinicRoomChange"
          >
            <el-option
              v-for="room in clinicRoomOptions"
              :key="room.value"
              :label="room.label"
              :value="room.value"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">人员类型</div>
          <el-select
            v-model="filters.staff_type"
            placeholder="请选择类型"
            clearable
            @change="handleFilterStaffTypeChange"
          >
            <el-option
              v-for="type in staffTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">人员</div>
          <el-select
            v-model="filters.staff_id"
            placeholder="请选择人员"
            clearable
            filterable
            :filter-method="filterStaffOptions"
          >
            <el-option
              v-for="staff in filteredStaffOptions"
              :key="staff.value"
              :label="staff.label"
              :value="staff.value"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">排班类型</div>
          <el-select
            v-model="filters.schedule_type"
            placeholder="请选择类型"
            clearable
          >
            <el-option label="门诊" value="outpatient" />
            <el-option label="病房" value="inpatient" />
            <el-option label="药房" value="pharmacy" />
            <el-option label="收费窗口" value="billing" />
            <el-option label="挂号窗口" value="registration" />
            <el-option label="行政办公" value="office" />
            <el-option label="后勤服务" value="service" />
            <el-option label="急诊" value="emergency" />
            <el-option label="手术" value="surgery" />
          </el-select>
        </div>
        <div class="filter-item">
          <div class="filter-label">状态</div>
          <el-select
            v-model="filters.is_active"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </div>
      </div>
      <div class="action-buttons">
        <el-button @click="resetFilters">重置</el-button>
        <el-button type="primary" @click="searchSchedules">查询</el-button>
        <el-button type="success" @click="showAddScheduleDialog">
          <el-icon><Plus /></el-icon>
          新增排班模板
        </el-button>
        <el-button type="warning" @click="generateWeeklySchedule">
          <el-icon><MagicStick /></el-icon>
          生成周排班
        </el-button>
        <el-button type="info" @click="showBatchOperationDialog">
          <el-icon><Operation /></el-icon>
          批量操作
        </el-button>
      </div>
    </div>

    <!-- 排班表格 -->
    <div class="schedule-table">
      <div class="table-header">
        <div class="table-title">排班模板列表</div>
        <div class="table-tools">
          <el-button type="primary" @click="exportSchedule">
            <el-icon><Document /></el-icon>
            导出排班表
          </el-button>
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
      <!--表格数据-->
      <el-table
        :data="schedules"
        style="width: 100%"
        v-loading="loading"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="人员信息" min-width="200">
          <template #default="{ row }">
            <div class="staff-info">
              <div class="staff-avatar">
                <el-avatar :size="40" :src="row.avatar">
                  <span class="avatar-text">{{
                    getStaffTypeIcon(row.staff_type)
                  }}</span>
                </el-avatar>
              </div>
              <div>
                <div class="staff-name">{{ row.staff_name }}</div>
                <div class="staff-details">
                  {{ formatStaffType(row.staff_type) }} ·
                  {{ row.department_name }}
                  <el-tag
                    v-if="row.professional_title"
                    size="small"
                    effect="plain"
                  >
                    {{ row.professional_title }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="星期安排" width="140">
          <template #default="{ row }">
            <div class="week-days">
              <el-tag
                v-for="day in row.week_days"
                :key="day"
                size="small"
                :type="getWeekDayType(day)"
                class="week-day-tag"
              >
                {{ formatWeekDay(day) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="班次时间" width="120">
          <template #default="{ row }">
            <div class="time-slot-info">
              <el-tag :type="getShiftType(row.time_slot)" size="small">
                {{ formatTimeSlot(row.time_slot) }}
              </el-tag>
              <div class="time-range">{{ formatTimeRange(row.time_slot) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排班类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getScheduleTypeTag(row.schedule_type)" size="small">
              {{ formatScheduleType(row.schedule_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="业务信息"
          width="180"
          v-if="showBusinessColumns"
        >
          <template #default="{ row }">
            <div
              v-if="requiresBusinessInfo(row.schedule_type)"
              class="business-info"
            >
              <template v-if="row.schedule_type === 'outpatient'">
                <div>费用: ¥{{ formatAmount(row.fee_amount) }}</div>
                <div>号源: {{ row.max_patients }}个</div>
              </template>
              <template v-else-if="row.schedule_type === 'pharmacy'">
                <div>药房: {{ row.pharmacy_location || "主药房" }}</div>
                <div>服务类型: {{ row.service_type || "药品发放" }}</div>
              </template>
              <template
                v-else-if="
                  ['billing', 'registration'].includes(row.schedule_type)
                "
              >
                <div>窗口: {{ row.window_number || "1号窗口" }}</div>
                <div>服务范围: {{ row.service_scope || "全科" }}</div>
              </template>
              <template v-else>
                <span class="no-info">-</span>
              </template>
            </div>
            <span v-else class="no-info">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="工作地点" width="150" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_active"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons-cell">
              <el-button size="small" @click="editSchedule(row)"
                >编辑</el-button
              >
              <el-button
                size="small"
                type="primary"
                @click="viewScheduleDetails(row)"
              >
                详情
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteSchedule(row)"
                :disabled="row.is_active === 1"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current_page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑排班对话框 -->
    <el-dialog
      v-model="scheduleDialog.visible"
      :title="scheduleDialog.is_edit ? '编辑排班模板' : '新增排班模板'"
      width="750px"
      :destroy-on-close="false"
    >
      <el-form
        :model="scheduleForm"
        label-width="100px"
        :rules="scheduleRules"
        ref="scheduleFormRef"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="人员类型" prop="staff_type">
              <el-select
                v-model="scheduleForm.staff_type"
                placeholder="请选择人员类型"
                @change="handleDialogStaffTypeChange"
              >
                <!-- 使用后端加载的人员类型选项 -->
                <el-option
                  v-for="type in staffTypeOptions"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择人员" prop="staff_id">
              <el-select
                v-model="scheduleForm.staff_id"
                placeholder="请选择人员"
                style="width: 100%"
                filterable
                :filter-method="filterDialogStaffOptions"
              >
                <el-option
                  v-for="staff in filteredDialogStaffOptions"
                  :key="staff.value"
                  :label="staff.label"
                  :value="staff.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 新增科室和诊室选择行 -->
        <el-row :gutter="20" class="mt-10">
          <el-col :span="12">
            <el-form-item label="科室/部门" prop="department_id">
              <el-select
                v-model="scheduleForm.department_id"
                placeholder="请选择科室/部门"
                clearable
                filterable
                :filter-method="filterDepartmentOptions"
                @change="handleDialogDepartmentChange"
              >
                <el-option
                  v-for="dept in departmentOptions"
                  :key="dept.value"
                  :label="dept.label"
                  :value="dept.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="诊室" prop="clinic_room_id">
              <el-select
                v-model="scheduleForm.clinic_room_id"
                placeholder="请选择诊室"
                clearable
                filterable
                :disabled="!scheduleForm.department_id"
                @change="handleDialogClinicRoomChange"
              >
                <el-option
                  v-for="room in clinicRoomOptions"
                  :key="room.value"
                  :label="room.label"
                  :value="room.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="星期安排" prop="week_days">
              <el-select
                v-model="scheduleForm.week_days"
                multiple
                placeholder="选择星期"
                style="width: 100%"
              >
                <el-option label="周一" value="1" />
                <el-option label="周二" value="2" />
                <el-option label="周三" value="3" />
                <el-option label="周四" value="4" />
                <el-option label="周五" value="5" />
                <el-option label="周六" value="6" />
                <el-option label="周日" value="7" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班次时间" prop="time_slot">
              <el-select
                v-model="scheduleForm.time_slot"
                placeholder="选择班次"
                style="width: 100%"
              >
                <!-- 使用后端加载的班次选项 -->
                <el-option
                  v-for="slot in TimeSlotOptions"
                  :key="slot.value"
                  :label="slot.label"
                  :value="slot.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排班类型" prop="schedule_type">
              <el-select
                v-model="scheduleForm.schedule_type"
                @change="handleScheduleTypeChange"
                style="width: 100%"
              >
                <el-option label="门诊" value="outpatient" />
                <el-option label="病房" value="inpatient" />
                <el-option label="药房" value="pharmacy" />
                <el-option label="收费窗口" value="billing" />
                <el-option label="挂号窗口" value="registration" />
                <el-option label="行政办公" value="office" />
                <el-option label="后勤服务" value="service" />
                <el-option label="急诊" value="emergency" />
                <el-option label="手术" value="surgery" />
                <el-option label="其他" value="others" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作地点" prop="location">
              <el-input
                v-model="scheduleForm.location"
                placeholder="请输入工作地点"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 动态业务信息字段 -->
        <div v-if="requiresBusinessInfo(scheduleForm.schedule_type)">
          <el-divider>业务信息</el-divider>
          <el-row :gutter="20">
            <template v-if="scheduleForm.schedule_type === 'outpatient'">
              <el-col :span="12">
                <el-form-item label="费用项目" prop="fee_item_id">
                  <el-select
                    v-model="scheduleForm.fee_item_id"
                    placeholder="选择费用项目"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="fee in feeOptions"
                      :key="fee.value"
                      :label="`${fee.label} (¥${formatAmount(fee.amount)})`"
                      :value="fee.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最大挂号数" prop="max_patients">
                  <el-input-number
                    v-model="scheduleForm.max_patients"
                    :min="1"
                    :max="100"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </template>

            <template v-else-if="scheduleForm.schedule_type === 'pharmacy'">
              <el-col :span="12">
                <el-form-item label="药房位置" prop="pharmacy_location">
                  <el-select
                    v-model="scheduleForm.pharmacy_location"
                    placeholder="选择药房"
                    style="width: 100%"
                  >
                    <el-option label="主药房" value="main" />
                    <el-option label="急诊药房" value="emergency" />
                    <el-option label="住院药房" value="inpatient" />
                    <el-option label="中药房" value="chinese" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="服务类型" prop="service_type">
                  <el-select
                    v-model="scheduleForm.service_type"
                    placeholder="选择服务类型"
                    style="width: 100%"
                  >
                    <el-option label="药品发放" value="dispensing" />
                    <el-option label="药品管理" value="management" />
                    <el-option label="处方审核" value="review" />
                    <el-option label="用药指导" value="guidance" />
                  </el-select>
                </el-form-item>
              </el-col>
            </template>

            <template
              v-else-if="
                ['billing', 'registration'].includes(scheduleForm.schedule_type)
              "
            >
              <el-col :span="12">
                <el-form-item label="窗口编号" prop="window_number">
                  <el-input
                    v-model="scheduleForm.window_number"
                    placeholder="如：1号窗口"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="服务范围" prop="service_scope">
                  <el-select
                    v-model="scheduleForm.service_scope"
                    placeholder="选择服务范围"
                    style="width: 100%"
                  >
                    <el-option label="全科" value="all" />
                    <el-option label="专科" value="special" />
                    <el-option label="急诊" value="emergency" />
                    <el-option label="住院" value="inpatient" />
                  </el-select>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="is_active">
              <el-radio-group v-model="scheduleForm.is_active">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="scheduleForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scheduleDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitScheduleForm">确认</el-button>
      </template>
    </el-dialog>

    <!-- 批量操作对话框 -->
    <el-dialog
      v-model="batchDialog.visible"
      title="批量操作"
      width="500px"
      :destroy-on-close="false"
    >
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="batchForm.operation">
            <el-radio label="enable">启用选中</el-radio>
            <el-radio label="disable">停用选中</el-radio>
            <el-radio label="delete">删除选中</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="影响范围">
          <div>共选中 {{ batchForm.selectedCount }} 个排班</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchOperation"
          >确认执行</el-button
        >
      </template>
    </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import AdminHeader from "@/components/manager/AdminHeader.vue";
import SideLeft from "@/components/manager/SideLeft.vue";
// 引入后端接口
import {
  getFeeCateList,
  getDepartmentList,
  getStaffTypeSlimList,
  getScheduleSlimList,
  getDoctorPagerDataBySearch,
} from "@/api/api";
import { getClinicRoomListByDepartmentId } from "@/api/departments";
import { getDoctorList } from "@/api/doctors";
import { getNurseFullPage } from "@/api/nurses";

// 移除不需要的sidebarOpen状态
const router = useRouter();
const store = useStore();
const username = ref(store.state.user?.username || "管理员");

// AdminHeader事件处理
const handleNotificationClick = () => {
  ElMessage.info('通知功能待实现');
};

const handleProfileClick = () => {
  ElMessage.info('个人资料功能待实现');
};

const handleSettingsClick = () => {
  ElMessage.info('设置功能待实现');
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '确认退出', {
    type: 'warning',
  }).then(() => {
    store.dispatch('user/logout');
    router.push('/login');
    ElMessage.success('已退出登录');
  }).catch(() => {});
};

const loading = ref(false);

// 筛选条件
const filters = reactive({
  department_id: "",
  clinic_room_id: "", // 新增诊室筛选
  staff_type: "",
  staff_id: "",
  schedule_type: "",
  is_active: "",
});

// 统计信息
const stats = reactive({
  totalCount: 0,
  activeCount: 0,
  doctorCount: 0,
  nurseCount: 0,
  pharmacistCount: 0,
  staffCount: 0,
});

// 分页信息
const pagination = reactive({
  current_page: 1,
  page_size: 10,
  total: 0,
}); 

// 数据选项
const departmentOptions = ref([]);
const clinicRoomOptions = ref([]); // 诊室选项列表
const staffTypeOptions = ref([]); // 人员类型定义表，改为 {value,label}
const TimeSlotOptions = ref([]); // 班次时间定义表，改为 {value,label}

//data
// 筛选后的选项
const filteredDepartmentOptions = ref([]);
const filteredStaffOptions = ref([]);
const filteredDialogStaffOptions = ref([]);

// 计算属性
const currentStaffOptions = computed(() => {
  return staffOptions.value[scheduleForm.staff_type] || [];
});

const showBusinessColumns = computed(() => {
  return schedules.value.some((schedule) =>
    requiresBusinessInfo(schedule.schedule_type)
  );
});

// 排班数据
const schedules = ref([]);

// 对话框控制
const scheduleDialog = reactive({
  visible: false,
  is_edit: false,
});

// 批量操作对话框
const batchDialog = reactive({
  visible: false,
});

const batchForm = reactive({
  operation: "enable",
  selectedCount: 0,
});

// 排班表单
const scheduleForm = reactive({
  staff_type: "", // 改为空字符串，等待API加载后设置默认值
  staff_id: "",
  week_days: [],
  time_slot: "", // 改为空字符串，等待API加载后设置默认值
  schedule_type: "outpatient",
  location: "",
  // 业务相关字段
  fee_item_id: "",
  max_patients: 30,
  pharmacy_location: "",
  service_type: "",
  window_number: "",
  service_scope: "",
  is_active: 1,
  notes: "",
  department_id: "", // 新增科室字段
  clinic_room_id: "", // 新增诊室字段
});

// 表单验证规则
const scheduleRules = {
  staff_type: [{ required: true, message: "请选择人员类型", trigger: "change" }],
  staff_id: [{ required: true, message: "请选择人员", trigger: "change" }],
  week_days: [{ required: true, message: "请选择星期", trigger: "change" }],
  time_slot: [{ required: true, message: "请选择班次时间", trigger: "change" }],
  schedule_type: [
    { required: true, message: "请选择排班类型", trigger: "change" },
  ],
  location: [{ required: true, message: "请输入工作地点", trigger: "blur" }],
};

const scheduleFormRef = ref(null);

// 详情抽屉
const detailDrawer = reactive({
  visible: false,
});

const currentSchedule = ref(null);

// 方法定义
const resetFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = "";
  });
  // 清空诊室选项
  clinicRoomOptions.value = [];
  loadSchedules();
};

const searchSchedules = () => {
  pagination.current_page = 1;
  loadSchedules();
};

const handleDepartmentChange = async (deptId) => {
  // 清空诊室选择
  filters.clinic_room_id = "";
  
  // 加载对应科室的诊室列表
  if (deptId) {
    await load_clinic_rooms_by_department(deptId);
  } else {
    clinicRoomOptions.value = [];
  }
  
  // 重新加载人员选项（只按科室过滤，诊室已清空）
  loadStaffOptions(deptId, null);
};

// 筛选区域诊室变化处理
const handleClinicRoomChange = (clinicRoomId) => {
  console.log('=== 筛选区域诊室变化 ===');
  console.log('选择的诊室ID:', clinicRoomId);
  
  // 清空人员选择
  filters.staff_id = "";
  
  // 重新加载人员选项（按科室和诊室过滤）
  loadStaffOptions(filters.department_id, clinicRoomId);
  
  console.log('当前筛选条件:', { 
    department_id: filters.department_id, 
    clinic_room_id: clinicRoomId 
  });
};

// 筛选区域人员类型变化处理
const handleFilterStaffTypeChange = (staffType) => {
  console.log('=== 筛选区域人员类型变化 ===');
  console.log('选择的人员类型:', staffType);
  
  // 清空人员选择
  filters.staff_id = "";
  
  // 重新过滤人员选项
  filterStaffOptions("");
  
  console.log('当前人员选项:', filteredStaffOptions.value);
};

// 科室筛选方法
const filterDepartmentOptions = (query) => {
  if (query) {
    const filtered = allDepartmentOptions.value.filter((dept) =>
      dept.label.toLowerCase().includes(query.toLowerCase())
    );
    filteredDepartmentOptions.value = filtered; // 显示所有匹配的科室
  } else {
    filteredDepartmentOptions.value = allDepartmentOptions.value; // 显示所有科室
  }
};

// 人员类型ID到键名的映射
const getStaffTypeKey = (staffTypeId) => {
  // 根据人员类型ID映射到staffOptions的键名
  const typeMapping = {
    1: 'doctor',        // 医生
    2: 'nurse',         // 护士
    3: 'pharmacist',    // 药剂师
    4: 'finance',       // 财务
    5: 'registration',  // 挂号
    6: 'administrative',// 行政
    7: 'logistics',     // 后勤
  };
  return typeMapping[staffTypeId] || 'doctor'; // 默认返回医生
};

// 人员筛选方法（主筛选区域）
const filterStaffOptions = (query) => {
  let staffList = [];

  if (filters.staff_type) {
    const staffTypeKey = getStaffTypeKey(filters.staff_type);
    console.log('筛选人员类型ID:', filters.staff_type, '映射键名:', staffTypeKey);
    staffList = staffOptions.value[staffTypeKey] || [];
  } else {
    staffList = Object.values(staffOptions.value).flat();
  }

  console.log('当前人员列表:', staffList);

  if (query) {
    const filtered = staffList.filter((staff) =>
      staff.label.toLowerCase().includes(query.toLowerCase())
    );
    filteredStaffOptions.value = filtered.slice(0, 10);
  } else {
    filteredStaffOptions.value = staffList.slice(0, 10);
  }
  
  console.log('过滤后的人员选项:', filteredStaffOptions.value);
};

// 对话框内人员筛选方法（增强：按科室 + 人员类型过滤）
const filterDialogStaffOptions = (query) => {
  let staffList = [];
  
  if (scheduleForm.staff_type) {
    const staffTypeKey = getStaffTypeKey(scheduleForm.staff_type);
    console.log('对话框人员类型ID:', scheduleForm.staff_type, '映射键名:', staffTypeKey);
    staffList = staffOptions.value[staffTypeKey] || [];
  } else {
    staffList = Object.values(staffOptions.value).flat();
  }

  let list = staffList;
  if (scheduleForm.department_id) {
    list = list.filter(
      (s) => String(s.department_id) === String(scheduleForm.department_id)
    );
  }

  console.log('对话框当前人员列表:', list);

  if (query) {
    const filtered = list.filter((staff) =>
      staff.label.toLowerCase().includes(query.toLowerCase())
    );
    filteredDialogStaffOptions.value = filtered.slice(0, 50);
  } else {
    filteredDialogStaffOptions.value = list.slice(0, 50);
  }
  
  console.log('对话框过滤后的人员选项:', filteredDialogStaffOptions.value);
};

// 对话框科室变化时，按科室加载人员并重置已选人员
const handleDialogDepartmentChange = async (deptId) => {
  // 清空人员和诊室选择
  scheduleForm.staff_id = "";
  scheduleForm.clinic_room_id = "";
  
  // 加载对应科室的诊室列表
  if (deptId) {
    await load_clinic_rooms_by_department(deptId);
  } else {
    clinicRoomOptions.value = [];
  }
  
  // loadStaffOptions 会根据传入 deptId 只保留该科室人员
  loadStaffOptions(deptId, null);
  // 重新过滤对话框人员
  filterDialogStaffOptions("");
};

// 对话框诊室变化处理
const handleDialogClinicRoomChange = (clinicRoomId) => {
  console.log('=== 对话框诊室变化 ===');
  console.log('选择的诊室ID:', clinicRoomId);
  
  // 清空人员选择
  scheduleForm.staff_id = "";
  
  // 重新加载人员选项（按科室和诊室过滤）
  loadStaffOptions(scheduleForm.department_id, clinicRoomId);
  
  // 重新过滤对话框人员
  filterDialogStaffOptions("");
  
  console.log('当前表单条件:', { 
    department_id: scheduleForm.department_id, 
    clinic_room_id: clinicRoomId 
  });
};

const allDepartmentOptions = ref([]); // 保存完整的科室列表

// 数据加载
//加载科室/部门列表
const load_departments_list = async () => {
  try {
    console.log('=== 开始加载科室列表 ===');
    const response = await getDepartmentList();
    console.log("科室列表API响应:", response);
    
    if (response && response.code === 200 && response.data) {
      departmentOptions.value = response.data.map((dept) => ({
        value: dept.departmentId,  // 注意：使用departmentId而不是department_id
        label: dept.name,          // 注意：使用name而不是department_name
      }));
      allDepartmentOptions.value = [...departmentOptions.value]; // 保存完整列表
      filteredDepartmentOptions.value = allDepartmentOptions.value; // 初始显示所有科室
      
      console.log(`成功加载 ${departmentOptions.value.length} 个科室:`, departmentOptions.value);
      console.log('filteredDepartmentOptions设置为:', filteredDepartmentOptions.value);
    } else {
      console.error("科室列表API响应格式错误:", response);
      ElMessage.error("加载科室列表失败：响应格式错误");
    }
  } catch (error) {
    console.error("加载科室列表失败:", error);
    ElMessage.error("加载科室列表失败，请检查网络连接");
  }
};

// 加载诊室列表（根据科室ID）
const load_clinic_rooms_by_department = async (departmentId) => {
  try {
    console.log('=== 开始加载诊室列表 ===');
    console.log('科室ID:', departmentId);
    
    if (!departmentId) {
      clinicRoomOptions.value = [];
      return;
    }
    
    const response = await getClinicRoomListByDepartmentId(departmentId);
    console.log("诊室列表API响应:", response);
    
    if (response && response.code === 200 && response.data) {
      // 根据API响应结构映射数据：{clinicRoomId, name}
      clinicRoomOptions.value = response.data.map((room) => ({
        value: room.clinicRoomId,
        label: room.name,
      }));
      console.log(`成功加载 ${clinicRoomOptions.value.length} 个诊室:`, clinicRoomOptions.value);
    } else {
      console.error("诊室列表API响应格式错误:", response);
      clinicRoomOptions.value = [];
      ElMessage.error("加载诊室列表失败：响应格式错误");
    }
  } catch (error) {
    console.error("加载诊室列表失败:", error);
    clinicRoomOptions.value = [];
    ElMessage.error("加载诊室列表失败，请检查网络连接");
  }
};

// 加载人员类型定义表（使用新的API接口）
const load_staff_types = async () => {
  try {
    console.log('=== 开始加载人员类型列表 ===');
    const response = await getStaffTypeSlimList();
    console.log("人员类型API响应:", response);
    
    if (response && response.code === 200 && response.data) {
      // 根据API响应结构映射数据：{id, typeName}
      staffTypeOptions.value = response.data.map((item) => {
        return {
          value: item.id,
          label: item.typeName,
        };
      });
      console.log(`成功加载 ${staffTypeOptions.value.length} 个人员类型:`, staffTypeOptions.value);
    } else {
      console.error("人员类型API响应格式错误:", response);
      ElMessage.error("加载人员类型失败：响应格式错误");
    }
  } catch (error) {
    console.error("加载人员类型定义失败:", error);
    ElMessage.error("加载人员类型失败，请检查网络连接");
  }
};

// 加载时间班次定义表（使用新的API接口）
const load_time_slots = async () => {
  try {
    console.log('=== 开始加载班次时间列表 ===');
    const response = await getScheduleSlimList();
    console.log("班次时间API响应:", response);
    
    if (response && response.code === 200 && response.data) {
      // 根据API响应结构映射数据：{id, slotName, startTime, endTime}
      TimeSlotOptions.value = response.data.map((item) => {
        return {
          value: item.id,
          label: `${item.slotName} (${item.startTime}-${item.endTime})`,
          slotName: item.slotName,
          startTime: item.startTime,
          endTime: item.endTime,
        };
      });
      console.log(`成功加载 ${TimeSlotOptions.value.length} 个班次时间:`, TimeSlotOptions.value);
    } else {
      console.error("班次时间API响应格式错误:", response);
      ElMessage.error("加载班次时间失败：响应格式错误");
    }
  } catch (error) {
    console.error("加载时间班次定义失败:", error);
    ElMessage.error("加载班次时间失败，请检查网络连接");
  }
};

// 加载医生列表（初始加载全部人员）- 已废弃，使用loadStaffOptions代替
const load_doctor_list = async () => {
  console.log('load_doctor_list已废弃，使用loadStaffOptions代替');
  // 这个函数已经被loadStaffOptions替代，保留空实现避免报错
};

const staffOptions = ref({
  doctor: [],
  nurse: [],
  pharmacist: [],
  finance: [],
  registration: [],
  administrative: [],
  logistics: [],
});
const feeOptions = ref([]);

// 判断是否需要业务信息
const requiresBusinessInfo = (scheduleType) => {
  return ["outpatient", "pharmacy", "billing", "registration"].includes(
    scheduleType
  );
};

// 获取人员类型图标
const getStaffTypeIcon = (type) => {
  const iconMap = {
    doctor: "👨‍⚕️",
    nurse: "👩‍⚕️",
    pharmacist: "💊",
    finance: "💰",
    registration: "🏥",
    administrative: "📋",
    logistics: "🔧",
  };
  return iconMap[type] || "👤";
};

// 格式化人员类型（使用动态API数据）
const formatStaffType = (typeId) => {
  // 如果传入的是ID，从staffTypeOptions中查找对应的名称
  if (staffTypeOptions.value && staffTypeOptions.value.length > 0) {
    const typeOption = staffTypeOptions.value.find(option => option.value == typeId);
    if (typeOption) {
      return typeOption.label;
    }
  }
  
  // 兼容旧的字符串类型映射（备用）
  const typeMap = {
    doctor: "医生",
    nurse: "护士",
    pharmacist: "药剂师",
    finance: "财务人员",
    registration: "挂号收费员",
    administrative: "行政人员",
    logistics: "后勤人员",
  };
  return typeMap[typeId] || typeId || "未知类型";
};

// 格式化星期
const formatWeekDay = (day) => {
  const dayMap = {
    1: "周一",
    2: "周二", 
    3: "周三",
    4: "周四",
    5: "周五",
    6: "周六",
    7: "周日",
  };
  return dayMap[day] || day;
};

// 格式化时间段（使用动态API数据）
const formatTimeSlot = (slotId) => {
  // 如果传入的是ID，从TimeSlotOptions中查找对应的名称
  if (TimeSlotOptions.value && TimeSlotOptions.value.length > 0) {
    const slotOption = TimeSlotOptions.value.find(option => option.value == slotId);
    if (slotOption) {
      return slotOption.slotName || slotOption.label;
    }
  }
  
  // 兼容旧的字符串类型映射（备用）
  const slotMap = {
    morning: "上午",
    afternoon: "下午",
    night: "夜班",
    full_day: "全天",
    office: "办公时间",
    flexible: "弹性",
    off: "休息",
  };
  return slotMap[slotId] || slotId || "未知班次";
};

// 格式化时间范围（使用动态API数据）
const formatTimeRange = (slotId) => {
  // 如果传入的是ID，从TimeSlotOptions中查找对应的时间范围
  if (TimeSlotOptions.value && TimeSlotOptions.value.length > 0) {
    const slotOption = TimeSlotOptions.value.find(option => option.value == slotId);
    if (slotOption && slotOption.startTime && slotOption.endTime) {
      return `${slotOption.startTime}-${slotOption.endTime}`;
    }
  }
  
  // 兼容旧的字符串类型映射（备用）
  const rangeMap = {
    morning: "07:00-15:00",
    afternoon: "15:00-23:00", 
    night: "23:00-07:00",
    full_day: "08:00-17:00",
    office: "09:00-18:00",
    flexible: "弹性时间",
    off: "休息",
  };
  return rangeMap[slotId] || "";
};

// 格式化排班类型
const formatScheduleType = (type) => {
  const typeMap = {
    outpatient: "门诊",
    inpatient: "病房", 
    pharmacy: "药房",
    billing: "收费",
    registration: "挂号",
    office: "办公",
    service: "服务",
    emergency: "急诊",
    surgery: "手术",
  };
  return typeMap[type] || type;
};

// 获取星期标签类型
const getWeekDayType = (day) => {
  const types = [
    "",
    "success",
    "warning", 
    "danger",
    "info",
    "success",
    "warning",
    "danger",
  ];
  return types[parseInt(day)] || "";
};

// 获取排班类型标签
const getScheduleTypeTag = (type) => {
  const tagMap = {
    outpatient: "success",
    inpatient: "primary",
    pharmacy: "warning", 
    billing: "danger",
    registration: "info",
    office: "",
    service: "warning",
    emergency: "danger",
    surgery: "success",
  };
  return tagMap[type] || "info";
};

// 获取班次类型
const getShiftType = (slot) => {
  const typeMap = {
    morning: "success",
    afternoon: "warning",
    night: "danger",
    full_day: "primary", 
    office: "info",
    flexible: "success",
    off: "info",
  };
  return typeMap[slot] || "info";
};

// 格式化金额
const formatAmount = (amount) => {
  return Number(amount || 0).toFixed(2);
};

// 数据加载
const loadStaffOptions = async (deptId = null, clinicRoomId = null) => {
  try {
    console.log('=== 开始加载人员选项 ===');
    console.log('科室ID:', deptId);
    console.log('诊室ID:', clinicRoomId);
    
    // 加载医生列表
    let doctorList = [];
    try {
      console.log('正在加载医生列表...');
      
      if (deptId) {
        // 有科室ID时，使用简单的医生列表API
        const doctorParams = { departmentId: deptId };
        // 如果有诊室ID，也添加到参数中
        if (clinicRoomId) {
          doctorParams.clinicRoomId = clinicRoomId;
          console.log('按科室和诊室筛选医生:', { departmentId: deptId, clinicRoomId });
        }
        const doctorResp = await getDoctorList(doctorParams);
        console.log("医生列表API响应:", doctorResp);
        
        if (doctorResp && doctorResp.code === 200 && doctorResp.data) {
          // 获取科室名称用于显示
          const selectedDept = departmentOptions.value.find(dept => String(dept.value) === String(deptId));
          const departmentName = selectedDept ? selectedDept.label : '';
          
          // 获取诊室名称用于显示
          let clinicRoomName = '';
          if (clinicRoomId) {
            const selectedRoom = clinicRoomOptions.value.find(room => String(room.value) === String(clinicRoomId));
            clinicRoomName = selectedRoom ? selectedRoom.label : '';
          }
          
          doctorList = doctorResp.data.map((doc) => {
            let displayLabel = doc.name;
            if (departmentName) {
              displayLabel += ` - ${departmentName}`;
            }
            if (clinicRoomName) {
              displayLabel += ` - ${clinicRoomName}`;
            }
            
            return {
              value: doc.doctorId,
              label: displayLabel, // 显示姓名、科室和诊室
              department_id: String(deptId),
              clinic_room_id: String(clinicRoomId || ''),
              professional_title: doc.profashionTitle || '',
            };
          });
        }
      } else {
        // 没有科室ID时，使用分页API获取包含科室信息的医生数据
        const doctorParams = {
          page: 1,
          size: 1000, // 获取所有医生
        };
        const doctorResp = await getDoctorPagerDataBySearch(doctorParams);
        console.log("医生分页API响应:", doctorResp);
        
        if (doctorResp && doctorResp.code === 200 && doctorResp.data && doctorResp.data.list) {
          doctorList = doctorResp.data.list.map((doc) => {
            let displayLabel = doc.name;
            if (doc.departmentName) {
              displayLabel += ` - ${doc.departmentName}`;
            }
            // 检查API是否返回诊室信息
            if (doc.clinicRoomName) {
              displayLabel += ` - ${doc.clinicRoomName}`;
            }
            
            return {
              value: doc.id,
              label: displayLabel, // 显示姓名、科室和诊室（如果有）
              department_id: String(doc.departmentId || ''),
              clinic_room_id: String(doc.clinicRoomId || ''),
              professional_title: doc.profashionTitle || '',
            };
          });
        }
      }
      
      console.log(`成功加载 ${doctorList.length} 个医生:`, doctorList);
    } catch (e) {
      console.error("加载医生列表失败:", e);
      doctorList = [];
    }

    // 加载护士列表
    let nurseList = [];
    try {
      console.log('正在加载护士列表...');
      const nurseParams = {
        page: 1,
        size: 1000, // 获取所有护士
      };
      
      // 如果指定了科室ID，需要找到对应的科室名称
      if (deptId) {
        const selectedDept = departmentOptions.value.find(dept => String(dept.value) === String(deptId));
        if (selectedDept) {
          nurseParams.departmentName = selectedDept.label;
          console.log('按科室名称筛选护士:', selectedDept.label);
        }
      }
      
      // 注意：护士API目前不支持诊室参数，只能按科室过滤
      if (clinicRoomId) {
        console.log('护士API暂不支持诊室过滤，仅按科室过滤');
      }
      
      const nurseResp = await getNurseFullPage(nurseParams);
      console.log("护士列表API响应:", nurseResp);
      
      if (nurseResp && nurseResp.code === 200 && nurseResp.data && nurseResp.data.list) {
        nurseList = nurseResp.data.list.map((nurse) => {
          let displayLabel = nurse.name;
          if (nurse.departmentName) {
            displayLabel += ` - ${nurse.departmentName}`;
          }
          // 检查API是否返回诊室信息
          if (nurse.clinicRoomName) {
            displayLabel += ` - ${nurse.clinicRoomName}`;
          }
          
          return {
            value: nurse.id,
            label: displayLabel, // 显示姓名、科室和诊室（如果有）
            department_id: String(deptId || ''), // 使用传入的科室ID
            clinic_room_id: String(nurse.clinicRoomId || ''),
            professional_title: nurse.profashionTitle,
          };
        });
        console.log(`成功加载 ${nurseList.length} 个护士:`, nurseList);
      } else {
        console.log('护士API响应格式不正确或无数据');
      }
    } catch (e) {
      console.error("加载护士列表失败:", e);
      nurseList = [];
    }

    // 其它人员类型保留模板数据（后续可替换为真实接口）
    const templateOptions = {
      doctor: doctorList,
      nurse: nurseList,
      pharmacist: [
        {
          value: "P001",
          label: "王药剂师 - 药学部 - 药房1",
          department_id: "5",
          clinic_room_id: "R501",
          professional_title: "主管药师",
        },
        {
          value: "P002",
          label: "赵药剂师 - 药学部 - 药房2",
          department_id: "5",
          clinic_room_id: "R502",
          professional_title: "药师",
        },
      ],
      finance: [
        {
          value: "F001",
          label: "陈会计 - 财务科 - 财务室1",
          department_id: "6",
          clinic_room_id: "R601",
          professional_title: "会计师",
        },
        {
          value: "F002",
          label: "林出纳 - 财务科 - 收费窗口1",
          department_id: "6",
          clinic_room_id: "R602",
          professional_title: "出纳员",
        },
      ],
      registration: [
        {
          value: "R001",
          label: "刘挂号员 - 挂号处 - 挂号窗口1",
          department_id: "7",
          clinic_room_id: "R701",
          professional_title: "挂号员",
        },
        {
          value: "R002",
          label: "杨收费员 - 收费处 - 收费窗口2",
          department_id: "7",
          clinic_room_id: "R702",
          professional_title: "收费员",
        },
      ],
      administrative: [
        {
          value: "A001",
          label: "黄主任 - 行政科 - 行政办公室",
          department_id: "8",
          clinic_room_id: "R801",
          professional_title: "行政主任",
        },
        {
          value: "A002",
          label: "周文员 - 行政科 - 档案室",
          department_id: "8",
          clinic_room_id: "R802",
          professional_title: "行政文员",
        },
      ],
      logistics: [
        {
          value: "L001",
          label: "吴后勤 - 后勤科 - 设备维修室",
          department_id: "9",
          clinic_room_id: "R901",
          professional_title: "后勤主管",
        },
        {
          value: "L002",
          label: "郑保洁 - 后勤科 - 清洁用品库",
          department_id: "9",
          clinic_room_id: "R902",
          professional_title: "保洁员",
        },
      ],
    };

    // 如果指定了科室，按科室过滤每种类型的人员（注意全部转换为字符串比较）
    if (deptId) {
      console.log('按科室过滤人员，科室ID:', deptId);
      Object.keys(templateOptions).forEach((type) => {
        const originalCount = templateOptions[type].length;
        templateOptions[type] = (templateOptions[type] || []).filter(
          (staff) => String(staff.department_id) === String(deptId)
        );
        console.log(`${type}: ${originalCount} -> ${templateOptions[type].length}`);
      });
    }

    // 最终赋值并刷新筛选列表
    staffOptions.value = templateOptions;
    console.log('最终人员选项:', staffOptions.value);
    
    filterStaffOptions("");
    filterDialogStaffOptions("");
    
    console.log('=== 人员选项加载完成 ===');
  } catch (error) {
    console.error("加载人员列表失败:", error);
  }
};

// 显示批量操作对话框
const showBatchOperationDialog = () => {
  const selectedCount = 0; // 实际应该从表格 selection 获取
  if (selectedCount === 0) {
    ElMessage.warning("请先选择要操作的排班");
    return;
  }
  batchForm.selectedCount = selectedCount;
  batchDialog.visible = true;
};

// 确认批量操作
const confirmBatchOperation = () => {
  ElMessage.success(`批量${batchForm.operation}操作成功`);
  batchDialog.visible = false;
  loadSchedules();
};

const loadFeeOptions = async () => {
  try {
    console.log('=== 开始加载费用项目列表 ===');
    const response = await getFeeCateList();
    console.log("费用项目API响应:", response);
    
    if (response && response.code === 200 && response.data) {
      feeOptions.value = response.data.map((item) => ({
        value: item.id || item.fee_id || item.categoryId,
        label: item.name || item.fee_name || item.categoryName,
        amount: item.amount || item.standardPrice || 0,
      }));
      console.log(`成功加载 ${feeOptions.value.length} 个费用项目:`, feeOptions.value);
    } else {
      console.error("费用项目API响应格式错误:", response);
      feeOptions.value = [];
      ElMessage.error("加载费用项目失败：响应格式错误");
    }
  } catch (error) {
    console.error("加载费用项目失败:", error);
    feeOptions.value = [];
    ElMessage.error("加载费用项目失败，请检查网络连接");
  }
};

const loadSchedules = async () => {
  // TODO: 调用后端接口获取排班数据
  try {
    // 模拟数据
    const mockData = [
      {
        id: "1",
        staff_type: "doctor",
        staff_id: "1",
        staff_name: "张医生",
        department_id: "1",
        department_name: "心血管内科",
        week_days: ["1", "3", "5"],
        time_slot: "morning",
        schedule_type: "outpatient",
        location: "门诊部301诊室",
        fee_item_id: "1",
        fee_item_name: "主任医师挂号费",
        fee_amount: 50.0,
        max_patients: 30,
        is_active: 1,
        notes: "专家门诊",
        avatar: "",
      },
    ];

    // 筛选逻辑
    let filteredData = mockData;

    if (filters.department_id) {
      filteredData = filteredData.filter(
        (item) => item.department_id === filters.department_id
      );
    }

    if (filters.staff_type) {
      filteredData = filteredData.filter(
        (item) => item.staff_type === filters.staff_type
      );
    }

    if (filters.staff_id) {
      filteredData = filteredData.filter(
        (item) => item.staff_id === filters.staff_id
      );
    }

    if (filters.schedule_type) {
      filteredData = filteredData.filter(
        (item) => item.schedule_type === filters.schedule_type
      );
    }

    if (filters.is_active !== "") {
      filteredData = filteredData.filter(
        (item) => item.is_active === filters.is_active
      );
    }

    // 分页逻辑
    const startIndex = (pagination.current_page - 1) * pagination.page_size;
    const endIndex = startIndex + pagination.page_size;
    schedules.value = filteredData.slice(startIndex, endIndex);
    pagination.total = filteredData.length;

    // 更新统计信息
    updateStats(filteredData);
  } catch (error) {
    console.error("加载排班数据失败:", error);
    ElMessage.error("加载排班数据失败");
  }
};

const updateStats = (data) => {
  stats.totalCount = data.length;
  stats.activeCount = data.filter((item) => item.is_active === 1).length;
  stats.doctorCount = data.filter(
    (item) => item.staff_type === "doctor"
  ).length;
  stats.nurseCount = data.filter((item) => item.staff_type === "nurse").length;
  stats.pharmacistCount = data.filter(
    (item) => item.staff_type === "pharmacist"
  ).length;
  stats.staffCount = data.filter(
    (item) => !["doctor", "nurse", "pharmacist"].includes(item.staff_type)
  ).length;
};

const handleSizeChange = (size) => {
  pagination.page_size = size;
  loadSchedules();
};

const handleCurrentChange = (page) => {
  pagination.current_page = page;
  loadSchedules();
};

const handleStatusChange = async (row) => {
  try {
    // TODO: 调用后端接口更新状态
    ElMessage.success(`已${row.is_active ? "启用" : "停用"}排班`);
    loadSchedules();
  } catch (error) {
    console.error("更新状态失败:", error);
    ElMessage.error("更新状态失败");
    // 恢复原状态
    row.is_active = row.is_active ? 0 : 1;
  }
};

const showAddScheduleDialog = () => {
  scheduleDialog.is_edit = false;
  scheduleDialog.visible = true;
  resetScheduleForm();
};

const editSchedule = async (row) => {
  scheduleDialog.is_edit = true;
  scheduleDialog.visible = true;
  Object.assign(scheduleForm, row);
  // 确保 department_id 存在
  scheduleForm.department_id =
    row.department_id || scheduleForm.department_id || "";
  // 确保 clinic_room_id 存在
  scheduleForm.clinic_room_id =
    row.clinic_room_id || scheduleForm.clinic_room_id || "";
  
  // 按科室加载诊室和人员选项，保证对话框选项列表正确
  if (scheduleForm.department_id) {
    await load_clinic_rooms_by_department(scheduleForm.department_id);
    loadStaffOptions(scheduleForm.department_id, scheduleForm.clinic_room_id);
    filterDialogStaffOptions("");
  }
};

const viewScheduleDetails = (row) => {
  currentSchedule.value = row;
  detailDrawer.visible = true;
};

const deleteSchedule = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${row.staff_name} 的排班吗？`,
      "确认删除",
      {
        type: "warning",
      }
    );
    // TODO: 调用后端接口删除排班
    ElMessage.success("删除成功");
    loadSchedules();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  }
};

const resetScheduleForm = () => {
  Object.keys(scheduleForm).forEach((key) => {
    if (key === "staff_type") {
      // 使用动态加载的第一个人员类型作为默认值
      scheduleForm[key] = staffTypeOptions.value.length > 0 ? staffTypeOptions.value[0].value : "";
    } else if (key === "time_slot") {
      // 使用动态加载的第一个班次时间作为默认值
      scheduleForm[key] = TimeSlotOptions.value.length > 0 ? TimeSlotOptions.value[0].value : "";
    } else if (key === "is_active") {
      scheduleForm[key] = 1;
    } else if (key === "schedule_type") {
      scheduleForm[key] = "outpatient";
    } else if (key === "max_patients") {
      scheduleForm[key] = 30;
    } else if (Array.isArray(scheduleForm[key])) {
      scheduleForm[key] = [];
    } else {
      scheduleForm[key] = "";
    }
  });
  
  // 清空诊室选项
  clinicRoomOptions.value = [];
};

// 表单弹窗人员类型变化处理（新函数）
const handleDialogStaffTypeChange = (staffType) => {
  console.log('=== 表单弹窗人员类型变化 ===');
  console.log('选择的人员类型:', staffType);
  
  // 清空人员选择
  scheduleForm.staff_id = "";
  
  // 重新过滤对话框人员选项
  filterDialogStaffOptions("");
  
  console.log('当前对话框人员选项:', filteredDialogStaffOptions.value);
};

// 原有的handleStaffTypeChange函数保持不变（用于其他逻辑）
const handleStaffTypeChange = (type) => {
  scheduleForm.staff_id = "";
  scheduleForm.department_id = "";
  scheduleForm.clinic_room_id = "";
  // 清空诊室选项
  clinicRoomOptions.value = [];
  filterDialogStaffOptions("");
};

const handleScheduleTypeChange = (type) => {
  // 根据排班类型重置相关字段
  if (type === "outpatient") {
    scheduleForm.max_patients = 30;
  }
};

const submitScheduleForm = async () => {
  try {
    await scheduleFormRef.value.validate();

    // TODO: 调用后端接口保存排班
    ElMessage.success(scheduleDialog.is_edit ? "更新成功" : "新增成功");
    scheduleDialog.visible = false;
    loadSchedules();
  } catch (error) {
    console.error("表单验证失败:", error);
  }
};

const generateWeeklySchedule = () => {
  ElMessage.info("生成周排班功能开发中...");
};

const exportSchedule = () => {
  ElMessage.info("导出排班表功能开发中...");
};

const refreshData = () => {
  loadSchedules();
};

// 设置表单默认值
const setFormDefaults = () => {
  // 设置默认人员类型（第一个选项）
  if (staffTypeOptions.value && staffTypeOptions.value.length > 0) {
    scheduleForm.staff_type = staffTypeOptions.value[0].value;
  }
  
  // 设置默认班次时间（第一个选项）
  if (TimeSlotOptions.value && TimeSlotOptions.value.length > 0) {
    scheduleForm.time_slot = TimeSlotOptions.value[0].value;
  }
};

// 初始化数据
const initData = async () => {
  try {
    console.log('=== 开始初始化数据 ===');
    await load_departments_list();
    console.log('科室列表加载完成，departmentOptions:', departmentOptions.value);
    console.log('filteredDepartmentOptions:', filteredDepartmentOptions.value);
    
    await load_staff_types();
    await load_time_slots(); // 新增调用
    
    // 确保筛选选项正确设置
    if (allDepartmentOptions.value.length > 0) {
      filteredDepartmentOptions.value = allDepartmentOptions.value; // 显示所有科室
      console.log('重新设置filteredDepartmentOptions:', filteredDepartmentOptions.value);
    }

    // 设置表单默认值
    setFormDefaults();

    await load_doctor_list();
    await loadStaffOptions(null, null);
    await loadFeeOptions();
    await loadSchedules();
    
    console.log('=== 数据初始化完成 ===');
  } catch (error) {
    console.error("初始化数据失败:", error);
  }
};

onMounted(() => {
  // 延迟初始化，让 DOM 完全稳定
  setTimeout(() => {
    initData();
  }, 500);
});
</script>

<style lang="scss" scoped>
// 变量定义
$primary: #409eff;
$success: #67c23a;
$warning: #e6a23c;
$danger: #f56c6c;
$purple: #9c88ff;
$text: #303133;
$border: #dcdfe6;
$light: #f5f7fa;

// 混入
@mixin card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 24px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

// 管理页面容器
.manager-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

// 主内容区域
.content-area {
  flex: 1;
  margin-left: 260px; // 为SideLeft组件留出空间
  margin-top: 72px; // 为AdminHeader组件留出空间
  min-height: calc(100vh - 72px);
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 50%, #d1edff 100%);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  padding: 30px;
  transition: margin-left 0.3s ease;

  // 统计卡片
  .stats-cards {
    margin-bottom: 30px;

    .stat-card {
      @include card;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;

      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;

        &.total { background: rgba($primary, 0.1); color: $primary; }
        &.active { background: rgba($success, 0.1); color: $success; }
        &.doctor { background: rgba($primary, 0.1); color: $primary; }
        &.nurse { background: rgba($purple, 0.1); color: $purple; }
        &.pharmacist { background: rgba($warning, 0.1); color: $warning; }
        &.staff { background: rgba($danger, 0.1); color: $danger; }
      }

      .stat-content {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: $text;
          margin: 0 0 4px 0;
        }
        .stat-label {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
      }
    }
  }

  // 筛选卡片
  .filter-card {
    @include card;
    margin-bottom: 30px;

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;

      .filter-item {
        .filter-label {
          font-weight: 500;
          color: $text;
          margin-bottom: 8px;
          font-size: 14px;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  // 排班表格
  .schedule-table {
    @include card;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .table-title {
        font-size: 18px;
        font-weight: 600;
        color: $text;
      }

      .table-tools {
        display: flex;
        gap: 12px;
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid $border;
    }
  }
}

// 表格样式
.staff-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .staff-avatar {
    flex-shrink: 0;
  }

  .staff-name {
    font-weight: 600;
    color: $text;
    margin-bottom: 4px;
  }

  .staff-details {
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.week-days {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .week-day-tag {
    margin: 2px 0;
  }
}

.time-slot-info {
  text-align: center;

  .time-range {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }
}

.business-info {
  font-size: 12px;
  line-height: 1.4;

  div {
    margin-bottom: 2px;
  }
}

.no-info {
  color: #ccc;
  font-style: italic;
}

.action-buttons-cell {
  display: flex;
  gap: 8px;
  justify-content: center;

  .el-button {
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
  }
}

// Element Plus 组件样式覆盖
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

:deep(.el-table) {
  .el-table__header th {
    background: $light;
    color: $text;
    font-weight: 600;
    border-bottom: 2px solid $border;
  }

  .el-table__row {
    &:hover {
      background: rgba($primary, 0.05);
    }
  }
}

:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .el-dialog__header {
    background: linear-gradient(135deg, $primary 0%, #66b1ff 100%);
    color: white;
    padding: 20px 24px;

    .el-dialog__title {
      font-weight: 600;
      font-size: 18px;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 20px 24px;
    background: $light;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .content-area {
    margin-left: 0 !important; // 移动端隐藏侧边栏
    padding: 20px;

    .filter-card {
      .filter-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .action-buttons {
        flex-direction: column;

        :deep(.el-button) {
          width: 100%;
          justify-content: center;
        }
      }
    }
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .content-area {
    margin-left: 200px; // 中等屏幕使用较小的侧边栏宽度
  }
  
  .stats-cards {
    :deep(.el-row .el-col) {
      margin-bottom: 16px;
    }
  }
}
</style>
