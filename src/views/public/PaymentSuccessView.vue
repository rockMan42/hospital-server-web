<template>
    <div class="payment-result-page">
      <div class="result-container">
        <!-- 成功图标 -->
        <div class="result-icon success">
          <el-icon><CircleCheck /></el-icon>
        </div>
  
        <!-- 结果标题 -->
        <h1 class="result-title">支付成功！</h1>
  
        <!-- 结果信息 -->
        <div class="result-info">
          <div class="info-card">
            <div class="info-item">
              <span class="label">预约编号:</span>
              <span class="value">{{ appointmentId }}</span>
            </div>
            <div class="info-item">
              <span class="label">支付金额:</span>
              <span class="value amount">¥{{ paymentAmount }}</span>
            </div>
            <div class="info-item">
              <span class="label">支付方式:</span>
              <span class="value">{{ paymentMethodText }}</span>
            </div>
            <div class="info-item">
              <span class="label">支付时间:</span>
              <span class="value">{{ paymentTime }}</span>
            </div>
          </div>
        </div>
  
        <!-- 预约详情 -->
        <div class="appointment-details">
          <h3>预约详情</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">科室:</span>
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
              <span class="label">诊室:</span>
              <span class="value">{{ appointmentInfo.room }}</span>
            </div>
          </div>
        </div>
  
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="printReceipt" class="action-button">
            <el-icon><Printer /></el-icon>
            打印凭条
          </el-button>
          <el-button @click="sendSMS" class="action-button">
            <el-icon><Message /></el-icon>
            发送短信
          </el-button>
          <el-button @click="goHome" class="action-button">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
        </div>
  
        <!-- 温馨提示 -->
        <div class="tips">
          <h4>温馨提示</h4>
          <ul>
            <li>请提前15分钟到达医院候诊</li>
            <li>就诊时请携带身份证和医保卡</li>
            <li>如需改期或取消预约，请提前2小时操作</li>
            <li>如有疑问，请咨询导诊台或拨打服务热线</li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    CircleCheck,
    Printer,
    Message,
    HomeFilled
  } from '@element-plus/icons-vue'
  
  const router = useRouter()
  const route = useRoute()
  
  // 从路由参数获取支付信息
  const paymentAmount = ref(route.query.amount || '0')
  const paymentMethod = ref(route.query.method || 'alipay')
  const appointmentId = ref(route.query.appointmentId || '')
  
  // 支付方式映射
  const paymentMethods = {
    alipay: '支付宝',
    wechat: '微信支付',
    digital: '数字人民币',
    medical: '职工医保'
  }
  
  const paymentTime = ref(new Date().toLocaleString('zh-CN'))
  const paymentMethodText = ref(paymentMethods[paymentMethod.value] || '支付宝')
  
  // 模拟预约信息
  const appointmentInfo = ref({
    department: '内科',
    doctor: '张医生',
    time: '2024-01-15 10:30',
    room: '内科诊室3'
  })
  
  const printReceipt = () => {
    ElMessage.success('打印指令已发送，请到打印机处取件')
    // 实际项目中这里会调用打印接口
  }
  
  const sendSMS = () => {
    ElMessage.success('预约信息已发送到您的手机')
    // 实际项目中这里会调用短信接口
  }
  
  const goHome = () => {
    router.push('/self-service')
  }
  
  onMounted(() => {
    console.log('支付成功页面初始化', {
      amount: paymentAmount.value,
      method: paymentMethod.value,
      appointmentId: appointmentId.value
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
      &.success { background: rgba(103, 194, 58, 0.12); color: $success; }
    }
    
    .result-title {
      text-align: center;
      font-size: 28px;
      font-weight: 800;
      color: $text;
      margin: 6px 0 18px;
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
    
    .appointment-details {
      margin: 10px 0 22px;
      h3 { font-size: 18px; color: $text; margin: 0 0 10px; font-weight: 700; }
      .details-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: $bg-light;
          border-radius: 10px;
          padding: 10px 14px;
          border-left: 4px solid $primary;
          .label { color: $text-light; font-size: 14px; }
          .value { color: $text; font-weight: 600; font-size: 15px; }
        }
      }
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
    
    .tips {
      background: white;
      border: 1px solid $border;
      border-radius: 12px;
      padding: 16px 18px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
      h4 { margin: 0 0 8px; font-size: 16px; color: $text; }
      ul { margin: 0; padding-left: 18px; }
      li { color: $text-light; line-height: 1.6; }
    }
    
    @media (max-width: 768px) {
      .payment-result-page { padding: 16px; }
      .result-container { padding: 22px 16px; }
      .appointment-details .details-grid { grid-template-columns: 1fr; }
      .action-buttons { flex-direction: column; }
    }
  </style>