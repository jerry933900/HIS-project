import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/router';
import styles from '../styles/ReportDetail.module.css';

const ReportDetail = () => {
  const router = useRouter();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 模拟获取报告详情数据
    const fetchReportDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟报告数据
        const mockReport = {
          id: id || 'REPORT-2024-0101',
          title: '年度体检报告',
          date: '2024-01-15',
          patientName: '张三',
          patientId: 'PAT-2024-0001',
          age: 35,
          gender: '男',
          department: '体检中心',
          doctor: '李医生',
          doctorTitle: '主任医师',
          overview: {
            bloodPressure: '120/80 mmHg',
            heartRate: '72 次/分',
            bodyTemperature: '36.5°C',
            weight: '70 kg',
            height: '175 cm',
            bmi: '22.9'
          },
          tests: [
            {
              name: '血常规',
              items: [
                { name: '红细胞计数', value: '4.8 × 10¹²/L', normal: true, range: '4.3-5.8 × 10¹²/L' },
                { name: '血红蛋白', value: '145 g/L', normal: true, range: '130-175 g/L' },
                { name: '白细胞计数', value: '6.2 × 10⁹/L', normal: true, range: '3.5-9.5 × 10⁹/L' },
                { name: '血小板计数', value: '210 × 10⁹/L', normal: true, range: '125-350 × 10⁹/L' }
              ]
            },
            {
              name: '生化检查',
              items: [
                { name: '血糖', value: '5.2 mmol/L', normal: true, range: '3.9-6.1 mmol/L' },
                { name: '总胆固醇', value: '5.8 mmol/L', normal: false, range: '<5.2 mmol/L' },
                { name: '甘油三酯', value: '1.8 mmol/L', normal: true, range: '<1.7 mmol/L' },
                { name: '肌酐', value: '75 μmol/L', normal: true, range: '57-97 μmol/L' }
              ]
            },
            {
              name: '肝功能',
              items: [
                { name: 'ALT', value: '35 U/L', normal: true, range: '5-40 U/L' },
                { name: 'AST', value: '30 U/L', normal: true, range: '8-40 U/L' },
                { name: '总胆红素', value: '18 μmol/L', normal: true, range: '5.1-19 μmol/L' },
                { name: '直接胆红素', value: '6 μmol/L', normal: true, range: '0-6.8 μmol/L' }
              ]
            }
          ],
          diagnosis: {
            conclusion: '体检结果基本正常，血脂略高',
            recommendations: [
              '建议清淡饮食，减少高脂肪、高胆固醇食物摄入',
              '增加体育锻炼，每周至少进行150分钟中等强度有氧运动',
              '建议3个月后复查血脂',
              '保持良好的生活习惯，戒烟限酒'
            ],
            isNormal: false
          },
          doctorNote: '患者血脂略高，建议调整生活方式，控制饮食并加强运动。目前无明显临床症状，定期复查即可。如有不适，请及时就医。',
          images: []
        };
        
        setReport(mockReport);
      } catch (err) {
        setError('获取报告详情失败，请稍后重试');
        console.error('获取报告详情错误:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetail();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleRetry = () => {
    // 重新加载报告数据
    setLoading(true);
    // 重新执行数据获取
    const fetchAgain = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        // 使用相同的模拟数据
        const mockReport = {
          id: id || 'REPORT-2024-0101',
          title: '年度体检报告',
          date: '2024-01-15',
          patientName: '张三',
          patientId: 'PAT-2024-0001',
          age: 35,
          gender: '男',
          department: '体检中心',
          doctor: '李医生',
          doctorTitle: '主任医师',
          overview: {
            bloodPressure: '120/80 mmHg',
            heartRate: '72 次/分',
            bodyTemperature: '36.5°C',
            weight: '70 kg',
            height: '175 cm',
            bmi: '22.9'
          },
          tests: [
            {
              name: '血常规',
              items: [
                { name: '红细胞计数', value: '4.8 × 10¹²/L', normal: true, range: '4.3-5.8 × 10¹²/L' },
                { name: '血红蛋白', value: '145 g/L', normal: true, range: '130-175 g/L' },
                { name: '白细胞计数', value: '6.2 × 10⁹/L', normal: true, range: '3.5-9.5 × 10⁹/L' },
                { name: '血小板计数', value: '210 × 10⁹/L', normal: true, range: '125-350 × 10⁹/L' }
              ]
            },
            {
              name: '生化检查',
              items: [
                { name: '血糖', value: '5.2 mmol/L', normal: true, range: '3.9-6.1 mmol/L' },
                { name: '总胆固醇', value: '5.8 mmol/L', normal: false, range: '<5.2 mmol/L' },
                { name: '甘油三酯', value: '1.8 mmol/L', normal: true, range: '<1.7 mmol/L' },
                { name: '肌酐', value: '75 μmol/L', normal: true, range: '57-97 μmol/L' }
              ]
            },
            {
              name: '肝功能',
              items: [
                { name: 'ALT', value: '35 U/L', normal: true, range: '5-40 U/L' },
                { name: 'AST', value: '30 U/L', normal: true, range: '8-40 U/L' },
                { name: '总胆红素', value: '18 μmol/L', normal: true, range: '5.1-19 μmol/L' },
                { name: '直接胆红素', value: '6 μmol/L', normal: true, range: '0-6.8 μmol/L' }
              ]
            }
          ],
          diagnosis: {
            conclusion: '体检结果基本正常，血脂略高',
            recommendations: [
              '建议清淡饮食，减少高脂肪、高胆固醇食物摄入',
              '增加体育锻炼，每周至少进行150分钟中等强度有氧运动',
              '建议3个月后复查血脂',
              '保持良好的生活习惯，戒烟限酒'
            ],
            isNormal: false
          },
          doctorNote: '患者血脂略高，建议调整生活方式，控制饮食并加强运动。目前无明显临床症状，定期复查即可。如有不适，请及时就医。',
          images: []
        };
        
        setReport(mockReport);
        setError(null);
      } catch (err) {
        setError('获取报告详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchAgain();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingIcon}>📄</div>
        <p className={styles.loadingText}>正在加载报告详情...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.loadingIcon}>❌</div>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryButton} onClick={handleRetry}>重新加载</button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.loadingIcon}>📭</div>
        <p className={styles.emptyText}>未找到报告信息</p>
        <p className={styles.emptySubText}>请检查报告ID是否正确</p>
        <button className={styles.retryButton} onClick={handleBack}>返回</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 头部 */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backButton} onClick={handleBack}>
            ←
          </button>
          <h1 className={styles.headerTitle}>报告详情</h1>
          <div className={styles.placeholder}></div>
        </div>
      </header>

      {/* 报告概览卡片 */}
      <div className={styles.reportOverview}>
        <div className={styles.reportHeader}>
          <h2 className={styles.reportTitle}>{report.title}</h2>
          <p className={styles.reportDate}>{report.date}</p>
        </div>
        <div className={styles.reportInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>患者姓名</span>
            <span className={styles.infoValue}>{report.patientName}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>患者ID</span>
            <span className={styles.infoValue}>{report.patientId}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>年龄/性别</span>
            <span className={styles.infoValue}>{report.age}岁 / {report.gender}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>检查科室</span>
            <span className={styles.infoValue}>{report.department}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>医生</span>
            <span className={styles.infoValue}>{report.doctor} {report.doctorTitle}</span>
          </div>
        </div>
      </div>

      {/* 基本生理指标 */}
      <div className={styles.reportDetails}>
        <h3 className={styles.sectionTitle}>基本生理指标</h3>
        <div className={styles.reportInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>血压</span>
            <span className={styles.infoValue}>{report.overview.bloodPressure}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>心率</span>
            <span className={styles.infoValue}>{report.overview.heartRate}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>体温</span>
            <span className={styles.infoValue}>{report.overview.bodyTemperature}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>体重/身高</span>
            <span className={styles.infoValue}>{report.overview.weight} / {report.overview.height}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>BMI指数</span>
            <span className={styles.infoValue}>{report.overview.bmi}</span>
          </div>
        </div>
      </div>

      {/* 检查项目详情 */}
      {report.tests.map((test, index) => (
        <div key={index} className={styles.reportDetails}>
          <h3 className={styles.sectionTitle}>{test.name}</h3>
          {test.items.map((item, itemIndex) => (
            <div key={itemIndex} className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                {item.name}
                {!item.normal && (
                  <span style={{ marginLeft: '8px', color: '#ff4d4f' }}>异常</span>
                )}
              </div>
              <div className={styles.sectionContent}>
                <div>检测值: {item.value}</div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>参考范围: {item.range}</div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* 诊断结果 */}
      <div className={styles.reportDetails}>
        <h3 className={styles.sectionTitle}>诊断结果</h3>
        <div 
          className={`${styles.diagnosisResult} ${report.diagnosis.isNormal ? styles.normalResult : styles.abnormalResult}`}
        >
          <span className={styles.resultIcon}>
            {report.diagnosis.isNormal ? '✅' : '⚠️'}
          </span>
          <span className={styles.resultText}>
            {report.diagnosis.isNormal ? '结果正常' : '结果异常'}
          </span>
        </div>
        <div className={styles.detailSection}>
          <div className={styles.sectionHeader}>结论</div>
          <div className={styles.sectionContent}>
            {report.diagnosis.conclusion}
          </div>
        </div>
        <div className={styles.detailSection}>
          <div className={styles.sectionHeader}>建议</div>
          <div className={styles.sectionContent}>
            {report.diagnosis.recommendations.map((rec, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {index + 1}. {rec}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 医生备注 */}
      <div className={styles.doctorNote}>
        <h4 className={styles.doctorNoteTitle}>医生备注</h4>
        <p className={styles.doctorNoteContent}>{report.doctorNote}</p>
      </div>
    </div>
  );
};

export default ReportDetail;