import axios from 'axios';
import { Toast } from 'antd-mobile';
import { store } from '../store';

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // API基础URL，会通过Next.js的rewrite配置转发到实际后端
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从Redux store中获取token
    const token = store.getState().user.token;
    if (token) {
      // 设置Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // 根据后端返回的数据格式，这里假设成功时code为0
    if (res.code !== undefined && res.code !== 0) {
      // 业务逻辑错误
      Toast.show({ 
        content: res.message || '操作失败', 
        type: 'fail' 
      });
      return Promise.reject(new Error(res.message || '操作失败'));
    }
    
    return res;
  },
  (error) => {
    console.error('响应错误:', error);
    
    // 处理网络错误、超时等
    if (!error.response) {
      Toast.show({ 
        content: '网络错误，请检查您的网络连接', 
        type: 'fail' 
      });
      return Promise.reject(new Error('网络错误'));
    }
    
    // 处理HTTP状态码
    const status = error.response.status;
    switch (status) {
      case 401:
        // 未授权，清除token并跳转到登录页面
        Toast.show({ 
          content: '登录已过期，请重新登录', 
          type: 'fail' 
        });
        // 实际项目中可能需要清除本地存储的token并跳转到登录页
        // window.location.href = '/login';
        break;
      case 403:
        Toast.show({ 
          content: '您没有权限执行此操作', 
          type: 'fail' 
        });
        break;
      case 404:
        Toast.show({ 
          content: '请求的资源不存在', 
          type: 'fail' 
        });
        break;
      case 500:
        Toast.show({ 
          content: '服务器错误，请稍后重试', 
          type: 'fail' 
        });
        break;
      default:
        Toast.show({ 
          content: error.response.data?.message || '请求失败', 
          type: 'fail' 
        });
    }
    
    return Promise.reject(error.response.data || error);
  }
);

export default service;

// 导出常用的请求方法
export const get = (url, params = {}) => {
  return service.get(url, { params });
};

export const post = (url, data = {}) => {
  return service.post(url, data);
};

export const put = (url, data = {}) => {
  return service.put(url, data);
};

export const del = (url) => {
  return service.delete(url);
};