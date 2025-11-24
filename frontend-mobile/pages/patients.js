import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Patients.module.css';

// 模拟患者数据
const mockPatients = [
  {
    id: 1,
    name: '张三',
    gender: '男',
    age: 35,
    idCard: '110101********1234',
    phone: '138****5678',
    lastVisit: '2023-10-15',
    priority: 'normal'
  },
  {
    id: 2,
    name: '李四',
    gender: '女',
    age: 28,
    idCard: '310101********5678',
    phone: '139****9012',
    lastVisit: '2023-10-18',
    priority: 'high'
  },
  {
    id: 3,
    name: '王五',
    gender: '男',
    age: 42,
    idCard: '440101********9012',
    phone: '136****3456',
    lastVisit: '2023-10-10',
    priority: 'normal'
  },
  {
    id: 4,
    name: '赵六',
    gender: '女',
    age: 65,
    idCard: '510101********3456',
    phone: '135****7890',
    lastVisit: '2023-10-17',
    priority: 'medium'
  },
  {
    id: 5,
    name: '钱七',
    gender: '男',
    age: 12,
    idCard: '610101********7890',
    phone: '134****1234',
    lastVisit: '2023-10-20',
    priority: 'high'
  }
];

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // 模拟加载数据
  useEffect(() => {
    // 模拟API请求延迟
    const timer = setTimeout(() => {
      setPatients(mockPatients);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 搜索和过滤功能
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.includes(searchTerm) || 
                         patient.phone.includes(searchTerm) ||
                         patient.idCard.includes(searchTerm);
    const matchesFilter = filter === 'all' || patient.priority === filter;
    return matchesSearch && matchesFilter;
  });

  // 获取优先级对应的样式类
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'normal': return styles.priorityNormal;
      default: return styles.priorityNormal;
    }
  };

  // 获取优先级对应的文字
  const getPriorityText = (priority) => {
    switch(priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'normal': return '正常';
      default: return '正常';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>患者列表</h1>
      </div>

      {/* 搜索框 */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="搜索患者姓名、电话或身份证号"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* 过滤选项 */}
      <div className={styles.filterContainer}>
        <button 
          className={`${styles.filterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'high' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('high')}
        >
          高优先级
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'medium' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('medium')}
        >
          中优先级
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'normal' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('normal')}
        >
          正常
        </button>
      </div>

      {/* 患者列表 */}
      <div className={styles.patientList}>
        {filteredPatients.length === 0 ? (
          <div className={styles.emptyState}>
            <p>没有找到符合条件的患者</p>
          </div>
        ) : (
          filteredPatients.map(patient => (
            <Link key={patient.id} href={`/patient-view?id=${patient.id}`} className={styles.patientCard}>
              <div className={styles.patientHeader}>
                <div className={styles.patientInfo}>
                  <h3 className={styles.patientName}>{patient.name}</h3>
                  <div className={styles.patientMeta}>
                    <span>{patient.gender} | {patient.age}岁</span>
                    <span className={getPriorityClass(patient.priority)}>
                      {getPriorityText(patient.priority)}优先级
                    </span>
                  </div>
                </div>
                <div className={styles.arrowIcon}>›</div>
              </div>
              
              <div className={styles.patientDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>身份证号：</span>
                  <span>{patient.idCard}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>联系电话：</span>
                  <span>{patient.phone}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>最后就诊：</span>
                  <span>{patient.lastVisit}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Patients;