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
 * @param {number} params.doctorId - 医生ID（可选）
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
