const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Medicine = require('../models/Medicine');
const logger = require('../config/logger');

/**
 * 处方管理控制器
 * 处理处方信息的CRUD操作和处方相关功能
 */
const prescriptionController = {
  /**
   * 获取处方列表
   */
  async getPrescriptions(req, res) {
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
              message: '获取处方列表成功',
              data: {
                prescriptions: [],
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
      
      // 病历ID过滤
      if (req.query.medicalRecordId) {
        query.medicalRecordId = req.query.medicalRecordId;
      }
      
      // 处方状态过滤
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // 处方日期范围过滤
      if (req.query.prescriptionDateStart && req.query.prescriptionDateEnd) {
        query.prescriptionDate = {
          $gte: new Date(req.query.prescriptionDateStart),
          $lte: new Date(req.query.prescriptionDateEnd)
        };
      } else if (req.query.prescriptionDateStart) {
        query.prescriptionDate = { $gte: new Date(req.query.prescriptionDateStart) };
      } else if (req.query.prescriptionDateEnd) {
        query.prescriptionDate = { $lte: new Date(req.query.prescriptionDateEnd) };
      }
      
      // 药品名称搜索
      if (req.query.medicineName) {
        // 先搜索药品，获取药品ID列表
        const medicines = await Medicine.find({ name: { $regex: req.query.medicineName, $options: 'i' } });
        if (medicines.length > 0) {
          // 使用聚合查询来查找包含这些药品的处方
          // 这种情况下，需要特殊处理，不能使用简单的find
          const prescriptions = await Prescription.aggregate([
            {
              $match: {
                ...query,
                'medicines.medicineId': { $in: medicines.map(m => m._id) }
              }
            },
            { $skip: skip },
            { $limit: limit },
            { $sort: { prescriptionDate: -1 } }
          ]);
          
          // 获取总数
          const total = await Prescription.countDocuments({
            ...query,
            'medicines.medicineId': { $in: medicines.map(m => m._id) }
          });
          
          // 填充关联数据
          const populatedPrescriptions = await Prescription.populate(prescriptions, [
            { path: 'patientId', select: 'name gender age idNumber phone' },
            { path: 'doctorId', select: 'name title' },
            { path: 'medicalRecordId', select: 'recordNumber diagnosisDate' },
            { path: 'medicines.medicineId', select: 'name specification code unit price' }
          ]);
          
          return res.json({
            success: true,
            message: '获取处方列表成功',
            data: {
              prescriptions: populatedPrescriptions,
              pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
              }
            }
          });
        } else {
          // 如果没有找到药品，返回空结果
          return res.json({
            success: true,
            message: '获取处方列表成功',
            data: {
              prescriptions: [],
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
      
      // 排序
      const sortField = req.query.sortBy || 'prescriptionDate';
      const sortOrder = req.query.order === 'asc' ? 1 : -1;
      const sortOptions = { [sortField]: sortOrder };
      
      // 查询处方列表
      const prescriptions = await Prescription.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions)
        .populate('patientId', 'name gender age idNumber phone')
        .populate('doctorId', 'name title')
        .populate('medicalRecordId', 'recordNumber diagnosisDate')
        .populate('medicines.medicineId', 'name specification code unit price');
      
      // 获取总数
      const total = await Prescription.countDocuments(query);
      
      res.json({
        success: true,
        message: '获取处方列表成功',
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
      logger.error(`获取处方列表异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取处方列表失败，请稍后重试'
      });
    }
  },

  /**
   * 获取处方详情
   */
  async getPrescriptionById(req, res) {
    try {
      const prescriptionId = req.params.id;
      
      if (!prescriptionId) {
        return res.status(400).json({
          success: false,
          message: '处方ID不能为空'
        });
      }
      
      // 查询处方信息
      const prescription = await Prescription.findById(prescriptionId)
        .populate('patientId', 'name gender age idNumber phone address')
        .populate('doctorId', 'name title department')
        .populate('medicalRecordId', 'recordNumber diagnosisDate diagnosis patientId')
        .populate('medicines.medicineId', 'name specification code unit price usage isPrescription');
      
      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: '处方不存在'
        });
      }
      
      res.json({
        success: true,
        message: '获取处方详情成功',
        data: prescription
      });
    } catch (error) {
      logger.error(`获取处方详情异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取处方详情失败，请稍后重试'
      });
    }
  },

  /**
   * 创建处方
   */
  async createPrescription(req, res) {
    try {
      const {
        medicalRecordId,
        patientId,
        doctorId,
        medicines,
        usageInstructions,
        notes
      } = req.body;
      const userId = req.user.id; // 从认证中间件获取当前用户
      
      // 验证必填字段
      const requiredFields = ['medicalRecordId', 'patientId', 'medicines'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `缺少必填字段: ${missingFields.join(', ')}`
        });
      }
      
      // 验证药品列表
      if (!Array.isArray(medicines) || medicines.length === 0) {
        return res.status(400).json({
          success: false,
          message: '药品列表不能为空'
        });
      }
      
      // 验证病历记录是否存在
      const medicalRecord = await MedicalRecord.findById(medicalRecordId);
      if (!medicalRecord) {
        return res.status(400).json({
          success: false,
          message: '病历记录不存在'
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
      
      // 获取当前用户作为医生
      const doctor = await User.findById(userId);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(403).json({
          success: false,
          message: '只有医生可以创建处方'
        });
      }
      
      // 检查药品库存和计算总价
      let totalPrice = 0;
      const validatedMedicines = [];
      
      for (const med of medicines) {
        // 验证药品ID和数量
        if (!med.medicineId || !med.quantity) {
          return res.status(400).json({
            success: false,
            message: '药品信息不完整'
          });
        }
        
        // 查找药品
        const medicine = await Medicine.findById(med.medicineId);
        if (!medicine) {
          return res.status(400).json({
            success: false,
            message: `药品不存在: ${med.medicineId}`
          });
        }
        
        // 检查药品状态
        if (medicine.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: `药品不可用: ${medicine.name}`
          });
        }
        
        // 检查库存
        if (medicine.stock < med.quantity) {
          return res.status(400).json({
            success: false,
            message: `药品库存不足: ${medicine.name}，当前库存: ${medicine.stock}`
          });
        }
        
        // 计算药品总价
        const subtotal = medicine.price * med.quantity;
        totalPrice += subtotal;
        
        // 添加到已验证药品列表
        validatedMedicines.push({
          medicineId: medicine._id,
          quantity: med.quantity,
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          usage: med.usage || medicine.usage,
          price: medicine.price,
          subtotal
        });
      }
      
      // 生成处方号
      const prescriptionNumber = await Prescription.generatePrescriptionNumber();
      
      // 创建处方
      const newPrescription = new Prescription({
        prescriptionNumber,
        medicalRecordId,
        patientId,
        doctorId: userId,
        medicines: validatedMedicines,
        usageInstructions,
        notes,
        totalPrice,
        status: 'pending',
        prescriptionDate: Date.now(),
        createdBy: userId,
        updatedBy: userId
      });
      
      // 保存处方
      await newPrescription.save();
      
      // 记录处方创建日志
      logger.info(`创建处方成功：${prescriptionNumber}，患者：${patient.name}`);
      
      res.status(201).json({
        success: true,
        message: '处方创建成功',
        data: newPrescription
      });
    } catch (error) {
      logger.error(`创建处方异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '处方创建失败，请稍后重试'
      });
    }
  },

  /**
   * 确认处方（配药）
   */
  async confirmPrescription(req, res) {
    try {
      const prescriptionId = req.params.id;
      const userId = req.user.id;
      
      if (!prescriptionId) {
        return res.status(400).json({
          success: false,
          message: '处方ID不能为空'
        });
      }
      
      // 查找处方
      const prescription = await Prescription.findById(prescriptionId);
      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: '处方不存在'
        });
      }
      
      // 检查处方状态
      if (prescription.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: '该处方状态不允许确认'
        });
      }
      
      // 获取当前用户
      const currentUser = await User.findById(userId);
      
      // 检查库存并更新库存
      for (const med of prescription.medicines) {
        const medicine = await Medicine.findById(med.medicineId);
        
        if (!medicine) {
          return res.status(400).json({
            success: false,
            message: `药品不存在: ${med.medicineId}`
          });
        }
        
        // 再次检查库存
        if (medicine.stock < med.quantity) {
          return res.status(400).json({
            success: false,
            message: `药品库存不足: ${medicine.name}，当前库存: ${medicine.stock}`
          });
        }
        
        // 更新库存
        await medicine.updateStock(-med.quantity, 'out', `处方配药: ${prescription.prescriptionNumber}`);
      }
      
      // 更新处方状态
      prescription.status = 'dispensed';
      prescription.dispenseTime = Date.now();
      prescription.dispensedBy = userId;
      prescription.updatedBy = userId;
      prescription.updateTime = Date.now();
      
      await prescription.save();
      logger.info(`处方配药成功：${prescription.prescriptionNumber}，操作人：${currentUser.name}`);
      
      res.json({
        success: true,
        message: '处方配药成功',
        data: prescription
      });
    } catch (error) {
      logger.error(`确认处方异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '处方确认失败，请稍后重试'
      });
    }
  },

  /**
   * 取消处方
   */
  async cancelPrescription(req, res) {
    try {
      const prescriptionId = req.params.id;
      const { reason } = req.body;
      const userId = req.user.id;
      
      if (!prescriptionId) {
        return res.status(400).json({
          success: false,
          message: '处方ID不能为空'
        });
      }
      
      // 查找处方
      const prescription = await Prescription.findById(prescriptionId);
      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: '处方不存在'
        });
      }
      
      // 检查处方状态
      if (prescription.status === 'canceled') {
        return res.status(400).json({
          success: false,
          message: '该处方已取消'
        });
      }
      
      if (prescription.status === 'dispensed') {
        return res.status(400).json({
          success: false,
          message: '已配药的处方不能取消'
        });
      }
      
      // 更新处方状态
      prescription.status = 'canceled';
      prescription.cancelReason = reason || '';
      prescription.cancelTime = Date.now();
      prescription.updatedBy = userId;
      prescription.updateTime = Date.now();
      
      await prescription.save();
      logger.info(`取消处方成功：${prescription.prescriptionNumber}，原因：${reason || '未提供'}`);
      
      res.json({
        success: true,
        message: '处方取消成功',
        data: prescription
      });
    } catch (error) {
      logger.error(`取消处方异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '处方取消失败，请稍后重试'
      });
    }
  },

  /**
   * 获取患者的处方历史
   */
  async getPatientPrescriptionHistory(req, res) {
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
      
      // 查询患者的所有处方，按处方日期降序排列
      const prescriptions = await Prescription.find({ patientId })
        .sort({ prescriptionDate: -1 })
        .populate('doctorId', 'name title department')
        .populate('medicalRecordId', 'recordNumber diagnosisDate')
        .populate('medicines.medicineId', 'name specification code unit price');
      
      res.json({
        success: true,
        message: '获取患者处方历史成功',
        data: {
          patient: {
            id: patient._id,
            name: patient.name,
            idNumber: patient.idNumber
          },
          prescriptions,
          totalPrescriptions: prescriptions.length
        }
      });
    } catch (error) {
      logger.error(`获取患者处方历史异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取患者处方历史失败，请稍后重试'
      });
    }
  },

  /**
   * 获取处方统计信息
   */
  async getPrescriptionStatistics(req, res) {
    try {
      const { startDate, endDate, departmentId, doctorId } = req.query;
      
      // 构建查询条件
      const query = {};
      
      // 日期范围
      if (startDate && endDate) {
        query.prescriptionDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      // 医生过滤
      if (doctorId) {
        query.doctorId = doctorId;
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
            message: '获取处方统计信息成功',
            data: {
              totalPrescriptions: 0,
              statusStats: [],
              doctorStats: [],
              medicineStats: [],
              totalRevenue: 0
            }
          });
        }
      }
      
      // 统计总数
      const totalPrescriptions = await Prescription.countDocuments(query);
      
      // 按状态统计
      const statusStats = await Prescription.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // 按医生统计
      const doctorStats = await Prescription.aggregate([
        { $match: query },
        { $group: { _id: '$doctorId', count: { $sum: 1 }, totalRevenue: { $sum: '$totalPrice' } } }
      ]);
      
      // 填充医生信息
      for (const stat of doctorStats) {
        const doctor = await User.findById(stat._id);
        if (doctor) {
          stat.doctorName = doctor.name;
          stat.department = doctor.department;
        }
      }
      
      // 统计药品使用情况
      const medicineStats = await Prescription.aggregate([
        { $match: query },
        { $unwind: '$medicines' },
        { $group: { 
          _id: '$medicines.medicineId', 
          count: { $sum: 1 }, 
          totalQuantity: { $sum: '$medicines.quantity' },
          totalRevenue: { $sum: '$medicines.subtotal' }
        }},
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 } // 只取前10个最常用的药品
      ]);
      
      // 填充药品信息
      for (const stat of medicineStats) {
        const medicine = await Medicine.findById(stat._id);
        if (medicine) {
          stat.medicineName = medicine.name;
          stat.medicineCode = medicine.code;
          stat.specification = medicine.specification;
        }
      }
      
      // 计算总收入
      const totalRevenue = await Prescription.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);
      
      res.json({
        success: true,
        message: '获取处方统计信息成功',
        data: {
          totalPrescriptions,
          statusStats,
          doctorStats,
          medicineStats,
          totalRevenue: totalRevenue[0]?.total || 0
        }
      });
    } catch (error) {
      logger.error(`获取处方统计信息异常：${error.message}`, { error });
      res.status(500).json({
        success: false,
        message: '获取处方统计信息失败，请稍后重试'
      });
    }
  }
};

module.exports = prescriptionController;