const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * JWT工具
 * 处理JWT令牌的生成和验证
 */

// JWT配置
const JWT_CONFIG = {
  // 访问令牌密钥
  accessSecret: process.env.JWT_SECRET || 'his_system_jwt_secret_key',
  // 访问令牌过期时间
  accessExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  // 刷新令牌密钥
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'his_system_refresh_token_secret_key',
  // 刷新令牌过期时间
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
};

/**
 * 生成访问令牌
 * @param {Object} payload - 要包含在令牌中的数据
 * @returns {Promise<string>} - JWT令牌字符串
 */
const generateAccessToken = async (payload) => {
  try {
    // 确保payload是对象
    if (!payload || typeof payload !== 'object') {
      throw new Error('无效的payload');
    }
    
    // 添加令牌类型
    const tokenPayload = {
      ...payload,
      type: 'access',
      iat: Math.floor(Date.now() / 1000) // 颁发时间
    };
    
    // 生成令牌
    const token = jwt.sign(
      tokenPayload,
      JWT_CONFIG.accessSecret,
      { expiresIn: JWT_CONFIG.accessExpiresIn }
    );
    
    return token;
  } catch (error) {
    console.error('生成访问令牌失败:', error);
    throw error;
  }
};

/**
 * 生成刷新令牌
 * @param {Object} payload - 要包含在令牌中的数据
 * @returns {Promise<string>} - 刷新令牌字符串
 */
const generateRefreshToken = async (payload) => {
  try {
    // 确保payload是对象
    if (!payload || typeof payload !== 'object') {
      throw new Error('无效的payload');
    }
    
    // 添加令牌类型
    const tokenPayload = {
      ...payload,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000) // 颁发时间
    };
    
    // 生成令牌
    const token = jwt.sign(
      tokenPayload,
      JWT_CONFIG.refreshSecret,
      { expiresIn: JWT_CONFIG.refreshExpiresIn }
    );
    
    return token;
  } catch (error) {
    console.error('生成刷新令牌失败:', error);
    throw error;
  }
};

/**
 * 验证访问令牌
 * @param {string} token - 要验证的JWT令牌
 * @returns {Promise<Object>} - 解码后的令牌数据
 */
const verifyAccessToken = async (token) => {
  try {
    // 验证令牌
    const decoded = jwt.verify(token, JWT_CONFIG.accessSecret);
    
    // 验证令牌类型
    if (decoded.type !== 'access') {
      throw new Error('无效的令牌类型');
    }
    
    return decoded;
  } catch (error) {
    console.error('验证访问令牌失败:', error);
    throw error;
  }
};

/**
 * 验证刷新令牌
 * @param {string} token - 要验证的刷新令牌
 * @returns {Promise<Object>} - 解码后的令牌数据
 */
const verifyRefreshToken = async (token) => {
  try {
    // 验证令牌
    const decoded = jwt.verify(token, JWT_CONFIG.refreshSecret);
    
    // 验证令牌类型
    if (decoded.type !== 'refresh') {
      throw new Error('无效的令牌类型');
    }
    
    return decoded;
  } catch (error) {
    console.error('验证刷新令牌失败:', error);
    throw error;
  }
};

/**
 * 解码令牌（不验证签名）
 * @param {string} token - 要解码的JWT令牌
 * @returns {Object|null} - 解码后的令牌数据
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('解码令牌失败:', error);
    return null;
  }
};

/**
 * 检查令牌是否过期
 * @param {string} token - 要检查的令牌
 * @returns {boolean} - 令牌是否过期
 */
const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // 出错时视为过期
  }
};

/**
 * 生成令牌对（访问令牌和刷新令牌）
 * @param {Object} userData - 用户数据
 * @returns {Promise<Object>} - 包含访问令牌和刷新令牌的对象
 */
const generateTokenPair = async (userData) => {
  try {
    // 准备用户数据
    const payload = {
      id: userData._id || userData.id,
      username: userData.username,
      role: userData.role
    };
    
    // 生成两个令牌
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);
    
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: JWT_CONFIG.accessExpiresIn,
      refreshTokenExpiresIn: JWT_CONFIG.refreshExpiresIn
    };
  } catch (error) {
    console.error('生成令牌对失败:', error);
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  generateTokenPair,
  JWT_CONFIG
};