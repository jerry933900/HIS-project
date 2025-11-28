import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/DoctorDetail.module.css';

export default function DoctorDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // info, schedule, reviews

  // 模拟医生数据
  const mockDoctors = [
    {
      id: 1,
      name: '张医生',
      title: '主任医师',
      department: '心血管内科',
      departmentId: 2,
      hospital: '北京协和医院',
      rating: 4.9,
      reviews: 328,
      price: 100,
      experience: 20,
      specialty: '冠心病、高血压、心力衰竭',
      description: '从事心血管疾病临床工作20年，擅长复杂心血管疾病的诊断和治疗。',
      education: [
        '1998年毕业于北京医科大学临床医学专业，获学士学位',
        '2003年毕业于中国医学科学院研究生院，获内科学博士学位',
        '2008-2009年在美国梅奥诊所心血管中心进修'
      ],
      achievements: [
        '发表SCI论文30余篇',
        '主持国家级科研项目2项',
        '获得卫生部科技进步二等奖1项',
        '担任《中华心血管病杂志》编委'
      ],
      schedule: {
        '周一': { morning: true, afternoon: false },
        '周二': { morning: false, afternoon: true },
        '周三': { morning: true, afternoon: true },
        '周四': { morning: false, afternoon: false },
        '周五': { morning: true, afternoon: true },
        '周六': { morning: true, afternoon: false },
        '周日': { morning: false, afternoon: false }
      },
      reviews: [
        {
          id: 1,
          patientName: '李**',
          rating: 5,
          date: '2024-01-15',
          content: '医生非常专业，耐心解答了我的问题，治疗效果很好。'
        },
        {
          id: 2,
          patientName: '王**',
          rating: 5,
          date: '2024-01-10',
          content: '张医生经验丰富，诊断准确，态度也很好。'
        },
        {
          id: 3,
          patientName: '刘**',
          rating: 4,
          date: '2024-01-05',
          content: '整体服务很好，医生很负责。'
        }
      ],
      avatar: 'https://via.placeholder.com/100?text=张'
    },
    {
      id: 2,
      name: '李医生',
      title: '副主任医师',
      department: '消化内科',
      departmentId: 3,
      hospital: '北京协和医院',
      rating: 4.8,
      reviews: 267,
      price: 80,
      experience: 15,
      specialty: '消化系统疾病、胃肠疾病',
      description: '专注于消化系统疾病的诊断与治疗，尤其擅长胃肠镜检查。',
      education: [
        '2002年毕业于上海交通大学医学院临床医学专业',
        '2007年获得内科学硕士学位',
        '2012年在日本东京大学医学院进修消化内镜技术'
      ],
      achievements: [
        '发表核心期刊论文20余篇',
        '参与国家级科研项目3项',
        '获北京市科技进步三等奖1项'
      ],
      schedule: {
        '周一': { morning: false, afternoon: true },
        '周二': { morning: true, afternoon: false },
        '周三': { morning: false, afternoon: false },
        '周四': { morning: true, afternoon: true },
        '周五': { morning: true, afternoon: false },
        '周六': { morning: false, afternoon: false },
        '周日': { morning: false, afternoon: false }
      },
      reviews: [
        {
          id: 1,
          patientName: '赵**',
          rating: 5,
          date: '2024-01-14',
          content: '李医生技术很好，胃肠镜检查一点都不难受。'
        },
        {
          id: 2,
          patientName: '孙**',
          rating: 5,
          date: '2024-01-08',
          content: '医生很有耐心，解释得很清楚。'
        }
      ],
      avatar: 'https://via.placeholder.com/100?text=李'
    },
    {
      id: 3,
      name: '王医生',
      title: '主治医师',
      department: '骨科',
      departmentId: 7,
      hospital: '北京大学第一医院',
      rating: 4.7,
      reviews: 189,
      price: 60,
      experience: 10,
      specialty: '骨折、关节炎、腰椎间盘突出',
      description: '擅长各类骨科常见疾病的诊治，尤其是关节外科手术。',
      education: [
        '2008年毕业于北京大学医学部',
        '2013年获得骨外科学硕士学位',
        '2016年在美国哈佛医学院附属麻省总医院进修'
      ],
      achievements: [
        '发表SCI论文10余篇',
        '参与省部级科研项目2项',
        '获得骨科青年医师技能大赛一等奖'
      ],
      schedule: {
        '周一': { morning: true, afternoon: true },
        '周二': { morning: true, afternoon: true },
        '周三': { morning: false, afternoon: false },
        '周四': { morning: true, afternoon: true },
        '周五': { morning: false, afternoon: false },
        '周六': { morning: false, afternoon: false },
        '周日': { morning: false, afternoon: false }
      },
      reviews: [
        {
          id: 1,
          patientName: '周**',
          rating: 5,
          date: '2024-01-12',
          content: '王医生手术很成功，恢复得很好。'
        },
        {
          id: 2,
          patientName: '吴**',
          rating: 4,
          date: '2024-01-06',
          content: '医生态度很好，治疗方案很专业。'
        }
      ],
      avatar: 'https://via.placeholder.com/100?text=王'
    }
  ];

  // 获取医生详情
  useEffect(() => {
    if (id) {
      setLoading(true);
      // 模拟API请求延迟
      setTimeout(() => {
        const foundDoctor = mockDoctors.find(d => d.id === parseInt(id));
        if (foundDoctor) {
          setDoctor(foundDoctor);
          setError(null);
        } else {
          setError('未找到该医生信息');
          setDoctor(null);
        }
        setLoading(false);
      }, 500);
    }
  }, [id]);

  // 渲染评分星星
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className={styles.star}>★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.star}>★</span>);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.starEmpty}>☆</span>);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingIcon}>⏳</div>
          <p className={styles.loadingText}>加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>❌</div>
          <p className={styles.errorText}>加载失败</p>
          <p className={styles.errorSubText}>{error || '未知错误'}</p>
          <button className={styles.retryButton} onClick={() => router.back()}>返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 头部导航 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ←
        </button>
        <h1 className={styles.headerTitle}>医生详情</h1>
        <div className={styles.placeholder}></div>
      </div>

      {/* 医生基本信息卡片 */}
      <div className={styles.doctorCard}>
        <div className={styles.doctorInfo}>
          <div className={styles.avatarContainer}>
            <img src={doctor.avatar} alt={doctor.name} className={styles.avatar} />
          </div>
          <div className={styles.doctorDetails}>
            <div className={styles.doctorNameRow}>
              <h2 className={styles.doctorName}>{doctor.name}</h2>
              <span className={styles.doctorTitle}>{doctor.title}</span>
            </div>
            <p className={styles.doctorDepartment}>{doctor.department}</p>
            <p className={styles.doctorHospital}>{doctor.hospital}</p>
            <div className={styles.doctorMeta}>
              <div className={styles.ratingContainer}>
                {renderRatingStars(doctor.rating)}
                <span className={styles.ratingText}>{doctor.rating}</span>
                <span className={styles.reviewCount}>({doctor.reviews}条评价)</span>
              </div>
              <div className={styles.experienceText}>经验: {doctor.experience}年</div>
            </div>
          </div>
          <div className={styles.priceContainer}>
            <span className={styles.priceSymbol}>¥</span>
            <span className={styles.priceValue}>{doctor.price}</span>
            <span className={styles.priceUnit}>/次</span>
          </div>
        </div>
        
        {/* 预约按钮 */}
        <Link 
          href={`/registration?doctorId=${doctor.id}`} 
          className={styles.bookButton}
        >
          立即预约
        </Link>
      </div>

      {/* 标签页导航 */}
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'info' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('info')}
        >
          医生简介
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'schedule' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          出诊时间
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          患者评价
        </button>
      </div>

      {/* 标签页内容 */}
      <div className={styles.tabContent}>
        {/* 医生简介 */}
        {activeTab === 'info' && (
          <div className={styles.infoContent}>
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>专业擅长</h3>
              <p className={styles.sectionContent}>{doctor.specialty}</p>
            </div>
            
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>医生简介</h3>
              <p className={styles.sectionContent}>{doctor.description}</p>
            </div>
            
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>教育背景</h3>
              <ul className={styles.listContent}>
                {doctor.education.map((item, index) => (
                  <li key={index} className={styles.listItem}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>学术成就</h3>
              <ul className={styles.listContent}>
                {doctor.achievements.map((item, index) => (
                  <li key={index} className={styles.listItem}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 出诊时间 */}
        {activeTab === 'schedule' && (
          <div className={styles.scheduleContent}>
            <div className={styles.scheduleGrid}>
              {Object.entries(doctor.schedule).map(([day, time]) => (
                <div key={day} className={styles.scheduleItem}>
                  <div className={styles.scheduleDay}>{day}</div>
                  <div className={styles.scheduleTimes}>
                    {time.morning && <span className={styles.scheduleTime}>上午</span>}
                    {time.afternoon && <span className={styles.scheduleTime}>下午</span>}
                    {!time.morning && !time.afternoon && (
                      <span className={styles.scheduleTimeUnavailable}>休息</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.scheduleNote}>
              <p>注：具体出诊时间可能会有调整，请以当天挂号信息为准</p>
            </div>
          </div>
        )}

        {/* 患者评价 */}
        {activeTab === 'reviews' && (
          <div className={styles.reviewsContent}>
            {doctor.reviews && doctor.reviews.length > 0 ? (
              <>
                {doctor.reviews.map(review => (
                  <div key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewPatient}>{review.patientName}</span>
                      <span className={styles.reviewDate}>{review.date}</span>
                    </div>
                    <div className={styles.reviewRating}>
                      {renderRatingStars(review.rating)}
                    </div>
                    <p className={styles.reviewContent}>{review.content}</p>
                  </div>
                ))}
              </>
            ) : (
              <div className={styles.noReviews}>
                <p>暂无患者评价</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部预约按钮 */}
      <div className={styles.bottomButtonContainer}>
        <Link 
          href={`/registration?doctorId=${doctor.id}`} 
          className={styles.bottomBookButton}
        >
          立即预约
        </Link>
      </div>
    </div>
  );
}