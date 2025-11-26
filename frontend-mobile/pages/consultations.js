import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Consultations.module.css';

const ConsultationsPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 模拟获取咨询列表数据
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 模拟咨询数据
      const mockConsultations = [
        {
          id: '1',
          doctorName: '张医生',
          department: '内科',
          lastMessage: '您的检查结果已出，请查看报告。',
          lastMessageTime: '10分钟前',
          unreadCount: 2,
          avatar: '张'
        },
        {
          id: '2',
          doctorName: '李医生',
          department: '外科',
          lastMessage: '建议您下周再来复查一下。',
          lastMessageTime: '昨天',
          unreadCount: 0,
          avatar: '李'
        },
        {
          id: '3',
          doctorName: '王医生',
          department: '儿科',
          lastMessage: '孩子的情况已经稳定，注意休息。',
          lastMessageTime: '3天前',
          unreadCount: 0,
          avatar: '王'
        },
        {
          id: '4',
          doctorName: '赵医生',
          department: '妇产科',
          lastMessage: '请按医嘱按时服药，如有不适及时联系。',
          lastMessageTime: '上周',
          unreadCount: 1,
          avatar: '赵'
        }
      ];
      
      setConsultations(mockConsultations);
    } catch (err) {
      setError('获取咨询列表失败，请稍后重试');
      console.error('Error fetching consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  // 过滤搜索结果
  const filteredConsultations = consultations.filter(consult => 
    consult.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consult.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consult.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 渲染加载状态
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backButton}>← 返回</Link>
          <h1 className={styles.title}>在线咨询</h1>
          <button className={styles.newConsultButton}>新建</button>
        </div>
        <div className={styles.loadingContainer}>
          <div>加载中...</div>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backButton}>← 返回</Link>
          <h1 className={styles.title}>在线咨询</h1>
          <button className={styles.newConsultButton}>新建</button>
        </div>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={fetchConsultations}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>← 返回</Link>
        <h1 className={styles.title}>在线咨询</h1>
        <button className={styles.newConsultButton}>新建</button>
      </div>
      
      <div className={styles.content}>
        {/* 搜索栏 */}
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="搜索医生、科室或消息内容"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* 咨询列表 */}
        {filteredConsultations.length > 0 ? (
          <div className={styles.consultationsList}>
            {filteredConsultations.map(consult => (
              <Link 
                href={`/consultation-chat/${consult.id}`} 
                className={styles.consultItem}
                key={consult.id}
              >
                <div className={styles.doctorAvatar}>
                  {consult.avatar}
                </div>
                <div className={styles.consultInfo}>
                  <div className={styles.consultHeader}>
                    <h3 className={styles.doctorName}>
                      {consult.doctorName}
                      {consult.unreadCount > 0 && (
                        <span className={styles.unreadBadge}>
                          {consult.unreadCount}
                        </span>
                      )}
                    </h3>
                    <span className={styles.consultTime}>{consult.lastMessageTime}</span>
                  </div>
                  <p className={styles.consultLastMessage}>{consult.lastMessage}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyContainer}>
            <p>暂无咨询记录</p>
            <button className={styles.emptyConsultButton}>发起新咨询</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationsPage;