const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 病历记录模型定义
 * 存储患者的电子病历信息
 */
const MedicalRecordSchema = new Schema({
  registrationId: {
    type: Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
    unique: true,
    index: true,
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  chiefComplaint: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  presentIllness: {
    type: String,
    trim: true,
    maxlength: 5000,
  },
  pastHistory: {
    type: String,
    trim: true,
    maxlength: 5000,
  },
  physicalExam: {
    type: String,
    trim: true,
    maxlength: 5000,
  },
  diagnosis: [
    {
      type: String,
      trim: true,
      maxlength: 500,
    },
  ],
  treatmentPlan: {
    type: String,
    trim: true,
    maxlength: 5000,
  },
  medications: [
    {
      medicineId: {
        type: Schema.Types.ObjectId,
        ref: 'Medicine',
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
      dosage: {
        type: String,
        trim: true,
        required: true,
      },
      frequency: {
        type: String,
        trim: true,
        required: true,
      },
      duration: {
        type: String,
        trim: true,
      },
      usage: {
        type: String,
        trim: true,
        required: true,
      },
    },
  ],
  examinations: [
    {
      examId: {
        type: Schema.Types.ObjectId,
        ref: 'ExamItem',
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      resultStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
      },
      result: {
        type: String,
        trim: true,
      },
      resultDate: {
        type: Date,
      },
      referenceRange: {
        type: String,
        trim: true,
      },
    },
  ],
  followUpAdvice: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  recordDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
  createTime: {
    type: Date,
    default: Date.now,
  },
  updateTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'revised'],
    default: 'draft',
  },
  revisions: [
    {
      revisionDate: {
        type: Date,
        default: Date.now,
      },
      revisedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      changes: {
        type: String,
        trim: true,
      },
    },
  ],
  // 关联的处方ID（如果已开具处方）
  prescriptionIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
  ],
  // 病历附件（如检查报告扫描件等）
  attachments: [
    {
      fileName: {
        type: String,
        trim: true,
      },
      fileUrl: {
        type: String,
        trim: true,
      },
      fileType: {
        type: String,
        trim: true,
      },
      uploadTime: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// 设置索引
MedicalRecordSchema.index({ registrationId: 1 }, { unique: true });
MedicalRecordSchema.index({ patientId: 1, recordDate: -1 });
MedicalRecordSchema.index({ doctorId: 1, recordDate: -1 });
MedicalRecordSchema.index({ status: 1 });

// 中间件：更新updateTime字段
MedicalRecordSchema.pre('save', function (next) {
  this.updateTime = Date.now();
  next();
});

MedicalRecordSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updateTime: Date.now() });
  next();
});

// 虚拟属性：获取患者信息摘要
MedicalRecordSchema.virtual('patientInfo', {
  ref: 'Patient',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'fullName patientId gender age' },
});

// 虚拟属性：获取医生信息摘要
MedicalRecordSchema.virtual('doctorInfo', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'fullName position' },
});

// 虚拟属性：获取挂号信息摘要
MedicalRecordSchema.virtual('registrationInfo', {
  ref: 'Registration',
  localField: 'registrationId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'registrationNo visitDate visitType' },
});

// 实例方法：添加病历修订记录
MedicalRecordSchema.methods.addRevision = function (userId, changes) {
  this.revisions.push({
    revisedBy: userId,
    changes,
    revisionDate: Date.now(),
  });
  this.status = 'revised';
};

// 静态方法：根据挂号ID查找病历
MedicalRecordSchema.statics.findByRegistrationId = async function (registrationId) {
  return this.findOne({ registrationId })
    .populate('patientInfo')
    .populate('doctorInfo')
    .populate('registrationInfo');
};

// 静态方法：获取患者的病历列表
MedicalRecordSchema.statics.findByPatientId = async function (patientId, options = {}) {
  const query = { patientId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.startDate && options.endDate) {
    query.recordDate = { $gte: options.startDate, $lte: options.endDate };
  }
  
  return this.find(query)
    .sort({ recordDate: -1 })
    .populate('doctorInfo')
    .populate('registrationInfo')
    .limit(options.limit || 50);
};

// 静态方法：获取医生的病历列表
MedicalRecordSchema.statics.findByDoctorId = async function (doctorId, options = {}) {
  const query = { doctorId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.startDate && options.endDate) {
    query.recordDate = { $gte: options.startDate, $lte: options.endDate };
  }
  
  return this.find(query)
    .sort({ recordDate: -1 })
    .populate('patientInfo')
    .populate('registrationInfo')
    .limit(options.limit || 50);
};

// 静态方法：获取病历统计信息
MedicalRecordSchema.statics.getStatistics = async function (options = {}) {
  const query = {};
  
  if (options.doctorId) {
    query.doctorId = options.doctorId;
  }
  
  if (options.departmentId) {
    // 需要通过关联查询获取部门ID对应的病历
    // 这里简化处理，实际应用中可能需要更复杂的聚合查询
  }
  
  if (options.startDate && options.endDate) {
    query.recordDate = { $gte: options.startDate, $lte: options.endDate };
  }
  
  const records = await this.find(query);
  
  const stats = {
    total: records.length,
    byStatus: {},
    withPrescriptions: 0,
    withExaminations: 0,
    averageMedications: 0,
    averageExaminations: 0,
  };
  
  let totalMedications = 0;
  let totalExaminations = 0;
  
  records.forEach(record => {
    // 按状态统计
    stats.byStatus[record.status] = (stats.byStatus[record.status] || 0) + 1;
    
    // 统计处方药
    if (record.prescriptionIds && record.prescriptionIds.length > 0) {
      stats.withPrescriptions++;
    }
    
    // 统计检查项目
    if (record.examinations && record.examinations.length > 0) {
      stats.withExaminations++;
    }
    
    totalMedications += record.medications ? record.medications.length : 0;
    totalExaminations += record.examinations ? record.examinations.length : 0;
  });
  
  // 计算平均值
  if (records.length > 0) {
    stats.averageMedications = totalMedications / records.length;
    stats.averageExaminations = totalExaminations / records.length;
  }
  
  return stats;
};

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);