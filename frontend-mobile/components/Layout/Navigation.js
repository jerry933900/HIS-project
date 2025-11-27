import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './Navigation.module.css';

// 模拟图标组件，实际项目中可使用真实的图标库
const Icon = ({ name, className }) => {
  // 简单的图标模拟，实际项目中应替换为真实的图标组件
  const iconMap = {
    home: '🏠',
    appointment: '📅',
    profile: '👤',
    reports: '📋',
    consultations: '💬',
  };
  
  return <span className={className}>{iconMap[name] || '•'}</span>;
};

const Navigation = () => {
  const router = useRouter();
  const pathname = router.pathname;

  // 检查是否需要显示导航栏
  const shouldShowNavigation = () => {
    // 登录页不显示导航栏
    if (pathname === '/login') return false;
    // 预约详情页不显示导航栏
    if (pathname.startsWith('/appointment/')) return false;
    return true;
  };

  if (!shouldShowNavigation()) {
    return null;
  }

  // 导航项配置
  const navItems = [
    {
      id: 'home',
      label: '首页',
      icon: 'home',
      path: '/',
    },
    {
      id: 'appointments',
      label: '预约',
      icon: 'appointment',
      path: '/appointments',
    },
    {
      id: 'reports',
      label: '报告',
      icon: 'reports',
      path: '/reports',
    },
    {
      id: 'consultations',
      label: '咨询',
      icon: 'consultations',
      path: '/consultations',
    },
    {
      id: 'profile',
      label: '我的',
      icon: 'profile',
      path: '/profile',
    },
  ];

  return (
    <div className={styles.tabBar}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.id}
            href={item.path}
            className={`${styles.tabItem} ${isActive ? styles.activeTab : ''}`}
            passHref
          >
            <Icon
              name={item.icon}
              className={`${styles.tabIcon} ${isActive ? styles.activeIcon : ''}`}
            />
            <span
              className={`${styles.tabLabel} ${isActive ? styles.activeLabel : ''}`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default Navigation;