/**
 * 日志工具模块
 * 用于统一管理系统日志，支持不同日志级别和格式化输出
 */

const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf, colorize, prettyPrint } = format;
const path = require('path');
const fs = require('fs');

// 确保日志目录存在
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 自定义日志格式
const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// 创建日志记录器
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    label({ label: 'HIS-API' }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    customFormat
  ),
  defaultMeta: { service: 'his-api-service' },
  transports: [
    // 错误日志单独保存
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true,
      json: false
    }),
    // 所有日志保存
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      json: false
    })
  ]
});

// 在开发环境中，将日志输出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(
        colorize(),
        prettyPrint()
      ),
      handleExceptions: true
    })
  );
}

// 捕获未处理的异常
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  process.exit(1);
});

// 捕获未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', { reason, promise });
});

/**
 * 记录访问日志
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件函数
 */
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  // 重写res.send以捕获响应状态码和响应体
  res.send = function(body) {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user ? req.user._id : 'unauthorized'
    };
    
    // 根据状态码选择日志级别
    if (res.statusCode >= 500) {
      logger.error('请求失败', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('请求警告', logData);
    } else {
      logger.info('请求成功', logData);
    }
    
    // 调用原始的send方法
    return originalSend.call(this, body);
  };
  
  next();
};

module.exports = {
  logger,
  logRequest,
  // 便捷方法，便于使用
  info: (message, meta) => logger.info(message, meta),
  warn: (message, meta) => logger.warn(message, meta),
  error: (message, meta) => logger.error(message, meta),
  debug: (message, meta) => logger.debug(message, meta)
};