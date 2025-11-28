import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { login } from '../store/userSlice';
import styles from '../styles/Login.module.css';
import logger from '../utils/logger';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading } = useSelector(state => state.user);

  // Mock用户数据
  const mockUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'testuser', password: 'test123' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // 记录登录尝试
    logger.info('用户登录尝试', { username });

    // 检查是否是有效的mock用户
    const validUser = mockUsers.find(user => user.username === username && user.password === password);
    if (!validUser) {
      logger.warn('登录失败：用户名或密码错误', { username });
      setError('用户名或密码错误，请使用mock账号: admin/admin123 或 testuser/test123');
      return;
    }

    try {
      logger.info('登录验证成功，准备分发登录action', { username });
      await dispatch(login(username, password));
      logger.info('用户登录成功，正在跳转', { username, destination: '/' });
      router.push('/');
    } catch (err) {
      logger.error('登录过程出错', { username, error: err.message });
      setError(err.message || '登录失败，请重试');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        {/* 登录表单头部 */}
        <div className={styles.header}>
          {/* Logo区域 */}
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="url(#gradient1)"/>
                <path d="M35 40V65H45V50H55V65H65V40H35Z" fill="white"/>
                <defs>
                  <linearGradient id="gradient1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#667eea"/>
                    <stop offset="1" stopColor="#764ba2"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className={styles.title}>HIS系统</h1>
          </div>
          <p className={styles.subtitle}>请使用以下账号登录：</p>
        </div>

        {/* Mock账号信息 */}
        <div className={styles.mockInfo}>
          <div className={styles.mockAccount}>账号1: admin / 密码: admin123</div>
          <div className={styles.mockAccount}>账号2: testuser / 密码: test123</div>
        </div>
        
        {/* 登录表单 */}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>用户名</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                placeholder="请输入用户名"
                required
              />
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>密码</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#999" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="请输入密码"
                required
              />
            </div>
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.buttonContent}>
                <svg className={styles.spinner} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="40" strokeDashoffset="40">
                    <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1s" repeatCount="indefinite"/>
                  </circle>
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                </svg>
                登录中...
              </div>
            ) : (
              '登录'
            )}
          </button>
        </form>

        {/* 页脚信息 */}
        <div className={styles.footer}>
          <p className={styles.footerText}>健康信息系统 &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}