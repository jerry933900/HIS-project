import React from 'react';
import Link from 'next/link';
import styles from './TopNav.module.css';

const TopNav = ({ 
  title = '页面标题', 
  showBackButton = true, 
  backLink = '/', 
  rightIcon = null,
  rightAction = null,
  gradientColors = ['#4caf50', '#2e7d32'] // 改为绿色渐变
}) => {
  return (
    <div 
      className={styles.topNav}
      style={{
        background: `linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`
      }}
    >
      <div className={styles.topNavContent}>
        {/* 返回按钮 */}
        {showBackButton && (
          <Link href={backLink} className={styles.backButton}>
            <span className={styles.backIcon}>←</span>
          </Link>
        )}
        
        {/* 页面标题 */}
        <h1 className={styles.title}>{title}</h1>
        
        {/* 右侧图标 */}
        <div className={styles.rightSection}>
          {rightIcon && (
            <button 
              className={styles.rightButton}
              onClick={rightAction}
            >
              {rightIcon}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNav;