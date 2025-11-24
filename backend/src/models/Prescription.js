const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 处方模型定义
 * 管理医生为患者开具的处方信息
 */
const PrescriptionSchema = new Schema({
  // 处方基本信息
  prescriptionNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  registrationId: {
    type: Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
    index: true,
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },
  medicalRecordId: {
    type: Schema.Types.ObjectId,
    ref: 'MedicalRecord',
    index: true,
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // 处方日期信息
  issueDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  
  // 处方药品列表
  medicines: [
    {
      medicineId: {
        type: Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      specification: {
        type: String,
        trim: true,
      },
      unit: {
        type: String,
        trim: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      dosage: {
        type: String,
        required: true,
        trim: true,
      },
      frequency: {
        type: String,
        required: true,
        trim: true,
      },
      usage: {
        type: String,
        required: true,
        trim: true,
      },
      days: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      totalPrice: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  
  // 处方状态
  status: {
    type: String,
    enum: ['prescribed', 'dispensed', 'partiallyDispensed', 'expired', 'cancelled'],
    default: 'prescribed',
    index: true,
  },
  
  // 处方说明和备注
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  doctorSignature: {
    type: String,
    trim: true,
  },
  
  // 处方总价
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // 药品调配信息
  dispensingInfo: {
    dispensedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    dispenseDate: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  
  // 处方审计信息
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
  
  // 处方类型
  prescriptionType: {
    type: String,
    enum: ['general', 'emergency', 'special', 'refill'],
    default: 'general',
  },
  
  // 电子签名或指纹信息（用于处方验证）
  digitalSignature: {
    type: String,
    trim: true,
  },
  signatureTimestamp: {
    type: Date,
  },
});

// 设置索引
PrescriptionSchema.index({ prescriptionNo: 1 }, { unique: true });
PrescriptionSchema.index({ patientId: 1, issueDate: -1 });
PrescriptionSchema.index({ doctorId: 1, issueDate: -1 });
PrescriptionSchema.index({ registrationId: 1 });
PrescriptionSchema.index({ medicalRecordId: 1 });
PrescriptionSchema.index({ status: 1 });

// 中间件：更新updateTime字段
PrescriptionSchema.pre('save', function (next) {
  this.updateTime = Date.now();
  if (!this.prescriptionNo) {
    this.prescriptionNo = generatePrescriptionNo();
  }
  next();
});

PrescriptionSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updateTime: Date.now() });
  next();
});

// 生成处方编号的辅助函数
function generatePrescriptionNo() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `RX${year}${month}${day}${random}`;
}

// 虚拟属性：获取患者信息
PrescriptionSchema.virtual('patientInfo', {
  ref: 'Patient',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'fullName patientId gender age' },
});

// 虚拟属性：获取医生信息
PrescriptionSchema.virtual('doctorInfo', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'fullName position department' },
});

// 虚拟属性：获取挂号信息
PrescriptionSchema.virtual('registrationInfo', {
  ref: 'Registration',
  localField: 'registrationId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'registrationNo visitDate visitType' },
});

// 实例方法：验证处方是否有效
PrescriptionSchema.methods.isValid = function () {
  // 检查处方状态和有效期
  return this.status === 'prescribed' && this.validUntil >= new Date();
};

// 实例方法：取消处方
PrescriptionSchema.methods.cancel = async function (reason) {
  if (this.status === 'dispensed') {
    throw new Error('已调配的处方不能取消');
  }
  this.status = 'cancelled';
  this.notes = (this.notes || '') + `\n\n取消原因: ${reason}`;
  return this.save();
};

// 实例方法：更新药品调配状态
PrescriptionSchema.methods.updateDispensingStatus = async function (userId, status, remarks) {
  this.status = status;
  this.dispensingInfo = {
    dispensedBy: userId,
    dispenseDate: Date.now(),
    remarks: remarks || '',
  };
  return this.save();
};

// 静态方法：生成处方编号
PrescriptionSchema.statics.generatePrescriptionNo = function () {
  return generatePrescriptionNo();
};

// 静态方法：根据处方编号查找
PrescriptionSchema.statics.findByPrescriptionNo = async function (prescriptionNo) {
  return this.findOne({ prescriptionNo })
    .populate('patientInfo')
    .populate('doctorInfo')
    .populate('registrationInfo');
};

// 静态方法：获取患者的处方列表
PrescriptionSchema.statics.findByPatientId = async function (patientId, options = {}) {
  const query = { patientId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.startDate && options.endDate) {
    query.issueDate = { $gte: options.startDate, $lte: options.endDate };
  }
  
  const limit = options.limit || 50;
  const page = options.page || 1;
  const skip = (page - 1) * limit;
  
  const total = await this.countDocuments(query);
  const prescriptions = await this.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ issueDate: -1 })
    .populate('doctorInfo')
    .populate('registrationInfo');
  
  return {
    prescriptions,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

// 静态方法：获取医生开具的处方列表
PrescriptionSchema.statics.findByDoctorId = async function (doctorId, options = {}) {
  const query = { doctorId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.startDate && options.endDate) {
    query.issueDate = { $gte: options.startDate, $lte: options.endDate };
  }
  
  const limit = options.limit || 50;
  const page = options.page || 1;
  const skip = (page - 1) * limit;
  
  const total = await this.countDocuments(query);
  const prescriptions = await this.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ issueDate: -1 })
    .populate('patientInfo')
    .populate('registrationInfo');
  
  return {
    prescriptions,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

// 静态方法：获取待调配处方
PrescriptionSchema.statics.getPendingDispensing = async function (limit = 50) {
  return this.find({ status: { $in: ['prescribed', 'partiallyDispensed'] } })
    .limit(limit)
    .sort({ issueDate: 1 })
    .populate('patientInfo')
    .populate('doctorInfo');
};

// 静态方法：获取处方统计信息
PrescriptionSchema.statics.getStatistics = async function (options = {}) {
  const query = {};
  
  if (options.doctorId) {
    query.doctorId = options.doctorId;
  }
  
  if (options.departmentId) {
    // 需要通过医生关联部门，这里简化处理
  }
  
  if (options.startDate && options.endDate) {
    query.issueDate = { $gte: options.startDate, $lte: options.endDate };
  }
  
  const prescriptions = await this.find(query);
  
  // 统计处方数量和金额
  const stats = {
    totalPrescriptions: prescriptions.length,
    byStatus: {},
    totalAmount: 0,
    averageAmount: 0,
    averageMedicinesPerPrescription: 0,
    byType: {},
  };
  
  let totalMedicines = 0;
  
  prescriptions.forEach(prescription => {
    // 按状态统计
    stats.byStatus[prescription.status] = (stats.byStatus[prescription.status] || 0) + 1;
    
    // 按类型统计
    stats.byType[prescription.prescriptionType] = (stats.byType[prescription.prescriptionType] || 0) + 1;
    
    // 累计金额
    stats.totalAmount += prescription.totalAmount;
    
    // 统计药品数量
    totalMedicines += prescription.medicines ? prescription.medicines.length : 0;
  });
  
  // 计算平均值
  if (prescriptions.length > 0) {
    stats.averageAmount = stats.totalAmount / prescriptions.length;
    stats.averageMedicinesPerPrescription = totalMedicines / prescriptions.length;
  }
  
  return stats;
};

module.exports = mongoose.model('Prescription', PrescriptionSchema);