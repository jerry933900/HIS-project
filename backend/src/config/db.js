const mongoose = require('mongoose');
const { logger } = require('../utils/logger');
require('dotenv').config();

/**
 * 数据库配置
 */
const dbConfig = {
  // MongoDB连接URI - 优先使用环境变量，否则使用默认值
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/his_system',
  // 连接选项
  options: {
    // 这些选项在新版本的Mongoose中已成为默认值
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // 如果需要使用MongoDB认证
    authSource: process.env.MONGO_AUTH_SOURCE || 'admin',
    // 连接超时设置（毫秒）
    connectTimeoutMS: 30000,
    // Socket超时设置（毫秒）
    socketTimeoutMS: 45000,
    // 心跳设置 - 使用正确的参数名
    serverSelectionTimeoutMS: 5000
  }
};

/**
 * 连接到MongoDB数据库
 */
const connectDB = async () => {
  try {
    logger.info('正在连接MongoDB数据库...');
    
    // 连接到MongoDB
    const connection = await mongoose.connect(dbConfig.uri, dbConfig.options);
    
    // 连接成功日志
    logger.info(`MongoDB数据库连接成功: ${connection.connection.host}:${connection.connection.port}/${connection.connection.name}`);
    
    // 连接事件监听
    mongoose.connection.on('error', (error) => {
      logger.error(`MongoDB连接错误: ${error.message}`);
      // 可以选择在严重错误时退出应用
      // process.exit(1);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB连接已断开');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB重新连接成功');
    });
    
    // 在Node.js进程终止时关闭数据库连接
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('应用关闭，MongoDB连接已断开');
      process.exit(0);
    });
    
    return connection;
  } catch (error) {
    logger.error(`MongoDB连接失败: ${error.message}`, { error });
    
    // 重试连接
    setTimeout(() => {
      logger.info('尝试重新连接MongoDB...');
      connectDB();
    }, 5000);
    
    throw error;
  }
};

/**
 * 断开数据库连接
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB连接已断开');
  } catch (error) {
    logger.error(`断开MongoDB连接时出错: ${error.message}`, { error });
    throw error;
  }
};

/**
 * 获取数据库连接状态
 */
const getConnectionStatus = () => {
  return mongoose.connection.readyState;
};

/**
 * 检查数据库连接是否有效
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1; // 1表示已连接
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  isConnected,
  mongoose // 导出mongoose实例，以便其他地方可以使用
};