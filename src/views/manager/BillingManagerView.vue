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
              <div class="stat-icon income">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">
                  ¥{{ formatAmount(stats.totalIncome) }}
                </div>
                <div class="stat-label">今日收入</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.pendingCount }}</div>
                <div class="stat-label">待收费</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon completed">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.completedCount }}</div>
                <div class="stat-label">已收费</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon refund">
                <el-icon><Refresh /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.refundCount }}</div>
                <div class="stat-label">退款单</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
  
      <!-- 筛选卡片 -->
      <div class="filter-card">
        <div class="filter-row">
          <div class="filter-item">
            <div class="filter-label">患者姓名</div>
            <el-input
              v-model="filters.patientName"
              placeholder="请输入患者姓名"
              clearable
            />
          </div>
          <div class="filter-item">
            <div class="filter-label">病历号</div>
            <el-input
              v-model="filters.medicalRecordNo"
              placeholder="请输入病历号"
              clearable
            />
          </div>
          <div class="filter-item">
            <div class="filter-label">收费状态</div>
            <el-select
              v-model="filters.paymentStatus"
              placeholder="请选择状态"
              clearable
            >
              <el-option label="待收费" value="pending" />
              <el-option label="已收费" value="completed" />
              <el-option label="已退款" value="refunded" />
              <el-option label="部分退款" value="partial_refund" />
            </el-select>
          </div>
          <div class="filter-item">
            <div class="filter-label">收费类型</div>
            <el-select
              v-model="filters.paymentType"
              placeholder="请选择类型"
              clearable
            >
              <el-option label="门诊收费" value="outpatient" />
              <el-option label="住院收费" value="inpatient" />
              <el-option label="药品收费" value="medicine" />
              <el-option label="检查收费" value="examination" />
              <el-option label="治疗收费" value="treatment" />
            </el-select>
          </div>
          <div class="filter-item">
            <div class="filter-label">日期范围</div>
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="action-buttons">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="searchPayments">查询</el-button>
          <el-button type="success" @click="showCreatePaymentDialog">
            <el-icon><Plus /></el-icon>
            新建收费
          </el-button>
          <el-button type="warning" @click="exportStatement">
            <el-icon><Document /></el-icon>
            导出对账单
          </el-button>
        </div>
      </div>
  
      <!-- 收费表格 -->
      <div class="payment-table">
        <div class="table-header">
          <div class="table-title">收费记录</div>
          <div class="table-tools">
            <el-button type="primary" @click="exportData">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
  
        <el-table :data="payments" style="width: 100%" stripe>
          <el-table-column type="selection" width="55" />
          <el-table-column prop="paymentNo" label="收费单号" width="140" />
          <el-table-column label="患者信息" min-width="180">
            <template #default="{ row }">
              <div class="patient-info">
                <div class="patient-avatar">
                  <el-avatar :size="40" :src="row.patientAvatar" />
                </div>
                <div>
                  <div>{{ row.patientName }}</div>
                  <div style="font-size: 12px; color: #909399">
                    {{ row.medicalRecordNo }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="paymentType" label="收费类型" width="100">
            <template #default="{ row }">
              {{ formatPaymentType(row.paymentType) }}
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120">
            <template #default="{ row }">
              <span class="amount">¥{{ formatAmount(row.amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="应收金额" width="120">
            <template #default="{ row }">
              ¥{{ formatAmount(row.payableAmount) }}
            </template>
          </el-table-column>
          <el-table-column label="优惠金额" width="120">
            <template #default="{ row }">
              ¥{{ formatAmount(row.discountAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.paymentStatus)" size="small">
                {{ formatPaymentStatus(row.paymentStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons-cell">
                <el-button size="small" @click="viewPaymentDetails(row)"
                  >详情</el-button
                >
                <el-button
                  size="small"
                  type="primary"
                  :disabled="row.paymentStatus !== 'pending'"
                  @click="processPayment(row)"
                >
                  {{ row.paymentStatus === "pending" ? "收费" : "已收费" }}
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  :disabled="row.paymentStatus !== 'completed'"
                  @click="showRefundDialog(row)"
                >
                  退款
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
  
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  
    <!-- 新建收费对话框 -->
    <el-dialog
      v-model="paymentDialog.visible"
      :title="paymentDialog.isEdit ? '编辑收费信息' : '新建收费'"
      width="800px"
    >
      <el-form
        :model="paymentForm"
        label-width="100px"
        :rules="paymentRules"
        ref="paymentFormRef"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="患者选择" prop="patientId">
              <el-select
                v-model="paymentForm.patientId"
                placeholder="请选择患者"
                filterable
                @change="handlePatientChange"
              >
                <el-option
                  v-for="patient in patientOptions"
                  :key="patient.value"
                  :label="`${patient.label} (${patient.medicalRecordNo})`"
                  :value="patient.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收费类型" prop="paymentType">
              <el-select
                v-model="paymentForm.paymentType"
                placeholder="请选择收费类型"
              >
                <el-option label="门诊收费" value="outpatient" />
                <el-option label="住院收费" value="inpatient" />
                <el-option label="药品收费" value="medicine" />
                <el-option label="检查收费" value="examination" />
                <el-option label="治疗收费" value="treatment" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-divider>费用明细</el-divider>
  
        <el-table
          :data="paymentForm.items"
          style="width: 100%; margin-bottom: 16px"
          border
        >
          <el-table-column label="项目名称" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.itemName" placeholder="输入项目名称" />
            </template>
          </el-table-column>
          <el-table-column label="规格" width="120">
            <template #default="{ row }">
              <el-input v-model="row.specification" placeholder="规格" />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="100">
            <template #default="{ row }">
              <el-input-number
                v-model="row.unitPrice"
                :min="0"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="数量" width="80">
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantity"
                :min="1"
                :precision="0"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="金额" width="100">
            <template #default="{ row }">
              ¥{{ formatAmount((row.unitPrice || 0) * (row.quantity || 1)) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" size="small" @click="removeItem($index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
  
        <el-button type="primary" @click="addItem" style="margin-bottom: 16px">
          <el-icon><Plus /></el-icon>
          添加项目
        </el-button>
  
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="应收金额">
              <span class="summary-amount">¥{{ formatAmount(totalAmount) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优惠金额" prop="discountAmount">
              <el-input-number
                v-model="paymentForm.discountAmount"
                :min="0"
                :max="totalAmount"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实收金额">
              <span class="summary-amount actual">
                ¥{{
                  formatAmount(totalAmount - (paymentForm.discountAmount || 0))
                }}
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-select
                v-model="paymentForm.paymentMethod"
                placeholder="请选择支付方式"
              >
                <el-option label="现金" value="cash" />
                <el-option label="银行卡" value="card" />
                <el-option label="微信支付" value="wechat" />
                <el-option label="支付宝" value="alipay" />
                <el-option label="医保结算" value="insurance" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="paymentForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="paymentDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitPaymentForm">确认</el-button>
      </template>
    </el-dialog>
  
    <!-- 退款对话框 -->
    <el-dialog v-model="refundDialog.visible" title="退款处理" width="500px">
      <el-form :model="refundForm" label-width="100px">
        <el-form-item label="退款单号">
          {{ refundForm.refundNo }}
        </el-form-item>
        <el-form-item label="原收费单号">
          {{ refundForm.paymentNo }}
        </el-form-item>
        <el-form-item label="患者姓名">
          {{ refundForm.patientName }}
        </el-form-item>
        <el-form-item label="退款金额" prop="refundAmount">
          <el-input-number
            v-model="refundForm.refundAmount"
            :min="0"
            :max="refundForm.originalAmount"
            :precision="2"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="退款原因" prop="refundReason">
          <el-input
            v-model="refundForm.refundReason"
            type="textarea"
            :rows="3"
            placeholder="请输入退款原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmRefund">确认退款</el-button>
      </template>
    </el-dialog>
  
    <!-- 收费详情抽屉 -->
    <el-drawer
      v-model="detailDrawer.visible"
      title="收费详情"
      :direction="'rtl'"
      size="40%"
    >
      <div class="payment-detail" v-if="currentPayment">
        <div class="detail-header">
          <h3>收费单号：{{ currentPayment.paymentNo }}</h3>
          <el-tag
            :type="getStatusType(currentPayment.paymentStatus)"
            size="large"
          >
            {{ formatPaymentStatus(currentPayment.paymentStatus) }}
          </el-tag>
        </div>
  
        <el-divider />
  
        <div class="detail-section">
          <h4>患者信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="患者姓名">{{
              currentPayment.patientName
            }}</el-descriptions-item>
            <el-descriptions-item label="病历号">{{
              currentPayment.medicalRecordNo
            }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{
              currentPayment.patientPhone
            }}</el-descriptions-item>
          </el-descriptions>
        </div>
  
        <div class="detail-section">
          <h4>收费信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="收费类型">{{
              formatPaymentType(currentPayment.paymentType)
            }}</el-descriptions-item>
            <el-descriptions-item label="支付方式">{{
              formatPaymentMethod(currentPayment.paymentMethod)
            }}</el-descriptions-item>
            <el-descriptions-item label="应收金额"
              >¥{{
                formatAmount(currentPayment.payableAmount)
              }}</el-descriptions-item
            >
            <el-descriptions-item label="优惠金额"
              >¥{{
                formatAmount(currentPayment.discountAmount)
              }}</el-descriptions-item
            >
            <el-descriptions-item label="实收金额"
              >¥{{ formatAmount(currentPayment.amount) }}</el-descriptions-item
            >
            <el-descriptions-item label="收费时间">{{
              currentPayment.paymentTime
            }}</el-descriptions-item>
            <el-descriptions-item label="操作员">{{
              currentPayment.operator
            }}</el-descriptions-item>
          </el-descriptions>
        </div>
  
        <div class="detail-section">
          <h4>费用明细</h4>
          <el-table :data="currentPayment.items" border style="width: 100%">
            <el-table-column prop="itemName" label="项目名称" />
            <el-table-column prop="specification" label="规格" width="100" />
            <el-table-column prop="unitPrice" label="单价" width="100">
              <template #default="{ row }"
                >¥{{ formatAmount(row.unitPrice) }}</template
              >
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="{ row }"
                >¥{{ formatAmount(row.amount) }}</template
              >
            </el-table-column>
          </el-table>
        </div>
  
        <div class="detail-section" v-if="currentPayment.notes">
          <h4>备注</h4>
          <p>{{ currentPayment.notes }}</p>
        </div>
      </div>
    </el-drawer>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, computed } from "vue";
  import { ElMessage, ElMessageBox } from "element-plus";
  import { useRouter } from "vue-router";
  import { useStore } from "vuex";
  import AdminHeader from "@/components/manager/AdminHeader.vue";
  import SideLeft from "@/components/manager/SideLeft.vue";
  
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
  const filters = reactive({
    patientName: "",
    medicalRecordNo: "",
    paymentStatus: "",
    paymentType: "",
    dateRange: [],
  });
  
  const stats = reactive({
    totalIncome: 12580.5,
    pendingCount: 8,
    completedCount: 45,
    refundCount: 3,
  });
  
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });
  
  // 患者选项
  const patientOptions = ref([
    { value: "P10001", label: "张三", medicalRecordNo: "MR20240001" },
    { value: "P10002", label: "李四", medicalRecordNo: "MR20240002" },
    { value: "P10003", label: "王五", medicalRecordNo: "MR20240003" },
    { value: "P10004", label: "赵六", medicalRecordNo: "MR20240004" },
  ]);
  
  // 收费数据
  const payments = ref([]);
  
  // 收费对话框相关
  const paymentDialog = reactive({
    visible: false,
    isEdit: false,
  });
  
  const paymentForm = reactive({
    patientId: "",
    paymentType: "outpatient",
    items: [
      { itemName: "", specification: "", unitPrice: 0, quantity: 1, amount: 0 },
    ],
    discountAmount: 0,
    paymentMethod: "cash",
    notes: "",
  });
  
  const paymentRules = {
    patientId: [{ required: true, message: "请选择患者", trigger: "change" }],
    paymentType: [
      { required: true, message: "请选择收费类型", trigger: "change" },
    ],
    paymentMethod: [
      { required: true, message: "请选择支付方式", trigger: "change" },
    ],
    discountAmount: [
      {
        validator: (rule, value, callback) => {
          if (value < 0) {
            callback(new Error("优惠金额不能为负数"));
          } else if (value > totalAmount.value) {
            callback(new Error("优惠金额不能大于应收金额"));
          } else {
            callback();
          }
        },
        trigger: "blur",
      },
    ],
  };
  
  const paymentFormRef = ref(null);
  
  // 退款对话框相关
  const refundDialog = reactive({
    visible: false,
  });
  
  const refundForm = reactive({
    paymentNo: "",
    refundNo: "",
    patientName: "",
    originalAmount: 0,
    refundAmount: 0,
    refundReason: "",
  });
  
  // 详情抽屉相关
  const detailDrawer = reactive({
    visible: false,
  });
  
  const currentPayment = ref(null);
  
  const totalAmount = computed(() => {
    return paymentForm.items.reduce((total, item) => {
      return total + (item.unitPrice || 0) * (item.quantity || 1);
    }, 0);
  });
  
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };
  
  const resetFilters = () => {
    filters.patientName = "";
    filters.medicalRecordNo = "";
    filters.paymentStatus = "";
    filters.paymentType = "";
    filters.dateRange = [];
    loadPayments();
  };
  
  const searchPayments = () => {
    pagination.currentPage = 1;
    loadPayments();
  };
  
  const loadPayments = () => {
    // 模拟收费数据
    const mockData = [
      {
        id: "PY10001",
        paymentNo: "PY202401200001",
        patientId: "P10001",
        patientName: "张三",
        medicalRecordNo: "MR20240001",
        patientPhone: "13800138001",
        patientAvatar:
          "https://pic4.zhimg.com/80/v2-6c9bb6b4b7c7c41c3c7b4b4b4b4b4b4b_720w.webp",
        paymentType: "outpatient",
        payableAmount: 285.0,
        discountAmount: 15.0,
        amount: 270.0,
        paymentMethod: "wechat",
        paymentStatus: "completed",
        paymentTime: "2024-01-20 10:30:25",
        createTime: "2024-01-20 10:15:00",
        operator: "收费员01",
        notes: "门诊诊查费",
        items: [
          {
            itemName: "诊查费",
            specification: "普通门诊",
            unitPrice: 25.0,
            quantity: 1,
            amount: 25.0,
          },
          {
            itemName: "血常规检查",
            specification: "常规",
            unitPrice: 80.0,
            quantity: 1,
            amount: 80.0,
          },
          {
            itemName: "药品费",
            specification: "阿莫西林",
            unitPrice: 60.0,
            quantity: 3,
            amount: 180.0,
          },
        ],
      },
      {
        id: "PY10002",
        paymentNo: "PY202401200002",
        patientId: "P10002",
        patientName: "李四",
        medicalRecordNo: "MR20240002",
        patientPhone: "13800138002",
        patientAvatar:
          "https://pic4.zhimg.com/80/v2-6c9bb6b4b7c7c41c3c7b4b4b4b4b4b4b_720w.webp",
        paymentType: "examination",
        payableAmount: 650.0,
        discountAmount: 0,
        amount: 650.0,
        paymentMethod: "alipay",
        paymentStatus: "completed",
        paymentTime: "2024-01-20 11:20:15",
        createTime: "2024-01-20 11:05:00",
        operator: "收费员02",
        notes: "CT检查费用",
        items: [
          {
            itemName: "CT检查",
            specification: "头颅平扫",
            unitPrice: 450.0,
            quantity: 1,
            amount: 450.0,
          },
          {
            itemName: "增强扫描",
            specification: "造影剂",
            unitPrice: 200.0,
            quantity: 1,
            amount: 200.0,
          },
        ],
      },
      {
        id: "PY10003",
        paymentNo: "PY202401200003",
        patientId: "P10003",
        patientName: "王五",
        medicalRecordNo: "MR20240003",
        patientPhone: "13800138003",
        patientAvatar:
          "https://pic4.zhimg.com/80/v2-6c9bb6b4b7c7c41c3c7b4b4b4b4b4b4b_720w.webp",
        paymentType: "medicine",
        payableAmount: 320.5,
        discountAmount: 20.5,
        amount: 300.0,
        paymentMethod: "",
        paymentStatus: "pending",
        paymentTime: "",
        createTime: "2024-01-20 14:30:00",
        operator: "",
        notes: "处方药品",
        items: [
          {
            itemName: "降压药",
            specification: "30片/瓶",
            unitPrice: 45.0,
            quantity: 2,
            amount: 90.0,
          },
          {
            itemName: "降糖药",
            specification: "20片/盒",
            unitPrice: 38.5,
            quantity: 6,
            amount: 231.0,
          },
        ],
      },
      {
        id: "PY10004",
        paymentNo: "PY202401200004",
        patientId: "P10004",
        patientName: "赵六",
        medicalRecordNo: "MR20240004",
        patientPhone: "13800138004",
        patientAvatar:
          "https://pic4.zhimg.com/80/v2-6c9bb6b4b7c7c41c3c7b4b4b4b4b4b4b_720w.webp",
        paymentType: "inpatient",
        payableAmount: 2000.0,
        discountAmount: 200.0,
        amount: 1800.0,
        paymentMethod: "insurance",
        paymentStatus: "completed",
        paymentTime: "2024-01-20 16:45:30",
        createTime: "2024-01-20 16:30:00",
        operator: "收费员01",
        notes: "住院押金",
        items: [
          {
            itemName: "住院押金",
            specification: "",
            unitPrice: 2000.0,
            quantity: 1,
            amount: 2000.0,
          },
        ],
      },
    ];
  
    // 简单的筛选逻辑
    let filteredData = mockData;
  
    if (filters.patientName) {
      filteredData = filteredData.filter((item) =>
        item.patientName.includes(filters.patientName)
      );
    }
  
    if (filters.medicalRecordNo) {
      filteredData = filteredData.filter((item) =>
        item.medicalRecordNo.includes(filters.medicalRecordNo)
      );
    }
  
    if (filters.paymentStatus) {
      filteredData = filteredData.filter(
        (item) => item.paymentStatus === filters.paymentStatus
      );
    }
  
    if (filters.paymentType) {
      filteredData = filteredData.filter(
        (item) => item.paymentType === filters.paymentType
      );
    }
  
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange;
      filteredData = filteredData.filter(
        (item) => item.createTime >= start && item.createTime <= end
      );
    }
  
    payments.value = filteredData;
    pagination.total = filteredData.length;
  };
  
  const handleSizeChange = (size) => {
    pagination.pageSize = size;
    loadPayments();
  };
  
  const handleCurrentChange = (page) => {
    pagination.currentPage = page;
    loadPayments();
  };
  
  const viewPaymentDetails = (payment) => {
    currentPayment.value = payment;
    detailDrawer.visible = true;
  };
  
  const processPayment = (payment) => {
    ElMessageBox.confirm(
      `确定要收取 ${payment.patientName} 的费用 ¥${formatAmount(
        payment.amount
      )} 吗？`,
      "收费确认",
      {
        confirmButtonText: "确定收费",
        cancelButtonText: "取消",
        type: "warning",
      }
    )
      .then(() => {
        payment.paymentStatus = "completed";
        payment.paymentTime = new Date().toLocaleString();
        payment.operator = username.value;
        ElMessage.success("收费成功");
      })
      .catch(() => {
        ElMessage.info("已取消收费");
      });
  };
  
  const showRefundDialog = (payment) => {
    Object.assign(refundForm, {
      paymentNo: payment.paymentNo,
      refundNo: `RF${Date.now()}`,
      patientName: payment.patientName,
      originalAmount: payment.amount,
      refundAmount: payment.amount,
      refundReason: "",
    });
    refundDialog.visible = true;
  };
  
  const confirmRefund = () => {
    ElMessage.success("退款处理成功");
    refundDialog.visible = false;
  
    // 更新原收费单状态
    const payment = payments.value.find(
      (p) => p.paymentNo === refundForm.paymentNo
    );
    if (payment) {
      payment.paymentStatus =
        refundForm.refundAmount < payment.amount ? "partial_refund" : "refunded";
    }
  };
  
  const showCreatePaymentDialog = () => {
    Object.assign(paymentForm, {
      patientId: "",
      paymentType: "outpatient",
      items: [
        { itemName: "", specification: "", unitPrice: 0, quantity: 1, amount: 0 },
      ],
      discountAmount: 0,
      paymentMethod: "cash",
      notes: "",
    });
    paymentDialog.isEdit = false;
    paymentDialog.visible = true;
  };
  
  const handlePatientChange = (patientId) => {
    const patient = patientOptions.value.find((p) => p.value === patientId);
    if (patient) {
      // 可以在这里加载患者的其他信息
    }
  };
  
  const addItem = () => {
    paymentForm.items.push({
      itemName: "",
      specification: "",
      unitPrice: 0,
      quantity: 1,
      amount: 0,
    });
  };
  
  const removeItem = (index) => {
    if (paymentForm.items.length > 1) {
      paymentForm.items.splice(index, 1);
    } else {
      ElMessage.warning("至少保留一个收费项目");
    }
  };
  
  const submitPaymentForm = async () => {
    try {
      await paymentFormRef.value.validate();
  
      const patient = patientOptions.value.find(
        (p) => p.value === paymentForm.patientId
      );
  
      const newPayment = {
        id: `PY${payments.value.length + 10001}`,
        paymentNo: `PY${Date.now()}`,
        patientId: paymentForm.patientId,
        patientName: patient?.label || "",
        medicalRecordNo: patient?.medicalRecordNo || "",
        patientPhone: "13800138000",
        patientAvatar:
          "https://pic4.zhimg.com/80/v2-6c9bb6b4b7c7c41c3c7b4b4b4b4b4b4b_720w.webp",
        paymentType: paymentForm.paymentType,
        payableAmount: totalAmount.value,
        discountAmount: paymentForm.discountAmount || 0,
        amount: totalAmount.value - (paymentForm.discountAmount || 0),
        paymentMethod: paymentForm.paymentMethod,
        paymentStatus: "pending",
        paymentTime: "",
        createTime: new Date().toLocaleString(),
        operator: "",
        notes: paymentForm.notes,
        items: paymentForm.items.map((item) => ({
          ...item,
          amount: (item.unitPrice || 0) * (item.quantity || 1),
        })),
      };
  
      payments.value.unshift(newPayment);
      ElMessage.success("收费单创建成功");
      paymentDialog.visible = false;
      loadPayments();
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };
  
  const exportData = () => {
    ElMessage.success("数据导出成功");
  };
  
  const exportStatement = () => {
    ElMessage.success("对账单导出成功");
  };
  
  const refreshData = () => {
    loadPayments();
    ElMessage.success("数据已刷新");
  };
  
  const formatAmount = (amount) => {
    return Number(amount).toFixed(2);
  };
  
  const formatPaymentStatus = (status) => {
    const statusMap = {
      pending: "待收费",
      completed: "已收费",
      refunded: "已退款",
      partial_refund: "部分退款",
    };
    return statusMap[status] || status;
  };
  
  const formatPaymentType = (type) => {
    const typeMap = {
      outpatient: "门诊收费",
      inpatient: "住院收费",
      medicine: "药品收费",
      examination: "检查收费",
      treatment: "治疗收费",
    };
    return typeMap[type] || type;
  };
  
  const formatPaymentMethod = (method) => {
    const methodMap = {
      cash: "现金",
      card: "银行卡",
      wechat: "微信支付",
      alipay: "支付宝",
      insurance: "医保结算",
    };
    return methodMap[method] || method;
  };
  
  const getStatusType = (status) => {
    const typeMap = {
      pending: "warning",
      completed: "success",
      refunded: "info",
      partial_refund: "danger",
    };
    return typeMap[status] || "info";
  };
  
  onMounted(() => {
    loadPayments();
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
  
          &.income { background: rgba($success, 0.1); color: $success; }
          &.pending { background: rgba($warning, 0.1); color: $warning; }
          &.completed { background: rgba($primary, 0.1); color: $primary; }
          &.refund { background: rgba($danger, 0.1); color: $danger; }
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
  
    // 收费表格
    .payment-table {
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
  
  // 患者信息样式
  .patient-info {
    display: flex;
    align-items: center;
    gap: 12px;
  
    .patient-avatar {
      flex-shrink: 0;
    }
  
    > div {
      div:first-child {
        font-weight: 600;
        color: $text;
        margin-bottom: 2px;
      }
    }
  }
  
  // 金额样式
  .amount {
    font-weight: 600;
    color: $success;
    font-size: 16px;
  }
  
  .summary-amount {
    font-size: 18px;
    font-weight: 600;
    color: $primary;
  
    &.actual {
      color: $success;
      font-size: 20px;
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
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid $border;
  
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
  
      .el-form {
        .el-form-item {
          margin-bottom: 20px;
  
          .el-form-item__label {
            font-weight: 500;
            color: $text;
          }
        }
      }
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
  
      .payment-detail {
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
  
  :deep(.el-date-picker) {
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
  
  :deep(.el-input-number) {
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
  
  :deep(.el-textarea) {
    .el-textarea__inner {
      border-radius: 8px;
      transition: all 0.3s ease;
  
      &:hover {
        border-color: $primary;
      }
  
      &:focus {
        border-color: $primary;
        box-shadow: 0 0 0 2px rgba($primary, 0.2);
      }
    }
  }
  
  :deep(.el-tag) {
    border-radius: 12px;
    font-weight: 500;
  }
  
  :deep(.el-avatar) {
    border: 2px solid rgba($primary, 0.1);
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
  
      .payment-table {
        .table-header {
          flex-direction: column;
          gap: 16px;
          align-items: stretch;
  
          .table-tools {
            justify-content: center;
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
