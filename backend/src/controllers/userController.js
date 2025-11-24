const User = require('../models/User');
const { hashPassword } = require('../config/auth');
const logger = require('../config/logger');

/**
 * 用户管理控制器
 * 处理用户的CRUD操作和用户管理功能
 */
const userController = {
  /**
   * 获取用户列表
   */
  async getUsers(req, res) {
    try {
      // 分页参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // 构建查询条件
      const query = {};
      
      // 搜索条件
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
          { username: searchRegex },
          { fullName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ];
      }
      
      // 角色过滤
      if (req.query.role) {
        query.role = req.query.role;
      }
      
      // 部门过滤
      if (req.query.department) {
        query.department = req.query.department;
      }
      
      // 状态过滤
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // 排序
      const sortField = req.query.sortBy || 'createTime';
      const sortOrder = req.query.order === 'asc' ? 1 : -1;
      const sortOptions = { [sortField]: sortOrder };
      
      // 查询用户列表
      const users = await User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort(sortOptions);
      
      // 获取总数
      const total = await User.countDocuments(query);
      
      res.json({
        success: true,
        message: '获取用户列表成功',
        data: {
          users,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`获取用户列表异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取用户列表失败，请稍后重试'
      });
    }
  },

  /**
   * 获取用户详情
   */
  async getUserById(req, res) {
    try {
      const userId = req.params.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }
      
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      res.json({
        success: true,
        message: '获取用户详情成功',
        data: user
      });
    } catch (error) {
      logger.error(`获取用户详情异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取用户详情失败，请稍后重试'
      });
    }
  },

  /**
   * 创建新用户
   */
  async createUser(req, res) {
    try {
      const { 
        username, 
        password, 
        fullName, 
        role, 
        department, 
        position, 
        email, 
        phone, 
        status 
      } = req.body;
      
      // 验证必填字段
      const requiredFields = ['username', 'password', 'fullName', 'role'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `缺少必填字段: ${missingFields.join(', ')}`
        });
      }
      
      // 检查用户名是否已存在
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }
      
      // 检查邮箱是否已存在
      if (email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: '邮箱已被使用'
          });
        }
      }
      
      // 检查手机号是否已存在
      if (phone) {
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: '手机号已被使用'
          });
        }
      }
      
      // 密码加密
      const hashedPassword = await hashPassword(password);
      
      // 创建新用户
      const newUser = new User({
        username,
        password: hashedPassword,
        fullName,
        role,
        department,
        position,
        email,
        phone,
        status: status || 'active',
        createTime: Date.now(),
        updateTime: Date.now()
      });
      
      await newUser.save();
      logger.info(`创建用户成功：${username}`);
      
      // 移除密码后返回
      const userData = newUser.toObject();
      delete userData.password;
      
      res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: userData
      });
    } catch (error) {
      logger.error(`创建用户异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '用户创建失败，请稍后重试'
      });
    }
  },

  /**
   * 更新用户信息
   */
  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const { 
        fullName, 
        role, 
        department, 
        position, 
        email, 
        phone, 
        status, 
        avatar 
      } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }
      
      // 查找用户
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      // 检查邮箱是否已被其他用户使用
      if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: '邮箱已被其他用户使用'
          });
        }
      }
      
      // 检查手机号是否已被其他用户使用
      if (phone && phone !== user.phone) {
        const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: '手机号已被其他用户使用'
          });
        }
      }
      
      // 更新用户信息
      if (fullName !== undefined) user.fullName = fullName;
      if (role !== undefined) user.role = role;
      if (department !== undefined) user.department = department;
      if (position !== undefined) user.position = position;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (status !== undefined) user.status = status;
      if (avatar !== undefined) user.avatar = avatar;
      
      user.updateTime = Date.now();
      await user.save();
      logger.info(`更新用户成功：${user.username}`);
      
      // 移除密码后返回
      const userData = user.toObject();
      delete userData.password;
      
      res.json({
        success: true,
        message: '用户更新成功',
        data: userData
      });
    } catch (error) {
      logger.error(`更新用户异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '用户更新失败，请稍后重试'
      });
    }
  },

  /**
   * 重置用户密码
   */
  async resetPassword(req, res) {
    try {
      const userId = req.params.id;
      const { newPassword } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }
      
      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: '新密码不能为空'
        });
      }
      
      // 查找用户
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      // 密码加密并更新
      const hashedPassword = await hashPassword(newPassword);
      user.password = hashedPassword;
      user.updateTime = Date.now();
      await user.save();
      
      logger.info(`重置用户密码成功：${user.username}`);
      
      res.json({
        success: true,
        message: '密码重置成功'
      });
    } catch (error) {
      logger.error(`重置用户密码异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '密码重置失败，请稍后重试'
      });
    }
  },

  /**
   * 删除用户
   */
  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }
      
      // 查找用户
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      // 在实际应用中，通常不真正删除用户，而是将其状态设置为禁用
      // 这里实现软删除
      user.status = 'deleted';
      user.updateTime = Date.now();
      await user.save();
      
      logger.info(`删除用户成功：${user.username}`);
      
      res.json({
        success: true,
        message: '用户删除成功'
      });
    } catch (error) {
      logger.error(`删除用户异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '用户删除失败，请稍后重试'
      });
    }
  },

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(req, res) {
    try {
      const { userIds } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供要删除的用户ID列表'
        });
      }
      
      // 批量软删除用户
      const result = await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { status: 'deleted', updateTime: Date.now() } }
      );
      
      logger.info(`批量删除用户成功，影响用户数：${result.modifiedCount}`);
      
      res.json({
        success: true,
        message: `成功删除 ${result.modifiedCount} 个用户`,
        data: {
          deletedCount: result.modifiedCount
        }
      });
    } catch (error) {
      logger.error(`批量删除用户异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '批量删除用户失败，请稍后重试'
      });
    }
  },

  /**
   * 更新用户状态
   */
  async updateUserStatus(req, res) {
    try {
      const userId = req.params.id;
      const { status } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }
      
      if (!status || !['active', 'inactive', 'deleted'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的状态值'
        });
      }
      
      // 更新用户状态
      const result = await User.findByIdAndUpdate(
        userId,
        { status, updateTime: Date.now() },
        { new: true }
      ).select('-password');
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      logger.info(`更新用户状态成功：${result.username}，新状态：${status}`);
      
      res.json({
        success: true,
        message: '用户状态更新成功',
        data: result
      });
    } catch (error) {
      logger.error(`更新用户状态异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '用户状态更新失败，请稍后重试'
      });
    }
  },

  /**
   * 获取用户统计信息
   */
  async getUserStatistics(req, res) {
    try {
      // 获取用户总数
      const totalUsers = await User.countDocuments({ status: { $ne: 'deleted' } });
      
      // 按角色统计
      const usersByRole = await User.aggregate([
        { $match: { status: { $ne: 'deleted' } } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);
      
      // 按状态统计
      const usersByStatus = await User.aggregate([
        { $match: { status: { $ne: 'deleted' } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // 今日新增用户
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = await User.countDocuments({ 
        createTime: { $gte: today },
        status: { $ne: 'deleted' }
      });
      
      res.json({
        success: true,
        message: '获取用户统计信息成功',
        data: {
          totalUsers,
          usersByRole,
          usersByStatus,
          newUsersToday
        }
      });
    } catch (error) {
      logger.error(`获取用户统计信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取用户统计信息失败，请稍后重试'
      });
    }
  }
};

module.exports = userController;