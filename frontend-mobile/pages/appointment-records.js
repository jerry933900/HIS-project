import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/AppointmentRecords.module.css';

// 模拟预约记录数据
const mockRecords = [
  {
    id: '1001',
    doctorName: '王医生',
    department: '内科',
    appointmentDate: '2025-11-25',
    appointmentTime: '09:00-10:00',
    status: '已确认',
    symptoms: '头痛、发热',
    result: '已完成初步诊断，建议进一步检查',
  },
  {
    id: '1002',
    doctorName: '李医生',
    department: '外科',
    appointmentDate: '2025-11-20',
    appointmentTime: '14:00-15:00',
    status: '已完成',
    symptoms: '手臂疼痛',
    result: '轻度拉伤，已开药，注意休息',
  },
  {
    id: '1003',
    doctorName: '张医生',
    department: '儿科',
    appointmentDate: '2025-11-30',
    appointmentTime: '10:30-11:30',
    status: '待确认',
    symptoms: '感冒、咳嗽',
    result: '',
  },
  {
    id: '1004',
    doctorName: '赵医生',
    department: '妇产科',
    appointmentDate: '2025-12-05',
    appointmentTime: '15:00-16:00',
    status: '待确认',
    symptoms: '常规产检',
    result: '',
  },
];

// 状态颜色映射
const statusColors = {
  '待确认': '#ff9800',
  '已确认': '#4caf50',
  '已完成': '#2196f3',
  '已取消': '#f44336',
};

export default function AppointmentRecords() {
  const [records, setRecords] = useState(mockRecords);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, upcoming, past
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤记录
  const filteredRecords = records.filter(record => {
    // 搜索过滤
    const matchesSearch = 
      record.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.appointmentDate.includes(searchQuery);

    // 状态过滤
    const today = new Date();
    const recordDate = new Date(record.appointmentDate);
    if (activeTab === 'upcoming' && recordDate < today) {
      return false;
    }
    if (activeTab === 'past' && recordDate >= today) {
      return false;
    }

    return matchesSearch;
  });

  // 打开详情
  const openDetail = (record) => {
    setSelectedRecord(record);
  };

  // 关闭详情
  const closeDetail = () => {
    setSelectedRecord(null);
  };

  // 取消预约
  const cancelAppointment = (id) => {
    if (window.confirm('确定要取消这个预约吗？')) {
      setRecords(prevRecords => 
        prevRecords.map(record => 
          record.id === id ? { ...record, status: '已取消' } : record
        )
      );
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord({ ...selectedRecord, status: '已取消' });
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>← 返回</Link>
        <h1 className={styles.title}>预约记录</h1>
        <div className={styles.placeholder}></div>
      </div>

      {/* 搜索框 */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="搜索医生、科室或日期"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.searchIcon}>🔍</div>
      </div>

      {/* 标签页 */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          全部
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          即将到来
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'past' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('past')}
        >
          历史记录
        </button>
      </div>

      {/* 预约记录列表 */}
      {filteredRecords.length > 0 ? (
        <div className={styles.recordsList}>
          {filteredRecords.map((record) => (
            <div 
              key={record.id} 
              className={styles.recordCard}
              onClick={() => openDetail(record)}
            >
              <div className={styles.recordHeader}>
                <div className={styles.doctorInfo}>
                  <h3 className={styles.doctorName}>{record.doctorName}</h3>
                  <p className={styles.department}>{record.department}</p>
                </div>
                <div 
                  className={styles.statusBadge}
                  style={{ backgroundColor: statusColors[record.status] }}
                >
                  {record.status}
                </div>
              </div>

              <div className={styles.recordDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>日期：</span>
                  <span className={styles.detailValue}>{record.appointmentDate}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>时间：</span>
                  <span className={styles.detailValue}>{record.appointmentTime}</span>
                </div>
              </div>

              <div className={styles.recordFooter}>
                <p className={styles.symptoms}>症状：{record.symptoms}</p>
                <div className={styles.arrowIcon}>›</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <p className={styles.emptyText}>暂无预约记录</p>
          <Link href="/appointment" className={styles.makeAppointmentLink}>
            立即预约
          </Link>
        </div>
      )}

      {/* 详情模态框 */}
      {selectedRecord && (
        <div className={styles.modalOverlay} onClick={closeDetail}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>预约详情</h2>
              <button className={styles.closeButton} onClick={closeDetail}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>医生姓名：</span>
                  <span className={styles.detailValue}>{selectedRecord.doctorName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>科室：</span>
                  <span className={styles.detailValue}>{selectedRecord.department}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>预约日期：</span>
                  <span className={styles.detailValue}>{selectedRecord.appointmentDate}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>预约时间：</span>
                  <span className={styles.detailValue}>{selectedRecord.appointmentTime}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>预约状态：</span>
                  <span 
                    className={styles.statusText}
                    style={{ color: statusColors[selectedRecord.status] }}
                  >
                    {selectedRecord.status}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>症状描述：</span>
                  <span className={styles.detailValue}>{selectedRecord.symptoms}</span>
                </div>
                {selectedRecord.result && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>就诊结果：</span>
                    <span className={styles.detailValue}>{selectedRecord.result}</span>
                  </div>
                )}
              </div>

              {/* 取消预约按钮（仅对未完成的预约显示） */}
              {(selectedRecord.status === '待确认' || selectedRecord.status === '已确认') && (
                <button
                  className={styles.cancelButton}
                  onClick={() => cancelAppointment(selectedRecord.id)}
                >
                  取消预约
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 底部提示 */}
      <div className={styles.footerTip}>
        <p>注：如需修改或取消预约，请提前4小时操作</p>
      </div>
    </div>
  );
}