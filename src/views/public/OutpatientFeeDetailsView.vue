<template>
    <div class="payment-container">
      <div class="page-header">
        <h1 class="page-title">门诊缴费清单</h1>
        <div class="step-indicator">步骤 2/3</div>
      </div>
      
      <!-- 患者信息 -->
      <div class="patient-info">
        <div class="info-item">
          <span class="info-label">患者姓名</span>
          <span class="info-value">{{ patientInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">医保卡号</span>
          <span class="info-value">{{ patientInfo.medicalCard }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">就诊科室</span>
          <span class="info-value">{{ patientInfo.department }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">接诊医生</span>
          <span class="info-value">{{ patientInfo.doctor }}</span>
        </div>
      </div>
      
      <!-- 支付方式显示 -->
      <div class="payment-mode" :class="{ 'self-pay': paymentMode === 'self' }">
        <el-icon class="mode-icon">
          <component :is="paymentMode === 'insurance' ? User : Money" />
        </el-icon>
        <span class="mode-text">
          {{ paymentMode === "insurance" ? "职工医保支付" : "自费支付" }}
        </span>
      </div>
      
      <!-- 费用明细 -->
      <div class="card">
        <div class="card-header">
          <el-icon class="card-header-icon"><Document /></el-icon>
          <span>费用明细</span>
        </div>
        
        <table class="fee-table">
          <tr v-for="(item, index) in feeItems" :key="index">
            <td class="fee-name">
              {{ item.name }}
              <span v-if="item.spec" style="color: #909399; font-size: 12px;">({{ item.spec }})</span>
              <span v-if="selfPayItems.includes(item.name)" style="color: #e6a23c; font-size: 12px;">(自费)</span>
            </td>
            <td class="fee-amount">¥{{ item.amount.toFixed(2) }}</td>
          </tr>
        </table>
        
        <!-- 医保结算信息 -->
        <template v-if="paymentMode === 'insurance'">
          <div class="insurance-table">
            <table class="fee-table">
              <tr v-for="(row, index) in insuranceSettlementRows" :key="index">
                <td class="insurance-name">{{ row.name }}</td>
                <td class="insurance-value">{{ row.value }}</td>
              </tr>
            </table>
          </div>
        </template>
        
        <div class="total-section">
          <div class="payable-amount">
            <span>应付金额：</span>
            <span class="amount">¥{{ payableAmount.toFixed(2) }}</span>
          </div>
          
          <div v-if="showSelfPaymentTip" class="alert-box">
            <el-icon class="alert-icon"><Warning /></el-icon>
            <span>您的医保账户余额不足，需自费支付 ¥{{ selfPaymentAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <div class="security-tips">
        <el-icon class="security-icon"><Lock /></el-icon>
        <span>支付安全保证，您的信息不会泄露</span>
      </div>
      
      <div class="action-buttons">
        <button class="back-button" @click="goBack">返回上一步</button>
        <button
          class="confirm-button"
          @click="confirmPayment"
          :class="{ loading: confirming }"
        >
          {{ confirming ? "支付中..." : "确认支付" }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { ElMessage, ElIcon } from 'element-plus';
  import { Lock, User, Money, Document, Warning } from '@element-plus/icons-vue';
  
  // 模拟路由
  const useRouter = () => {
    return {
      push: (path) => {
        console.log('Navigating to:', path);
        // 实际应用中这里应该处理路由跳转
      }
    };
  };
  
  const router = useRouter();
  
  // 支付模式：insurance(医保) 或 self(自费)
  const paymentMode = ref("insurance");
  const confirming = ref(false);
  
  // 患者信息
  const patientInfo = ref({
    name: "张三",
    idCard: "3205********1234",
    medicalCard: "YB123456789",
    department: "心血管内科",
    doctor: "张明远主任"
  });
  
  // 费用项目 - 包含检查费和药品费
  const feeItems = ref([
    { name: "挂号费", amount: 15.0, type: "挂号" },
    { name: "血常规检查", amount: 25.0, type: "检查" },
    { name: "心电图检查", amount: 50.0, type: "检查" },
    { name: "CT扫描", amount: 300.0, type: "检查" },
    { name: "阿司匹林肠溶片", amount: 28.5, type: "药品", spec: "100mg*30片" },
    { name: "硝酸甘油片", amount: 35.0, type: "药品", spec: "0.5mg*50片" },
    { name: "诊疗费", amount: 20.0, type: "诊疗" }
  ]);
  
  // 医保相关数据
  const insuranceBalance = ref(1256.0);
  const insuranceRatio = ref(0.75); // 75%报销比例
  const selfPayItems = ref(["CT扫描", "硝酸甘油片"]); // 需要自费的项目
  
  // 计算属性
  const totalAmount = computed(() => {
    return feeItems.value.reduce((sum, item) => sum + item.amount, 0);
  });
  
  // 医保可报销金额（排除自费项目）
  const reimbursableAmount = computed(() => {
    return feeItems.value
      .filter(item => !selfPayItems.value.includes(item.name))
      .reduce((sum, item) => sum + item.amount, 0) * insuranceRatio.value;
  });
  
  // 医保实际支付金额（不超过账户余额）
  const insurancePayment = computed(() => {
    return Math.min(insuranceBalance.value, reimbursableAmount.value);
  });
  
  // 自费支付金额（自费项目 + 医保报销后剩余部分）
  const selfPaymentAmount = computed(() => {
    if (paymentMode.value === "self") return totalAmount.value;
    
    const selfPayTotal = feeItems.value
      .filter(item => selfPayItems.value.includes(item.name))
      .reduce((sum, item) => sum + item.amount, 0);
      
    return selfPayTotal + Math.max(0, reimbursableAmount.value - insurancePayment.value);
  });
  
  // 应付金额（自费部分）
  const payableAmount = computed(() => {
    return selfPaymentAmount.value;
  });
  
  // 是否显示自费支付提示
  const showSelfPaymentTip = computed(() => {
    return (
      paymentMode.value === "insurance" &&
      insurancePayment.value < reimbursableAmount.value
    );
  });
  
  // 医保结算行数据
  const insuranceSettlementRows = computed(() => {
    return [
      { name: "医保账户余额", value: `¥${insuranceBalance.value.toFixed(2)}` },
      {
        name: "医保报销比例",
        value: `${(insuranceRatio.value * 100).toFixed(0)}%`,
      },
      {
        name: "医保可报销金额",
        value: `¥${reimbursableAmount.value.toFixed(2)}`,
      },
      { name: "医保实际支付", value: `¥${insurancePayment.value.toFixed(2)}` },
      { name: "自费项目金额", value: `¥${selfPaymentAmount.value.toFixed(2)}` },
    ];
  });
  
  // 根据URL参数确定支付方式
  const determinePaymentMode = () => {
    // 模拟从URL获取参数，实际应使用路由查询参数
    const urlParams = new URLSearchParams(window.location.search);
    const registrationType = urlParams.get('type') || 'insurance';
    paymentMode.value = registrationType;
  };
  
  // 确认支付
  const confirmPayment = () => {
    confirming.value = true;
    
    // 模拟API调用
    setTimeout(() => {
      confirming.value = false;
      ElMessage.success('支付成功！');
      // 实际应跳转到支付结果页面
    }, 1500);
  };
  
  // 模拟API调用
  setTimeout(() => {
    confirming.value = false;
    ElMessage.success('支付成功！');
    // 实际应跳转到支付结果页面
  }, 1500);
;

// 返回上一页
const goBack = () => {
  window.history.back();
};

onMounted(() => {
  determinePaymentMode();
  console.log("门诊缴费清单页面初始化");
});
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

.payment-container {
  background: #f5f7fa;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
  .page-title { font-size: 32px; font-weight: 800; color: $text; margin: 0 0 8px; }
  .step-indicator { display: inline-block; padding: 8px 16px; border-radius: 20px; background: white; color: $text-light; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
}

.patient-info {
  max-width: 900px;
  margin: 0 auto 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .info-item {
    background: white;
    border: 1px solid $border;
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 4px solid $primary;
    .info-label { color: $text-light; font-size: 14px; }
    .info-value { color: $text; font-weight: 700; font-size: 16px; }
  }
}

.payment-mode {
  max-width: 600px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, $primary, darken($primary, 10%));
  color: white;
  padding: 14px 20px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(26, 117, 188, 0.3);
  &.self-pay { background: linear-gradient(135deg, $warning, darken($warning, 10%)); box-shadow: 0 6px 20px rgba(230,162,60,0.3); }
  .mode-icon { font-size: 20px; }
  .mode-text { font-size: 16px; font-weight: 700; }
}

.card {
  max-width: 900px;
  margin: 0 auto 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, $bg-light, white);
  padding: 18px 20px;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  gap: 10px;
  .card-header-icon { font-size: 18px; color: $primary; }
  span { font-size: 16px; font-weight: 700; color: $text; }
}

.fee-table {
  width: 100%;
  border-collapse: collapse;
  tr { border-bottom: 1px solid $border; &:last-child { border-bottom: none; } &:hover { background: rgba(26,117,188,0.03); } }
  td { padding: 14px 18px; }
  .fee-name { font-size: 15px; color: $text; font-weight: 600; }
  .fee-amount { text-align: right; font-size: 16px; font-weight: 700; color: $primary; }
}

.insurance-table {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 2px solid $border;
  .fee-table tr { background: rgba(103,194,58,0.02); &:hover { background: rgba(103,194,58,0.06); } }
  .insurance-name { font-size: 14px; color: $text-light; }
  .insurance-value { text-align: right; font-size: 15px; font-weight: 700; color: $success; }
}

.total-section { padding: 18px; background: linear-gradient(135deg, $bg-light, white); border-top: 2px solid $border; }
.payable-amount { display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 800; color: $text; margin-bottom: 10px; .amount { color: $primary; font-size: 22px; } }

.alert-box { background: linear-gradient(135deg, rgba(230,162,60,0.1), rgba(230,162,60,0.05)); border: 1px solid rgba(230,162,60,0.3); border-radius: 8px; padding: 10px 12px; display: flex; align-items: center; gap: 8px; .alert-icon { color: $warning; } span { color: darken($warning, 20%); font-size: 14px; } }

.security-tips { max-width: 600px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 18px; background: white; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); .security-icon { color: $success; } span { color: $text-light; font-size: 14px; } }

.action-buttons { display: flex; justify-content: center; gap: 14px; max-width: 600px; margin: 0 auto; .back-button { background: white; color: $text; border: 2px solid $border; padding: 12px 24px; border-radius: 25px; font-size: 16px; cursor: pointer; transition: all .2s ease; &:hover { border-color: $primary; color: $primary; box-shadow: 0 6px 20px rgba(26,117,188,0.15); transform: translateY(-2px); } } .confirm-button { background: linear-gradient(135deg, $primary, darken($primary, 10%)); color: white; border: none; padding: 12px 24px; border-radius: 25px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all .2s ease; &:hover:not(.loading) { background: linear-gradient(135deg, darken($primary, 5%), darken($primary, 15%)); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(26,117,188,0.4); } &.loading { opacity: .85; cursor: not-allowed; animation: pulse 1.5s infinite; } } }

@keyframes pulse { 0%,100% { opacity: .85; } 50% { opacity: 1; } }

@media (max-width: 768px) {
  .payment-container { padding: 16px; }
  .page-header .page-title { font-size: 24px; }
  .patient-info { grid-template-columns: 1fr; }
  .action-buttons { flex-direction: column; .back-button, .confirm-button { width: 100%; } }
}
</style>