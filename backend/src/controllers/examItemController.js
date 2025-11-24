const ExamItem = require('../models/ExamItem');
const logger = require('../config/logger');

/**
 * 检查项目管理控制器
 * 处理检查项目信息的CRUD操作和检查项目相关功能
 */
const examItemController = {
  /**
   * 获取检查项目列表
   */
  async getExamItems(req, res) {
    try {
      // 分页参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // 构建查询条件
      const query = {};
      
      // 名称或代码搜索
      if (req.query.keyword) {
        const keyword = req.query.keyword;
        query.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { code: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ];
      }
      
      // 分类过滤
      if (req.query.category) {
        query.category = req.query.category;
      }
      
      // 子分类过滤
      if (req.query.subCategory) {
        query.subCategory = req.query.subCategory;
      }
      
      // 状态过滤
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // 医保类型过滤
      if (req.query.medicalInsuranceType) {
        query.medicalInsuranceType = req.query.medicalInsuranceType;
      }
      
      // 价格范围过滤
      if (req.query.minPrice && req.query.maxPrice) {
        query.price = {
          $gte: parseFloat(req.query.minPrice),
          $lte: parseFloat(req.query.maxPrice)
        };
      } else if (req.query.minPrice) {
        query.price = { $gte: parseFloat(req.query.minPrice) };
      } else if (req.query.maxPrice) {
        query.price = { $lte: parseFloat(req.query.maxPrice) };
      }
      
      // 排序
      const sortField = req.query.sortBy || 'createTime';
      const sortOrder = req.query.order === 'asc' ? 1 : -1;
      const sortOptions = { [sortField]: sortOrder };
      
      // 查询检查项目列表
      const examItems = await ExamItem.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions);
      
      // 获取总数
      const total = await ExamItem.countDocuments(query);
      
      res.json({
        success: true,
        message: '获取检查项目列表成功',
        data: {
          examItems,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`获取检查项目列表异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取检查项目列表失败，请稍后重试'
      });
    }
  },

  /**
   * 获取检查项目详情
   */
  async getExamItemById(req, res) {
    try {
      const examItemId = req.params.id;
      
      if (!examItemId) {
        return res.status(400).json({
          success: false,
          message: '检查项目ID不能为空'
        });
      }
      
      // 查询检查项目信息
      const examItem = await ExamItem.findById(examItemId);
      
      if (!examItem) {
        return res.status(404).json({
          success: false,
          message: '检查项目不存在'
        });
      }
      
      res.json({
        success: true,
        message: '获取检查项目详情成功',
        data: examItem
      });
    } catch (error) {
      logger.error(`获取检查项目详情异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取检查项目详情失败，请稍后重试'
      });
    }
  },

  /**
   * 创建检查项目
   */
  async createExamItem(req, res) {
    try {
      const {
        code,
        name,
        category,
        subCategory,
        price,
        medicalInsuranceRatio,
        medicalInsuranceType,
        preparation,
        duration,
        resultTime,
        department,
        equipment,
        referenceRange,
        description,
        unit
      } = req.body;
      const userId = req.user.id; // 从认证中间件获取当前用户
      
      // 验证必填字段
      const requiredFields = ['code', 'name', 'category', 'price'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `缺少必填字段: ${missingFields.join(', ')}`
        });
      }
      
      // 验证代码是否已存在
      const existingExamItem = await ExamItem.findOne({ code });
      if (existingExamItem) {
        return res.status(400).json({
          success: false,
          message: '检查项目代码已存在'
        });
      }
      
      // 创建检查项目
      const newExamItem = new ExamItem({
        code,
        name,
        category,
        subCategory,
        price,
        medicalInsuranceRatio: medicalInsuranceRatio || 0,
        medicalInsuranceType: medicalInsuranceType || 'self',
        preparation,
        duration,
        resultTime,
        department,
        equipment,
        referenceRange,
        description,
        unit,
        status: 'active',
        createdBy: userId,
        updatedBy: userId
      });
      
      // 保存检查项目
      await newExamItem.save();
      
      // 记录检查项目创建日志
      logger.info(`创建检查项目成功：${name} (${code})`);
      
      res.status(201).json({
        success: true,
        message: '检查项目创建成功',
        data: newExamItem
      });
    } catch (error) {
      logger.error(`创建检查项目异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '检查项目创建失败，请稍后重试'
      });
    }
  },

  /**
   * 更新检查项目
   */
  async updateExamItem(req, res) {
    try {
      const examItemId = req.params.id;
      const updateData = req.body;
      const userId = req.user.id;
      
      if (!examItemId) {
        return res.status(400).json({
          success: false,
          message: '检查项目ID不能为空'
        });
      }
      
      // 查找检查项目
      const examItem = await ExamItem.findById(examItemId);
      if (!examItem) {
        return res.status(404).json({
          success: false,
          message: '检查项目不存在'
        });
      }
      
      // 如果要修改代码，检查新代码是否已存在
      if (updateData.code && updateData.code !== examItem.code) {
        const existingExamItem = await ExamItem.findOne({ code: updateData.code });
        if (existingExamItem) {
          return res.status(400).json({
            success: false,
            message: '检查项目代码已存在'
          });
        }
      }
      
      // 更新数据
      Object.keys(updateData).forEach(key => {
        if (key !== '_id') {
          examItem[key] = updateData[key];
        }
      });
      
      // 更新元数据
      examItem.updatedBy = userId;
      examItem.updateTime = Date.now();
      
      // 保存更新后的检查项目
      await examItem.save();
      
      // 记录检查项目更新日志
      logger.info(`更新检查项目成功：${examItem.name} (${examItem.code})`);
      
      res.json({
        success: true,
        message: '检查项目更新成功',
        data: examItem
      });
    } catch (error) {
      logger.error(`更新检查项目异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '检查项目更新失败，请稍后重试'
      });
    }
  },

  /**
   * 删除检查项目
   */
  async deleteExamItem(req, res) {
    try {
      const examItemId = req.params.id;
      
      if (!examItemId) {
        return res.status(400).json({
          success: false,
          message: '检查项目ID不能为空'
        });
      }
      
      // 查找检查项目
      const examItem = await ExamItem.findById(examItemId);
      if (!examItem) {
        return res.status(404).json({
          success: false,
          message: '检查项目不存在'
        });
      }
      
      // 软删除：将状态设置为inactive而不是实际删除
      examItem.status = 'inactive';
      examItem.updatedBy = req.user.id;
      examItem.updateTime = Date.now();
      
      await examItem.save();
      
      // 记录检查项目删除日志
      logger.info(`删除检查项目成功：${examItem.name} (${examItem.code})`);
      
      res.json({
        success: true,
        message: '检查项目删除成功',
        data: examItem
      });
    } catch (error) {
      logger.error(`删除检查项目异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '检查项目删除失败，请稍后重试'
      });
    }
  },

  /**
   * 批量删除检查项目
   */
  async batchDeleteExamItems(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请选择要删除的检查项目'
        });
      }
      
      // 批量软删除：将状态设置为inactive
      const result = await ExamItem.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            status: 'inactive',
            updatedBy: req.user.id,
            updateTime: Date.now()
          }
        }
      );
      
      // 记录批量删除日志
      logger.info(`批量删除检查项目成功，共删除 ${result.modifiedCount} 项`);
      
      res.json({
        success: true,
        message: `成功删除 ${result.modifiedCount} 个检查项目`,
        data: { deletedCount: result.modifiedCount }
      });
    } catch (error) {
      logger.error(`批量删除检查项目异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '批量删除检查项目失败，请稍后重试'
      });
    }
  },

  /**
   * 更新检查项目状态
   */
  async updateExamItemStatus(req, res) {
    try {
      const examItemId = req.params.id;
      const { status } = req.body;
      
      if (!examItemId) {
        return res.status(400).json({
          success: false,
          message: '检查项目ID不能为空'
        });
      }
      
      if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: '无效的状态值，状态只能是active或inactive'
        });
      }
      
      // 查找并更新检查项目
      const examItem = await ExamItem.findByIdAndUpdate(
        examItemId,
        {
          $set: {
            status,
            updatedBy: req.user.id,
            updateTime: Date.now()
          }
        },
        { new: true }
      );
      
      if (!examItem) {
        return res.status(404).json({
          success: false,
          message: '检查项目不存在'
        });
      }
      
      // 记录状态更新日志
      logger.info(`更新检查项目状态成功：${examItem.name} (${examItem.code})，状态：${status}`);
      
      res.json({
        success: true,
        message: '检查项目状态更新成功',
        data: examItem
      });
    } catch (error) {
      logger.error(`更新检查项目状态异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '检查项目状态更新失败，请稍后重试'
      });
    }
  },

  /**
   * 获取检查项目分类列表
   */
  async getExamItemCategories(req, res) {
    try {
      // 获取所有唯一的分类
      const categories = await ExamItem.distinct('category');
      
      // 对于每个分类，获取其子分类
      const categoriesWithSubcategories = await Promise.all(
        categories.map(async (category) => {
          const subcategories = await ExamItem.distinct('subCategory', { category });
          return {
            category,
            subcategories: subcategories.filter(sc => sc) // 过滤空值
          };
        })
      );
      
      res.json({
        success: true,
        message: '获取检查项目分类列表成功',
        data: categoriesWithSubcategories
      });
    } catch (error) {
      logger.error(`获取检查项目分类列表异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取检查项目分类列表失败，请稍后重试'
      });
    }
  },

  /**
   * 搜索检查项目
   */
  async searchExamItems(req, res) {
    try {
      const { keyword } = req.query;
      
      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: '搜索关键词不能为空'
        });
      }
      
      // 构建搜索条件
      const query = {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { code: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { referenceRange: { $regex: keyword, $options: 'i' } }
        ],
        status: 'active' // 只搜索激活状态的检查项目
      };
      
      // 搜索检查项目
      const examItems = await ExamItem.find(query)
        .limit(50) // 限制返回结果数量
        .sort({ name: 1 });
      
      res.json({
        success: true,
        message: '搜索检查项目成功',
        data: {
          examItems,
          totalResults: examItems.length
        }
      });
    } catch (error) {
      logger.error(`搜索检查项目异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '搜索检查项目失败，请稍后重试'
      });
    }
  },

  /**
   * 获取检查项目统计信息
   */
  async getExamItemStatistics(req, res) {
    try {
      // 按分类统计
      const categoryStats = await ExamItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      
      // 按医保类型统计
      const insuranceTypeStats = await ExamItem.aggregate([
        { $group: { _id: '$medicalInsuranceType', count: { $sum: 1 } } }
      ]);
      
      // 按状态统计
      const statusStats = await ExamItem.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // 计算价格范围统计
      const priceStats = await ExamItem.aggregate([
        { $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' },
          avg: { $avg: '$price' }
        }}
      ]);
      
      // 获取总数量
      const totalCount = await ExamItem.countDocuments();
      
      res.json({
        success: true,
        message: '获取检查项目统计信息成功',
        data: {
          totalCount,
          categoryStats,
          insuranceTypeStats,
          statusStats,
          priceStats: priceStats[0] || { min: 0, max: 0, avg: 0 }
        }
      });
    } catch (error) {
      logger.error(`获取检查项目统计信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取检查项目统计信息失败，请稍后重试'
      });
    }
  }
};

module.exports = examItemController;