const Medicine = require('../models/Medicine');
const logger = require('../config/logger');

/**
 * 药品管理控制器
 * 处理药品信息的CRUD操作和药品相关功能
 */
const medicineController = {
  /**
   * 获取药品列表
   */
  async getMedicines(req, res) {
    try {
      // 分页参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // 构建查询条件
      const query = {};
      
      // 搜索条件 - 按名称、编码或规格搜索
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
          { name: searchRegex },
          { code: searchRegex },
          { specification: searchRegex }
        ];
      }
      
      // 药品类型过滤
      if (req.query.type) {
        query.type = req.query.type;
      }
      
      // 药品状态过滤
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // 库存过滤
      if (req.query.stockMin !== undefined) {
        query.stock = { $gte: parseInt(req.query.stockMin) };
      }
      if (req.query.stockMax !== undefined) {
        query.stock = query.stock || {};
        query.stock.$lte = parseInt(req.query.stockMax);
      }
      
      // 价格过滤
      if (req.query.priceMin !== undefined) {
        query.price = { $gte: parseFloat(req.query.priceMin) };
      }
      if (req.query.priceMax !== undefined) {
        query.price = query.price || {};
        query.price.$lte = parseFloat(req.query.priceMax);
      }
      
      // 是否处方药过滤
      if (req.query.isPrescription !== undefined) {
        query.isPrescription = req.query.isPrescription === 'true';
      }
      
      // 排序
      const sortField = req.query.sortBy || 'code';
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      const sortOptions = { [sortField]: sortOrder };
      
      // 查询药品列表
      const medicines = await Medicine.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions);
      
      // 获取总数
      const total = await Medicine.countDocuments(query);
      
      res.json({
        success: true,
        message: '获取药品列表成功',
        data: {
          medicines,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`获取药品列表异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取药品列表失败，请稍后重试'
      });
    }
  },

  /**
   * 获取药品详情
   */
  async getMedicineById(req, res) {
    try {
      const medicineId = req.params.id;
      
      if (!medicineId) {
        return res.status(400).json({
          success: false,
          message: '药品ID不能为空'
        });
      }
      
      // 查询药品信息
      const medicine = await Medicine.findById(medicineId);
      
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: '药品不存在'
        });
      }
      
      // 检查是否低于库存预警
      const isLowStock = medicine.stock <= medicine.stockAlertThreshold;
      
      res.json({
        success: true,
        message: '获取药品详情成功',
        data: {
          ...medicine.toObject(),
          isLowStock
        }
      });
    } catch (error) {
      logger.error(`获取药品详情异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取药品详情失败，请稍后重试'
      });
    }
  },

  /**
   * 创建新药品
   */
  async createMedicine(req, res) {
    try {
      const {
        code,
        name,
        specification,
        type,
        manufacturer,
        dosageForm,
        unit,
        usage,
        price,
        stock,
        stockAlertThreshold,
        isPrescription,
        description,
        status
      } = req.body;
      
      // 验证必填字段
      const requiredFields = ['code', 'name', 'specification', 'price', 'unit'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `缺少必填字段: ${missingFields.join(', ')}`
        });
      }
      
      // 检查药品编码是否已存在
      const existingCode = await Medicine.findOne({ code });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: '药品编码已存在'
        });
      }
      
      // 检查药品名称+规格组合是否已存在
      const existingMedicine = await Medicine.findOne({ name, specification });
      if (existingMedicine) {
        return res.status(400).json({
          success: false,
          message: '该药品名称和规格的组合已存在'
        });
      }
      
      // 创建新药品
      const newMedicine = new Medicine({
        code,
        name,
        specification,
        type: type || 'general',
        manufacturer,
        dosageForm,
        unit,
        usage,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        stockAlertThreshold: parseInt(stockAlertThreshold) || 10,
        isPrescription: isPrescription || false,
        description,
        status: status || 'active',
        createTime: Date.now(),
        updateTime: Date.now()
      });
      
      await newMedicine.save();
      logger.info(`创建药品成功：${name}，编码：${code}`);
      
      res.status(201).json({
        success: true,
        message: '药品创建成功',
        data: newMedicine
      });
    } catch (error) {
      logger.error(`创建药品异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '药品创建失败，请稍后重试'
      });
    }
  },

  /**
   * 更新药品信息
   */
  async updateMedicine(req, res) {
    try {
      const medicineId = req.params.id;
      const {
        code,
        name,
        specification,
        type,
        manufacturer,
        dosageForm,
        unit,
        usage,
        price,
        stockAlertThreshold,
        isPrescription,
        description,
        status
      } = req.body;
      
      if (!medicineId) {
        return res.status(400).json({
          success: false,
          message: '药品ID不能为空'
        });
      }
      
      // 查找药品
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: '药品不存在'
        });
      }
      
      // 检查药品编码是否已被其他药品使用
      if (code && code !== medicine.code) {
        const existingCode = await Medicine.findOne({ code, _id: { $ne: medicineId } });
        if (existingCode) {
          return res.status(400).json({
            success: false,
            message: '药品编码已被其他药品使用'
          });
        }
      }
      
      // 检查药品名称+规格组合是否已被其他药品使用
      if ((name && name !== medicine.name) || (specification && specification !== medicine.specification)) {
        const existingMedicine = await Medicine.findOne({
          name: name || medicine.name,
          specification: specification || medicine.specification,
          _id: { $ne: medicineId }
        });
        if (existingMedicine) {
          return res.status(400).json({
            success: false,
            message: '该药品名称和规格的组合已被其他药品使用'
          });
        }
      }
      
      // 更新药品信息
      if (code !== undefined) medicine.code = code;
      if (name !== undefined) medicine.name = name;
      if (specification !== undefined) medicine.specification = specification;
      if (type !== undefined) medicine.type = type;
      if (manufacturer !== undefined) medicine.manufacturer = manufacturer;
      if (dosageForm !== undefined) medicine.dosageForm = dosageForm;
      if (unit !== undefined) medicine.unit = unit;
      if (usage !== undefined) medicine.usage = usage;
      if (price !== undefined) medicine.price = parseFloat(price);
      if (stockAlertThreshold !== undefined) medicine.stockAlertThreshold = parseInt(stockAlertThreshold);
      if (isPrescription !== undefined) medicine.isPrescription = isPrescription;
      if (description !== undefined) medicine.description = description;
      if (status !== undefined) medicine.status = status;
      
      medicine.updateTime = Date.now();
      await medicine.save();
      logger.info(`更新药品信息成功：${medicine.name}，编码：${medicine.code}`);
      
      res.json({
        success: true,
        message: '药品信息更新成功',
        data: medicine
      });
    } catch (error) {
      logger.error(`更新药品信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '药品信息更新失败，请稍后重试'
      });
    }
  },

  /**
   * 更新药品库存
   */
  async updateMedicineStock(req, res) {
    try {
      const medicineId = req.params.id;
      const { quantity, operation, reason } = req.body;
      const userId = req.user.id;
      
      if (!medicineId || quantity === undefined || !operation) {
        return res.status(400).json({
          success: false,
          message: '药品ID、数量和操作类型不能为空'
        });
      }
      
      // 验证操作类型
      if (!['increase', 'decrease'].includes(operation)) {
        return res.status(400).json({
          success: false,
          message: '操作类型必须为 increase 或 decrease'
        });
      }
      
      // 验证数量
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: '数量必须为正整数'
        });
      }
      
      // 查找药品
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: '药品不存在'
        });
      }
      
      // 更新库存
      let newStock;
      if (operation === 'increase') {
        newStock = medicine.stock + qty;
        // 记录库存变更
        medicine.stockHistory.push({
          date: Date.now(),
          type: 'in',
          quantity: qty,
          operator: userId,
          reason: reason || '库存增加',
          balance: newStock
        });
      } else { // decrease
        // 检查库存是否足够
        if (medicine.stock < qty) {
          return res.status(400).json({
            success: false,
            message: `库存不足，当前库存：${medicine.stock}`
          });
        }
        newStock = medicine.stock - qty;
        // 记录库存变更
        medicine.stockHistory.push({
          date: Date.now(),
          type: 'out',
          quantity: qty,
          operator: userId,
          reason: reason || '库存减少',
          balance: newStock
        });
      }
      
      medicine.stock = newStock;
      medicine.updateTime = Date.now();
      
      await medicine.save();
      logger.info(`${operation === 'increase' ? '增加' : '减少'}药品库存成功：${medicine.name}，数量：${qty}，当前库存：${newStock}`);
      
      res.json({
        success: true,
        message: `${operation === 'increase' ? '增加' : '减少'}药品库存成功`,
        data: {
          medicineId: medicine._id,
          name: medicine.name,
          code: medicine.code,
          operation,
          quantity: qty,
          previousStock: medicine.stock - (operation === 'increase' ? qty : -qty),
          currentStock: newStock,
          updateTime: medicine.updateTime
        }
      });
    } catch (error) {
      logger.error(`更新药品库存异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '更新药品库存失败，请稍后重试'
      });
    }
  },

  /**
   * 删除药品
   */
  async deleteMedicine(req, res) {
    try {
      const medicineId = req.params.id;
      
      if (!medicineId) {
        return res.status(400).json({
          success: false,
          message: '药品ID不能为空'
        });
      }
      
      // 查找药品
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: '药品不存在'
        });
      }
      
      // 检查库存
      if (medicine.stock > 0) {
        return res.status(400).json({
          success: false,
          message: `药品还有库存（${medicine.stock}），无法删除，请先清空库存`
        });
      }
      
      // 软删除
      medicine.status = 'inactive';
      medicine.updateTime = Date.now();
      await medicine.save();
      
      logger.info(`删除药品成功：${medicine.name}，编码：${medicine.code}`);
      
      res.json({
        success: true,
        message: '药品删除成功'
      });
    } catch (error) {
      logger.error(`删除药品异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '药品删除失败，请稍后重试'
      });
    }
  },

  /**
   * 获取库存预警列表
   */
  async getStockAlerts(req, res) {
    try {
      // 查找库存低于预警阈值的药品
      const lowStockMedicines = await Medicine.find({
        stock: { $lte: '$stockAlertThreshold' },
        status: 'active'
      }).sort({ stock: 1 });
      
      res.json({
        success: true,
        message: '获取库存预警列表成功',
        data: {
          totalAlerts: lowStockMedicines.length,
          medicines: lowStockMedicines
        }
      });
    } catch (error) {
      logger.error(`获取库存预警列表异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取库存预警列表失败，请稍后重试'
      });
    }
  },

  /**
   * 获取药品库存历史记录
   */
  async getMedicineStockHistory(req, res) {
    try {
      const medicineId = req.params.id;
      
      if (!medicineId) {
        return res.status(400).json({
          success: false,
          message: '药品ID不能为空'
        });
      }
      
      // 查找药品
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: '药品不存在'
        });
      }
      
      // 按时间降序排列，取最近100条记录
      const stockHistory = medicine.stockHistory
        .sort((a, b) => b.date - a.date)
        .slice(0, 100);
      
      res.json({
        success: true,
        message: '获取药品库存历史成功',
        data: {
          medicine: {
            id: medicine._id,
            name: medicine.name,
            code: medicine.code,
            currentStock: medicine.stock
          },
          history: stockHistory
        }
      });
    } catch (error) {
      logger.error(`获取药品库存历史异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取药品库存历史失败，请稍后重试'
      });
    }
  },

  /**
   * 获取药品统计信息
   */
  async getMedicineStatistics(req, res) {
    try {
      // 统计总数
      const totalMedicines = await Medicine.countDocuments({ status: 'active' });
      
      // 按类型统计
      const typeStats = await Medicine.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);
      
      // 按是否处方药统计
      const prescriptionStats = await Medicine.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$isPrescription', count: { $sum: 1 } } }
      ]);
      
      // 统计库存总值
      const totalStockValue = await Medicine.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$stock', '$price'] } } } }
      ]);
      
      // 统计低库存药品数量
      const lowStockCount = await Medicine.countDocuments({
        stock: { $lte: '$stockAlertThreshold' },
        status: 'active'
      });
      
      res.json({
        success: true,
        message: '获取药品统计信息成功',
        data: {
          totalMedicines,
          typeStats,
          prescriptionStats: prescriptionStats.reduce((acc, curr) => {
            acc[curr._id ? 'prescription' : 'nonPrescription'] = curr.count;
            return acc;
          }, {}),
          totalStockValue: totalStockValue[0]?.total || 0,
          lowStockCount
        }
      });
    } catch (error) {
      logger.error(`获取药品统计信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取药品统计信息失败，请稍后重试'
      });
    }
  }
};

module.exports = medicineController;