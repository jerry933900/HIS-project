const User = require('../models/User');
const { generateToken, verifyToken, hashPassword, comparePassword } = require('../config/auth');
const logger = require('../config/logger');

/**
 * 用户认证控制器
 * 处理登录、注册、获取当前用户信息等功能
 */
const authController = {
  /**
   * 用户登录
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      // 查找用户
      const user = await User.findOne({ username });
      if (!user) {
        logger.warn(`用户登录失败：用户名 ${username} 不存在`);
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 检查用户状态
      if (user.status !== 'active') {
        logger.warn(`用户登录失败：用户 ${username} 状态异常`);
        return res.status(401).json({
          success: false,
          message: '用户已被禁用，请联系管理员'
        });
      }

      // 验证密码
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        logger.warn(`用户登录失败：用户 ${username} 密码错误`);
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 生成访问令牌
      const token = generateToken({
        userId: user._id,
        username: user.username,
        role: user.role
      });

      // 更新最后登录时间
      user.lastLogin = Date.now();
      await user.save();

      logger.info(`用户登录成功：${username}`);
      
      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            department: user.department,
            position: user.position,
            avatar: user.avatar
          }
        }
      });
    } catch (error) {
      logger.error(`登录异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '登录失败，请稍后重试'
      });
    }
  },

  /**
   * 用户注册
   * 注：实际HIS系统中，用户注册通常由管理员完成，此接口仅供参考
   */
  async register(req, res) {
    try {
      const { username, password, fullName, email, phone, role } = req.body;

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
            message: '邮箱已被注册'
          });
        }
      }

      // 检查手机号是否已存在
      if (phone) {
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: '手机号已被注册'
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
        email,
        phone,
        role,
        status: 'active',
        createTime: Date.now(),
        updateTime: Date.now()
      });

      await newUser.save();
      logger.info(`新用户注册成功：${username}`);

      // 生成访问令牌
      const token = generateToken({
        userId: newUser._id,
        username: newUser.username,
        role: newUser.role
      });

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: {
          token,
          user: {
            id: newUser._id,
            username: newUser.username,
            fullName: newUser.fullName,
            role: newUser.role,
            department: newUser.department,
            position: newUser.position
          }
        }
      });
    } catch (error) {
      logger.error(`用户注册异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '注册失败，请稍后重试'
      });
    }
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(req, res) {
    try {
      // 从请求中获取用户ID（通过认证中间件设置）
      const userId = req.user.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      // 查询用户信息
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 获取部门信息
      let departmentInfo = null;
      if (user.department) {
        // 这里可以根据需要扩展查询部门信息
        departmentInfo = { id: user.department };
      }

      res.json({
        success: true,
        message: '获取用户信息成功',
        data: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          department: departmentInfo,
          position: user.position,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          lastLogin: user.lastLogin,
          createTime: user.createTime
        }
      });
    } catch (error) {
      logger.error(`获取用户信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取用户信息失败，请稍后重试'
      });
    }
  },

  /**
   * 更新当前用户信息
   */
  async updateCurrentUser(req, res) {
    try {
      const userId = req.user.userId;
      const { fullName, email, phone, avatar } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      // 查询用户
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 更新用户信息
      if (fullName) user.fullName = fullName;
      if (email) {
        // 检查邮箱是否已被其他用户使用
        const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: '邮箱已被其他用户使用'
          });
        }
        user.email = email;
      }
      if (phone) {
        // 检查手机号是否已被其他用户使用
        const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: '手机号已被其他用户使用'
          });
        }
        user.phone = phone;
      }
      if (avatar) user.avatar = avatar;

      user.updateTime = Date.now();
      await user.save();
      logger.info(`用户信息更新成功：${user.username}`);

      res.json({
        success: true,
        message: '用户信息更新成功',
        data: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
        }
      });
    } catch (error) {
      logger.error(`更新用户信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '更新用户信息失败，请稍后重试'
      });
    }
  },

  /**
   * 修改密码
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { oldPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: '旧密码和新密码不能为空'
        });
      }

      // 查询用户
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证旧密码
      const isPasswordValid = await comparePassword(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: '旧密码错误'
        });
      }

      // 加密新密码
      const hashedPassword = await hashPassword(newPassword);
      user.password = hashedPassword;
      user.updateTime = Date.now();
      await user.save();
      
      logger.info(`用户密码修改成功：${user.username}`);

      res.json({
        success: true,
        message: '密码修改成功'
      });
    } catch (error) {
      logger.error(`修改密码异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '修改密码失败，请稍后重试'
      });
    }
  },

  /**
   * 登出
   * 注：前端需要移除本地存储的token
   */
  async logout(req, res) {
    try {
      // 在实际应用中，这里可以将token加入黑名单
      // 由于我们使用的是无状态JWT，这里主要由前端处理登出
      const userId = req.user?.userId;
      if (userId) {
        logger.info(`用户登出成功：${req.user.username}`);
      }
      
      res.json({
        success: true,
        message: '登出成功'
      });
    } catch (error) {
      logger.error(`用户登出异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '登出失败，请稍后重试'
      });
    }
  },

  /**
   * 刷新令牌
   */
  async refreshToken(req, res) {
    try {
      const currentToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!currentToken) {
        return res.status(401).json({
          success: false,
          message: '未提供令牌'
        });
      }

      // 验证当前令牌
      const decoded = verifyToken(currentToken);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: '令牌无效或已过期'
        });
      }

      // 生成新令牌
      const newToken = generateToken({
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role
      });

      logger.info(`令牌刷新成功：${decoded.username}`);

      res.json({
        success: true,
        message: '令牌刷新成功',
        data: {
          token: newToken
        }
      });
    } catch (error) {
      logger.error(`令牌刷新异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '令牌刷新失败，请稍后重试'
      });
    }
  }
};

module.exports = authController;