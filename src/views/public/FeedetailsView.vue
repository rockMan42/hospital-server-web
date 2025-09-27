<template>
    <div class="payment-container">
      <div class="page-header">
        <h1 class="page-title">挂号缴费清单</h1>
        <div class="step-indicator">步骤 3/4</div>
      </div>
  
      <div class="payment-mode" :class="{ 'self-pay': paymentMode === 'self' }">
        <el-icon class="mode-icon">
          <component :is="paymentMode === 'insurance' ? User : Money" />
        </el-icon>
        <span class="mode-text">
          {{ paymentMode === "insurance" ? "职工医保支付" : "自费支付" }}
        </span>
      </div>
  
      <div class="card">
        <div class="card-header">
          <el-icon class="card-header-icon"><Document /></el-icon>
          <span>费用明细</span>
        </div>
  
        <table class="fee-table">
          <tr v-for="(item, index) in feeItems" :key="index">
            <td class="fee-name">{{ item.name }}</td>
            <td class="fee-amount">¥{{ item.amount.toFixed(2) }}</td>
          </tr>
        </table>
  
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
            <span
              >您的医保账户余额不足，需自费支付 ¥{{
                selfPaymentAmount.toFixed(2)
              }}</span
            >
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
          {{ confirming ? "进入支付..." : "确认支付" }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { ElIcon } from "element-plus";
  import { Lock, User, Money, Document, Warning } from "@element-plus/icons-vue";
  
  
  const router = useRouter();
  
  // 支付模式：insurance(医保) 或 self(自费)
  const paymentMode = ref("insurance");
  const confirming = ref(false);
  
  // 费用项目
  const feeItems = ref([
    { name: "挂号费", amount: 15.0 },
  //   { name: "诊疗费", amount: 10.0 },
  //   { name: "药费", amount: 45.5 },
  //   { name: "材料费", amount: 5.0 },
  ]);
  
  // 医保相关数据
  const insuranceBalance = ref(256.0);
  const insuranceRatio = ref(0.55); // 55%报销比例
  
  // 计算属性
  const totalAmount = computed(() => {
    return feeItems.value.reduce((sum, item) => sum + item.amount, 0);
  });
  
  // 医保可报销金额
  const reimbursableAmount = computed(() => {
    return totalAmount.value * insuranceRatio.value;
  });
  
  // 医保实际支付金额（不超过账户余额）
  const insurancePayment = computed(() => {
    return Math.min(insuranceBalance.value, reimbursableAmount.value);
  });
  
  // 自费支付金额
  const selfPaymentAmount = computed(() => {
    if (paymentMode.value === "self") return totalAmount.value;
    return Math.max(0, totalAmount.value - insurancePayment.value);
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
    ];
  });
  
  // 确认支付
  const confirmPayment = () => {
    confirming.value = true;
  
    // 模拟API调用
    setTimeout(() => {
      confirming.value = false;
      router.push("/self-service/payment");
    }, 1000);
  };
  
  // 返回上一页
  const goBack = () => {
    router.back();
  };
  
  onMounted(() => {
    console.log("费用清单页面初始化");
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
    padding: 20px;
    background: #f5f7fa;
    min-height: 100vh;
    width: 100%;
    margin: 0;
    box-sizing: border-box;
  }
  
  // 页面标题
  .page-header {
    text-align: center;
    margin-bottom: 30px;
    
    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: $text;
      margin: 0 0 10px 0;
    }
    
    .step-indicator {
      font-size: 16px;
      color: $text-light;
      background: white;
      padding: 8px 20px;
      border-radius: 20px;
      display: inline-block;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  // 支付模式指示器
  .payment-mode {
    max-width: 600px;
    margin: 0 auto 30px;
    background: linear-gradient(135deg, $primary, darken($primary, 10%));
    color: white;
    padding: 16px 24px;
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    box-shadow: 0 6px 20px rgba(26, 117, 188, 0.3);
    
    &.self-pay {
      background: linear-gradient(135deg, $warning, darken($warning, 10%));
      box-shadow: 0 6px 20px rgba(230, 162, 60, 0.3);
    }
    
    .mode-icon {
      font-size: 24px;
    }
    
    .mode-text {
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  // 卡片样式
  .card {
    max-width: 800px;
    margin: 0 auto 30px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }
  }
  
  .card-header {
    background: linear-gradient(135deg, $bg-light, white);
    padding: 20px 24px;
    border-bottom: 1px solid $border;
    display: flex;
    align-items: center;
    gap: 12px;
    
    .card-header-icon {
      font-size: 20px;
      color: $primary;
    }
    
    span {
      font-size: 18px;
      font-weight: 600;
      color: $text;
    }
  }
  
  // 费用表格
  .fee-table {
    width: 100%;
    border-collapse: collapse;
    
    tr {
      border-bottom: 1px solid $border;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: rgba(26, 117, 188, 0.02);
      }
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    td {
      padding: 16px 24px;
      
      &.fee-name {
        font-size: 15px;
        color: $text;
        font-weight: 500;
      }
      
      &.fee-amount {
        text-align: right;
        font-size: 16px;
        font-weight: 600;
        color: $primary;
      }
    }
  }
  
  // 医保结算表格
  .insurance-table {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid $border;
    
    .fee-table {
      tr {
        background-color: rgba(103, 194, 58, 0.02);
        
        &:hover {
          background-color: rgba(103, 194, 58, 0.05);
        }
      }
      
      .insurance-name {
        font-size: 14px;
        color: $text-light;
        font-weight: 500;
      }
      
      .insurance-value {
        text-align: right;
        font-size: 15px;
        font-weight: 600;
        color: $success;
      }
    }
  }
  
  // 总计部分
  .total-section {
    padding: 24px;
    background: linear-gradient(135deg, $bg-light, white);
    border-top: 2px solid $border;
  }
  
  .payable-amount {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 20px;
    font-weight: 700;
    color: $text;
    margin-bottom: 16px;
    
    .amount {
      color: $primary;
      font-size: 24px;
    }
  }
  
  // 警告框
  .alert-box {
    background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(230, 162, 60, 0.05));
    border: 1px solid rgba(230, 162, 60, 0.3);
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .alert-icon {
      color: $warning;
      font-size: 18px;
    }
    
    span {
      font-size: 14px;
      color: darken($warning, 20%);
      line-height: 1.4;
    }
  }
  
  // 安全提示
  .security-tips {
    max-width: 600px;
    margin: 0 auto 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .security-icon {
      color: $success;
      font-size: 16px;
    }
    
    span {
      font-size: 14px;
      color: $text-light;
    }
  }
  
  // 操作按钮
  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    max-width: 600px;
    margin: 0 auto;
    
    .back-button {
      background: white;
      color: $text;
      border: 2px solid $border;
      padding: 14px 32px;
      border-radius: 25px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: $primary;
        color: $primary;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(26, 117, 188, 0.15);
      }
    }
    
    .confirm-button {
      background: linear-gradient(135deg, $primary, darken($primary, 10%));
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 25px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover:not(.loading) {
        background: linear-gradient(135deg, darken($primary, 5%), darken($primary, 15%));
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(26, 117, 188, 0.4);
      }
      
      &.loading {
        opacity: 0.8;
        cursor: not-allowed;
        animation: pulse 1.5s infinite;
      }
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }
  
  // 响应式设计
  @media (max-width: 768px) {
    .payment-container {
      padding: 15px;
    }
    
    .page-header .page-title {
      font-size: 24px;
    }
    
    .payment-mode {
      margin: 0 15px 20px;
      padding: 12px 20px;
      
      .mode-text {
        font-size: 16px;
      }
    }
    
    .card {
      margin: 0 0 20px;
    }
    
    .fee-table td {
      padding: 12px 16px;
      
      &.fee-name {
        font-size: 14px;
      }
      
      &.fee-amount {
        font-size: 15px;
      }
    }
    
    .total-section {
      padding: 20px 16px;
    }
    
    .payable-amount {
      font-size: 18px;
      
      .amount {
        font-size: 20px;
      }
    }
    
    .action-buttons {
      flex-direction: column;
      gap: 12px;
      margin: 0 15px;
      
      .back-button,
      .confirm-button {
        width: 100%;
        justify-content: center;
      }
    }
  }
  
  @media (max-width: 480px) {
    .fee-table td {
      padding: 10px 12px;
      
      &.fee-name {
        font-size: 13px;
      }
      
      &.fee-amount {
        font-size: 14px;
      }
    }
    
    .payable-amount {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      font-size: 16px;
      
      .amount {
        font-size: 18px;
      }
    }
    
    .alert-box {
      padding: 10px 12px;
      
      span {
        font-size: 13px;
      }
    }
  }
  </style>