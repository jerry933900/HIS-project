import request from './index'

// 用户登录
export const login = (data) => {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

// 用户登出
export const logout = () => {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/api/auth/userinfo',
    method: 'get'
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: '/api/users/password',
    method: 'put',
    data
  })
}

// 获取用户列表
export const getUserList = (params) => {
  return request({
    url: '/api/users',
    method: 'get',
    params
  })
}

// 创建用户
export const createUser = (data) => {
  return request({
    url: '/api/users',
    method: 'post',
    data
  })
}

// 更新用户
export const updateUser = (id, data) => {
  return request({
    url: `/api/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export const deleteUser = (id) => {
  return request({
    url: `/api/users/${id}`,
    method: 'delete'
  })
}