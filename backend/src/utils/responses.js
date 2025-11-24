/**
 * 响应格式化工具
 * 提供统一的API响应格式
 */

/**
 * 成功响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 响应消息
 * @param {any} data - 响应数据
 * @param {number} statusCode - HTTP状态码，默认为200
 * @returns {Object} - Express响应
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null && data !== undefined) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * 错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {string} code - 错误代码
 * @param {any} details - 详细错误信息
 * @param {number} statusCode - HTTP状态码，默认为400
 * @returns {Object} - Express响应
 */
const errorResponse = (res, message, code = 'BAD_REQUEST', details = null, statusCode = 400) => {
  const response = {
    success: false,
    message,
    code
  };
  
  if (details !== null && details !== undefined) {
    response.details = details;
  }
  
  // 在开发环境下添加错误时间戳
  if (process.env.NODE_ENV === 'development') {
    response.timestamp = new Date().toISOString();
  }
  
  return res.status(statusCode).json(response);
};

/**
 * 分页响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 响应消息
 * @param {Array} items - 数据项数组
 * @param {Object} pagination - 分页信息
 * @param {number} statusCode - HTTP状态码，默认为200
 * @returns {Object} - Express响应
 */
const paginatedResponse = (res, message, items, pagination, statusCode = 200) => {
  return successResponse(res, message, {
    items,
    pagination
  }, statusCode);
};

/**
 * 验证错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 验证错误消息
 * @param {Array|Object} errors - 验证错误详情
 * @returns {Object} - Express响应
 */
const validationErrorResponse = (res, message = '数据验证失败', errors = null) => {
  return errorResponse(res, message, 'VALIDATION_ERROR', errors, 400);
};

/**
 * 未授权响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 未授权消息
 * @returns {Object} - Express响应
 */
const unauthorizedResponse = (res, message = '未授权访问，请先登录') => {
  return errorResponse(res, message, 'UNAUTHORIZED', null, 401);
};

/**
 * 禁止访问响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 禁止访问消息
 * @returns {Object} - Express响应
 */
const forbiddenResponse = (res, message = '权限不足，禁止访问') => {
  return errorResponse(res, message, 'FORBIDDEN', null, 403);
};

/**
 * 资源不存在响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 资源不存在消息
 * @returns {Object} - Express响应
 */
const notFoundResponse = (res, message = '请求的资源不存在') => {
  return errorResponse(res, message, 'NOT_FOUND', null, 404);
};

/**
 * 服务器错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 服务器错误消息
 * @returns {Object} - Express响应
 */
const serverErrorResponse = (res, message = '服务器内部错误，请稍后重试') => {
  return errorResponse(res, message, 'SERVER_ERROR', null, 500);
};

/**
 * 生成分页信息
 * @param {number} total - 总记录数
 * @param {number} page - 当前页码
 * @param {number} limit - 每页记录数
 * @returns {Object} - 分页信息对象
 */
const generatePagination = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    pages: totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    next: page < totalPages ? page + 1 : null,
    prev: page > 1 ? page - 1 : null,
    from: total > 0 ? (page - 1) * limit + 1 : 0,
    to: Math.min(page * limit, total)
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  generatePagination
};