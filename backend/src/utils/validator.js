/**
 * 验证工具模块
 * 用于请求参数验证和数据校验
 */

const { body, validationResult } = require('express-validator');

/**
 * 处理验证结果的中间件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件函数
 * @returns {Object} 验证失败时返回错误信息，成功时调用next()
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '请求参数验证失败',
      errors: errors.array()
    });
  }
  next();
};

/**
 * 验证规则集合
 */
const validationRules = {
  // 用户登录验证
  login: [
    body('username')
      .notEmpty()
      .withMessage('用户名不能为空'),
    body('password')
      .notEmpty()
      .withMessage('密码不能为空')
  ],

  // 用户创建验证
  createUser: [
    body('username')
      .notEmpty()
      .withMessage('用户名不能为空')
      .isLength({ min: 3, max: 20 })
      .withMessage('用户名长度必须在3-20个字符之间'),
    body('password')
      .notEmpty()
      .withMessage('密码不能为空')
      .isLength({ min: 6 })
      .withMessage('密码长度至少为6个字符'),
    body('fullName')
      .notEmpty()
      .withMessage('姓名不能为空'),
    body('role')
      .notEmpty()
      .withMessage('角色不能为空')
      .isIn(['admin', 'doctor', 'nurse', 'pharmacist', 'receptionist'])
      .withMessage('无效的角色'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('邮箱格式无效')
      .normalizeEmail(),
    body('phone')
      .optional()
      .isMobilePhone('zh-CN')
      .withMessage('手机号格式无效')
      .trim()
      .escape()
  ],

  // 患者创建验证
  createPatient: [
    body('fullName')
      .notEmpty()
      .withMessage('患者姓名不能为空'),
    body('gender')
      .notEmpty()
      .withMessage('性别不能为空')
      .isIn(['male', 'female', 'other'])
      .withMessage('无效的性别'),
    body('birthDate')
      .notEmpty()
      .withMessage('出生日期不能为空')
      .isISO8601()
      .withMessage('出生日期格式无效'),
    body('idCard')
      .optional()
      .isLength({ min: 15, max: 18 })
      .withMessage('身份证号码长度无效'),
    body('phone')
      .notEmpty()
      .withMessage('联系电话不能为空')
      .isMobilePhone('zh-CN')
      .withMessage('手机号格式无效')
      .trim()
      .escape(),
    body('address')
      .optional()
      .trim()
      .escape()
  ],

  // 挂号验证
  createRegistration: [
    body('patientId')
      .notEmpty()
      .withMessage('患者ID不能为空'),
    body('departmentId')
      .notEmpty()
      .withMessage('科室ID不能为空'),
    body('doctorId')
      .notEmpty()
      .withMessage('医生ID不能为空'),
    body('registrationType')
      .notEmpty()
      .withMessage('挂号类型不能为空')
      .isIn(['普通', '专家', '急诊'])
      .withMessage('无效的挂号类型'),
    body('visitDate')
      .notEmpty()
      .withMessage('就诊日期不能为空')
      .isISO8601()
      .withMessage('就诊日期格式无效')
  ],

  // 病历验证
  createMedicalRecord: [
    body('patientId')
      .notEmpty()
      .withMessage('患者ID不能为空'),
    body('doctorId')
      .notEmpty()
      .withMessage('医生ID不能为空'),
    body('chiefComplaint')
      .notEmpty()
      .withMessage('主诉不能为空')
      .trim()
      .escape(),
    body('presentIllness')
      .notEmpty()
      .withMessage('现病史不能为空')
      .trim()
      .escape(),
    body('pastHistory')
      .optional()
      .trim()
      .escape(),
    body('diagnosis')
      .notEmpty()
      .withMessage('诊断不能为空')
      .trim()
      .escape()
  ],

  // 处方验证
  createPrescription: [
    body('patientId')
      .notEmpty()
      .withMessage('患者ID不能为空'),
    body('doctorId')
      .notEmpty()
      .withMessage('医生ID不能为空'),
    body('items')
      .notEmpty()
      .withMessage('处方项目不能为空')
      .isArray({ min: 1 })
      .withMessage('处方项目必须是非空数组'),
    body('items.*.medicineId')
      .notEmpty()
      .withMessage('药品ID不能为空'),
    body('items.*.dosage')
      .notEmpty()
      .withMessage('剂量不能为空')
      .trim()
      .escape(),
    body('items.*.frequency')
      .notEmpty()
      .withMessage('频次不能为空')
      .trim()
      .escape(),
    body('items.*.duration')
      .notEmpty()
      .withMessage('用药时长不能为空')
      .isInt({ min: 1 })
      .withMessage('用药时长必须是正整数')
  ],

  // 药品验证
  createMedicine: [
    body('name')
      .notEmpty()
      .withMessage('药品名称不能为空')
      .trim()
      .escape(),
    body('specification')
      .notEmpty()
      .withMessage('规格不能为空')
      .trim()
      .escape(),
    body('unit')
      .notEmpty()
      .withMessage('单位不能为空')
      .trim()
      .escape(),
    body('price')
      .notEmpty()
      .withMessage('价格不能为空')
      .isFloat({ min: 0 })
      .withMessage('价格必须是非负数'),
    body('stock')
      .notEmpty()
      .withMessage('库存不能为空')
      .isInt({ min: 0 })
      .withMessage('库存必须是非负整数'),
    body('category')
      .notEmpty()
      .withMessage('分类不能为空')
      .trim()
      .escape()
  ],

  // 检查项目验证
  createExamItem: [
    body('name')
      .notEmpty()
      .withMessage('检查项目名称不能为空')
      .trim()
      .escape(),
    body('category')
      .notEmpty()
      .withMessage('分类不能为空')
      .trim()
      .escape(),
    body('price')
      .notEmpty()
      .withMessage('价格不能为空')
      .isFloat({ min: 0 })
      .withMessage('价格必须是非负数'),
    body('description')
      .optional()
      .trim()
      .escape()
  ],

  // 科室验证
  createDepartment: [
    body('name')
      .notEmpty()
      .withMessage('科室名称不能为空')
      .trim()
      .escape(),
    body('description')
      .optional()
      .trim()
      .escape()
  ]
};

/**
 * 自定义验证函数
 */
const customValidators = {
  /**
   * 检查字符串是否是有效的MongoDB ObjectId
   * @param {string} value - 要验证的值
   * @returns {boolean} 验证结果
   */
  isValidObjectId: (value) => {
    const { ObjectId } = require('mongoose').Types;
    return ObjectId.isValid(value) && new ObjectId(value).toString() === value;
  },

  /**
   * 检查日期是否是未来日期
   * @param {string|Date} value - 要验证的日期
   * @returns {boolean} 验证结果
   */
  isFutureDate: (value) => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  },

  /**
   * 检查字符串是否只包含中文字符
   * @param {string} value - 要验证的值
   * @returns {boolean} 验证结果
   */
  isChinese: (value) => {
    const chineseRegex = /^[\u4e00-\u9fa5]+$/;
    return chineseRegex.test(value);
  }
};

module.exports = {
  handleValidationErrors,
  validationRules,
  customValidators
};