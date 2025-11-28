import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/ConsultationChat.module.css';

const ConsultationChatPage = () => {
  const router = useRouter();
  const { id } = router.query || {};
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
      
      // 根据不同的医生ID提供不同的聊天记录内容
      const mockMessages = id === '1' ? [
        {
          id: '1',
          sender: 'doctor',
          text: '您好，我是张医生，请问有什么可以帮助您的？',
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
      ] : id === '2' ? [
        {
          id: '1',
          sender: 'doctor',
          text: '您好，我是李医生，请问有什么可以帮助您的？',
          time: '昨天 15:20'
        },
        {
          id: '2',
          sender: 'user',
          text: '李医生，我肩膀疼得厉害，特别是晚上睡觉的时候。',
          time: '昨天 15:21'
        },
        {
          id: '3',
          sender: 'doctor',
          text: '您的症状持续多久了？有没有受过伤或者长时间保持一个姿势？',
          time: '昨天 15:25'
        },
        {
          id: '4',
          sender: 'user',
          text: '大概一个月了，我是程序员，经常要久坐。',
          time: '昨天 15:26'
        },
        {
          id: '5',
          sender: 'doctor',
          text: '建议您下周再来复查一下，可能需要做个理疗。',
          time: '昨天 15:30'
        }
      ] : id === '3' ? [
        {
          id: '1',
          sender: 'doctor',
          text: '您好，我是王医生，请问小朋友有什么不舒服吗？',
          time: '3天前 09:15'
        },
        {
          id: '2',
          sender: 'user',
          text: '医生您好，我家孩子发烧了，38.5度，有点咳嗽。',
          time: '3天前 09:16'
        },
        {
          id: '3',
          sender: 'doctor',
          text: '孩子多大了？有没有其他症状，比如流鼻涕或者喉咙痛？',
          time: '3天前 09:18'
        },
        {
          id: '4',
          sender: 'user',
          text: '孩子5岁，有点流鼻涕，精神状态还可以。',
          time: '3天前 09:20'
        },
        {
          id: '5',
          sender: 'doctor',
          text: '孩子的情况已经稳定，注意休息，多喝温水。',
          time: '3天前 09:30'
        }
      ] : [
        {
          id: '1',
          sender: 'doctor',
          text: '您好，我是赵医生，请问有什么可以帮助您的？',
          time: '上周 14:40'
        },
        {
          id: '2',
          sender: 'user',
          text: '赵医生，我最近总是感觉疲劳，想做个检查。',
          time: '上周 14:41'
        },
        {
          id: '3',
          sender: 'doctor',
          text: '您可以先做个血常规和B超检查，我帮您安排。',
          time: '上周 14:45'
        },
        {
          id: '4',
          sender: 'user',
          text: '好的，谢谢医生。',
          time: '上周 14:46'
        },
        {
          id: '5',
          sender: 'doctor',
          text: '请按医嘱按时服药，如有不适及时联系。',
          time: '上周 14:50'
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
    if (id) {
      fetchMessages();
    }
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
          <Link href="/consultations" className={styles.backButton}>←</Link>
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
          <Link href="/consultations" className={styles.backButton}>←</Link>
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
        <Link href="/consultations" className={styles.backButton}>←</Link>
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
          <span className={styles.timeText}>
            {id === '1' ? '今天' : id === '2' ? '昨天' : id === '3' ? '3天前' : '上周'}
          </span>
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