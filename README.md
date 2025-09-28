# Vue3 医院管理系统 - 项目使用指南

## 📋 项目简介

Vue3 医院管理系统是一个基于 Vue 3 + Element Plus 构建的现代化医院信息管理系统。系统采用前后端分离架构，提供了完整的医院业务管理功能，包括医生工作台、护士工作台、管理员后台以及患者自助服务等模块。

### 🎯 项目特色

- **多角色权限管理**：支持医生、护士、管理员三种角色，各自拥有独立的工作台和权限
- **完整业务流程**：覆盖挂号、排班、收费、病历管理等医院核心业务
- **现代化UI设计**：基于 Element Plus 组件库，界面美观易用
- **自助服务支持**：提供患者自助挂号、缴费等公共服务功能
- **响应式设计**：支持多种设备访问，适配PC端和移动端

## 🛠️ 技术栈

### 前端技术栈
- **框架**: Vue 3.2.13 (Composition API)
- **构建工具**: Vue CLI 5.0
- **UI组件库**: 
  - Element Plus 2.11.3 (主要UI组件)
  - Ant Design Vue 4.2.6 (辅助组件)
- **路由管理**: Vue Router 4.0.3
- **状态管理**: Vuex 4.0.0
- **HTTP客户端**: Axios 1.12.2
- **图表库**: ECharts 6.0.0
- **富文本编辑器**: WangEditor 5.1.23
- **样式预处理**: Sass 1.92.1
- **事件总线**: Mitt 3.0.1

### 开发工具
- **代码规范**: ESLint + Vue3规范
- **构建优化**: Webpack压缩插件
- **开发服务器**: 热重载 + 代理配置

### 后端接口
- **API基础地址**: http://localhost:8081
- **接口协议**: RESTful API
- **数据格式**: JSON

## 📁 项目结构

```
vue3-hospital-server/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口管理
│   │   ├── api.js         # 通用API接口
│   │   ├── doctors.js     # 医生相关接口
│   │   ├── nurses.js      # 护士相关接口
│   │   ├── patients.js    # 患者相关接口
│   │   ├── departments.js # 科室相关接口
│   │   ├── clinicRooms.js # 诊室相关接口
│   │   ├── fees.js        # 费用相关接口
│   │   ├── schedules.js   # 排班相关接口
│   │   └── appointments.js# 预约相关接口
│   ├── assets/            # 静态资源
│   ├── axios/             # HTTP请求配置
│   ├── components/        # 公共组件
│   ├── router/            # 路由配置
│   ├── store/             # Vuex状态管理
│   ├── views/             # 页面组件
│   │   ├── doctor/        # 医生工作台页面
│   │   ├── nurse/         # 护士工作台页面
│   │   ├── manager/       # 管理员后台页面
│   │   ├── public/        # 公共服务页面
│   │   ├── LoginView.vue  # 登录页面
│   │   └── TTSView.vue    # 语音合成测试页面
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── database/              # 数据库相关文件
├── package.json           # 项目依赖配置
├── vue.config.js          # Vue CLI配置
└── README.md              # 项目说明
```

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0 或 yarn >= 1.0.0

### 安装依赖
```bash
# 克隆项目
git clone [项目地址]
cd vue3-hospital-server

# 安装依赖
npm install
# 或使用 yarn
yarn install
```

### 开发环境运行
```bash
# 启动开发服务器
npm run dev
# 或使用 yarn
yarn dev
```

访问地址：http://localhost:8018

### 生产环境构建
```bash
# 构建生产版本
npm run build
# 或使用 yarn
yarn build
```

### 代码检查
```bash
# 运行ESLint检查
npm run lint
# 或使用 yarn
yarn lint
```

## 👥 系统角色与功能

### 🩺 医生工作台 (`/doctor`)
**角色权限**: `doctor`

**主要功能**:
- **工作台首页**: 个人工作概览、待处理事项
- **患者管理**: 查看和管理患者信息
- **病历管理**: 创建、编辑、查看病历记录
- **预约管理**: 处理患者预约、安排就诊时间
- **工作统计**: 查看个人工作数据和统计报表

### 👩‍⚕️ 护士工作台 (`/nurse`)
**角色权限**: `nurse`

**主要功能**:
- **工作台首页**: 护理工作概览
- **患者护理**: 患者护理记录和管理

### 👨‍💼 管理员后台 (`/manager`)
**角色权限**: `manager`

**主要功能**:
- **工作台首页**: 系统整体运营数据
- **科室管理**: 医院科室的增删改查
- **诊室管理**: 诊室信息管理和配置
- **医生管理**: 医生信息管理、权限分配
- **护士管理**: 护士信息管理、权限分配
- **患者管理**: 患者信息统一管理
- **费用配置**: 医疗费用项目配置管理
- **收费管理**: 医疗费用收取和管理
- **排班管理**: 医护人员排班安排
- **预约管理**: 患者预约统一管理
- **窗口挂号**: 现场挂号服务管理
- **系统设置**: 系统参数和配置管理

### 🏥 公共服务 (`/self-service`)
**角色权限**: 无需登录

**主要功能**:
- **自助挂号**: 患者自助选择科室、医生进行挂号
- **科室选择**: 浏览和选择医院科室
- **诊室选择**: 选择具体诊室
- **医生选择**: 选择主治医生
- **费用详情**: 查看挂号费用明细
- **在线支付**: 支持多种支付方式
- **门诊缴费**: 扫码缴费服务

### 📺 公共设备 (`/publicdevice`)
**角色权限**: 无需登录

**主要功能**:
- **信息展示**: 医院公告、科室信息展示
- **排队叫号**: 智能排队叫号系统

## 🔐 权限管理

### 路由权限控制
系统采用基于角色的权限控制（RBAC），通过路由守卫实现：

```javascript
// 路由元信息配置
meta: {
  title: "页面标题",
  requiresAuth: true,      // 是否需要登录
  requiredRole: 'doctor'   // 需要的角色权限
}
```

### 角色类型
- `doctor`: 医生角色
- `nurse`: 护士角色  
- `manager`: 管理员角色
- 无角色要求: 公共页面

### 登录认证
- 使用 Token 进行身份验证
- 用户信息存储在 localStorage
- 自动角色重定向到对应工作台

## 🌐 API接口配置

### 开发环境代理配置
```javascript
// vue.config.js
devServer: {
  proxy: {
    '/api': {
      target: 'http://localhost:8081',
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    }
  }
}
```

### 接口模块化管理
- **通用接口**: `src/api/api.js`
- **医生接口**: `src/api/doctors.js`
- **护士接口**: `src/api/nurses.js`
- **患者接口**: `src/api/patients.js`
- **科室接口**: `src/api/departments.js`
- **诊室接口**: `src/api/clinicRooms.js`
- **费用接口**: `src/api/fees.js`
- **排班接口**: `src/api/schedules.js`
- **预约接口**: `src/api/appointments.js`

## 🎨 UI组件库

### Element Plus 组件
- **表单组件**: el-form, el-input, el-select等
- **数据展示**: el-table, el-pagination, el-card等
- **导航组件**: el-menu, el-breadcrumb等
- **反馈组件**: el-message, el-dialog, el-loading等

### Ant Design Vue 组件
- **图标组件**: @ant-design/icons-vue
- **辅助组件**: 补充Element Plus的功能

### 自定义组件
- **侧边栏组件**: SideLeft.vue
- **其他业务组件**: 根据具体业务需求开发

## 📊 数据可视化

### ECharts图表
- **统计图表**: 工作量统计、收入统计等
- **数据分析**: 患者流量分析、科室效率分析
- **实时监控**: 系统运行状态监控

## 🔧 开发配置

### 开发服务器配置
- **端口**: 8018
- **自动打开**: 启动后自动打开浏览器
- **热重载**: 支持代码修改后自动刷新
- **代理配置**: 自动代理API请求到后端服务

### 构建优化
- **Gzip压缩**: 生产环境自动压缩静态资源
- **代码分割**: 自动进行代码分割优化
- **资源优化**: 图片、CSS、JS资源优化

### 代码规范
- **ESLint**: Vue3推荐规范
- **代码格式化**: 统一代码风格
- **Git提交规范**: 建议使用语义化提交信息

## 🚀 部署指南

### 生产环境部署
1. **构建项目**
   ```bash
   npm run build
   ```

2. **部署静态文件**
   - 将 `dist` 目录下的文件部署到Web服务器
   - 配置服务器支持SPA路由

3. **配置反向代理**
   ```nginx
   # Nginx配置示例
   location /api {
       proxy_pass http://backend-server:8081;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

### Docker部署
```dockerfile
# Dockerfile示例
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## 🐛 常见问题

### 1. 开发环境启动失败
- 检查Node.js版本是否符合要求
- 清除node_modules重新安装依赖
- 检查端口8018是否被占用

### 2. API请求失败
- 确认后端服务是否正常运行
- 检查代理配置是否正确
- 查看浏览器网络面板确认请求地址

### 3. 权限问题
- 确认用户角色是否正确
- 检查Token是否有效
- 查看路由配置是否正确

### 4. 构建失败
- 检查代码语法错误
- 确认所有依赖都已正确安装
- 查看构建日志定位具体错误

## 📝 开发规范

### 代码组织
- **组件命名**: 使用PascalCase命名
- **文件命名**: 使用kebab-case命名
- **变量命名**: 使用camelCase命名
- **常量命名**: 使用UPPER_SNAKE_CASE命名

### Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 注释规范
- **函数注释**: 使用JSDoc格式
- **组件注释**: 说明组件用途和主要功能
- **复杂逻辑**: 添加详细的行内注释

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 项目Issues: [GitHub Issues](项目地址/issues)
- 邮箱: [联系邮箱]
- 文档: [在线文档地址]

---

**最后更新时间**: 2025-09-28
**文档版本**: v1.0.0
