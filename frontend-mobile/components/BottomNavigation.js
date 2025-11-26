import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/BottomNavigation.module.css';

const BottomNavigation = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');

  // 导航项配置
  const navItems = [
    {
      id: 'home',
      label: '首页',
      icon: '🏠',
      path: '/',
    },
    {
      id: 'appointment',
      label: '预约',
      icon: '📅',
      path: '/appointments',
    },
    {
      id: 'reports',
      label: '报告',
      icon: '📋',
      path: '/reports',
    },
    {
      id: 'consultations',
      label: '咨询',
      icon: '💬',
      path: '/consultations',
    },
    {
      id: 'me',
      label: '我的',
      icon: '👤',
      path: '/profile',
    },
  ];

  // 处理导航项点击
  const handleNavClick = (id, path) => {
    setActiveTab(id);
    // 路由跳转由Next.js的Link组件处理
  };

  return (
    <nav className={styles.bottomNavigation}>
      {navItems.map((item) => {
        const isActive = router.pathname === item.path || 
                       (item.id === 'patient' && router.pathname.includes('patient-')) ||
                       (item.id === 'reports' && router.pathname.includes('reports')) ||
                       (item.id === 'consultations' && router.pathname.includes('consultation'));
        
        return (
          <Link
            key={item.id}
            href={item.path}
            className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
            onClick={() => handleNavClick(item.id, item.path)}
          >
            <div className={`${styles.navIcon} ${isActive ? styles.activeNavIcon : ''}`}>
              {item.icon}
            </div>
            <span className={`${styles.navLabel} ${isActive ? styles.activeNavLabel : ''}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;