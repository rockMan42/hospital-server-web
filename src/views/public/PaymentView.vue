<template>
    <div class="payment-page">
      <div class="page-header">
        <h2>确认支付</h2>
        <div class="step-indicator">步骤 4/4</div>
      </div>
  
      <div class="payment-container">
        <!-- 左侧支付信息 -->
        <div class="payment-info-section">
          <el-card class="payment-info-card" shadow="never">
            <div class="payment-amount">
              <div class="amount-label">支付金额</div>
              <div class="amount-value">¥{{ paymentAmount }}</div>
            </div>
            
            <div class="payment-details">
              <div class="detail-item">
                <span class="label">挂号科室:</span>
                <span class="value">{{ appointmentInfo.department }}</span>
              </div>
              <div class="detail-item">
                <span class="label">医生:</span>
                <span class="value">{{ appointmentInfo.doctor }}</span>
              </div>
              <div class="detail-item">
                <span class="label">就诊时间:</span>
                <span class="value">{{ appointmentInfo.time }}</span>
              </div>
              <div class="detail-item">
                <span class="label">支付方式:</span>
                <span class="value">{{ paymentMethodText }}</span>
              </div>
              <div v-if="useInsurance" class="detail-item insurance">
                <span class="label">生育保险:</span>
                <span class="value">已启用</span>
              </div>
            </div>
          </el-card>
        </div>
  
        <!-- 右侧支付方式选择 -->
        <div class="payment-method-section">
          <el-card shadow="never" class="method-select-card">
            <div class="method-options">
              <div 
                v-for="method in Object.keys(paymentMethods)" 
                :key="method"
                class="method-option"
                :class="{ 'active': paymentMethod === method }"
                @click="selectPaymentMethod(method)"
              >
                <div class="method-icon">
                  <el-icon><component :is="paymentMethods[method].icon" /></el-icon>
                </div>
                <div class="method-text">
                  <div class="method-name">{{ paymentMethods[method].name }}</div>
                  <div class="method-desc">{{ paymentMethods[method].description }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
  
      <!-- 底部支付操作 -->
      <div class="payment-actions">
        <el-button
          type="primary"
          size="large"
          @click="handlePayment"
          :loading="paying"
          class="pay-button"
        >
          <template v-if="!paying">
            <el-icon><Money /></el-icon>
            立即支付 ¥{{ paymentAmount }}
          </template>
          <template v-else>
            支付中...
          </template>
        </el-button>
        
        <div class="security-tips">
          <el-icon><Lock /></el-icon>
          支付安全保证，您的信息不会泄露
        </div>
      </div>
  
      <div class="action-buttons">
        <el-button @click="goBack">返回修改</el-button>
      </div>
  
      <!-- 二维码支付弹窗 -->
      <el-dialog
        v-model="showQRCode"
        :title="`${currentMethod.name}支付`"
        width="400px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        center
      >
        <div class="qr-code-dialog">
          <div class="qr-code-mock">
            <div class="qr-code-image">
              <el-icon><Picture /></el-icon>
              <p>二维码显示区域</p>
            </div>
            <div class="qr-code-info">
              <p>请使用{{ currentMethod.name }}扫描二维码完成支付</p>
              <p class="amount">支付金额: ¥{{ paymentAmount }}</p>
            </div>
          </div>
          
          <div class="payment-timer">
            <el-progress
              type="circle"
              :percentage="timerPercentage"
              :width="80"
              :color="timerColor"
            >
              <span class="timer-text">{{ countdown }}s</span>
            </el-progress>
            <p class="timer-tip">二维码有效时间</p>
          </div>
        </div>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="cancelPayment">取消支付</el-button>
            <el-button type="primary" @click="refreshQRCode">刷新二维码</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    Money,
    Lock,
    Iphone,
    User,
    CreditCard,
    Picture
  } from '@element-plus/icons-vue'
  
  const router = useRouter()
  const route = useRoute()
  const paying = ref(false)
  const showQRCode = ref(false)
  const paymentMethod = ref(route.query.paymentMethod || 'alipay')
  const useInsurance = route.query.useInsurance === 'true'
  const countdown = ref(180) // 3分钟倒计时
  const timer = ref(null)
  
  // 支付方式映射
  const paymentMethods = {
    alipay: { name: '支付宝', icon: 'Iphone', description: '推荐使用，快速安全' },
    wechat: { name: '微信支付', icon: 'Iphone', description: '便捷支付方式' },
    digital: { name: '数字人民币', icon: 'Money', description: '新型支付方式' },
    medical: { name: '职工医保', icon: 'User', description: '医保个人账户支付' }
  }
  
  // 模拟预约信息
  const appointmentInfo = ref({
    department: '内科',
    doctor: '张医生',
    time: '2024-01-15 10:30',
    fee: 25
  })
  
  const currentMethod = computed(() => {
    return paymentMethods[paymentMethod.value] || paymentMethods.alipay
  })
  
  const paymentMethodText = computed(() => {
    return currentMethod.value.name
  })
  
  const paymentAmount = computed(() => {
    // 如果有生育保险，费用为0
    if (useInsurance && parseInt(route.query.departmentId) === 3) {
      return 0
    }
    return appointmentInfo.value.fee
  })
  
  const timerPercentage = computed(() => {
    return Math.round((countdown.value / 180) * 100)
  })
  
  const timerColor = computed(() => {
    if (countdown.value > 60) return '#67C23A'
    if (countdown.value > 30) return '#E6A23C'
    return '#F56C6C'
  })
  
  const selectPaymentMethod = (method) => {
    paymentMethod.value = method
  }
  
  const refreshQRCode = () => {
    // 重置倒计时
    countdown.value = 180
    // 这里可以添加刷新二维码的逻辑
    ElMessage.success('二维码已刷新')
  }
  
  const startTimer = () => {
    clearInterval(timer.value)
    countdown.value = 180
    timer.value = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer.value)
        ElMessage.warning('二维码已过期，请刷新')
      }
    }, 1000)
  }
  
  const cancelPayment = () => {
    clearInterval(timer.value)
    showQRCode.value = false
  }
  
  const handlePayment = async () => {
    // 如果是医保支付且金额为0，直接完成
    if (paymentMethod.value === 'medical' && paymentAmount.value === 0) {
      router.push({
        path: '/self-service/payment-success',
        query: {
          amount: paymentAmount.value,
          method: paymentMethod.value,
          appointmentId: generateAppointmentId()
        }
      })
      return
    }
  
    // 显示二维码弹窗
    showQRCode.value = true
    startTimer()
    
    // 这里模拟支付过程，实际应该等待二维码支付完成
    // paying.value = true
    // setTimeout(() => {
    //   paying.value = false
    //   const success = Math.random() > 0.2
    //   if (success) {
    //     router.push({
    //       path: '/self-service/payment-success',
    //       query: {
    //         amount: paymentAmount.value,
    //         method: paymentMethod.value,
    //         appointmentId: generateAppointmentId()
    //       }
    //     })
    //   } else {
    //     router.push({
    //       path: '/self-service/payment-failed',
    //       query: {
    //         amount: paymentAmount.value,
    //         method: paymentMethod.value,
    //         errorCode: 'PAYMENT_FAILED'
    //       }
    //     })
    //   }
    // }, 2000)
  }
  
  const goBack = () => {
    router.back()
  }
  
  const generateAppointmentId = () => {
    return 'APT' + Date.now().toString().slice(-8)
  }
  
  onMounted(() => {
    console.log('支付页面初始化', {
      paymentMethod: paymentMethod.value,
      useInsurance,
      departmentId: route.query.departmentId
    })
  })
  
  onUnmounted(() => {
    clearInterval(timer.value)
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
 
 .payment-page {
   background: #f5f7fa;
   min-height: 100vh;
   padding: 20px;
   box-sizing: border-box;
 }
 
 .page-header {
   text-align: center;
   margin-bottom: 24px;
 
   h2 {
     font-size: 32px;
     font-weight: 700;
     color: $text;
     margin: 0 0 10px;
   }
 
   .step-indicator {
     display: inline-block;
     padding: 8px 16px;
     border-radius: 20px;
     background: white;
     color: $text-light;
     box-shadow: 0 2px 8px rgba(0,0,0,0.08);
     font-size: 14px;
   }
 }
 
 .payment-container {
   max-width: 1200px;
   margin: 0 auto;
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 20px;
 }
 
 .payment-info-card,
 .method-select-card {
   border-radius: 16px;
   border: 1px solid $border;
   overflow: hidden;
   box-shadow: 0 4px 20px rgba(0,0,0,0.06);
 }
 
 .payment-amount {
   padding: 20px 24px;
   background: linear-gradient(135deg, $bg-light, white);
   border-bottom: 1px solid $border;
 
   .amount-label {
     font-size: 14px;
     color: $text-light;
     margin-bottom: 6px;
   }
   .amount-value {
     font-size: 28px;
     font-weight: 800;
     color: $primary;
   }
 }
 
 .payment-details {
   padding: 16px 24px 24px;
   display: grid;
   grid-template-columns: 1fr;
   gap: 10px;
 
   .detail-item {
     display: flex;
     justify-content: space-between;
     align-items: center;
     background: $bg-light;
     border-radius: 10px;
     padding: 10px 14px;
     border-left: 4px solid $primary;
 
     &.insurance {
       border-left-color: $success;
     }
 
     .label {
       color: $text-light;
       font-size: 14px;
     }
     .value {
       color: $text;
       font-weight: 600;
       font-size: 15px;
     }
   }
 }
 
 .method-options {
   padding: 16px;
   display: grid;
   grid-template-columns: 1fr;
   gap: 12px;
 }
 
 .method-option {
   display: flex;
   align-items: center;
   gap: 14px;
   padding: 14px 16px;
   border: 2px solid $border;
   border-radius: 12px;
   background: white;
   cursor: pointer;
   transition: all 0.25s ease;
 
   &:hover {
     border-color: $primary;
     box-shadow: 0 6px 20px rgba(26,117,188,0.15);
     transform: translateY(-2px);
   }
 
   &.active {
     border-color: $primary;
     background: linear-gradient(135deg, rgba(26,117,188,0.06), rgba(26,117,188,0.12));
     box-shadow: 0 6px 20px rgba(26,117,188,0.22);
   }
 
   .method-icon {
     width: 42px;
     height: 42px;
     border-radius: 12px;
     background: $bg-light;
     display: flex;
     align-items: center;
     justify-content: center;
     color: $primary;
     font-size: 20px;
   }
 
   .method-text {
     .method-name { font-size: 16px; font-weight: 700; color: $text; }
     .method-desc { font-size: 13px; color: $text-light; margin-top: 2px; }
   }
 }
 
 .payment-actions {
   max-width: 1200px;
   margin: 24px auto 12px;
   display: flex;
   align-items: center;
   gap: 16px;
 
   .pay-button {
     border-radius: 28px;
     padding: 14px 28px;
     font-size: 16px;
     display: inline-flex;
     align-items: center;
     gap: 8px;
   }
 
   .security-tips {
     background: white;
     color: $text-light;
     padding: 10px 16px;
     border-radius: 20px;
     box-shadow: 0 2px 8px rgba(0,0,0,0.08);
     display: inline-flex;
     align-items: center;
     gap: 8px;
   }
 }
 
 .action-buttons {
   display: flex;
   justify-content: center;
   margin-top: 4px;
 
   :deep(.el-button) {
     border-radius: 24px;
     padding: 12px 22px;
   }
 }
 
 // 二维码弹窗
 .qr-code-dialog {
   display: grid;
   grid-template-columns: 1fr auto;
   gap: 16px;
   align-items: center;
 }
 
 .qr-code-mock {
   background: $bg-light;
   border: 1px dashed $border;
   border-radius: 12px;
   padding: 16px;
   display: grid;
   grid-template-rows: 140px auto;
   gap: 10px;
 
   .qr-code-image {
     display: flex;
     align-items: center;
     justify-content: center;
     color: $text-light;
     background: white;
     border-radius: 8px;
     font-size: 22px;
   }
   .qr-code-info {
     text-align: center;
     .amount { color: $primary; font-weight: 700; }
   }
 }
 
 .payment-timer {
   display: flex;
   align-items: center;
   flex-direction: column;
   gap: 6px;
   
   .timer-text { font-size: 14px; font-weight: 700; color: $text; }
   .timer-tip { font-size: 12px; color: $text-light; }
 }
 
 // 响应式
 @media (max-width: 992px) {
   .payment-container {
     grid-template-columns: 1fr;
   }
 }
 
 @media (max-width: 768px) {
   .payment-page { padding: 16px; }
   .page-header h2 { font-size: 26px; }
   .payment-actions { flex-direction: column; align-items: stretch; }
   .payment-actions .security-tips { justify-content: center; }
 }
 </style>