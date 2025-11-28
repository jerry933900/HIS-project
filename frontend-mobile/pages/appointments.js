import React, { useState } from 'react';
import { Link } from 'next/link';
import styles from '../styles/Appointments.module.css';

/**
 * 预约页面组件 - 支持SSR的预约列表页面，包含筛选功能
 * 
 * @param {Object} props - 组件属性
 * @param {Array} props.appointments - 预约数据列表
 * @returns {JSX.Element}
 */
const AppointmentsPage = ({ appointments = [] }) => {
  // 状态管理 - 当前选中的筛选标签
  const [activeFilter, setActiveFilter] = useState('all');

  // 根据筛选标签过滤预约数据
  const filteredAppointments = appointments.filter(appointment => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return appointment.status === 'pending';
    if (activeFilter === 'completed') return appointment.status === 'completed';
    if (activeFilter === 'cancelled') return appointment.status === 'cancelled';
    return true;
  });

  // 筛选标签数据
  const filterTabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待就诊' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' }
  ];

  return (
    <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>我的预约</h1>
        </div>

        {/* 预约筛选栏 */}
        <div className={styles.filterBar}>
          <div className={styles.filterTabs}>
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                className={activeFilter === tab.key ? styles.filterTabActive : styles.filterTab}
                onClick={() => setActiveFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 预约列表 */}
        <div className={styles.appointmentsList}>
          {filteredAppointments.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <p className={styles.emptyText}>
                {activeFilter === 'all' ? '暂无预约记录' : `暂无${filterTabs.find(t => t.key === activeFilter)?.label}的预约记录`}
              </p>
              <Link href="/appointment" className={styles.emptyAction}>去预约</Link>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className={styles.appointmentCard}
                data-status={appointment.status}
              >
                {/* 医生信息部分 */}
                <div className={styles.doctorSection}>
                  <div className={styles.doctorInfo}>
                    <div className={styles.doctorAvatar}>
                      {appointment.doctorName.charAt(0)}
                    </div>
                    <div className={styles.doctorDetails}>
                      <div className={styles.doctorName}>
                        {appointment.doctorName}
                      </div>
                      <div className={styles.doctorTitle}>
                        {appointment.doctorTitle} 
                        <span>•</span> 
                        {appointment.department}
                      </div>
                    </div>
                  </div>
                  <div className={`${styles.appointmentStatus} ${styles[`status${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}`]}`}>
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
                    <button className={styles.cancelButton} onClick={() => alert('已取消预约')}>取消预约</button>
                    <button className={styles.confirmButton} onClick={() => alert('已确认就诊')}>确认就诊</button>
                  </>
                )}
                {appointment.status === 'completed' && (
                  <button className={styles.reviewButton} onClick={() => alert('跳转到评价页面')}>评价医生</button>
                )}
                {appointment.status === 'cancelled' && (
                  <button className={styles.rebookButton} onClick={() => alert('跳转到重新预约页面')}>重新预约</button>
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
    
    // 模拟预约数据 - 添加更多不同状态的数据用于演示筛选功能
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
      },
      // 新增待就诊预约
      {
        id: 'apt004',
        doctorName: '刘医生',
        doctorTitle: '主任医师',
        department: '眼科',
        date: '2023-11-18',
        time: '10:00',
        type: '初诊',
        bookingNumber: 'BN20231118004',
        status: 'pending'
      },
      {
        id: 'apt005',
        doctorName: '赵医生',
        doctorTitle: '副主任医师',
        department: '口腔科',
        date: '2023-11-20',
        time: '15:30',
        type: '复诊',
        bookingNumber: 'BN20231120005',
        status: 'pending'
      },
      // 新增已完成预约
      {
        id: 'apt006',
        doctorName: '周医生',
        doctorTitle: '主治医师',
        department: '皮肤科',
        date: '2023-11-01',
        time: '11:00',
        type: '门诊',
        bookingNumber: 'BN20231101006',
        status: 'completed'
      },
      {
        id: 'apt007',
        doctorName: '孙医生',
        doctorTitle: '主任医师',
        department: '心内科',
        date: '2023-10-28',
        time: '08:30',
        type: '复诊',
        bookingNumber: 'BN20231028007',
        status: 'completed'
      },
      // 新增已取消预约
      {
        id: 'apt008',
        doctorName: '郑医生',
        doctorTitle: '副主任医师',
        department: '骨科',
        date: '2023-11-03',
        time: '14:00',
        type: '初诊',
        bookingNumber: 'BN20231103008',
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