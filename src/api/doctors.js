import http from '@/axios';

// Doctors API

export const listDoctors = (params = {}) => {
  const { departmentId } = params;
  return http.get('/api/v1/doctors', { params: { departmentId } });
};

/**
 * 获取科室诊室下的医生列表
 * @param {Object} params - 查询参数
 * @param {number} params.departmentId - 科室ID
 * @param {number} params.clinicRoomId - 诊室ID
 * @returns {Promise} 医生列表
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: [
 *     {
 *       doctorId: number,
 *       name: string
 *     }
 *   ]
 * }
 */
export const getDoctorList = (params) => {
  return http.post('/hospital/doctor/getDoctorPage', params);
};

/**
 * 获取医生分页列表（用于医生管理页面）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，从1开始（必填）
 * @param {number} params.size - 每页大小（必填）
 * @param {number} params.ptId - 职称ID（可选）
 * @param {string} params.departmentName - 科室名称（可选）
 * @param {string} params.name - 医生姓名（可选）
 * @param {string} params.workId - 医生工号（可选）
 * @param {number} params.status - 医生状态（可选，0：在岗，1：休假，2：停止）
 * @returns {Promise} 医生分页列表
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: {
 *     list: [
 *       {
 *         id: number,
 *         workId: string,
 *         name: string,
 *         profashionTitle: string,
 *         departmentName: string,
 *         majorDirect: string,
 *         phone: string,
 *         enterDate: string,
 *         status: number
 *       }
 *     ],
 *     totalCount: number,
 *     pageIndex: number,
 *     pageSize: number,
 *     totalPage: number
 *   }
 * }
 */
export const getDoctorFullPage = (params) => {
  return http.post('/hospital/doctor/getDoctorFullPage', params);
};

/**
 * 新增医生
 * @param {Object} doctorData - 医生信息
 * @param {string} doctorData.name - 医生姓名（必填）
 * @param {string} doctorData.workId - 医生工号（必填）
 * @param {string} doctorData.gender - 医生性别（必填，男/女）
 * @param {number} doctorData.age - 年龄（必填）
 * @param {number} doctorData.clinicRoomId - 所属诊室id（可选）
 * @param {number} doctorData.ptId - 职称id（必填）
 * @param {string} doctorData.majorDirect - 专业方向（可选）
 * @param {string} doctorData.phone - 手机号码（可选）
 * @param {string} doctorData.enterDate - 入职日期（可选，格式：YYYY-MM-DD）
 * @param {number} doctorData.status - 医生状态（可选，0:在岗 1：休假 2：停职，默认0）
 * @param {string} doctorData.description - 描述（可选）
 * @returns {Promise} 新增结果
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: null
 * }
 */
export const createDoctor = (doctorData) => {
  return http.post('/hospital/doctor/createDoctor', doctorData);
};

/**
 * 删除医生（支持单个或批量）
 * @param {Array<number>} doctorIds - 医生ID数组
 * @returns {Promise} 删除结果
 * 请求格式: { 
 *   ids: [17, 18]
 * }
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: null
 * }
 */
export const deleteDoctor = (doctorIds) => {
  return http.post('/hospital/doctor/deleteDoctor', {
    ids: Array.isArray(doctorIds) ? doctorIds : [doctorIds]  // 确保传递数组格式
  });
};

/**
 * 获取医生详情
 * @param {number} id - 医生ID
 * @returns {Promise} 医生详情
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: {
 *     id: number,
 *     workId: string,
 *     name: string,
 *     age: number,
 *     gender: string,
 *     profashionTitle: string,
 *     departmentName: string,
 *     majorDirect: string,
 *     phone: string,
 *     enterDate: string,
 *     status: number (0：在岗，1：休假，2：停职),
 *     description: string
 *   }
 * }
 */
export const getDoctorDetail = (id) => {
  return http.post('/hospital/doctor/getDoctorDetail', { id });
};

/**
 * 更新医生信息
 * @param {Object} doctorData - 医生信息
 * @param {number} doctorData.id - 医生ID（必填）
 * @param {string} doctorData.name - 医生姓名（可选）
 * @param {string} doctorData.workId - 医生工号（可选）
 * @param {string} doctorData.gender - 医生性别（可选，男/女）
 * @param {number} doctorData.age - 年龄（可选）
 * @param {number} doctorData.ptId - 职称id（可选）
 * @param {number} doctorData.clinicRoomId - 所属诊室id（可选）
 * @param {string} doctorData.majorDirect - 专业方向（可选）
 * @param {string} doctorData.phone - 手机号码（可选）
 * @param {string} doctorData.enterDate - 入职日期（可选，格式：YYYY-MM-DD）
 * @param {number} doctorData.status - 医生状态（可选，0:在岗 1：休假 2：停职）
 * @param {string} doctorData.description - 描述（可选）
 * @returns {Promise} 更新结果
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: null
 * }
 */
export const updateDoctor = (doctorData) => {
  return http.post('/hospital/doctor/updateDoctor', doctorData);
};

/**
 * 上传医生头像
 * @param {File|FormData} fileOrFormData - 头像文件或已构造的FormData
 * @returns {Promise} 响应结果，期望 data 中包含头像URL，如 { url: string }
 */
export const uploadDoctorAvatar = (fileOrFormData) => {
  let formData;
  if (fileOrFormData instanceof FormData) {
    formData = fileOrFormData;
  } else {
    formData = new FormData();
    const filename = fileOrFormData?.name || 'avatar.jpg';
    formData.append('file', fileOrFormData, filename);
    // 兼容部分后端以 'avatar' 作为字段名
    formData.append('avatar', fileOrFormData, filename);
  }
  // 若传入的就是 FormData，但缺少文件字段名，尽量补齐
  if (!formData.has('file') && fileOrFormData instanceof File) {
    const filename = fileOrFormData?.name || 'avatar.jpg';
    formData.append('file', fileOrFormData, filename);
  }
  if (!formData.has('avatar') && fileOrFormData instanceof File) {
    const filename = fileOrFormData?.name || 'avatar.jpg';
    formData.append('avatar', fileOrFormData, filename);
  }
  return http.postFile('/file/uploadAvatar', formData);
};
