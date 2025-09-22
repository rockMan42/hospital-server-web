import http from '@/axios';

// Patients API (integrated with backend spec)
// - createPatient: POST /hospital/patient/createPatient
// - searchPatients: POST /hospital/patient/getPatientPage (supports paging & filters)

/**
 * 搜索患者分页
 * 后端规范：page 从 1 开始，size 默认 10，name/phone/idCard 为可选搜索条件
 * 兼容旧调用：传入字符串 keyword 时，作为 name 模糊查询
 * 新调用：传入对象 { page, size, name, phone, idCard }
 */
export const searchPatients = (params) => {
  let body;
  if (typeof params === 'string') {
    // 兼容旧调用：字符串作为 name 查询，page 从 1 开始
    body = { page: 1, size: 10 };
    if (params.trim()) {
      body.name = params.trim();
    }
  } else {
    const { page = 1, size = 10, name = '', phone = '', idCard = '' } = params || {};
    body = { page, size };
    
    // 只有非空值才添加到请求体中（搜索条件非必填）
    if (name && name.trim()) {
      body.name = name.trim();
    }
    if (phone && phone.trim()) {
      body.phone = phone.trim();
    }
    if (idCard && idCard.trim()) {
      body.idCard = idCard.trim();
    }
  }
  return http.post('/hospital/patient/getPatientPage', body);
};

/**
 * 新建患者
 * 后端需要字段示例：{
 *  name, gender: '男'|'女', idCard, birthDate?, phone, address?, remark?
 * }
 */
export const createPatient = (payload) => {
  return http.post('/hospital/patient/createPatient', payload);
};
