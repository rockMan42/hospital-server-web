import http from '@/axios';

/**
 * 获取护士分页列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，从1开始（必填）
 * @param {number} params.size - 每页大小（必填）
 * @param {string} params.workId - 护士工号（可选）
 * @param {string} params.name - 护士姓名（可选）
 * @param {string} params.departmentName - 科室名称（可选）
 * @param {number} params.status - 护士状态（可选，0：在岗，1：休假，2：停职）
 * @param {number} params.nptId - 职称ID（可选）
 * @returns {Promise} 护士分页列表
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
 *         status: number,
 *         age: number,
 *         gender: string,
 *         description: string
 *       }
 *     ],
 *     totalCount: number,
 *     pageIndex: number,
 *     pageSize: number,
 *     totalPage: number
 *   }
 * }
 */
export const getNurseFullPage = (params) => {
  return http.post('/hospital/nurse/getNurseFullPage', params);
};

/**
 * 获取护士职称列表
 * @returns {Promise} 护士职称列表
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: [
 *     {
 *       id: number,
 *       profashionTitle: string
 *     }
 *   ]
 * }
 */
export const getNurseProfessionTitleList = () => {
  return http.get('/hospital/nurse/getNurseProfessionTitleList');
};

/**
 * 获取护士详情
 * @param {number} id - 护士ID
 * @returns {Promise} 护士详情
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: {
 *     id: number,
 *     workId: string,
 *     name: string,
 *     profashionTitle: string,
 *     departmentName: string,
 *     majorDirect: string,
 *     phone: string,
 *     enterDate: string,
 *     status: number,
 *     age: number,
 *     gender: string,
 *     description: string
 *   }
 * }
 */
export const getNurseDetail = (id) => {
  return http.post('/hospital/nurse/getNurseDetail', { id });
};

/**
 * 新增护士
 * @param {Object} nurseData - 护士信息
 * @param {string} nurseData.name - 护士姓名（必填）
 * @param {string} nurseData.workId - 护士工号（必填）
 * @param {string} nurseData.gender - 护士性别（必填，男/女）
 * @param {number} nurseData.age - 年龄（必填）
 * @param {number} nurseData.nptId - 职称ID（必填）
 * @param {number} nurseData.clinicRoomId - 诊室ID（可选）
 * @param {string} nurseData.majorDirect - 专业方向（可选）
 * @param {string} nurseData.phone - 手机号码（可选）
 * @param {string} nurseData.enterDate - 入职日期（可选，格式：YYYY-MM-DD）
 * @param {number} nurseData.status - 护士状态（可选，0:在岗 1：休假 2：停职，默认0）
 * @param {string} nurseData.description - 描述（可选）
 * @returns {Promise} 新增结果
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: null
 * }
 */
export const createNurse = (nurseData) => {
  return http.post('/hospital/nurse/createNurse', nurseData);
};

/**
 * 更新护士信息
 * @param {Object} nurseData - 护士信息
 * @param {number} nurseData.id - 护士ID（必填）
 * @param {string} nurseData.name - 护士姓名（可选）
 * @param {string} nurseData.phone - 手机号码（可选）
 * @param {number} nurseData.status - 护士状态（可选，0:在岗 1：休假 2：停职）
 * @param {number} nurseData.clinicRoomId - 诊室ID（可选）
 * @param {string} nurseData.description - 描述信息（可选）
 * @returns {Promise} 更新结果
 * 请求格式: {
 *   "id": 12,
 *   "name": "张护士",
 *   "phone": "13900139000",
 *   "status": 1,
 *   "clinicRoomId": 9,
 *   "description": "更新后的备注信息"
 * }
 * 响应格式: { 
 *   code: 200, 
 *   msg: "操作成功", 
 *   data: null
 * }
 */
export const updateNurse = (nurseData) => {
  console.log('=== updateNurse API调用 ===');
  console.log('请求参数:', JSON.stringify(nurseData, null, 2));
  console.log('请求URL: /hospital/nurse/updateNurse');
  
  return http.post('/hospital/nurse/updateNurse', nurseData)
    .then(response => {
      console.log('更新护士API响应成功:', response);
      return response;
    })
    .catch(error => {
      console.error('更新护士API调用失败:', error);
      console.error('错误详情:', error.response?.data);
      throw error;
    });
};

/**
 * 删除护士（支持单个或批量）
 * @param {Array<number>} nurseIds - 护士ID数组
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
export const deleteNurse = (nurseIds) => {
  console.log('=== deleteNurse API调用 ===');
  const requestData = {
    ids: Array.isArray(nurseIds) ? nurseIds : [nurseIds]
  };
  console.log('请求参数:', JSON.stringify(requestData, null, 2));
  console.log('请求URL: /hospital/nurse/deleteNurse');
  
  return http.post('/hospital/nurse/deleteNurse', requestData)
    .then(response => {
      console.log('删除护士API响应成功:', response);
      return response;
    })
    .catch(error => {
      console.error('删除护士API调用失败:', error);
      console.error('错误详情:', error.response?.data);
      throw error;
    });
};
