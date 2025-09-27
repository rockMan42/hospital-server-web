<template>
    <div class="payment-container">
      <div class="page-header">
        <h1 class="page-title">选择缴费方式</h1>
        <div class="step-indicator">步骤 3/4</div>
      </div>
  
      <div class="content-wrapper">
        <div class="card">
          <div class="card-header">
            <el-icon class="card-header-icon"><InfoFilled /></el-icon>
            <span>挂号信息</span>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="label">科室：</span>
              <span class="value">{{ appointmentInfo.department }}</span>
            </div>
            <div class="info-item">
              <span class="label">医生：</span>
              <span class="value">{{ appointmentInfo.doctor }}</span>
            </div>
            <div class="info-item">
              <span class="label">费用：</span>
              <span class="value fee">¥{{ appointmentInfo.fee.toFixed(2) }}</span>
            </div>
            <div class="info-item">
              <span class="label">时间：</span>
              <span class="value">{{ appointmentInfo.time }}</span>
            </div>
          </div>
        </div>
  
        <div class="card">
          <div class="card-header">
            <el-icon class="card-header-icon"><CreditCard /></el-icon>
            <span>选择缴费方式</span>
          </div>
          
          <div class="payment-options">
            <button
              v-for="option in paymentOptions"
              :key="option.id"
              class="payment-button"
              :class="{ active: selectedOption === option.id }"
              @click="selectOption(option)"
            >
              <el-icon class="button-icon">
                <component :is="option.icon" />
              </el-icon>
              <span class="button-text">{{ option.name }}</span>
            </button>
          </div>
  
          <div
            v-if="showInsuranceOption && selectedOption === 'insurance'"
            class="insurance-option"
          >
            <el-checkbox v-model="useInsurance"> 
              <span class="checkbox-label">使用生育保险支付</span>
            </el-checkbox>
            <div class="insurance-desc">
              生育保险可覆盖本次挂号费用，剩余金额将退回您的医保账户
            </div>
          </div>
        </div>
      </div>
  
      <div class="action-buttons">
        <button class="back-button" @click="goBack">返回上一步</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { 
    InfoFilled, 
    CreditCard, 
    User, 
    Wallet 
  } from "@element-plus/icons-vue";
  
  const router = useRouter();
  const route = useRoute();
  const selectedOption = ref("");
  const useInsurance = ref(false);
  
  // 缴费选项
  const paymentOptions = ref([
    { id: "insurance", name: "职工医保支付", icon: User },
    { id: "selfpay", name: "自费支付", icon: Wallet },
  ]);
  
  // 模拟预约信息
  const appointmentInfo = ref({
    department: "妇产科",
    doctor: "张医生",
    fee: 25.00,
    time: "2024-01-15 10:30",
  });
  
  // 检查是否为妇产科，显示生育险选项
  const showInsuranceOption = computed(() => {
    return parseInt(route.query.departmentId) === 3; // 妇产科ID
  });
  
  const selectOption = (option) => {
    selectedOption.value = option.id;
    setTimeout(() => {
      router.push({
        path: "/self-service/fee-details",
        query: {
          departmentId: route.query.departmentId,
          doctorId: route.query.doctorId,
          useInsurance: useInsurance.value,
          paymentMode: option.id === "insurance" ? "insurance" : "self"
        },
      });
    }, 300);
  };
  
  const goBack = () => {
    router.back();
  };
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
  
  // 内容包装器
  .content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  // 卡片样式
  .card {
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
  
  // 信息网格
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 24px;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: $bg-light;
    border-radius: 8px;
    border-left: 4px solid $primary;
    
    .label {
      font-size: 14px;
      color: $text-light;
      font-weight: 500;
    }
    
    .value {
      font-size: 16px;
      color: $text;
      font-weight: 600;
      
      &.fee {
        color: $primary;
        font-size: 18px;
      }
    }
  }
  
  // 支付选项
  .payment-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 24px;
  }
  
  .payment-button {
    background: white;
    border: 2px solid $border;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    min-height: 120px;
    justify-content: center;
    
    &:hover {
      border-color: $primary;
      box-shadow: 0 6px 20px rgba(26, 117, 188, 0.15);
      transform: translateY(-2px);
    }
    
    &.active {
      border-color: $primary;
      background: linear-gradient(135deg, rgba(26, 117, 188, 0.05), rgba(26, 117, 188, 0.1));
      box-shadow: 0 6px 20px rgba(26, 117, 188, 0.2);
    }
    
    .button-icon {
      font-size: 32px;
      color: $primary;
    }
    
    .button-text {
      font-size: 16px;
      font-weight: 600;
      color: $text;
      text-align: center;
    }
  }
  
  // 保险选项
  .insurance-option {
    margin-top: 16px;
    padding: 16px 24px;
    background: linear-gradient(135deg, rgba(103, 194, 58, 0.05), rgba(103, 194, 58, 0.1));
    border-radius: 8px;
    border-left: 4px solid $success;
    
    .checkbox-label {
      font-size: 16px;
      font-weight: 500;
      color: $text;
    }
    
    .insurance-desc {
      font-size: 14px;
      color: $text-light;
      margin-top: 8px;
      line-height: 1.4;
    }
  }
  
  // 操作按钮
  .action-buttons {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    
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
  }
  
  // 响应式设计
  @media (max-width: 768px) {
    .payment-container {
      padding: 15px;
    }
    
    .page-header .page-title {
      font-size: 24px;
    }
    
    .content-wrapper {
      max-width: 100%;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 20px;
    }
    
    .payment-options {
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 20px;
    }
    
    .payment-button {
      flex-direction: row;
      text-align: left;
      min-height: 80px;
      
      .button-icon {
        font-size: 24px;
      }
      
      .button-text {
        text-align: left;
      }
    }
  }
  
  @media (max-width: 480px) {
    .info-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      
      .label {
        font-size: 12px;
      }
      
      .value {
        font-size: 14px;
        
        &.fee {
          font-size: 16px;
        }
      }
    }
  }
  </style>