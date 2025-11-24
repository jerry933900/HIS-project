import { useState, useEffect } from 'react';
import { useRouter, Link } from 'next/link';
import styles from '../styles/PatientView.module.css';

export default function PatientView() {
  const router = useRouter();
  const { id } = router.query;
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 模拟从API获取患者数据
  useEffect(() => {
    // 如果没有患者ID，显示错误
    if (!id) {
      setError('未找到患者信息');
      setLoading(false);
      return;
    }

    // 模拟API请求延迟
    const fetchPatientData = async () => {
      try {
        // 这里使用模拟数据，实际应该从API获取
        // 模拟数据
        const mockPatientData = {
          id: id,
          name: '张三',
          gender: '男',
          age: 45,
          idCard: '110101199001011234',
          phone: '13800138000',
          address: '北京市朝阳区健康路88号',
          bloodType: 'A型',
          height: 175,
          weight: 70,
          temperature: 36.5,
          bloodPressure: '120/80',
          pulseRate: 72,
          respiratoryRate: 16,
          medicalHistory: '高血压病史3年，规律服用降压药物。',
          allergyHistory: '对青霉素过敏。',
          chiefComplaint: '头痛、头晕2天',
          symptoms: '患者诉2天前无明显诱因出现头痛、头晕，伴轻度恶心，无呕吐。',
          visitType: 'regular',
          priority: 'medium',
          contactName: '李四',
          contactPhone: '13900139000',
          relationship: '配偶',
          insuranceType: '社会医疗保险',
          insuranceNumber: '110101199000012345',
          createdAt: '2024-01-15 14:30:00',
          updatedAt: '2024-01-15 15:45:00',
          doctorName: '王医生',
          department: '内科',
          diagnosis: '高血压病2级',
          treatmentPlan: '调整降压药物，控制血压，定期监测。'
        };

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setPatientData(mockPatientData);
      } catch (err) {
        setError('获取患者信息失败');
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  // 处理返回按钮
  const handleGoBack = () => {
    router.back();
  };

  // 处理编辑按钮
  const handleEdit = () => {
    router.push(`/patient-form?id=${id}`);
  };

  // 加载中状态
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>患者信息</h1>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !patientData) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleGoBack}>
            返回
          </button>
          <h1 className={styles.title}>患者信息</h1>
        </div>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error || '患者信息不存在'}</p>
          <Link href="/" className={styles.homeLink}>返回首页</Link>
        </div>
      </div>
    );
  }

  // 格式化就诊类型
  const formatVisitType = (type) => {
    const types = {
      regular: '普通门诊',
      followup: '复诊',
      specialist: '专科门诊'
    };
    return types[type] || type;
  };

  // 格式化优先级
  const formatPriority = (priority) => {
    const priorities = {
      low: '低',
      medium: '中',
      high: '高'
    };
    return priorities[priority] || priority;
  };

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleGoBack}>
          返回
        </button>
        <h1 className={styles.title}>患者详细信息</h1>
        <button className={styles.editButton} onClick={handleEdit}>
          编辑
        </button>
      </div>

      {/* 基本信息卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>基本信息</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>患者姓名:</span>
            <span className={styles.infoValue}>{patientData.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>性别:</span>
            <span className={styles.infoValue}>{patientData.gender}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>年龄:</span>
            <span className={styles.infoValue}>{patientData.age}岁</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>身份证号:</span>
            <span className={styles.infoValue}>{patientData.idCard}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>联系电话:</span>
            <span className={styles.infoValue}>{patientData.phone}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>居住地址:</span>
            <span className={styles.infoValue}>{patientData.address}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>血型:</span>
            <span className={styles.infoValue}>{patientData.bloodType || '未填写'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>身高/体重:</span>
            <span className={styles.infoValue}>
              {patientData.height ? `${patientData.height}cm` : '未填写'} / 
              {patientData.weight ? `${patientData.weight}kg` : '未填写'}
            </span>
          </div>
        </div>
      </div>

      {/* 健康信息卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>健康信息</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.vitalsGrid}>
            <div className={styles.vitalItem}>
              <div className={styles.vitalLabel}>体温</div>
              <div className={styles.vitalValue}>
                {patientData.temperature ? `${patientData.temperature}℃` : '未测量'}
              </div>
            </div>
            <div className={styles.vitalItem}>
              <div className={styles.vitalLabel}>血压</div>
              <div className={styles.vitalValue}>
                {patientData.bloodPressure || '未测量'}
              </div>
            </div>
            <div className={styles.vitalItem}>
              <div className={styles.vitalLabel}>脉搏</div>
              <div className={styles.vitalValue}>
                {patientData.pulseRate ? `${patientData.pulseRate}次/分` : '未测量'}
              </div>
            </div>
            <div className={styles.vitalItem}>
              <div className={styles.vitalLabel}>呼吸</div>
              <div className={styles.vitalValue}>
                {patientData.respiratoryRate ? `${patientData.respiratoryRate}次/分` : '未测量'}
              </div>
            </div>
          </div>
          
          <div className={styles.infoGroup}>
            <h3 className={styles.infoGroupTitle}>既往病史</h3>
            <p className={styles.infoText}>{patientData.medicalHistory || '无'}</p>
          </div>
          
          <div className={styles.infoGroup}>
            <h3 className={styles.infoGroupTitle}>过敏史</h3>
            <p className={styles.infoText}>{patientData.allergyHistory || '无'}</p>
          </div>
        </div>
      </div>

      {/* 就诊信息卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>就诊信息</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>主诉:</span>
            <span className={styles.infoValue}>{patientData.chiefComplaint}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>症状详情:</span>
            <span className={styles.infoValue}>{patientData.symptoms}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>就诊类型:</span>
            <span className={styles.infoValue}>{formatVisitType(patientData.visitType)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>优先级:</span>
            <span className={`${styles.infoValue} ${styles[`priority${patientData.priority.charAt(0).toUpperCase() + patientData.priority.slice(1)}`]}`}>
              {formatPriority(patientData.priority)}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>接诊医生:</span>
            <span className={styles.infoValue}>{patientData.doctorName}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>就诊科室:</span>
            <span className={styles.infoValue}>{patientData.department}</span>
          </div>
          <div className={styles.infoGroup}>
            <h3 className={styles.infoGroupTitle}>诊断</h3>
            <p className={styles.infoText}>{patientData.diagnosis || '待诊断'}</p>
          </div>
          <div className={styles.infoGroup}>
            <h3 className={styles.infoGroupTitle}>治疗方案</h3>
            <p className={styles.infoText}>{patientData.treatmentPlan || '待制定'}</p>
          </div>
        </div>
      </div>

      {/* 联系和保险信息卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>联系与保险信息</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.infoGroup}>
            <h3 className={styles.infoGroupTitle}>紧急联系人</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>姓名:</span>
              <span className={styles.infoValue}>{patientData.contactName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>电话:</span>
              <span className={styles.infoValue}>{patientData.contactPhone}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>关系:</span>
              <span className={styles.infoValue}>{patientData.relationship}</span>
            </div>
          </div>
          
          <div className={styles.infoGroup}>
            <h3 className={styles.infoGroupTitle}>保险信息</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>保险类型:</span>
              <span className={styles.infoValue}>{patientData.insuranceType || '未提供'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>保险号码:</span>
              <span className={styles.infoValue}>{patientData.insuranceNumber || '未提供'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 时间信息 */}
      <div className={styles.timeInfo}>
        <p>创建时间: {patientData.createdAt}</p>
        <p>更新时间: {patientData.updatedAt}</p>
      </div>

      {/* 底部导航按钮 */}
      <div className={styles.bottomActions}>
        <Link href="/appointment" className={styles.actionButton}>
          预约挂号
        </Link>
        <Link href="/appointment-records" className={styles.actionButton}>
          就诊记录
        </Link>
      </div>
    </div>
  );
}