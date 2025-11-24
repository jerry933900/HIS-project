const Department = require('../models/Department');
const User = require('../models/User');
const { logger } = require('../utils/logger');

/**
 * 科室管理控制器
 * 处理科室信息的CRUD操作和科室相关功能
 */
const departmentController = {
  /**
   * 获取科室列表
   */
  async getDepartments(req, res) {
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
          { name: searchRegex },
          { code: searchRegex },
          { description: searchRegex }
        ];
      }
      
      // 状态过滤
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // 父科室过滤
      if (req.query.parentId) {
        query.parentId = req.query.parentId === 'null' ? null : req.query.parentId;
      }
      
      // 是否顶级科室过滤
      if (req.query.isTopLevel === 'true') {
        query.parentId = null;
      }
      
      // 排序
      const sortField = req.query.sortBy || 'code';
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      const sortOptions = { [sortField]: sortOrder };
      
      // 查询科室列表
      const departments = await Department.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions);
      
      // 获取总数
      const total = await Department.countDocuments(query);
      
      res.json({
        success: true,
        message: '获取科室列表成功',
        data: {
          departments,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`获取科室列表异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取科室列表失败，请稍后重试'
      });
    }
  },

  /**
   * 获取科室详情
   */
  async getDepartmentById(req, res) {
    try {
      const departmentId = req.params.id;
      
      if (!departmentId) {
        return res.status(400).json({
          success: false,
          message: '科室ID不能为空'
        });
      }
      
      // 查询科室信息
      const department = await Department.findById(departmentId);
      
      if (!department) {
        return res.status(404).json({
          success: false,
          message: '科室不存在'
        });
      }
      
      // 获取科室下的医生数量
      const doctorCount = await User.countDocuments({ department: departmentId, status: 'active' });
      
      // 获取父科室信息
      let parentDepartment = null;
      if (department.parentId) {
        parentDepartment = await Department.findById(department.parentId).select('name code');
      }
      
      // 获取子科室数量
      const subDepartmentCount = await Department.countDocuments({ parentId: departmentId });
      
      res.json({
        success: true,
        message: '获取科室详情成功',
        data: {
          ...department.toObject(),
          parentDepartment,
          doctorCount,
          subDepartmentCount
        }
      });
    } catch (error) {
      logger.error(`获取科室详情异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取科室详情失败，请稍后重试'
      });
    }
  },

  /**
   * 创建新科室
   */
  async createDepartment(req, res) {
    try {
      const {
        code,
        name,
        description,
        parentId,
        contactPerson,
        contactPhone,
        contactEmail,
        location,
        isSpecial,
        status
      } = req.body;
      
      // 验证必填字段
      const requiredFields = ['code', 'name'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `缺少必填字段: ${missingFields.join(', ')}`
        });
      }
      
      // 检查科室编码是否已存在
      const existingCode = await Department.findOne({ code });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: '科室编码已存在'
        });
      }
      
      // 检查科室名称是否已存在
      const existingName = await Department.findOne({ name });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: '科室名称已存在'
        });
      }
      
      // 如果指定了父科室，检查父科室是否存在
      if (parentId && parentId !== 'null') {
        const parentDepartment = await Department.findById(parentId);
        if (!parentDepartment) {
          return res.status(400).json({
            success: false,
            message: '指定的父科室不存在'
          });
        }
      }
      
      // 创建新科室
      const newDepartment = new Department({
        code,
        name,
        description,
        parentId: parentId === 'null' ? null : parentId,
        contactPerson,
        contactPhone,
        contactEmail,
        location,
        isSpecial: isSpecial || false,
        status: status || 'active',
        createTime: Date.now(),
        updateTime: Date.now()
      });
      
      await newDepartment.save();
      logger.info(`创建科室成功：${name}，编码：${code}`);
      
      res.status(201).json({
        success: true,
        message: '科室创建成功',
        data: newDepartment
      });
    } catch (error) {
      logger.error(`创建科室异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '科室创建失败，请稍后重试'
      });
    }
  },

  /**
   * 更新科室信息
   */
  async updateDepartment(req, res) {
    try {
      const departmentId = req.params.id;
      const {
        code,
        name,
        description,
        parentId,
        contactPerson,
        contactPhone,
        contactEmail,
        location,
        isSpecial,
        status
      } = req.body;
      
      if (!departmentId) {
        return res.status(400).json({
          success: false,
          message: '科室ID不能为空'
        });
      }
      
      // 查找科室
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: '科室不存在'
        });
      }
      
      // 检查科室编码是否已被其他科室使用
      if (code && code !== department.code) {
        const existingCode = await Department.findOne({ code, _id: { $ne: departmentId } });
        if (existingCode) {
          return res.status(400).json({
            success: false,
            message: '科室编码已被其他科室使用'
          });
        }
      }
      
      // 检查科室名称是否已被其他科室使用
      if (name && name !== department.name) {
        const existingName = await Department.findOne({ name, _id: { $ne: departmentId } });
        if (existingName) {
          return res.status(400).json({
            success: false,
            message: '科室名称已被其他科室使用'
          });
        }
      }
      
      // 如果更新父科室，检查父科室是否存在，并且不能设置为自身或其子科室
      if (parentId !== undefined && parentId !== department.parentId) {
        // 不能设置为自身
        if (parentId === departmentId) {
          return res.status(400).json({
            success: false,
            message: '科室不能设置自身为父科室'
          });
        }
        
        // 不能设置为其子科室
        const isSubDepartment = await Department.isSubDepartment(parentId, departmentId);
        if (isSubDepartment) {
          return res.status(400).json({
            success: false,
            message: '不能设置子科室为父科室'
          });
        }
        
        // 检查父科室是否存在
        if (parentId && parentId !== 'null') {
          const parentDepartment = await Department.findById(parentId);
          if (!parentDepartment) {
            return res.status(400).json({
              success: false,
              message: '指定的父科室不存在'
            });
          }
        }
      }
      
      // 更新科室信息
      if (code !== undefined) department.code = code;
      if (name !== undefined) department.name = name;
      if (description !== undefined) department.description = description;
      if (parentId !== undefined) department.parentId = parentId === 'null' ? null : parentId;
      if (contactPerson !== undefined) department.contactPerson = contactPerson;
      if (contactPhone !== undefined) department.contactPhone = contactPhone;
      if (contactEmail !== undefined) department.contactEmail = contactEmail;
      if (location !== undefined) department.location = location;
      if (isSpecial !== undefined) department.isSpecial = isSpecial;
      if (status !== undefined) department.status = status;
      
      department.updateTime = Date.now();
      await department.save();
      logger.info(`更新科室信息成功：${department.name}，编码：${department.code}`);
      
      res.json({
        success: true,
        message: '科室信息更新成功',
        data: department
      });
    } catch (error) {
      logger.error(`更新科室信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '科室信息更新失败，请稍后重试'
      });
    }
  },

  /**
   * 删除科室
   */
  async deleteDepartment(req, res) {
    try {
      const departmentId = req.params.id;
      
      if (!departmentId) {
        return res.status(400).json({
          success: false,
          message: '科室ID不能为空'
        });
      }
      
      // 查找科室
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: '科室不存在'
        });
      }
      
      // 检查是否有子科室
      const hasSubDepartments = await Department.countDocuments({ parentId: departmentId }) > 0;
      if (hasSubDepartments) {
        return res.status(400).json({
          success: false,
          message: '该科室下存在子科室，无法删除'
        });
      }
      
      // 检查是否有医生属于该科室
      const hasDoctors = await User.countDocuments({ department: departmentId, status: 'active' }) > 0;
      if (hasDoctors) {
        return res.status(400).json({
          success: false,
          message: '该科室下存在医生，无法删除'
        });
      }
      
      // 软删除
      department.status = 'inactive';
      department.updateTime = Date.now();
      await department.save();
      
      logger.info(`删除科室成功：${department.name}，编码：${department.code}`);
      
      res.json({
        success: true,
        message: '科室删除成功'
      });
    } catch (error) {
      logger.error(`删除科室异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '科室删除失败，请稍后重试'
      });
    }
  },

  /**
   * 获取科室树结构
   */
  async getDepartmentTree(req, res) {
    try {
      // 获取所有科室
      const departments = await Department.find({ status: 'active' });
      
      // 构建树结构
      const departmentMap = {};
      const tree = [];
      
      // 先创建所有节点的映射
      departments.forEach(dept => {
        departmentMap[dept._id.toString()] = {
          ...dept.toObject(),
          children: []
        };
      });
      
      // 构建树结构
      departments.forEach(dept => {
        const deptObj = departmentMap[dept._id.toString()];
        
        if (!dept.parentId) {
          // 顶级科室
          tree.push(deptObj);
        } else if (departmentMap[dept.parentId.toString()]) {
          // 添加到父科室的子节点中
          departmentMap[dept.parentId.toString()].children.push(deptObj);
        }
      });
      
      res.json({
        success: true,
        message: '获取科室树结构成功',
        data: tree
      });
    } catch (error) {
      logger.error(`获取科室树结构异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取科室树结构失败，请稍后重试'
      });
    }
  },

  /**
   * 获取科室下的医生列表
   */
  async getDepartmentDoctors(req, res) {
    try {
      const departmentId = req.params.id;
      
      // 分页参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      if (!departmentId) {
        return res.status(400).json({
          success: false,
          message: '科室ID不能为空'
        });
      }
      
      // 检查科室是否存在
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: '科室不存在'
        });
      }
      
      // 查询科室下的医生
      const doctors = await User.find({ department: departmentId, status: 'active' })
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createTime: -1 });
      
      // 获取总数
      const total = await User.countDocuments({ department: departmentId, status: 'active' });
      
      res.json({
        success: true,
        message: '获取科室医生列表成功',
        data: {
          doctors,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`获取科室医生列表异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取科室医生列表失败，请稍后重试'
      });
    }
  },

  /**
   * 获取科室统计信息
   */
  async getDepartmentStatistics(req, res) {
    try {
      // 获取活跃科室总数
      const totalDepartments = await Department.countDocuments({ status: 'active' });
      
      // 顶级科室数量
      const topLevelCount = await Department.countDocuments({ status: 'active', parentId: null });
      
      // 特殊科室数量
      const specialCount = await Department.countDocuments({ status: 'active', isSpecial: true });
      
      // 科室医生统计
      const departments = await Department.find({ status: 'active' });
      const departmentStats = [];
      
      for (const department of departments) {
        const doctorCount = await User.countDocuments({ 
          department: department._id, 
          status: 'active' 
        });
        
        departmentStats.push({
          departmentId: department._id,
          departmentName: department.name,
          departmentCode: department.code,
          doctorCount,
          isTopLevel: !department.parentId,
          isSpecial: department.isSpecial
        });
      }
      
      res.json({
        success: true,
        message: '获取科室统计信息成功',
        data: {
          totalDepartments,
          topLevelCount,
          specialCount,
          departmentStats
        }
      });
    } catch (error) {
      logger.error(`获取科室统计信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取科室统计信息失败，请稍后重试'
      });
    }
  }
};

module.exports = departmentController;