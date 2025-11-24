const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 科室模型定义
 * 存储医院科室信息和层级结构
 */
const DepartmentSchema = new Schema({
  departmentCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  departmentName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  parentDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createTime: {
    type: Date,
    default: Date.now,
  },
  updateTime: {
    type: Date,
    default: Date.now,
  },
  // 科室人员可以通过User模型的department字段引用查询
  // doctors: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  contactInfo: {
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    floor: {
      type: String,
      trim: true,
    },
  },
  // 科室特性标记
  isSpecialist: {
    type: Boolean,
    default: false,
  },
  isEmergency: {
    type: Boolean,
    default: false,
  },
  isOutpatient: {
    type: Boolean,
    default: true,
  },
  isInpatient: {
    type: Boolean,
    default: false,
  },
});

// 设置索引
DepartmentSchema.index({ departmentCode: 1 }, { unique: true });
DepartmentSchema.index({ departmentName: 1 }, { unique: true });
DepartmentSchema.index({ parentDepartment: 1 });
DepartmentSchema.index({ status: 1 });

// 中间件：更新updateTime字段
DepartmentSchema.pre('save', function (next) {
  this.updateTime = Date.now();
  next();
});

DepartmentSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updateTime: Date.now() });
  next();
});

// 虚拟属性：获取子科室数量（需要额外查询）
DepartmentSchema.virtual('childrenCount', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'parentDepartment',
  count: true,
});

// 虚拟属性：获取科室医生数量（需要额外查询）
DepartmentSchema.virtual('doctorsCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { role: 'doctor', status: 'active' },
});

// 静态方法：根据科室编码查找科室
DepartmentSchema.statics.findByCode = async function (departmentCode) {
  return this.findOne({ departmentCode });
};

// 静态方法：根据科室名称查找科室
DepartmentSchema.statics.findByName = async function (departmentName) {
  return this.findOne({ departmentName });
};

// 静态方法：获取所有顶级科室（无父科室）
DepartmentSchema.statics.getTopLevelDepartments = async function (options = {}) {
  const query = { parentDepartment: null };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .sort({ departmentCode: 1 })
    .populate('childrenCount')
    .populate('doctorsCount');
};

// 静态方法：获取指定科室的子科室
DepartmentSchema.statics.getSubDepartments = async function (parentId, options = {}) {
  const query = { parentDepartment: parentId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .sort({ departmentCode: 1 })
    .populate('childrenCount')
    .populate('doctorsCount');
};

// 静态方法：获取科室树结构
DepartmentSchema.statics.getDepartmentTree = async function (options = {}) {
  const departments = await this.find(options.status ? { status: options.status } : {});
  
  const departmentMap = {};
  const rootDepartments = [];
  
  // 首先创建所有科室的映射
  departments.forEach(dept => {
    departmentMap[dept._id.toString()] = {
      ...dept.toObject(),
      children: [],
    };
  });
  
  // 构建树结构
  departments.forEach(dept => {
    const deptObj = departmentMap[dept._id.toString()];
    
    if (!dept.parentDepartment) {
      // 顶级科室
      rootDepartments.push(deptObj);
    } else {
      // 子科室
      const parentId = dept.parentDepartment.toString();
      if (departmentMap[parentId]) {
        departmentMap[parentId].children.push(deptObj);
      }
    }
  });
  
  return rootDepartments;
};

// 静态方法：获取科室统计信息
DepartmentSchema.statics.getStatistics = async function () {
  return {
    total: await this.countDocuments(),
    active: await this.countDocuments({ status: 'active' }),
    inactive: await this.countDocuments({ status: 'inactive' }),
    topLevel: await this.countDocuments({ parentDepartment: null }),
    specialist: await this.countDocuments({ isSpecialist: true }),
    emergency: await this.countDocuments({ isEmergency: true }),
    outpatient: await this.countDocuments({ isOutpatient: true }),
    inpatient: await this.countDocuments({ isInpatient: true }),
  };
};

module.exports = mongoose.model('Department', DepartmentSchema);