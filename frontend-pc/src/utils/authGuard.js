import { ElMessage } from 'element-plus'

/**
 * 认证守卫
 * @param {Object} to - 目标路由
 * @param {Object} from - 来源路由
 * @param {Function} next - 下一步函数
 */
const authGuard = (to, from, next) => {
  // 直接从localStorage检查token，避免在路由守卫中使用store的响应式问题
  const hasToken = !!localStorage.getItem('token')
  
  // 检查是否已登录
  if (!hasToken) {
    // 未登录，跳转到登录页
    ElMessage.warning('请先登录')
    next({
      path: '/login',
      query: { redirect: to.fullPath } // 记录登录前的路径，登录后可以跳转回来
    })
    return
  }
  
  // 对于权限检查，我们暂时简化处理，因为这不是当前的主要问题
  // 在实际生产环境中，应该从localStorage或cookie中获取权限信息
  
  // 已登录，允许访问
  next()
}

export default authGuard