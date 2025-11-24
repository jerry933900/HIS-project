const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { errorHandler } = require('./middleware/errorHandler');
const { logRequest, logger } = require('./utils/logger');
const { connectDB } = require('./config/db');
const { apiLimiter, initializeRateLimiters } = require('./middleware/rateLimiter');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置中间件

// 安全头部中间件
app.use(helmet());

// CORS配置
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 请求体解析中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 应用速率限制
app.use('/api', apiLimiter);

// 应用日志记录中间件
app.use(logRequest);

// 日志中间件
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API路由
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '医院信息管理系统(HIS) API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 全局错误处理中间件
app.use(errorHandler);

/**
 * 初始化默认管理员账户
 */
async function initializeDefaultAdmin() {
  try {
    // 导入User模型和密码哈希函数
    const User = require('./models/User');
    const { hashPassword } = require('./config/auth');
    
    // 默认管理员信息
    const adminUser = {
      username: 'admin',
      password: 'admin123',  // 默认密码
      fullName: '系统管理员',
      role: 'admin',
      phone: '13800138000',
      email: 'admin@his-system.com',
      status: 'active'
    };
    
    // 检查管理员账户是否已存在
    const existingAdmin = await User.findOne({ username: adminUser.username });
    
    if (!existingAdmin) {
      logger.info('未找到管理员账户，正在创建默认管理员...');
      
      // 加密密码
      const hashedPassword = await hashPassword(adminUser.password);
      
      // 创建管理员账户
      const admin = new User({
        ...adminUser,
        password: hashedPassword,
        createTime: Date.now(),
        updateTime: Date.now()
      });
      
      await admin.save();
      logger.info(`✅ 默认管理员账户创建成功！用户名: ${adminUser.username}, 密码: ${adminUser.password}`);
    } else {
      logger.info(`管理员账户 '${adminUser.username}' 已存在`);
    }
  } catch (error) {
    logger.error('初始化默认管理员失败:', error);
  }
}

/**
 * 启动服务器
 */
async function startServer() {
  try {
    logger.info('开始启动HIS后端服务...');
    
    // 最小化启动 - 不连接数据库，不初始化速率限制器，只启动HTTP服务器
    const PORT = process.env.PORT || 3001;
    logger.info(`准备在端口 ${PORT} 启动服务器（最小化模式）`);
    
    // 立即启动HTTP服务器
    const server = await new Promise((resolve) => {
      const s = app.listen(PORT, () => {
        logger.info(`✅ 服务器成功启动在 ${PORT} 端口`);
        logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
        logger.info('注意: 运行在最小化模式，不依赖数据库');
        resolve(s);
      });
    });
    
    logger.info('服务器启动完成，监听中...');
    return server;
    
    // 处理未捕获的Promise拒绝
    process.on('unhandledRejection', (error) => {
      logger.error(`未处理的Promise拒绝: ${error.message}`, { error });
    });
    
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      logger.error(`未捕获的异常: ${error.message}`, { error });
      // 记录错误但不立即退出，让服务器继续运行
    });
    
    // 处理SIGTERM信号（优雅关闭）
    process.on('SIGTERM', () => {
      logger.info('收到SIGTERM信号，准备关闭服务器...');
      server.close(() => {
        logger.info('服务器已优雅关闭');
        process.exit(0);
      });
    });
    
    return server;
  } catch (error) {
    logger.error('服务器启动失败:', error);
    // 即使出错也尝试启动服务器
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      logger.info(`服务器在出错后仍然运行在 ${PORT} 端口`);
    });
    return server;
  }
}

// 导出应用实例和启动函数，以便在测试中使用
module.exports = { app, startServer };