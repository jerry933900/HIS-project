import React from 'react';
import { Link } from 'next/link';
import styles from './QuickAction.module.css';

/**
 * 快捷功能组件 - 用于展示快捷操作入口
 * 完全支持SSR，无需客户端特定逻辑
 * 
 * @param {Object} props - 组件属性
 * @param {Array} props.actions - 快捷功能数据数组
 * @returns {JSX.Element}
 */
const QuickAction = ({ actions = [] }) => {
  // 服务端安全检查
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className={styles.quickActionContainer}>
      {actions.map((action) => (
        <Link 
          key={action.id} 
          href={action.link} 
          className={styles.actionItem}
          prefetch={true} // 启用Next.js预加载，优化用户体验
        >
          <div className={styles.actionIcon}>
            {/* 在实际项目中，这里可以使用图标组件库 */}
            <div className={[styles.iconPlaceholder, styles[`icon${action.id}`]].join(' ')}>
              {action.icon}
            </div>
          </div>
          <div className={styles.actionLabel}>{action.name}</div>
        </Link>
      ))}
    </div>
  );
};

export default QuickAction;