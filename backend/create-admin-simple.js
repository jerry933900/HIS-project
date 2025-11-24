// 创建默认管理员账户的简单脚本
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 定义User模型结构（简化版）
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  fullName: String,
  role: String,
  phone: String,
  email: String,
  status: String,
  createTime: Number,
  updateTime: Number
});

const User = mongoose.model('User', userSchema);

// 数据库连接
async function connectDB() {
  try {
    // 使用项目配置中的数据库连接字符串
    const mongoURI = 'mongodb://localhost:27017/his_system';
    await mongoose.connect(mongoURI);
    console.log('MongoDB连接成功');
    return true;
  } catch (error) {
    console.error('MongoDB连接失败:', error.message);
    return false;
  }
}

// 密码哈希函数
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('密码哈希失败:', error.message);
    // 如果哈希失败，直接返回明文密码（仅用于测试）
    console.log('⚠️  密码哈希失败，将使用明文密码（仅用于测试）');
    return password;
  }
}

// 创建默认管理员
async function createDefaultAdmin() {
  try {
    // 连接数据库
    const isConnected = await connectDB();
    if (!isConnected) {
      console.log('数据库连接失败，无法创建管理员账户');
      return;
    }

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
      console.log('未找到管理员账户，正在创建默认管理员...');

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
      console.log(`✅ 默认管理员账户创建成功！用户名: ${adminUser.username}, 密码: ${adminUser.password}`);
    } else {
      console.log(`管理员账户 '${adminUser.username}' 已存在`);
    }

    // 关闭数据库连接
    await mongoose.disconnect();
  } catch (error) {
    console.error('创建管理员账户失败:', error.message);
  }
}

// 运行脚本
createDefaultAdmin();