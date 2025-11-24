const { logger } = require('../utils/logger');

/**
 * 角色中间件
 * 验证用户是否具有指定角色之一
 * @param {Array} roles - 允许的角色数组
 * @returns {Function} - 中间件函数
 */
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    try {
      // 确保用户已通过认证中间件
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }
      
      // 检查用户角色是否在允许的角色列表中
      if (!roles.includes(req.user.role)) {
        logger.warn(`权限不足：用户 ${req.user.username} (角色: ${req.user.role}) 尝试访问需要角色 ${roles.join(', ')} 的资源`);
        return res.status(403).json({
          success: false,
          message: '权限不足，您没有执行此操作的权限'
        });
      }
      
      next();
    } catch (error) {
      logger.error(`角色验证中间件错误: ${error.message}`, { error });
      return res.status(500).json({
        success: false,
        message: '权限验证过程中发生错误'
      });
    }
  };
};

module.exports = roleMiddleware;