import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../styles/Statistics.module.css';

// 模拟数据 - 各类统计数据的详细信息
const detailedStatsData = {
  '今日就诊': {
    title: '今日就诊统计',
    icon: '🏥',
    color: '#1890ff',
    total: 48,
    breakdown: [
      { department: '内科', count: 15 },
      { department: '外科', count: 8 },
      { department: '儿科', count: 12 },
      { department: '妇产科', count: 5 },
      { department: '眼科', count: 3 },
      { department: '口腔科', count: 5 },
    ],
    timeDistribution: [
      { time: '08:00-10:00', count: 12 },
      { time: '10:00-12:00', count: 16 },
      { time: '14:00-16:00', count: 14 },
      { time: '16:00-18:00', count: 6 },
    ],
    trend: '+5%',
    comparedTo: '昨日'
  },
  '待处理': {
    title: '待处理业务统计',
    icon: '⏳',
    color: '#faad14',
    total: 12,
    breakdown: [
      { type: '待审核预约', count: 5 },
      { type: '待处理检查', count: 3 },
      { type: '待确认缴费', count: 4 },
    ],
    urgency: [
      { level: '紧急', count: 2 },
      { level: '中等', count: 7 },
      { level: '一般', count: 3 },
    ],
    trend: '-3%',
    comparedTo: '昨日'
  },
  '本周挂号': {
    title: '本周挂号统计',
    icon: '📅',
    color: '#52c41a',
    total: 156,
    breakdown: [
      { day: '周一', count: 28 },
      { day: '周二', count: 22 },
      { day: '周三', count: 31 },
      { day: '周四', count: 26 },
      { day: '周五', count: 24 },
      { day: '周六', count: 15 },
      { day: '周日', count: 10 },
    ],
    departmentDistribution: [
      { department: '内科', count: 45 },
      { department: '儿科', count: 38 },
      { department: '外科', count: 24 },
      { department: '妇产科', count: 18 },
      { department: '其他科室', count: 31 },
    ],
    trend: '+8%',
    comparedTo: '上周'
  },
  '总患者数': {
    title: '总患者数统计',
    icon: '👥',
    color: '#722ed1',
    total: 1258,
    breakdown: [
      { category: '复诊患者', count: 890 },
      { category: '初诊患者', count: 368 },
    ],
    monthlyGrowth: [
      { month: '1月', count: 1120 },
      { month: '2月', count: 1145 },
      { month: '3月', count: 1178 },
      { month: '4月', count: 1210 },
      { month: '5月', count: 1258 },
    ],
    trend: '+2%',
    comparedTo: '上月'
  },
  '今日新患者': {
    title: '今日新患者统计',
    icon: '👶',
    color: '#eb2f96',
    total: 23,
    breakdown: [
      { ageRange: '0-18岁', count: 5 },
      { ageRange: '19-35岁', count: 8 },
      { ageRange: '36-50岁', count: 6 },
      { ageRange: '51岁以上', count: 4 },
    ],
    genderDistribution: [
      { gender: '男性', count: 11 },
      { gender: '女性', count: 12 },
    ],
    trend: '+12%',
    comparedTo: '昨日'
  },
  '平均等待时间': {
    title: '平均等待时间统计',
    icon: '⏰',
    color: '#fa8c16',
    total: '18分钟',
    breakdown: [
      { department: '内科', time: '15分钟' },
      { department: '外科', time: '20分钟' },
      { department: '儿科', time: '22分钟' },
      { department: '妇产科', time: '18分钟' },
      { department: '眼科', time: '12分钟' },
      { department: '口腔科', time: '16分钟' },
    ],
    timeDistribution: [
      { period: '早高峰', time: '25分钟' },
      { period: '上午平峰', time: '15分钟' },
      { period: '下午平峰', time: '12分钟' },
      { period: '晚高峰', time: '20分钟' },
    ],
    trend: '-5%',
    comparedTo: '昨日'
  }
};

function Statistics() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statType = searchParams.get('type') || '今日就诊';
  const statId = searchParams.get('id');
  const [statData, setStatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      const data = detailedStatsData[statType] || detailedStatsData['今日就诊'];
      setStatData(data);
      setLoading(false);
    }, 300);
  }, [statType]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  // 导出数据为CSV格式
  const exportData = () => {
    if (!statData) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // 添加标题行
    csvContent += `${statData.title}\n`;
    csvContent += `总数量,${statData.total}\n`;
    csvContent += `趋势,${statData.trend}\n\n`;
    
    // 添加明细数据
    if (statData.breakdown) {
      csvContent += '明细数据\n';
      const firstItem = statData.breakdown[0];
      const labelKey = Object.keys(firstItem).find(key => 
        ['department', 'type', 'day', 'category', 'ageRange', 'gender'].includes(key));
      const valueKey = Object.keys(firstItem).find(key => 
        ['count', 'time'].includes(key));
      
      csvContent += `${labelKey},${valueKey}\n`;
      statData.breakdown.forEach(item => {
        csvContent += `${item[labelKey]},${item[valueKey]}\n`;
      });
      csvContent += '\n';
    }
    
    // 添加其他分布数据
    const distributions = [
      { key: 'timeDistribution', name: '时间分布' },
      { key: 'departmentDistribution', name: '科室分布' },
      { key: 'urgency', name: '紧急程度分布' },
      { key: 'genderDistribution', name: '性别分布' },
      { key: 'monthlyGrowth', name: '月度增长趋势' }
    ];
    
    distributions.forEach(dist => {
      if (statData[dist.key]) {
        csvContent += `${dist.name}\n`;
        const firstItem = statData[dist.key][0];
        const labelKey = Object.keys(firstItem).find(key => 
          ['time', 'period', 'department', 'level', 'gender', 'month'].includes(key));
        const valueKey = Object.keys(firstItem).find(key => 
          ['count', 'time'].includes(key));
        
        csvContent += `${labelKey},${valueKey}\n`;
        statData[dist.key].forEach(item => {
          csvContent += `${item[labelKey]},${item[valueKey]}\n`;
        });
        csvContent += '\n';
      }
    });
    
    // 创建下载链接
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${statData.title}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    
    // 触发下载
    link.click();
    
    // 清理
    document.body.removeChild(link);
  };
  
  // 获取历史记录数据
  const fetchHistoryData = () => {
    setHistoryLoading(true);
    setShowHistory(true);
    
    // 模拟历史数据
    setTimeout(() => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString();
        
        // 根据不同统计类型生成不同的历史数据
        let value = 0;
        switch (statType) {
          case '今日就诊':
            value = 40 + Math.floor(Math.random() * 20);
            break;
          case '待处理':
            value = 8 + Math.floor(Math.random() * 10);
            break;
          case '本周挂号':
            value = 140 + Math.floor(Math.random() * 40);
            break;
          case '总患者数':
            value = 1200 + Math.floor(Math.random() * 100);
            break;
          case '今日新患者':
            value = 15 + Math.floor(Math.random() * 15);
            break;
          case '平均等待时间':
            value = `${15 + Math.floor(Math.random() * 10)}分钟`;
            break;
          default:
            value = 0;
        }
        
        days.push({
          date: dateStr,
          value: value,
          trend: `${(Math.random() > 0.5 ? '+' : '')}${Math.floor(Math.random() * 20) - 10}%`
        });
      }
      
      setHistoryData(days);
      setHistoryLoading(false);
    }, 500);
  };
  
  // 渲染简单的条形图表示数据分布
  const renderSimpleChart = (data, valueKey, labelKey) => {
    // 找出最大值用于归一化
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    
    return (
      <div className={styles.chartContainer}>
        {data.map((item, index) => {
          const barWidth = `${(item[valueKey] / maxValue) * 100}%`;
          return (
            <div key={index} className={styles.chartBar}>
              <div className={styles.chartBarLabel}>{item[labelKey]}</div>
              <div className={styles.chartBarFill} style={{ width: barWidth, backgroundColor: statData.color }}></div>
              <div className={styles.chartBarValue}>{item[valueKey]}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* 头部 */}
      <header className={styles.header}>
        <div className={styles.backButton} onClick={() => router.back()}>
          ← 返回
        </div>
        <h1 className={styles.title}>{statData.title}</h1>
        <div className={styles.placeholder}></div>
      </header>

      {/* 主要统计卡片 */}
      <section className={styles.mainStatsCard}>
        <div className={styles.mainStatsHeader}>
          <div className={styles.mainStatsIcon} style={{ backgroundColor: `${statData.color}20` }}>
            <span style={{ color: statData.color }}>{statData.icon}</span>
          </div>
          <div className={styles.mainStatsInfo}>
            <div className={styles.mainStatsValue} style={{ color: statData.color }}>{statData.total}</div>
            <div className={`${styles.mainStatsTrend} ${statData.trend.startsWith('+') ? styles.trendUp : styles.trendDown}`}>
              {statData.trend} vs {statData.comparedTo}
            </div>
          </div>
        </div>
      </section>

      {/* 数据明细 */}
      <section className={styles.detailsSection}>
        <h2 className={styles.sectionTitle}>数据明细</h2>
        
        {/* 根据不同类型显示不同的明细内容 */}
        {renderSimpleChart(statData.breakdown, 'count' in statData.breakdown[0] ? 'count' : 'time', 
          'department' in statData.breakdown[0] ? 'department' : 
          'type' in statData.breakdown[0] ? 'type' : 
          'day' in statData.breakdown[0] ? 'day' : 
          'category' in statData.breakdown[0] ? 'category' : 
          'ageRange' in statData.breakdown[0] ? 'ageRange' : 'gender')}
      </section>

      {/* 次要明细数据 */}
      {statData.timeDistribution && (
        <section className={styles.detailsSection}>
          <h2 className={styles.sectionTitle}>时间分布</h2>
          {renderSimpleChart(statData.timeDistribution, 'count' in statData.timeDistribution[0] ? 'count' : 'time', 
            'time' in statData.timeDistribution[0] ? 'time' : 'period')}
        </section>
      )}

      {statData.departmentDistribution && (
        <section className={styles.detailsSection}>
          <h2 className={styles.sectionTitle}>科室分布</h2>
          {renderSimpleChart(statData.departmentDistribution, 'count', 'department')}
        </section>
      )}

      {statData.urgency && (
        <section className={styles.detailsSection}>
          <h2 className={styles.sectionTitle}>紧急程度分布</h2>
          {renderSimpleChart(statData.urgency, 'count', 'level')}
        </section>
      )}

      {statData.genderDistribution && (
        <section className={styles.detailsSection}>
          <h2 className={styles.sectionTitle}>性别分布</h2>
          {renderSimpleChart(statData.genderDistribution, 'count', 'gender')}
        </section>
      )}

      {statData.monthlyGrowth && (
        <section className={styles.detailsSection}>
          <h2 className={styles.sectionTitle}>月度增长趋势</h2>
          {renderSimpleChart(statData.monthlyGrowth, 'count', 'month')}
        </section>
      )}
      
      {/* 历史记录抽屉 */}
      <div className={`${styles.drawerOverlay} ${showHistory ? styles.drawerOverlayVisible : ''}`} onClick={() => setShowHistory(false)}></div>
      <div className={`${styles.historyDrawer} ${showHistory ? styles.historyDrawerOpen : ''}`}>
        <div className={styles.drawerHandle}></div>
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>历史记录 (近7天)</h2>
          <button 
            className={styles.drawerCloseButton}
            onClick={() => setShowHistory(false)}
          >
            ✕
          </button>
        </div>
        
        <div className={styles.drawerContent}>
          {historyLoading ? (
            <div className={styles.loadingContainer}>
              <p>加载历史数据中...</p>
            </div>
          ) : (
            <div className={styles.historyList}>
              {historyData.map((item, index) => (
                <div key={index} className={styles.historyItem}>
                  <div className={styles.historyDate}>{item.date}</div>
                  <div className={styles.historyInfo}>
                    <div className={styles.historyValue}>{item.value}</div>
                    <div className={`${styles.historyTrend} ${item.trend.startsWith('+') ? styles.trendUp : styles.trendDown}`}>
                      {item.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <section className={styles.actionsSection}>
        <button className={styles.actionButton} onClick={exportData}>
          导出数据
        </button>
        <button className={styles.actionButton} onClick={fetchHistoryData}>
          查看历史记录
        </button>
      </section>

      {/* 底部导航提示 */}
      <footer className={styles.footer}>
        <p>数据统计详情页面</p>
      </footer>
    </div>
  );
}

export default Statistics;