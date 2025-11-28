// 前端日志工具类
// 提供统一的日志记录功能，支持不同级别和格式化输出

class Logger {
  constructor(moduleName = 'HIS') {
    this.moduleName = moduleName;
    this.isDev = process.env.NODE_ENV !== 'production';
    this.logLevel = this.isDev ? 'debug' : 'info';
    
    // 定义日志级别
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
  }

  // 判断日志是否应该输出
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  // 格式化日志时间
  formatTime() {
    return new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  // 格式化日志消息
  formatMessage(level, message) {
    const timestamp = this.formatTime();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.moduleName}] ${message}`;
  }

  // 基础日志记录方法
  log(level, message, data = null) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message);
    
    // 根据不同级别使用不同的控制台方法
    switch (level) {
      case 'error':
        if (data) {
          console.error(formattedMessage, data);
        } else {
          console.error(formattedMessage);
        }
        break;
      case 'warn':
        if (data) {
          console.warn(formattedMessage, data);
        } else {
          console.warn(formattedMessage);
        }
        break;
      case 'info':
        if (data) {
          console.info(formattedMessage, data);
        } else {
          console.info(formattedMessage);
        }
        break;
      case 'debug':
        if (data) {
          console.debug(formattedMessage, data);
        } else {
          console.debug(formattedMessage);
        }
        break;
      case 'trace':
        if (data) {
          console.trace(formattedMessage, data);
        } else {
          console.trace(formattedMessage);
        }
        break;
      default:
        console.log(formattedMessage, data);
    }

    // 在生产环境可以添加日志上报逻辑
    if (!this.isDev && level === 'error') {
      this.reportError(message, data);
    }
  }

  // 错误日志
  error(message, data = null) {
    this.log('error', message, data);
  }

  // 警告日志
  warn(message, data = null) {
    this.log('warn', message, data);
  }

  // 信息日志
  info(message, data = null) {
    this.log('info', message, data);
  }

  // 调试日志
  debug(message, data = null) {
    this.log('debug', message, data);
  }

  // 跟踪日志
  trace(message, data = null) {
    this.log('trace', message, data);
  }

  // 设置日志级别
  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.logLevel = level;
      this.info(`日志级别已设置为: ${level}`);
    } else {
      this.warn(`无效的日志级别: ${level}`);
    }
  }

  // 记录API请求日志
  apiRequest(method, url, params = null) {
    const message = `${method} ${url}`;
    this.debug(message, params);
  }

  // 记录API响应日志
  apiResponse(method, url, status, data = null) {
    const message = `${method} ${url} ${status}`;
    if (status >= 400) {
      this.error(message, data);
    } else {
      this.debug(message, data);
    }
  }

  // 错误上报（模拟）
  reportError(message, data) {
    // 在实际项目中，这里可以实现向错误监控服务发送日志的逻辑
    // 例如使用Sentry、Bugsnag等服务
    try {
      console.log('错误上报:', { message, data });
      // window.fetch('/api/logs/error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message, data, timestamp: new Date().toISOString() })
      // });
    } catch (err) {
      console.error('日志上报失败:', err);
    }
  }
}

// 创建默认logger实例
const defaultLogger = new Logger();

// 导出默认logger和Logger类
export default defaultLogger;
export { Logger };