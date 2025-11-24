const Registration = require('../models/Registration');
const Patient = require('../models/Patient');
const Department = require('../models/Department');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const logger = require('../config/logger');

/**
 * 挂号管理控制器
 * 处理挂号信息的CRUD操作和挂号相关功能
 */
const registrationController = {
  /**
   * 获取挂号列表
   */
  async getRegistrations(req, res) {
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
              message: '获取挂号列表成功',
              data: {
                registrations: [],
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
      
      // 科室ID过滤
      if (req.query.departmentId) {
        query.departmentId = req.query.departmentId;
      }
      
      // 挂号状态过滤
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // 支付状态过滤
      if (req.query.paymentStatus) {
        query.paymentStatus = req.query.paymentStatus;
      }
      
      // 挂号日期过滤
      if (req.query.registrationDate) {
        const date = new Date(req.query.registrationDate);
        const startDate = new Date(date.setHours(0, 0, 0, 0));
        const endDate = new Date(date.setHours(23, 59, 59, 999));
        query.registrationDate = { $gte: startDate, $lte: endDate };
      }
      
      // 就诊日期范围过滤
      if (req.query.consultationDateStart && req.query.consultationDateEnd) {
        query.consultationDate = {
          $gte: new Date(req.query.consultationDateStart),
          $lte: new Date(req.query.consultationDateEnd)
        };
      } else if (req.query.consultationDateStart) {
        query.consultationDate = { $gte: new Date(req.query.consultationDateStart) };
      } else if (req.query.consultationDateEnd) {
        query.consultationDate = { $lte: new Date(req.query.consultationDateEnd) };
      }
      
      // 挂号类型过滤
      if (req.query.type) {
        query.type = req.query.type;
      }
      
      // 排序
      const sortField = req.query.sortBy || 'registrationDate';
      const sortOrder = req.query.order === 'asc' ? 1 : -1;
      const sortOptions = { [sortField]: sortOrder };
      
      // 查询挂号列表
      const registrations = await Registration.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions)
        .populate('patientId', 'name gender age idNumber phone')
        .populate('departmentId', 'name code')
        .populate('doctorId', 'name');
      
      // 获取总数
      const total = await Registration.countDocuments(query);
      
      res.json({
        success: true,
        message: '获取挂号列表成功',
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
      logger.error(`获取挂号列表异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取挂号列表失败，请稍后重试'
      });
    }
  },

  /**
   * 获取挂号详情
   */
  async getRegistrationById(req, res) {
    try {
      const registrationId = req.params.id;
      
      if (!registrationId) {
        return res.status(400).json({
          success: false,
          message: '挂号ID不能为空'
        });
      }
      
      // 查询挂号信息
      const registration = await Registration.findById(registrationId)
        .populate('patientId', 'name gender age idNumber phone address')
        .populate('departmentId', 'name code')
        .populate('doctorId', 'name title')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name');
      
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: '挂号记录不存在'
        });
      }
      
      // 检查是否有关联的病历
      let medicalRecord = null;
      if (registration.status === 'completed') {
        medicalRecord = await MedicalRecord.findOne({ registrationId });
      }
      
      res.json({
        success: true,
        message: '获取挂号详情成功',
        data: {
          ...registration.toObject(),
          hasMedicalRecord: !!medicalRecord
        }
      });
    } catch (error) {
      logger.error(`获取挂号详情异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取挂号详情失败，请稍后重试'
      });
    }
  },

  /**
   * 创建挂号记录
   */
  async createRegistration(req, res) {
    try {
      const {
        patientId,
        departmentId,
        doctorId,
        type,
        consultationDate,
        consultationTime,
        fee,
        paymentStatus,
        status
      } = req.body;
      const userId = req.user.id; // 从认证中间件获取当前用户
      
      // 验证必填字段
      const requiredFields = ['patientId', 'departmentId', 'doctorId', 'type', 'consultationDate', 'fee'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `缺少必填字段: ${missingFields.join(', ')}`
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
      
      // 验证科室是否存在
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: '科室不存在'
        });
      }
      
      // 验证医生是否存在
      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== 'doctor' || doctor.department.toString() !== departmentId) {
        return res.status(400).json({
          success: false,
          message: '医生不存在或不属于该科室'
        });
      }
      
      // 生成挂号单号
      const registrationNumber = await Registration.generateRegistrationNumber();
      
      // 检查医生在该时段是否已有挂号
      const existingRegistration = await Registration.findOne({
        doctorId,
        consultationDate,
        consultationTime,
        status: { $nin: ['canceled', 'completed'] }
      });
      
      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: '该医生在该时段已有挂号安排，请选择其他时段'
        });
      }
      
      // 创建挂号记录
      const newRegistration = new Registration({
        registrationNumber,
        patientId,
        departmentId,
        doctorId,
        type,
        consultationDate,
        consultationTime,
        fee,
        paymentStatus: paymentStatus || 'unpaid',
        status: status || 'pending',
        registrationDate: Date.now(),
        createdBy: userId,
        updatedBy: userId
      });
      
      await newRegistration.save();
      logger.info(`创建挂号记录成功：${registrationNumber}，患者：${patient.name}`);
      
      res.status(201).json({
        success: true,
        message: '挂号创建成功',
        data: newRegistration
      });
    } catch (error) {
      logger.error(`创建挂号记录异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '挂号创建失败，请稍后重试'
      });
    }
  },

  /**
   * 更新挂号信息
   */
  async updateRegistration(req, res) {
    try {
      const registrationId = req.params.id;
      const {
        departmentId,
        doctorId,
        type,
        consultationDate,
        consultationTime,
        fee,
        paymentStatus,
        status,
        description
      } = req.body;
      const userId = req.user.id; // 从认证中间件获取当前用户
      
      if (!registrationId) {
        return res.status(400).json({
          success: false,
          message: '挂号ID不能为空'
        });
      }
      
      // 查找挂号记录
      const registration = await Registration.findById(registrationId);
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: '挂号记录不存在'
        });
      }
      
      // 如果是已完成或已取消的挂号，不允许修改
      if (['completed', 'canceled'].includes(registration.status)) {
        return res.status(400).json({
          success: false,
          message: '已完成或已取消的挂号不允许修改'
        });
      }
      
      // 如果更新科室或医生，需要验证
      if (departmentId && departmentId !== registration.departmentId) {
        // 验证科室是否存在
        const department = await Department.findById(departmentId);
        if (!department) {
          return res.status(400).json({
            success: false,
            message: '科室不存在'
          });
        }
        
        // 如果更新了科室，但没有更新医生，检查医生是否属于新科室
        if (!doctorId && registration.doctorId) {
          const doctor = await User.findById(registration.doctorId);
          if (doctor && doctor.department.toString() !== departmentId) {
            return res.status(400).json({
              success: false,
              message: '医生不属于该科室，请重新选择医生'
            });
          }
        }
        
        registration.departmentId = departmentId;
      }
      
      if (doctorId && doctorId !== registration.doctorId) {
        // 验证医生是否存在且属于当前科室
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor' || doctor.department.toString() !== (departmentId || registration.departmentId)) {
          return res.status(400).json({
            success: false,
            message: '医生不存在或不属于该科室'
          });
        }
        
        registration.doctorId = doctorId;
      }
      
      // 如果更新就诊日期或时段，检查医生是否有空
      if ((consultationDate && consultationDate !== registration.consultationDate) ||
          (consultationTime && consultationTime !== registration.consultationTime)) {
        const existingRegistration = await Registration.findOne({
          doctorId: doctorId || registration.doctorId,
          consultationDate: consultationDate || registration.consultationDate,
          consultationTime: consultationTime || registration.consultationTime,
          _id: { $ne: registrationId },
          status: { $nin: ['canceled', 'completed'] }
        });
        
        if (existingRegistration) {
          return res.status(400).json({
            success: false,
            message: '该医生在该时段已有挂号安排，请选择其他时段'
          });
        }
        
        if (consultationDate) registration.consultationDate = consultationDate;
        if (consultationTime) registration.consultationTime = consultationTime;
      }
      
      // 更新其他字段
      if (type !== undefined) registration.type = type;
      if (fee !== undefined) registration.fee = fee;
      if (paymentStatus !== undefined) registration.paymentStatus = paymentStatus;
      if (status !== undefined) registration.status = status;
      if (description !== undefined) registration.description = description;
      
      registration.updatedBy = userId;
      registration.updateTime = Date.now();
      
      await registration.save();
      logger.info(`更新挂号信息成功：${registration.registrationNumber}`);
      
      res.json({
        success: true,
        message: '挂号信息更新成功',
        data: registration
      });
    } catch (error) {
      logger.error(`更新挂号信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '挂号信息更新失败，请稍后重试'
      });
    }
  },

  /**
   * 取消挂号
   */
  async cancelRegistration(req, res) {
    try {
      const registrationId = req.params.id;
      const { reason } = req.body;
      const userId = req.user.id;
      
      if (!registrationId) {
        return res.status(400).json({
          success: false,
          message: '挂号ID不能为空'
        });
      }
      
      // 查找挂号记录
      const registration = await Registration.findById(registrationId);
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: '挂号记录不存在'
        });
      }
      
      // 检查状态是否可以取消
      if (['completed', 'canceled'].includes(registration.status)) {
        return res.status(400).json({
          success: false,
          message: '该挂号状态不允许取消'
        });
      }
      
      // 取消挂号
      registration.status = 'canceled';
      registration.cancelReason = reason || '';
      registration.cancelTime = Date.now();
      registration.updatedBy = userId;
      registration.updateTime = Date.now();
      
      await registration.save();
      logger.info(`取消挂号成功：${registration.registrationNumber}，原因：${reason || '未提供'}`);
      
      // 如果已支付，这里可以添加退款逻辑
      if (registration.paymentStatus === 'paid') {
        // TODO: 添加退款逻辑
        logger.info(`挂号${registration.registrationNumber}已支付，需处理退款`);
      }
      
      res.json({
        success: true,
        message: '挂号取消成功',
        data: registration
      });
    } catch (error) {
      logger.error(`取消挂号异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '挂号取消失败，请稍后重试'
      });
    }
  },

  /**
   * 完成挂号
   */
  async completeRegistration(req, res) {
    try {
      const registrationId = req.params.id;
      const userId = req.user.id;
      
      if (!registrationId) {
        return res.status(400).json({
          success: false,
          message: '挂号ID不能为空'
        });
      }
      
      // 查找挂号记录
      const registration = await Registration.findById(registrationId);
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: '挂号记录不存在'
        });
      }
      
      // 检查状态
      if (registration.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: '只有待就诊状态的挂号才能完成'
        });
      }
      
      // 检查支付状态
      if (registration.paymentStatus !== 'paid') {
        return res.status(400).json({
          success: false,
          message: '挂号费用尚未支付，无法完成就诊'
        });
      }
      
      // 更新挂号状态
      registration.status = 'completed';
      registration.completeTime = Date.now();
      registration.updatedBy = userId;
      registration.updateTime = Date.now();
      
      await registration.save();
      logger.info(`挂号完成：${registration.registrationNumber}`);
      
      res.json({
        success: true,
        message: '挂号已完成',
        data: registration
      });
    } catch (error) {
      logger.error(`完成挂号异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '挂号完成失败，请稍后重试'
      });
    }
  },

  /**
   * 获取医生排班信息
   */
  async getDoctorSchedule(req, res) {
    try {
      const { doctorId, date } = req.query;
      
      if (!doctorId || !date) {
        return res.status(400).json({
          success: false,
          message: '医生ID和日期不能为空'
        });
      }
      
      // 检查医生是否存在
      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(400).json({
          success: false,
          message: '医生不存在'
        });
      }
      
      // 查找该医生在指定日期的所有挂号
      const registrations = await Registration.find({
        doctorId,
        consultationDate: date,
        status: { $nin: ['canceled'] }
      }).sort({ consultationTime: 1 });
      
      // 生成时段列表 (假设是上午8:00-12:00，下午14:00-18:00，每30分钟一个时段)
      const morningSlots = [];
      const afternoonSlots = [];
      
      for (let i = 8; i < 12; i++) {
        morningSlots.push(`${i}:00`);
        morningSlots.push(`${i}:30`);
      }
      
      for (let i = 14; i < 18; i++) {
        afternoonSlots.push(`${i}:00`);
        afternoonSlots.push(`${i}:30`);
      }
      
      // 构建排班信息
      const schedule = {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          department: doctor.department
        },
        date,
        morningSlots: morningSlots.map(slot => {
          const reg = registrations.find(r => r.consultationTime === slot);
          return {
            time: slot,
            isAvailable: !reg,
            registration: reg ? {
              id: reg._id,
              patientName: reg.patientId.name,
              status: reg.status
            } : null
          };
        }),
        afternoonSlots: afternoonSlots.map(slot => {
          const reg = registrations.find(r => r.consultationTime === slot);
          return {
            time: slot,
            isAvailable: !reg,
            registration: reg ? {
              id: reg._id,
              patientName: reg.patientId.name,
              status: reg.status
            } : null
          };
        })
      };
      
      res.json({
        success: true,
        message: '获取医生排班信息成功',
        data: schedule
      });
    } catch (error) {
      logger.error(`获取医生排班信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取医生排班信息失败，请稍后重试'
      });
    }
  },

  /**
   * 获取挂号统计信息
   */
  async getRegistrationStatistics(req, res) {
    try {
      const { startDate, endDate, departmentId } = req.query;
      
      // 构建查询条件
      const query = {};
      
      // 日期范围
      if (startDate && endDate) {
        query.registrationDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      // 科室过滤
      if (departmentId) {
        query.departmentId = departmentId;
      }
      
      // 统计总数
      const total = await Registration.countDocuments(query);
      
      // 按状态统计
      const statusStats = await Registration.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // 按类型统计
      const typeStats = await Registration.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 }, totalFee: { $sum: '$fee' } } }
      ]);
      
      // 按科室统计
      const departmentStats = await Registration.aggregate([
        { $match: query },
        { $group: { _id: '$departmentId', count: { $sum: 1 }, totalFee: { $sum: '$fee' } } }
      ]);
      
      // 填充科室名称
      for (const stat of departmentStats) {
        const department = await Department.findById(stat._id);
        if (department) {
          stat.departmentName = department.name;
          stat.departmentCode = department.code;
        }
      }
      
      res.json({
        success: true,
        message: '获取挂号统计信息成功',
        data: {
          total,
          statusStats,
          typeStats,
          departmentStats
        }
      });
    } catch (error) {
      logger.error(`获取挂号统计信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取挂号统计信息失败，请稍后重试'
      });
    }
  }
};

module.exports = registrationController;