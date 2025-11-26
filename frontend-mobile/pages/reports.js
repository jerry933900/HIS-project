import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Reports.module.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 模拟获取检查报告数据
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // 在实际应用中，这里应该调用API获取数据
        // const response = await api.getReports();
        // setReports(response.data);
        
        // 模拟数据
        setTimeout(() => {
          setReports([
            {
              id: '1',
              type: '血常规检查',
              date: '2024-11-25',
              doctor: '王医生',
              hospital: '健康医院',
              status: '已完成'
            },
            {
              id: '2',
              type: '胸部CT',
              date: '2024-11-20',
              doctor: '李医生',
              hospital: '健康医院',
              status: '已完成'
            },
            {
              id: '3',
              type: '心电图',
              date: '2024-11-15',
              doctor: '张医生',
              hospital: '健康医院',
              status: '已完成'
            },
            {
              id: '4',
              type: '肝功能检查',
              date: '2024-11-10',
              doctor: '刘医生',
              hospital: '健康医院',
              status: '已完成'
            }
          ]);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('获取检查报告失败');
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backButton}>返回</Link>
          <h1 className={styles.title}>检查报告</h1>
          <div className={styles.placeholder}></div>
        </div>
        <div className={styles.loadingContainer}>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backButton}>返回</Link>
          <h1 className={styles.title}>检查报告</h1>
          <div className={styles.placeholder}></div>
        </div>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>返回</Link>
        <h1 className={styles.title}>检查报告</h1>
        <div className={styles.placeholder}></div>
      </div>
      
      <div className={styles.content}>
        {reports.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p>暂无检查报告</p>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {reports.map(report => (
              <Link key={report.id} href={`/report-detail?id=${report.id}`} className={styles.reportItem}>
                <div className={styles.reportHeader}>
                  <h3 className={styles.reportType}>{report.type}</h3>
                  <span className={styles.reportStatus}>{report.status}</span>
                </div>
                <div className={styles.reportInfo}>
                  <p><span className={styles.label}>检查日期：</span>{report.date}</p>
                  <p><span className={styles.label}>医生：</span>{report.doctor}</p>
                  <p><span className={styles.label}>医院：</span>{report.hospital}</p>
                </div>
                <div className={styles.reportArrow}>›</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;