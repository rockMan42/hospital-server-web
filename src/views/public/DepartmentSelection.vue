<template>
    <div class="department-selection">
      <div class="page-header">
        <h2>选择挂号科室</h2>
        <div class="step-indicator">步骤 1/4</div>
      </div>
  
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入科室名称搜索"
          prefix-icon="Search"
          clearable
          @input="handleSearch"
          size="large"
        />
      </div>
  
      <div class="department-buttons">
        <div class="button-row" v-for="(row, rowIndex) in buttonRows" :key="rowIndex">
          <el-button
            v-for="department in row"
            :key="department.id"
            class="department-button"
            @click="selectDepartment(department)"
          >
            <div class="button-content">
              <el-icon class="button-icon"><OfficeBuilding /></el-icon>
              <div class="button-text">
                <div class="department-name">{{ department.name }}</div>
                <div class="department-status">
                  <span class="waiting">等候: {{ department.waitingCount }}</span>
                  <span class="doctors">医生: {{ department.doctorCount }}</span>
                </div>
              </div>
            </div>
          </el-button>
        </div>
      </div>
  
      <div class="pagination-controls">
        <el-button 
          class="page-button"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </el-button>
        <div class="page-indicator">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </div>
        <el-button 
          class="page-button"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    OfficeBuilding,
    ArrowRight,
    Search
  } from '@element-plus/icons-vue'
  
  const router = useRouter()
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(8) // 每页显示8个科室（2行×4个）
  
  // 模拟科室数据
  const departments = ref([
    { id: 1, name: '内科', description: '治疗呼吸、消化、心血管等内科疾病', waitingCount: 15, doctorCount: 8 },
    { id: 2, name: '外科', description: '手术治疗各种外科疾病', waitingCount: 8, doctorCount: 6 },
    { id: 3, name: '妇产科', description: '妇科和产科疾病诊治', waitingCount: 12, doctorCount: 7 },
    { id: 4, name: '儿科', description: '儿童疾病诊治', waitingCount: 20, doctorCount: 5 },
    { id: 5, name: '眼科', description: '眼部疾病诊治', waitingCount: 6, doctorCount: 4 },
    { id: 6, name: '耳鼻喉科', description: '耳鼻喉疾病诊治', waitingCount: 10, doctorCount: 3 },
    { id: 7, name: '口腔科', description: '口腔疾病诊治', waitingCount: 5, doctorCount: 4 },
    { id: 8, name: '皮肤科', description: '皮肤疾病诊治', waitingCount: 7, doctorCount: 3 },
    { id: 9, name: '神经内科', description: '神经系统疾病诊治', waitingCount: 9, doctorCount: 5 },
    { id: 10, name: '心血管科', description: '心脏和血管疾病诊治', waitingCount: 11, doctorCount: 6 },
    { id: 11, name: '呼吸科', description: '呼吸系统疾病诊治', waitingCount: 7, doctorCount: 4 },
    { id: 12, name: '消化科', description: '消化系统疾病诊治', waitingCount: 10, doctorCount: 5 },
    { id: 13, name: '消化科', description: '消化系统疾病诊治', waitingCount: 10, doctorCount: 5 }
  ])
  
  // 过滤后的科室列表
  const filteredDepartments = computed(() => {
    if (!searchKeyword.value) return departments.value
    return departments.value.filter(dept =>
      dept.name.includes(searchKeyword.value) ||
      dept.description.includes(searchKeyword.value)
    )
  })
  
  // 总页数
  const totalPages = computed(() => {
    return Math.ceil(filteredDepartments.value.length / pageSize.value)
  })
  
  // 分页后的科室数据
  const pagedDepartments = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredDepartments.value.slice(start, end)
  })
  
  // 将科室数据按行分组（每行4个）
  const buttonRows = computed(() => {
    const rows = []
    const items = [...pagedDepartments.value]
    
    while (items.length > 0) {
      rows.push(items.splice(0, 4))
    }
    
    return rows
  })
  
  const selectDepartment = (department) => {
    // 先跳转到诊室选择页面，传递科室信息
    router.push({
      path: '/self-service/clinic-selection',
      query: { departmentId: department.id }
    })
  }
  
  const handleSearch = () => {
    currentPage.value = 1 // 搜索时重置到第一页
  }
  
  onMounted(() => {
    // 组件挂载时的初始化逻辑
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
  
  .department-selection {
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
    
    h2 {
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
  
  // 搜索框
  .search-box {
    max-width: 600px;
    margin: 0 auto 40px;
    
    :deep(.el-input) {
      .el-input__wrapper {
        border-radius: 25px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 2px solid transparent;
        transition: all 0.3s ease;
        
        &:hover {
          box-shadow: 0 6px 20px rgba(26, 117, 188, 0.15);
        }
        
        &.is-focus {
          border-color: $primary;
          box-shadow: 0 6px 20px rgba(26, 117, 188, 0.25);
        }
      }
      
      .el-input__inner {
        font-size: 16px;
        padding: 0 20px;
      }
    }
  }
  
  // 科室按钮区域
  .department-buttons {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .button-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .department-button {
    background: white;
    border: 2px solid $border;
    border-radius: 16px;
    padding: 24px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    &:hover {
      border-color: $primary;
      box-shadow: 0 8px 25px rgba(26, 117, 188, 0.15);
      transform: translateY(-2px);
    }
    
    .button-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      
      .button-icon {
        font-size: 32px;
        color: $primary;
        margin-bottom: 12px;
      }
      
      .button-text {
        .department-name {
          font-size: 18px;
          font-weight: 600;
          color: $text;
          margin-bottom: 8px;
        }
        
        .department-status {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: $text-light;
          
          .waiting {
            color: $warning;
          }
          
          .doctors {
            color: $success;
          }
        }
      }
    }
  }
  
  // 分页控制
  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 40px;
    
    .page-button {
      background: $primary;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover:not(:disabled) {
        background: darken($primary, 10%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(26, 117, 188, 0.3);
      }
      
      &:disabled {
        background: #c0c4cc;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }
    
    .page-indicator {
      font-size: 16px;
      color: $text;
      background: white;
      padding: 12px 20px;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  // 响应式设计
  @media (max-width: 1200px) {
    .button-row {
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
  }
  
  @media (max-width: 768px) {
    .department-selection {
      padding: 15px;
    }
    
    .page-header h2 {
      font-size: 24px;
    }
    
    .button-row {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .department-button {
      padding: 20px 16px;
      min-height: 120px;
      
      .button-content .button-text .department-name {
        font-size: 16px;
      }
    }
    
    .pagination-controls {
      flex-direction: column;
      gap: 15px;
      
      .page-button {
        width: 200px;
      }
    }
  }
  
  @media (max-width: 480px) {
    .button-row {
      grid-template-columns: 1fr;
    }
    
    .department-button {
      .button-content {
        flex-direction: row;
        text-align: left;
        
        .button-icon {
          margin-right: 16px;
          margin-bottom: 0;
        }
      }
    }
  }
  </style>