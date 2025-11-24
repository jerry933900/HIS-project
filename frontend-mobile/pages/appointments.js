import React from 'react';
import { Link } from 'next/link';
import styles from '../styles/Appointments.module.css';

/**
 * 预约页面组件 - 支持SSR的预约列表页面
 * 
 * @param {Object} props - 组件属性
 * @param {Array} props.appointments - 预约数据列表
 * @returns {JSX.Element}
 */
const AppointmentsPage = ({ appointments = [] }) => {
  // 服务端渲染友好的结构
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>我的预约</h1>
      </div>

      {/* 预约筛选栏 */}
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          <button className={styles.filterTabActive}>全部</button>
          <button className={styles.filterTab}>待就诊</button>
          <button className={styles.filterTab}>已完成</button>
          <button className={styles.filterTab}>已取消</button>
        </div>
      </div>

      {/* 预约列表 */}
      <div className={styles.appointmentsList}>
        {appointments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyText}>暂无预约记录</p>
            <Link href="/" className={styles.emptyAction}>去预约</Link>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              {/* 医生信息部分 */}
              <div className={styles.doctorSection}>
                <div className={styles.doctorInfo}>
                  <div className={styles.doctorName}>{appointment.doctorName}</div>
                  <div className={styles.doctorTitle}>
                    {appointment.doctorTitle} | {appointment.department}
                  </div>
                </div>
                <div className={styles.appointmentStatus}>
                  {appointment.status === 'pending' ? '待就诊' : 
                   appointment.status === 'completed' ? '已完成' : '已取消'}
                </div>
              </div>

              {/* 预约详情部分 */}
              <div className={styles.appointmentDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>就诊时间</span>
                  <span className={styles.detailValue}>
                    {appointment.date} {appointment.time}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>就诊类型</span>
                  <span className={styles.detailValue}>{appointment.type}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>预约编号</span>
                  <span className={styles.detailValue}>{appointment.bookingNumber}</span>
                </div>
              </div>

              {/* 操作按钮部分 */}
              <div className={styles.actionButtons}>
                {appointment.status === 'pending' && (
                  <>
                    <button className={styles.cancelButton}>取消预约</button>
                    <button className={styles.confirmButton}>确认就诊</button>
                  </>
                )}
                {appointment.status === 'completed' && (
                  <button className={styles.reviewButton}>评价医生</button>
                )}
                {appointment.status === 'cancelled' && (
                  <button className={styles.rebookButton}>重新预约</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * 服务端数据获取函数 - 在每次请求时获取预约数据
 * 这确保了用户看到的始终是最新的预约信息
 * 
 * @param {Object} context - Next.js请求上下文
 * @returns {Object} 包含props的对象，将传递给页面组件
 */
export async function getServerSideProps(context) {
  try {
    // 在实际项目中，这里会调用后端API获取数据
    // const res = await fetch('https://api.example.com/appointments');
    // const appointments = await res.json();
    
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟预约数据
    const appointments = [
      {
        id: 'apt001',
        doctorName: '张医生',
        doctorTitle: '主任医师',
        department: '内科',
        date: '2023-11-15',
        time: '09:30',
        type: '门诊',
        bookingNumber: 'BN20231115001',
        status: 'pending' // pending, completed, cancelled
      },
      {
        id: 'apt002',
        doctorName: '李医生',
        doctorTitle: '副主任医师',
        department: '儿科',
        date: '2023-11-10',
        time: '14:00',
        type: '复诊',
        bookingNumber: 'BN20231110002',
        status: 'completed'
      },
      {
        id: 'apt003',
        doctorName: '王医生',
        doctorTitle: '主治医师',
        department: '外科',
        date: '2023-11-05',
        time: '10:30',
        type: '门诊',
        bookingNumber: 'BN20231105003',
        status: 'cancelled'
      }
    ];

    return {
      props: {
        appointments
      }
    };
  } catch (error) {
    console.error('获取预约数据失败:', error);
    // 发生错误时返回空数组，避免页面崩溃
    return {
      props: {
        appointments: []
      }
    };
  }
}

export default AppointmentsPage;