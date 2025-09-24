<template>
  <div class="login-container">
    <!-- 背景装饰元素 -->
    <div class="bg-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="wave"></div>
    </div>

    <div class="login-card">
      <!-- 左侧品牌 -->
      <div class="login-left">
        <div class="logo-container">
          <div class="medical-symbol">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V2M12 22V20M4 12H2M6.31 6.31L4.9 4.9M17.69 6.31L19.1 4.9M6.31 17.69L4.9 19.1M17.69 17.69L19.1 19.1M22 12H20M16 12H8M12 16V8" 
                    stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        
        <h1 class="brand-title">YiLiao</h1>
        <p class="brand-subtitle">专业医疗健康服务平台</p>
        
        <div class="features">
          <div class="feature-item">
            <div class="icon">🔒</div>
            <span>数据加密保护</span>
          </div>
          <div class="feature-item">
            <div class="icon">🏥</div>
            <span>三甲医院合作</span>
          </div>
          <div class="feature-item">
            <div class="icon">⏱️</div>
            <span>24小时在线服务</span>
          </div>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="login-right">
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p>请登录您的账户</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- 用户名 -->
          <div class="input-group" :class="{ error: errors.username, focused: isUsernameFocused }">
            <div class="icon-container">
              <i class="icon">👤</i>
            </div>
            <input
              v-model="loginForm.username"
              type="text"
              placeholder="请输入用户名"
              @blur="handleUsernameBlur"
              @focus="isUsernameFocused = true"
              @input="clearError('username')"
            />
          </div>
          <span v-if="errors.username" class="error-text">{{ errors.username }}</span>

          <!-- 密码 -->
          <div class="input-group" :class="{ error: errors.password, focused: isPasswordFocused }">
            <div class="icon-container">
              <i class="icon">🔒</i>
            </div>
            <input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              @blur="handlePasswordBlur"
              @focus="isPasswordFocused = true"
              @input="clearError('password')"
            />
            <button type="button" class="toggle-btn" @click="showPassword = !showPassword">
              <span v-if="showPassword">🙈</span>
              <span v-else>eyed</span>
            </button>
          </div>
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>

          <!-- 记住我 & 忘记密码 -->
          <div class="form-options">
            <label class="checkbox-container">
              <input v-model="rememberMe" type="checkbox" />
              <span class="checkmark"></span>
              记住我
            </label>
            <a href="#" class="forgot">忘记密码？</a>
          </div>

          <!-- 登录按钮 -->
          <button type="submit" class="login-btn" :disabled="!isFormValid || loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? '登录中...' : '登 录' }}
          </button>

          <div class="social-login">
            <div class="divider">
              <span>或使用第三方账号登录</span>
            </div>
            <div class="social-icons">
              <button type="button" class="social-btn wechat">
                <span>🟥</span>
                微信
              </button>
              <button type="button" class="social-btn alipay">
                <span>🟦</span>
                支付宝
              </button>
            </div>
          </div>

          <div class="footer">
            还没有账户？
            <a href="#" class="register">立即注册</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { loginUser } from '@/api/api'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'

const loginForm = reactive({
  username: '',
  password: ''
})
const errors = reactive({
  username: '',
  password: ''
})
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const isUsernameFocused = ref(false)
const isPasswordFocused = ref(false)

const router = useRouter()
const store = useStore()

const validateUsername = () => {
  if (!loginForm.username) {
    errors.username = '请输入用户名'
    return false
  }
  if (loginForm.username.length < 3) {
    errors.username = '用户名至少需要3个字符'
    return false
  }
  if (loginForm.username.length > 20) {
    errors.username = '用户名不能超过20个字符'
    return false
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(loginForm.username)) {
    errors.username = '用户名只能包含字母、数字、下划线和中文'
    return false
  }
  errors.username = ''
  return true
}
const validatePassword = () => {
  if (!loginForm.password) {
    errors.password = '请输入密码'
    return false
  }
  if (loginForm.password.length < 6) {
    errors.password = '密码至少需要6个字符'
    return false
  }
  if (loginForm.password.length > 30) {
    errors.password = '密码不能超过30个字符'
    return false
  }
  errors.password = ''
  return true
}
const clearError = (field) => {
  errors[field] = ''
}

const isFormValid = computed(() => {
  return loginForm.username &&
         loginForm.password &&
         !errors.username &&
         !errors.password
})

const handleLogin = async () => {
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()
  if (!isUsernameValid || !isPasswordValid) return

  loading.value = true
  try {
    const response = await loginUser({
      username: loginForm.username,
      password: loginForm.password,
      rememberMe: rememberMe.value
    })
    
    // 使用新的setLoginData mutation来存储完整的登录信息
    store.commit('setLoginData', {
      role: response.data.role,
      user: response.data.user,
      token: response.data.token
    })
    
    ElMessage({ message: response.msg, type: 'success' })
    
    // 根据角色重定向到对应的首页
    switch (response.data.role) {
      case 'doctor':
        router.push('/doctor/home')
        break
      case 'manager':
        router.push('/manager/home')
        break
      case 'nurse':
        router.push('/nurse/home')
        break
      default:
        router.push('/')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查用户名或密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 50%, #d1edff 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.bg-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  
  .circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.2;
    
    &.circle-1 {
      width: 300px;
      height: 300px;
      background: #409eff;
      top: -100px;
      left: -100px;
    }
    
    &.circle-2 {
      width: 200px;
      height: 200px;
      background: #67c23a;
      bottom: 100px;
      right: 100px;
    }
    
    &.circle-3 {
      width: 150px;
      height: 150px;
      background: #e6a23c;
      top: 50%;
      right: -50px;
    }
  }
  
  .wave {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10c5 0 5-10 10-10s5 10 10 10 5-10 10-10 5 10 10 10 5-10 10-10 5 10 10 10 5-10 10-10v10H0z' fill='%23409eff' fill-opacity='0.1'/%3E%3C/svg%3E");
    background-size: 100px 20px;
    opacity: 0.3;
  }
}

.login-card {
  display: flex;
  flex-direction: row;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  max-width: 900px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 16px;
    max-width: 100%;
  }
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #409eff 0%, #409eff 50%, #67c23a 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
  }

  .logo-container {
    margin-bottom: 20px;
    
    .medical-symbol {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      backdrop-filter: blur(5px);
      
      svg {
        width: 40px;
        height: 40px;
      }
    }
  }

  .brand-title {
    font-size: 36px;
    font-weight: 700;
    margin: 0;
    letter-spacing: 1px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .brand-subtitle {
    font-size: 16px;
    margin-top: 12px;
    opacity: 0.9;
    font-weight: 500;
    max-width: 250px;
  }
  
  .features {
    margin-top: 40px;
    width: 100%;
    
    .feature-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 15px 0;
      padding: 12px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.25);
      }
      
      .icon {
        font-size: 18px;
      }
      
      span {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

.login-right {
  flex: 1;
  padding: 50px 40px;
  position: relative;
  background: #fff;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
}

.form-header {
  margin-bottom: 30px;
  
  h2 {
    font-size: 28px;
    color: #333;
    margin: 0 0 8px 0;
    font-weight: 600;
  }
  
  p {
    color: #666;
    font-size: 15px;
    margin: 0;
  }
}

.input-group {
  display: flex;
  align-items: center;
  background: #f8f9fc;
  border-radius: 12px;
  padding: 0 16px; /* 保持内边距一致 */
  margin-bottom: 20px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  width: 100%; /* 👈 关键：让容器占满父容器宽度 */
  box-sizing: border-box; /* 确保 padding 不影响宽度计算 */

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #e6f7ff;
    border-radius: 10px;
    margin-right: 12px;

    .icon {
      font-size: 18px;
      color: #409eff;
    }
  }

  input {
    flex: 1; /* 自动填充剩余空间 */
    background: transparent;
    border: none;
    outline: none;
    padding: 14px 0;
    font-size: 16px;
    color: #333;
    font-family: inherit;
    min-width: 0; /* 防止 flex 溢出 */
  }

  .toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #999;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      color: #409eff;
      background: #e6f7ff;
    }
  }

  &.error {
    border-color: #f56c6c;
    background: #fef0f0;

    .icon-container {
      background: #fef0f0;
    }

    input {
      color: #f56c6c;
    }
  }

  &.focused {
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1); /* 阴影 */
    border-color: #409eff; /* 边框高亮 */
    
    .icon-container {
      background: #409eff;

      .icon {
        color: white;
      }
    }
  }
}

.error-text {
  color: #f56c6c;
  font-size: 14px;
  margin-bottom: 12px;
  display: block;
  text-align: left;
  padding-left: 16px;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin: 8px 0 25px;
  
  .checkbox-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    
    input {
      opacity: 0;
      position: absolute;
    }
    
    .checkmark {
      width: 18px;
      height: 18px;
      border: 2px solid #dcdfe6;
      border-radius: 4px;
      margin-right: 8px;
      transition: all 0.2s ease;
      position: relative;
      background: #fff;
    }
    
    input:checked + .checkmark {
      background: #409eff;
      border-color: #409eff;
    }
    
    input:checked + .checkmark::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-weight: bold;
      font-size: 12px;
    }
  }

  .forgot {
    color: #409eff;
    text-decoration: none;
    transition: all 0.2s ease;
    
    &:hover {
      color: #66b1ff;
      text-decoration: underline;
    }
  }
}

.login-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #409eff 0%, #409eff 50%, #67c23a 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
  position: relative;
  overflow: hidden;
  letter-spacing: 1px;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(64, 158, 255, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: none;
  }
  
  &:hover:not(:disabled)::before {
    left: 100%;
    transition: all 0.8s ease;
  }
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.social-login {
  margin-top: 30px;
  
  .divider {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    &::before, &::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #e6e6e6;
    }
    
    span {
      padding: 0 15px;
      color: #999;
      font-size: 14px;
    }
  }
  
  .social-icons {
    display: flex;
    gap: 15px;
    
    .social-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border: 1px solid #e6e6e6;
      border-radius: 8px;
      background: white;
      font-size: 14px;
      color: #333;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
      
      span {
        font-size: 18px;
      }
      
      &:hover {
        border-color: #409eff;
        color: #409eff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      }
      
      &.wechat {
        span {
          color: #07c160;
        }
      }
      
      &.alipay {
        span {
          color: #108ee9;
        }
      }
    }
  }
}

.footer {
  margin-top: 30px;
  font-size: 14px;
  text-align: center;
  color: #666;
  
  .register {
    color: #409eff;
    text-decoration: none;
    font-weight: 500;
    margin-left: 5px;
    transition: all 0.2s ease;
    
    &:hover {
      color: #66b1ff;
      text-decoration: underline;
    }
  }
}
</style>