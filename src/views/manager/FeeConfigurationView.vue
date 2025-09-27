<template>
  <div class="manager-container">
    <!-- 顶部导航栏 -->
    <AdminHeader 
      title="医院管理系统"
      :notification-count="2"
      @notification-click="handleNotificationClick"
      @profile-click="handleProfileClick"
      @settings-click="handleSettingsClick"
    />
    <!-- 左侧菜单 - 使用SideLeft组件 -->
    <SideLeft :activeMenu="'feeconfig'" />
    <div class="content-area">
      <!-- 统计卡片 -->
      <div class="stats-cards" v-loading="statsLoading" element-loading-text="加载统计数据...">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon fee-type">
                <el-icon><Collection /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalCount }}</div>
                <div class="stat-label">费用类型</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon active">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.activeCount }}</div>
                <div class="stat-label">启用项目</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon inactive">
                <el-icon><Close /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.inactiveCount }}</div>
                <div class="stat-label">停用项目</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon updated">
                <el-icon><Refresh /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.todayUpdateCount }}</div>
                <div class="stat-label">今日更新</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 筛选卡片 -->
      <div class="filter-card">
        <div class="filter-row">
          <div class="filter-item">
            <div class="filter-label">费用名称</div>
            <el-input
              v-model="filters.itemName"
              placeholder="请输入费用名称"
              clearable
            />
          </div>
          <div class="filter-item">
            <div class="filter-label">费用类型</div>
            <el-select
              v-model="filters.categoryId"
              placeholder="请选择费用类型"
              clearable
            >
              <el-option
                v-for="cate in fee_category_options"
                :key="cate.value"
                :label="cate.label"
                :value="cate.value"
              />
            </el-select>
          </div>
          <div class="filter-item">
            <div class="filter-label">状态</div>
            <el-select
              v-model="filters.isActive"
              placeholder="请选择状态"
              clearable
            >
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </div>
          <div class="filter-item">
            <div class="filter-label">科室</div>
            <el-select
              v-model="filters.departmentIds"
              placeholder="请选择科室"
              clearable
              filterable
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="2"
            >
              <el-option
                v-for="dept in department_options"
                :key="dept.value"
                :label="dept.label"
                :value="dept.value"
              />
            </el-select>
          </div>
        </div>
        <div class="action-buttons">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="searchFees">查询</el-button>
          <el-button type="success" @click="showCreateFeeDialog">
            <el-icon><Plus /></el-icon>
            新增费用
          </el-button>
          <el-button type="warning" @click="exportFeeTemplate">
            <el-icon><Download /></el-icon>
            导出模板
          </el-button>
          <el-button type="info" @click="showImportDialog">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
        </div>
      </div>

      <!-- 费用配置表格 -->
      <div class="fee-table">
        <div class="table-header">
          <div class="table-title">
            费用配置列表
            <span v-if="selectedFeeItems.length > 0" class="selection-info">
              （已选择 {{ selectedFeeItems.length }} 项）
            </span>
          </div>
          <div class="table-tools">
            <el-button 
              v-if="selectedFeeItems.length > 0"
              type="danger" 
              :loading="batchDeleteLoading"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除 ({{ selectedFeeItems.length }})
            </el-button>
            <el-button @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>

        <div class="table-scroll">
          <el-table 
            class="fee-config-table" 
            :data="fee_configs" 
            stripe
            v-loading="loading"
            element-loading-text="加载中..."
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="itemCode" label="费用编码" width="120" />
            <el-table-column prop="itemName" label="费用名称" min-width="180" />
            <el-table-column label="费用类型" width="140">
              <template #default="{ row }">
                <el-tag :type="getCategoryTag(row.categoryId)" size="small">
                  {{ row.categoryName || '未知类型' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="标准价格" width="120">
              <template #default="{ row }">
                <span class="amount">¥{{ formatAmount(row.standardPrice) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="医保价格" width="120">
              <template #default="{ row }">
                ¥{{ formatAmount(row.insurancePrice) }}
              </template>
            </el-table-column>
            <el-table-column label="成本价格" width="120">
              <template #default="{ row }">
                ¥{{ formatAmount(row.costPrice) }}
              </template>
            </el-table-column>
            <el-table-column label="医保类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getInsuranceTypeTag(row.insuranceType)" size="small">
                  {{ row.insuranceTypeName || row.insuranceType || '-' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="适用科室" width="200">
              <template #default="{ row }">
                <el-tooltip 
                  :content="formatDepartmentNames(row.departmentIds)" 
                  placement="top"
                  :disabled="!row.departmentIds || formatDepartmentNames(row.departmentIds).length < 20"
                >
                  <span class="department-names">
                    {{ formatDepartmentNames(row.departmentIds) }}
                  </span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-switch
                  v-model="row.isActive"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleStatusChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="更新时间" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.updateTime || row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons-cell">
                  <el-button size="small" @click="viewFeeDetails(row)">详情</el-button>
                  <el-button size="small" type="primary" @click="editFeeConfig(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteFeeConfig(row)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

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
    </div>

    <!-- 费用项目详情弹窗 -->
    <el-dialog
      v-model="showDetailModal"
      title="费用项目详情"
      width="800px"
      :close-on-click-modal="false"
      @close="handleCloseDetail"
    >
      <div v-loading="detailLoading" class="fee-detail-content">
        <div v-if="feeDetail" class="detail-info">
          <!-- 基本信息 -->
          <div class="info-section">
            <h3 class="section-title">基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>费用编码：</label>
                <span class="info-value code">{{ feeDetail.itemCode }}</span>
              </div>
              <div class="info-item">
                <label>费用名称：</label>
                <span class="info-value name">{{ feeDetail.itemName }}</span>
              </div>
              <div class="info-item">
                <label>费用类型：</label>
                <el-tag :type="getCategoryTag(feeDetail.categoryId)" size="default">
                  {{ feeDetail.categoryName }}
                </el-tag>
              </div>
              <div class="info-item">
                <label>计量单位：</label>
                <span class="info-value">{{ feeDetail.unit || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 价格信息 -->
          <div class="info-section">
            <h3 class="section-title">价格信息</h3>
            <div class="price-grid">
              <div class="price-item standard">
                <div class="price-label">标准价格</div>
                <div class="price-value">¥{{ formatAmount(feeDetail.standardPrice) }}</div>
              </div>
              <div class="price-item insurance">
                <div class="price-label">医保价格</div>
                <div class="price-value">¥{{ formatAmount(feeDetail.insurancePrice) }}</div>
              </div>
              <div class="price-item cost">
                <div class="price-label">成本价格</div>
                <div class="price-value">¥{{ formatAmount(feeDetail.costPrice) }}</div>
              </div>
            </div>
          </div>

          <!-- 医保信息 -->
          <div class="info-section">
            <h3 class="section-title">医保信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>医保类型：</label>
                <el-tag :type="getInsuranceTypeTag(feeDetail.insuranceType)" size="default">
                  {{ feeDetail.insuranceTypeName || feeDetail.insuranceType || '-' }}
                </el-tag>
              </div>
              <div class="info-item">
                <label>启用状态：</label>
                <el-tag :type="feeDetail.isActive === 1 ? 'success' : 'danger'" size="default">
                  {{ feeDetail.isActive === 1 ? '启用' : '停用' }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 适用科室 -->
          <div class="info-section">
            <h3 class="section-title">适用科室</h3>
            <div class="department-list">
              <div class="department-tags">
                <template v-if="getDetailDepartmentList(feeDetail.departmentIds).length > 0">
                  <el-tag
                    v-for="dept in getDetailDepartmentList(feeDetail.departmentIds)"
                    :key="dept.value"
                    class="department-tag"
                    type="info"
                  >
                    {{ dept.label }}
                  </el-tag>
                </template>
                <span v-else class="no-departments">暂无指定科室</span>
              </div>
            </div>
          </div>

          <!-- 描述信息 -->
          <div class="info-section" v-if="feeDetail.description">
            <h3 class="section-title">描述信息</h3>
            <div class="description-content">
              {{ feeDetail.description }}
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="info-section">
            <h3 class="section-title">时间信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>创建时间：</label>
                <span class="info-value">{{ formatDateTime(feeDetail.createTime) }}</span>
              </div>
              <div class="info-item">
                <label>更新时间：</label>
                <span class="info-value">{{ formatDateTime(feeDetail.updateTime) || '暂无更新' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDetail">关闭</el-button>
          <el-button type="primary" @click="editFeeFromDetail">编辑</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增费用项目弹窗 -->
    <el-dialog
      v-model="showAddModal"
      title="新增费用项目"
      width="900px"
      :close-on-click-modal="false"
      @close="handleCloseAdd"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
        class="add-fee-form"
      >
        <div class="form-grid">
          <!-- 基本信息 -->
          <div class="form-section">
            <h3 class="section-title">基本信息</h3>
            <div class="form-row">
              <el-form-item label="费用编码" prop="itemCode" class="form-item">
                <el-input
                  v-model="addForm.itemCode"
                  placeholder="请输入费用编码，如：REG004"
                  maxlength="20"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="费用名称" prop="itemName" class="form-item">
                <el-input
                  v-model="addForm.itemName"
                  placeholder="请输入费用名称，如：特需门诊挂号"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="费用类型" prop="categoryId" class="form-item">
                <el-select
                  v-model="addForm.categoryId"
                  placeholder="请选择费用类型"
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="category in fee_category_options"
                    :key="category.value"
                    :label="category.label"
                    :value="category.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="计量单位" prop="unit" class="form-item">
                <el-input
                  v-model="addForm.unit"
                  placeholder="请输入计量单位，如：次"
                  maxlength="10"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 价格信息 -->
          <div class="form-section">
            <h3 class="section-title">价格信息</h3>
            <div class="form-row">
              <el-form-item label="标准价格" prop="standardPrice" class="form-item">
                <el-input-number
                  v-model="addForm.standardPrice"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0.00"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="医保价格" prop="insurancePrice" class="form-item">
                <el-input-number
                  v-model="addForm.insurancePrice"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0.00"
                  style="width: 100%"
                />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="成本价格" prop="costPrice" class="form-item">
                <el-input-number
                  v-model="addForm.costPrice"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0.00"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="医保类型" prop="insuranceType" class="form-item">
                <el-select
                  v-model="addForm.insuranceType"
                  placeholder="请选择医保类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="type in insuranceTypeOptions"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </div>

          <!-- 适用科室 -->
          <div class="form-section">
            <h3 class="section-title">适用科室</h3>
            <el-form-item label="适用科室" prop="departmentIds">
              <el-select
                v-model="addForm.departmentIds"
                placeholder="请选择适用科室"
                multiple
                filterable
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="3"
                style="width: 100%"
              >
                <el-option
                  v-for="dept in department_options"
                  :key="dept.value"
                  :label="dept.label"
                  :value="dept.value"
                />
              </el-select>
            </el-form-item>
          </div>

          <!-- 其他信息 -->
          <div class="form-section">
            <h3 class="section-title">其他信息</h3>
            <el-form-item label="描述信息">
              <el-input
                v-model="addForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入费用项目的详细描述（可选）"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="启用状态">
              <el-radio-group v-model="addForm.isActive">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseAdd">取消</el-button>
          <el-button type="primary" :loading="addLoading" @click="handleSubmitAdd">
            确定新增
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑费用项目弹窗 -->
    <el-dialog
      v-model="showEditModal"
      title="编辑费用项目"
      width="900px"
      :close-on-click-modal="false"
      @close="handleCloseEdit"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
        class="edit-fee-form"
      >
        <div class="form-grid">
          <!-- 基本信息 -->
          <div class="form-section">
            <h3 class="section-title">基本信息</h3>
            <div class="form-row">
              <el-form-item label="费用编码" prop="itemCode" class="form-item">
                <el-input
                  v-model="editForm.itemCode"
                  placeholder="请输入费用编码"
                  maxlength="20"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="费用名称" prop="itemName" class="form-item">
                <el-input
                  v-model="editForm.itemName"
                  placeholder="请输入费用名称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="费用类型" prop="categoryId" class="form-item">
                <el-select
                  v-model="editForm.categoryId"
                  placeholder="请选择费用类型"
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="category in fee_category_options"
                    :key="category.value"
                    :label="category.label"
                    :value="category.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="计量单位" prop="unit" class="form-item">
                <el-input
                  v-model="editForm.unit"
                  placeholder="请输入计量单位"
                  maxlength="10"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 价格信息 -->
          <div class="form-section">
            <h3 class="section-title">价格信息</h3>
            <div class="form-row">
              <el-form-item label="标准价格" prop="standardPrice" class="form-item">
                <el-input-number
                  v-model="editForm.standardPrice"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0.00"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="医保价格" prop="insurancePrice" class="form-item">
                <el-input-number
                  v-model="editForm.insurancePrice"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0.00"
                  style="width: 100%"
                />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="成本价格" prop="costPrice" class="form-item">
                <el-input-number
                  v-model="editForm.costPrice"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  placeholder="0.00"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="医保类型" prop="insuranceType" class="form-item">
                <el-select
                  v-model="editForm.insuranceType"
                  placeholder="请选择医保类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="type in insuranceTypeOptions"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </div>

          <!-- 适用科室 -->
          <div class="form-section">
            <h3 class="section-title">适用科室</h3>
            <el-form-item label="适用科室" prop="departmentIds">
              <el-select
                v-model="editForm.departmentIds"
                placeholder="请选择适用科室"
                multiple
                filterable
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="3"
                style="width: 100%"
              >
                <el-option
                  v-for="dept in department_options"
                  :key="dept.value"
                  :label="dept.label"
                  :value="dept.value"
                />
              </el-select>
            </el-form-item>
          </div>

          <!-- 其他信息 -->
          <div class="form-section">
            <h3 class="section-title">其他信息</h3>
            <el-form-item label="描述信息">
              <el-input
                v-model="editForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入费用项目的详细描述（可选）"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="启用状态">
              <el-radio-group v-model="editForm.isActive">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseEdit">取消</el-button>
          <el-button type="primary" :loading="editLoading" @click="handleSubmitEdit">
            确定更新
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import AdminHeader from "@/components/manager/AdminHeader.vue";
import SideLeft from "@/components/manager/SideLeft.vue";
import { 
  getFeeItemPage, 
  getFeeCategoryList, 
  updateFeeItemStatus,
  deleteFeeItem,
  getFeeItemDetail,
  addFeeItem,
  updateFeeItem,
  batchDeleteFeeItem,
  getFeeItems
} from "@/api/fees.js";
import { getDepartmentList } from "@/api/departments.js";

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

// 基础数据结构
const filters = reactive({
  itemName: "",
  categoryId: "",
  isActive: "",
  departmentIds: [], // 改为数组支持多选
});

const stats = reactive({
  totalCount: 0,
  activeCount: 0,
  inactiveCount: 0,
  todayUpdateCount: 0,
});

const pagination = reactive({
  current_page: 1,
  page_size: 10,
  total: 0,
});

const department_options = ref([]);
const fee_category_options = ref([]);
const fee_configs = ref([]);
const loading = ref(false);

// 批量删除相关
const selectedFeeItems = ref([]);
const batchDeleteLoading = ref(false);

// 统计数据相关
const statsLoading = ref(false);

// 详情弹窗相关
const showDetailModal = ref(false);
const detailLoading = ref(false);
const feeDetail = ref(null);

// 新增弹窗相关
const showAddModal = ref(false);
const addLoading = ref(false);
const addFormRef = ref(null);

// 编辑弹窗相关
const showEditModal = ref(false);
const editLoading = ref(false);
const editFormRef = ref(null);
const editingFeeId = ref(null);

// 新增表单数据
const addForm = reactive({
  itemCode: "",
  itemName: "",
  categoryId: "",
  standardPrice: "",
  insurancePrice: "",
  costPrice: "",
  unit: "",
  insuranceType: "",
  departmentIds: [],
  description: "",
  isActive: 1
});

// 表单验证规则
const addFormRules = reactive({
  itemCode: [
    { required: true, message: '请输入费用编码', trigger: 'blur' },
    { min: 3, max: 20, message: '费用编码长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  itemName: [
    { required: true, message: '请输入费用名称', trigger: 'blur' },
    { min: 2, max: 50, message: '费用名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择费用类型', trigger: 'change' }
  ],
  standardPrice: [
    { required: true, message: '请输入标准价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '标准价格必须大于等于0', trigger: 'blur' }
  ],
  insurancePrice: [
    { required: true, message: '请输入医保价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '医保价格必须大于等于0', trigger: 'blur' }
  ],
  costPrice: [
    { required: true, message: '请输入成本价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '成本价格必须大于等于0', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请输入计量单位', trigger: 'blur' }
  ],
  insuranceType: [
    { required: true, message: '请选择医保类型', trigger: 'change' }
  ],
  departmentIds: [
    { required: true, message: '请选择适用科室', trigger: 'change' }
  ]
});

// 编辑表单数据
const editForm = reactive({
  id: "",
  itemCode: "",
  itemName: "",
  categoryId: "",
  standardPrice: "",
  insurancePrice: "",
  costPrice: "",
  unit: "",
  insuranceType: "",
  departmentIds: [],
  description: "",
  isActive: 1
});

// 编辑表单验证规则（与新增相同）
const editFormRules = reactive({
  itemCode: [
    { required: true, message: '请输入费用编码', trigger: 'blur' },
    { min: 3, max: 20, message: '费用编码长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  itemName: [
    { required: true, message: '请输入费用名称', trigger: 'blur' },
    { min: 2, max: 50, message: '费用名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择费用类型', trigger: 'change' }
  ],
  standardPrice: [
    { required: true, message: '请输入标准价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '标准价格必须大于等于0', trigger: 'blur' }
  ],
  insurancePrice: [
    { required: true, message: '请输入医保价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '医保价格必须大于等于0', trigger: 'blur' }
  ],
  costPrice: [
    { required: true, message: '请输入成本价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '成本价格必须大于等于0', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请输入计量单位', trigger: 'blur' }
  ],
  insuranceType: [
    { required: true, message: '请选择医保类型', trigger: 'change' }
  ],
  departmentIds: [
    { required: true, message: '请选择适用科室', trigger: 'change' }
  ]
});

// 医保类型选项
const insuranceTypeOptions = [
  { value: 'A', label: '甲类' },
  { value: 'B', label: '乙类' },
  { value: 'C', label: '丙类' }
];

// 基础方法已移至下方统一管理

// 获取统计数据
const loadStatsData = async () => {
  try {
    statsLoading.value = true;
    console.log('=== 开始获取费用统计数据 ===');
    
    const response = await getFeeItems();
    
    if (response.code === 200) {
      stats.totalCount = response.data.totalCount || 0;
      stats.activeCount = response.data.activeCount || 0;
      stats.inactiveCount = response.data.inactiveCount || 0;
      stats.todayUpdateCount = response.data.todayUpdateCount || 0;
      
      console.log('费用统计数据加载成功:', stats);
    } else {
      console.warn('获取费用统计数据失败:', response.msg);
      ElMessage.warning(response.msg || '获取统计数据失败');
    }
  } catch (error) {
    console.error('获取费用统计数据失败:', error);
    ElMessage.error('获取统计数据失败，请重试');
  } finally {
    statsLoading.value = false;
  }
};

// 获取费用列表数据
const loadFeeData = async () => {
  try {
    loading.value = true;
    console.log('=== 开始获取费用列表数据 ===');
    
    const params = {
      page: pagination.current_page,
      size: pagination.page_size,
    };
    
    // 添加筛选条件
    if (filters.itemName) {
      params.itemName = filters.itemName;
    }
    if (filters.categoryId) {
      params.categoryId = filters.categoryId;
    }
    if (filters.isActive !== "") {
      params.isActive = filters.isActive;
    }
    if (filters.departmentIds && filters.departmentIds.length > 0) {
      params.departmentIds = JSON.stringify(filters.departmentIds);
    }
    
    console.log('请求参数:', params);
    
    const response = await getFeeItemPage(params);
    
    if (response.code === 200) {
      fee_configs.value = response.data.list || [];
      pagination.total = response.data.totalCount || 0;
      
      // 更新统计数据
      updateStats();
      
      console.log('费用列表加载成功:', {
        总数: pagination.total,
        当前页数据: fee_configs.value.length
      });
      
      ElMessage.success(`加载成功，共${pagination.total}条费用数据`);
    } else {
      ElMessage.error(response.msg || '获取费用列表失败');
    }
  } catch (error) {
    console.error('获取费用列表失败:', error);
    ElMessage.error('获取费用列表失败，请检查网络连接');
  } finally {
    loading.value = false;
  }
};

// 更新统计数据
const updateStats = () => {
  stats.totalCount = pagination.total;
  stats.activeCount = fee_configs.value.filter(item => item.isActive === 1).length;
  stats.inactiveCount = fee_configs.value.filter(item => item.isActive === 0).length;
  stats.todayUpdateCount = fee_configs.value.filter(item => {
    if (!item.updateTime) return false;
    const today = new Date().toDateString();
    const updateDate = new Date(item.updateTime).toDateString();
    return today === updateDate;
  }).length;
};

// 获取费用类型列表
const loadFeeCategoryList = async () => {
  try {
    console.log('=== 开始获取费用类型列表 ===');
    const response = await getFeeCategoryList();
    
    if (response.code === 200) {
      fee_category_options.value = response.data.map(item => ({
        value: item.id,
        label: item.name || item.categoryName
      }));
      console.log('费用类型列表加载成功:', fee_category_options.value.length);
    } else {
      console.warn('获取费用类型列表失败:', response.msg);
    }
  } catch (error) {
    console.error('获取费用类型列表失败:', error);
  }
};

// 获取科室列表
const loadDepartmentList = async () => {
  try {
    console.log('=== 开始获取科室列表 ===');
    const response = await getDepartmentList();
    
    if (response.code === 200) {
      department_options.value = response.data.map(item => ({
        value: item.departmentId, // 使用departmentId作为value
        label: item.name          // 使用name作为label（具体科室名称如"心内科"）
      }));
      console.log('科室列表加载成功:', department_options.value);
      console.log('科室数量:', department_options.value.length);
    } else {
      console.warn('获取科室列表失败:', response.msg);
    }
  } catch (error) {
    console.error('获取科室列表失败:', error);
  }
};

const searchFees = () => {
  pagination.current_page = 1;
  loadFeeData();
};

// 显示新增费用弹窗
const showCreateFeeDialog = () => {
  console.log('=== 显示新增费用弹窗 ===');
  resetAddForm();
  showAddModal.value = true;
};

const exportFeeTemplate = () => {
  ElMessage.info("导出模板功能待实现");
};

const showImportDialog = () => {
  ElMessage.info("批量导入功能待实现");
};

const refreshData = () => {
  loadFeeData();
  loadStatsData(); // 更新统计数据
};

// 查看费用详情
const viewFeeDetails = async (row) => {
  try {
    console.log('=== 查看费用详情 ===', row.id);
    showDetailModal.value = true;
    detailLoading.value = true;
    feeDetail.value = null;
    
    const response = await getFeeItemDetail(row.id);
    
    if (response.code === 200) {
      feeDetail.value = response.data;
      console.log('费用详情加载成功:', feeDetail.value);
    } else {
      ElMessage.error(response.msg || '获取费用详情失败');
      showDetailModal.value = false;
    }
  } catch (error) {
    console.error('获取费用详情失败:', error);
    ElMessage.error('获取费用详情失败，请重试');
    showDetailModal.value = false;
  } finally {
    detailLoading.value = false;
  }
};

// 编辑费用配置
const editFeeConfig = async (row) => {
  try {
    console.log('=== 编辑费用配置 ===', row.id);
    editingFeeId.value = row.id;
    
    // 获取详情数据用于回填表单
    const response = await getFeeItemDetail(row.id);
    
    if (response.code === 200) {
      const detail = response.data;
      
      // 回填表单数据
      editForm.id = detail.id;
      editForm.itemCode = detail.itemCode;
      editForm.itemName = detail.itemName;
      editForm.categoryId = detail.categoryId;
      editForm.standardPrice = detail.standardPrice;
      editForm.insurancePrice = detail.insurancePrice;
      editForm.costPrice = detail.costPrice;
      editForm.unit = detail.unit;
      editForm.insuranceType = detail.insuranceType;
      editForm.description = detail.description || "";
      editForm.isActive = detail.isActive;
      
      // 处理科室ID数组
      if (detail.departmentIds) {
        try {
          editForm.departmentIds = JSON.parse(detail.departmentIds);
        } catch (error) {
          console.warn('解析科室ID失败:', detail.departmentIds);
          editForm.departmentIds = [];
        }
      } else {
        editForm.departmentIds = [];
      }
      
      console.log('编辑表单数据回填完成:', editForm);
      showEditModal.value = true;
    } else {
      ElMessage.error(response.msg || '获取费用详情失败');
    }
  } catch (error) {
    console.error('获取费用详情失败:', error);
    ElMessage.error('获取费用详情失败，请重试');
  }
};

const deleteFeeConfig = (row) => {
  ElMessageBox.confirm(`确定要删除费用项目"${row.itemName}"吗？`, "删除确认", {
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const response = await deleteFeeItem(row.id);
      if (response.code === 200) {
        ElMessage.success("删除成功");
        loadFeeData(); // 重新加载数据
        loadStatsData(); // 更新统计数据
      } else {
        ElMessage.error(response.msg || "删除失败");
      }
    } catch (error) {
      console.error('删除费用项目失败:', error);
      ElMessage.error("删除失败，请重试");
    }
  }).catch(() => {
    ElMessage.info("已取消删除");
  });
};

const handleStatusChange = async (row) => {
  try {
    const response = await updateFeeItemStatus(row.id, row.isActive);
    if (response.code === 200) {
      const action = row.isActive === 1 ? "启用" : "停用";
      ElMessage.success(`已${action}费用项目"${row.itemName}"`);
      updateStats(); // 更新统计数据
    } else {
      // 恢复原状态
      row.isActive = row.isActive === 1 ? 0 : 1;
      ElMessage.error(response.msg || "状态更新失败");
    }
  } catch (error) {
    console.error('更新费用状态失败:', error);
    // 恢复原状态
    row.isActive = row.isActive === 1 ? 0 : 1;
    ElMessage.error("状态更新失败，请重试");
  }
};

const handleSizeChange = (size) => {
  pagination.page_size = size;
  pagination.current_page = 1;
  loadFeeData();
};

const handleCurrentChange = (page) => {
  pagination.current_page = page;
  loadFeeData();
};

// 批量删除相关方法
const handleSelectionChange = (selection) => {
  selectedFeeItems.value = selection;
  console.log('选中的费用项目:', selectedFeeItems.value.length);
};

const handleBatchDelete = () => {
  if (selectedFeeItems.value.length === 0) {
    ElMessage.warning('请先选择要删除的费用项目');
    return;
  }
  
  const selectedNames = selectedFeeItems.value.map(item => item.itemName).join('、');
  const message = selectedFeeItems.value.length === 1 
    ? `确定要删除费用项目"${selectedNames}"吗？`
    : `确定要批量删除以下 ${selectedFeeItems.value.length} 个费用项目吗？\n${selectedNames}`;
  
  ElMessageBox.confirm(message, "批量删除确认", {
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
    type: "warning",
    dangerouslyUseHTMLString: false,
  }).then(async () => {
    await performBatchDelete();
  }).catch(() => {
    ElMessage.info("已取消批量删除");
  });
};

const performBatchDelete = async () => {
  try {
    batchDeleteLoading.value = true;
    console.log('=== 执行批量删除 ===');
    
    const ids = selectedFeeItems.value.map(item => item.id);
    console.log('批量删除的ID列表:', ids);
    
    const response = await batchDeleteFeeItem(ids);
    
    if (response.code === 200) {
      ElMessage.success(`成功删除 ${selectedFeeItems.value.length} 个费用项目`);
      
      // 清空选择
      selectedFeeItems.value = [];
      
      // 重新加载数据
      loadFeeData();
      loadStatsData(); // 更新统计数据
    } else {
      ElMessage.error(response.msg || '批量删除失败');
    }
  } catch (error) {
    console.error('批量删除费用项目失败:', error);
    ElMessage.error('批量删除失败，请重试');
  } finally {
    batchDeleteLoading.value = false;
  }
};

// 格式化方法
const formatAmount = (amount) => {
  return Number(amount || 0).toFixed(2);
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
  try {
    const date = new Date(dateTime);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '-';
  }
};

const getCategoryTag = (categoryId) => {
  // 根据费用类型ID返回不同的标签类型
  const tagMap = {
    1: 'primary',   // 挂号费
    2: 'success',   // 检查费
    3: 'warning',   // 治疗费
    4: 'danger',    // 手术费
    5: 'info'       // 其他
  };
  return tagMap[categoryId] || 'info';
};

const getInsuranceTypeTag = (insuranceType) => {
  // 根据医保类型返回不同的标签类型
  const tagMap = {
    'A': 'success',   // 甲类
    'B': 'warning',   // 乙类
    'C': 'danger'     // 丙类
  };
  return tagMap[insuranceType] || 'info';
};

// 详情弹窗相关方法
const handleCloseDetail = () => {
  showDetailModal.value = false;
  feeDetail.value = null;
};

const editFeeFromDetail = () => {
  if (!feeDetail.value) return;
  
  console.log('=== 从详情页面进入编辑模式 ===');
  
  // 使用详情数据回填编辑表单
  const detail = feeDetail.value;
  editingFeeId.value = detail.id;
  
  editForm.id = detail.id;
  editForm.itemCode = detail.itemCode;
  editForm.itemName = detail.itemName;
  editForm.categoryId = detail.categoryId;
  editForm.standardPrice = detail.standardPrice;
  editForm.insurancePrice = detail.insurancePrice;
  editForm.costPrice = detail.costPrice;
  editForm.unit = detail.unit;
  editForm.insuranceType = detail.insuranceType;
  editForm.description = detail.description || "";
  editForm.isActive = detail.isActive;
  
  // 处理科室ID数组
  if (detail.departmentIds) {
    try {
      editForm.departmentIds = JSON.parse(detail.departmentIds);
    } catch (error) {
      console.warn('解析科室ID失败:', detail.departmentIds);
      editForm.departmentIds = [];
    }
  } else {
    editForm.departmentIds = [];
  }
  
  // 关闭详情弹窗，打开编辑弹窗
  showDetailModal.value = false;
  showEditModal.value = true;
};

// 新增弹窗相关方法
const resetAddForm = () => {
  Object.keys(addForm).forEach(key => {
    if (key === 'departmentIds') {
      addForm[key] = [];
    } else if (key === 'isActive') {
      addForm[key] = 1;
    } else {
      addForm[key] = "";
    }
  });
  
  // 清除表单验证
  if (addFormRef.value) {
    addFormRef.value.clearValidate();
  }
};

const handleCloseAdd = () => {
  showAddModal.value = false;
  resetAddForm();
};

// 编辑弹窗相关方法
const resetEditForm = () => {
  Object.keys(editForm).forEach(key => {
    if (key === 'departmentIds') {
      editForm[key] = [];
    } else if (key === 'isActive') {
      editForm[key] = 1;
    } else {
      editForm[key] = "";
    }
  });
  
  // 清除表单验证
  if (editFormRef.value) {
    editFormRef.value.clearValidate();
  }
};

const handleCloseEdit = () => {
  showEditModal.value = false;
  resetEditForm();
  editingFeeId.value = null;
};

// 提交编辑表单
const handleSubmitEdit = async () => {
  try {
    // 表单验证
    const valid = await editFormRef.value.validate();
    if (!valid) return;
    
    editLoading.value = true;
    console.log('=== 提交编辑费用表单 ===');
    
    // 构建请求数据
    const formData = {
      id: editForm.id,
      itemCode: editForm.itemCode.trim(),
      itemName: editForm.itemName.trim(),
      categoryId: editForm.categoryId,
      standardPrice: parseFloat(editForm.standardPrice),
      insurancePrice: parseFloat(editForm.insurancePrice),
      costPrice: parseFloat(editForm.costPrice),
      unit: editForm.unit.trim(),
      insuranceType: editForm.insuranceType,
      departmentIds: JSON.stringify(editForm.departmentIds),
      description: editForm.description.trim(),
      isActive: editForm.isActive
    };
    
    console.log('编辑费用请求数据:', formData);
    
    const response = await updateFeeItem(formData);
    
    if (response.code === 200) {
      ElMessage.success('更新费用项目成功');
      handleCloseEdit();
      loadFeeData(); // 重新加载列表
      loadStatsData(); // 更新统计数据
    } else {
      ElMessage.error(response.msg || '更新费用项目失败');
    }
  } catch (error) {
    console.error('更新费用项目失败:', error);
    ElMessage.error('更新费用项目失败，请重试');
  } finally {
    editLoading.value = false;
  }
};

// 提交新增表单
const handleSubmitAdd = async () => {
  try {
    // 表单验证
    const valid = await addFormRef.value.validate();
    if (!valid) return;
    
    addLoading.value = true;
    console.log('=== 提交新增费用表单 ===');
    
    // 构建请求数据
    const formData = {
      itemCode: addForm.itemCode.trim(),
      itemName: addForm.itemName.trim(),
      categoryId: addForm.categoryId,
      standardPrice: parseFloat(addForm.standardPrice),
      insurancePrice: parseFloat(addForm.insurancePrice),
      costPrice: parseFloat(addForm.costPrice),
      unit: addForm.unit.trim(),
      insuranceType: addForm.insuranceType,
      departmentIds: JSON.stringify(addForm.departmentIds),
      description: addForm.description.trim(),
      isActive: addForm.isActive
    };
    
    console.log('新增费用请求数据:', formData);
    
    const response = await addFeeItem(formData);
    
    if (response.code === 200) {
      ElMessage.success('新增费用项目成功');
      handleCloseAdd();
      loadFeeData(); // 重新加载列表
      loadStatsData(); // 更新统计数据
    } else {
      ElMessage.error(response.msg || '新增费用项目失败');
    }
  } catch (error) {
    console.error('新增费用项目失败:', error);
    ElMessage.error('新增费用项目失败，请重试');
  } finally {
    addLoading.value = false;
  }
};

// 获取详情页面的科室列表（返回完整的科室信息）
const getDetailDepartmentList = (departmentIds) => {
  if (!departmentIds) return [];
  
  try {
    const ids = JSON.parse(departmentIds);
    if (!Array.isArray(ids) || ids.length === 0) return [];
    
    return ids.map(id => {
      const dept = department_options.value.find(d => d.value === id);
      return dept || { value: id, label: `未知科室(ID:${id})` };
    }).filter(Boolean);
  } catch (error) {
    console.warn('解析详情科室ID失败:', departmentIds, error);
    return [];
  }
};

// 格式化科室名称显示
const formatDepartmentNames = (departmentIds) => {
  if (!departmentIds) return '-';
  
  try {
    // 解析JSON字符串为数组
    const ids = JSON.parse(departmentIds);
    if (!Array.isArray(ids) || ids.length === 0) return '-';
    
    console.log('解析科室IDs:', ids);
    console.log('可用科室选项:', department_options.value);
    
    // 根据ID查找对应的科室名称
    const names = ids.map(id => {
      const dept = department_options.value.find(d => d.value === id);
      console.log(`查找科室ID ${id}:`, dept);
      return dept ? dept.label : `未知科室(ID:${id})`;
    });
    
    console.log('映射后的科室名称:', names);
    
    // 如果科室太多，只显示前3个，其余用"等N个科室"表示
    if (names.length <= 3) {
      return names.join('、');
    } else {
      return `${names.slice(0, 3).join('、')} 等${names.length}个科室`;
    }
  } catch (error) {
    console.warn('解析科室ID失败:', departmentIds, error);
    return departmentIds;
  }
};

// 重置筛选条件并重新加载数据
const resetFilters = () => {
  filters.itemName = "";
  filters.categoryId = "";
  filters.isActive = "";
  filters.departmentIds = []; // 重置为空数组
  pagination.current_page = 1;
  loadFeeData();
};

// 页面初始化
onMounted(async () => {
  console.log('=== 费用配置页面初始化 ===');
  
  // 并行加载基础数据
  await Promise.all([
    loadFeeCategoryList(),
    loadDepartmentList(),
    loadStatsData()
  ]);
  
  // 加载费用列表数据
  await loadFeeData();
  
  console.log('=== 费用配置页面初始化完成 ===');
});
</script>

<style lang="scss" scoped>
// 变量定义
$primary: #409eff;
$success: #67c23a;
$warning: #e6a23c;
$danger: #f56c6c;
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

        &.fee-type { background: rgba($primary, 0.1); color: $primary; }
        &.active { background: rgba($success, 0.1); color: $success; }
        &.inactive { background: rgba($danger, 0.1); color: $danger; }
        &.updated { background: rgba($warning, 0.1); color: $warning; }
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

  // 费用表格
  .fee-table {
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
        
        .selection-info {
          font-size: 14px;
          font-weight: 400;
          color: $primary;
          margin-left: 8px;
        }
      }

      .table-tools {
        display: flex;
        gap: 12px;
      }
    }

    .table-scroll {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid $border;
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

// 操作按钮样式
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

    .amount {
      font-weight: 600;
      color: $primary;
    }
    
    .department-names {
      color: #606266;
      font-size: 13px;
      line-height: 1.4;
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
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

// 费用详情弹窗样式
.fee-detail-content {
  .detail-info {
    .info-section {
      margin-bottom: 24px;
      
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: $text;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #f0f0f0;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        
        .info-item {
          display: flex;
          align-items: center;
          
          label {
            font-weight: 500;
            color: #606266;
            min-width: 80px;
            margin-right: 8px;
          }
          
          .info-value {
            color: $text;
            
            &.code {
              font-family: 'Courier New', monospace;
              background: #f5f7fa;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 13px;
            }
            
            &.name {
              font-weight: 600;
              color: $primary;
            }
          }
        }
      }
      
      // 价格信息网格
      .price-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        
        .price-item {
          text-align: center;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e4e7ed;
          
          .price-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }
          
          .price-value {
            font-size: 20px;
            font-weight: 600;
          }
          
          &.standard {
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            .price-value { color: $primary; }
          }
          
          &.insurance {
            background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
            .price-value { color: $success; }
          }
          
          &.cost {
            background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%);
            .price-value { color: $warning; }
          }
        }
      }
      
      // 科室标签
      .department-list {
        .department-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          
          .department-tag {
            margin: 0;
          }
          
          .no-departments {
            color: #c0c4cc;
            font-style: italic;
          }
        }
      }
      
      // 描述信息
      .description-content {
        background: #f8f9fa;
        padding: 16px;
        border-radius: 6px;
        border-left: 4px solid $primary;
        color: $text;
        line-height: 1.6;
      }
    }
  }
}

// 对话框底部
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 新增表单样式
.add-fee-form,
.edit-fee-form {
  .form-grid {
    .form-section {
      margin-bottom: 32px;
      
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: $text;
        margin: 0 0 20px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #f0f0f0;
      }
      
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 16px;
        
        .form-item {
          margin-bottom: 0;
        }
      }
      
      // 单列表单项
      .el-form-item:not(.form-item) {
        margin-bottom: 20px;
      }
    }
  }
  
  // 表单项样式优化
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }
  
  :deep(.el-input__inner) {
    border-radius: 6px;
  }
  
  :deep(.el-select) {
    .el-input__inner {
      border-radius: 6px;
    }
  }
  
  :deep(.el-input-number) {
    .el-input__inner {
      border-radius: 6px;
    }
  }
  
  :deep(.el-textarea__inner) {
    border-radius: 6px;
    resize: vertical;
  }
  
  // 价格输入框特殊样式
  .form-section:nth-child(2) {
    .el-input-number {
      :deep(.el-input__inner) {
        text-align: right;
        font-weight: 500;
        color: $primary;
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .fee-detail-content {
    .detail-info {
      .info-section {
        .info-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        
        .price-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
      }
    }
  }
  
  .add-fee-form,
  .edit-fee-form {
    .form-grid {
      .form-section {
        .form-row {
          grid-template-columns: 1fr;
          gap: 16px;
        }
      }
    }
  }
}
</style>