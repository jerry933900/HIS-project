import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/ReportDetail.module.css';

const ReportDetail = () => {
  const router = useRouter();
  // 使用router.query获取路由参数，兼容不同版本的Next.js
  const { id } = router.query || {};
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('当前报告ID:', id);
    if (!id) {
      setLoading(false);
      setError('报告ID不存在');
      return;
    }
    // 定义所有类型的报告数据
    const reportData = {
      '1': {
        id: '1',
        title: '血常规检查报告',
        date: '2024-10-20',
        patientName: '张三',
        patientId: 'PAT-2024-0001',
        age: 35,
        gender: '男',
        department: '内科',
        doctor: '王医生',
        doctorTitle: '主治医师',
        overview: {
          bloodPressure: '125/85 mmHg',
          heartRate: '70 次/分',
          bodyTemperature: '36.4°C'
        },
        tests: [
          {
            name: '血常规',
            items: [
              { name: '红细胞计数', value: '4.7 × 10¹²/L', normal: true, range: '4.3-5.8 × 10¹²/L' },
              { name: '血红蛋白', value: '142 g/L', normal: true, range: '130-175 g/L' },
              { name: '白细胞计数', value: '5.8 × 10⁹/L', normal: true, range: '3.5-9.5 × 10⁹/L' },
              { name: '血小板计数', value: '220 × 10⁹/L', normal: true, range: '125-350 × 10⁹/L' },
              { name: '中性粒细胞百分比', value: '62%', normal: true, range: '40-75%' },
              { name: '淋巴细胞百分比', value: '32%', normal: true, range: '20-50%' }
            ]
          }
        ],
        diagnosis: {
          conclusion: '血常规检查结果正常',
          recommendations: [
            '保持良好的生活习惯',
            '均衡饮食，适量运动'
          ],
          isNormal: true
        },
        doctorNote: '血常规各项指标均在正常范围内，无需特殊处理。',
        images: []
      },
      '2': {
        id: '2',
        title: '胸部CT检查报告',
        date: '2024-10-18',
        patientName: '张三',
        patientId: 'PAT-2024-0001',
        age: 35,
        gender: '男',
        department: '放射科',
        doctor: '刘医生',
        doctorTitle: '主任医师',
        overview: {
          bloodPressure: '120/80 mmHg',
          heartRate: '72 次/分'
        },
        tests: [
          {
            name: '胸部CT扫描',
            items: [
              { name: '肺野', value: '清晰', normal: true, range: '清晰' },
              { name: '纵隔', value: '居中', normal: true, range: '居中' },
              { name: '胸膜', value: '未见增厚', normal: true, range: '正常' },
              { name: '气管', value: '通畅', normal: true, range: '通畅' }
            ]
          }
        ],
        diagnosis: {
          conclusion: '胸部CT未见明显异常',
          recommendations: [
            '定期体检',
            '避免吸烟及二手烟'
          ],
          isNormal: true
        },
        doctorNote: '胸部CT扫描显示双肺野清晰，未见结节影，纵隔居中，心影大小形态正常。',
        images: ['chest-ct-1', 'chest-ct-2']
      },
      '3': {
        id: '3',
        title: '心电图检查报告',
        date: '2024-10-16',
        patientName: '张三',
        patientId: 'PAT-2024-0001',
        age: 35,
        gender: '男',
        department: '心内科',
        doctor: '陈医生',
        doctorTitle: '副主任医师',
        overview: {
          bloodPressure: '130/85 mmHg',
          heartRate: '68 次/分'
        },
        tests: [
          {
            name: '心电图',
            items: [
              { name: '心率', value: '68 次/分', normal: true, range: '60-100 次/分' },
              { name: '心律', value: '窦性心律', normal: true, range: '窦性心律' },
              { name: 'PR间期', value: '160 ms', normal: true, range: '120-200 ms' },
              { name: 'QT间期', value: '380 ms', normal: true, range: '340-440 ms' },
              { name: 'ST段', value: '无明显偏移', normal: true, range: '无偏移' }
            ]
          }
        ],
        diagnosis: {
          conclusion: '心电图大致正常',
          recommendations: [
            '适量运动',
            '定期复查'
          ],
          isNormal: true
        },
        doctorNote: '心电图显示窦性心律，心率正常，各波段形态未见明显异常改变。',
        images: ['ecg-1']
      },
      '4': {
        id: '4',
        title: '肝功能检查报告',
        date: '2024-10-14',
        patientName: '张三',
        patientId: 'PAT-2024-0001',
        age: 35,
        gender: '男',
        department: '消化内科',
        doctor: '张医生',
        doctorTitle: '主治医师',
        overview: {
          bloodPressure: '125/80 mmHg',
          heartRate: '75 次/分',
          bodyTemperature: '36.5°C'
        },
        tests: [
          {
            name: '肝功能',
            items: [
              { name: 'ALT', value: '45 U/L', normal: false, range: '5-40 U/L' },
              { name: 'AST', value: '35 U/L', normal: true, range: '8-40 U/L' },
              { name: '总胆红素', value: '17 μmol/L', normal: true, range: '5.1-19 μmol/L' },
              { name: '直接胆红素', value: '5 μmol/L', normal: true, range: '0-6.8 μmol/L' },
              { name: '总蛋白', value: '72 g/L', normal: true, range: '60-80 g/L' },
              { name: '白蛋白', value: '45 g/L', normal: true, range: '35-55 g/L' }
            ]
          }
        ],
        diagnosis: {
          conclusion: 'ALT轻度升高',
          recommendations: [
            '避免饮酒',
            '避免熬夜',
            '清淡饮食',
            '一个月后复查肝功能'
          ],
          isNormal: false
        },
        doctorNote: 'ALT轻度升高，可能与近期疲劳、饮酒或药物有关，建议调整生活方式后复查。',
        images: []
      },
      '5': {
        id: '5',
        title: '核磁共振检查报告',
        date: '2024-10-12',
        patientName: '张三',
        patientId: 'PAT-2024-0001',
        age: 35,
        gender: '男',
        department: '放射科',
        doctor: '赵医生',
        doctorTitle: '主任医师',
        overview: {
          bloodPressure: '120/80 mmHg',
          heartRate: '70 次/分'
        },
        tests: [
          {
            name: '头部MRI',
            items: [
              { name: '脑实质', value: '未见明显异常信号', normal: true, range: '正常' },
              { name: '脑室系统', value: '大小形态正常', normal: true, range: '正常' },
              { name: '脑沟裂池', value: '无增宽', normal: true, range: '正常' },
              { name: '中线结构', value: '居中', normal: true, range: '居中' }
            ]
          }
        ],
        diagnosis: {
          conclusion: '头部MRI未见明显异常',
          recommendations: [
            '保持良好的生活习惯',
            '避免头部外伤'
          ],
          isNormal: true
        },
        doctorNote: '头部MRI扫描显示脑实质信号均匀，脑室系统大小正常，中线结构居中，未见明显异常。',
        images: ['mri-1', 'mri-2', 'mri-3']
      },
      '6': {
        id: '6',
        title: 'B超检查报告',
        date: '2024-10-10',
        patientName: '张三',
        patientId: 'PAT-2024-0001',
        age: 35,
        gender: '男',
        department: '超声科',
        doctor: '钱医生',
        doctorTitle: '主治医师',
        overview: {
          bloodPressure: '125/85 mmHg',
          heartRate: '72 次/分'
        },
        tests: [
          {
            name: '腹部B超',
            items: [
              { name: '肝脏', value: '大小形态正常，实质回声均匀', normal: true, range: '正常' },
              { name: '胆囊', value: '大小正常，壁不厚，内未见异常回声', normal: true, range: '正常' },
              { name: '脾脏', value: '大小形态正常', normal: true, range: '正常' },
              { name: '胰腺', value: '大小形态正常，实质回声均匀', normal: true, range: '正常' },
              { name: '双肾', value: '大小形态正常，实质回声均匀，集合系统未见分离', normal: true, range: '正常' }
            ]
          }
        ],
        diagnosis: {
          conclusion: '腹部B超未见明显异常',
          recommendations: [
            '定期体检',
            '均衡饮食'
          ],
          isNormal: true
        },
        doctorNote: '腹部B超检查显示各脏器大小形态正常，未见明显异常回声，建议定期复查。',
        images: ['ultrasound-1']
      },
      '7': {
        id: '7',
        title: '尿常规检查报告',
        date: '2024-10-08',
        patientName: '张三',
        patientId: 'PAT-2024-0001',
        age: 35,
        gender: '男',
        department: '检验科',
        doctor: '孙医生',
        doctorTitle: '副主任医师',
        overview: {
          bloodPressure: '120/80 mmHg',
          heartRate: '70 次/分',
          bodyTemperature: '36.4°C'
        },
        tests: [
          {
            name: '尿常规',
            items: [
              { name: '尿蛋白', value: '阴性', normal: true, range: '阴性' },
              { name: '尿糖', value: '阴性', normal: true, range: '阴性' },
              { name: '红细胞', value: '0-2/HP', normal: true, range: '0-3/HP' },
              { name: '白细胞', value: '0-1/HP', normal: true, range: '0-5/HP' },
              { name: '潜血', value: '阴性', normal: true, range: '阴性' },
              { name: '比重', value: '1.020', normal: true, range: '1.010-1.030' },
              { name: 'pH值', value: '6.5', normal: true, range: '4.5-8.0' }
            ]
          }
        ],
        diagnosis: {
          conclusion: '尿常规检查结果正常',
          recommendations: [
            '多饮水',
            '保持良好的个人卫生'
          ],
          isNormal: true
        },
        doctorNote: '尿常规各项指标均在正常范围内，未见异常。',
        images: []
      },
      '8': {
        id: '8',
        title: 'X光胸片检查报告',
        date: '2024-10-06',
        patientName: '张三',
        patientId: 'PAT-2024-0001',
        age: 35,
        gender: '男',
        department: '放射科',
        doctor: '李医生',
        doctorTitle: '主治医师',
        overview: {
          bloodPressure: '125/80 mmHg',
          heartRate: '72 次/分'
        },
        tests: [
          {
            name: '胸部X光',
            items: [
              { name: '双肺野', value: '清晰', normal: true, range: '清晰' },
              { name: '肺门影', value: '结构清晰', normal: true, range: '结构清晰' },
              { name: '心影', value: '大小形态正常', normal: true, range: '正常' },
              { name: '膈面', value: '光整', normal: true, range: '光整' },
              { name: '肋膈角', value: '锐利', normal: true, range: '锐利' }
            ]
          }
        ],
        diagnosis: {
          conclusion: '胸部X光片未见明显异常',
          recommendations: [
            '定期体检',
            '避免吸烟'
          ],
          isNormal: true
        },
        doctorNote: '胸部X光检查显示双肺野清晰，心影大小形态正常，膈面光整，肋膈角锐利。',
        images: ['xray-1']
      },
      '9': {
        id: '9',
        title: '骨密度检测报告',
        date: '2024-10-04',
        patientName: '张三',
        patientId: 'PAT-2024-0001',
        age: 35,
        gender: '男',
        department: '康复科',
        doctor: '周医生',
        doctorTitle: '主治医师',
        overview: {
          bloodPressure: '120/80 mmHg',
          heartRate: '68 次/分',
          weight: '70 kg',
          height: '175 cm',
          bmi: '22.9'
        },
        tests: [
          {
            name: '骨密度检测',
            items: [
              { name: '腰椎L1-L4', value: '-1.2', normal: false, range: '>-1.0' },
              { name: '股骨颈', value: '-0.8', normal: true, range: '>-1.0' },
              { name: 'T值', value: '-1.2', normal: false, range: '>-1.0' },
              { name: 'Z值', value: '-0.5', normal: true, range: '>-2.0' }
            ]
          }
        ],
        diagnosis: {
          conclusion: '轻度骨质疏松',
          recommendations: [
            '增加钙质摄入，多食用奶制品、豆制品',
            '补充维生素D',
            '适量进行负重运动，如散步、慢跑',
            '避免吸烟、过量饮酒和咖啡因摄入',
            '一年后复查骨密度'
          ],
          isNormal: false
        },
        doctorNote: '骨密度检测显示轻度骨质疏松倾向，建议通过饮食、运动和补充剂来改善骨密度。',
        images: []
      },
      '10': {
        id: '10',
        title: '眼底检查报告',
        date: '2024-10-02',
        patientName: '张三',
        patientId: 'PAT-2024-0001',
        age: 35,
        gender: '男',
        department: '眼科',
        doctor: '吴医生',
        doctorTitle: '主任医师',
        overview: {
          bloodPressure: '130/85 mmHg',
          heartRate: '72 次/分',
          visualAcuity: '右眼 1.0, 左眼 1.0'
        },
        tests: [
          {
            name: '眼底检查',
            items: [
              { name: '视盘', value: '边界清晰，颜色正常', normal: true, range: '边界清晰' },
              { name: '视网膜血管', value: '动脉细窄，反光增强，A/V比值减小', normal: false, range: 'A/V=2:3' },
              { name: '黄斑区', value: '中心凹反光存在', normal: true, range: '存在' },
              { name: '视网膜', value: '可见散在出血点', normal: false, range: '无出血' }
            ]
          }
        ],
        diagnosis: {
          conclusion: '高血压性视网膜病变I期',
          recommendations: [
            '立即控制血压在正常范围',
            '规律服用降压药物',
            '低盐低脂饮食',
            '戒烟限酒',
            '1个月后复查眼底',
            '避免剧烈运动和情绪波动'
          ],
          isNormal: false
        },
        doctorNote: '眼底检查发现视网膜动脉细窄，A/V比值减小，并可见散在出血点，符合高血压性视网膜病变I期改变。建议立即控制血压，并定期复查。',
        images: ['fundus-1', 'fundus-2']
      }
    };

    // 根据报告ID获取对应的模拟数据
    const getReportByID = (reportId) => {
      // 确保reportId是字符串类型
      const stringId = String(reportId);
      
      // 验证ID格式是否为数字
      if (!/^\d+$/.test(stringId)) {
        console.warn('Invalid report ID format:', reportId);
        return reportData['1']; // 返回默认报告
      }
      
      // 返回对应的报告数据，如果不存在则返回默认报告
      const foundReport = reportData[stringId];
      if (!foundReport) {
        console.warn('Report not found for ID:', reportId, 'using default report');
        return reportData['1'];
      }
      
      return foundReport;
    };

    // 模拟获取报告详情数据
    const fetchReportDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 根据报告ID获取对应的模拟数据
        const mockReport = getReportByID(id);
        
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
        // 使用相同的模拟数据获取函数
        const mockReport = getReportByID(id);
        
        setReport(mockReport);
        setError(null);
      } catch (err) {
        setError('获取报告详情失败，请稍后重试');
        console.error('重新获取报告详情错误:', err);
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
          {report.overview.bloodPressure && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>血压</span>
              <span className={styles.infoValue}>{report.overview.bloodPressure}</span>
            </div>
          )}
          {report.overview.heartRate && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>心率</span>
              <span className={styles.infoValue}>{report.overview.heartRate}</span>
            </div>
          )}
          {report.overview.bodyTemperature && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>体温</span>
              <span className={styles.infoValue}>{report.overview.bodyTemperature}</span>
            </div>
          )}
          {report.overview.weight && report.overview.height && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>体重/身高</span>
              <span className={styles.infoValue}>{report.overview.weight} / {report.overview.height}</span>
            </div>
          )}
          {report.overview.bmi && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>BMI指数</span>
              <span className={styles.infoValue}>{report.overview.bmi}</span>
            </div>
          )}
          {report.overview.visualAcuity && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>视力</span>
              <span className={styles.infoValue}>{report.overview.visualAcuity}</span>
            </div>
          )}
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

      {/* 检查图像（如果有） */}
      {report.images && report.images.length > 0 && (
        <div className={styles.imagesSection}>
          <h3 className={styles.sectionTitle}>检查图像</h3>
          <div className={styles.imagesGrid}>
            {report.images.map((imageId, index) => (
              <div key={index} className={styles.imageContainer}>
                <div className={styles.imagePlaceholder}>
                  {/* 在实际应用中，这里应该是真实的图像 */}
                  <span className={styles.imageIcon}>🖼️</span>
                  <span className={styles.imageLabel}>{report.title} {index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 医生备注 */}
      <div className={styles.doctorNote}>
        <h4 className={styles.doctorNoteTitle}>医生备注</h4>
        <p className={styles.doctorNoteContent}>{report.doctorNote}</p>
      </div>
    </div>
  );
};

export default ReportDetail;