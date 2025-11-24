const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('./logger');

/**
 * JWT认证配置
 */
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * 生成JWT令牌
 * @param {Object} payload - 要包含在令牌中的数据
 * @returns {Promise<string>} - JWT令牌
 */
const generateToken = async (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return token;
  } catch (error) {
    logger.error('生成JWT令牌失败:', error);
    throw new Error('生成认证令牌失败');
  }
};

/**
 * 验证JWT令牌
 * @param {string} token - JWT令牌
 * @returns {Promise<Object>} - 令牌中的有效载荷
 */
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.error('验证JWT令牌失败:', error);
    throw new Error('无效的认证令牌');
  }
};

/**
 * 解码JWT令牌（不验证签名）
 * @param {string} token - JWT令牌
 * @returns {Object} - 令牌中的有效载荷
 */
const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    logger.error('解码JWT令牌失败:', error);
    return null;
  }
};

/**
 * 哈希密码
 * @param {string} password - 原始密码
 * @returns {Promise<string>} - 哈希后的密码
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    logger.error('密码哈希失败:', error);
    throw new Error('密码处理失败');
  }
};

/**
 * 验证密码
 * @param {string} password - 原始密码
 * @param {string} hashedPassword - 哈希后的密码
 * @returns {Promise<boolean>} - 密码是否匹配
 */
const verifyPassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    logger.error('密码验证失败:', error);
    return false;
  }
};

/**
 * JWT认证中间件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一步函数
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: '未提供认证令牌',
      });
    }
    
    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = await verifyToken(token);
    
    // 将解码后的用户信息添加到请求对象
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: error.message || '认证失败',
    });
  }
};

/**
 * 角色权限检查中间件
 * @param {Array<string>} allowedRoles - 允许的角色列表
 * @returns {Function} - Express中间件函数
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // 确保用户已通过认证
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          status: 'error',
          message: '未认证用户',
        });
      }
      
      // 检查用户角色是否在允许列表中
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: '权限不足，无法访问此资源',
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: '权限检查失败',
      });
    }
  };
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  hashPassword,
  verifyPassword,
  authMiddleware,
  roleMiddleware,
};