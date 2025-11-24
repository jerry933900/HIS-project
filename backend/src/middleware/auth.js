const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const logger = require('../utils/logger');
const User = require('../models/User');

/**
 * 认证中间件
 * 验证JWT令牌并将用户信息附加到请求对象
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌，请先登录'
      });
    }
    
    // 检查Bearer前缀
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: '认证令牌格式无效'
      });
    }
    
    const token = parts[1];
    
    // 验证令牌
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    
    // 确保令牌是访问令牌
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: '无效的令牌类型'
      });
    }
    
    // 查询用户是否存在且有效
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: '用户账号已被禁用'
      });
    }
    
    // 将用户信息附加到请求对象
    req.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      department: user.department
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn(`访问令牌已过期: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期，请重新登录',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn(`无效的JWT令牌: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    } else {
      logger.error(`认证中间件错误: ${error.message}`, { error });
      return res.status(500).json({
        success: false,
        message: '认证过程中发生错误'
      });
    }
  }
};

module.exports = authMiddleware;