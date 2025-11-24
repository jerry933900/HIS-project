/**
 * 服务器入口文件
 * 启动HIS后端服务器
 */

// 导入startServer函数
const { startServer } = require('./app');

// 立即执行startServer函数启动服务器
startServer().catch((error) => {
  console.error('无法启动服务器:', error);
  process.exit(1);
});