# 路由系统使用指南

## 概述
本项目已成功重构为基于角色的路由系统，支持医生、管理员、护士三种角色的权限控制。

## 路由结构

### 1. 根路径重定向
- 访问 `/` 时会根据用户角色自动重定向：
  - `doctor` → `/doctor/home`
  - `manager` → `/manager/home`
  - `nurse` → `/nurse/home`
  - 未登录 → `/login`

### 2. 医生路由 (`/doctor`)
- `/doctor/home` - 医生工作台
- `/doctor/patient` - 患者管理
- `/doctor/medicalrecord` - 病历管理
- `/doctor/reservation` - 预约管理
- `/doctor/statistics` - 工作统计

### 3. 管理员路由 (`/manager`)
- `/manager/home` - 管理员工作台
- `/manager/department` - 科室管理
- `/manager/clinicroom` - 诊室管理
- `/manager/doctor` - 医生管理
- `/manager/nurse` - 护士管理
- `/manager/patient` - 患者管理
- `/manager/reservation` - 预约管理
- `/manager/schedule` - 门诊日程
- `/manager/outpatient` - 出诊管理
- `/manager/registration` - 窗口挂号
- `/manager/settings` - 系统设置

### 4. 护士路由 (`/nurse`)
- `/nurse/home` - 护士工作台
- `/nurse/patientcare` - 患者护理

## 登录响应数据格式

登录API应返回以下格式的数据：

```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "role": "nurse",
    "user": {
      "id": 2,
      "name": "王美丽",
      "workId": "N002",
      "gender": "女",
      "age": 32,
      "profashionTitle": "主管护师",
      "departmentName": "普外科",
      "majorDirect": "外科护理",
      "phone": "13800138002",
      "enterDate": "2018-07-20",
      "status": 0,
      "description": "外科护理专家，手术室经验丰富"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

## 权限控制

### 路由守卫
- 检查用户是否已登录（token 和 user 信息）
- 验证用户角色是否匹配路由要求
- 角色不匹配时自动重定向到对应角色的首页

### 存储机制
- 使用 Vuex store 管理用户状态
- localStorage 存储用户信息和 token
- 用户信息包含 role 字段用于权限判断

## 使用方式

### 1. 登录处理
```javascript
// 在登录成功后
store.commit('setLoginData', {
  role: response.data.role,
  user: response.data.user,
  token: response.data.token
})
```

### 2. 角色检查
```javascript
// 获取当前用户角色
const user = JSON.parse(localStorage.getItem('user') || 'null')
const userRole = user?.role
```

### 3. 路由跳转
```javascript
// 根据角色跳转到对应首页
switch (userRole) {
  case 'doctor':
    router.push('/doctor/home')
    break
  case 'manager':
    router.push('/manager/home')
    break
  case 'nurse':
    router.push('/nurse/home')
    break
}
```

## Dashboard 组件

每个角色都有对应的 Dashboard 组件作为布局容器：

- `DoctorDashboard` - 使用 SiderLift 和 TopHeader 组件
- `ManagerDashboard` - 使用 SideLeft 和 AdminHeader 组件
- `NurseDashboard` - 使用 SideLeft 和 TopNavbar 组件

## 注意事项

1. 确保登录API返回的数据格式正确
2. 用户信息中必须包含 `role` 字段
3. 角色值必须是 `doctor`、`manager` 或 `nurse` 之一
4. 未匹配的路径会重定向到登录页面
5. 权限验证失败会自动重定向到对应角色的首页
