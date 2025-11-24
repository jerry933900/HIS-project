import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Appointment.module.css';

// 模拟科室数据
const departments = [
  { id: 1, name: '内科' },
  { id: 2, name: '外科' },
  { id: 3, name: '儿科' },
  { id: 4, name: '妇产科' },
  { id: 5, name: '眼科' },
  { id: 6, name: '口腔科' },
  { id: 7, name: '皮肤科' },
  { id: 8, name: '神经内科' },
];

// 模拟医生数据
const doctors = [
  { id: 1, name: '张医生', department: 1, specialty: '心脏内科', rating: 4.9 },
  { id: 2, name: '李医生', department: 2, specialty: '普外科', rating: 4.8 },
  { id: 3, name: '王医生', department: 3, specialty: '儿科综合', rating: 4.7 },
  { id: 4, name: '刘医生', department: 1, specialty: '消化内科', rating: 4.6 },
  { id: 5, name: '陈医生', department: 2, specialty: '骨科', rating: 4.5 },
  { id: 6, name: '赵医生', department: 4, specialty: '产科', rating: 4.9 },
];

// 生成未来7天的日期选项
const generateDateOptions = () => {
  const options = [];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];
    
    options.push({ value: formattedDate, label: `${formattedDate} (${weekDay})` });
  }
  
  return options;
};

// 时间段选项
const timeSlots = [
  { value: '08:00', label: '08:00 - 09:00' },
  { value: '09:00', label: '09:00 - 10:00' },
  { value: '10:00', label: '10:00 - 11:00' },
  { value: '11:00', label: '11:00 - 12:00' },
  { value: '14:00', label: '14:00 - 15:00' },
  { value: '15:00', label: '15:00 - 16:00' },
  { value: '16:00', label: '16:00 - 17:00' },
  { value: '17:00', label: '17:00 - 18:00' },
];

const Appointment = () => {
  const [formData, setFormData] = useState({
    departmentId: '',
    doctorId: '',
    date: '',
    timeSlot: '',
    symptoms: '',
    patientName: '',
    patientPhone: '',
    patientId: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const dateOptions = generateDateOptions();
  
  // 根据选择的科室过滤医生
  const filteredDoctors = formData.departmentId 
    ? doctors.filter(doctor => doctor.department === parseInt(formData.departmentId))
    : [];
  
  // 表单验证
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.departmentId) newErrors.departmentId = '请选择科室';
    if (!formData.doctorId) newErrors.doctorId = '请选择医生';
    if (!formData.date) newErrors.date = '请选择预约日期';
    if (!formData.timeSlot) newErrors.timeSlot = '请选择预约时间';
    if (!formData.symptoms) newErrors.symptoms = '请描述症状';
    if (!formData.patientName) newErrors.patientName = '请输入患者姓名';
    if (!formData.patientPhone) newErrors.patientPhone = '请输入联系电话';
    else if (!/^1[3-9]\d{9}$/.test(formData.patientPhone)) newErrors.patientPhone = '请输入正确的手机号码';
    if (!formData.patientId) newErrors.patientId = '请输入身份证号';
    else if (!/^\d{17}[\dXx]$/.test(formData.patientId)) newErrors.patientId = '请输入正确的身份证号';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // 模拟API调用
      setTimeout(() => {
        console.log('预约数据提交:', formData);
        setIsSubmitting(false);
        setSubmissionSuccess(true);
        
        // 5秒后重置表单
        setTimeout(() => {
          setSubmissionSuccess(false);
          setFormData({
            departmentId: '',
            doctorId: '',
            date: '',
            timeSlot: '',
            symptoms: '',
            patientName: '',
            patientPhone: '',
            patientId: '',
          });
        }, 5000);
      }, 1500);
    }
  };
  
  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 如果切换科室，重置医生选择
    if (name === 'departmentId') {
      setFormData({
        ...formData,
        [name]: value,
        doctorId: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  if (submissionSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>预约提交成功！</h2>
          <p className={styles.successMessage}>您的预约申请已提交，等待PC端管理员审核</p>
          <p className={styles.successTips}>预计1-2个工作日内完成审核，请耐心等待</p>
          <Link href="/" className={styles.backButton}>返回首页</Link>
          <Link href="/appointments" className={styles.viewButton}>查看预约记录</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>← 返回</Link>
        <h1 className={styles.title}>预约挂号</h1>
        <div className={styles.placeholder}></div>
      </header>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 科室选择 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>选择科室 <span className={styles.required}>*</span></label>
          <select
            name="departmentId"
            value={formData.departmentId}
            onChange={handleChange}
            className={`${styles.select} ${errors.departmentId ? styles.inputError : ''}`}
            required
          >
            <option value="">请选择科室</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          {errors.departmentId && <span className={styles.errorText}>{errors.departmentId}</span>}
        </div>
        
        {/* 医生选择 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>选择医生 <span className={styles.required}>*</span></label>
          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            className={`${styles.select} ${errors.doctorId ? styles.inputError : ''}`}
            disabled={!formData.departmentId}
            required
          >
            <option value="">请选择医生</option>
            {filteredDoctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.specialty}</option>
            ))}
          </select>
          {errors.doctorId && <span className={styles.errorText}>{errors.doctorId}</span>}
        </div>
        
        {/* 预约日期 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>预约日期 <span className={styles.required}>*</span></label>
          <select
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`${styles.select} ${errors.date ? styles.inputError : ''}`}
            required
          >
            <option value="">请选择日期</option>
            {dateOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.date && <span className={styles.errorText}>{errors.date}</span>}
        </div>
        
        {/* 预约时间 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>预约时间 <span className={styles.required}>*</span></label>
          <div className={styles.timeSlots}>
            {timeSlots.map(slot => (
              <button
                type="button"
                key={slot.value}
                className={`${styles.timeSlot} ${formData.timeSlot === slot.value ? styles.timeSlotSelected : ''}`}
                onClick={() => handleChange({ target: { name: 'timeSlot', value: formData.timeSlot === slot.value ? '' : slot.value } })}
              >
                {slot.label}
              </button>
            ))}
          </div>
          {errors.timeSlot && <span className={styles.errorText}>{errors.timeSlot}</span>}
        </div>
        
        {/* 症状描述 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>症状描述 <span className={styles.required}>*</span></label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            className={`${styles.textarea} ${errors.symptoms ? styles.inputError : ''}`}
            placeholder="请简要描述您的症状和就诊需求"
            rows={4}
            required
          ></textarea>
          {errors.symptoms && <span className={styles.errorText}>{errors.symptoms}</span>}
        </div>
        
        {/* 患者信息 */}
        <div className={styles.sectionTitle}>患者信息</div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>患者姓名 <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            className={`${styles.input} ${errors.patientName ? styles.inputError : ''}`}
            placeholder="请输入真实姓名"
            required
          />
          {errors.patientName && <span className={styles.errorText}>{errors.patientName}</span>}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>联系电话 <span className={styles.required}>*</span></label>
          <input
            type="tel"
            name="patientPhone"
            value={formData.patientPhone}
            onChange={handleChange}
            className={`${styles.input} ${errors.patientPhone ? styles.inputError : ''}`}
            placeholder="请输入手机号码"
            required
          />
          {errors.patientPhone && <span className={styles.errorText}>{errors.patientPhone}</span>}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>身份证号 <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className={`${styles.input} ${errors.patientId ? styles.inputError : ''}`}
            placeholder="请输入身份证号码"
            required
          />
          {errors.patientId && <span className={styles.errorText}>{errors.patientId}</span>}
        </div>
        
        {/* 提交按钮 */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? '提交中...' : '提交预约申请'}
        </button>
        
        {/* 温馨提示 */}
        <div className={styles.notice}>
          <p>温馨提示：</p>
          <ul>
            <li>请确保填写真实有效的个人信息</li>
            <li>预约成功后，请在就诊当天提前30分钟到达医院</li>
            <li>如需取消预约，请提前24小时操作</li>
            <li>您的预约申请需要PC端管理员审核通过后才能生效</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default Appointment;