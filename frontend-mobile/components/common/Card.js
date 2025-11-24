import React from 'react';
import { View } from 'antd-mobile';
import styles from './Card.module.css';

/**
 * 通用卡片组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 卡片内容
 * @param {string} props.className - 自定义类名
 * @param {boolean} props.shadow - 是否显示阴影
 * @param {boolean} props.border - 是否显示边框
 * @param {boolean} props.active - 是否可点击
 * @param {Function} props.onClick - 点击事件处理函数
 * @param {string} props.style - 自定义样式
 */
const Card = ({
  children,
  className = '',
  shadow = true,
  border = false,
  active = false,
  onClick,
  style
}) => {
  const cardClasses = [
    styles.card,
    className,
    shadow && styles.shadow,
    border && styles.border,
    active && styles.active
  ].filter(Boolean).join(' ');

  return (
    <View 
      className={cardClasses} 
      onClick={onClick}
      style={style}
    >
      {children}
    </View>
  );
};

export default Card;