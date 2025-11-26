import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from '../styles/ConsultationChat.module.css';

const ConsultationChatPage = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const chatEndRef = useRef(null);

  // 模拟获取聊天记录
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟医生信息
      const mockDoctorInfo = {
        id: id,
        name: id === '1' ? '张医生' : id === '2' ? '李医生' : id === '3' ? '王医生' : '赵医生',
        department: id === '1' ? '内科' : id === '2' ? '外科' : id === '3' ? '儿科' : '妇产科',
        status: 'online',
        avatar: id === '1' ? '张' : id === '2' ? '李' : id === '3' ? '王' : '赵'
      };
      
      // 模拟聊天记录
      const mockMessages = [
        {
          id: '1',
          sender: 'doctor',
          text: '您好，我是' + mockDoctorInfo.name + '，请问有什么可以帮助您的？',
          time: '10:30'
        },
        {
          id: '2',
          sender: 'user',
          text: '医生您好，我最近感觉有点头晕，想咨询一下。',
          time: '10:31'
        },
        {
          id: '3',
          sender: 'doctor',
          text: '请问您的头晕症状持续多久了？是否伴随其他不适？',
          time: '10:32'
        },
        {
          id: '4',
          sender: 'user',
          text: '大概有3天了，有时会有轻微的恶心感。',
          time: '10:33'
        },
        {
          id: '5',
          sender: 'doctor',
          text: '您的检查结果已出，请查看报告。建议您近期注意休息，避免长时间看屏幕。',
          time: '10:35'
        }
      ];
      
      setDoctorInfo(mockDoctorInfo);
      setMessages(mockMessages);
    } catch (err) {
      setError('获取聊天记录失败，请稍后重试');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [id]);

  // 自动滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const currentTime = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const messageToSend = {
      id: Date.now().toString(),
      sender: 'user',
      text: newMessage.trim(),
      time: currentTime
    };
    
    setMessages([...messages, messageToSend]);
    setNewMessage('');
    
    // 模拟医生回复
    setTimeout(() => {
      const doctorReply = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        text: '收到您的消息，我会尽快为您解答。请稍等片刻。',
        time: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setMessages(prev => [...prev, doctorReply]);
    }, 1500);
  };

  // 处理回车键发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/consultations" className={styles.backButton}>←</Link>
          <div className={styles.doctorInfo}>
            <h2 className={styles.doctorName}>加载中...</h2>
          </div>
          <div className={styles.moreButton}>···</div>
        </div>
        <div className={styles.loadingContainer}>
          <div>加载聊天记录中...</div>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (error || !doctorInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/consultations" className={styles.backButton}>←</Link>
          <div className={styles.doctorInfo}>
            <h2 className={styles.doctorName}>咨询详情</h2>
          </div>
          <div className={styles.moreButton}>···</div>
        </div>
        <div className={styles.errorContainer}>
          <p>{error || '获取医生信息失败'}</p>
          <button onClick={fetchMessages}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/consultations" className={styles.backButton}>←</Link>
        <div className={styles.doctorInfo}>
          <h2 className={styles.doctorName}>{doctorInfo.name}</h2>
          <span className={styles.doctorStatus}>
            {doctorInfo.status === 'online' ? '在线' : '离线'}
          </span>
        </div>
        <div className={styles.moreButton}>···</div>
      </div>
      
      <div className={styles.chatContent}>
        {/* 时间分割线 */}
        <div className={styles.timeDivider}>
          <span className={styles.timeText}>今天</span>
        </div>
        
        {/* 消息列表 */}
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`${styles.messageItem} ${message.sender === 'doctor' ? styles.otherMessage : styles.myMessage}`}
          >
            <div className={`${styles.userAvatar} ${message.sender === 'doctor' ? styles.otherAvatar : styles.myAvatar}`}>
              {message.sender === 'doctor' ? doctorInfo.avatar : '患'}
            </div>
            <div className={styles.messageContent}>
              <p className={styles.messageText}>{message.text}</p>
              <div className={styles.messageTime}>{message.time}</div>
            </div>
          </div>
        ))}
        
        {/* 用于自动滚动到底部的元素 */}
        <div ref={chatEndRef} />
      </div>
      
      {/* 底部输入区域 */}
      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.messageInput}
            placeholder="请输入消息..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <div className={styles.attachButton}>📎</div>
        </div>
        <button 
          className={styles.sendButton} 
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          发送
        </button>
      </div>
    </div>
  );
};

export default ConsultationChatPage;