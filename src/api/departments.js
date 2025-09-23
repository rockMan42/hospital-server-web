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
  return http.post('/hospital/clinicroom/getClinicRoomPage', { departmentId });
};

