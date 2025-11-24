import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Departments.module.css';

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // 科室分类和数据
  const departments = {
    '内科': [
      { id: 1, name: '普通内科', description: '内科常见疾病诊疗', doctorCount: 12 },
      { id: 2, name: '心血管内科', description: '心脏血管疾病诊疗', doctorCount: 8 },
      { id: 3, name: '消化内科', description: '消化系统疾病诊疗', doctorCount: 6 },
      { id: 4, name: '呼吸内科', description: '呼吸系统疾病诊疗', doctorCount: 7 },
      { id: 5, name: '神经内科', description: '神经系统疾病诊疗', doctorCount: 5 }
    ],
    '外科': [
      { id: 6, name: '普通外科', description: '外科常见疾病诊疗', doctorCount: 9 },
      { id: 7, name: '骨科', description: '骨骼关节疾病诊疗', doctorCount: 10 },
      { id: 8, name: '神经外科', description: '神经外科疾病诊疗', doctorCount: 4 },
      { id: 9, name: '胸外科', description: '胸部疾病外科诊疗', doctorCount: 3 }
    ],
    '妇产科': [
      { id: 10, name: '产科', description: '孕期保健及分娩服务', doctorCount: 8 },
      { id: 11, name: '妇科', description: '妇科疾病诊疗', doctorCount: 7 }
    ],
    '儿科': [
      { id: 12, name: '儿科综合', description: '儿童常见疾病诊疗', doctorCount: 11 },
      { id: 13, name: '小儿外科', description: '儿童外科疾病诊疗', doctorCount: 4 }
    ],
    '其他科室': [
      { id: 14, name: '眼科', description: '眼部疾病诊疗', doctorCount: 5 },
      { id: 15, name: '耳鼻喉科', description: '耳鼻喉疾病诊疗', doctorCount: 4 },
      { id: 16, name: '口腔科', description: '口腔疾病诊疗', doctorCount: 6 },
      { id: 17, name: '皮肤科', description: '皮肤疾病诊疗', doctorCount: 5 },
      { id: 18, name: '中医科', description: '中医诊疗服务', doctorCount: 8 }
    ]
  };

  // 搜索过滤函数
  const filterDepartments = () => {
    if (!searchQuery) return departments;
    
    const filtered = {};
    const query = searchQuery.toLowerCase();
    
    Object.entries(departments).forEach(([category, deptList]) => {
      const matchedDepts = deptList.filter(dept => 
        dept.name.toLowerCase().includes(query) || 
        dept.description.toLowerCase().includes(query)
      );
      if (matchedDepts.length > 0) {
        filtered[category] = matchedDepts;
      }
    });
    
    return filtered;
  };

  const filteredDepartments = filterDepartments();

  return (
    <div className={styles.container}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <h1 className={styles.title}>科室导航</h1>
      </div>

      {/* 搜索栏 */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="搜索科室名称或疾病..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* 科室分类列表 */}
      <div className={styles.departmentList}>
        {Object.entries(filteredDepartments).map(([category, deptList]) => (
          <div key={category} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{category}</h2>
            <div className={styles.deptGrid}>
              {deptList.map(dept => (
                <Link 
                  key={dept.id} 
                  href={`/doctors?department=${dept.id}`}
                  className={styles.deptCard}
                >
                  <div className={styles.deptName}>{dept.name}</div>
                  <div className={styles.deptDescription}>{dept.description}</div>
                  <div className={styles.deptMeta}>
                    <span className={styles.doctorCount}>👨‍⚕️ {dept.doctorCount}位医生</span>
                    <span className={styles.viewMore}>查看 &gt;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        
        {/* 无搜索结果时显示 */}
        {Object.keys(filteredDepartments).length === 0 && (
          <div className={styles.noResults}>
            <p>未找到相关科室，请尝试其他关键词</p>
          </div>
        )}
      </div>

      {/* 温馨提示 */}
      <div className={styles.tips}>
        <p className={styles.tipsTitle}>💡 就医小贴士</p>
        <ul className={styles.tipsList}>
          <li>建议提前了解科室分诊信息，选择合适的科室就诊</li>
          <li>初诊患者可先选择全科医生或内科进行初步诊断</li>
          <li>如有疑问，可在导诊台咨询医护人员获取帮助</li>
        </ul>
      </div>
    </div>
  );
}