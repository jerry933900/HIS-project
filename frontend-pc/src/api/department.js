import request from './index'

// 获取科室列表
export const getDepartmentList = (params) => {
  return request({
    url: '/api/departments',
    method: 'get',
    params
  })
}

// 获取科室详情
export const getDepartmentDetail = (id) => {
  return request({
    url: `/api/departments/${id}`,
    method: 'get'
  })
}

// 创建科室
export const createDepartment = (data) => {
  return request({
    url: '/api/departments',
    method: 'post',
    data
  })
}

// 更新科室信息
export const updateDepartment = (id, data) => {
  return request({
    url: `/api/departments/${id}`,
    method: 'put',
    data
  })
}

// 删除科室
export const deleteDepartment = (id) => {
  return request({
    url: `/api/departments/${id}`,
    method: 'delete'
  })
}