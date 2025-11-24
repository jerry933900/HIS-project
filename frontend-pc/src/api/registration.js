import request from './index'

// 获取挂号列表
export const getRegistrationList = (params) => {
  return request({
    url: '/api/registrations',
    method: 'get',
    params
  })
}

// 获取挂号详情
export const getRegistrationDetail = (id) => {
  return request({
    url: `/api/registrations/${id}`,
    method: 'get'
  })
}

// 创建挂号
export const createRegistration = (data) => {
  return request({
    url: '/api/registrations',
    method: 'post',
    data
  })
}

// 更新挂号信息
export const updateRegistration = (id, data) => {
  return request({
    url: `/api/registrations/${id}`,
    method: 'put',
    data
  })
}

// 完成挂号
export const completeRegistration = (id) => {
  return request({
    url: `/api/registrations/${id}/complete`,
    method: 'put'
  })
}

// 取消挂号
export const cancelRegistration = (id) => {
  return request({
    url: `/api/registrations/${id}/cancel`,
    method: 'put'
  })
}

// 删除挂号
export const deleteRegistration = (id) => {
  return request({
    url: `/api/registrations/${id}`,
    method: 'delete'
  })
}

// 获取挂号统计数据
export const getRegistrationStatistics = (params) => {
  return request({
    url: '/api/registrations/statistics',
    method: 'get',
    params
  })
}