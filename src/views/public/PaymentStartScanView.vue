<template>
    <div class="outpatient-payment">
      <div class="page-header">
        <h2>门诊缴费</h2>
        <div class="step-indicator">步骤 1/2：扫描就诊号</div>
      </div>
  
      <div class="payment-container">
        <div class="scan-section">
          <div class="section-title">
            <el-icon><Camera /></el-icon>
            <span>扫码缴费</span>
          </div>
          
          <div class="scan-box" @click="handleScan">
            <div class="scan-line"></div>
            <el-icon class="scan-icon"><Camera /></el-icon>
            <div class="scan-text">将就诊号条形码放入框内，即可自动扫描</div>
            <div class="scan-hint">点击可手动触发扫码</div>
          </div>
          
          <div class="manual-input">
            <div class="input-title">
              <el-icon><Document /></el-icon>
              <span>手动输入就诊号</span>
            </div>
            <div class="input-row">
              <el-input
                v-model="visitNumber"
                placeholder="请输入就诊号"
                clearable
              >
                <template #append>
                  <el-button @click="handleManualInput" :icon="Search" />
                </template>
              </el-input>
            </div>
          </div>
        </div>
        
        <div class="instructions-section">
          <div class="section-title">
            <el-icon><InfoFilled /></el-icon>
            <span>操作指引</span>
          </div>
          
          <ul class="instructions-list">
            <li>
              <el-icon class="instruction-icon"><InfoFilled /></el-icon>
              <div class="instruction-text">
                请确保就诊号正确，系统将自动关联您的待缴费项目
              </div>
            </li>
            <li>
              <el-icon class="instruction-icon"><InfoFilled /></el-icon>
              <div class="instruction-text">
                扫码成功后，系统将显示您的待缴费清单，请核对信息后再支付
              </div>
            </li>
            <li>
              <el-icon class="instruction-icon"><InfoFilled /></el-icon>
              <div class="instruction-text">
                支付成功后，您可以在"我的缴费记录"中查看电子收据
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="action-buttons">
        <el-button class="back-button" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回首页</span>
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { ElMessage, ElIcon, ElInput, ElButton } from 'element-plus';
  import { Search, Camera, Document, ArrowLeft, InfoFilled } from '@element-plus/icons-vue';
  
  const visitNumber = ref('');
  
  const handleScan = () => {
    // 模拟扫码成功
    ElMessage.success('扫码成功！正在获取缴费信息...');
    // 这里实际应该跳转到缴费清单页面
  };
  
  const handleManualInput = () => {
    if (!visitNumber.value) {
      ElMessage.warning('请输入就诊号');
      return;
    }
    ElMessage.success(`查询就诊号: ${visitNumber.value}`);
    // 这里实际应该跳转到缴费清单页面
  };
  
  const goBack = () => {
    ElMessage.info('返回首页');
    // 实际应使用路由返回
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
    
    .outpatient-payment {
      background: #f5f7fa;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
    }
    
    .page-header {
      text-align: center;
      margin-bottom: 24px;
      h2 { font-size: 32px; font-weight: 800; color: $text; margin: 0 0 8px; }
      .step-indicator {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        background: white;
        color: $text-light;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
    }
    
    .payment-container {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 20px;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      color: $text;
      margin-bottom: 12px;
      .el-icon { color: $primary; }
    }
    
    .scan-box {
      position: relative;
      background: white;
      border: 2px dashed $border;
      border-radius: 16px;
      height: 260px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: box-shadow .2s ease, transform .2s ease, border-color .2s ease;
    
      &:hover { box-shadow: 0 8px 24px rgba(26,117,188,0.15); transform: translateY(-2px); border-color: $primary; }
    
      .scan-line {
        position: absolute;
        top: 20px;
        left: 16px;
        right: 16px;
        height: 3px;
        background: linear-gradient(90deg, transparent, rgba(26,117,188,0.6), transparent);
        border-radius: 3px;
        animation: sweep 2.2s linear infinite;
      }
      .scan-icon { font-size: 32px; color: $primary; }
      .scan-text { color: $text; font-weight: 600; }
      .scan-hint { color: $text-light; font-size: 12px; }
    }
    
    @keyframes sweep {
      0% { top: 20px; }
      50% { top: calc(100% - 20px); }
      100% { top: 20px; }
    }
    
    .manual-input {
      margin-top: 16px;
      background: white;
      border: 1px solid $border;
      border-radius: 12px;
      padding: 14px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    
      .input-title { @extend .section-title; margin-bottom: 10px; }
      .input-row :deep(.el-input) {
        .el-input__wrapper { border-radius: 10px; }
      }
    }
    
    .instructions-section {
      background: white;
      border: 1px solid $border;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    
    .instructions-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
      li {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;
        align-items: start;
        background: $bg-light;
        border-left: 4px solid $primary;
        border-radius: 10px;
        padding: 10px 12px;
        .instruction-icon { color: $primary; }
        .instruction-text { color: $text; line-height: 1.5; }
      }
    }
    
    .action-buttons {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    
      .back-button {
        background: white;
        color: $text;
        border: 2px solid $border;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        &:hover { border-color: $primary; color: $primary; box-shadow: 0 6px 20px rgba(26,117,188,0.15); transform: translateY(-2px); }
      }
    }
    
    @media (max-width: 992px) {
      .payment-container { grid-template-columns: 1fr; }
    }
    
    @media (max-width: 768px) {
      .outpatient-payment { padding: 16px; }
      .page-header h2 { font-size: 26px; }
    }
  </style>