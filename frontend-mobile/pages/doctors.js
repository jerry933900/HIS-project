import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Doctors.module.css';

export default function DoctorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating'); // rating, price, experience
  const [doctors, setDoctors] = useState([]);
  
  // 从URL获取科室ID参数
  useEffect(() => {
    if (router.query.department) {
      setDepartmentFilter(router.query.department);
    }
  }, [router.query.department]);

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
      avatar: 'https://via.placeholder.com/100?text=王'
    },
    { 
      id: 4, 
      name: '赵医生', 
      title: '主任医师', 
      department: '妇产科',
      departmentId: 11,
      hospital: '北京妇产医院',
      rating: 4.9, 
      reviews: 412, 
      price: 90, 
      experience: 22, 
      specialty: '妇科肿瘤、妇科内分泌疾病',
      description: '在妇科肿瘤和内分泌疾病领域有丰富的临床经验。',
      avatar: 'https://via.placeholder.com/100?text=赵'
    },
    { 
      id: 5, 
      name: '刘医生', 
      title: '副主任医师', 
      department: '儿科',
      departmentId: 12,
      hospital: '北京儿童医院',
      rating: 4.8, 
      reviews: 356, 
      price: 70, 
      experience: 16, 
      specialty: '儿童呼吸系统疾病、免疫性疾病',
      description: '专注于儿童常见病和多发病的诊治，尤其擅长呼吸系统疾病。',
      avatar: 'https://via.placeholder.com/100?text=刘'
    },
    { 
      id: 6, 
      name: '周医生', 
      title: '主治医师', 
      department: '眼科',
      departmentId: 14,
      hospital: '北京同仁医院',
      rating: 4.6, 
      reviews: 178, 
      price: 60, 
      experience: 9, 
      specialty: '白内障、青光眼、视网膜疾病',
      description: '在眼科常见疾病的诊断和治疗方面有丰富经验。',
      avatar: 'https://via.placeholder.com/100?text=周'
    },
    { 
      id: 7, 
      name: '吴医生', 
      title: '主任医师', 
      department: '神经内科',
      departmentId: 5,
      hospital: '北京天坛医院',
      rating: 4.9, 
      reviews: 298, 
      price: 120, 
      experience: 25, 
      specialty: '脑血管病、癫痫、帕金森病',
      description: '在神经系统疾病诊治方面造诣深厚，尤其擅长脑血管病治疗。',
      avatar: 'https://via.placeholder.com/100?text=吴'
    },
    { 
      id: 8, 
      name: '郑医生', 
      title: '副主任医师', 
      department: '皮肤科',
      departmentId: 17,
      hospital: '北京协和医院',
      rating: 4.7, 
      reviews: 245, 
      price: 70, 
      experience: 14, 
      specialty: '过敏性皮肤病、痤疮、银屑病',
      description: '专注于各类常见皮肤病的诊治，尤其擅长过敏性皮肤病。',
      avatar: 'https://via.placeholder.com/100?text=郑'
    }
  ];

  // 科室选项
  const departmentOptions = [
    { id: 'all', name: '全部科室' },
    { id: '1', name: '普通内科' },
    { id: '2', name: '心血管内科' },
    { id: '3', name: '消化内科' },
    { id: '4', name: '呼吸内科' },
    { id: '5', name: '神经内科' },
    { id: '6', name: '普通外科' },
    { id: '7', name: '骨科' },
    { id: '8', name: '神经外科' },
    { id: '9', name: '胸外科' },
    { id: '10', name: '产科' },
    { id: '11', name: '妇科' },
    { id: '12', name: '儿科综合' },
    { id: '13', name: '小儿外科' },
    { id: '14', name: '眼科' },
    { id: '15', name: '耳鼻喉科' },
    { id: '16', name: '口腔科' },
    { id: '17', name: '皮肤科' },
    { id: '18', name: '中医科' }
  ];

  // 初始化医生数据
  useEffect(() => {
    setDoctors(mockDoctors);
  }, []);

  // 过滤和排序医生
  const getFilteredDoctors = () => {
    let filtered = [...doctors];
    
    // 按科室过滤
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(doctor => doctor.departmentId === parseInt(departmentFilter));
    }
    
    // 按搜索词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(query) ||
        doctor.department.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.description.toLowerCase().includes(query)
      );
    }
    
    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'experience':
          return b.experience - a.experience;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const filteredDoctors = getFilteredDoctors();

  return (
    <div className={styles.container}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <h1 className={styles.title}>医生列表</h1>
      </div>

      {/* 搜索栏 */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="搜索医生姓名、专长..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* 筛选器 */}
      <div className={styles.filterSection}>
        {/* 科室筛选 */}
        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>科室:</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className={styles.filterSelect}
          >
            {departmentOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>

        {/* 排序选项 */}
        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>排序:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="rating">评分优先</option>
            <option value="price">价格从低到高</option>
            <option value="experience">经验优先</option>
          </select>
        </div>
      </div>

      {/* 结果统计 */}
      <div className={styles.resultStats}>
        <span>找到 {filteredDoctors.length} 位医生</span>
      </div>

      {/* 医生列表 */}
      <div className={styles.doctorsList}>
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className={styles.doctorCard}>
            <div className={styles.doctorInfo}>
              <div className={styles.avatarContainer}>
                <img src={doctor.avatar} alt={doctor.name} className={styles.avatar} />
              </div>
              <div className={styles.doctorDetails}>
                <div className={styles.doctorHeader}>
                  <h3 className={styles.doctorName}>{doctor.name}</h3>
                  <span className={styles.doctorTitle}>{doctor.title}</span>
                </div>
                <div className={styles.doctorDepartment}>{doctor.department}</div>
                <div className={styles.doctorHospital}>{doctor.hospital}</div>
                <div className={styles.doctorSpecialty}>{doctor.specialty}</div>
                <div className={styles.doctorMeta}>
                  <div className={styles.rating}>
                    <span className={styles.ratingValue}>★ {doctor.rating}</span>
                    <span className={styles.reviewCount}>({doctor.reviews}条评价)</span>
                  </div>
                  <div className={styles.experience}>经验: {doctor.experience}年</div>
                </div>
              </div>
              <div className={styles.doctorPrice}>
                <span className={styles.priceSymbol}>¥</span>
                <span className={styles.priceValue}>{doctor.price}</span>
                <span className={styles.priceUnit}>/次</span>
              </div>
            </div>
            <div className={styles.actionButtons}>
              <Link 
                href={`/registration?doctorId=${doctor.id}`} 
                className={styles.bookButton}
              >
                立即预约
              </Link>
              <button className={styles.detailButton}>查看详情</button>
            </div>
          </div>
        ))}

        {/* 无结果显示 */}
        {filteredDoctors.length === 0 && (
          <div className={styles.noResults}>
            <p>未找到符合条件的医生</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('all');
              }}
              className={styles.resetButton}
            >
              重置筛选条件
            </button>
          </div>
        )}
      </div>
    </div>
  );
}