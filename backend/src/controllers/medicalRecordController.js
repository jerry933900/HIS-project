const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Registration = require('../models/Registration');
const logger = require('../config/logger');

/**
 * 病历管理控制器
 * 处理病历信息的CRUD操作和病历相关功能
 */
const medicalRecordController = {
  /**
   * 获取病历列表
   */
  async getMedicalRecords(req, res) {
    try {
      // 分页参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // 构建查询条件
      const query = {};
      
      // 患者姓名或ID搜索
      if (req.query.patient) {
        // 尝试通过ID查询患者
        const patient = await Patient.findById(req.query.patient);
        if (patient) {
          query.patientId = patient._id;
        } else {
          // 通过姓名搜索患者
          const patients = await Patient.find({ name: { $regex: req.query.patient, $options: 'i' } });
          if (patients.length > 0) {
            query.patientId = { $in: patients.map(p => p._id) };
          } else {
            // 如果没有找到患者，返回空结果
            return res.json({
              success: true,
              message: '获取病历列表成功',
              data: {
                medicalRecords: [],
                pagination: {
                  total: 0,
                  page,
                  limit,
                  pages: 0
                }
              }
            });
          }
        }
      }
      
      // 医生ID过滤
      if (req.query.doctorId) {
        query.doctorId = req.query.doctorId;
      }
      
      // 挂号ID过滤
      if (req.query.registrationId) {
        query.registrationId = req.query.registrationId;
      }
      
      // 病历状态过滤
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // 诊断日期范围过滤
      if (req.query.diagnosisDateStart && req.query.diagnosisDateEnd) {
        query.diagnosisDate = {
          $gte: new Date(req.query.diagnosisDateStart),
          $lte: new Date(req.query.diagnosisDateEnd)
        };
      } else if (req.query.diagnosisDateStart) {
        query.diagnosisDate = { $gte: new Date(req.query.diagnosisDateStart) };
      } else if (req.query.diagnosisDateEnd) {
        query.diagnosisDate = { $lte: new Date(req.query.diagnosisDateEnd) };
      }
      
      // 排序
      const sortField = req.query.sortBy || 'diagnosisDate';
      const sortOrder = req.query.order === 'asc' ? 1 : -1;
      const sortOptions = { [sortField]: sortOrder };
      
      // 查询病历列表
      const medicalRecords = await MedicalRecord.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions)
        .populate('patientId', 'name gender age idNumber phone')
        .populate('doctorId', 'name title')
        .populate('registrationId', 'registrationNumber departmentId');
      
      // 获取总数
      const total = await MedicalRecord.countDocuments(query);
      
      res.json({
        success: true,
        message: '获取病历列表成功',
        data: {
          medicalRecords,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`获取病历列表异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取病历列表失败，请稍后重试'
      });
    }
  },

  /**
   * 获取病历详情
   */
  async getMedicalRecordById(req, res) {
    try {
      const recordId = req.params.id;
      
      if (!recordId) {
        return res.status(400).json({
          success: false,
          message: '病历ID不能为空'
        });
      }
      
      // 查询病历信息
      const medicalRecord = await MedicalRecord.findById(recordId)
        .populate('patientId', 'name gender age idNumber phone address')
        .populate('doctorId', 'name title department')
        .populate('registrationId', 'registrationNumber departmentId consultationDate consultationTime fee')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');
      
      if (!medicalRecord) {
        return res.status(404).json({
          success: false,
          message: '病历记录不存在'
        });
      }
      
      res.json({
        success: true,
        message: '获取病历详情成功',
        data: medicalRecord
      });
    } catch (error) {
      logger.error(`获取病历详情异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取病历详情失败，请稍后重试'
      });
    }
  },

  /**
   * 创建病历记录
   */
  async createMedicalRecord(req, res) {
    try {
      const {
        registrationId,
        patientId,
        chiefComplaint,
        presentIllness,
        pastHistory,
        physicalExamination,
        diagnosis,
        treatmentPlan,
        medications,
        examinations,
        followUp
      } = req.body;
      const userId = req.user.id; // 从认证中间件获取当前用户
      
      // 验证必填字段
      const requiredFields = ['registrationId', 'patientId'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `缺少必填字段: ${missingFields.join(', ')}`
        });
      }
      
      // 验证挂号记录是否存在
      const registration = await Registration.findById(registrationId);
      if (!registration) {
        return res.status(400).json({
          success: false,
          message: '挂号记录不存在'
        });
      }
      
      // 验证挂号状态
      if (registration.status !== 'completed' && registration.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: '只有待就诊或已完成的挂号才能创建病历'
        });
      }
      
      // 验证患者是否存在
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(400).json({
          success: false,
          message: '患者不存在'
        });
      }
      
      // 检查是否已存在该挂号的病历
      const existingRecord = await MedicalRecord.findOne({ registrationId });
      if (existingRecord) {
        return res.status(400).json({
          success: false,
          message: '该挂号已存在病历记录'
        });
      }
      
      // 获取当前用户作为医生
      const doctor = await User.findById(userId);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(403).json({
          success: false,
          message: '只有医生可以创建病历'
        });
      }
      
      // 生成病历号
      const recordNumber = await MedicalRecord.generateRecordNumber();
      
      // 创建病历记录
      const newMedicalRecord = new MedicalRecord({
        recordNumber,
        registrationId,
        patientId,
        doctorId: userId,
        chiefComplaint,
        presentIllness,
        pastHistory,
        physicalExamination,
        diagnosis,
        treatmentPlan,
        medications: medications || [],
        examinations: examinations || [],
        followUp,
        diagnosisDate: Date.now(),
        status: 'draft',
        createdBy: userId,
        updatedBy: userId,
        revisions: [{ date: Date.now(), operator: userId, action: 'created' }]
      });
      
      await newMedicalRecord.save();
      logger.info(`创建病历记录成功：${recordNumber}，患者：${patient.name}`);
      
      res.status(201).json({
        success: true,
        message: '病历创建成功',
        data: newMedicalRecord
      });
    } catch (error) {
      logger.error(`创建病历记录异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '病历创建失败，请稍后重试'
      });
    }
  },

  /**
   * 更新病历信息
   */
  async updateMedicalRecord(req, res) {
    try {
      const recordId = req.params.id;
      const {
        chiefComplaint,
        presentIllness,
        pastHistory,
        physicalExamination,
        diagnosis,
        treatmentPlan,
        medications,
        examinations,
        followUp,
        status
      } = req.body;
      const userId = req.user.id; // 从认证中间件获取当前用户
      
      if (!recordId) {
        return res.status(400).json({
          success: false,
          message: '病历ID不能为空'
        });
      }
      
      // 查找病历记录
      const medicalRecord = await MedicalRecord.findById(recordId);
      if (!medicalRecord) {
        return res.status(404).json({
          success: false,
          message: '病历记录不存在'
        });
      }
      
      // 检查权限：只有创建该病历的医生或管理员可以修改
      const currentUser = await User.findById(userId);
      if (currentUser.role !== 'admin' && currentUser._id.toString() !== medicalRecord.doctorId.toString()) {
        return res.status(403).json({
          success: false,
          message: '无权修改该病历'
        });
      }
      
      // 如果状态为已归档，不允许修改
      if (medicalRecord.status === 'archived') {
        return res.status(400).json({
          success: false,
          message: '已归档的病历不允许修改'
        });
      }
      
      // 记录修改内容
      const changes = [];
      
      if (chiefComplaint !== undefined && chiefComplaint !== medicalRecord.chiefComplaint) {
        changes.push(`主诉从"${medicalRecord.chiefComplaint || ''}"修改为"${chiefComplaint}"`);
        medicalRecord.chiefComplaint = chiefComplaint;
      }
      
      if (presentIllness !== undefined && presentIllness !== medicalRecord.presentIllness) {
        changes.push(`现病史内容已修改`);
        medicalRecord.presentIllness = presentIllness;
      }
      
      if (pastHistory !== undefined && pastHistory !== medicalRecord.pastHistory) {
        changes.push(`既往史内容已修改`);
        medicalRecord.pastHistory = pastHistory;
      }
      
      if (physicalExamination !== undefined && physicalExamination !== medicalRecord.physicalExamination) {
        changes.push(`体格检查内容已修改`);
        medicalRecord.physicalExamination = physicalExamination;
      }
      
      if (diagnosis !== undefined && diagnosis !== medicalRecord.diagnosis) {
        changes.push(`诊断从"${medicalRecord.diagnosis || ''}"修改为"${diagnosis}"`);
        medicalRecord.diagnosis = diagnosis;
      }
      
      if (treatmentPlan !== undefined && treatmentPlan !== medicalRecord.treatmentPlan) {
        changes.push(`治疗方案内容已修改`);
        medicalRecord.treatmentPlan = treatmentPlan;
      }
      
      if (medications !== undefined) {
        changes.push(`药物治疗内容已修改`);
        medicalRecord.medications = medications;
      }
      
      if (examinations !== undefined) {
        changes.push(`检查项目内容已修改`);
        medicalRecord.examinations = examinations;
      }
      
      if (followUp !== undefined && followUp !== medicalRecord.followUp) {
        changes.push(`随访建议内容已修改`);
        medicalRecord.followUp = followUp;
      }
      
      if (status !== undefined && status !== medicalRecord.status) {
        changes.push(`状态从"${medicalRecord.status}"修改为"${status}"`);
        medicalRecord.status = status;
      }
      
      // 添加修订记录
      if (changes.length > 0) {
        medicalRecord.revisions.push({
          date: Date.now(),
          operator: userId,
          action: 'updated',
          changes
        });
      }
      
      medicalRecord.updatedBy = userId;
      medicalRecord.updateTime = Date.now();
      
      await medicalRecord.save();
      logger.info(`更新病历信息成功：${medicalRecord.recordNumber}`);
      
      res.json({
        success: true,
        message: '病历信息更新成功',
        data: medicalRecord
      });
    } catch (error) {
      logger.error(`更新病历信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '病历信息更新失败，请稍后重试'
      });
    }
  },

  /**
   * 归档病历
   */
  async archiveMedicalRecord(req, res) {
    try {
      const recordId = req.params.id;
      const userId = req.user.id;
      
      if (!recordId) {
        return res.status(400).json({
          success: false,
          message: '病历ID不能为空'
        });
      }
      
      // 查找病历记录
      const medicalRecord = await MedicalRecord.findById(recordId);
      if (!medicalRecord) {
        return res.status(404).json({
          success: false,
          message: '病历记录不存在'
        });
      }
      
      // 检查权限：只有创建该病历的医生或管理员可以归档
      const currentUser = await User.findById(userId);
      if (currentUser.role !== 'admin' && currentUser._id.toString() !== medicalRecord.doctorId.toString()) {
        return res.status(403).json({
          success: false,
          message: '无权归档该病历'
        });
      }
      
      // 检查状态
      if (medicalRecord.status === 'archived') {
        return res.status(400).json({
          success: false,
          message: '该病历已归档'
        });
      }
      
      // 归档病历
      medicalRecord.status = 'archived';
      medicalRecord.archivedTime = Date.now();
      medicalRecord.updatedBy = userId;
      medicalRecord.updateTime = Date.now();
      
      // 添加修订记录
      medicalRecord.revisions.push({
        date: Date.now(),
        operator: userId,
        action: 'archived'
      });
      
      await medicalRecord.save();
      logger.info(`病历归档成功：${medicalRecord.recordNumber}`);
      
      res.json({
        success: true,
        message: '病历已归档',
        data: medicalRecord
      });
    } catch (error) {
      logger.error(`归档病历异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '病历归档失败，请稍后重试'
      });
    }
  },

  /**
   * 获取患者的病历历史
   */
  async getPatientMedicalHistory(req, res) {
    try {
      const patientId = req.params.patientId;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: '患者ID不能为空'
        });
      }
      
      // 验证患者是否存在
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: '患者不存在'
        });
      }
      
      // 查询患者的所有病历记录，按诊断日期降序排列
      const medicalRecords = await MedicalRecord.find({ patientId })
        .sort({ diagnosisDate: -1 })
        .populate('doctorId', 'name title department')
        .populate('registrationId', 'registrationNumber departmentId consultationDate consultationTime');
      
      res.json({
        success: true,
        message: '获取患者病历历史成功',
        data: {
          patient: {
            id: patient._id,
            name: patient.name,
            idNumber: patient.idNumber
          },
          medicalRecords
        }
      });
    } catch (error) {
      logger.error(`获取患者病历历史异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取患者病历历史失败，请稍后重试'
      });
    }
  },

  /**
   * 获取病历统计信息
   */
  async getMedicalRecordStatistics(req, res) {
    try {
      const { startDate, endDate, departmentId, doctorId } = req.query;
      
      // 构建查询条件
      const query = {};
      
      // 日期范围
      if (startDate && endDate) {
        query.diagnosisDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      // 科室过滤
      if (departmentId) {
        // 先获取该科室的所有医生
        const doctors = await User.find({ department: departmentId, role: 'doctor' });
        if (doctors.length > 0) {
          query.doctorId = { $in: doctors.map(d => d._id) };
        } else {
          // 如果没有医生，返回空结果
          return res.json({
            success: true,
            message: '获取病历统计信息成功',
            data: {
              totalRecords: 0,
              statusStats: [],
              doctorStats: [],
              diagnosisStats: []
            }
          });
        }
      }
      
      // 医生过滤
      if (doctorId) {
        query.doctorId = doctorId;
      }
      
      // 统计总数
      const totalRecords = await MedicalRecord.countDocuments(query);
      
      // 按状态统计
      const statusStats = await MedicalRecord.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // 按医生统计
      const doctorStats = await MedicalRecord.aggregate([
        { $match: query },
        { $group: { _id: '$doctorId', count: { $sum: 1 } } }
      ]);
      
      // 填充医生信息
      for (const stat of doctorStats) {
        const doctor = await User.findById(stat._id);
        if (doctor) {
          stat.doctorName = doctor.name;
          stat.department = doctor.department;
        }
      }
      
      // 按诊断统计（简单统计出现频率最高的诊断）
      const diagnosisStats = await MedicalRecord.aggregate([
        { $match: { ...query, diagnosis: { $ne: '' } } },
        { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 } // 只取前10个最常见的诊断
      ]);
      
      res.json({
        success: true,
        message: '获取病历统计信息成功',
        data: {
          totalRecords,
          statusStats,
          doctorStats,
          diagnosisStats
        }
      });
    } catch (error) {
      logger.error(`获取病历统计信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取病历统计信息失败，请稍后重试'
      });
    }
  }
};

module.exports = medicalRecordController;