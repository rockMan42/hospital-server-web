<template>
  <div class="settings-manager">
    <!-- 顶部导航栏 -->
    <AdminHeader 
      title="医院管理系统"
      :notification-count="1"
      @notification-click="handleNotificationClick"
      @profile-click="handleProfileClick"
      @settings-click="handleSettingsClick"
    />

    <!-- 主体布局 -->
    <div class="main-layout">
      <!-- 左侧菜单 - 使用SideLeft组件 -->
      <SideLeft :activeMenu="'settings'" />

      <!-- 主内容区 -->
      <main class="content">
        <div class="page-header">
          <h1>系统设置</h1>
          <p>管理系统配置和维护选项</p>
        </div>

        <!-- 系统状态卡片 -->
        <div class="stats-cards">
          <div class="card">
            <div class="card-icon bg-blue">🖥️</div>
            <div class="card-info">
              <h3>系统状态</h3>
              <p class="number status-text" :class="systemStatus.class">{{ systemStatus.text }}</p>
              <p class="desc">运行时间: {{ systemUptime }}</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">👥</div>
            <div class="card-info">
              <h3>在线用户</h3>
              <p class="number">{{ onlineUsers }}</p>
              <p class="desc">总用户: {{ totalUsers }}</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">💾</div>
            <div class="card-info">
              <h3>存储使用</h3>
              <p class="number">{{ storageUsage }}%</p>
              <p class="desc">{{ usedStorage }} / {{ totalStorage }}</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">🔄</div>
            <div class="card-info">
              <h3>最后备份</h3>
              <p class="number">{{ lastBackupStatus }}</p>
              <p class="desc">{{ lastBackupTime }}</p>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="backupSystem">
            <span class="icon">💾</span> 备份系统
          </button>
          <button class="action-btn outline" @click="clearCache">
            <span class="icon">🗑️</span> 清理缓存
          </button>
          <button class="action-btn outline" @click="restartSystem">
            <span class="icon">🔄</span> 重启系统
          </button>
          <button class="action-btn outline" @click="exportLogs">
            <span class="icon">📋</span> 导出日志
          </button>
        </div>

        <!-- 设置选项卡 -->
        <div class="settings-tabs">
          <div class="tab-headers">
            <button 
              v-for="tab in settingsTabs" 
              :key="tab.key"
              class="tab-header" 
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              {{ tab.name }}
            </button>
          </div>

          <div class="tab-content">
            <!-- 基础设置 -->
            <div v-if="activeTab === 'basic'" class="settings-section">
              <div class="section-title">
                <h3>基础设置</h3>
                <p>配置系统基本信息和参数</p>
              </div>
              
              <div class="settings-grid">
                <div class="setting-item">
                  <div class="setting-label">
                    <h4>系统名称</h4>
                    <p>显示在页面标题和登录页面</p>
                  </div>
                  <div class="setting-control">
                    <input v-model="settings.basic.systemName" type="text" class="setting-input">
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>医院名称</h4>
                    <p>医院的完整名称</p>
                  </div>
                  <div class="setting-control">
                    <input v-model="settings.basic.hospitalName" type="text" class="setting-input">
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>联系电话</h4>
                    <p>医院主要联系电话</p>
                  </div>
                  <div class="setting-control">
                    <input v-model="settings.basic.contactPhone" type="text" class="setting-input">
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>医院地址</h4>
                    <p>医院详细地址信息</p>
                  </div>
                  <div class="setting-control">
                    <textarea v-model="settings.basic.address" class="setting-textarea" rows="3"></textarea>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>时区设置</h4>
                    <p>系统默认时区</p>
                  </div>
                  <div class="setting-control">
                    <select v-model="settings.basic.timezone" class="setting-select">
                      <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                      <option value="Asia/Beijing">Asia/Beijing (UTC+8)</option>
                      <option value="UTC">UTC (UTC+0)</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>语言设置</h4>
                    <p>系统界面语言</p>
                  </div>
                  <div class="setting-control">
                    <select v-model="settings.basic.language" class="setting-select">
                      <option value="zh-CN">简体中文</option>
                      <option value="zh-TW">繁体中文</option>
                      <option value="en-US">English</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 安全设置 -->
            <div v-if="activeTab === 'security'" class="settings-section">
              <div class="section-title">
                <h3>安全设置</h3>
                <p>配置系统安全策略和访问控制</p>
              </div>
              
              <div class="settings-grid">
                <div class="setting-item">
                  <div class="setting-label">
                    <h4>密码策略</h4>
                    <p>用户密码复杂度要求</p>
                  </div>
                  <div class="setting-control">
                    <div class="checkbox-group">
                      <label class="checkbox-item">
                        <input type="checkbox" v-model="settings.security.passwordPolicy.requireUppercase">
                        <span>要求大写字母</span>
                      </label>
                      <label class="checkbox-item">
                        <input type="checkbox" v-model="settings.security.passwordPolicy.requireLowercase">
                        <span>要求小写字母</span>
                      </label>
                      <label class="checkbox-item">
                        <input type="checkbox" v-model="settings.security.passwordPolicy.requireNumbers">
                        <span>要求数字</span>
                      </label>
                      <label class="checkbox-item">
                        <input type="checkbox" v-model="settings.security.passwordPolicy.requireSpecialChars">
                        <span>要求特殊字符</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>最小密码长度</h4>
                    <p>用户密码最少字符数</p>
                  </div>
                  <div class="setting-control">
                    <input v-model="settings.security.minPasswordLength" type="number" min="6" max="32" class="setting-input">
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>登录失败锁定</h4>
                    <p>连续登录失败后锁定账户</p>
                  </div>
                  <div class="setting-control">
                    <div class="toggle-switch">
                      <input type="checkbox" v-model="settings.security.enableAccountLockout" id="accountLockout">
                      <label for="accountLockout" class="toggle-label"></label>
                    </div>
                  </div>
                </div>

                <div class="setting-item" v-if="settings.security.enableAccountLockout">
                  <div class="setting-label">
                    <h4>锁定阈值</h4>
                    <p>失败次数达到此值后锁定</p>
                  </div>
                  <div class="setting-control">
                    <input v-model="settings.security.lockoutThreshold" type="number" min="3" max="10" class="setting-input">
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>会话超时</h4>
                    <p>用户无操作自动退出时间（分钟）</p>
                  </div>
                  <div class="setting-control">
                    <input v-model="settings.security.sessionTimeout" type="number" min="15" max="480" class="setting-input">
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>双因素认证</h4>
                    <p>启用两步验证增强安全性</p>
                  </div>
                  <div class="setting-control">
                    <div class="toggle-switch">
                      <input type="checkbox" v-model="settings.security.enableTwoFactor" id="twoFactor">
                      <label for="twoFactor" class="toggle-label"></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 通知设置 -->
            <div v-if="activeTab === 'notification'" class="settings-section">
              <div class="section-title">
                <h3>通知设置</h3>
                <p>配置系统通知和提醒功能</p>
              </div>
              
              <div class="settings-grid">
                <div class="setting-item">
                  <div class="setting-label">
                    <h4>邮件通知</h4>
                    <p>启用邮件通知功能</p>
                  </div>
                  <div class="setting-control">
                    <div class="toggle-switch">
                      <input type="checkbox" v-model="settings.notification.enableEmail" id="emailNotification">
                      <label for="emailNotification" class="toggle-label"></label>
                    </div>
                  </div>
                </div>

                <div class="setting-item" v-if="settings.notification.enableEmail">
                  <div class="setting-label">
                    <h4>SMTP服务器</h4>
                    <p>邮件发送服务器地址</p>
                  </div>
                  <div class="setting-control">
                    <input v-model="settings.notification.smtpServer" type="text" class="setting-input" placeholder="smtp.example.com">
                  </div>
                </div>

                <div class="setting-item" v-if="settings.notification.enableEmail">
                  <div class="setting-label">
                    <h4>发送邮箱</h4>
                    <p>系统发送通知的邮箱地址</p>
                  </div>
                  <div class="setting-control">
                    <input v-model="settings.notification.senderEmail" type="email" class="setting-input" placeholder="noreply@hospital.com">
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>短信通知</h4>
                    <p>启用短信通知功能</p>
                  </div>
                  <div class="setting-control">
                    <div class="toggle-switch">
                      <input type="checkbox" v-model="settings.notification.enableSMS" id="smsNotification">
                      <label for="smsNotification" class="toggle-label"></label>
                    </div>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>系统维护通知</h4>
                    <p>系统维护时自动通知用户</p>
                  </div>
                  <div class="setting-control">
                    <div class="toggle-switch">
                      <input type="checkbox" v-model="settings.notification.maintenanceNotification" id="maintenanceNotification">
                      <label for="maintenanceNotification" class="toggle-label"></label>
                    </div>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>预约提醒</h4>
                    <p>自动发送预约提醒通知</p>
                  </div>
                  <div class="setting-control">
                    <div class="toggle-switch">
                      <input type="checkbox" v-model="settings.notification.appointmentReminder" id="appointmentReminder">
                      <label for="appointmentReminder" class="toggle-label"></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 数据设置 -->
            <div v-if="activeTab === 'data'" class="settings-section">
              <div class="section-title">
                <h3>数据设置</h3>
                <p>配置数据备份和存储策略</p>
              </div>
              
              <div class="settings-grid">
                <div class="setting-item">
                  <div class="setting-label">
                    <h4>自动备份</h4>
                    <p>启用定时自动备份功能</p>
                  </div>
                  <div class="setting-control">
                    <div class="toggle-switch">
                      <input type="checkbox" v-model="settings.data.enableAutoBackup" id="autoBackup">
                      <label for="autoBackup" class="toggle-label"></label>
                    </div>
                  </div>
                </div>

                <div class="setting-item" v-if="settings.data.enableAutoBackup">
                  <div class="setting-label">
                    <h4>备份频率</h4>
                    <p>自动备份的时间间隔</p>
                  </div>
                  <div class="setting-control">
                    <select v-model="settings.data.backupFrequency" class="setting-select">
                      <option value="daily">每日</option>
                      <option value="weekly">每周</option>
                      <option value="monthly">每月</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>备份保留天数</h4>
                    <p>备份文件保留的天数</p>
                  </div>
                  <div class="setting-control">
                    <input v-model="settings.data.backupRetentionDays" type="number" min="7" max="365" class="setting-input">
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>数据压缩</h4>
                    <p>启用数据压缩以节省存储空间</p>
                  </div>
                  <div class="setting-control">
                    <div class="toggle-switch">
                      <input type="checkbox" v-model="settings.data.enableCompression" id="dataCompression">
                      <label for="dataCompression" class="toggle-label"></label>
                    </div>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <h4>日志级别</h4>
                    <p>系统日志记录的详细程度</p>
                  </div>
                  <div class="setting-control">
                    <select v-model="settings.data.logLevel" class="setting-select">
                      <option value="error">错误</option>
                      <option value="warn">警告</option>
                      <option value="info">信息</option>
                      <option value="debug">调试</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="save-section">
          <button class="save-btn" @click="saveSettings" :disabled="!hasChanges">
            <span class="icon">💾</span>
            {{ hasChanges ? '保存设置' : '无更改' }}
          </button>
          <button class="reset-btn" @click="resetSettings" v-if="hasChanges">
            <span class="icon">🔄</span>
            重置
          </button>
        </div>

        <!-- 系统信息 -->
        <div class="system-info">
          <div class="info-header">
            <h3>系统信息</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">系统版本:</span>
              <span class="info-value">{{ systemInfo.version }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据库版本:</span>
              <span class="info-value">{{ systemInfo.dbVersion }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">服务器时间:</span>
              <span class="info-value">{{ currentTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最后更新:</span>
              <span class="info-value">{{ systemInfo.lastUpdate }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import SideLeft from '@/components/manager/SideLeft.vue'
import AdminHeader from '@/components/manager/AdminHeader.vue'

const store = useStore()
const router = useRouter()

// 当前选中的设置标签
const activeTab = ref('basic')

// 设置标签配置
const settingsTabs = ref([
  { key: 'basic', name: '基础设置', icon: '⚙️' },
  { key: 'security', name: '安全设置', icon: '🔒' },
  { key: 'notification', name: '通知设置', icon: '🔔' },
  { key: 'data', name: '数据设置', icon: '💾' }
])

// 系统状态
const systemStatus = ref({
  text: '正常运行',
  class: 'status-normal'
})

const systemUptime = ref('15天 8小时 32分钟')
const onlineUsers = ref(28)
const totalUsers = ref(156)
const storageUsage = ref(68)
const usedStorage = ref('34.2 GB')
const totalStorage = ref('50 GB')
const lastBackupStatus = ref('成功')
const lastBackupTime = ref('2小时前')

// 当前时间
const currentTime = ref(new Date().toLocaleString('zh-CN'))

// 系统信息
const systemInfo = ref({
  version: 'v2.1.3',
  dbVersion: 'MySQL 8.0.32',
  lastUpdate: '2025-09-15 14:30:00'
})

// 设置数据
const settings = ref({
  basic: {
    systemName: '医院管理系统',
    hospitalName: '北京协和医院',
    contactPhone: '010-69156114',
    address: '北京市东城区帅府园1号',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN'
  },
  security: {
    passwordPolicy: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    minPasswordLength: 8,
    enableAccountLockout: true,
    lockoutThreshold: 5,
    sessionTimeout: 120,
    enableTwoFactor: false
  },
  notification: {
    enableEmail: true,
    smtpServer: 'smtp.hospital.com',
    senderEmail: 'noreply@hospital.com',
    enableSMS: false,
    maintenanceNotification: true,
    appointmentReminder: true
  },
  data: {
    enableAutoBackup: true,
    backupFrequency: 'daily',
    backupRetentionDays: 30,
    enableCompression: true,
    logLevel: 'info'
  }
})

// 原始设置数据（用于检测变更）
const originalSettings = ref(JSON.parse(JSON.stringify(settings.value)))

// 检测是否有变更
const hasChanges = computed(() => {
  return JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value)
})

// 定时器ID
let timeUpdateInterval = null

// 生命周期钩子
onMounted(() => {
  // 每秒更新时间
  timeUpdateInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleString('zh-CN')
  }, 1000)
  
  // 模拟获取系统状态
  checkSystemStatus()
})

onUnmounted(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
  }
})

// 方法
const handleNotificationClick = () => {
  ElMessage.info('查看通知功能')
}

const handleProfileClick = () => {
  ElMessage.info('个人资料功能开发中...')
}

const handleSettingsClick = () => {
  ElMessage.info('当前已在设置页面')
}

const checkSystemStatus = () => {
  // 模拟系统状态检查
  const statuses = [
    { text: '正常运行', class: 'status-normal' },
    { text: '运行良好', class: 'status-good' },
    { text: '需要关注', class: 'status-warning' }
  ]
  systemStatus.value = statuses[Math.floor(Math.random() * statuses.length)]
}

const backupSystem = () => {
  ElMessageBox.confirm(
    '确定要立即备份系统数据吗？备份过程可能需要几分钟时间。',
    '确认备份',
    {
      confirmButtonText: '开始备份',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success('备份任务已启动，请稍候...')
    // 模拟备份过程
    setTimeout(() => {
      lastBackupStatus.value = '成功'
      lastBackupTime.value = '刚刚'
      ElNotification({
        title: '备份完成',
        message: '系统数据备份已成功完成',
        type: 'success'
      })
    }, 3000)
  }).catch(() => {
    ElMessage.info('已取消备份')
  })
}

const clearCache = () => {
  ElMessageBox.confirm(
    '确定要清理系统缓存吗？这将清除所有临时文件和缓存数据。',
    '确认清理',
    {
      confirmButtonText: '清理缓存',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('正在清理缓存...')
    setTimeout(() => {
      ElNotification({
        title: '清理完成',
        message: '系统缓存已清理完成，释放了 2.3 GB 空间',
        type: 'success'
      })
      // 更新存储使用率
      storageUsage.value = Math.max(storageUsage.value - 5, 0)
      usedStorage.value = `${(parseFloat(usedStorage.value) - 2.3).toFixed(1)} GB`
    }, 2000)
  }).catch(() => {
    ElMessage.info('已取消清理')
  })
}

const restartSystem = () => {
  ElMessageBox.confirm(
    '确定要重启系统吗？这将断开所有用户连接，请确保没有重要操作正在进行。',
    '确认重启',
    {
      confirmButtonText: '重启系统',
      cancelButtonText: '取消',
      type: 'error',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    ElMessage.warning('系统将在30秒后重启...')
    // 实际项目中这里会调用重启API
  }).catch(() => {
    ElMessage.info('已取消重启')
  })
}

const exportLogs = () => {
  ElMessage.success('正在导出系统日志...')
  setTimeout(() => {
    ElNotification({
      title: '导出完成',
      message: '系统日志已导出到下载目录',
      type: 'success'
    })
  }, 1500)
}

const saveSettings = () => {
  ElMessageBox.confirm(
    '确定要保存这些设置吗？某些设置可能需要重启系统才能生效。',
    '确认保存',
    {
      confirmButtonText: '保存设置',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    // 模拟保存过程
    ElMessage.success('正在保存设置...')
    setTimeout(() => {
      originalSettings.value = JSON.parse(JSON.stringify(settings.value))
      ElNotification({
        title: '保存成功',
        message: '系统设置已更新并生效',
        type: 'success'
      })
    }, 1000)
  }).catch(() => {
    ElMessage.info('已取消保存')
  })
}

const resetSettings = () => {
  ElMessageBox.confirm(
    '确定要重置所有设置吗？这将恢复到上次保存的状态。',
    '确认重置',
    {
      confirmButtonText: '重置设置',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    settings.value = JSON.parse(JSON.stringify(originalSettings.value))
    ElMessage.success('设置已重置')
  }).catch(() => {
    ElMessage.info('已取消重置')
  })
}
</script>

<style scoped lang="scss">
// 颜色变量
$primary: #409eff;
$success: #67c23a;
$warning: #e6a23c;
$danger: #f56c6c;
$purple: #9a66e4;
$text: #333;
$light: #f8f9fc;
$border: #ebeef5;
$teal: #2d8c99;

// 混合：卡片样式
@mixin card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.settings-manager {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 50%, #d1edff 100%);
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

// 主体布局
.main-layout {
  display: flex;
  min-height: calc(100vh - 72px);
  padding-top: 72px; // 为AdminHeader留出空间
}

// 主内容区
.content {
  flex: 1;
  margin-left: 260px; // 为SideLeft组件留出空间
  padding: 30px;
  overflow-y: auto;

  .page-header {
    margin-bottom: 30px;
    h1 {
      font-size: 28px;
      color: $text;
      margin: 0 0 8px 0;
      font-weight: 600;
    }
    p {
      color: #666;
      font-size: 15px;
    }
  }

  // 统计卡片
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .card {
      @include card;
      display: flex;
      align-items: center;
      gap: 16px;

      &-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;

        &.bg-blue { background: rgba($primary, 0.1); color: $primary; }
        &.bg-green { background: rgba($success, 0.1); color: $success; }
        &.bg-orange { background: rgba($warning, 0.1); color: $warning; }
        &.bg-purple { background: rgba($purple, 0.1); color: $purple; }
      }

      &-info {
        h3 {
          margin: 0 0 4px 0;
          font-size: 15px;
          color: #555;
        }
        .number {
          font-size: 24px;
          font-weight: 600;
          color: $text;
          margin: 0;

          &.status-text {
            font-size: 18px;
            
            &.status-normal { color: $success; }
            &.status-good { color: $primary; }
            &.status-warning { color: $warning; }
            &.status-error { color: $danger; }
          }
        }
        .desc {
          margin: 0;
          font-size: 13px;
          color: #999;
        }
      }
    }
  }

  // 快捷操作
  .quick-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 30px;
    flex-wrap: wrap;

    .action-btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;

      &.primary {
        background: $primary;
        color: white;
        border: none;
        &:hover { background: #66b1ff; }
      }

      &.outline {
        background: white;
        color: $primary;
        border: 2px solid $primary;
        &:hover { background: #e6f7ff; }
      }

      .icon {
        font-size: 16px;
      }
    }
  }

  // 设置选项卡
  .settings-tabs {
    @include card;
    margin-bottom: 30px;
    padding: 0;

    .tab-headers {
      display: flex;
      border-bottom: 1px solid $border;
      padding: 0 20px;

      .tab-header {
        padding: 16px 20px;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 3px solid transparent;

        &.active {
          color: $primary;
          border-bottom-color: $primary;
          background: rgba($primary, 0.05);
        }

        &:hover:not(.active) {
          color: $primary;
          background: rgba($primary, 0.02);
        }

        .tab-icon {
          font-size: 16px;
        }
      }
    }

    .tab-content {
      padding: 0;

      .settings-section {
        padding: 24px;

        .section-title {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid $border;

          h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            color: $text;
          }

          p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
        }

        .settings-grid {
          display: grid;
          gap: 24px;

          .setting-item {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 20px;
            align-items: start;
            padding: 20px;
            border: 1px solid $border;
            border-radius: 12px;
            transition: all 0.3s ease;

            &:hover {
              border-color: rgba($primary, 0.3);
              background: rgba($primary, 0.01);
            }

            .setting-label {
              h4 {
                margin: 0 0 6px 0;
                font-size: 16px;
                color: $text;
                font-weight: 600;
              }

              p {
                margin: 0;
                color: #666;
                font-size: 13px;
                line-height: 1.4;
              }
            }

            .setting-control {
              .setting-input, .setting-select, .setting-textarea {
                width: 100%;
                padding: 10px 12px;
                border: 2px solid $border;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.3s ease;

                &:focus {
                  outline: none;
                  border-color: $primary;
                  box-shadow: 0 0 0 3px rgba($primary, 0.1);
                }
              }

              .setting-textarea {
                resize: vertical;
                min-height: 80px;
              }

              .checkbox-group {
                display: grid;
                gap: 12px;

                .checkbox-item {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  cursor: pointer;
                  font-size: 14px;
                  color: $text;

                  input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: $primary;
                  }
                }
              }

              .toggle-switch {
                position: relative;
                display: inline-block;

                input[type="checkbox"] {
                  opacity: 0;
                  width: 0;
                  height: 0;
                }

                .toggle-label {
                  display: block;
                  width: 50px;
                  height: 24px;
                  background: #ccc;
                  border-radius: 24px;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  position: relative;

                  &::before {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                  }
                }

                input:checked + .toggle-label {
                  background: $primary;

                  &::before {
                    transform: translateX(26px);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // 保存按钮区域
  .save-section {
    @include card;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-bottom: 30px;
    padding: 24px;

    .save-btn, .reset-btn {
      padding: 12px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      border: none;

      .icon {
        font-size: 18px;
      }
    }

    .save-btn {
      background: $primary;
      color: white;

      &:hover:not(:disabled) {
        background: #66b1ff;
        transform: translateY(-2px);
      }

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
      }
    }

    .reset-btn {
      background: white;
      color: $warning;
      border: 2px solid $warning;

      &:hover {
        background: rgba($warning, 0.1);
        transform: translateY(-2px);
      }
    }
  }

  // 系统信息
  .system-info {
    @include card;

    .info-header {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid $border;

      h3 {
        margin: 0;
        font-size: 18px;
        color: $text;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: rgba($primary, 0.02);
        border-radius: 8px;
        border-left: 4px solid $primary;

        .info-label {
          font-weight: 500;
          color: #666;
          font-size: 14px;
        }

        .info-value {
          font-weight: 600;
          color: $text;
          font-size: 14px;
        }
      }
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .content {
    .settings-tabs .tab-content .settings-section .settings-grid .setting-item {
      grid-template-columns: 1fr;
      gap: 12px;

      .setting-control {
        .setting-input, .setting-select, .setting-textarea {
          max-width: 400px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  
  .content {
    margin-left: 0;
    padding: 20px;

    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .quick-actions {
      .action-btn {
        flex: 1;
        justify-content: center;
      }
    }

    .settings-tabs {
      .tab-headers {
        flex-wrap: wrap;
        padding: 0 10px;

        .tab-header {
          padding: 12px 16px;
          font-size: 13px;
        }
      }
    }

    .save-section {
      flex-direction: column;
      gap: 12px;

      .save-btn, .reset-btn {
        width: 100%;
        justify-content: center;
      }
    }

    .system-info .info-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>