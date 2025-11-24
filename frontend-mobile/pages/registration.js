import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Registration.module.css';

export default function RegistrationPage() {
  const router = useRouter();
  const doctorId = router.query.doctorId;
  
  // 状态管理
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // 生成未来7天的日期选项
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
      
      dates.push({
        value: `${year}-${month}-${day}`,
        label: `${month}-${day} ${weekDay}`
      });
    }
    
    return dates;
  };
  
  // 生成时间段选项
  const timeSlots = [
    { value: '08:00', label: '08:00', available: true },
    { value: '08:30', label: '08:30', available: true },
    { value: '09:00', label: '09:00', available: false },
    { value: '09:30', label: '09:30', available: true },
    { value: '10:00', label: '10:00', available: true },
    { value: '10:30', label: '10:30', available: false },
    { value: '11:00', label: '11:00', available: true },
    { value: '14:00', label: '14:00', available: true },
    { value: '14:30', label: '14:30', available: true },
    { value: '15:00', label: '15:00', available: true },
    { value: '15:30', label: '15:30', available: false },
    { value: '16:00', label: '16:00', available: true },
    { value: '16:30', label: '16:30', available: true },
    { value: '17:00', label: '17:00', available: true }
  ];
  
  // 模拟医生数据
  const mockDoctors = [
    { 
      id: 1, 
      name: '张医生', 
      title: '主任医师', 
      department: '心血管内科',
      hospital: '北京协和医院',
      rating: 4.9, 
      price: 100,
      avatar: 'https://via.placeholder.com/100?text=张'
    },
    { 
      id: 2, 
      name: '李医生', 
      title: '副主任医师', 
      department: '消化内科',
      hospital: '北京协和医院',
      rating: 4.8, 
      price: 80,
      avatar: 'https://via.placeholder.com/100?text=李'
    },
    { 
      id: 3, 
      name: '王医生', 
      title: '主治医师', 
      department: '骨科',
      hospital: '北京大学第一医院',
      rating: 4.7, 
      price: 60,
      avatar: 'https://via.placeholder.com/100?text=王'
    },
    { 
      id: 4, 
      name: '赵医生', 
      title: '主任医师', 
      department: '妇产科',
      hospital: '北京妇产医院',
      rating: 4.9, 
      price: 90,
      avatar: 'https://via.placeholder.com/100?text=赵'
    },
    { 
      id: 5, 
      name: '刘医生', 
      title: '副主任医师', 
      department: '儿科',
      hospital: '北京儿童医院',
      rating: 4.8, 
      price: 70,
      avatar: 'https://via.placeholder.com/100?text=刘'
    }
  ];
  
  // 获取医生信息
  useEffect(() => {
    if (doctorId) {
      const doctor = mockDoctors.find(d => d.id === parseInt(doctorId));
      setDoctorInfo(doctor || mockDoctors[0]); // 默认使用第一位医生
    } else {
      setDoctorInfo(mockDoctors[0]);
    }
    
    // 默认选择今天
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  }, [doctorId]);
  
  const dateOptions = generateDateOptions();
  
  // 表单提交处理
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 简单的表单验证
    if (!selectedDate || !selectedTime || !name || !phone || !idNumber) {
      alert('请填写完整信息');
      return;
    }
    
    setIsSubmitting(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      setIsSubmitting(false);
      setRegistrationSuccess(true);
      
      // 5秒后重置页面或跳转
      setTimeout(() => {
        router.push('/');
      }, 5000);
    }, 1500);
  };
  
  if (!doctorInfo) {
    return <div className={styles.loading}>加载中...</div>;
  }
  
  if (registrationSuccess) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✅</div>
        <h2 className={styles.successTitle}>预约成功！</h2>
        <div className={styles.successInfo}>
          <p><strong>医生：</strong>{doctorInfo.name} {doctorInfo.title}</p>
          <p><strong>时间：</strong>{selectedDate} {selectedTime}</p>
          <p><strong>费用：</strong>¥{doctorInfo.price}</p>
        </div>
        <p className={styles.successTip}>请按时前往就诊，祝您早日康复！</p>
        <div className={styles.successActions}>
          <Link href="/" className={styles.backHomeButton}>返回首页</Link>
          <Link href="/doctors" className={styles.viewDoctorsButton}>查看更多医生</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <h1 className={styles.title}>预约挂号</h1>
      </div>
      
      {/* 医生信息卡片 */}
      <div className={styles.doctorCard}>
        <div className={styles.doctorInfo}>
          <div className={styles.avatarContainer}>
            <img src={doctorInfo.avatar} alt={doctorInfo.name} className={styles.avatar} />
          </div>
          <div className={styles.doctorDetails}>
            <div className={styles.doctorNameRow}>
              <h2 className={styles.doctorName}>{doctorInfo.name}</h2>
              <span className={styles.doctorTitle}>{doctorInfo.title}</span>
            </div>
            <p className={styles.doctorDepartment}>{doctorInfo.department}</p>
            <p className={styles.doctorHospital}>{doctorInfo.hospital}</p>
            <div className={styles.doctorPrice}>¥{doctorInfo.price}/次</div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.registrationForm}>
        {/* 选择日期 */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>选择日期</h3>
          <div className={styles.dateSelector}>
            {dateOptions.map(date => (
              <button
                key={date.value}
                type="button"
                className={`${styles.dateOption} ${selectedDate === date.value ? styles.selectedDate : ''}`}
                onClick={() => setSelectedDate(date.value)}
              >
                {date.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 选择时间 */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>选择时间</h3>
          <div className={styles.timeSelector}>
            {timeSlots.map(time => (
              <button
                key={time.value}
                type="button"
                className={`${styles.timeOption} ${selectedTime === time.value ? styles.selectedTime : ''} ${!time.available ? styles.unavailableTime : ''}`}
                onClick={() => time.available && setSelectedTime(time.value)}
                disabled={!time.available}
              >
                {time.label}
                {!time.available && <span className={styles.unavailableText}>已约满</span>}
              </button>
            ))}
          </div>
        </div>
        
        {/* 患者信息 */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>患者信息</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>姓名 *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入真实姓名"
              className={styles.formInput}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.formLabel}>手机号码 *</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号码"
              className={styles.formInput}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="idNumber" className={styles.formLabel}>身份证号 *</label>
            <input
              type="text"
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="请输入身份证号码"
              className={styles.formInput}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="symptoms" className={styles.formLabel}>症状描述</label>
            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="请简要描述您的症状（选填）"
              className={styles.formTextarea}
              rows={3}
            />
          </div>
        </div>
        
        {/* 温馨提示 */}
        <div className={styles.notice}>
          <h4 className={styles.noticeTitle}>⚠️ 预约须知</h4>
          <ul className={styles.noticeList}>
            <li>请携带身份证、医保卡等有效证件按时就诊</li>
            <li>如需取消预约，请提前4小时操作</li>
            <li>初诊患者建议提前30分钟到达医院</li>
            <li>预约成功后将收到短信通知，请保持手机畅通</li>
          </ul>
        </div>
        
        {/* 提交按钮 */}
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? '提交中...' : `确认预约 ¥${doctorInfo.price}`}
        </button>
      </form>
    </div>
  );
}