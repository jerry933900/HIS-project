const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 检查项目模型定义
 * 管理医院提供的各类检查项目信息
 */
const ExamItemSchema = new Schema({
  // 检查项目基本信息
  examCode: {
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
  alias: [
    {
      type: String,
      trim: true,
    },
  ],
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  
  // 检查项目分类
  category: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  subCategory: {
    type: String,
    trim: true,
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    index: true,
  },
  
  // 检查项目价格和医保信息
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  pricingUnit: {
    type: String,
    required: true,
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
  
  // 检查项目注意事项
  preparation: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  contraindications: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  procedureTime: {
    type: String,
    trim: true,
  },
  resultTime: {
    type: String,
    trim: true,
  },
  
  // 检查项目技术信息
  equipmentRequired: [
    {
      type: String,
      trim: true,
    },
  ],
  technicalParameters: {
    type: String,
    trim: true,
  },
  
  // 检查项目结果模板
  resultTemplate: {
    type: String,
    trim: true,
  },
  
  // 检查项目状态
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true,
  },
  
  // 检查项目审计信息
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
  
  // 检查项目图片
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
  
  // 检查项目相关医生列表
  relatedDoctors: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

// 设置索引
ExamItemSchema.index({ examCode: 1 }, { unique: true });
ExamItemSchema.index({ name: 'text', alias: 'text' });
ExamItemSchema.index({ category: 1 });
ExamItemSchema.index({ departmentId: 1 });
ExamItemSchema.index({ status: 1 });

// 中间件：更新updateTime字段
ExamItemSchema.pre('save', function (next) {
  this.updateTime = Date.now();
  next();
});

ExamItemSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updateTime: Date.now() });
  next();
});

// 虚拟属性：获取部门信息
ExamItemSchema.virtual('departmentInfo', {
  ref: 'Department',
  localField: 'departmentId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name code' },
});

// 虚拟属性：获取相关医生信息
ExamItemSchema.virtual('doctors', {
  ref: 'User',
  localField: 'relatedDoctors',
  foreignField: '_id',
  options: { select: 'fullName position' },
});

// 实例方法：获取检查项目是否可用
ExamItemSchema.methods.isAvailable = function () {
  return this.status === 'active';
};

// 静态方法：根据检查项目编码查找
ExamItemSchema.statics.findByCode = async function (code) {
  return this.findOne({ examCode: code });
};

// 静态方法：搜索检查项目
ExamItemSchema.statics.search = async function (keyword, options = {}) {
  const query = {};
  
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { alias: { $elemMatch: { $regex: keyword, $options: 'i' } } },
      { examCode: { $regex: keyword, $options: 'i' } },
    ];
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.subCategory) {
    query.subCategory = options.subCategory;
  }
  
  if (options.departmentId) {
    query.departmentId = options.departmentId;
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  const limit = options.limit || 50;
  const page = options.page || 1;
  const skip = (page - 1) * limit;
  
  const total = await this.countDocuments(query);
  const examItems = await this.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ updateTime: -1 })
    .populate('departmentInfo');
  
  return {
    examItems,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

// 静态方法：获取部门的检查项目
ExamItemSchema.statics.findByDepartmentId = async function (departmentId, options = {}) {
  const query = { departmentId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  return this.find(query)
    .sort({ name: 1 })
    .populate('departmentInfo');
};

// 静态方法：获取检查项目统计信息
ExamItemSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        byCategory: {
          $push: {
            category: '$category',
            count: 1
          }
        },
        byStatus: {
          $push: {
            status: '$status',
            count: 1
          }
        },
        insuredCount: { $sum: { $cond: ['$isInsured', 1, 0] } },
      }
    }
  ]);
  
  // 进一步统计按分类和状态的分布
  if (stats.length > 0 && stats[0].byCategory) {
    const categoryStats = {};
    const statusStats = {};
    
    stats[0].byCategory.forEach(item => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + item.count;
    });
    
    stats[0].byStatus.forEach(item => {
      statusStats[item.status] = (statusStats[item.status] || 0) + item.count;
    });
    
    stats[0].byCategory = categoryStats;
    stats[0].byStatus = statusStats;
  }
  
  return stats[0] || {
    totalCount: 0,
    byCategory: {},
    byStatus: {},
    insuredCount: 0,
  };
};

module.exports = mongoose.model('ExamItem', ExamItemSchema);