<template>
  <div class="manager-container">
    <AdminHeader
      :username="username"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @logout="handleLogout"
    />
    <SideLeft :is-open="sidebarOpen" />
    <div class="content-area" :class="{ 'sidebar-open': sidebarOpen }">
        <!-- 统计卡片 -->
        <div class="stats-cards">
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
                v-model="filters.item_name"
                placeholder="请输入费用名称"
                clearable
              />
            </div>
            <div class="filter-item">
              <div class="filter-label">费用类型</div>
              <el-select
                v-model="filters.category_id"
                placeholder="请选择费用类型"
                clearable
              >
                <el-option
                  v-for="cate in fee_category_options"
                  :key="cate.value"
                  :label="cate.label"
                  :value="cate.value"
                ></el-option>
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
            <div class="filter-item">
              <div class="filter-label">科室</div>
              <el-select
                v-model="filters.department_ids"
                placeholder="请选择科室"
                clearable
                filterable
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
            <div class="table-title">费用配置列表</div>
            <div class="table-tools">
              <el-button @click="refreshData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
  
          <!-- 新增：可横向滚动的表格容器，超出宽度时只在此处出现横向滚动 -->
          <div class="table-scroll">
            <el-table class="fee-config-table" :data="fee_configs" stripe>
              <el-table-column type="selection" width="55" />
              <el-table-column prop="item_code" label="费用编码" width="120" />
              <el-table-column prop="item_name" label="费用名称" min-width="180" />
              <el-table-column label="费用类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="get_category_tag(row.category_id)" size="small">
                    {{ format_fee_category(row.category_id) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="标准价格" width="120">
                <template #default="{ row }">
                  <span class="amount"
                    >¥{{ format_amount(row.standard_price) }}</span
                  >
                </template>
              </el-table-column>
              <el-table-column label="医保价格" width="120">
                <template #default="{ row }">
                  ¥{{ format_amount(row.insurance_price) }}
                </template>
              </el-table-column>
              <el-table-column label="成本价格" width="120">
                <template #default="{ row }">
                  ¥{{ format_amount(row.cost_price) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="department_names"
                label="适用科室"
                width="150"
              />
              <el-table-column label="状态" width="80">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.is_active"
                    :active-value="1"
                    :inactive-value="0"
                    @change="handle_status_change(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="update_time" label="更新时间" width="160" />
              <el-table-column label="操作" width="280" fixed="right">
                <template #default="{ row }">
                  <div class="action-buttons-cell">
                    <el-button size="small" @click="viewFeeDetails(row)"
                      >详情</el-button
                    >
                    <el-button
                      size="small"
                      type="primary"
                      @click="editFeeConfig(row)"
                      >编辑</el-button
                    >
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteFeeConfig(row)"
                      >删除</el-button
                    >
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
  
      <!-- 费用配置对话框 -->
      <el-dialog
        v-model="fee_dialog.visible"
        :title="fee_dialog.is_edit ? '编辑费用配置' : '新增费用配置'"
        width="800px"
      >
        <el-form
          :model="item_form"
          label-width="100px"
          :rules="item_rules"
          ref="item_form_ref"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="费用编码" prop="item_code">
                <el-input
                  v-model="item_form.item_code"
                  placeholder="自动生成或手动输入"
                  :disabled="fee_dialog.is_edit"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="费用名称" prop="item_name">
                <el-input
                  v-model="item_form.item_name"
                  placeholder="请输入费用名称"
                />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="费用类型" prop="category_id">
                <el-select
                  v-model="item_form.category_id"
                  placeholder="请选择费用类型"
                  @change="handle_category_change"
                >
                  <el-option
                    v-for="cate in fee_category_options"
                    :key="cate.value"
                    :label="cate.label"
                    :value="cate.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="适用科室" prop="department_ids">
                <el-select
                  v-model="item_form.department_ids"
                  placeholder="请选择适用科室"
                  filterable
                  multiple
                  collapse-tags
                >
                  <el-option
                    v-for="dept in department_options"
                    :key="dept.value"
                    :label="dept.label"
                    :value="dept.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="标准价格" prop="standard_price">
                <el-input-number
                  v-model="item_form.standard_price"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="医保价格" prop="insurance_price">
                <el-input-number
                  v-model="item_form.insurance_price"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="成本价格" prop="cost_price">
                <el-input-number
                  v-model="item_form.cost_price"
                  :min="0"
                  :precision="2"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="计价单位" prop="unit">
                <el-input v-model="item_form.unit" placeholder="如：次、项、盒等" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="医保类别" prop="insurance_type">
                <el-select
                  v-model="item_form.insurance_type"
                  placeholder="请选择医保类别"
                >
                  <el-option label="甲类" value="A" />
                  <el-option label="乙类" value="B" />
                  <el-option label="丙类" value="C" />
                  <el-option label="自费" value="self" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-form-item label="费用说明" prop="description">
            <el-input
              v-model="item_form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入费用详细说明"
            />
          </el-form-item>
  
          <el-form-item label="状态" prop="is_active">
            <el-radio-group v-model="item_form.is_active">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="fee_dialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submit_item_form">确认</el-button>
        </template>
      </el-dialog>
  
      <!-- 费用详情抽屉 -->
      <el-drawer
        v-model="detail_drawer.visible"
        title="费用详情"
        :direction="'rtl'"
        size="40%"
      >
        <div class="fee-detail" v-if="current_item">
          <div class="detail-header">
            <h3>{{ current_item.item_name }}</h3>
            <el-tag :type="current_item.is_active === 1 ? 'success' : 'info'">
              {{ current_item.is_active === 1 ? "启用" : "停用" }}
            </el-tag>
          </div>
  
          <el-divider />
  
          <div class="detail-section">
            <h4>基本信息</h4>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="费用编码">{{
                current_item.item_code
              }}</el-descriptions-item>
              <el-descriptions-item label="费用类型">{{
                format_fee_category(current_item.category_id)
              }}</el-descriptions-item>
              <el-descriptions-item label="适用科室">{{
                current_item.department_names
              }}</el-descriptions-item>
              <el-descriptions-item label="计价单位">{{
                current_item.unit
              }}</el-descriptions-item>
              <el-descriptions-item label="医保类别">{{
                format_insurance_type(current_item.insurance_type)
              }}</el-descriptions-item>
            </el-descriptions>
          </div>
  
          <div class="detail-section">
            <h4>价格信息</h4>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="标准价格"
                >¥{{
                  format_amount(current_item.standard_price)
                }}</el-descriptions-item
              >
              <el-descriptions-item label="医保价格"
                >¥{{
                  format_amount(current_item.insurance_price)
                }}</el-descriptions-item
              >
              <el-descriptions-item label="成本价格"
                >¥{{ format_amount(current_item.cost_price) }}</el-descriptions-item
              >
            </el-descriptions>
          </div>
  
          <div class="detail-section" v-if="current_item.description">
            <h4>费用说明</h4>
            <p>{{ current_item.description }}</p>
          </div>
  
          <div class="detail-section">
            <h4>操作记录</h4>
            <el-timeline>
              <el-timeline-item
                v-for="record in current_item.operation_records"
                :key="record.id"
                :timestamp="record.time"
              >
                {{ record.action }} - {{ record.operator }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </el-drawer>
  
      <!-- 批量导入对话框 -->
      <el-dialog
        v-model="import_dialog.visible"
        title="批量导入费用配置"
        width="500px"
      >
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          accept=".xlsx,.xls"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">只能上传 xlsx/xls 文件，且不超过10MB</div>
          </template>
        </el-upload>
  
        <div class="import-template">
          <el-button type="text" @click="downloadTemplate">下载导入模板</el-button>
        </div>
  
        <template #footer>
          <el-button @click="import_dialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleImport">开始导入</el-button>
        </template>
      </el-dialog>
    </div>
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
  getDepartmentList,
  getFeeCateList,
  addFeeItem,
  editFeeItem,
  getFeeItemPagerDataBySearch,
  statsFeeItemCount,
} from "@/api/api";

const filters = reactive({
  item_name: "",
  category_id: "",
  is_active: "",
  department_ids: "",
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

// 科室选项
const department_options = ref([]);
// 费用类型选项
const fee_category_options = ref([]);

// 费用配置数据（数组，字段与表保持一致）
const fee_configs = ref([]);

// 对话框控制
const fee_dialog = reactive({
  visible: false,
  is_edit: false,
});

// 表单模型（使用与 h_fee_item_tb 一致的字段名）
const item_form = reactive({
  item_id: null,
  item_code: "",
  item_name: "",
  category_id: "",
  department_ids: [], // 前端使用数组，提交时转为逗号字符串
  standard_price: 0,
  insurance_price: 0,
  cost_price: 0,
  unit: "次",
  insurance_type: "B",
  description: "",
  is_active: 1,
});

const item_rules = {
  item_code: [{ required: true, message: "请输入费用编码", trigger: "blur" }],
  item_name: [{ required: true, message: "请输入费用名称", trigger: "blur" }],
  category_id: [
    { required: true, message: "请选择费用类型", trigger: "change" },
  ],
  standard_price: [
    { required: true, message: "请输入标准价格", trigger: "blur" },
  ],
  unit: [{ required: true, message: "请输入计价单位", trigger: "blur" }],
};

const item_form_ref = ref(null);

const detail_drawer = reactive({
  visible: false,
});

const current_item = ref(null);

const import_dialog = reactive({
  visible: false,
});

const sidebarOpen = ref(false);
const router = useRouter();
const store = useStore();

const username = ref(store.state.user?.username || "管理员");

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

const resetFilters = () => {
  filters.item_name = "";
  filters.category_id = "";
  filters.is_active = "";
  filters.department_ids = "";
  load_fee_configs();
};

const searchFees = () => {
  pagination.current_page = 1;
  load_fee_configs();
};

// 加载统计数据
const load_stats = async () => {
  try {
    const response = await statsFeeItemCount();
    console.log("统计数据:", response);
    if (response.code == 200) {
      if (response.data) {
        stats.totalCount = response.data.totalCount || 0;
        stats.activeCount = response.data.activeCount || 0;
        stats.inactiveCount = response.data.inactiveCount || 0;
        stats.todayUpdateCount = response.data.todayUpdateCount || 0;
      }
    } else {
      ElMessage.error(response.message || "获取统计数据失败");
    }
  } catch (error) {
    console.error("加载统计数据失败:", error);
  }
};

// 加载科室列表
const load_departments_list = async () => {
  try {
    const response = await getDepartmentList();
    department_options.value = response.data.map((dept) => ({
      label: dept.department_name,
      value: dept.department_id,
    }));
    // TODO: 调用后端接口 getDepartmentList() 并赋值 department_options
  } catch (error) {
    console.error("加载科室列表失败:", error);
  }
};

// 加载费用类型列表（value 使用 category_id）
const load_fee_cate_list = async () => {
  try {
    const response = await getFeeCateList();
    fee_category_options.value = response.data.map((cate) => ({
      label: cate.category_name,
      value: cate.category_id,
    }));
    // TODO: 调用后端接口 getFeeCateList() 并赋值 fee_category_options
  } catch (error) {
    console.error("加载费用类型列表失败:", error);
  }
};

const load_fee_configs = async () => {
  // TODO: 推荐使用后端分页接口 getFeeItemPagerDataBySearch(filters, pagination) 获取数据
  // 示例（伪代码）：
  let mockData = [];

  const payload = {
    item_name: filters.item_name,
    category_id: filters.category_id,
    is_active: filters.is_active,
    department_ids: filters.department_ids, // 根据后端接口名调整
    currentPage: pagination.current_page,
    pageSize: pagination.page_size,
  };
  const res = await getFeeItemPagerDataBySearch(payload);
  if (res.code == 200) {
    mockData = res.data.data;
    pagination.total = res.data.pageTotal;
  } else {
    ElMessage.error(res.message || "获取费用配置失败");
    return;
  }

  let filteredData = mockData;

  if (filters.item_name) {
    filteredData = filteredData.filter(
      (item) => item.item_name && item.item_name.includes(filters.item_name)
    );
  }

  if (filters.category_id) {
    filteredData = filteredData.filter(
      (item) => item.category_id === filters.category_id
    );
  }

  if (
    filters.is_active !== "" &&
    filters.is_active !== null &&
    filters.is_active !== undefined
  ) {
    filteredData = filteredData.filter(
      (item) => item.is_active === filters.is_active
    );
  }

  if (filters.department_ids) {
    filteredData = filteredData.filter((item) => {
      if (!item.department_ids) return false;
      const deptIds = String(item.department_ids)
        .split(",")
        .map((x) => String(x));
      return deptIds.includes(String(filters.department_ids));
    });
  }

  fee_configs.value = filteredData;
  pagination.total = filteredData.length;
};

const handleSizeChange = (size) => {
  pagination.page_size = size;
  load_fee_configs();
};

const handleCurrentChange = (page) => {
  pagination.current_page = page;
  load_fee_configs();
};

const showCreateFeeDialog = () => {
    Object.assign(item_form, {
      item_id: null,
      item_code: `FEE${Date.now().toString().slice(-6)}`,
      item_name: "",
      category_id: "",
      department_ids: [],
      standard_price: 0,
      insurance_price: 0,
      cost_price: 0,
      unit: "次",
      insurance_type: "B",
      description: "",
      is_active: 1,
    });
    fee_dialog.is_edit = false;
    fee_dialog.visible = true;
  };
  
  const editFeeConfig = (row) => {
    Object.assign(item_form, {
      item_id: row.item_id || null,
      item_code: row.item_code,
      item_name: row.item_name,
      category_id: row.category_id,
      department_ids: Array.isArray(row.department_ids)
        ? row.department_ids
        : row.department_ids
        ? String(row.department_ids).split(",")
        : [],
      standard_price: row.standard_price || 0,
      insurance_price: row.insurance_price || 0,
      cost_price: row.cost_price || 0,
      unit: row.unit || "次",
      insurance_type: row.insurance_type || "B",
      description: row.description || "",
      is_active: typeof row.is_active !== "undefined" ? row.is_active : 1,
    });
    fee_dialog.is_edit = true;
    fee_dialog.visible = true;
  };
  
  const viewFeeDetails = (row) => {
    current_item.value = row;
    detail_drawer.visible = true;
  };
  
  const deleteFeeConfig = (row) => {
    ElMessageBox.confirm(`确定要删除费用项目"${row.item_name}"吗？`, "删除确认", {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        // TODO: 在此调用后端删除接口，例如 await deleteFeeItem({ item_id: row.item_id });
        ElMessage.success("删除成功");
        load_fee_configs();
      })
      .catch(() => {
        ElMessage.info("已取消删除");
      });
  };
  
  const handle_status_change = (row) => {
    const action = row.is_active === 1 ? "启用" : "停用";
    // TODO: 在此调用后端接口更新 is_active，例如 await editFeeItem({ item_id: row.item_id, is_active: row.is_active });
    ElMessage.success(`已${action}费用项目"${row.item_name}"`);
  };
  
  const handle_category_change = (categoryId) => {
    // 若后端返回类别名称并需要根据类别设置单位，可在此扩展逻辑
    item_form.unit = item_form.unit || "次";
  };
  
  const submit_item_form = async () => {
    try {
      await item_form_ref.value.validate();
  
      const payload = {
        // 直接使用与表对应的字段名
        item_id: item_form.item_id,
        item_code: item_form.item_code,
        item_name: item_form.item_name,
        category_id: item_form.category_id,
        department_ids: Array.isArray(item_form.department_ids)
          ? item_form.department_ids.join(",")
          : item_form.department_ids || "",
        standard_price: item_form.standard_price,
        insurance_price: item_form.insurance_price,
        cost_price: item_form.cost_price,
        unit: item_form.unit,
        insurance_type: item_form.insurance_type,
        description: item_form.description,
        is_active: item_form.is_active,
      };
  
      if (fee_dialog.is_edit) {
        // TODO: 调用后端编辑接口，例如： await editFeeItem(payload);
        const res = await editFeeItem(payload);
        if (res.code == 200) {
          ElMessage.success("费用配置更新成功");
        } else {
          ElMessage.error(res.message || "费用配置更新失败");
          return;
        }
      } else {
        // TODO: 调用后端新增接口，例如： await addFeeItem(payload);
        const res = await addFeeItem(payload);
        if (res.code == 200) {
          ElMessage.success("费用配置新增成功");
        } else {
          ElMessage.error(res.message || "费用配置新增失败");
          return;
        }
      }
  
      fee_dialog.visible = false;
      load_fee_configs();
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };
  
  const showImportDialog = () => {
    import_dialog.visible = true;
  };
  
  const handleFileChange = (file) => {
    console.log("文件选择:", file);
  };
  
  const handleImport = () => {
    // TODO: 解析上传文件并调用后端批量导入接口；示例： await importFeeItems(formData)
    ElMessage.success("批量导入成功");
    import_dialog.visible = false;
    load_fee_configs();
  };
  
  const downloadTemplate = () => {
    ElMessage.info("开始下载导入模板");
  };
  
  const exportFeeTemplate = () => {
    // TODO: 调用后端导出接口并触发文件下载
    ElMessage.success("费用模板导出成功");
  };
  
  const refreshData = () => {
    load_fee_configs();
    ElMessage.success("数据已刷新");
  };
  
  const format_amount = (amount) => {
    return Number(amount || 0).toFixed(2);
  };
  
  const format_fee_category = (category_id) => {
    const found = fee_category_options.value.find((c) => c.value === category_id);
    return found ? found.label : category_id || "";
  };
  
  const format_insurance_type = (type) => {
    const typeMap = {
      A: "甲类",
      B: "乙类",
      C: "丙类",
      self: "自费",
    };
    return typeMap[type] || type;
  };
  
  const get_category_tag = (category_id) => {
    const found = fee_category_options.value.find((c) => c.value === category_id);
    if (!found) return "info";
    const name = found.label || "";
    if (name.includes("药") || name.includes("药品")) return "danger";
    if (name.includes("手术")) return "error";
    if (name.includes("住院")) return "warning";
    if (name.includes("挂号")) return "success";
    return "info";
  };
  
  onMounted(() => {
    load_stats();
    load_departments_list();
    load_fee_cate_list();
    load_fee_configs();
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
    margin-left: 0;
    margin-top: 72px;
    min-height: calc(100vh - 72px);
    background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 50%, #d1edff 100%);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    padding: 30px;
    transition: margin-left 0.3s ease;
    
    &.sidebar-open {
      margin-left: 260px;
    }
  
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
        }
  
        .table-tools {
          display: flex;
          gap: 12px;
        }
      }
  
      // 表格滚动容器
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
  
  // Element Plus 组件样式覆盖
  :deep(.el-input) {
    .el-input__wrapper {
      border-radius: 8px;
      transition: all 0.3s ease;
  
      &:hover {
        box-shadow: 0 0 0 1px $primary;
      }
  
      &.is-focus {
        box-shadow: 0 0 0 2px rgba($primary, 0.2);
      }
    }
  }
  
  :deep(.el-select) {
    .el-select__wrapper {
      border-radius: 8px;
      transition: all 0.3s ease;
  
      &:hover {
        box-shadow: 0 0 0 1px $primary;
      }
  
      &.is-focus {
        box-shadow: 0 0 0 2px rgba($primary, 0.2);
      }
    }
  }
  
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
    }
  }
  
  :deep(.el-pagination) {
    .el-pager li {
      border-radius: 6px;
      margin: 0 2px;
  
      &.is-active {
        background: $primary;
        color: white;
      }
  
      &:hover:not(.is-active) {
        background: rgba($primary, 0.1);
        color: $primary;
      }
    }
  
    .btn-prev, .btn-next {
      border-radius: 6px;
      margin: 0 2px;
  
      &:hover:not(:disabled) {
        background: rgba($primary, 0.1);
        color: $primary;
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
  
      .el-dialog__headerbtn .el-dialog__close {
        color: white;
        font-size: 20px;
  
        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
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
  
  :deep(.el-drawer) {
    .el-drawer__header {
      background: linear-gradient(135deg, $primary 0%, #66b1ff 100%);
      color: white;
      padding: 20px 24px;
      margin-bottom: 0;
  
      .el-drawer__title {
        font-weight: 600;
        font-size: 18px;
      }
  
      .el-drawer__close-btn {
        color: white;
        font-size: 20px;
  
        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  
    .el-drawer__body {
      padding: 24px;
  
      .fee-detail {
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
  
          h3 {
            margin: 0;
            font-size: 20px;
            color: $text;
          }
        }
  
        .detail-section {
          margin-bottom: 24px;
  
          h4 {
            font-size: 16px;
            font-weight: 600;
            color: $text;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid $primary;
          }
  
          p {
            line-height: 1.6;
            color: #666;
            margin: 0;
          }
        }
      }
    }
  }
  
  :deep(.el-upload-dragger) {
    border-radius: 12px;
    border: 2px dashed $border;
    transition: all 0.3s ease;
  
    &:hover {
      border-color: $primary;
      background: rgba($primary, 0.05);
    }
  }
  
  :deep(.el-tag) {
    border-radius: 12px;
    font-weight: 500;
  }
  
  :deep(.el-switch .el-switch__core) {
    border-radius: 12px;
  }
  
  // 响应式设计
  @media (max-width: 768px) {
    .content-area {
      margin-left: 0 !important;
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
  
      .fee-table {
        .table-header {
          flex-direction: column;
          gap: 16px;
          align-items: stretch;
  
          .table-tools {
            justify-content: center;
          }
        }
  
        .table-scroll {
          :deep(.fee-config-table) {
            min-width: 800px;
          }
        }
      }
    }
  }
  
  @media (max-width: 1200px) {
    .content-area.sidebar-open {
      margin-left: 200px;
    }
    
    .stats-cards {
      :deep(.el-row .el-col) {
        margin-bottom: 16px;
      }
    }
  }
  </style>