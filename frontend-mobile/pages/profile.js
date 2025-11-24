import React, { useState } from 'react';
import Link from 'next/link';
import BackButton from '../components/common/BackButton';
import styles from '../styles/Profile.module.css';

// 模拟用户数据
const mockUserData = {
  name: '王医生',
  avatar: '👨‍⚕️',
  department: '内科',
  position: '主任医师',
  phone: '138****5678',
  email: 'wang@hospital.com',
  badge: '优秀医师'
};

const Profile = () => {
  const [userData] = useState(mockUserData);
  const [notifications, setNotifications] = useState(3);
  const [appointments, setAppointments] = useState(5);

  // 菜单项数据
  const menuItems = [
    {
      id: 'appointments',
      title: '我的预约',
      icon: '📅',
      badge: appointments,
      link: '/appointment-records'
    },
    {
      id: 'patients',
      title: '我的患者',
      icon: '👥',
      link: '/patients'
    },
    {
      id: 'settings',
      title: '设置',
      icon: '⚙️',
      link: '/profile'
    },
    {
      id: 'help',
      title: '帮助与反馈',
      icon: '❓',
      link: '/profile'
    },
    {
      id: 'about',
      title: '关于系统',
      icon: 'ℹ️',
      link: '/profile'
    }
  ];

  // 统计数据
  const stats = [
    { label: '今日接诊', value: '8' },
    { label: '本周接诊', value: '42' },
    { label: '本月接诊', value: '156' },
    { label: '总接诊量', value: '2835' }
  ];

  const handleNotificationClick = () => {
    // 实际项目中这里会跳转到通知页面并重置通知数
    alert('查看通知');
    setNotifications(0);
  };

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <BackButton />
        <h1 className={styles.headerTitle}>个人中心</h1>
      </div>

      {/* 用户信息卡片 */}
      <div className={styles.userCard}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{userData.avatar}</div>
          <div className={styles.userDetails}>
            <div className={styles.userHeader}>
              <h1 className={styles.userName}>{userData.name}</h1>
              <span className={styles.badge}>{userData.badge}</span>
            </div>
            <p className={styles.userTitle}>{userData.department} - {userData.position}</p>
            <div className={styles.userContact}>
              <span className={styles.contactItem}>{userData.phone}</span>
              <span className={styles.contactItem}>{userData.email}</span>
            </div>
          </div>
        </div>
        <button 
          className={styles.notificationButton}
          onClick={handleNotificationClick}
        >
          🔔
          {notifications > 0 && <span className={styles.notificationBadge}>{notifications}</span>}
        </button>
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsContainer}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statItem}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 菜单列表 */}
      <div className={styles.menuContainer}>
        {menuItems.map((item) => (
          <Link key={item.id} href={item.link} legacyBehavior>
            <a className={styles.menuItem}>
              <div className={styles.menuLeft}>
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuTitle}>{item.title}</span>
                {item.badge && (
                  <span className={styles.menuBadge}>{item.badge}</span>
                )}
              </div>
              <span className={styles.menuArrow}>›</span>
            </a>
          </Link>
        ))}
      </div>

      {/* 退出登录按钮 */}
      <button className={styles.logoutButton}>
        退出登录
      </button>

      {/* 版本信息 */}
      <p className={styles.version}>版本 1.0.0</p>
    </div>
  );
};

export default Profile;