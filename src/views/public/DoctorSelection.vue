<template>
    <div class="doctor-selection">
      <div class="page-header">
        <h2>选择医生</h2>
        <div class="step-indicator">步骤 3/4</div>
      </div>
  
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入医生姓名或职称搜索"
          prefix-icon="Search"
          clearable
          @input="handleSearch"
          size="large"
        />
      </div>
  
      <div class="doctor-buttons">
        <div class="button-row" v-for="(row, rowIndex) in buttonRows" :key="rowIndex">
          <el-button
            v-for="doctor in row"
            :key="doctor.id"
            class="doctor-button"
            @click="selectDoctor(doctor)"
          >
            <div class="button-content">
              <div class="avatar-container">
                <img :src="doctor.avatar" :alt="doctor.name" class="doctor-avatar" />
                <div class="online-indicator" :class="{ online: doctor.isOnline }"></div>
              </div>
              <div class="button-text">
                <div class="doctor-name">{{ doctor.name }}</div>
                <div class="doctor-title">{{ doctor.title }}</div>
                <div class="doctor-status">
                  <span class="specialty">擅长: {{ doctor.specialty }}</span>
                  <div class="remaining-container">
                    <span class="remaining-label">剩余号源:</span>
                    <span class="remaining-count" :class="{ low: doctor.remainingCount < 5 }">
                      {{ doctor.remainingCount }}个
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </el-button>
        </div>
      </div>
  
      <div class="pagination-controls">
        <el-button 
          class="page-button prev-button"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <el-icon><ArrowLeft /></el-icon>
          上一页
        </el-button>
        <div class="page-indicator">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </div>
        <el-button 
          class="page-button next-button"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="action-buttons">
        <el-button class="back-button" @click="goBack">
          <el-icon><Back /></el-icon>
          返回诊室选择
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { Search, ArrowLeft, ArrowRight, Back } from '@element-plus/icons-vue'
  
  const router = useRouter()
  const route = useRoute()
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(8) // 每页显示8个医生（2行×4个）
  
  // 生成随机医生头像URL
  const generateAvatarUrl = (id, gender = 'men') => {
    const randomId = Math.floor(Math.random() * 70) + 1;
    return `https://randomuser.me/api/portraits/${gender}/${randomId}.jpg`;
  };
  
  // 模拟医生数据
  const doctors = ref([
    { 
      id: 1, 
      name: '张明远', 
      title: '主任医师', 
      specialty: '心血管疾病诊治', 
      rating: 4.8, 
      waitingCount: 5,
      remainingCount: 12, // 新增剩余号源字段
      avatar: generateAvatarUrl(1),
      departmentId: 1,
      isOnline: true
    },
    { 
      id: 2, 
      name: '李静怡', 
      title: '副主任医师', 
      specialty: '呼吸系统疾病', 
      rating: 4.5, 
      waitingCount: 3,
      remainingCount: 8, // 新增剩余号源字段
      avatar: generateAvatarUrl(2, 'women'),
      departmentId: 1,
      isOnline: true
    },
    { 
      id: 3, 
      name: '王建国', 
      title: '主治医师', 
      specialty: '消化系统疾病', 
      rating: 4.2, 
      waitingCount: 8,
      remainingCount: 19, // 新增剩余号源字段
      avatar: generateAvatarUrl(3),
      departmentId: 1,
      isOnline: false
    },
    { 
      id: 4, 
      name: '赵雪梅', 
      title: '主任医师', 
      specialty: '神经系统疾病', 
      rating: 4.9, 
      waitingCount: 2,
      remainingCount: 3, // 新增剩余号源字段
      avatar: generateAvatarUrl(4, 'women'),
      departmentId: 1,
      isOnline: true
    },
    { 
      id: 5, 
      name: '刘欣', 
      title: '副主任医师', 
      specialty: '儿科疾病', 
      rating: 4.7, 
      waitingCount: 6,
      remainingCount: 6, // 新增剩余号源字段
      avatar: generateAvatarUrl(5, 'women'),
      departmentId: 4,
      isOnline: true
    },
    { 
      id: 6, 
      name: '陈志强', 
      title: '主治医师', 
      specialty: '皮肤疾病', 
      rating: 4.3, 
      waitingCount: 4,
      remainingCount: 12, // 新增剩余号源字段
      avatar: generateAvatarUrl(6),
      departmentId: 8,
      isOnline: false
    },
    { 
      id: 7, 
      name: '杨晓华', 
      title: '主任医师', 
      specialty: '眼科疾病', 
      rating: 4.6, 
      waitingCount: 7,
      remainingCount: 7, // 新增剩余号源字段
      avatar: generateAvatarUrl(7, 'women'),
      departmentId: 5,
      isOnline: true
    },
    { 
      id: 8, 
      name: '周文博', 
      title: '副主任医师', 
      specialty: '耳鼻喉疾病', 
      rating: 4.4, 
      waitingCount: 5,
      remainingCount: 30, // 新增剩余号源字段
      avatar: generateAvatarUrl(8),
      departmentId: 6,
      isOnline: true
    },
    { 
      id: 9, 
      name: '吴婷婷', 
      title: '主治医师', 
      specialty: '口腔疾病', 
      rating: 4.1, 
      waitingCount: 3,
      remainingCount: 22, // 新增剩余号源字段
      avatar: generateAvatarUrl(9, 'women'),
      departmentId: 7,
      isOnline: false
    },
    { 
      id: 10, 
      name: '郑雅文', 
      title: '主任医师', 
      specialty: '妇产科疾病', 
      rating: 4.7, 
      waitingCount: 9,
      remainingCount: 18, // 新增剩余号源字段
      avatar: generateAvatarUrl(10, 'women'),
      departmentId: 3,
      isOnline: true
    },
    { 
      id: 11, 
      name: '孙伟', 
      title: '副主任医师', 
      specialty: '外科手术', 
      rating: 4.5, 
      waitingCount: 4,
      remainingCount: 10, // 新增剩余号源字段
      avatar: generateAvatarUrl(11),
      departmentId: 2,
      isOnline: true
    },
    { 
      id: 12, 
      name: '朱宇轩', 
      title: '主治医师', 
      specialty: '心血管疾病', 
      rating: 4.3, 
      waitingCount: 6,
      remainingCount: 9, // 新增剩余号源字段
      avatar: generateAvatarUrl(12),
      departmentId: 1,
      isOnline: false
    }
  ])
  
  // 根据科室ID过滤医生
  const filteredDoctors = computed(() => {
    let result = doctors.value.filter(doctor => 
      doctor.departmentId === parseInt(route.query.departmentId)
    )
    
    if (searchKeyword.value) {
      result = result.filter(doctor =>
        doctor.name.includes(searchKeyword.value) ||
        doctor.title.includes(searchKeyword.value) ||
        doctor.specialty.includes(searchKeyword.value)
      )
    }
    
    return result
  })
  
  // 总页数
  const totalPages = computed(() => {
    return Math.ceil(filteredDoctors.value.length / pageSize.value)
  })
  
  // 分页后的医生数据
  const pagedDoctors = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredDoctors.value.slice(start, end)
  })
  
  // 将医生数据按行分组（每行4个）
  const buttonRows = computed(() => {
    const rows = []
    const items = [...pagedDoctors.value]
    
    while (items.length > 0) {
      rows.push(items.splice(0, 4))
    }
    
    return rows
  })
  
  const selectDoctor = (doctor) => {
    // 直接跳转到预约时间选择页面，传递医生信息
    router.push({
      path: '/self-service/patient-method-selection',
      query: { 
        doctorId: doctor.id,
        doctorName: doctor.name,
        departmentId: route.query.departmentId,
        clinicId: route.query.clinicId
      }
    })
  }
  
  const handleSearch = () => {
    currentPage.value = 1 // 搜索时重置到第一页
  }
  
  onMounted(() => {
    // 组件挂载时的初始化逻辑
    if (!route.query.departmentId) {
      ElMessage.error('请先选择科室')
      router.push('/self-service/department-selection')
      return
    }
    if (!route.query.clinicId) {
      ElMessage.error('请先选择诊室')
      router.push({
        path: '/self-service/clinic-selection',
        query: { departmentId: route.query.departmentId }
      })
    }
  })
  
  const goBack = () => {
    router.push({
      path: '/self-service/clinic-selection',
      query: { departmentId: route.query.departmentId }
    })
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
  
  .doctor-selection {
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
  
  // 医生按钮区域
  .doctor-buttons {
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
  
  .doctor-button {
    background: white;
    border: 2px solid $border;
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 180px;
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
      
      .avatar-container {
        position: relative;
        margin-bottom: 12px;
        
        .doctor-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid $border;
          transition: all 0.3s ease;
        }
        
        .online-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ddd;
          border: 2px solid white;
          
          &.online {
            background: $success;
          }
        }
      }
      
      .button-text {
        width: 100%;
        
        .doctor-name {
          font-size: 18px;
          font-weight: 600;
          color: $text;
          margin-bottom: 4px;
        }
        
        .doctor-title {
          font-size: 14px;
          color: $primary;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .doctor-status {
          .specialty {
            font-size: 12px;
            color: $text-light;
            display: block;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          
          .remaining-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 4px;
            
            .remaining-label {
              font-size: 12px;
              color: $text-light;
            }
            
            .remaining-count {
              font-size: 14px;
              font-weight: 600;
              color: $success;
              
              &.low {
                color: $danger;
              }
            }
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
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      
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
      
      &.prev-button {
        padding-left: 16px;
      }
      
      &.next-button {
        padding-right: 16px;
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
  
  // 操作按钮
  .action-buttons {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    
    .back-button {
      background: white;
      color: $text;
      border: 2px solid $border;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      
      &:hover {
        border-color: $primary;
        color: $primary;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(26, 117, 188, 0.15);
      }
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
    .doctor-selection {
      padding: 15px;
    }
    
    .page-header h2 {
      font-size: 24px;
    }
    
    .button-row {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .doctor-button {
      padding: 16px;
      min-height: 160px;
      
      .button-content {
        .avatar-container .doctor-avatar {
          width: 50px;
          height: 50px;
        }
        
        .button-text .doctor-name {
          font-size: 16px;
        }
      }
    }
    
    .pagination-controls {
      flex-direction: column;
      gap: 15px;
      
      .page-button {
        width: 200px;
        justify-content: center;
      }
    }
  }
  
  @media (max-width: 480px) {
    .button-row {
      grid-template-columns: 1fr;
    }
    
    .doctor-button {
      .button-content {
        flex-direction: row;
        text-align: left;
        align-items: flex-start;
        
        .avatar-container {
          margin-right: 16px;
          margin-bottom: 0;
          flex-shrink: 0;
        }
        
        .button-text {
          flex: 1;
          
          .doctor-status .remaining-container {
            justify-content: flex-start;
          }
        }
      }
    }
  }
  </style>