const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 药品模型定义
 * 管理医院的药品信息
 */
const MedicineSchema = new Schema({
  // 药品基本信息
  medicineCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  genericName: {
    type: String,
    trim: true,
  },
  alias: [
    {
      type: String,
      trim: true,
    },
  ],
  
  // 药品规格信息
  specification: {
    type: String,
    required: true,
    trim: true,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
  },
  batchNumber: {
    type: String,
    trim: true,
  },
  expiryDate: {
    type: Date,
  },
  
  // 药品分类信息
  medicineType: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  category: {
    type: String,
    trim: true,
    index: true,
  },
  drugType: {
    type: String,
    enum: ['OTC', 'RX', 'Special', 'Controlled'],
    default: 'OTC',
    index: true,
  },
  
  // 药品库存信息
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  minStockQuantity: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
  },
  warehouseLocation: {
    type: String,
    trim: true,
  },
  
  // 药品价格信息
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  retailPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  pricingUnit: {
    type: String,
    required: true,
    trim: true,
  },
  
  // 药品用法信息
  usage: {
    type: String,
    trim: true,
  },
  dosageForm: {
    type: String,
    trim: true,
  },
  routeOfAdministration: {
    type: String,
    trim: true,
  },
  frequency: {
    type: String,
    trim: true,
  },
  
  // 药品说明书相关
  indications: {
    type: String,
    trim: true,
  },
  contraindications: {
    type: String,
    trim: true,
  },
  sideEffects: {
    type: String,
    trim: true,
  },
  warnings: {
    type: String,
    trim: true,
  },
  storageConditions: {
    type: String,
    trim: true,
  },
  
  // 药品状态和管理信息
  status: {
    type: String,
    enum: ['active', 'inactive', 'lowStock', 'outOfStock'],
    default: 'active',
    index: true,
  },
  approvalNumber: {
    type: String,
    trim: true,
  },
  isInsured: {
    type: Boolean,
    default: false,
  },
  reimbursementRatio: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  // 审计信息
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createTime: {
    type: Date,
    default: Date.now,
  },
  updateTime: {
    type: Date,
    default: Date.now,
  },
  
  // 药品图片
  images: [
    {
      url: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
    },
  ],
  
  // 药品供应商
  supplier: {
    type: String,
    trim: true,
  },
  supplierContact: {
    type: String,
    trim: true,
  },
});

// 设置索引
MedicineSchema.index({ medicineCode: 1 }, { unique: true });
MedicineSchema.index({ name: 'text', genericName: 'text' });
MedicineSchema.index({ status: 1 });
MedicineSchema.index({ category: 1 });
MedicineSchema.index({ stockQuantity: 1 });

// 中间件：更新updateTime字段
MedicineSchema.pre('save', function (next) {
  this.updateTime = Date.now();
  next();
});

MedicineSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updateTime: Date.now() });
  next();
});

// 中间件：更新药品状态
MedicineSchema.pre('save', function (next) {
  if (this.stockQuantity <= 0) {
    this.status = 'outOfStock';
  } else if (this.stockQuantity <= this.minStockQuantity) {
    this.status = 'lowStock';
  }
  next();
});

MedicineSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.stockQuantity !== undefined) {
    if (update.stockQuantity <= 0) {
      update.status = 'outOfStock';
    } else if (update.stockQuantity <= (update.minStockQuantity || this.get('minStockQuantity'))) {
      update.status = 'lowStock';
    }
  }
  next();
});

// 实例方法：更新库存
MedicineSchema.methods.updateStock = async function (quantity, type = 'add') {
  if (type === 'add') {
    this.stockQuantity += quantity;
  } else if (type === 'reduce') {
    if (this.stockQuantity < quantity) {
      throw new Error('库存不足');
    }
    this.stockQuantity -= quantity;
  }
  
  // 更新状态
  if (this.stockQuantity <= 0) {
    this.status = 'outOfStock';
  } else if (this.stockQuantity <= this.minStockQuantity) {
    this.status = 'lowStock';
  } else {
    this.status = 'active';
  }
  
  return this.save();
};

// 实例方法：获取药品是否可处方
MedicineSchema.methods.isPrescribable = function () {
  return this.status === 'active' && this.stockQuantity > 0;
};

// 静态方法：根据药品编码查找
MedicineSchema.statics.findByCode = async function (code) {
  return this.findOne({ medicineCode: code });
};

// 静态方法：搜索药品
MedicineSchema.statics.search = async function (keyword, options = {}) {
  const query = {};
  
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { genericName: { $regex: keyword, $options: 'i' } },
      { medicineCode: { $regex: keyword, $options: 'i' } },
    ];
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.type) {
    query.medicineType = options.type;
  }
  
  if (options.drugType) {
    query.drugType = options.drugType;
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  const limit = options.limit || 50;
  const page = options.page || 1;
  const skip = (page - 1) * limit;
  
  const total = await this.countDocuments(query);
  const medicines = await this.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ updateTime: -1 });
  
  return {
    medicines,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

// 静态方法：获取库存警报药品
MedicineSchema.statics.getStockAlerts = async function () {
  return this.find({
    $or: [
      { stockQuantity: { $lte: '$minStockQuantity' } },
      { stockQuantity: 0 }
    ]
  }).sort({ stockQuantity: 1 });
};

// 静态方法：获取药品统计信息
MedicineSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        totalStockValue: { $sum: { $multiply: ['$stockQuantity', '$retailPrice'] } },
        outOfStockCount: { $sum: { $cond: [{ $eq: ['$status', 'outOfStock'] }, 1, 0] } },
        lowStockCount: { $sum: { $cond: [{ $eq: ['$status', 'lowStock'] }, 1, 0] } },
        byCategory: {
          $push: {
            category: '$category',
            count: 1
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalCount: 0,
    totalStockValue: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    byCategory: []
  };
};

module.exports = mongoose.model('Medicine', MedicineSchema);