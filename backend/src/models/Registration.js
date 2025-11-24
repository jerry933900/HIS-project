const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 挂号记录模型定义
 * 存储患者挂号信息和就诊安排
 */
const RegistrationSchema = new Schema({
  registrationNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true,
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  visitType: {
    type: String,
    enum: ['regular', 'specialist', 'emergency', 'followup'],
    default: 'regular',
  },
  registrationDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
  visitDate: {
    type: Date,
    required: true,
    index: true,
  },
  visitTimeSlot: {
    type: String,
    required: true,
    trim: true,
  },
  queueNumber: {
    type: Number,
    default: 0,
  },
  fee: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded', 'partially_refunded'],
    default: 'unpaid',
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'no_show'],
    default: 'pending',
    index: true,
  },
  diagnosisStatus: {
    type: String,
    enum: ['undiagnosed', 'diagnosed'],
    default: 'undiagnosed',
  },
  createTime: {
    type: Date,
    default: Date.now,
  },
  updateTime: {
    type: Date,
    default: Date.now,
  },
  paymentInfo: {
    paymentMethod: {
      type: String,
      enum: ['cash', 'creditCard', 'wechat', 'alipay', 'insurance'],
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentTime: {
      type: Date,
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  remark: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  // 关联的病历记录ID（如果已生成）
  medicalRecordId: {
    type: Schema.Types.ObjectId,
    ref: 'MedicalRecord',
  },
  // 关联的收费记录ID
  chargeId: {
    type: Schema.Types.ObjectId,
    ref: 'Charge',
  },
});

// 设置索引
RegistrationSchema.index({ registrationNo: 1 }, { unique: true });
RegistrationSchema.index({ patientId: 1, visitDate: -1 });
RegistrationSchema.index({ doctorId: 1, visitDate: 1 });
RegistrationSchema.index({ departmentId: 1, visitDate: 1 });
RegistrationSchema.index({ status: 1 });
RegistrationSchema.index({ paymentStatus: 1 });
RegistrationSchema.index({ visitDate: 1, visitTimeSlot: 1 });

// 中间件：更新updateTime字段
RegistrationSchema.pre('save', function (next) {
  this.updateTime = Date.now();
  next();
});

RegistrationSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updateTime: Date.now() });
  next();
});

// 虚拟属性：获取患者信息摘要
RegistrationSchema.virtual('patientInfo', {
  ref: 'Patient',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'fullName patientId gender age phone' },
});

// 虚拟属性：获取医生信息摘要
RegistrationSchema.virtual('doctorInfo', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'fullName position' },
});

// 虚拟属性：获取科室信息摘要
RegistrationSchema.virtual('departmentInfo', {
  ref: 'Department',
  localField: 'departmentId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'departmentName departmentCode' },
});

// 实例方法：生成挂号单号
RegistrationSchema.methods.generateRegistrationNo = function () {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  // 实际应用中应该基于数据库中的最大编号生成
  // 这里简化处理，实际项目中需要更复杂的逻辑
  return `REG${year}${month}${day}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
};

// 静态方法：根据挂号单号查找挂号记录
RegistrationSchema.statics.findByRegistrationNo = async function (registrationNo) {
  return this.findOne({ registrationNo })
    .populate('patientInfo')
    .populate('doctorInfo')
    .populate('departmentInfo');
};

// 静态方法：获取患者的挂号记录列表
RegistrationSchema.statics.findByPatientId = async function (patientId, options = {}) {
  const query = { patientId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.startDate && options.endDate) {
    query.visitDate = { $gte: options.startDate, $lte: options.endDate };
  }
  
  return this.find(query)
    .sort({ visitDate: -1, registrationDate: -1 })
    .populate('doctorInfo')
    .populate('departmentInfo')
    .limit(options.limit || 50);
};

// 静态方法：获取医生某日的挂号列表
RegistrationSchema.statics.findByDoctorAndDate = async function (doctorId, visitDate) {
  const startOfDay = new Date(visitDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(visitDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    doctorId,
    visitDate: { $gte: startOfDay, $lte: endOfDay },
  })
    .sort({ visitTimeSlot: 1, queueNumber: 1 })
    .populate('patientInfo');
};

// 静态方法：获取科室某日的挂号统计
RegistrationSchema.statics.getDepartmentStatisticsByDate = async function (departmentId, visitDate) {
  const startOfDay = new Date(visitDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(visitDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const registrations = await this.find({
    departmentId,
    visitDate: { $gte: startOfDay, $lte: endOfDay },
  });
  
  const stats = {
    total: registrations.length,
    pending: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    unpaid: 0,
    paid: 0,
    totalFee: 0,
    collectedFee: 0,
  };
  
  registrations.forEach(reg => {
    stats[reg.status]++;
    stats[reg.paymentStatus]++;
    stats.totalFee += reg.fee;
    if (reg.paymentStatus === 'paid') {
      stats.collectedFee += reg.fee;
    }
  });
  
  return stats;
};

// 静态方法：获取挂号统计信息
RegistrationSchema.statics.getStatistics = async function (options = {}) {
  const query = {};
  
  if (options.departmentId) {
    query.departmentId = options.departmentId;
  }
  
  if (options.startDate && options.endDate) {
    query.visitDate = { $gte: options.startDate, $lte: options.endDate };
  }
  
  const registrations = await this.find(query);
  
  const stats = {
    total: registrations.length,
    byType: {},
    byStatus: {},
    byPaymentStatus: {},
    totalFee: 0,
    collectedFee: 0,
  };
  
  registrations.forEach(reg => {
    // 按类型统计
    stats.byType[reg.visitType] = (stats.byType[reg.visitType] || 0) + 1;
    // 按状态统计
    stats.byStatus[reg.status] = (stats.byStatus[reg.status] || 0) + 1;
    // 按支付状态统计
    stats.byPaymentStatus[reg.paymentStatus] = (stats.byPaymentStatus[reg.paymentStatus] || 0) + 1;
    // 费用统计
    stats.totalFee += reg.fee;
    if (reg.paymentStatus === 'paid') {
      stats.collectedFee += reg.fee;
    }
  });
  
  return stats;
};

module.exports = mongoose.model('Registration', RegistrationSchema);