import React from 'react';
import Link from 'next/link';
import styles from './BackButton.module.css';

/**
 * 通用返回按钮组件
 * @param {Object} props - 组件属性
 * @param {string} [props.href='/'] - 返回的目标路径，默认为首页
 * @param {string} [props.text='返回'] - 按钮显示的文本
 * @param {string} [props.className=''] - 额外的CSS类名
 * @returns {JSX.Element} 返回按钮组件
 */
const BackButton = ({ href = '/', text = '返回', className = '' }) => {
  return (
    <Link href={href} legacyBehavior>
      <a className={`${styles.backButton} ${className}`}>
        <span className={styles.backIcon}>←</span>
        <span className={styles.backText}>{text}</span>
      </a>
    </Link>
  );
};

export default BackButton;