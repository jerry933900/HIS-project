import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { login, logout as logoutApi, getUserInfo } from '../api/user'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const loading = ref(false)
  const error = ref('')

  // 判断用户是否已登录
  const isLoggedIn = computed(() => {
    return !!token.value
  })

  // 获取用户权限
  const permissions = computed(() => {
    return userInfo.value?.permissions || []
  })

  // 登录
  const doLogin = async (username, password) => {
    loading.value = true
    error.value = ''
    try {
      // 强制使用模拟登录，用于演示环境（后端API不可用）
      // 模拟成功登录
      const mockToken = 'mock_admin_token_123456'
      
      // 保存token到localStorage和state
      localStorage.setItem('token', mockToken)
      token.value = mockToken
      
      // 模拟用户信息
      userInfo.value = {
        id: '1',
        username: username || 'admin',
        name: '系统管理员',
        role: '管理员',
        permissions: ['admin:*']
      }
      
      return { data: { token: mockToken } }
      
      // 正常登录流程（暂时注释掉，后端API不可用）
      // const response = await login({ username, password })
      // const { token: newToken } = response.data
      // 
      // // 保存token到localStorage和state
      // localStorage.setItem('token', newToken)
      // token.value = newToken
      // 
      // // 获取用户信息
      // await getUserInfoData()
      // 
      // return response
    } catch (err) {
      error.value = err.message || '登录失败，请检查用户名和密码'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  const getUserInfoData = async () => {
    if (!token.value) return
    
    try {
      const response = await getUserInfo()
      userInfo.value = response.data
    } catch (err) {
      console.error('获取用户信息失败:', err)
      // 如果获取用户信息失败，清除token并重定向到登录页
      clearUserInfo()
      router.push('/login')
    }
  }

  // 登出
  const logout = async () => {
    try {
      await logoutApi()
    } catch (err) {
      console.error('登出失败:', err)
    } finally {
      clearUserInfo()
      router.push('/login')
    }
  }

  // 清除用户信息
  const clearUserInfo = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  // 检查用户是否有权限
  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }

  return {
    userInfo,
    token,
    loading,
    error,
    isLoggedIn,
    permissions,
    doLogin,
    getUserInfo: getUserInfoData,
    logout,
    hasPermission
  }
})