import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import { logoutAction } from '../store/userSlice';
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
  const dispatch = useDispatch();
  const router = useRouter();
  const { userInfo } = useSelector(state => state.user);
  // 如果Redux中有用户信息，使用它；否则使用mock数据
  const [userData] = useState(userInfo || mockUserData);
  const [notificationCount, setNotificationCount] = useState(3);
  const [appointments, setAppointments] = useState(5);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [healthReminders, setHealthReminders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  
  useEffect(() => {
    // 模拟数据 - 系统通知
    setSystemNotifications([
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
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (notificationCount > 0) {
      setNotificationCount(0);
    }
  };
  
  const handleReminderClick = () => {
    setShowReminders(!showReminders);
  };

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
      id: 'notifications',
      title: '系统通知',
      icon: '📢',
      badge: systemNotifications.length,
      onClick: handleNotificationClick
    },
    {
      id: 'reminders',
      title: '健康提醒',
      icon: '🔔',
      onClick: handleReminderClick
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

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
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
          {notificationCount > 0 && <span className={styles.notificationBadge}>{notificationCount}</span>}
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
          item.link ? (
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
          ) : (
            <div key={item.id} className={styles.menuItem} onClick={item.onClick}>
              <div className={styles.menuLeft}>
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuTitle}>{item.title}</span>
                {item.badge && (
                  <span className={styles.menuBadge}>{item.badge}</span>
                )}
              </div>
              <span className={styles.menuArrow}>{showNotifications && item.id === 'notifications' || showReminders && item.id === 'reminders' ? '▼' : '›'}</span>
            </div>
          )
        ))}
      </div>
      
      {/* 系统通知详情 */}
      {showNotifications && (
        <div className={styles.notificationList}>
          {systemNotifications.map((notification) => (
            <div key={notification.id} className={styles.notificationItem}>
              <div className={styles.notificationContent}>
                <h4 className={styles.notificationTitle}>{notification.title}</h4>
                <p className={styles.notificationMessage}>{notification.message}</p>
                <p className={styles.notificationTime}>{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 健康提醒详情 */}
      {showReminders && (
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
      )}

      {/* 退出登录按钮 */}
      <button 
        className={styles.logoutButton}
        onClick={() => {
          // 调用退出登录action
          dispatch(logoutAction());
          // 跳转到登录页面
          router.push('/login');
        }}
      >
        退出登录
      </button>

      {/* 版本信息 */}
      <p className={styles.version}>版本 1.0.0</p>
    </div>
  );
};

export default Profile;