import React from 'react';
import Link from 'next/link';
import styles from '../styles/PopularDepartments.module.css';

// 热门科室演示数据
export const popularDepartments = [
  {
    id: 12,
    name: '儿科',
    description: '儿童疾病诊治',
    icon: '👶',
    doctorCount: 10,
    visitCount: 156,
    popularity: 10,
    waitingTime: '25分钟',
    satisfactionRate: 4.8,
    featuredServices: ['儿童保健', '生长发育评估', '小儿呼吸系统疾病', '小儿消化系统疾病'],
    descriptionDetail: '儿科专注于婴幼儿及青少年的健康保健和疾病诊疗，为儿童提供专业的医疗服务。科室拥有经验丰富的儿科医生团队，配备先进的诊疗设备，致力于为儿童提供全方位的健康保障。'
  },
  {
    id: 1,
    name: '内科',
    description: '内科疾病诊疗',
    icon: '💊',
    doctorCount: 15,
    visitCount: 128,
    popularity: 9,
    waitingTime: '30分钟',
    satisfactionRate: 4.7,
    featuredServices: ['心血管疾病筛查', '高血压管理', '糖尿病诊疗', '呼吸系统疾病'],
    descriptionDetail: '内科是医院的基础科室，负责诊治内脏器官疾病，包括心血管、呼吸、消化、内分泌等多个专业方向。科室医生团队经验丰富，能够为患者提供全面的内科疾病诊疗服务。'
  },
  {
    id: 16,
    name: '口腔科',
    description: '口腔疾病诊疗',
    icon: '🦷',
    doctorCount: 9,
    visitCount: 102,
    popularity: 8,
    waitingTime: '20分钟',
    satisfactionRate: 4.9,
    featuredServices: ['种植牙', '正畸治疗', '牙齿美容', '口腔修复'],
    descriptionDetail: '口腔科专注于口腔疾病的诊断和治疗，包括牙齿、牙龈、口腔黏膜等疾病。科室拥有先进的口腔诊疗设备和专业的医生团队，为患者提供高质量的口腔医疗服务。'
  },
  {
    id: 6,
    name: '外科',
    description: '外科手术与治疗',
    icon: '🔪',
    doctorCount: 12,
    visitCount: 96,
    popularity: 8,
    waitingTime: '35分钟',
    satisfactionRate: 4.6,
    featuredServices: ['腹腔镜手术', '关节置换', '普外科手术', '泌尿外科手术'],
    descriptionDetail: '外科主要通过手术方法治疗疾病，包括普外科、神经外科、胸外科、泌尿外科等专业。科室拥有现代化的手术室和专业的外科医生团队，能够开展各种复杂的外科手术。'
  },
  {
    id: 11,
    name: '妇产科',
    description: '妇产科疾病诊疗',
    icon: '🤱',
    doctorCount: 8,
    visitCount: 87,
    popularity: 7,
    waitingTime: '40分钟',
    satisfactionRate: 4.7,
    featuredServices: ['产前筛查', '产后康复', '妇科肿瘤', '不孕不育诊疗'],
    descriptionDetail: '妇产科负责女性生殖系统疾病的诊治和孕产期保健，包括妇科、产科、生殖内分泌等专业。科室拥有专业的妇产科医生团队和先进的诊疗设备，为女性提供全方位的健康服务。'
  },
  {
    id: 17,
    name: '皮肤科',
    description: '皮肤疾病诊疗',
    icon: '🧴',
    doctorCount: 7,
    visitCount: 75,
    popularity: 6,
    waitingTime: '15分钟',
    satisfactionRate: 4.8,
    featuredServices: ['痤疮治疗', '皮肤过敏诊治', '银屑病治疗', '美容皮肤科'],
    descriptionDetail: '皮肤科专注于皮肤疾病的诊断和治疗，包括各种皮肤病、性传播疾病等。科室拥有专业的皮肤科医生团队和先进的诊疗设备，为患者提供高质量的皮肤医疗服务。'
  },
  {
    id: 14,
    name: '眼科',
    description: '眼部疾病诊疗',
    icon: '👁️',
    doctorCount: 6,
    visitCount: 64,
    popularity: 6,
    waitingTime: '25分钟',
    satisfactionRate: 4.7,
    featuredServices: ['白内障手术', '近视矫正', '青光眼治疗', '眼底病变诊疗'],
    descriptionDetail: '眼科专注于眼部疾病的诊断和治疗，包括白内障、青光眼、视网膜病变等多种眼病。科室拥有先进的眼科诊疗设备和专业的医生团队，为患者提供高质量的眼科医疗服务。'
  },
  {
    id: 15,
    name: '耳鼻喉科',
    description: '耳鼻喉疾病诊疗',
    icon: '👂',
    doctorCount: 5,
    visitCount: 58,
    popularity: 5,
    waitingTime: '20分钟',
    satisfactionRate: 4.6,
    featuredServices: ['听力检测', '鼻窦炎治疗', '中耳炎诊疗', '咽喉疾病诊治'],
    descriptionDetail: '耳鼻喉科专注于耳、鼻、喉及相关头颈区域的诊断和治疗。科室拥有专业的医生团队和先进的诊疗设备，为患者提供高质量的耳鼻喉医疗服务。'
  }
];

export default function PopularDepartmentsPage() {
  // 按热门程度排序
  const sortedDepartments = [...popularDepartments].sort((a, b) => b.popularity - a.popularity);

  return (
    <div className={styles.container}>
      {/* 热门科室列表 */}
      <div className={styles.departmentList}>
        {sortedDepartments.map((department) => (
          <Link 
            key={department.id} 
            href={`/doctors?department=${department.id}`}
            className={styles.departmentCard}
          >
            <div className={styles.departmentHeader}>
              <div className={styles.departmentIcon}>{department.icon}</div>
              <div className={styles.departmentInfo}>
                <h2 className={styles.departmentName}>{department.name}</h2>
                <p className={styles.departmentDescription}>{department.description}</p>
              </div>
              <div className={styles.popularityBadge}>
                🔥 {department.popularity}
              </div>
            </div>
            
            <div className={styles.departmentStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>医生数量</span>
                <span className={styles.statValue}>{department.doctorCount}人</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>月就诊</span>
                <span className={styles.statValue}>{department.visitCount}人</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>满意度</span>
                <span className={styles.statValue}>{department.satisfactionRate}⭐</span>
              </div>
            </div>
            
            <div className={styles.departmentFooter}>
              <span className={styles.waitingTime}>⏱️ 平均等待: {department.waitingTime}</span>
              <Link 
                href={`/appointment?department=${department.id}`} 
                className={styles.appointmentButton}
              >
                预约挂号
              </Link>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
