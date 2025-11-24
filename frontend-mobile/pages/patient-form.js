import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/PatientForm.module.css';

// 增强的表单数据
const initialFormData = {
  // 基本信息
  name: '',
  gender: '',
  age: '',
  idCard: '',
  phone: '',
  address: '',
  bloodType: '',
  height: '',
  weight: '',
  
  // 健康信息
  medicalHistory: '',
  allergyHistory: '',
  temperature: '',
  bloodPressure: '',
  pulseRate: '',
  respiratoryRate: '',
  
  // 就诊信息
  chiefComplaint: '',
  symptoms: '',
  visitType: 'regular',
  priority: 'medium',
  
  // 联系人信息
  contactName: '',
  contactPhone: '',
  relationship: '',
  
  // 保险信息
  insuranceType: '',
  insuranceNumber: ''
};

// 错误信息初始状态
const initialErrors = {};

export default function PatientForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // 表单变更处理
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    
    // 清除对应的错误信息
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 分步表单验证
  const validateStep = (step) => {
    const newErrors = { ...errors };
    
    if (step === 1) {
      // 基本信息验证
      if (!formData.name.trim()) newErrors.name = '请输入患者姓名';
      if (!formData.gender) newErrors.gender = '请选择性别';
      if (!formData.age.trim()) newErrors.age = '请输入年龄';
      else if (isNaN(formData.age) || parseInt(formData.age) < 0 || parseInt(formData.age) > 120) {
        newErrors.age = '请输入有效年龄（0-120岁）';
      }
      if (!formData.idCard.trim()) newErrors.idCard = '请输入身份证号';
      else {
        const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if (!idCardRegex.test(formData.idCard)) {
          newErrors.idCard = '请输入有效的身份证号';
        }
      }
      if (!formData.phone.trim()) newErrors.phone = '请输入联系电话';
      else {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
          newErrors.phone = '请输入有效的手机号';
        }
      }
    } else if (step === 2) {
      // 健康信息验证
      // 体温验证 (可选但需要有效性检查)
      if (formData.temperature && (isNaN(formData.temperature) || parseFloat(formData.temperature) < 35 || parseFloat(formData.temperature) > 42)) {
        newErrors.temperature = '请输入有效的体温（35-42℃）';
      }
      // 血压格式检查 (可选)
      if (formData.bloodPressure && !/^\d{2,3}\/\d{2,3}$/.test(formData.bloodPressure)) {
        newErrors.bloodPressure = '请输入正确的血压格式（如：120/80）';
      }
    } else if (step === 3) {
      // 就诊信息验证
      if (!formData.chiefComplaint.trim()) newErrors.chiefComplaint = '请输入主诉';
    } else if (step === 4) {
      // 联系和保险信息验证
      if (!formData.contactName.trim()) newErrors.contactName = '请输入联系人姓名';
      if (!formData.contactPhone.trim()) newErrors.contactPhone = '请输入联系人电话';
      else {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(formData.contactPhone)) {
          newErrors.contactPhone = '请输入有效的手机号';
        }
      }
      if (!formData.relationship.trim()) newErrors.relationship = '请输入与联系人关系';
    }
    
    setErrors(newErrors);
    
    // 检查当前步骤的错误
    const stepFields = getStepFields(step);
    return stepFields.every(field => !newErrors[field]);
  };
  
  // 获取当前步骤的字段列表
  const getStepFields = (step) => {
    switch(step) {
      case 1:
        return ['name', 'gender', 'age', 'idCard', 'phone'];
      case 2:
        return ['temperature', 'bloodPressure'];
      case 3:
        return ['chiefComplaint'];
      case 4:
        return ['contactName', 'contactPhone', 'relationship'];
      default:
        return [];
    }
  };
  
  // 完整表单验证
  const validateForm = () => {
    let isValid = true;
    
    // 验证所有步骤
    for (let i = 1; i <= 4; i++) {
      if (!validateStep(i)) {
        isValid = false;
      }
    }
    
    return isValid;
  };

  // 下一步处理
  const handleNext = () => {
    setShowValidationErrors(true);
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // 上一步处理
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 提交表单
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      // 模拟提交到服务器
      setTimeout(() => {
        console.log('提交患者信息:', formData);
        setLoading(false);
        setSubmitted(true);
      }, 1500);
    }
  };

  // 重置表单
  const handleReset = () => {
    setFormData(initialFormData);
    setErrors(initialErrors);
    setSubmitted(false);
    setCurrentStep(1);
    setShowValidationErrors(false);
  };
  
  // 渲染步骤指示器
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: '基本信息' },
      { number: 2, label: '健康信息' },
      { number: 3, label: '就诊信息' },
      { number: 4, label: '联系信息' }
    ];
    
    return (
      <div className={styles.stepIndicator}>
        {steps.map((step) => (
          <div key={step.number} className={`${styles.step} ${currentStep >= step.number ? styles.activeStep : ''}`}>
            <div className={`${styles.stepNumber} ${currentStep >= step.number ? styles.activeStepNumber : ''}`}>
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <div className={`${styles.stepLabel} ${currentStep >= step.number ? styles.activeStepLabel : ''}`}>
              {step.label}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染表单组
  const renderFormGroup = (label, name, type = 'text', placeholder = '', required = false, rows = 1, options = null) => {
    const isError = showValidationErrors && errors[name];
    
    if (type === 'select' && options) {
      return (
        <div className={styles.formGroup}>
          <label className={styles.label}>{label} {required && <span className={styles.required}>*</span>}</label>
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`${styles.select} ${isError ? styles.inputError : ''}`}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {isError && <span className={styles.errorText}>{errors[name]}</span>}
        </div>
      );
    }
    
    if (type === 'textarea') {
      return (
        <div className={styles.formGroup}>
          <label className={styles.label}>{label} {required && <span className={styles.required}>*</span>}</label>
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`${styles.textarea} ${isError ? styles.inputError : ''}`}
            placeholder={placeholder}
            rows={rows}
          ></textarea>
          {isError && <span className={styles.errorText}>{errors[name]}</span>}
        </div>
      );
    }
    
    return (
      <div className={styles.formGroup}>
        <label className={styles.label}>{label} {required && <span className={styles.required}>*</span>}</label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`${styles.input} ${isError ? styles.inputError : ''}`}
          placeholder={placeholder}
          {...(type === 'number' ? { min: 0, step: 0.1 } : {})}
        />
        {isError && <span className={styles.errorText}>{errors[name]}</span>}
      </div>
    );
  };

  // 成功页面渲染
  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>← 返回</Link>
          <h1 className={styles.title}>患者信息录入</h1>
          <div className={styles.placeholder}></div>
        </div>
        
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>信息录入成功</h2>
          <p className={styles.successMessage}>患者信息已成功提交</p>
          <p className={styles.successTips}>PC端管理员将进行审核，请耐心等待</p>
          
          <div className={styles.actionButtons}>
            <Link href="/" className={styles.backButton}>返回首页</Link>
            <button onClick={handleReset} className={styles.viewButton}>新增患者</button>
          </div>
        </div>
      </div>
    );
  }

  // 表单页面渲染
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" legacyBehavior>
          <a className={styles.backLink}>← 返回</a>
        </Link>
        <h1 className={styles.title}>患者信息录入</h1>
        <div className={styles.placeholder}></div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {renderStepIndicator()}
        
        {/* 步骤1: 基本信息 */}
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>基本信息</h2>
            
            {renderFormGroup('患者姓名', 'name', 'text', '请输入患者姓名', true)}
            
            <div className={styles.formGroup}>
              <label className={styles.label}>性别 <span className={styles.required}>*</span></label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gender"
                    value="男"
                    checked={formData.gender === '男'}
                    onChange={handleChange}
                  />
                  <span className={styles.radioText}>男</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gender"
                    value="女"
                    checked={formData.gender === '女'}
                    onChange={handleChange}
                  />
                  <span className={styles.radioText}>女</span>
                </label>
              </div>
              {showValidationErrors && errors.gender && <span className={styles.errorText}>{errors.gender}</span>}
            </div>
            
            {renderFormGroup('年龄', 'age', 'number', '请输入年龄', true)}
            {renderFormGroup('身份证号', 'idCard', 'text', '请输入身份证号', true)}
            {renderFormGroup('联系电话', 'phone', 'tel', '请输入联系电话', true)}
            {renderFormGroup('居住地址', 'address', 'text', '请输入居住地址')}
            {renderFormGroup('血型', 'bloodType', 'select', '', false, 1, 
              [{value: '', label: '请选择血型'}, {value: 'A', label: 'A'}, {value: 'B', label: 'B'}, 
               {value: 'AB', label: 'AB'}, {value: 'O', label: 'O'}, {value: '其他', label: '其他'}]
            )}
            {renderFormGroup('身高 (cm)', 'height', 'number', '请输入身高')}
            {renderFormGroup('体重 (kg)', 'weight', 'number', '请输入体重')}
          </div>
        )}
        
        {/* 步骤2: 健康信息 */}
        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>健康信息</h2>
            
            {renderFormGroup('体温 (℃)', 'temperature', 'number', '请输入体温')}
            {renderFormGroup('血压', 'bloodPressure', 'text', '请输入血压（如：120/80）')}
            {renderFormGroup('脉搏 (次/分)', 'pulseRate', 'number', '请输入脉搏')}
            {renderFormGroup('呼吸频率 (次/分)', 'respiratoryRate', 'number', '请输入呼吸频率')}
            {renderFormGroup('既往病史', 'medicalHistory', 'textarea', '请详细描述既往病史', false, 4)}
            {renderFormGroup('过敏史', 'allergyHistory', 'textarea', '请详细描述过敏史（药物、食物等）', false, 4)}
          </div>
        )}
        
        {/* 步骤3: 就诊信息 */}
        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>就诊信息</h2>
            
            {renderFormGroup('主诉', 'chiefComplaint', 'text', '请简述主要症状', true)}
            {renderFormGroup('症状详情', 'symptoms', 'textarea', '请详细描述症状表现、持续时间等', false, 4)}
            
            <div className={styles.formGroup}>
              <label className={styles.label}>就诊类型 <span className={styles.required}>*</span></label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="regular">普通门诊</option>
                <option value="followup">复诊</option>
                <option value="specialist">专科门诊</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>优先级 <span className={styles.required}>*</span></label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>
        )}
        
        {/* 步骤4: 联系和保险信息 */}
        {currentStep === 4 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>联系与保险信息</h2>
            
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>紧急联系人</h3>
              {renderFormGroup('联系人姓名', 'contactName', 'text', '请输入联系人姓名', true)}
              {renderFormGroup('联系人电话', 'contactPhone', 'tel', '请输入联系人电话', true)}
              {renderFormGroup('与患者关系', 'relationship', 'select', '', true, 1,
                [{value: '', label: '请选择关系'}, {value: '父母', label: '父母'},
                 {value: '配偶', label: '配偶'}, {value: '子女', label: '子女'},
                 {value: '兄弟姐妹', label: '兄弟姐妹'}, {value: '朋友', label: '朋友'},
                 {value: '同事', label: '同事'}, {value: '其他', label: '其他'}]
              )}
            </div>
            
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>保险信息</h3>
              {renderFormGroup('保险类型', 'insuranceType', 'text', '如：医保、商业保险等')}
              {renderFormGroup('保险号码', 'insuranceNumber', 'text', '请输入保险号码')}
            </div>
          </div>
        )}
        
        {/* 导航按钮 */}
        <div className={styles.navigationButtons}>
          {currentStep > 1 && (
            <button 
              type="button" 
              className={styles.prevButton}
              onClick={handlePrevious}
              disabled={loading}
            >
              上一步
            </button>
          )}
          
          {currentStep < 4 ? (
            <button 
              type="button" 
              className={styles.nextButton}
              onClick={handleNext}
              disabled={loading}
            >
              下一步
            </button>
          ) : (
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? '提交中...' : '提交信息'}
            </button>
          )}
        </div>
        
        {/* 重置按钮 */}
        <div className={styles.resetContainer}>
          <button 
            type="button" 
            className={styles.resetButton}
            onClick={handleReset}
            disabled={loading}
          >
            重置表单
          </button>
        </div>
      </form>

      <div className={styles.notice}>
        <p>温馨提示：</p>
        <ul>
          <li>请确保填写的患者信息真实有效</li>
          <li>带*号的字段为必填项</li>
          <li>提交后将等待PC端管理员审核</li>
          <li>如有疑问，请联系医院客服</li>
        </ul>
      </div>
    </div>
  );
}