const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./src/models/User');

// 加载环境变量
dotenv.config();

// MongoDB连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/his_system';

// 默认管理员信息
const adminUser = {
  username: 'admin',
  password: 'admin123',  // 默认密码，可以登录后修改
  fullName: '系统管理员',
  role: 'admin',
  phone: '13800138000',
  email: 'admin@his-system.com',
  status: 'active'
};

/**
 * 创建默认管理员账户
 */
async function createDefaultAdmin() {
  try {
    console.log('正在连接MongoDB数据库...');
    
    // 连接数据库
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('数据库连接成功');
    
    // 检查管理员账户是否已存在
    const existingAdmin = await User.findOne({ username: adminUser.username });
    
    if (existingAdmin) {
      console.log(`管理员账户 '${adminUser.username}' 已存在`);
      return;
    }
    
    // 加密密码
    console.log('正在创建管理员账户...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    // 创建管理员账户
    const admin = new User({
      ...adminUser,
      password: hashedPassword,
      createTime: Date.now(),
      updateTime: Date.now()
    });
    
    await admin.save();
    console.log('========================================');
    console.log('✅ 管理员账户创建成功！');
    console.log(`📱 用户名: ${adminUser.username}`);
    console.log(`🔑 密码: ${adminUser.password} (请登录后及时修改)`);
    console.log(`🔧 角色: ${adminUser.role}`);
    console.log('========================================');
    
    // 断开数据库连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    
  } catch (error) {
    console.error('创建管理员账户失败:', error);
    process.exit(1);
  }
}

// 执行创建管理员函数
createDefaultAdmin();