<template>
    <div class="payment-result-page">
      <div class="result-container">
        <!-- 失败图标 -->
        <div class="result-icon failed">
          <el-icon><CircleClose /></el-icon>
        </div>
  
        <!-- 结果标题 -->
        <h1 class="result-title">支付失败</h1>
  
        <!-- 失败原因 -->
        <div class="error-message">
          <p>支付过程中出现问题，请重试或选择其他支付方式</p>
          <div class="error-code" v-if="errorCode">
            错误代码: {{ errorCode }}
          </div>
        </div>
  
        <!-- 支付信息 -->
        <div class="result-info">
          <div class="info-card">
            <div class="info-item">
              <span class="label">支付金额:</span>
              <span class="value amount">¥{{ paymentAmount }}</span>
            </div>
            <div class="info-item">
              <span class="label">支付方式:</span>
              <span class="value">{{ paymentMethodText }}</span>
            </div>
            <div class="info-item">
              <span class="label">失败时间:</span>
              <span class="value">{{ paymentTime }}</span>
            </div>
          </div>
        </div>
  
        <!-- 失败原因提示 -->
        <div class="failure-reasons">
          <h3>可能的原因：</h3>
          <ul>
            <li>网络连接不稳定</li>
            <li>账户余额不足</li>
            <li>支付密码错误</li>
            <li>银行系统维护中</li>
            <li>支付超时</li>
          </ul>
        </div>
  
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="retryPayment" class="action-button">
            <el-icon><Refresh /></el-icon>
            重新支付
          </el-button>
          <el-button @click="changePaymentMethod" class="action-button">
            <el-icon><CreditCard /></el-icon>
            更换支付方式
          </el-button>
          <el-button @click="goHome" class="action-button">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
        </div>
  
        <!-- 客服信息 -->
        <div class="customer-service">
          <h4>需要帮助？</h4>
          <p>如果您遇到问题，请联系我们的客服中心</p>
          <div class="contact-info">
            <div class="contact-item">
              <el-icon><Phone /></el-icon>
              服务热线: 400-123-4567
            </div>
            <div class="contact-item">
              <el-icon><Clock /></el-icon>
              服务时间: 8:00-22:00
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import {
    CircleClose,
    Refresh,
    CreditCard,
    HomeFilled,
    Phone,
    Clock
  } from '@element-plus/icons-vue'
  
  const router = useRouter()
  const route = useRoute()
  
  // 从路由参数获取支付信息
  const paymentAmount = ref(route.query.amount || '0')
  const paymentMethod = ref(route.query.method || 'alipay')
  const errorCode = ref(route.query.errorCode || '')
  
  // 支付方式映射
  const paymentMethods = {
    alipay: '支付宝',
    wechat: '微信支付',
    digital: '数字人民币',
    medical: '职工医保'
  }
  
  const paymentTime = ref(new Date().toLocaleString('zh-CN'))
  const paymentMethodText = ref(paymentMethods[paymentMethod.value] || '支付宝')
  
  const retryPayment = () => {
    // 返回支付页面重试
    router.back()
  }
  
  const changePaymentMethod = () => {
    // 返回支付方式选择页面
    router.push({
      path: '/self-service/payment-method',
      query: {
        departmentId: route.query.departmentId,
        doctorId: route.query.doctorId
      }
    })
  }
  
  const goHome = () => {
    router.push('/self-service')
  }
  
  onMounted(() => {
    console.log('支付失败页面初始化', {
      amount: paymentAmount.value,
      method: paymentMethod.value,
      errorCode: errorCode.value
    })
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
    
    .payment-result-page {
      background: #f5f7fa;
      min-height: 100vh;
      padding: 24px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .result-container {
      width: 100%;
      max-width: 900px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 6px 30px rgba(0,0,0,0.08);
      padding: 32px 28px;
    }
    
    .result-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      font-size: 40px;
      &.failed { background: rgba(245, 108, 108, 0.12); color: $danger; }
    }
    
    .result-title {
      text-align: center;
      font-size: 28px;
      font-weight: 800;
      color: $text;
      margin: 6px 0 18px;
    }
    
    .error-message {
      background: linear-gradient(135deg, rgba(245,108,108,0.06), rgba(245,108,108,0.12));
      border: 1px solid rgba(245,108,108,0.35);
      color: darken($danger, 10%);
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 16px;
      text-align: center;
      .error-code {
        margin-top: 6px;
        font-weight: 700;
        color: $danger;
      }
    }
    
    .result-info {
      margin-bottom: 16px;
      .info-card {
        background: linear-gradient(135deg, $bg-light, white);
        border: 1px solid $border;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: white;
          border-radius: 8px;
          border-left: 4px solid $primary;
          & + .info-item { margin-top: 10px; }
          .label { color: $text-light; font-size: 14px; }
          .value { color: $text; font-weight: 700; font-size: 16px; }
          .amount { color: $primary; }
        }
      }
    }
    
    .failure-reasons {
      margin: 10px 0 22px;
      h3 { font-size: 18px; color: $text; margin: 0 0 10px; font-weight: 700; }
      ul { margin: 0; padding-left: 18px; }
      li { color: $text-light; line-height: 1.6; }
    }
    
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin: 12px 0 18px;
    
      .action-button {
        border-radius: 24px;
        padding: 12px 22px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(26,117,188,0.15); }
      }
    }
    
    .customer-service {
      background: white;
      border: 1px solid $border;
      border-radius: 12px;
      padding: 16px 18px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
      text-align: center;
      h4 { margin: 0 0 6px; font-size: 16px; color: $text; }
      p { margin: 0 0 12px; color: $text-light; }
      .contact-info { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
      .contact-item { display: flex; align-items: center; justify-content: center; gap: 8px; color: $text; }
    }
    
    @media (max-width: 768px) {
      .payment-result-page { padding: 16px; }
      .result-container { padding: 22px 16px; }
      .action-buttons { flex-direction: column; }
      .customer-service .contact-info { grid-template-columns: 1fr; }
    }
  </style>