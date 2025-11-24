const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 患者模型定义
 * 存储患者基本信息和就诊相关数据
 */
const PatientSchema = new Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
    min: 0,
    max: 150,
  },
  idCard: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // 身份证号应该加密存储，这里简化处理
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^1[3-9]\d{9}$/,
    index: true,
  },
  address: {
    type: String,
    trim: true,
    maxlength: 255,
  },
  bloodType: {
    type: String,
    enum: ['A', 'B', 'AB', 'O', 'other', 'unknown'],
    default: 'unknown',
  },
  allergies: [
    {
      type: String,
      trim: true,
    },
  ],
  medicalHistory: {
    type: String,
    trim: true,
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    relationship: {
      type: String,
      trim: true,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      match: /^1[3-9]\d{9}$/,
    },
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  lastVisitDate: {
    type: Date,
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
  // 就诊记录可以通过引用查询，这里不直接存储以避免文档过大
  // visits: [{ type: Schema.Types.ObjectId, ref: 'Registration' }]
});

// 设置索引
PatientSchema.index({ patientId: 1 }, { unique: true });
PatientSchema.index({ fullName: 1 });
PatientSchema.index({ phone: 1 });
PatientSchema.index({ idCard: 1 }, { unique: true });
PatientSchema.index({ lastVisitDate: -1 });
PatientSchema.index({ registrationDate: -1 });

// 中间件：计算年龄
PatientSchema.pre('save', function (next) {
  if (this.birthDate) {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }
  this.updateTime = Date.now();
  next();
});

PatientSchema.pre('findOneAndUpdate', function (next) {
  // 如果更新了出生日期，需要重新计算年龄
  const update = this.getUpdate();
  if (update.birthDate) {
    const today = new Date();
    const birthDate = new Date(update.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    update.age = age;
  }
  this.set({ updateTime: Date.now() });
  next();
});

// 虚拟属性
PatientSchema.virtual('displayPatientId').get(function () {
  return this.patientId || this._id.toString();
});

// 实例方法：生成患者编号
PatientSchema.methods.generatePatientId = function () {
  const year = new Date().getFullYear();
  // 实际应用中应该基于数据库中的最大编号生成
  // 这里简化处理，实际项目中需要更复杂的逻辑
  return `PAT${year}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
};

// 静态方法：根据患者编号查找患者
PatientSchema.statics.findByPatientId = async function (patientId) {
  return this.findOne({ patientId });
};

// 静态方法：根据身份证号查找患者
PatientSchema.statics.findByIdCard = async function (idCard) {
  return this.findOne({ idCard });
};

// 静态方法：根据手机号查找患者
PatientSchema.statics.findByPhone = async function (phone) {
  return this.findOne({ phone });
};

// 静态方法：根据姓名模糊查询患者
PatientSchema.statics.findByName = async function (name, options = {}) {
  const query = {
    fullName: { $regex: name, $options: 'i' },
  };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .sort({ lastVisitDate: -1, createTime: -1 })
    .limit(options.limit || 50);
};

// 静态方法：获取患者统计信息
PatientSchema.statics.getStatistics = async function () {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  
  return {
    total: await this.countDocuments(),
    active: await this.countDocuments({ status: 'active' }),
    newToday: await this.countDocuments({ registrationDate: { $gte: today } }),
    newLastMonth: await this.countDocuments({ 
      registrationDate: { $gte: lastMonth, $lt: today } 
    }),
    byGender: await this.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]),
    byAgeGroup: await this.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 30, 50, 70, 150],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ])
  };
};

module.exports = mongoose.model('Patient', PatientSchema);