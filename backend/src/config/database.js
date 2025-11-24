const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * MongoDB数据库连接配置
 */
const connectDB = async () => {
  try {
    // 连接配置选项
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 100,           // 最大连接池大小
      connectTimeoutMS: 10000,    // 连接超时时间
      socketTimeoutMS: 45000,     // 套接字超时时间
      family: 4,                  // 使用IPv4，避免IPv6的潜在问题
    };

    // 连接数据库
    const connection = await mongoose.connect(process.env.MONGODB_URI, options);
    
    logger.info(`MongoDB连接成功: ${connection.connection.host}`);
    logger.info(`数据库名称: ${connection.connection.name}`);
    
    // 监听数据库连接事件
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose已连接到数据库');
    });
    
    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose连接错误:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose已断开连接');
    });
    
    // 进程结束时关闭连接
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        logger.info('Mongoose连接已关闭，进程退出');
        process.exit(0);
      });
    });
    
    return connection;
  } catch (error) {
    logger.error('MongoDB连接失败:', error);
    throw error;
  }
};

/**
 * 关闭数据库连接
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB连接已成功关闭');
  } catch (error) {
    logger.error('关闭MongoDB连接失败:', error);
    throw error;
  }
};

/**
 * 检查数据库连接状态
 */
const checkDBStatus = () => {
  const readyState = mongoose.connection.readyState;
  const statusMessages = {
    0: '未连接',
    1: '已连接',
    2: '正在连接',
    3: '正在断开连接',
  };
  
  return {
    readyState,
    status: statusMessages[readyState] || '未知状态',
    isConnected: readyState === 1,
  };
};

module.exports = {
  connectDB,
  closeDB,
  checkDBStatus,
  mongoose,  // 导出mongoose实例，便于在其他地方直接使用
};