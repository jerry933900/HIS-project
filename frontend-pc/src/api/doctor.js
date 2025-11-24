import request from './index'

// 获取医生列表
export const getDoctorList = (params) => {
  return request({
    url: '/api/doctors',
    method: 'get',
    params
  })
}

// 获取医生详情
export const getDoctorDetail = (id) => {
  return request({
    url: `/api/doctors/${id}`,
    method: 'get'
  })
}

// 创建医生
export const createDoctor = (data) => {
  return request({
    url: '/api/doctors',
    method: 'post',
    data
  })
}

// 更新医生信息
export const updateDoctor = (id, data) => {
  return request({
    url: `/api/doctors/${id}`,
    method: 'put',
    data
  })
}

// 删除医生
export const deleteDoctor = (id) => {
  return request({
    url: `/api/doctors/${id}`,
    method: 'delete'
  })
}

// 获取医生排班信息
export const getDoctorSchedule = (id, params) => {
  return request({
    url: `/api/doctors/${id}/schedule`,
    method: 'get',
    params
  })
}