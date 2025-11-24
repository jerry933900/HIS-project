const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 用户模型定义
 * 包含医生、护士、管理员等系统用户
 */
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 50,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other',
  },
  age: {
    type: Number,
    min: 0,
    max: 150,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^1[3-9]\d{9}$/,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
  },
  position: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'doctor', 'nurse', 'pharmacist', 'finance', 'receptionist'],
    default: 'receptionist',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'locked'],
    default: 'active',
  },
  avatar: {
    type: String,
    trim: true,
  },
  lastLoginTime: {
    type: Date,
  },
  createTime: {
    type: Date,
    default: Date.now,
  },
  updateTime: {
    type: Date,
    default: Date.now,
  },
  permissions: [
    {
      type: String,
      trim: true,
    },
  ],
  settings: {
    theme: {
      type: String,
      default: 'light',
    },
    language: {
      type: String,
      default: 'zh-CN',
    },
    // 其他用户个性化设置
  },
});

// 设置索引
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ department: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

// 中间件：更新updateTime字段
UserSchema.pre('save', function (next) {
  this.updateTime = Date.now();
  next();
});

UserSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updateTime: Date.now() });
  next();
});

// 虚拟属性：不存储在数据库中
UserSchema.virtual('displayName').get(function () {
  return this.fullName || this.username;
});

// 实例方法：检查用户是否有特定权限
UserSchema.methods.hasPermission = function (permission) {
  // 管理员拥有所有权限
  if (this.role === 'admin') {
    return true;
  }
  // 检查用户的权限列表
  return this.permissions.includes(permission);
};

// 静态方法：根据用户名查找用户
UserSchema.statics.findByUsername = async function (username) {
  return this.findOne({ username: username.toLowerCase() });
};

// 静态方法：根据手机号查找用户
UserSchema.statics.findByPhone = async function (phone) {
  return this.findOne({ phone });
};

// 静态方法：获取指定角色的用户列表
UserSchema.statics.findByRole = async function (role, options = {}) {
  const query = { role };
  
  // 如果指定了部门，添加部门筛选
  if (options.department) {
    query.department = options.department;
  }
  
  // 如果指定了状态，添加状态筛选
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('department', 'departmentName departmentCode')
    .sort({ createTime: -1 });
};

// 静态方法：获取用户统计信息
UserSchema.statics.getStatistics = async function () {
  return this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
        locked: { $sum: { $cond: [{ $eq: ['$status', 'locked'] }, 1, 0] } },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

module.exports = mongoose.model('User', UserSchema);