import React from 'react';
import { Link } from 'next/link';
import styles from './DoctorCard.module.css';

/**
 * 医生卡片组件 - 用于展示医生信息
 * 完全支持SSR，无客户端特定逻辑
 * 
 * @param {Object} props - 组件属性
 * @param {Object} props.doctor - 医生数据对象
 * @returns {JSX.Element}
 */
const DoctorCard = ({ doctor }) => {
  // 服务端安全检查
  if (!doctor) {
    return null;
  }

  // 构建医生详情页面链接
  const doctorLink = `/doctors/${doctor.id}`;

  return (
    <Link href={doctorLink} className={styles.doctorCard} prefetch={true}>
      <div className={styles.doctorImage}>
        <img 
          src={doctor.image || '/default-avatar.png'} 
          alt={`${doctor.name}医生`} 
          className={styles.avatar} 
          loading="lazy" // 使用懒加载优化性能，但在SSR中也能正常渲染
        />
      </div>
      
      <div className={styles.doctorInfo}>
        <div className={styles.doctorNameContainer}>
          <h3 className={styles.doctorName}>{doctor.name}</h3>
          <span className={styles.doctorTitle}>{doctor.title}</span>
        </div>
        
        <div className={styles.doctorDepartment}>
          {doctor.department}
        </div>
        
        <div className={styles.doctorStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>评分</span>
            <span className={styles.statValue}>{doctor.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DoctorCard;