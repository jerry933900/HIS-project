const { logger } = require('../utils/logger');

/**
 * 错误处理中间件
 * 捕获所有未处理的错误并返回标准化的错误响应
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logger.error(`请求处理错误: ${err.message}`, {
    error: err,
    path: req.path,
    method: req.method,
    userId: req.user?.id || '未认证',
    ip: req.ip
  });

  // 定义默认错误响应
  let statusCode = 500;
  let errorMessage = '服务器内部错误，请稍后重试';
  let errorCode = 'SERVER_ERROR';
  let details = null;

  // 根据错误类型设置不同的响应
  if (err.name === 'ValidationError') {
    // Mongoose验证错误
    statusCode = 400;
    errorMessage = '数据验证失败';
    errorCode = 'VALIDATION_ERROR';
    details = Object.values(err.errors).map(error => error.message);
  } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    // MongoDB ObjectId格式错误
    statusCode = 400;
    errorMessage = '无效的ID格式';
    errorCode = 'INVALID_ID';
  } else if (err.name === 'MongoError' && err.code === 11000) {
    // MongoDB重复键错误
    statusCode = 400;
    errorMessage = '数据已存在';
    errorCode = 'DUPLICATE_DATA';
    // 提取重复字段
    const duplicateField = Object.keys(err.keyValue)[0];
    details = [`${duplicateField} 已经被使用`];
  } else if (err.statusCode) {
    // 自定义错误，包含statusCode
    statusCode = err.statusCode;
    errorMessage = err.message || errorMessage;
    errorCode = err.code || errorCode;
    details = err.details || null;
  } else if (err.name === 'SyntaxError') {
    // JSON解析错误
    statusCode = 400;
    errorMessage = '无效的JSON格式';
    errorCode = 'INVALID_JSON';
  }

  // 在开发环境下返回详细错误信息
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  const errorResponse = {
    success: false,
    message: errorMessage,
    code: errorCode,
    // 只在开发环境返回详细错误栈
    ...(isDev && { stack: err.stack?.split('\n') }),
    // 如果有详细错误信息则返回
    ...(details && { details })
  };

  // 发送错误响应
  res.status(statusCode).json(errorResponse);
};

/**
 * 自定义错误类
 * 用于创建应用程序特定的错误
 */
class AppError extends Error {
  constructor(message, statusCode, code = 'APP_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    
    // 保留原始错误栈
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 验证错误类
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message || '数据验证失败', 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * 未授权错误类
 */
class UnauthorizedError extends AppError {
  constructor(message = '未授权访问') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

/**
 * 禁止访问错误类
 */
class ForbiddenError extends AppError {
  constructor(message = '禁止访问') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

/**
 * 资源不存在错误类
 */
class NotFoundError extends AppError {
  constructor(message = '请求的资源不存在') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

module.exports = {
  errorHandler,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
};