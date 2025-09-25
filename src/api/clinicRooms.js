import http from '@/axios';

// Clinic Rooms API

/**
 * 获取诊室分页列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，从1开始（必填）
 * @param {number} params.size - 每页大小（必填）
 * @param {string} params.name - 诊室名称（可选）
 * @param {string} params.roomNumber - 诊室编号（可选）
 * @param {string} params.departmentName - 科室名称（可选）
 * @param {number} params.status - 诊室状态（可选，0：可用，1：使用中，2：维护中，3：停用）
 * @returns {Promise} 诊室分页列表
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: {
 *     list: [
 *       {
 *         id: number,
 *         name: string,
 *         roomNumber: string,
 *         departmentId: number,
 *         departmentName: string,
 *         location: string,
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
export const getClinicRoomPageList = (params) => {
  console.log('=== getClinicRoomPageList API调用 ===');
  console.log('请求参数:', JSON.stringify(params, null, 2));
  console.log('请求URL: /hospital/clinicroom/getClinicRoomPageList');
  console.log('BaseURL:', http.baseURL);
  
  return http.post('/hospital/clinicroom/getClinicRoomPageList', params)
    .then(response => {
      console.log('API响应成功:', response);
      return response;
    })
    .catch(error => {
      console.error('API调用失败:', error);
      console.error('错误详情:', error.response?.data);
      throw error;
    });
};

/**
 * 获取诊室详情
 * @param {number} id - 诊室ID
 * @returns {Promise} 诊室详情
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: {
 *     id: number,
 *     name: string,
 *     roomNumber: string,
 *     departmentId: number,
 *     departmentName: string,
 *     location: string,
 *     status: number,
 *     area: number,
 *     floor: number,
 *     position: string,
 *     equipmentStatus: number,
 *     responsibleDoctor: string,
 *     description: string
 *   }
 * }
 */
export const getClinicRoomDetail = (id) => {
  return http.post('/hospital/clinicroom/getClinicRoomDetail', { id });
};

/**
 * 新增诊室
 * @param {Object} roomData - 诊室信息
 * @param {string} roomData.name - 诊室名称（必填）
 * @param {string} roomData.roomNumber - 诊室编号（必填）
 * @param {number} roomData.departmentId - 科室ID（必填）
 * @param {string} roomData.location - 位置（可选）
 * @param {number} roomData.status - 状态（可选，默认0）
 * @param {number} roomData.area - 面积（可选）
 * @param {number} roomData.floor - 楼层（可选）
 * @param {string} roomData.position - 具体位置（可选）
 * @param {string} roomData.responsibleDoctor - 负责医生（可选）
 * @param {string} roomData.description - 描述（可选）
 * @returns {Promise} 新增结果
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: null
 * }
 */
export const createClinicRoom = (roomData) => {
  return http.post('/hospital/clinicroom/createClinicRoom', roomData);
};

/**
 * 更新诊室信息
 * @param {Object} roomData - 诊室信息
 * @param {number} roomData.id - 诊室ID（必填）
 * @param {string} roomData.name - 诊室名称（可选）
 * @param {string} roomData.roomNumber - 诊室编号（可选）
 * @param {number} roomData.departmentId - 科室ID（可选）
 * @param {string} roomData.location - 位置（可选）
 * @param {number} roomData.status - 状态（可选）
 * @param {number} roomData.area - 面积（可选）
 * @param {number} roomData.floor - 楼层（可选）
 * @param {string} roomData.position - 具体位置（可选）
 * @param {string} roomData.responsibleDoctor - 负责医生（可选）
 * @param {string} roomData.description - 描述（可选）
 * @returns {Promise} 更新结果
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: null
 * }
 */
export const updateClinicRoom = (roomData) => {
  return http.post('/hospital/clinicroom/updateClinicRoom', roomData);
};

/**
 * 删除诊室（支持单个或批量）
 * @param {Array<number>} roomIds - 诊室ID数组
 * @returns {Promise} 删除结果
 * 请求格式: { 
 *   ids: [1, 2, 3]
 * }
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: null
 * }
 */
export const deleteClinicRoom = (roomIds) => {
  return http.post('/hospital/clinicroom/deleteClinicRoom', {
    ids: Array.isArray(roomIds) ? roomIds : [roomIds]
  });
};
