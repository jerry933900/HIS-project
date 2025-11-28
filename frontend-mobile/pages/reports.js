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
              status: '已完成',
              department: '检验科',
              summary: '白细胞计数略高，建议多饮水，一周后复查'
            },
            {
              id: '2',
              type: '胸部CT',
              date: '2024-11-20',
              doctor: '李医生',
              hospital: '健康医院',
              status: '检查中',
              department: '影像科',
              summary: '检查进行中，请耐心等待结果'
            },
            {
              id: '3',
              type: '心电图',
              date: '2024-11-15',
              doctor: '张医生',
              hospital: '健康医院',
              status: '已完成',
              department: '心内科',
              summary: '心律正常，未见明显异常'
            },
            {
              id: '4',
              type: '肝功能检查',
              date: '2024-11-10',
              doctor: '刘医生',
              hospital: '健康医院',
              status: '已完成',
              department: '消化科',
              summary: '转氨酶轻度升高，建议低脂饮食，避免饮酒'
            },
            {
              id: '5',
              type: '核磁共振',
              date: '2024-11-05',
              doctor: '陈医生',
              hospital: '健康医院',
              status: '待复查',
              department: '神经内科',
              summary: '需要进一步检查以明确诊断'
            },
            {
              id: '6',
              type: 'B超检查',
              date: '2024-10-30',
              doctor: '赵医生',
              hospital: '健康医院',
              status: '已完成',
              department: '超声科',
              summary: '胆囊壁稍厚，建议定期复查'
            },
            {
              id: '7',
              type: '尿常规检查',
              date: '2024-10-25',
              doctor: '钱医生',
              hospital: '健康医院',
              status: '已完成',
              department: '检验科',
              summary: '未见明显异常，结果正常'
            },
            {
              id: '8',
              type: 'X光胸片',
              date: '2024-10-20',
              doctor: '孙医生',
              hospital: '健康医院',
              status: '已完成',
              department: '影像科',
              summary: '双肺纹理清晰，心影大小正常'
            },
            {
              id: '9',
              type: '骨密度检测',
              date: '2024-10-15',
              doctor: '周医生',
              hospital: '康复医院',
              status: '已完成',
              department: '康复科',
              summary: '轻度骨质疏松，建议补充钙质和维生素D'
            },
            {
              id: '10',
              type: '眼底检查',
              date: '2024-10-10',
              doctor: '吴医生',
              hospital: '眼科医院',
              status: '紧急',
              department: '眼科',
              summary: '发现视网膜病变，请立即复诊'
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
          <Link href="/" className={styles.backButton}>←</Link>
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
          <Link href="/" className={styles.backButton}>←</Link>
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
        <Link href="/" className={styles.backButton}>←</Link>
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
            {reports.map(report => {
              // 根据报告类型选择对应的图标
              const getReportIcon = (type) => {
                if (type.includes('血常规')) return '🩸';
                if (type.includes('CT')) return '🔍';
                if (type.includes('心电图')) return '⚡';
                if (type.includes('肝功能')) return '🧪';
                if (type.includes('尿常规')) return '�';
                if (type.includes('X光')) return '📷';
                if (type.includes('B超')) return '🔊';
                if (type.includes('核磁共振')) return '🌀';
                if (type.includes('骨密度')) return '🦴';
                if (type.includes('眼底')) return '👁️';
                return '�📋'; // 默认图标
              };
              
              // 根据报告类型获取对应的CSS类名
              const getReportClass = (type) => {
                if (type.includes('血常规')) return 'blood';
                if (type.includes('CT')) return 'ct';
                if (type.includes('心电图')) return 'ecg';
                if (type.includes('肝功能')) return 'liver';
                if (type.includes('尿常规')) return 'urine';
                if (type.includes('X光')) return 'xray';
                if (type.includes('B超')) return 'ultrasound';
                if (type.includes('核磁共振')) return 'mri';
                if (type.includes('骨密度')) return 'bone';
                if (type.includes('眼底')) return 'eye';
                return 'other';
              };
              
              return (
                <Link key={report.id} href={`/report-detail?id=${report.id}`} className={`${styles.reportItem} ${getReportClass(report.type)}`}>
                  <div className={styles.reportIcon}>{getReportIcon(report.type)}</div>
                  <div className={styles.reportContent}>
                    <div className={styles.reportHeader}>
                      <h3 className={styles.reportType}>{report.type}</h3>
                      <span className={styles.reportStatus} data-status={report.status}>{report.status}</span>
                    </div>
                    <div className={styles.reportInfo}>
                      <p><span className={styles.label}>科室：</span>{report.department}</p>
                      <p><span className={styles.label}>检查日期：</span>{report.date}</p>
                      <p><span className={styles.label}>医生：</span>{report.doctor}</p>
                      <p><span className={styles.label}>医院：</span>{report.hospital}</p>
                      <p className={styles.summary}><span className={styles.label}>简要结果：</span>{report.summary}</p>
                    </div>
                  </div>
                  <div className={styles.reportArrow}>›</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;