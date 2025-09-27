import http from '@/axios';

// Departments API
// 获取科室分页列表 - 用于科室管理页面

/**
 * 获取科室分页列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，从1开始
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.name - 科室名称（可选）
 * @param {string} params.code - 科室代码（可选）
 * @param {string} params.doctorName - 主任医师姓名（可选）
 * @param {number} params.dcId - 科室类型ID（可选，1-内科，2-外科等）
 * @param {number} params.status - 科室状态（可选，0-正常运营，1-维护中，2-暂停使用）
 * @returns {Promise} 科室分页列表
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: { 
 *     list: Department[], 
 *     totalCount: number,
 *     pageIndex: number,
 *     pageSize: number,
 *     totalPage: number
 *   } 
 * }
 */
export const listDepartments = (params = {}) => {
  return http.post('/hospital/department/getDepartmentPage', params);
};

// 原有的分页接口保留用于管理页面
/**
 * 获取科室列表（用于下拉选择）
 * @returns {Promise} 科室列表
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: [
 *     {
 *       departmentId: number,
 *       name: string
 *     }
 *   ]
 * }
 */
export const getDepartmentList = () => {
  return http.get('/hospital/department/getDepartmentList');
};

/**
 * 获取科室下的诊室列表
 * @param {number} departmentId - 科室ID
 * @returns {Promise} 诊室列表
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: [
 *     {
 *       clinicRoomId: number,
 *       name: string
 *     }
 *   ]
 * }
 */
export const getClinicRoomList = (departmentId) => {
  return http.get('/hospital/clinicroom/getClinicRoomPage', { departmentId });
};

/**
 * 创建新科室
 * @param {Object} departmentData - 科室信息
 * @param {string} departmentData.name - 科室名称
 * @param {string} departmentData.code - 科室代码
 * @param {string} departmentData.description - 科室描述
 * @param {number} departmentData.dcId - 科室类型ID (1-内科，2-外科，3-儿科，4-妇产科，5-急诊科，6-眼科，7-耳鼻喉科，8-皮肤科，9-口腔科，10-中医科，11-康复科)
 * @param {string} departmentData.jobTitle - 科室职称
 * @param {string} departmentData.phone - 科室电话
 * @param {string} departmentData.establishedTime - 科室成立时间 (YYYY-MM-DD格式)
 * @param {number} departmentData.status - 科室状态 (0-正常运营，1-维护中，2-暂停使用)
 * @returns {Promise} 创建结果
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: null 
 * }
 */
export const createDepartment = (departmentData) => {
  return http.post('/hospital/department/createDepartment', departmentData);
};

/**
 * 更新科室信息
 * @param {Object} departmentData - 科室信息
 * @param {number} departmentData.id - 科室ID（必填）
 * @param {string} departmentData.name - 科室名称（可选）
 * @param {string} departmentData.code - 科室代码（可选）
 * @param {string} departmentData.description - 科室描述（可选）
 * @param {number} departmentData.dcId - 科室类型ID（可选）
 * @param {number} departmentData.doctorId - 主任医师ID（可选）
 * @param {string} departmentData.jobTitle - 科室职称（可选）
 * @param {string} departmentData.phone - 科室电话（可选）
 * @param {string} departmentData.establishedTime - 科室成立时间（可选，YYYY-MM-DD格式）
 * @param {number} departmentData.status - 科室状态（可选，0-正常运营，1-维护中，2-暂停使用）
 * @returns {Promise} 更新结果
 */
export const updateDepartment = (departmentData) => {
  return http.post('/hospital/department/updateDepartment', departmentData);
};

/**
 * 获取科室详情
 * @param {number} departmentId - 科室ID
 * @returns {Promise} 科室详情
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: {
 *     id: number,
 *     name: string,
 *     code: string,
 *     description: string,
 *     departmentClassName: string,
 *     doctorName: string,
 *     jobTitle: string,
 *     phone: string,
 *     establishedTime: string,
 *     status: number,
 *     doctorCount: number,
 *     clinicRoomCount: number
 *   }
 * }
 */
export const getDepartmentDetail = (departmentId) => {
  return http.post('/hospital/department/getDepartmentDetail', { id: departmentId });
};

/**
 * 删除科室
 * @param {number|Array} departmentIds - 科室ID或科室ID数组
 * @returns {Promise} 删除结果
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: null 
 * }
 */
export const deleteDepartment = (departmentIds) => {
  return http.post('/hospital/department/deleteDepartment', {
    ids: Array.isArray(departmentIds) ? departmentIds : [departmentIds]
  });
};
