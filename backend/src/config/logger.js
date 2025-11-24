const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 确保日志目录存在
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志格式化器
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    // 如果有元数据，添加到日志消息中
    if (Object.keys(metadata).length > 0) {
      // 如果是错误对象，显示堆栈信息
      if (metadata.error && metadata.error.stack) {
        logMessage += `\n${metadata.error.stack}`;
      } else {
        logMessage += ` ${JSON.stringify(metadata)}`;
      }
    }
    
    return logMessage;
  })
);

// 创建控制台日志格式化器（更易读的彩色格式）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let logMessage = `${timestamp} [${level}] ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      if (metadata.error && metadata.error.message) {
        logMessage += ` - ${metadata.error.message}`;
      } else {
        logMessage += ` ${JSON.stringify(metadata)}`;
      }
    }
    
    return logMessage;
  })
);

// 创建日志记录器
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'his-backend' },
  transports: [
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
    
    // 所有日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
    
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    }),
  ],
  // 未捕获异常处理
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 10485760,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  // 未处理拒绝处理
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 10485760,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// 导出日志记录器
module.exports = logger;

// 导出便捷的日志方法
exports.debug = (message, metadata) => logger.debug(message, metadata);
exports.info = (message, metadata) => logger.info(message, metadata);
exports.warn = (message, metadata) => logger.warn(message, metadata);
exports.error = (message, metadata) => logger.error(message, metadata);
exports.log = (level, message, metadata) => logger.log(level, message, metadata);