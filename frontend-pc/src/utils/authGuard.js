import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

/**
 * 认证守卫
 * @param {Object} to - 目标路由
 * @param {Object} from - 来源路由
 * @param {Function} next - 下一步函数
 */
const authGuard = (to, from, next) => {
  const userStore = useUserStore()
  
  // 检查是否已登录
  if (!userStore.isLoggedIn) {
    // 未登录，跳转到登录页
    ElMessage.warning('请先登录')
    next({
      path: '/login',
      query: { redirect: to.fullPath } // 记录登录前的路径，登录后可以跳转回来
    })
    return
  }
  
  // 检查路由是否需要特定权限
  if (to.meta.permissions) {
    const requiredPermissions = to.meta.permissions
    const hasPermission = Array.isArray(requiredPermissions) 
      ? requiredPermissions.some(permission => userStore.hasPermission(permission))
      : userStore.hasPermission(requiredPermissions)
    
    if (!hasPermission) {
      // 没有权限，跳转到403页面或提示
      ElMessage.error('没有权限访问此页面')
      next({
        path: '/403'
      })
      return
    }
  }
  
  // 已登录且有权限，允许访问
  next()
}

export default authGuard