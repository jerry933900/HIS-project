/**
 * 速率限制中间件
 * 用于防止恶意请求和保护系统安全
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { createClient } = require('redis');
const { logger } = require('../utils/logger');

// Redis客户端配置
let redisClient = null;

// 尝试连接Redis
async function initRedisClient() {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL
      });

      redisClient.on('error', (err) => {
        logger.error('Redis连接错误:', err);
      });

      await redisClient.connect();
      logger.info('Redis客户端已连接');
    } catch (error) {
      logger.error('Redis连接失败:', error);
      redisClient = null;
    }
  }
}

/**
 * 创建速率限制器
 * @param {Object} options - 速率限制选项
 * @param {number} options.windowMs - 时间窗口（毫秒）
 * @param {number} options.max - 时间窗口内最大请求数
 * @param {string} options.message - 限制消息
 * @returns {Function} 速率限制中间件
 */
function createRateLimiter(options = {}) {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100,
    message: { success: false, message: '请求过于频繁，请稍后再试' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // 使用IP地址作为默认的限流键
      return req.ip;
    },
    skipSuccessfulRequests: false,
    skip: (req) => {
      // 跳过健康检查和开发环境的请求
      return (process.env.NODE_ENV === 'development' && 
              req.path.includes('/health'));
    },
    onLimitReached: (req, res, options) => {
      logger.warn('请求速率限制被触发', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // 如果Redis可用，使用Redis作为存储
  if (redisClient) {
    mergedOptions.store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args)
    });
  }

  return rateLimit(mergedOptions);
}

/**
 * API通用速率限制器
 */
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每IP每15分钟最多100个请求
  message: { success: false, message: 'API请求过于频繁，请稍后再试' }
});

/**
 * 认证相关路由的速率限制器（更严格）
 */
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每IP每小时最多5次尝试
  message: { success: false, message: '认证尝试过于频繁，请1小时后再试' },
  keyGenerator: (req) => {
    // 对于认证路由，可以使用用户名+IP的组合来限制
    return `${req.body.username || 'unknown'}:${req.ip}`;
  }
});

/**
 * 密码重置路由的速率限制器
 */
const passwordResetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 3, // 每IP每15分钟最多3次请求
  message: { success: false, message: '密码重置请求过于频繁，请稍后再试' }
});

/**
 * 注册路由的速率限制器
 */
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每IP每小时最多5次注册尝试
  message: { success: false, message: '注册尝试过于频繁，请稍后再试' }
});

/**
 * 应用程序启动时初始化Redis连接
 */
async function initializeRateLimiters() {
  await initRedisClient();
  logger.info('速率限制器已初始化');
}

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  registerLimiter,
  createRateLimiter,
  initializeRateLimiters
};