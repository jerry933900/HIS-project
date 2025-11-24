const Patient = require('../models/Patient');
const Registration = require('../models/Registration');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const logger = require('../config/logger');

/**
 * 患者管理控制器
 * 处理患者信息的CRUD操作和患者相关功能
 */
const patientController = {
  /**
   * 获取患者列表
   */
  async getPatients(req, res) {
    try {
      // 分页参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // 构建查询条件
      const query = {};
      
      // 搜索条件
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
          { fullName: searchRegex },
          { patientId: searchRegex },
          { idNumber: searchRegex },
          { phone: searchRegex },
          { email: searchRegex }
        ];
      }
      
      // 性别过滤
      if (req.query.gender) {
        query.gender = req.query.gender;
      }
      
      // 状态过滤
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // 年龄段过滤
      if (req.query.ageMin || req.query.ageMax) {
        const now = new Date();
        const minAge = parseInt(req.query.ageMin) || 0;
        const maxAge = parseInt(req.query.ageMax) || 150;
        
        const maxBirthDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
        const minBirthDate = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate());
        
        query.birthDate = { $lte: maxBirthDate, $gte: minBirthDate };
      }
      
      // 排序
      const sortField = req.query.sortBy || 'createTime';
      const sortOrder = req.query.order === 'asc' ? 1 : -1;
      const sortOptions = { [sortField]: sortOrder };
      
      // 查询患者列表
      const patients = await Patient.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions);
      
      // 获取总数
      const total = await Patient.countDocuments(query);
      
      res.json({
        success: true,
        message: '获取患者列表成功',
        data: {
          patients,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`获取患者列表异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取患者列表失败，请稍后重试'
      });
    }
  },

  /**
   * 获取患者详情
   */
  async getPatientById(req, res) {
    try {
      const patientId = req.params.id;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: '患者ID不能为空'
        });
      }
      
      // 查询患者信息
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: '患者不存在'
        });
      }
      
      res.json({
        success: true,
        message: '获取患者详情成功',
        data: patient
      });
    } catch (error) {
      logger.error(`获取患者详情异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取患者详情失败，请稍后重试'
      });
    }
  },

  /**
   * 创建新患者
   */
  async createPatient(req, res) {
    try {
      const {
        fullName,
        gender,
        birthDate,
        idNumber,
        phone,
        email,
        address,
        bloodType,
        allergyHistory,
        medicalHistory,
        contactPerson,
        contactPhone,
        insuranceNumber,
        insuranceType,
        status
      } = req.body;
      
      // 验证必填字段
      const requiredFields = ['fullName', 'gender', 'birthDate', 'idNumber'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `缺少必填字段: ${missingFields.join(', ')}`
        });
      }
      
      // 检查身份证号是否已存在
      const existingPatient = await Patient.findOne({ idNumber });
      if (existingPatient) {
        return res.status(400).json({
          success: false,
          message: '该身份证号已存在患者记录'
        });
      }
      
      // 检查手机号是否已存在
      if (phone) {
        const existingPhone = await Patient.findOne({ phone });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: '该手机号已存在患者记录'
          });
        }
      }
      
      // 生成患者编号
      const patientCode = await Patient.generatePatientId();
      
      // 创建新患者
      const newPatient = new Patient({
        fullName,
        gender,
        birthDate,
        patientId: patientCode,
        idNumber,
        phone,
        email,
        address,
        bloodType,
        allergyHistory,
        medicalHistory,
        contactPerson,
        contactPhone,
        insuranceNumber,
        insuranceType,
        status: status || 'active',
        createTime: Date.now(),
        updateTime: Date.now()
      });
      
      await newPatient.save();
      logger.info(`创建患者成功：${fullName}，患者编号：${patientCode}`);
      
      res.status(201).json({
        success: true,
        message: '患者创建成功',
        data: newPatient
      });
    } catch (error) {
      logger.error(`创建患者异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '患者创建失败，请稍后重试'
      });
    }
  },

  /**
   * 更新患者信息
   */
  async updatePatient(req, res) {
    try {
      const patientId = req.params.id;
      const {
        fullName,
        gender,
        birthDate,
        idNumber,
        phone,
        email,
        address,
        bloodType,
        allergyHistory,
        medicalHistory,
        contactPerson,
        contactPhone,
        insuranceNumber,
        insuranceType,
        status,
        avatar
      } = req.body;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: '患者ID不能为空'
        });
      }
      
      // 查找患者
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: '患者不存在'
        });
      }
      
      // 检查身份证号是否已被其他患者使用
      if (idNumber && idNumber !== patient.idNumber) {
        const existingPatient = await Patient.findOne({ idNumber, _id: { $ne: patientId } });
        if (existingPatient) {
          return res.status(400).json({
            success: false,
            message: '该身份证号已被其他患者使用'
          });
        }
      }
      
      // 检查手机号是否已被其他患者使用
      if (phone && phone !== patient.phone) {
        const existingPhone = await Patient.findOne({ phone, _id: { $ne: patientId } });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: '该手机号已被其他患者使用'
          });
        }
      }
      
      // 更新患者信息
      if (fullName !== undefined) patient.fullName = fullName;
      if (gender !== undefined) patient.gender = gender;
      if (birthDate !== undefined) patient.birthDate = birthDate;
      if (idNumber !== undefined) patient.idNumber = idNumber;
      if (phone !== undefined) patient.phone = phone;
      if (email !== undefined) patient.email = email;
      if (address !== undefined) patient.address = address;
      if (bloodType !== undefined) patient.bloodType = bloodType;
      if (allergyHistory !== undefined) patient.allergyHistory = allergyHistory;
      if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;
      if (contactPerson !== undefined) patient.contactPerson = contactPerson;
      if (contactPhone !== undefined) patient.contactPhone = contactPhone;
      if (insuranceNumber !== undefined) patient.insuranceNumber = insuranceNumber;
      if (insuranceType !== undefined) patient.insuranceType = insuranceType;
      if (status !== undefined) patient.status = status;
      if (avatar !== undefined) patient.avatar = avatar;
      
      patient.updateTime = Date.now();
      await patient.save();
      logger.info(`更新患者信息成功：${patient.fullName}，患者编号：${patient.patientId}`);
      
      res.json({
        success: true,
        message: '患者信息更新成功',
        data: patient
      });
    } catch (error) {
      logger.error(`更新患者信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '患者信息更新失败，请稍后重试'
      });
    }
  },

  /**
   * 删除患者
   */
  async deletePatient(req, res) {
    try {
      const patientId = req.params.id;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: '患者ID不能为空'
        });
      }
      
      // 查找患者
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: '患者不存在'
        });
      }
      
      // 检查是否有就诊记录
      const hasRegistrations = await Registration.countDocuments({ patientId }) > 0;
      if (hasRegistrations) {
        return res.status(400).json({
          success: false,
          message: '该患者存在就诊记录，无法删除'
        });
      }
      
      // 软删除
      patient.status = 'inactive';
      patient.updateTime = Date.now();
      await patient.save();
      
      logger.info(`删除患者成功：${patient.fullName}，患者编号：${patient.patientId}`);
      
      res.json({
        success: true,
        message: '患者删除成功'
      });
    } catch (error) {
      logger.error(`删除患者异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '患者删除失败，请稍后重试'
      });
    }
  },

  /**
   * 获取患者就诊记录
   */
  async getPatientRegistrations(req, res) {
    try {
      const patientId = req.params.id;
      
      // 分页参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: '患者ID不能为空'
        });
      }
      
      // 查询就诊记录
      const registrations = await Registration.find({ patientId })
        .skip(skip)
        .limit(limit)
        .sort({ visitDate: -1 })
        .populate('doctorId', 'fullName position department')
        .populate('departmentId', 'name code');
      
      // 获取总数
      const total = await Registration.countDocuments({ patientId });
      
      res.json({
        success: true,
        message: '获取患者就诊记录成功',
        data: {
          registrations,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`获取患者就诊记录异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取患者就诊记录失败，请稍后重试'
      });
    }
  },

  /**
   * 获取患者病历记录
   */
  async getPatientMedicalRecords(req, res) {
    try {
      const patientId = req.params.id;
      
      // 分页参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: '患者ID不能为空'
        });
      }
      
      // 查询病历记录
      const medicalRecords = await MedicalRecord.find({ patientId })
        .skip(skip)
        .limit(limit)
        .sort({ recordDate: -1 })
        .populate('doctorId', 'fullName position department')
        .populate('registrationId', 'registrationNo visitDate visitType');
      
      // 获取总数
      const total = await MedicalRecord.countDocuments({ patientId });
      
      res.json({
        success: true,
        message: '获取患者病历记录成功',
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
      logger.error(`获取患者病历记录异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取患者病历记录失败，请稍后重试'
      });
    }
  },

  /**
   * 获取患者处方记录
   */
  async getPatientPrescriptions(req, res) {
    try {
      const patientId = req.params.id;
      
      // 分页参数
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: '患者ID不能为空'
        });
      }
      
      // 查询处方记录
      const prescriptions = await Prescription.find({ patientId })
        .skip(skip)
        .limit(limit)
        .sort({ issueDate: -1 })
        .populate('doctorId', 'fullName position department')
        .populate('registrationId', 'registrationNo visitDate visitType');
      
      // 获取总数
      const total = await Prescription.countDocuments({ patientId });
      
      res.json({
        success: true,
        message: '获取患者处方记录成功',
        data: {
          prescriptions,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`获取患者处方记录异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取患者处方记录失败，请稍后重试'
      });
    }
  },

  /**
   * 获取患者统计信息
   */
  async getPatientStatistics(req, res) {
    try {
      // 获取患者总数
      const totalPatients = await Patient.countDocuments({ status: 'active' });
      
      // 按性别统计
      const patientsByGender = await Patient.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]);
      
      // 按年龄段统计
      const ageGroups = await Patient.aggregate([
        { $match: { status: 'active' } },
        {
          $addFields: {
            age: {
              $dateDiff: {
                startDate: '$birthDate',
                endDate: '$$NOW',
                unit: 'year'
              }
            }
          }
        },
        {
          $bucket: {
            groupBy: '$age',
            boundaries: [0, 18, 30, 50, 70, 100],
            default: '100+',
            output: {
              count: { $sum: 1 },
              ids: { $push: '$_id' }
            }
          }
        }
      ]);
      
      // 今日新增患者
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newPatientsToday = await Patient.countDocuments({ 
        createTime: { $gte: today },
        status: 'active'
      });
      
      // 当月就诊患者数
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyVisitors = await Registration.distinct('patientId', { 
        visitDate: { $gte: startOfMonth }
      });
      
      res.json({
        success: true,
        message: '获取患者统计信息成功',
        data: {
          totalPatients,
          patientsByGender,
          ageGroups,
          newPatientsToday,
          monthlyVisitors: monthlyVisitors.length
        }
      });
    } catch (error) {
      logger.error(`获取患者统计信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取患者统计信息失败，请稍后重试'
      });
    }
  }
};

module.exports = patientController;