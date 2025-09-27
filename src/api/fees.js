/**
 * 费用管理相关API接口
 */
import http from '@/axios/index.js';

/**
 * 获取费用项目分页列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，从1开始
 * @param {number} params.size - 每页大小
 * @param {string} [params.itemName] - 项目名称（可选）
 * @param {number} [params.categoryId] - 费用类型ID（可选）
 * @param {string} [params.departmentIds] - 适用科室ID数组的JSON字符串（可选）
 * @param {number} [params.isActive] - 是否启用，1启用，0停用（可选）
 * @returns {Promise} 返回费用项目分页数据
 */
export const getFeeItemPage = (params) => {
  console.log('=== getFeeItemPage API调用 ===');
  console.log('请求参数:', params);
  
  return http.post('/hospital/fee/getFeeItemPage', params)
    .then(response => {
      console.log('getFeeItemPage 响应数据:', response);
      return response;
    })
    .catch(error => {
      console.error('getFeeItemPage 请求失败:', error);
      throw error;
    });
};

/**
 * 获取费用类型列表
 * @returns {Promise} 返回费用类型列表
 */
export const getFeeCategoryList = () => {
  console.log('=== getFeeCategoryList API调用 ===');
  
  return http.get('/hospital/fee/getFeeCategoryList')
    .then(response => {
      console.log('getFeeCategoryList 响应数据:', response);
      return response;
    })
    .catch(error => {
      console.error('getFeeCategoryList 请求失败:', error);
      throw error;
    });
};

/**
 * 新增费用项目
 * @param {Object} feeData - 费用项目数据
 * @param {string} feeData.itemCode - 费用编码
 * @param {string} feeData.itemName - 费用名称
 * @param {number} feeData.categoryId - 费用类型ID
 * @param {number} feeData.standardPrice - 标准价格
 * @param {number} feeData.insurancePrice - 医保价格
 * @param {number} feeData.costPrice - 成本价格
 * @param {string} feeData.unit - 计量单位
 * @param {string} feeData.insuranceType - 医保类型
 * @param {string} feeData.departmentIds - 适用科室ID数组JSON字符串
 * @param {string} feeData.description - 描述信息
 * @param {number} feeData.isActive - 是否启用
 * @returns {Promise} 返回创建结果
 */
export const addFeeItem = (feeData) => {
  console.log('=== addFeeItem API调用 ===');
  console.log('请求参数:', feeData);
  
  return http.post('/hospital/fee/addFeeItem', feeData)
    .then(response => {
      console.log('addFeeItem 响应数据:', response);
      return response;
    })
    .catch(error => {
      console.error('addFeeItem 请求失败:', error);
      throw error;
    });
};

/**
 * 创建费用项目（保留原接口）
 * @param {Object} feeData - 费用项目数据
 * @returns {Promise} 返回创建结果
 */
export const createFeeItem = (feeData) => {
  console.log('=== createFeeItem API调用 ===');
  console.log('请求参数:', feeData);
  
  return http.post('/hospital/fee/createFeeItem', feeData)
    .then(response => {
      console.log('createFeeItem 响应数据:', response);
      return response;
    })
    .catch(error => {
      console.error('createFeeItem 请求失败:', error);
      throw error;
    });
};

/**
 * 更新费用项目
 * @param {Object} feeData - 费用项目数据
 * @returns {Promise} 返回更新结果
 */
export const updateFeeItem = (feeData) => {
  console.log('=== updateFeeItem API调用 ===');
  console.log('请求参数:', feeData);
  
  return http.post('/hospital/fee/updateFeeItem', feeData)
    .then(response => {
      console.log('updateFeeItem 响应数据:', response);
      return response;
    })
    .catch(error => {
      console.error('updateFeeItem 请求失败:', error);
      throw error;
    });
};

/**
 * 删除费用项目
 * @param {Array|number} feeIds - 费用项目ID或ID数组
 * @returns {Promise} 返回删除结果
 */
export const deleteFeeItem = (feeIds) => {
  console.log('=== deleteFeeItem API调用 ===');
  const requestData = {
    ids: Array.isArray(feeIds) ? feeIds : [feeIds]
  };
  console.log('请求参数:', requestData);
  
  return http.post('/hospital/fee/deleteFeeItem', requestData)
    .then(response => {
      console.log('deleteFeeItem 响应数据:', response);
      return response;
    })
    .catch(error => {
      console.error('deleteFeeItem 请求失败:', error);
      throw error;
    });
};

/**
 * 批量删除费用项目
 * @param {Array} ids - 费用项目ID数组
 * @returns {Promise} 返回批量删除结果
 */
export const batchDeleteFeeItem = (ids) => {
  console.log('=== batchDeleteFeeItem API调用 ===');
  console.log('请求参数:', { ids });
  
  return http.post('/hospital/fee/batchDeleteFeeItem', { ids })
    .then(response => {
      console.log('batchDeleteFeeItem 响应数据:', response);
      return response;
    })
    .catch(error => {
      console.error('batchDeleteFeeItem 请求失败:', error);
      throw error;
    });
};

/**
 * 获取费用统计数据
 * @returns {Promise} 返回费用统计数据
 */
export const getFeeItems = () => {
  console.log('=== getFeeItems API调用 ===');
  
  return http.get('/hospital/fee/getFeeItems')
    .then(response => {
      console.log('getFeeItems 响应数据:', response);
      return response;
    })
    .catch(error => {
      console.error('getFeeItems 请求失败:', error);
      throw error;
    });
};

/**
 * 获取费用项目详情
 * @param {number} feeId - 费用项目ID
 * @returns {Promise} 返回费用项目详情
 */
export const getFeeItemDetail = (feeId) => {
  console.log('=== getFeeItemDetail API调用 ===');
  console.log('请求参数:', { id: feeId });
  
  return http.post('/hospital/fee/getFeeItemDetail', { id: feeId })
    .then(response => {
      console.log('getFeeItemDetail 响应数据:', response);
      return response;
    })
    .catch(error => {
      console.error('getFeeItemDetail 请求失败:', error);
      throw error;
    });
};

/**
 * 更新费用项目状态
 * @param {number} feeId - 费用项目ID
 * @param {number} isActive - 状态，1启用，0停用
 * @returns {Promise} 返回更新结果
 */
export const updateFeeItemStatus = (feeId, isActive) => {
  console.log('=== updateFeeItemStatus API调用 ===');
  const requestData = { id: feeId, isActive };
  console.log('请求参数:', requestData);
  
  return http.post('/hospital/fee/updateFeeItemStatus', requestData)
    .then(response => {
      console.log('updateFeeItemStatus 响应数据:', response);
      return response;
    })
    .catch(error => {
      console.error('updateFeeItemStatus 请求失败:', error);
      throw error;
    });
};
