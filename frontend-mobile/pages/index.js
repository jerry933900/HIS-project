import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

// 模拟数据 - 移动端数据录入和查看专用
const departments = [
  { id: 1, name: '内科', description: '内科疾病诊疗', doctorCount: 15, icon: '💊', count: 128 },
  { id: 2, name: '外科', description: '外科手术与治疗', doctorCount: 12, icon: '🔪', count: 96 },
  { id: 3, name: '儿科', description: '儿童疾病诊治', doctorCount: 10, icon: '👶', count: 156 },
  { id: 4, name: '妇产科', description: '妇产科疾病诊疗', doctorCount: 8, icon: '🤱', count: 87 },
  { id: 5, name: '眼科', description: '眼部疾病诊疗', doctorCount: 6, icon: '👁️', count: 64 },
  { id: 6, name: '口腔科', description: '口腔疾病诊疗', doctorCount: 9, icon: '🦷', count: 102 },
];

const quickActions = [
  { id: 1, title: '患者信息录入', icon: '📝', link: '/patient-form', priority: 'high' },
  { id: 2, title: '预约挂号', icon: '📅', link: '/appointment', priority: 'high' },
  { id: 3, title: '预约记录', icon: '📋', link: '/appointment-records', priority: 'high' },
  { id: 4, title: '我的检查报告', icon: '📊', link: '/reports', priority: 'medium' },
  { id: 5, title: '在线咨询', icon: '💬', link: '/consultation', priority: 'medium' },
  { id: 6, title: '个人中心', icon: '👤', link: '/profile', priority: 'medium' },
];

const recentAppointments = [
  { id: 1001, department: '内科', doctor: '张医生', date: '2025-11-25', time: '09:30', status: '已确认', departmentId: 1 },
  { id: 1002, department: '外科', doctor: '李医生', date: '2025-11-28', time: '14:00', status: '待审核', departmentId: 2 },
  { id: 1003, department: '儿科', doctor: '王医生', date: '2025-11-30', time: '10:15', status: '已完成', departmentId: 3 },
  { id: 1004, department: '妇产科', doctor: '赵医生', date: '2025-12-05', time: '15:00', status: '待确认', departmentId: 4 },
];

const topDoctors = [
  { id: 1, name: '张医生', department: '内科', title: '主任医师', rating: 4.9, patientCount: 1200, available: true },
  { id: 2, name: '李医生', department: '外科', title: '副主任医师', rating: 4.8, patientCount: 980, available: true },
  { id: 3, name: '王医生', department: '儿科', title: '主任医师', rating: 4.7, patientCount: 1500, available: false },
];

const recentPatients = [
  { id: 2001, name: '张三', age: 35, gender: '男', lastVisit: '2025-11-20', status: '已审核' },
  { id: 2002, name: '李四', age: 42, gender: '女', lastVisit: '2025-11-18', status: '已审核' },
  { id: 2003, name: '王五', age: 12, gender: '男', lastVisit: '2025-11-22', status: '待审核' },
];

const systemNotifications = [
  { id: 3001, title: '您的预约已确认', time: '10分钟前', important: true },
  { id: 3002, title: '患者信息审核通过', time: '2小时前', important: false },
  { id: 3003, title: '新的检查报告已生成', time: '昨天', important: true },
];

const healthReminders = [
  { id: 4001, title: '记得按时服药', time: '今天 18:00', department: '内科' },
  { id: 4002, title: '复诊提醒', time: '2025-12-05', department: '皮肤科' },
];

function Home() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [healthReminders, setHealthReminders] = useState([]);
  const [patientStats, setPatientStats] = useState([]);

  useEffect(() => {
    // 更新当前时间和日期
    const updateDateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
      
      // 格式化日期
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const date = now.getDate().toString().padStart(2, '0');
      // const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
      setCurrentDate(`${year}-${month}-${date}`);
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 60000);

    // 模拟数据 - 数据统计卡片
    setPatientStats([
      { id: 1, title: '今日就诊', value: 48, icon: '🏥', trend: '+5%', color: '#1890ff' },
      { id: 2, title: '待处理', value: 12, icon: '⏳', trend: '-3%', color: '#faad14' },
      { id: 3, title: '本周挂号', value: 156, icon: '📅', trend: '+8%', color: '#52c41a' },
      { id: 4, title: '总患者数', value: 1258, icon: '👥', trend: '+2%', color: '#722ed1' },
    ]);

    // 模拟数据 - 系统通知
    setNotifications([
      { id: 1, title: '系统维护通知', message: '系统将于今晚23:00-次日01:00进行维护，请提前做好准备。', time: '10分钟前' },
      { id: 2, title: '新功能上线', message: '移动端预约挂号功能已上线，欢迎体验！', time: '1小时前' },
      { id: 3, title: '数据备份完成', message: '系统数据已完成每周备份，请放心使用。', time: '2小时前' },
    ]);

    // 模拟数据 - 健康提醒
    setHealthReminders([
      { id: 1, title: '高血压患者随访提醒', message: '您有5位高血压患者需要进行月度随访。', level: 'high' },
      { id: 2, title: '疫苗接种提醒', message: '3位儿童需要按时接种疫苗，请通知家长。', level: 'medium' },
      { id: 3, title: '定期体检提醒', message: '10位45岁以上患者需要安排年度体检。', level: 'low' },
    ]);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.container}>
      {/* 头部 */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>医院信息系统</h1>
            <p className={styles.subtitle}>患者移动端</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.timeContainer}>
              <span className={styles.currentDate}>{currentDate}</span>
               {' '}
              <span className={styles.currentTime}>{currentTime}</span>{' '}
              <span>{`星期${['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()]}`}</span>
            </div>
            <div className={styles.notificationContainer}>
              <div className={styles.notificationIcon}>🔔</div>
              <div className={styles.notificationBadge}>{notifications.length}</div>
            </div>
          </div>
        </div>
        <div className={styles.welcomeMessage}>
          您好！欢迎使用移动医疗服务
        </div>
      </header>

      {/* 数据统计卡片 */}
      <section className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>数据统计</h2>
        <div className={styles.statsGrid}>
          {patientStats.map((stat) => (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}20` }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue} style={{ color: stat.color }}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.title}</div>
                <div className={styles.statTrend}>{stat.trend}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 快捷功能 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>快捷功能</h2>
        <div className={styles.quickActions}>
          {quickActions.map((action) => (
            <Link key={action.id} href={action.link} className={`${styles.actionItem} ${action.priority === 'high' ? styles.priorityHigh : ''}`}>
              <div className={styles.actionIcon}>{action.icon}</div>
              <div className={styles.actionTitle}>{action.title}</div>
              {action.priority === 'high' && <div className={styles.priorityBadge}>重要</div>}
            </Link>
          ))}
        </div>
      </section>

      {/* 科室展示 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>热门科室</h2>
          <Link href="/departments" className={styles.viewMore}>更多</Link>
        </div>
        <div className={styles.departmentGrid}>
          {departments.map((dept) => (
            <Link key={dept.id} href={`/departments/${dept.id}`} className={styles.departmentCard}>
              <div className={styles.departmentIcon}>{dept.icon}</div>
              <h3 className={styles.departmentName}>{dept.name}</h3>
              <p className={styles.departmentDesc}>{dept.description}</p>
              <div className={styles.departmentStats}>
                <span className={styles.doctorCount}>医生: {dept.doctorCount}人</span>
                <span className={styles.patientCount}>患者: {dept.count}人</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 最近录入患者 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>最近录入患者</h2>
          <Link href="/patient-form" className={styles.viewMore}>录入新患者</Link>
        </div>
        <div className={styles.patientList}>
          {recentPatients.map((patient) => (
            <Link key={patient.id} href={`/patient-form?id=${patient.id}`} className={styles.patientCard}>
              <div className={styles.patientInfo}>
                <h3 className={styles.patientName}>{patient.name}</h3>
                <div className={styles.patientMeta}>
                  <span>{patient.age}岁</span>
                  <span>{patient.gender}</span>
                  <span>最后就诊: {patient.lastVisit}</span>
                </div>
              </div>
              <div className={`${styles.statusBadge} ${patient.status === '已审核' ? styles.statusApproved : styles.statusPending}`}>
                {patient.status}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 最近预约 */}
      {recentAppointments.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>最近预约</h2>
            <Link href="/appointment-records" className={styles.viewMore}>查看全部</Link>
          </div>
          <div className={styles.appointmentList}>
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className={styles.appointmentCard}>
                <div className={styles.appointmentHeader}>
                  <span className={styles.appointmentDepartment}>{appointment.department}</span>
                  <span className={`${styles.statusBadge} ${appointment.status === '已预约' ? styles.statusConfirmed : appointment.status === '待审核' ? styles.statusPending : styles.statusCompleted}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className={styles.appointmentInfo}>
                  <div className={styles.appointmentDetail}>
                    <strong>医生:</strong> {appointment.doctor}
                  </div>
                  <div className={styles.appointmentDetail}>
                    <strong>时间:</strong> {appointment.date} {appointment.time}
                  </div>
                </div>
                <div className={styles.appointmentActions}>
                  <Link href={`/appointment-records/${appointment.id}`} className={styles.detailButton}>查看详情</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 推荐医生 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>推荐医生</h2>
          <Link href="/doctors" className={styles.viewMore}>更多</Link>
        </div>
        <div className={styles.doctorList}>
          {topDoctors.map((doctor) => (
            <div key={doctor.id} className={styles.doctorCard}>
              <div className={styles.doctorInfo}>
                <h3 className={styles.doctorName}>{doctor.name}</h3>
                <p className={styles.doctorDepartment}>{doctor.department} · {doctor.title}</p>
                <div className={styles.doctorRating}>
                  <span className={styles.ratingStar}>⭐</span>
                  <span>{doctor.rating}</span>
                  <span className={styles.patientCount}>({doctor.patientCount}人次就诊)</span>
                </div>
              </div>
              <Link href={`/appointment?doctorId=${doctor.id}`} className={styles.appointButton}>预约</Link>
            </div>
          ))}
        </div>
      </section>

      {/* 系统通知 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>系统通知</h2>
        <div className={styles.notificationList}>
          {notifications.map((notification) => (
            <div key={notification.id} className={styles.notificationItem}>
              <div className={styles.notificationIcon}>📢</div>
              <div className={styles.notificationContent}>
                <h4 className={styles.notificationTitle}>{notification.title}</h4>
                <p className={styles.notificationMessage}>{notification.message}</p>
                <p className={styles.notificationTime}>{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 健康提醒 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>健康提醒</h2>
        <div className={styles.reminderList}>
          {healthReminders.map((reminder) => (
            <div key={reminder.id} className={`${styles.reminderCard} ${styles[`level${reminder.level.charAt(0).toUpperCase() + reminder.level.slice(1)}`]}`}>
              <div className={styles.reminderIcon}>
                {reminder.level === 'high' ? '🔴' : reminder.level === 'medium' ? '🟡' : '🟢'}
              </div>
              <div className={styles.reminderContent}>
                <h4 className={styles.reminderTitle}>{reminder.title}</h4>
                <p className={styles.reminderMessage}>{reminder.message}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 使用说明 */}
      <section className={styles.section}>
        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>使用说明</h3>
          <p className={styles.infoText}>本移动应用主要用于患者信息录入和查询。所有录入的数据将发送至PC端由管理员进行审核和处理。</p>
          <div className={styles.infoActions}>
            <Link href="/patient-form" className={styles.primaryAction}>立即录入患者信息</Link>
            <Link href="/appointment" className={styles.secondaryAction}>预约挂号</Link>
          </div>
        </div>
      </section>

      {/* 底部导航提示 */}
      <footer className={styles.footer}>
        <p>请使用底部导航栏访问其他功能</p>
      </footer>
    </div>
  );
}

export default Home;