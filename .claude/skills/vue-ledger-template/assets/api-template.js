import request from '@/utils/request';

// {{MODULE_NAME}} API

const baseUrl = '{{API_BASE_PATH}}';
const modulePath = '{{API_MODULE_PATH}}';

/**
 * 查询{{MODULE_NAME}}列表
 * @param {Object} query 查询参数
 * @returns {Promise}
 */
export function {{LIST_API}}(query) {
  return request({
    url: baseUrl + modulePath + '/list',
    method: 'get',
    params: query,
  });
}

/**
 * 查询{{MODULE_NAME}}详情
 * @param {string|number} id 记录ID
 * @returns {Promise}
 */
export function {{DETAIL_API}}(id) {
  return request({
    url: baseUrl + modulePath + '/' + id,
    method: 'get',
  });
}

/**
 * 新增{{MODULE_NAME}}
 * @param {Object} data 表单数据
 * @returns {Promise}
 */
export function {{ADD_API}}(data) {
  return request({
    url: baseUrl + modulePath,
    method: 'post',
    data: data,
  });
}

/**
 * 修改{{MODULE_NAME}}
 * @param {Object} data 表单数据
 * @returns {Promise}
 */
export function {{UPDATE_API}}(data) {
  return request({
    url: baseUrl + modulePath,
    method: 'put',
    data: data,
  });
}

/**
 * 删除{{MODULE_NAME}}
 * @param {string|number} id 记录ID
 * @returns {Promise}
 */
export function {{DEL_API}}(id) {
  return request({
    url: baseUrl + modulePath + '/' + id,
    method: 'delete',
  });
}

