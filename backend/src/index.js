const { startServer } = require('./app');
const logger = require('./config/logger');

// 启动应用服务器
logger.info('开始启动医院信息管理系统(HIS)后端服务...');

// 执行启动函数
startServer().catch(error => {
  logger.error('服务启动失败:', error);
  process.exit(1);
});